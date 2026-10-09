"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import {
  getAuctionAccess,
  registerForAuction,
  retryRegistrationPayment,
} from "@/services/biddingApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const toAmount = (value) => {
  if (typeof value === "number") return value;
  return Number(String(value || "").replace(/[^0-9.-]/g, "")) || 0;
};

const getParticipationFee = (auction) => {
  return toAmount(auction?.participationFeeAmount ?? auction?.participationFee);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function AuctionRegistrationDialog({
  open,
  auction,
  vehicles = [],
  vehiclesLoading = false,
  vehiclesError = "",
  onClose,
  onCompleted,
}) {
  const { notify } = useGlobalNotification();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [retryRegistrationId, setRetryRegistrationId] = useState(null);

  const paymentSummary = useMemo(() => {
    const fee = getParticipationFee(auction);
    const depositRequired =
      auction?.isDepositRequired ?? toAmount(auction?.depositAmount) > 0;
    const deposit = depositRequired ? toAmount(auction?.depositAmount) : 0;
    return {
      fee,
      deposit,
      depositRequired,
      total: fee + deposit,
    };
  }, [auction]);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  useEffect(() => {
    if (!open) return;
    setSelectedVehicleId("");
    setAcknowledged(false);
    setSubmitting(false);
    setError("");
    setSuccess(false);
    setRetryRegistrationId(null);
  }, [auction?.id, open]);

  const handleConfirm = async () => {
    if (!selectedVehicleId || !acknowledged) return;

    setSubmitting(true);
    setError("");

    try {
      const result = retryRegistrationId
        ? await retryRegistrationPayment(auction.id, retryRegistrationId, {
            idempotencyKey: createIdempotencyKey(),
          })
        : await registerForAuction(auction.id, {
            vehicleId: selectedVehicleId,
            idempotencyKey: createIdempotencyKey(),
          });

      await onCompleted?.(result);
      setSuccess(true);
      notify.success("Đăng ký phiên và thanh toán thành công.");
    } catch (requestError) {
      const nextError = getApiErrorMessage(
        requestError,
        "Không thể hoàn tất đăng ký và thanh toán. Vui lòng kiểm tra số dư rồi thử lại.",
      );
      setError(nextError);
      notify.error(nextError);
      try {
        const access = await getAuctionAccess(auction.id);
        if (
          access?.accessStatus === "PAYMENT_INCOMPLETE" &&
          access.registrationId
        ) {
          setRetryRegistrationId(access.registrationId);
        }
      } catch {
        // Keep the original payment error visible when the access refresh also fails.
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = vehiclesLoading
    ? "Đang tải phương tiện..."
    : submitting
      ? "Đang xử lý thanh toán..."
      : !selectedVehicleId
        ? "Chọn phương tiện để tiếp tục"
        : !acknowledged
          ? "Xác nhận cam kết để tiếp tục"
          : retryRegistrationId
            ? `Thử lại thanh toán ${formatCurrency(paymentSummary.total)}`
            : `Xác nhận & thanh toán ${formatCurrency(paymentSummary.total)}`;

  if (!auction) return null;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="md"
      scroll="paper"
      aria-labelledby="auction-registration-title"
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box className="flex items-start justify-between gap-4 border-b border-line bg-surface px-4 py-3 sm:px-6">
          <Box>
            <Typography id="auction-registration-title" component="h2" sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
              Đăng ký tham gia phiên
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Chọn phương tiện và thanh toán trước hạn đóng đăng ký.
            </Typography>
          </Box>
          <IconButton
            aria-label="Đóng đăng ký"
            onClick={onClose}
            disabled={submitting}
            sx={{ width: 44, height: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {success ? (
          <Box className="px-6 py-12 text-center sm:px-10">
            <Box className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircleOutlineIcon sx={{ fontSize: 38 }} />
            </Box>
            <Typography
              variant="h5"
              className="!mt-5 !font-extrabold !text-ink"
            >
              Đăng ký thành công
            </Typography>
            <Typography className="!mx-auto !mt-2 !max-w-lg !text-ink-muted">
              Phí tham gia đã được xử lý
              {paymentSummary.depositRequired
                ? " và tiền đặt cọc đã được khóa"
                : ""}
              . Bạn chỉ được vào phòng khi đến giờ bắt đầu phiên.
            </Typography>
            <Box className="mx-auto mt-6 max-w-md rounded-xl border border-success-soft bg-success-soft/70 p-4 text-left">
              <Box className="flex items-center justify-between gap-4 text-sm">
                <span className="text-ink-muted">Phương tiện</span>
                <span className="font-bold text-ink">
                  {selectedVehicle?.plate || selectedVehicleId}
                </span>
              </Box>
              <Box className="mt-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-ink-muted">Mở phòng</span>
                <span className="font-bold text-ink">
                  {formatDate(auction.startTime)}
                </span>
              </Box>
            </Box>
            <Button
              onClick={onClose}
              variant="contained"
              className="!mt-7 !rounded-lg !bg-[var(--color-brand)] !px-7 !py-2.5 !font-bold"
            >
              Đã hiểu
            </Button>
          </Box>
        ) : (
          <Box className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
            <Box className="px-6 py-6 sm:px-7">
              <Box className="mb-5 flex items-center gap-2">
                <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-soft text-info">
                  <DirectionsCarOutlinedIcon />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    className="!font-extrabold !text-ink"
                  >
                    Thông tin đăng ký
                  </Typography>
                  <Typography variant="caption" className="!text-ink-muted">
                    Chọn đúng xe sẽ thực hiện chuyến hàng này.
                  </Typography>
                </Box>
              </Box>

              <Box className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Box className="rounded-xl border border-line bg-surface-sunken/70 p-3.5">
                  <Box className="flex items-center gap-2 text-ink-muted">
                    <RouteOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" className="!font-bold">
                      Tuyến vận chuyển
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    className="!mt-2 !font-extrabold !text-ink"
                  >
                    {auction.origin || auction.from?.name || "Điểm lấy hàng"}
                  </Typography>
                  <Typography variant="caption" className="!text-ink-muted">
                    →{" "}
                    {auction.destination ||
                      auction.to?.name ||
                      "Điểm giao hàng"}
                  </Typography>
                </Box>
                <Box className="rounded-xl border border-line bg-surface-sunken/70 p-3.5">
                  <Box className="flex items-center gap-2 text-ink-muted">
                    <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" className="!font-bold">
                      Hạn đăng ký
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    className="!mt-2 !font-extrabold !text-ink"
                  >
                    {formatDate(
                      auction.registrationEndTime || auction.regEndTime,
                    )}
                  </Typography>
                  <Typography variant="caption" className="!text-ink-muted">
                    Mở phòng: {formatDate(auction.startTime)}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="subtitle2"
                className="!mb-2 !font-extrabold !text-ink"
              >
                Phương tiện thực hiện chuyến hàng
              </Typography>
              {vehiclesError && (
                <Alert severity="error" className="!mb-3 !rounded-xl">
                  {vehiclesError}
                </Alert>
              )}
              {!vehiclesLoading && !vehiclesError && vehicles.length === 0 && (
                <Alert severity="warning" className="!rounded-xl">
                  Chưa có phương tiện đã được xác minh để tham gia. Hãy hoàn tất
                  kiểm duyệt xe trong mục Phương tiện trước.
                </Alert>
              )}
              {vehiclesLoading && (
                <Box className="flex items-center gap-2 rounded-xl border border-line bg-surface-sunken p-4 text-sm text-ink-muted">
                  <CircularProgress size={18} /> Đang tải phương tiện đã xác
                  minh...
                </Box>
              )}
              <Box className="space-y-2">
                {!vehiclesLoading &&
                  vehicles.map((vehicle) => {
                    const selected = vehicle.id === selectedVehicleId;
                    return (
                      <ButtonBase
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className="!block !w-full !rounded-xl !text-left"
                        sx={{
                          border: "1px solid",
                          borderColor: selected ? "var(--color-brand)" : "var(--color-line)",
                          backgroundColor: selected
                            ? "rgba(27, 73, 101, 0.05)"
                            : "var(--color-surface)",
                          transition: "all 160ms ease",
                          "&:hover": {
                            borderColor: "var(--color-brand)",
                            backgroundColor: "rgba(27, 73, 101, 0.035)",
                          },
                        }}
                      >
                        <Box className="flex items-center gap-3 px-3.5 py-3">
                          <Box
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-[var(--color-brand)] text-white" : "bg-surface-sunken text-ink-muted"}`}
                          >
                            <DirectionsCarOutlinedIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box className="min-w-0 flex-1">
                            <Typography
                              variant="body2"
                              className="!font-extrabold !text-ink"
                            >
                              {vehicle.plate}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="!text-ink-muted"
                            >
                              {vehicle.capacity} · {vehicle.type}
                            </Typography>
                          </Box>
                          {selected && (
                            <Chip
                              label="Đã chọn"
                              size="small"
                              className="!font-bold !text-[var(--color-brand)]"
                            />
                          )}
                        </Box>
                      </ButtonBase>
                    );
                  })}
              </Box>
              {!vehiclesLoading &&
                vehicles.length > 0 &&
                !selectedVehicleId && (
                  <Typography
                    variant="caption"
                    className="!mt-2 !block !text-warning"
                  >
                    Chọn một phương tiện để tiếp tục.
                  </Typography>
                )}

              <Box
                className={`mt-5 rounded-xl border p-3 ${acknowledged ? "border-[var(--color-brand)]/30 bg-info-soft/60" : "border-line bg-surface-sunken/70"}`}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      id="auction-registration-confirm"
                      checked={acknowledged}
                      onChange={(event) =>
                        setAcknowledged(event.target.checked)
                      }
                      inputProps={{
                        "aria-label":
                          "Xác nhận điều kiện tham gia và thanh toán",
                      }}
                      sx={{
                        p: 0.25,
                        color: "var(--color-ink-subtle)",
                        "&.Mui-checked": { color: "var(--color-brand)" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      className="!leading-5 !text-ink-muted"
                    >
                      Tôi xác nhận phương tiện đáp ứng yêu cầu của phiên và đồng
                      ý để hệ thống trừ phí tham gia, đồng thời khóa tiền đặt
                      cọc nếu phiên có yêu cầu.
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    width: "100%",
                    alignItems: "flex-start",
                    gap: 1,
                    "& .MuiFormControlLabel-label": { flex: 1 },
                  }}
                />
              </Box>
            </Box>

            <Box className="border-t border-line bg-surface-sunken/70 px-6 py-6 lg:border-l lg:border-t-0 sm:px-7">
              <Typography
                variant="overline"
                className="!font-bold !tracking-[0.14em] !text-ink-subtle"
              >
                TÓM TẮT THANH TOÁN
              </Typography>
              <Typography
                variant="h6"
                className="!mt-1 !font-extrabold !text-ink"
              >
                Khoản cần xử lý
              </Typography>

              <Box className="mt-5 rounded-xl border border-line bg-white p-4">
                <Box className="flex items-start justify-between gap-4">
                  <Box className="flex gap-2.5">
                    <PaymentsOutlinedIcon className="!text-info" />
                    <Box>
                      <Typography
                        variant="body2"
                        className="!font-extrabold !text-ink"
                      >
                        Phí tham gia
                      </Typography>
                      <Typography variant="caption" className="!text-ink-muted">
                        Bắt buộc · thu khi đăng ký
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    className="!font-extrabold !text-ink"
                  >
                    {formatCurrency(paymentSummary.fee)}
                  </Typography>
                </Box>
                <Divider className="!my-3" />
                <Box className="flex items-start justify-between gap-4">
                  <Box className="flex gap-2.5">
                    <LockOutlinedIcon
                      className={
                        paymentSummary.depositRequired
                          ? "!text-warning"
                          : "!text-ink-subtle"
                      }
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        className="!font-extrabold !text-ink"
                      >
                        Tiền đặt cọc
                      </Typography>
                      <Typography variant="caption" className="!text-ink-muted">
                        {paymentSummary.depositRequired
                          ? "Khóa tạm thời theo điều kiện phiên"
                          : "Phiên này không yêu cầu"}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    className={`!font-extrabold ${paymentSummary.depositRequired ? "!text-warning" : "!text-ink-subtle"}`}
                  >
                    {paymentSummary.depositRequired
                      ? formatCurrency(paymentSummary.deposit)
                      : "—"}
                  </Typography>
                </Box>
                <Divider className="!my-3" />
                <Box className="flex items-end justify-between gap-4">
                  <Typography
                    variant="body2"
                    className="!font-extrabold !text-ink"
                  >
                    Tổng xử lý
                  </Typography>
                  <Typography
                    variant="h6"
                    className="!font-black !text-[var(--color-brand)]"
                  >
                    {formatCurrency(paymentSummary.total)}
                  </Typography>
                </Box>
              </Box>

              <Box className="mt-4 rounded-xl border border-info-soft bg-info-soft/70 p-3.5">
                <Box className="flex gap-2">
                  <AccountBalanceWalletOutlinedIcon
                    className="!text-info"
                    sx={{ fontSize: 20 }}
                  />
                  <Typography
                    variant="caption"
                    className="!leading-5 !text-info"
                  >
                    Khoản tiền được xử lý từ ví nhà xe. Nếu số dư không đủ, hệ
                    thống sẽ báo lỗi và bạn có thể nạp thêm tiền tại Ví thanh
                    toán.
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  className="!mt-4 !rounded-xl"
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirm}
                disabled={
                  !selectedVehicleId ||
                  !acknowledged ||
                  submitting ||
                  vehiclesLoading ||
                  vehicles.length === 0 ||
                  Boolean(vehiclesError)
                }
                startIcon={
                  submitting ? (
                    <CircularProgress size={17} color="inherit" />
                  ) : (
                    <PaymentsOutlinedIcon />
                  )
                }
                className="!mt-5 !rounded-lg !py-3 !font-extrabold"
                sx={{
                  backgroundColor: "var(--color-brand)",
                  color: "var(--color-surface)",
                  "&:hover": { backgroundColor: "var(--color-brand-hover)" },
                  "&.Mui-disabled": {
                    backgroundColor: "var(--color-line-strong)",
                    color: "var(--color-ink-muted)",
                    opacity: 1,
                  },
                }}
              >
                {submitLabel}
              </Button>
              <Typography
                variant="caption"
                className="!mt-2 !block !text-center !leading-5 !text-ink-subtle"
              >
                Sau khi đăng ký thành công, bạn chờ đến giờ mở phòng mới có thể
                đặt giá.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
