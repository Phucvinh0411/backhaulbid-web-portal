"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader, DetailDrawer } from "@/components/common";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui";
import EkycGuard from "@/components/eKYC/EkycGuard";
import { notifyAccountVerificationUpdated } from "@/hooks/useAccountVerification";
import CarrierBiddingItem, { normalizeCarrierAuction } from "@/components/carrier/CarrierBiddingItem";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { getBatchAuctionAccess, listAuctions } from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getPageMeta, unwrapListData } from "@/services/responseData";

const EkycModal = dynamic(() => import("@/components/eKYC/EkycModal"), { ssr: false });
const AuctionRegistrationDialog = dynamic(
  () => import("@/components/carrier/auction-detail/AuctionRegistrationDialog"),
  { ssr: false },
);

const PAGE_SIZE = 100;
const SCOPES = [
  { value: "REGISTRATION", label: "Đang nhận đăng ký" },
  { value: "OPEN", label: "Đang đấu giá" },
  { value: "ALL", label: "Tất cả" },
];
const SORTS = [
  { value: "deadline", label: "Sắp hết hạn trước" },
  { value: "priceDesc", label: "Giá trần cao nhất" },
  { value: "priceAsc", label: "Giá trần thấp nhất" },
  { value: "newest", label: "Mới đăng" },
];

const text = (value) => String(value || "").toLocaleLowerCase("vi");
const deadlineOf = (auction) => new Date(auction.status === "OPEN" ? auction.endTime : auction.registrationEndTime || auction.startTime).getTime() || Infinity;

