"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { DetailDrawer, PageHeader } from "@/components/common";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import AuctionSessionCard from "@/components/auctions/AuctionSessionCard";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { EmptyState, ErrorState, ListSkeleton, ResponsiveDialog } from "@/components/ui";
import { cancelAuction, listAuctions } from "@/services/biddingApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getPageMeta, unwrapListData } from "@/services/responseData";
import { getAuctionPhaseMeta, getAwardStatusMeta, getShipperNextStep } from "@/lib/statusMeta";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ mở phiên" },
  { value: "OPEN", label: "Đang đấu giá" },
  { value: "COMPLETED", label: "Đã kết thúc" },
  { value: "CANCELLED", label: "Đã hủy" },
];
const CANCEL_REASONS = ["Thay đổi kế hoạch vận chuyển", "Hàng chưa sẵn sàng", "Đã tìm được đơn vị vận chuyển khác", "Khác"];
const text = (value) => String(value || "").toLocaleLowerCase("vi");

/** Loads every page for the shipper's own auctions so search and filters cover the full set. */
async function loadAllShipperAuctions(status) {
  const items = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await listAuctions({ page, pageSize: PAGE_SIZE, ...(status ? { status } : {}) });
    items.push(...unwrapListData(response));
    const meta = getPageMeta(response);
    if (page >= meta.totalPages) return { items, complete: true };
  }
  return { items, complete: false };
}

