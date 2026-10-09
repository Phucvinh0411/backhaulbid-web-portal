"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { HighlightPanel, ListSkeleton, Panel, StatusBadge } from "@/components/ui";
import { listAuctions, listMyRegistrations } from "@/services/biddingApi";
import { contractApi } from "@/services/contractApi";
import { unwrapListData } from "@/services/responseData";
import { getShipperNextStep } from "@/lib/statusMeta";
import { formatDateTime, shortId } from "@/lib/format";

const QUIET = { skipGlobalNotification: true };
const asList = (value) => (Array.isArray(value) ? value : value?.data || []);
const signedBy = (contract, role) => (contract.signatures || []).some((item) => item.role === role && item.signedAt);
const route = (from, to) => `${from || "?"} → ${to || "?"}`;

async function shipperTasks() {
  const [auctionsResponse, contractsResponse, tripsResponse] = await Promise.all([
    listAuctions({ page: 1, pageSize: 100 }),
    contractApi.listMine(undefined),
    contractApi.listTrips(undefined, QUIET),
  ]);
  const tasks = [];
  unwrapListData(auctionsResponse).forEach((auction) => {
    const next = getShipperNextStep(auction);
    if (next) {
      tasks.push({
        key: `auction-${auction.id}`,
        tone: "danger",
        label: next.label,
        title: route(auction.pickupLocation?.province || auction.origin, auction.deliveryLocation?.province || auction.destination),
        detail: `${auction.title || "Phiên"} · #${shortId(auction.id)}`,
        href: next.label === "Ký hợp đồng" ? "/shipper/contracts" : `/shipper/bidding/history?id=${encodeURIComponent(auction.id)}`,
      });
    }
  });
  asList(contractsResponse)
    .filter((contract) => ["DRAFT", "WAITING_SIGNATURE"].includes(contract.status) && signedBy(contract, "CARRIER") && !signedBy(contract, "SHIPPER"))
    .forEach((contract) =>
      tasks.push({
        key: `contract-${contract.id}`,
        tone: "danger",
        label: "Ký hợp đồng",
        title: route(contract.trip?.pickupLocation, contract.trip?.deliveryLocation),
        detail: `Hợp đồng ${contract.contractCode || shortId(contract.id)}${contract.signingDeadlineAt ? ` · hạn ${formatDateTime(contract.signingDeadlineAt)}` : ""}`,
        href: "/shipper/contracts",
      }),
    );
  asList(tripsResponse).forEach((trip) => {
    if (trip.status === "DELIVERED" || trip.canCancelForLateDelivery) {
      tasks.push({
        key: `trip-${trip.id}`,
        tone: trip.status === "DELIVERED" ? "danger" : "warning",
        label: trip.status === "DELIVERED" ? "Xác nhận nhận hàng" : `Xe trễ ${trip.lateMinutes} phút`,
        title: route(trip.pickupLocation, trip.deliveryLocation),
        detail: `Chuyến #${shortId(trip.id)}`,
        href: `/shipper/tracking?id=${encodeURIComponent(trip.id)}`,
      });
    }
  });
  return tasks;
}

