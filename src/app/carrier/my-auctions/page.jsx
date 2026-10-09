"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { PageHeader, DetailDrawer } from "@/components/common";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { EmptyState, ErrorState, ListSkeleton, ResponsiveDialog } from "@/components/ui";
import AuctionSessionCard from "@/components/auctions/AuctionSessionCard";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { cancelRegistration, listBids, listMyRegistrations } from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { unwrapListData } from "@/services/responseData";
import useCurrentAccount from "@/hooks/useCurrentAccount";
import { MY_BID_OUTCOME_META, getAccessStatusMeta, getMyBidOutcome } from "@/lib/statusMeta";
import { formatMoney } from "@/lib/format";

const GROUPS = [
  { value: "ACTION", label: "Cần xử lý", statuses: ["PAYMENT_INCOMPLETE", "AUCTION_OPEN"] },
  { value: "UPCOMING", label: "Sắp diễn ra", statuses: ["WAITING_FOR_START"] },
  { value: "DONE", label: "Đã kết thúc", statuses: ["AUCTION_COMPLETED", "AUCTION_CANCELLED", "REGISTRATION_CANCELLED", "REGISTRATION_CLOSED"] },
  { value: "ALL", label: "Tất cả", statuses: null },
];
const URGENCY = { AUCTION_OPEN: 0, PAYMENT_INCOMPLETE: 1, WAITING_FOR_START: 2 };
const CANCELLABLE = new Set(["WAITING_FOR_START", "PAYMENT_INCOMPLETE"]);

