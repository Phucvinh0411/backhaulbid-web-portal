"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { getAuctionAccess, retryRegistrationPayment } from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { KeyValueList, ListSkeleton, Panel } from "@/components/ui";
import { formatCountdown, formatDateTime, formatMoney, secondsUntil, toAmount } from "@/lib/format";
import AuctionRegistrationDialog from "./AuctionRegistrationDialog";

// Access only changes on the server at fixed moments (payment, room opening), so a
// slow refresh while waiting is enough; terminal states stop refreshing.
const WAITING_REFRESH_MS = 30000;
const TERMINAL = new Set(["AUCTION_COMPLETED", "AUCTION_CANCELLED", "REGISTRATION_CLOSED", "REGISTRATION_CANCELLED", "AUCTION_OPEN"]);

export default function CarrierRegistrationGate({ auctionId, auction, onAccessChange }) {
  const { notify } = useGlobalNotification();
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  const loadAccess = useCallback(async () => {
    try {
      const next = await getAuctionAccess(auctionId);
      setAccess(next);
      onAccessChange?.(next);
      setError("");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Không thể kiểm tra quyền tham gia phiên. Vui lòng thử lại.");
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId, notify, onAccessChange]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const status = access?.accessStatus;
  useEffect(() => {
    if (!status || TERMINAL.has(status)) return undefined;
    const interval = window.setInterval(loadAccess, WAITING_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [loadAccess, status]);

  useEffect(() => {
    if (status !== "WAITING_FOR_START") return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  // When the local countdown reaches the start time, ask the server instead of assuming the room opened.
  const startsIn = secondsUntil(access?.startTime || auction?.startTime, now);
  useEffect(() => {
    if (status === "WAITING_FOR_START" && startsIn === 0) void loadAccess();
  }, [loadAccess, startsIn, status]);

  useEffect(() => {
    let active = true;
    getMyVehicles()
      .then((response) => active && setVehicles(Array.isArray(response) ? response : []))
      .catch((requestError) => {
        if (!active) return;
        const message = getApiErrorMessage(requestError, "Không thể tải phương tiện đã xác minh. Vui lòng thử lại.");
        setVehiclesError(message);
        notify.error(message);
      })
      .finally(() => active && setVehiclesLoading(false));
    return () => {
      active = false;
    };
  }, [notify]);

  const payment = useMemo(() => {
    const fee = toAmount(auction?.participationFeeAmount) || 0;
    const deposit = auction?.isDepositRequired ? toAmount(auction?.depositAmount) || 0 : 0;
    return { fee, deposit, total: fee + deposit };
  }, [auction]);

  const handleRetryPayment = async () => {
    if (!access?.registrationId || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await retryRegistrationPayment(auctionId, access.registrationId, { idempotencyKey: globalThis.crypto.randomUUID() });
      notify.success("Đã thanh toán đăng ký. Đang cập nhật quyền vào phòng.");
      await loadAccess();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Không thể hoàn tất thanh toán. Vui lòng kiểm tra số dư ví rồi thử lại.");
      setError(message);
      notify.error(message);
      await loadAccess();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ListSkeleton rows={1} height={120} label="Đang kiểm tra đăng ký" />;
  if (access?.canEnter) return null;

  const reputation = access?.reputationScore !== undefined && access?.reputationScore !== null
    ? `${access.reputationScore}/100 (tối thiểu ${access.minimumReputationScore ?? 70})`
    : null;

  return (
    <>
      <Panel title="Điều kiện tham gia">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {status === "REGISTRATION_REQUIRED" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" sx={{ maxWidth: "70ch" }}>
              Đăng ký với một phương tiện đã xác minh và thanh toán trước {formatDateTime(auction?.registrationEndTime)}. Bạn chỉ vào được phòng khi đến giờ bắt đầu.
            </Typography>
            <KeyValueList
              columns={3}
              items={[
                { label: "Phí tham gia", value: formatMoney(payment.fee), numeric: true },
                { label: "Tiền cọc (được khóa)", value: auction?.isDepositRequired ? formatMoney(payment.deposit) : "Không yêu cầu", numeric: true },
                { label: "Tổng cần thanh toán hoặc khóa", value: formatMoney(payment.total), numeric: true, strong: true },
                { label: "Điểm uy tín của bạn", value: reputation, hidden: !reputation },
              ]}
            />
            <Box>
              <Button variant="contained" size="large" onClick={() => setDialogOpen(true)}>
                Đăng ký tham gia
              </Button>
            </Box>
          </Box>
        )}

        {status === "PAYMENT_INCOMPLETE" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Alert severity="error">Đăng ký đã tạo nhưng thanh toán chưa hoàn tất. Bạn có thể thử lại trước giờ mở phiên.</Alert>
            <Box>
              <Button variant="contained" onClick={handleRetryPayment} disabled={submitting}>
                {submitting ? "Đang thanh toán..." : `Thử lại thanh toán ${formatMoney(payment.total)}`}
              </Button>
            </Box>
          </Box>
        )}

        {status === "WAITING_FOR_START" && (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>Đã đăng ký thành công</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Phòng mở lúc {formatDateTime(access?.startTime || auction?.startTime)}. Trang tự kiểm tra lại khi đến giờ.
              </Typography>
            </Box>
            <Box role="timer" aria-label="Thời gian đến khi mở phòng" sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: "var(--color-success-soft)", textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Mở phòng sau</Typography>
              <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>{formatCountdown(startsIn)}</Typography>
            </Box>
          </Box>
        )}

        {status === "REPUTATION_TOO_LOW" && (
          <Alert severity="warning">
            Điểm uy tín hiện tại {reputation || "chưa xác định"}. Điểm giảm khi vi phạm chính sách giao hàng trễ.
          </Alert>
        )}
        {status === "REGISTRATION_CLOSED" && <Typography variant="body2">Phiên đã đóng đăng ký. Bạn không thể tham gia phiên này.</Typography>}
        {status === "REGISTRATION_CANCELLED" && <Typography variant="body2">Đăng ký của bạn đã bị hủy.</Typography>}
        {status === "AUCTION_COMPLETED" && <Typography variant="body2">Phiên đã kết thúc. Kết quả của bạn hiển thị bên dưới nếu bạn đã đặt giá.</Typography>}
        {status === "AUCTION_CANCELLED" && <Typography variant="body2">Phiên đã bị hủy.</Typography>}
      </Panel>

      <AuctionRegistrationDialog
        open={dialogOpen}
        auction={auction}
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        vehiclesError={vehiclesError}
        onClose={() => setDialogOpen(false)}
        onCompleted={loadAccess}
      />
    </>
  );
}
