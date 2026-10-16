"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import AppCard from "@/components/common/AppCard";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import CarrierReviewsCard from "@/components/shipper/carrier-detail/CarrierReviewsCard";
import { getReviewHeadline } from "@/components/shipper/carrier-detail/carrierReviewPresentation";
import { carrierProfileApi } from "@/services/carrierProfileApi";
import { mapCarrierReviews } from "@/services/carrierProfileMapper";
import { getApiErrorMessage } from "@/services/errorMessage";

const VEHICLE_STATUS = {
  VERIFIED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  INACTIVE: "Ngừng sử dụng",
  ACTIVE: "Đang hoạt động",
  BLOCKED: "Đã khóa",
};

const unwrap = (value) => value?.data ?? value;
const rows = (value) => {
  const data = unwrap(value);
  return Array.isArray(data) ? data : [];
};
/** Average for the metric tile; the card below explains an empty or failed summary. */
const ratingValue = (summary) => {
  const headline = getReviewHeadline(summary);
  if (headline.state === "NOT_LOADED") return "—";
  if (headline.state === "EMPTY") return "Chưa có";
  return `${Number(summary.averageRating).toFixed(1)} / 5`;
};
const count = (value) => typeof value === "number" ? new Intl.NumberFormat("vi-VN").format(value) : "—";

function Metric({ label, value, icon: Icon }) {
  return (
    <AppCard sx={{ p: 2, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
        <Icon sx={{ color: "primary.main", fontSize: 20, flexShrink: 0 }} />
      </Box>
      <Typography className="tabular" sx={{ mt: 1, fontSize: 24, fontWeight: 750 }}>{value}</Typography>
    </AppCard>
  );
}

function DataTable({ title, description, columns, items, emptyText, action }) {
  return (
    <AppCard component="section" sx={{ p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>{title}</Typography>
          <Typography sx={{ mt: 0.35, color: "text.secondary", fontSize: 13 }}>{description}</Typography>
        </Box>
        {action}
      </Box>
      {items.length ? (
        <TableContainer sx={{ maxWidth: "100%" }}>
          <Table size="small" sx={{ minWidth: 520 }}>
            <TableHead><TableRow>{columns.map((column) => <TableCell key={column.key} sx={{ fontWeight: 700 }}>{column.label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{items.map((item, index) => <TableRow key={item.id || item.licensePlate || item.phone || index}>
              {columns.map((column) => <TableCell key={column.key}>{column.render ? column.render(item) : item[column.key] || "Chưa cập nhật"}</TableCell>)}
            </TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      ) : <Typography sx={{ py: 2, color: "text.secondary", fontSize: 14 }}>{emptyText}</Typography>}
    </AppCard>
  );
}

export default function CarrierCapabilityPanel({ accountId }) {
  const [result, setResult] = useState({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!accountId) {
      setResult({ state: "error", message: "Không xác định được tài khoản chủ xe." });
      return () => { active = false; };
    }

    setResult({ state: "loading" });
    Promise.all([
      carrierProfileApi.getFleetStatistics(),
      carrierProfileApi.getVehicles(accountId),
      carrierProfileApi.getDrivers(accountId),
      // Reviews are optional here: a failure leaves the card in its "not loaded" state, never zero reviews.
      carrierProfileApi.getReviewSummary(accountId).catch(() => null),
      carrierProfileApi.getReviews(accountId, { page: 1, pageSize: 10 }).catch(() => null),
    ]).then(([statistics, vehicles, drivers, reviewSummary, reviewPage]) => {
      if (!active) return;
      setResult({
        state: "ready",
        data: {
          statistics: unwrap(statistics) || {},
          vehicles: rows(vehicles),
          drivers: rows(drivers),
          ...mapCarrierReviews({ reviewSummary: unwrap(reviewSummary), reviews: unwrap(reviewPage)?.items ?? [] }),
        },
      });
    }).catch((error) => {
      if (active) setResult({ state: "error", message: getApiErrorMessage(error, "Không thể tải năng lực đội xe.") });
    });

    return () => { active = false; };
  }, [accountId, retryKey]);

  if (result.state === "loading") return <AppCard sx={{ p: 2.5 }}><Skeleton width="35%" height={28} /><Skeleton variant="rounded" height={92} sx={{ mt: 1.5 }} /><Skeleton variant="rounded" height={180} sx={{ mt: 2 }} /></AppCard>;
  if (result.state === "error") return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRetryKey((key) => key + 1)}>Thử lại</Button>}>{result.message}</Alert>;

  const { statistics, vehicles, drivers, reviewSummary, reviews } = result.data;
  const vehicleColumns = [
    { key: "licensePlate", label: "Biển số" },
    { key: "vehicleType", label: "Loại xe" },
    { key: "bodyType", label: "Thân xe" },
    { key: "payloadCapacity", label: "Tải trọng", render: (vehicle) => vehicle.payloadCapacity == null ? "Chưa cập nhật" : `${vehicle.payloadCapacity} tấn` },
    { key: "status", label: "Trạng thái", render: (vehicle) => VEHICLE_STATUS[vehicle.status] || vehicle.status || "Chưa cập nhật" },
  ];
  const driverColumns = [
    { key: "fullName", label: "Tài xế" },
    { key: "licenseNumber", label: "Số bằng lái" },
    { key: "phone", label: "Điện thoại" },
    { key: "status", label: "Trạng thái", render: (driver) => VEHICLE_STATUS[driver.status] || driver.status || "Chưa cập nhật" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,minmax(0,1fr))", md: "repeat(3,minmax(0,1fr))", xl: "repeat(6,minmax(0,1fr))" }, gap: 1.5 }}>
        <Metric label="Tổng phương tiện" value={count(statistics.vehicleCount)} icon={DirectionsCarOutlinedIcon} />
        <Metric label="Xe đã duyệt" value={count(statistics.activeVehicleCount)} icon={DirectionsCarOutlinedIcon} />
        <Metric label="Tài xế" value={count(statistics.driverCount)} icon={GroupsOutlinedIcon} />
        <Metric label="Tài xế đã xác minh" value={count(statistics.verifiedDriverCount)} icon={GroupsOutlinedIcon} />
        <Metric label="Điểm uy tín" value={statistics.reputation == null ? "—" : `${count(statistics.reputation)} / 100`} icon={ShieldOutlinedIcon} />
        <Metric label="Đánh giá sao" value={ratingValue(reviewSummary)} icon={StarOutlineIcon} />
      </Box>
      <CarrierReviewsCard summary={reviewSummary} reviews={reviews} />
      <DataTable title={`Đội xe (${vehicles.length})`} description="Phương tiện đã đăng ký trong tài khoản chủ xe." columns={vehicleColumns} items={vehicles} emptyText="Chưa có phương tiện được đăng ký." action={<Button component="a" href="/carrier/vehicles" size="small">Quản lý xe</Button>} />
      <DataTable title={`Tài xế (${drivers.length})`} description="Tài xế thuộc đội xe và trạng thái hồ sơ hiện tại." columns={driverColumns} items={drivers} emptyText="Chưa có tài xế được đăng ký." action={<Button component="a" href="/carrier/drivers" size="small">Quản lý tài xế</Button>} />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}><Button component="a" href="/carrier/statistics" variant="outlined">Xem thống kê hoạt động</Button></Box>
    </Box>
  );
}