export default function CarrierMyAuctionsPage() {
  const { notify } = useGlobalNotification();
  const account = useCurrentAccount();
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [group, setGroup] = useState("ALL");
  const [detail, setDetail] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [outcomes, setOutcomes] = useState({});
  const requestedOutcomesRef = useRef(new Set());

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const [response, vehicleList] = await Promise.all([listMyRegistrations({ page: 1, pageSize: 100 }), getMyVehicles().catch(() => [])]);
      setRows(unwrapListData(response));
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
      setState("ready");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Không thể tải các phiên đã đăng ký."));
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // For finished auctions, the carrier's own bids decide "won/lost"; bids are fetched only for those.
  useEffect(() => {
    if (!account?.accountId) return;
    rows
      .filter(({ auction }) => auction?.status === "COMPLETED" && !requestedOutcomesRef.current.has(auction.id))
      .forEach(({ auction }) => {
        requestedOutcomesRef.current.add(auction.id);
        listBids(auction.id, { page: 1, pageSize: 100 })
          .then((response) => {
            const mine = (response?.data || []).filter((bid) => auction.auctionType === "SEALED" || bid.carrierId === account.accountId);
            setOutcomes((current) => ({ ...current, [auction.id]: getMyBidOutcome({ auction, myBidIds: mine.map((bid) => bid.id) }) }));
          })
          .catch(() => setOutcomes((current) => ({ ...current, [auction.id]: null })));
      });
  }, [account?.accountId, rows]);

  const counts = useMemo(() => {
    const result = {};
    GROUPS.forEach((item) => {
      result[item.value] = item.statuses ? rows.filter((row) => item.statuses.includes(row.access?.accessStatus)).length : rows.length;
    });
    return result;
  }, [rows]);

  const visible = useMemo(() => {
    const selected = GROUPS.find((item) => item.value === group);
    return rows
      .filter((row) => !selected.statuses || selected.statuses.includes(row.access?.accessStatus))
      .sort((a, b) => (URGENCY[a.access?.accessStatus] ?? 9) - (URGENCY[b.access?.accessStatus] ?? 9) || new Date(b.registration?.registeredAt) - new Date(a.registration?.registeredAt));
  }, [group, rows]);

  const vehicleLabel = (vehicleId) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    return vehicle ? vehicle.licensePlate || vehicle.plate || vehicleId : "Phương tiện đã chọn";
  };

  const confirmCancel = async () => {
    if (!toCancel || cancelling) return;
    setCancelling(true);
    setCancelError("");
    try {
      await cancelRegistration(toCancel.auction.id, toCancel.registration.id);
      notify.success("Đã hủy đăng ký. Tiền cọc (nếu có) được mở khóa.");
      setToCancel(null);
      await load();
    } catch (requestError) {
      setCancelError(getApiErrorMessage(requestError, "Không thể hủy đăng ký. Vui lòng thử lại."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Phiên của tôi"
        subtitle="Các phiên bạn đã đăng ký, sắp xếp theo việc cần làm trước."
        breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Phiên của tôi" }]}
        action={
          <Button component={Link} href="/carrier/auctions" variant="contained">
            Tìm phiên mới
          </Button>
        }
      />

      <Box role="tablist" aria-label="Nhóm phiên" sx={{ display: "flex", gap: 1, mb: 2, overflowX: "auto", pb: 0.5 }}>
        {GROUPS.map((item) => (
          <Chip
            key={item.value}
            role="tab"
            aria-selected={group === item.value}
            label={`${item.label} (${counts[item.value] ?? 0})`}
            onClick={() => setGroup(item.value)}
            color={group === item.value ? "primary" : "default"}
            variant={group === item.value ? "filled" : "outlined"}
            sx={{ minHeight: 40, fontSize: "0.875rem" }}
          />
        ))}
      </Box>

      {state === "loading" && <ListSkeleton rows={3} height={220} label="Đang tải phiên của bạn" />}
      {state === "error" && <ErrorState description={error} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState
          title={rows.length ? "Không có phiên trong nhóm này" : "Bạn chưa đăng ký phiên nào"}
          description={rows.length ? "Chọn nhóm khác để xem." : "Tìm phiên phù hợp với tuyến và phương tiện của bạn để đăng ký."}
          action={!rows.length && <Button component={Link} href="/carrier/auctions" variant="contained">Tìm phiên</Button>}
        />
      )}
      {state === "ready" && visible.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" } }}>
          {visible.map((row) => {
            const { auction, access, registration } = row;
            const accessStatus = access?.accessStatus;
            const outcome = outcomes[auction.id];
            const outcomeMeta = outcome ? MY_BID_OUTCOME_META[outcome] : null;
            const href = `/carrier/auctions/${encodeURIComponent(auction.id)}`;
            const primary =
              accessStatus === "AUCTION_OPEN" ? (
                <Button variant="contained" color="success" component={Link} href={href}>Vào phòng</Button>
              ) : accessStatus === "PAYMENT_INCOMPLETE" ? (
                <Button variant="contained" color="error" component={Link} href={href}>Thanh toán lại</Button>
              ) : outcome === "WON" && auction.awardStatus === "SIGNED" && auction.awardTripId ? (
                <Button variant="contained" component={Link} href={`/carrier/transports/${encodeURIComponent(auction.awardTripId)}`}>Mở chuyến</Button>
              ) : outcome === "WON" && auction.awardStatus === "AWAITING_CARRIER_SIGNATURE" ? (
                <Button variant="contained" component={Link} href="/carrier/contracts">Ký hợp đồng</Button>
              ) : (
                <Button variant="outlined" component={Link} href={href}>Mở phiên</Button>
              );
            return (
              <AuctionSessionCard
                key={registration?.id || auction.id}
                auction={auction}
                status={outcomeMeta || getAccessStatusMeta(accessStatus)}
                note={
                  accessStatus === "AUCTION_COMPLETED" && outcome === undefined
                    ? "Đang xác định kết quả của bạn..."
                    : outcome === "WON"
                      ? auction.awardStatus === "SIGNED"
                        ? "Hợp đồng đã ký đủ. Chuyến đã được tạo."
                        : auction.awardStatus === "AWAITING_CARRIER_SIGNATURE"
                          ? "Bạn thắng phiên. Ký hợp đồng trước hạn để nhận chuyến."
                          : "Bạn có giá thắng. Xem tiến trình trao thầu trong trang phiên."
                      : null
                }
                noteTone={outcome === "WON" ? "success" : "neutral"}
                extraFacts={[
                  { label: "Xe đăng ký", value: vehicleLabel(registration?.vehicleId) },
                  { label: "Đã thanh toán / khóa", value: formatMoney(Number(registration?.participationFeeAmount || 0) + Number(registration?.depositAmount || 0)) },
                ]}
                onOpen={() => setDetail(auction)}
                actions={
                  <>
                    {CANCELLABLE.has(accessStatus) && auction.status === "PENDING" ? (
                      <Button variant="outlined" color="error" onClick={() => setToCancel(row)}>
                        Hủy đăng ký
                      </Button>
                    ) : (
                      <Button variant="outlined" color="inherit" onClick={() => setDetail(auction)}>
                        Chi tiết
                      </Button>
                    )}
                    {primary}
                  </>
                }
              />
            );
          })}
        </Box>
      )}

      <DetailDrawer open={Boolean(detail)} onClose={() => setDetail(null)} variant="modal" title={detail?.title || "Chi tiết phiên"}>
        {detail && <AuctionDetailContent auction={detail} />}
      </DetailDrawer>

      <ResponsiveDialog
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        busy={cancelling}
        maxWidth="xs"
        title="Hủy đăng ký phiên?"
        titleId="cancel-registration-title"
        actions={
          <>
            <Button color="inherit" onClick={() => setToCancel(null)} disabled={cancelling}>
              Giữ đăng ký
            </Button>
            <Button variant="contained" color="error" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Đang hủy..." : "Hủy đăng ký"}
            </Button>
          </>
        }
      >
        {cancelError && <Alert severity="error" sx={{ mb: 1.5 }}>{cancelError}</Alert>}
        <Typography variant="body2">
          Bạn sẽ không thể vào phòng đấu giá này. Tiền cọc đang khóa
          {toCancel?.registration?.depositAmount ? ` (${formatMoney(toCancel.registration.depositAmount)})` : ""} được mở khóa về ví. Phí tham gia đã thanh toán không được hoàn lại.
        </Typography>
      </ResponsiveDialog>
    </Box>
  );
}