export default function BiddingSessionsScreen() {
  const { notify } = useGlobalNotification();
  const [tab, setTab] = useState("");
  const [items, setItems] = useState([]);
  const [complete, setComplete] = useState(true);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [auctionType, setAuctionType] = useState("");
  const [onlyActionable, setOnlyActionable] = useState(false);
  const [detail, setDetail] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [reasonNote, setReasonNote] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await loadAllShipperAuctions(tab);
      setItems(result.items);
      setComplete(result.complete);
      setState("ready");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Không thể tải danh sách phiên đấu giá."));
      setState("error");
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionable = useMemo(() => items.filter((auction) => getShipperNextStep(auction)), [items]);

  const visible = useMemo(() => {
    const needle = text(query.trim());
    return items
      .filter((auction) => {
        if (onlyActionable && !getShipperNextStep(auction)) return false;
        if (auctionType && auction.auctionType !== auctionType) return false;
        if (!needle) return true;
        return [auction.id, auction.title, auction.goodsType, auction.origin, auction.destination].map(text).join(" ").includes(needle);
      })
      .sort((a, b) => Number(Boolean(getShipperNextStep(b))) - Number(Boolean(getShipperNextStep(a))) || new Date(b.createdAt) - new Date(a.createdAt));
  }, [auctionType, items, onlyActionable, query]);

  const openCancel = (auction) => {
    setToCancel(auction);
    setReason(CANCEL_REASONS[0]);
    setReasonNote("");
    setCancelError("");
  };

  const confirmCancel = async () => {
    if (!toCancel || cancelling) return;
    if (reason === "Khác" && !reasonNote.trim()) {
      setCancelError("Nhập lý do hủy.");
      return;
    }
    setCancelling(true);
    setCancelError("");
    try {
      const fullReason = reason === "Khác" ? reasonNote.trim() : reasonNote.trim() ? `${reason}: ${reasonNote.trim()}` : reason;
      await cancelAuction(toCancel.id, fullReason.slice(0, 500));
      notify.success("Đã hủy phiên đấu giá.");
      setToCancel(null);
      await load();
    } catch (requestError) {
      setCancelError(getApiErrorMessage(requestError, "Không thể hủy phiên. Phiên có thể vừa kết thúc."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Phiên đấu giá của tôi"
        subtitle="Theo dõi giá nhà xe đưa ra, chọn người thắng với đấu giá kín và ký hợp đồng sau khi trao thầu."
        breadcrumbs={[{ label: "Trang chủ", path: "/shipper/dashboard" }, { label: "Phiên đấu giá" }]}
        action={
          <Button component={Link} href="/shipper/bidding/create" variant="contained" startIcon={<AddIcon />}>
            Tạo phiên mới
          </Button>
        }
      />

      {state === "ready" && actionable.length > 0 && !onlyActionable && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setOnlyActionable(true)}>
              Xem ngay
            </Button>
          }
        >
          {actionable.length} phiên đang chờ bạn chọn người thắng hoặc ký hợp đồng.
        </Alert>
      )}

      <Box role="tablist" aria-label="Trạng thái phiên" sx={{ display: "flex", gap: 1, mb: 1.5, overflowX: "auto", pb: 0.5 }}>
        {TABS.map((item) => (
          <Chip
            key={item.value || "all"}
            role="tab"
            aria-selected={tab === item.value}
            label={item.label}
            onClick={() => setTab(item.value)}
            color={tab === item.value ? "primary" : "default"}
            variant={tab === item.value ? "filled" : "outlined"}
            sx={{ minHeight: 40, fontSize: "0.875rem" }}
          />
        ))}
      </Box>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, mb: 1.5 }}>
        <TextField
          label="Tìm theo mã phiên, hàng hóa, tuyến"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select label="Hình thức" value={auctionType} onChange={(event) => setAuctionType(event.target.value)}>
          <MenuItem value="">Công khai và kín</MenuItem>
          <MenuItem value="PUBLIC">Công khai</MenuItem>
          <MenuItem value="SEALED">Đấu giá kín</MenuItem>
        </TextField>
      </Box>

      {state === "ready" && (
        <Typography component="div" variant="body2" role="status" sx={{ color: "text.secondary", mb: 1.5 }}>
          {visible.length} phiên{query || auctionType || onlyActionable ? " khớp bộ lọc" : ""}
          {!complete ? ` · chỉ tải ${PAGE_SIZE * MAX_PAGES} phiên mới nhất` : ""}
          {onlyActionable && <Chip size="small" label="Chỉ việc cần xử lý" onDelete={() => setOnlyActionable(false)} sx={{ ml: 1 }} />}
        </Typography>
      )}

      {state === "loading" && <ListSkeleton rows={3} height={220} label="Đang tải phiên" />}
      {state === "error" && <ErrorState description={error} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState
          title={items.length ? "Không có phiên khớp bộ lọc" : "Chưa có phiên đấu giá"}
          description={items.length ? "Thử bỏ bớt điều kiện." : "Tạo phiên để nhà xe đưa giá vận chuyển cho lô hàng của bạn."}
          action={!items.length && <Button component={Link} href="/shipper/bidding/create" variant="contained">Tạo phiên</Button>}
        />
      )}

      {state === "ready" && visible.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" } }}>
          {visible.map((auction) => {
            const next = getShipperNextStep(auction);
            const award = getAwardStatusMeta(auction.awardStatus);
            const detailHref = `/shipper/bidding/history?id=${encodeURIComponent(auction.id)}`;
            const cancellable = auction.status === "PENDING" || auction.status === "OPEN";
            return (
              <AuctionSessionCard
                key={auction.id}
                auction={auction}
                status={getAuctionPhaseMeta(auction)}
                note={next?.label || award?.label}
                noteTone={next?.tone || award?.tone}
                onOpen={() => setDetail(auction)}
                actions={
                  <>
                    {cancellable ? (
                      <Button variant="outlined" color="error" onClick={() => openCancel(auction)}>
                        Hủy phiên
                      </Button>
                    ) : (
                      <Button variant="outlined" color="inherit" onClick={() => setDetail(auction)}>
                        Chi tiết
                      </Button>
                    )}
                    {auction.awardStatus === "AWAITING_SHIPPER_SIGNATURE" ? (
                      <Button variant="contained" component={Link} href="/shipper/contracts">Ký hợp đồng</Button>
                    ) : auction.awardStatus === "SIGNED" && auction.awardTripId ? (
                      <Button variant="contained" component={Link} href={`/shipper/tracking?id=${encodeURIComponent(auction.awardTripId)}`}>Theo dõi chuyến</Button>
                    ) : (
                      <Button variant={next ? "contained" : "outlined"} component={Link} href={detailHref}>
                        {next ? next.label : "Xem giá"}
                      </Button>
                    )}
                  </>
                }
              />
            );
          })}
        </Box>
      )}

      <DetailDrawer open={Boolean(detail)} onClose={() => setDetail(null)} variant="modal" title={detail?.title || "Chi tiết phiên"}>
        {detail && (
          <AuctionDetailContent
            auction={detail}
            footer={
              <Button variant="contained" fullWidth component={Link} href={`/shipper/bidding/history?id=${encodeURIComponent(detail.id)}`}>
                Mở trang theo dõi giá
              </Button>
            }
          />
        )}
      </DetailDrawer>

      <ResponsiveDialog
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        busy={cancelling}
        maxWidth="xs"
        title="Hủy phiên đấu giá?"
        titleId="cancel-auction-title"
        actions={
          <>
            <Button color="inherit" onClick={() => setToCancel(null)} disabled={cancelling}>
              Giữ phiên
            </Button>
            <Button variant="contained" color="error" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Đang hủy..." : "Hủy phiên"}
            </Button>
          </>
        }
      >
        {cancelError && <Alert severity="error" sx={{ mb: 1.5 }}>{cancelError}</Alert>}
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          Nhà xe sẽ không thể đăng ký hoặc đặt giá tiếp. Thao tác không hoàn tác được.
        </Typography>
        <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Lý do hủy">
          {CANCEL_REASONS.map((item) => (
            <FormControlLabel key={item} value={item} control={<Radio />} label={item} sx={{ minHeight: 44 }} />
          ))}
        </RadioGroup>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label={reason === "Khác" ? "Lý do hủy (bắt buộc)" : "Ghi chú thêm (không bắt buộc)"}
          value={reasonNote}
          onChange={(event) => setReasonNote(event.target.value)}
          inputProps={{ maxLength: 400 }}
          sx={{ mt: 1 }}
        />
      </ResponsiveDialog>
    </Box>
  );
}