function CarrierAuctionsContent() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [truncated, setTruncated] = useState(false);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("REGISTRATION");
  const [goodsType, setGoodsType] = useState("");
  const [auctionType, setAuctionType] = useState("");
  const [sort, setSort] = useState("deadline");
  const [detail, setDetail] = useState(null);
  const [registering, setRegistering] = useState(null);
  const [ekycModalOpen, setEkycModalOpen] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const responses = await Promise.all([
        listAuctions({ status: "PENDING", page: 1, pageSize: PAGE_SIZE }),
        listAuctions({ status: "OPEN", page: 1, pageSize: PAGE_SIZE }),
      ]);
      setTruncated(responses.some((response) => getPageMeta(response).totalItems > PAGE_SIZE));
      const auctions = Array.from(new Map(responses.flatMap(unwrapListData).map((auction) => [auction.id, auction])).values());
      setItems(auctions.map((auction) => ({ auction, access: undefined })));
      setState("ready");
      const ids = auctions.map((auction) => auction.id).filter(Boolean);
      if (ids.length > 0) {
        const chunks = [];
        for (let i = 0; i < ids.length; i += 200) {
          chunks.push(ids.slice(i, i + 200));
        }
        Promise.all(chunks.map((chunk) => getBatchAuctionAccess(chunk).catch(() => null))).then((batches) => {
          const merged = {};
          let hasAny = false;
          batches.forEach((batch) => {
            if (batch && typeof batch === "object") {
              hasAny = true;
              Object.assign(merged, batch);
            }
          });
          setItems((current) =>
            current.map((item) => ({
              ...item,
              access: hasAny ? (merged[item.auction.id] ?? null) : null,
            })),
          );
        });
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Không thể tải danh sách phiên đấu giá."));
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    getMyVehicles()
      .then((response) => active && setVehicles(Array.isArray(response) ? response : []))
      .catch((loadError) => active && setVehiclesError(getApiErrorMessage(loadError, "Không thể tải danh sách phương tiện.")))
      .finally(() => active && setVehiclesLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const goodsTypes = useMemo(() => [...new Set(items.map(({ auction }) => auction.goodsType).filter(Boolean))].sort(), [items]);

  const visible = useMemo(() => {
    const needle = text(query.trim());
    const filtered = items.filter(({ auction }) => {
      if (scope === "REGISTRATION" && !(auction.status === "PENDING" && auction.registrationOpen)) return false;
      if (scope === "OPEN" && auction.status !== "OPEN") return false;
      if (goodsType && auction.goodsType !== goodsType) return false;
      if (auctionType && auction.auctionType !== auctionType) return false;
      if (!needle) return true;
      const haystack = [auction.title, auction.goodsType, auction.origin, auction.destination, auction.pickupLocation?.address, auction.deliveryLocation?.address, auction.id].map(text).join(" ");
      return haystack.includes(needle);
    });
    const comparators = {
      deadline: (a, b) => deadlineOf(a.auction) - deadlineOf(b.auction),
      priceDesc: (a, b) => Number(b.auction.maxPrice) - Number(a.auction.maxPrice),
      priceAsc: (a, b) => Number(a.auction.maxPrice) - Number(b.auction.maxPrice),
      newest: (a, b) => new Date(b.auction.createdAt) - new Date(a.auction.createdAt),
    };
    return [...filtered].sort(comparators[sort]);
  }, [auctionType, goodsType, items, query, scope, sort]);

  const activeFilters = [goodsType, auctionType, query.trim()].filter(Boolean).length;
  const detailView = detail ? normalizeCarrierAuction(detail.auction, detail.access) : null;

  return (
    <Box>
      <PageHeader
          title="Tìm phiên đấu giá"
          subtitle="Đấu giá ngược: nhà xe đưa giá thấp hơn giá trần để nhận chuyến. Đăng ký và thanh toán trước hạn đóng đăng ký."
          breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Tìm phiên" }]}
          action={
            <Button component={Link} href="/carrier/my-auctions" variant="outlined">
              Phiên của tôi
            </Button>
          }
        />

      <Box role="tablist" aria-label="Phạm vi phiên" sx={{ display: "flex", gap: 1, mb: 1.5, overflowX: "auto", pb: 0.5 }}>
        {SCOPES.map((option) => (
          <Chip
            key={option.value}
            role="tab"
            aria-selected={scope === option.value}
            label={option.label}
            onClick={() => setScope(option.value)}
            color={scope === option.value ? "primary" : "default"}
            variant={scope === option.value ? "filled" : "outlined"}
            sx={{ minHeight: 40, px: 0.5, fontSize: "0.875rem" }}
          />
        ))}
      </Box>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "2fr 1fr 1fr 1fr" }, mb: 1.5 }}>
        <TextField
          label="Tìm theo tuyến, hàng hóa, mã phiên"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select label="Loại hàng" value={goodsType} onChange={(event) => setGoodsType(event.target.value)}>
          <MenuItem value="">Tất cả loại hàng</MenuItem>
          {goodsTypes.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Hình thức" value={auctionType} onChange={(event) => setAuctionType(event.target.value)}>
          <MenuItem value="">Công khai và kín</MenuItem>
          <MenuItem value="PUBLIC">Công khai</MenuItem>
          <MenuItem value="SEALED">Đấu giá kín</MenuItem>
        </TextField>
        <TextField select label="Sắp xếp" value={sort} onChange={(event) => setSort(event.target.value)}>
          {SORTS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {state === "ready" && (
        <Typography component="div" variant="body2" role="status" sx={{ color: "text.secondary", mb: 1.5 }}>
          {visible.length} phiên
          {activeFilters ? " khớp bộ lọc" : ""}
          {truncated ? ` · đang hiển thị ${PAGE_SIZE} phiên mới nhất mỗi trạng thái` : ""}
          {activeFilters > 0 && (
            <Button
              size="small"
              onClick={() => {
                setQuery("");
                setGoodsType("");
                setAuctionType("");
              }}
              sx={{ ml: 1 }}
            >
              Xóa lọc
            </Button>
          )}
        </Typography>
      )}

      {state === "loading" && <ListSkeleton rows={3} height={220} label="Đang tải phiên đấu giá" />}
      {state === "error" && <ErrorState description={error} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState
          title="Không có phiên phù hợp"
          description={scope === "REGISTRATION" ? "Hiện không có phiên đang nhận đăng ký khớp bộ lọc. Thử phạm vi “Tất cả”." : "Thử bỏ bớt điều kiện lọc."}
        />
      )}
      {state === "ready" && visible.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" } }}>
          {visible.map(({ auction, access }) => (
            <CarrierBiddingItem
              key={auction.id}
              auction={auction}
              access={access}
              onViewDetail={() => setDetail({ auction, access })}
              onRegister={() => setRegistering(auction)}
              onVerifyEkyc={() => setEkycModalOpen(true)}
            />
          ))}
        </Box>
      )}

      {Boolean(registering) && (
        <AuctionRegistrationDialog
          open={Boolean(registering)}
          auction={registering}
          vehicles={vehicles}
          vehiclesLoading={vehiclesLoading}
          vehiclesError={vehiclesError}
          onClose={() => setRegistering(null)}
          onCompleted={() => {
            setRegistering(null);
            router.push("/carrier/my-auctions");
          }}
        />
      )}

      <DetailDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        variant="modal"
        title={detail ? `${detail.auction.title || "Phiên đấu giá"}` : "Chi tiết phiên"}
      >
        {detail && (
          <AuctionDetailContent
            auction={detail.auction}
            footer={
              detailView?.primary === "verify_ekyc" ? (
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  onClick={() => {
                    setDetail(null);
                    setEkycModalOpen(true);
                  }}
                >
                  Xác thực eKYC để tham gia
                </Button>
              ) : detailView?.primary === "verify_business" ? (
                <Button variant="contained" color="warning" fullWidth component={Link} href="/carrier/settings">
                  Xác minh doanh nghiệp để tham gia
                </Button>
              ) : detailView?.primary === "verify_coverage" ? (
                <Button variant="contained" color="warning" fullWidth component={Link} href="/carrier/settings">
                  Cập nhật bảo hiểm hàng hóa
                </Button>
              ) : detailView?.primary === "register" ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    const target = detail.auction;
                    setDetail(null);
                    setRegistering(target);
                  }}
                >
                  Đăng ký tham gia
                </Button>
              ) : (
                <Button variant="contained" fullWidth component={Link} href={`/carrier/auctions/${encodeURIComponent(detail.auction.id)}`}>
                  {detailView?.primary === "enter" ? "Vào phòng đấu giá" : "Mở trang phiên"}
                </Button>
              )
            }
          />
        )}
      </DetailDrawer>

      {ekycModalOpen && (
        <EkycModal
          role="carrier"
          onClose={() => setEkycModalOpen(false)}
          onComplete={() => {
            setEkycModalOpen(false);
            notifyAccountVerificationUpdated();
            void load();
          }}
        />
      )}
    </Box>
  );
}

export default function CarrierAuctionsPage() {
  return (
    <EkycGuard role="carrier">
      <CarrierAuctionsContent />
    </EkycGuard>
  );
}