async function carrierTasks() {
  const [registrationsResponse, contractsResponse, tripsResponse] = await Promise.all([
    listMyRegistrations({ page: 1, pageSize: 100 }),
    contractApi.listMine(undefined),
    contractApi.listTrips(undefined, QUIET),
  ]);
  const tasks = [];
  unwrapListData(registrationsResponse).forEach(({ auction, access }) => {
    const status = access?.accessStatus;
    if (status !== "AUCTION_OPEN" && status !== "PAYMENT_INCOMPLETE") return;
    tasks.push({
      key: `auction-${auction.id}`,
      tone: status === "AUCTION_OPEN" ? "success" : "danger",
      label: status === "AUCTION_OPEN" ? "Phòng đang mở" : "Thanh toán lại",
      title: route(auction.pickupLocation?.province || auction.origin, auction.deliveryLocation?.province || auction.destination),
      detail: status === "AUCTION_OPEN" ? `Kết thúc ${formatDateTime(auction.endTime)}` : `Mở phiên ${formatDateTime(auction.startTime)}`,
      href: `/carrier/auctions/${encodeURIComponent(auction.id)}`,
    });
  });
  asList(contractsResponse)
    .filter((contract) => ["DRAFT", "WAITING_SIGNATURE"].includes(contract.status) && !signedBy(contract, "CARRIER"))
    .forEach((contract) =>
      tasks.push({
        key: `contract-${contract.id}`,
        tone: "danger",
        label: "Ký hợp đồng",
        title: route(contract.trip?.pickupLocation, contract.trip?.deliveryLocation),
        detail: `Hợp đồng ${contract.contractCode || shortId(contract.id)}${contract.signingDeadlineAt ? ` · hạn ${formatDateTime(contract.signingDeadlineAt)}` : ""}`,
        href: "/carrier/contracts",
      }),
    );
  asList(tripsResponse).forEach((trip) => {
    const noDriver = trip.status === "WAITING_PICKUP" && !trip.driverId;
    if (!noDriver && trip.status !== "IN_TRANSIT" && trip.status !== "PICKED_UP") return;
    tasks.push({
      key: `trip-${trip.id}`,
      tone: noDriver ? "danger" : "info",
      label: noDriver ? "Phân công tài xế" : trip.status === "IN_TRANSIT" ? "Đang chạy" : "Đã lấy hàng",
      title: route(trip.pickupLocation, trip.deliveryLocation),
      detail: `Chuyến #${shortId(trip.id)}${trip.lateMinutes > 0 ? ` · trễ ${trip.lateMinutes} phút` : ""}`,
      href: `/carrier/transports/${encodeURIComponent(trip.id)}`,
    });
  });
  return tasks;
}

const ORDER = { danger: 0, warning: 1, success: 2, info: 3, neutral: 4 };

/** "What needs me now" list at the top of a role home page; built from live data only. */
export default function ActionInbox({ role }) {
  const [tasks, setTasks] = useState([]);
  const [state, setState] = useState("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const next = role === "shipper" ? await shipperTasks() : await carrierTasks();
      setTasks(next.sort((a, b) => ORDER[a.tone] - ORDER[b.tone]));
      setState("ready");
    } catch {
      setState("error");
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  // DESIGN.md: the single most urgent task goes on the navy band with a direct action.
  const urgent = state === "ready" && tasks[0]?.tone === "danger" ? tasks[0] : null;
  const rest = urgent ? tasks.slice(1) : tasks;

  return (
    <>
    {urgent && (
      <HighlightPanel
        eyebrow="Việc gấp nhất"
        title={urgent.label}
        caption={`${urgent.title} · ${urgent.detail}`}
        actions={<Button component={Link} href={urgent.href} variant="contained" sx={HighlightPanel.buttonSx}>Xử lý ngay</Button>}
        sx={{ mb: 2 }}
      />
    )}
    <Panel
      title="Việc cần xử lý"
      subtitle={state === "ready" ? (tasks.length ? `${tasks.length} việc, việc gấp ở trên` : "Không có việc nào đang chờ bạn.") : undefined}
      padded={false}
      sx={{ mb: 2 }}
    >
      {state === "loading" && (
        <Box sx={{ p: 2 }}>
          <ListSkeleton rows={2} height={56} label="Đang tổng hợp việc cần làm" />
        </Box>
      )}
      {state === "error" && (
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2" role="alert" sx={{ color: "error.main" }}>
            Không tổng hợp được việc cần làm.
          </Typography>
          <Button size="small" onClick={load}>
            Thử lại
          </Button>
        </Box>
      )}
      {state === "ready" && rest.length > 0 && (
        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {rest.slice(0, 8).map((task) => (
            <Box component="li" key={task.key} sx={{ listStyle: "none", borderTop: "1px solid", borderColor: "divider" }}>
              <Box component={Link} href={task.href} sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, minHeight: 56, textDecoration: "none", color: "inherit", "&:hover": { bgcolor: "action.hover" }, "&:focus-visible": { outline: "2px solid var(--color-focus)", outlineOffset: -2 } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <StatusBadge size="sm" tone={task.tone} label={task.label} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", mt: 0.5, overflowWrap: "anywhere" }}>{task.title}</Typography>
                  <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
                    {task.detail}
                  </Typography>
                </Box>
                <ChevronRightIcon aria-hidden sx={{ color: "text.secondary" }} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {state === "ready" && urgent && rest.length === 0 && (
        <Typography variant="body2" sx={{ px: 2, pb: 2, color: "text.secondary" }}>Không còn việc nào khác.</Typography>
      )}
    </Panel>
    </>
  );
}
