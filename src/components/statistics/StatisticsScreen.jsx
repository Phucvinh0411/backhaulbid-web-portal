"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AlertTitle from "@mui/material/AlertTitle";
import AppCard from "@/components/common/AppCard";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { statisticsApi } from "@/services/statisticsApi";
import { STAT_RANGE_OPTIONS, buildStatisticsRange, formatStatisticCount, formatStatisticCurrency, statusRows, validateCustomStatisticsRange } from "@/services/statisticsPresentation";
import { getApiErrorMessage } from "@/services/errorMessage";
import { tokens } from "@/theme/theme";

const VALID_RANGES = new Set(STAT_RANGE_OPTIONS.map(({ value }) => value));
const RANGE_LABEL = Object.fromEntries(STAT_RANGE_OPTIONS.map(({ value, label }) => [value, label]));
const CUSTOM_RANGE_ERROR = {
  "invalid-date": "Ngày không hợp lệ.",
  "from-required": "Chọn ngày bắt đầu.",
  "to-required": "Chọn ngày kết thúc.",
  "end-before-start": "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
  "max-range-exceeded": "Khoảng tùy chỉnh tối đa là 24 tháng.",
};
const STATUS_LABEL = {
  PENDING: "Chờ mở", OPEN: "Đang mở", COMPLETED: "Đã kết thúc", CANCELLED: "Đã hủy",
  WAITING_PICKUP: "Chờ lấy hàng", PICKED_UP: "Đã lấy hàng", IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao", SIGNED: "Đã ký", DRAFT: "Bản nháp", WAITING_SIGNATURE: "Chờ ký",
  EXPIRED: "Hết hạn", ACTIVE: "Đang hoạt động", INACTIVE: "Ngừng hoạt động", BLOCKED: "Đã khóa",
  VERIFIED: "Đã xác minh", REJECTED: "Từ chối", FAILED: "Thất bại", SUCCESS: "Thành công",
  REGISTERED: "Đã đăng ký", DRIVER: "Tài xế", SHIPPER: "Chủ hàng", CARRIER: "Chủ xe", ADMIN: "Quản trị viên",
};
const ROLE_META = {
  shipper: { title: "Thống kê chủ hàng", dashboard: "/shipper/dashboard", topics: [{ key: "auctions", label: "Phiên đấu giá" }, { key: "trips", label: "Chuyến vận chuyển" }] },
  carrier: { title: "Thống kê chủ xe", dashboard: "/carrier/dashboard", topics: [{ key: "auctions", label: "Đấu giá" }, { key: "trips", label: "Chuyến vận chuyển" }, { key: "fleet", label: "Đội xe" }] },
  admin: { title: "Thống kê toàn hệ thống", dashboard: "/admin", topics: [{ key: "accounts", label: "Tài khoản" }, { key: "auctions", label: "Đấu giá" }, { key: "trips", label: "Chuyến" }, { key: "wallet", label: "Giao dịch" }, { key: "fleet", label: "Đội xe" }, { key: "queues", label: "Hàng đợi" }] },
};

function initialSources(role) {
  const keys = role === "shipper" ? ["auctions", "trips"] : role === "carrier" ? ["auctions", "trips", "fleet"] : ["accounts", "auctions", "trips", "wallet", "fleet"];
  if (role === "admin") keys.push("complaints");
  return Object.fromEntries(keys.map((key) => [key, { state: "loading" }]));
}

function Metrics({ items }) {
  return <Grid container spacing={2}>{items.map((item) => <Grid item xs={12} sm={6} lg={3} key={item.title}>
    <StatCard title={item.title} value={item.value} subtitle={item.subtitle} icon={item.icon} color={item.color || "var(--color-brand)"} tooltipInfo={item.tooltip} href={item.href} />
  </Grid>)}</Grid>;
}

function SourcePanel({ title, source, retry, children }) {
  if (!source || source.state === "loading") return <AppCard component="section" aria-label={`Đang tải ${title}`} sx={{ p: 2.5 }}>
    <Typography component="h2" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <Skeleton variant="text" width="40%" height={30} />
    <Skeleton variant="rounded" height={90} />
  </AppCard>;
  if (source.state === "error") return <Alert severity="error" action={<Button color="inherit" size="small" onClick={retry}>Thử lại</Button>}>
    <AlertTitle>Không tải được {title.toLowerCase()}</AlertTitle>
    {getApiErrorMessage(source.error, "Nguồn số liệu này hiện chưa khả dụng.")}
  </Alert>;
  if (!source.data) return <Alert severity="info">Nguồn {title.toLowerCase()} chưa trả dữ liệu.</Alert>;
  return <Box component="section" aria-label={title}>{children(source.data)}</Box>;
}

function StatusTable({ title, statuses }) {
  const rows = statusRows(statuses);
  return <AppCard component="section" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{title}</Typography>
    {rows.length ? <TableContainer><Table size="small" aria-label={title}>
      <TableHead><TableRow><TableCell>Trạng thái</TableCell><TableCell align="right">Số lượng</TableCell></TableRow></TableHead>
      <TableBody>{rows.map(({ status, count }) => <TableRow key={status}><TableCell>{STATUS_LABEL[status] || status}</TableCell><TableCell align="right" className="tabular">{formatStatisticCount(count)}</TableCell></TableRow>)}</TableBody>
    </Table></TableContainer> : <Typography color="text.secondary" variant="body2">Chưa có dữ liệu trạng thái trong kỳ này.</Typography>}
  </AppCard>;
}

function TrendChart({ title, points, label = "Số lượng" }) {
  const data = Array.isArray(points) ? points : [];
  return <AppCard component="section" sx={{ p: { xs: 1.5, sm: 2.5 }, minWidth: 0 }}>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>{title}</Typography>
    {data.length ? <>
      <Box role="img" aria-label={`${title}, cột thể hiện ${label.toLowerCase()} theo kỳ`} sx={{ width: "100%", height: { xs: 230, sm: 280 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
            <CartesianGrid stroke={tokens.line} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: tokens.inkSubtle, fontSize: 11 }} interval={Math.max(0, Math.floor(data.length / 8) - 1)} />
            <YAxis allowDecimals={false} tick={{ fill: tokens.inkSubtle, fontSize: 11 }} />
            <Tooltip formatter={(value) => [formatStatisticCount(Number(value)), label]} labelFormatter={(date) => `Kỳ ${date}`} />
            <Bar dataKey="count" name={label} fill={tokens.brand} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="caption" color="text.secondary">Biểu đồ có thể dùng bàn phím và trình đọc màn hình; bảng trạng thái bên dưới giữ số liệu dạng văn bản.</Typography>
    </> : <Typography variant="body2" color="text.secondary">Chưa có dữ liệu xu hướng trong kỳ này.</Typography>}
  </AppCard>;
}

function DomainContent({ role, topic, sources, retry }) {
  if (topic === "auctions") return <SourcePanel title="đấu giá" source={sources.auctions} retry={retry.auctions}>{(data) => <>
    <Metrics items={role === "carrier" ? [
      { title: "Phiên đã tham gia", value: formatStatisticCount(data.participations), subtitle: RANGE_LABEL[retry.range], icon: GavelOutlinedIcon },
      { title: "Phiên đã có kết quả", value: formatStatisticCount(data.decidedAuctions), subtitle: "Mẫu số tỷ lệ trúng", icon: GavelOutlinedIcon },
      { title: "Phiên trúng", value: formatStatisticCount(data.wonAuctions), subtitle: "Có winning bid thuộc tài khoản", icon: GavelOutlinedIcon },
      { title: "Tỷ lệ trúng", value: typeof data.winRate === "number" ? `${data.winRate}%` : "—", subtitle: "Chỉ tính phiên đã có kết quả", icon: GavelOutlinedIcon },
    ] : [
      { title: "Tổng số phiên", value: formatStatisticCount(data.total), subtitle: RANGE_LABEL[retry.range], icon: GavelOutlinedIcon },
      { title: "Đang mở", value: formatStatisticCount(data.byStatus?.OPEN), subtitle: "Trạng thái hiện tại của phiên", icon: GavelOutlinedIcon },
      { title: "Đã kết thúc", value: formatStatisticCount(data.byStatus?.COMPLETED), subtitle: "Có kết quả", icon: GavelOutlinedIcon },
      { title: "Đã hủy", value: formatStatisticCount(data.byStatus?.CANCELLED), subtitle: "Trong kỳ đã chọn", icon: GavelOutlinedIcon },
    ]} />
    <Box sx={{ mt: 2 }}><TrendChart title="Phiên theo thời gian" points={data.series} label="Số phiên" /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Phân rã trạng thái phiên" statuses={data.byStatus} /></Box>
  </>}</SourcePanel>;

  if (topic === "trips") return <SourcePanel title="chuyến vận chuyển" source={sources.trips} retry={retry.trips}>{(data) => <>
    <Metrics items={[
      { title: "Tổng số chuyến", value: formatStatisticCount(data.total), subtitle: RANGE_LABEL[retry.range], icon: LocalShippingOutlinedIcon },
      { title: "Giá trị hợp đồng đã ký", value: formatStatisticCurrency(data.agreedValue), subtitle: "Không đồng nghĩa với tiền đã thanh toán", icon: AccountBalanceWalletOutlinedIcon, tooltip: "Cộng agreedPrice của chuyến có hợp đồng SIGNED trong kỳ." },
      ...(role === "admin" ? [{ title: "Chờ lấy hàng", value: formatStatisticCount(data.byStatus?.WAITING_PICKUP), subtitle: "Snapshot theo trạng thái hiện tại", icon: LocalShippingOutlinedIcon }] : []),
    ]} />
    <Box sx={{ mt: 2 }}><TrendChart title="Chuyến theo thời gian" points={data.series} label="Số chuyến" /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Phân rã trạng thái chuyến" statuses={data.byStatus} /></Box>
    {data.contractsByStatus ? <Box sx={{ mt: 2 }}><StatusTable title="Hợp đồng theo trạng thái" statuses={data.contractsByStatus} /></Box> : null}
  </>}</SourcePanel>;

  if (topic === "fleet") return <SourcePanel title="đội xe" source={sources.fleet} retry={retry.fleet}>{(data) => <>
    <Metrics items={role === "admin" ? [
      { title: "Phương tiện", value: formatStatisticCount(data.vehicleCount), subtitle: "Snapshot hiện tại", icon: DirectionsCarOutlinedIcon },
      { title: "Tài xế", value: formatStatisticCount(data.driverCount), subtitle: "Snapshot hiện tại", icon: GroupsOutlinedIcon },
      { title: "Chủ xe có phương tiện", value: formatStatisticCount(data.carrierCount), subtitle: "Có ít nhất một phương tiện", icon: BusinessOutlinedIcon },
      { title: "Xe chờ duyệt", value: formatStatisticCount(data.vehicleByStatus?.PENDING), subtitle: "Hàng đợi hiện tại", icon: DirectionsCarOutlinedIcon },
    ] : [
      { title: "Phương tiện", value: formatStatisticCount(data.vehicleCount), subtitle: "Toàn bộ đội xe", icon: DirectionsCarOutlinedIcon },
      { title: "Đang hoạt động", value: formatStatisticCount(data.activeVehicleCount), subtitle: "Trạng thái VERIFIED", icon: DirectionsCarOutlinedIcon },
      { title: "Tài xế", value: formatStatisticCount(data.driverCount), subtitle: `${formatStatisticCount(data.verifiedDriverCount)} đã xác minh`, icon: GroupsOutlinedIcon },
      { title: "Điểm uy tín", value: formatStatisticCount(data.reputation), subtitle: "Nguồn uy tín fleet service", icon: BusinessOutlinedIcon },
    ]} />
    {data.vehicleByStatus ? <Box sx={{ mt: 2 }}><StatusTable title="Phương tiện theo trạng thái" statuses={data.vehicleByStatus} /></Box> : null}
    {data.driverByStatus ? <Box sx={{ mt: 2 }}><StatusTable title="Tài xế theo trạng thái" statuses={data.driverByStatus} /></Box> : null}
    {data.byVehicleStatus ? <Box sx={{ mt: 2 }}><StatusTable title="Đội xe của bạn theo trạng thái" statuses={data.byVehicleStatus} /></Box> : null}
  </>}</SourcePanel>;

  if (topic === "accounts") return <SourcePanel title="tài khoản" source={sources.accounts} retry={retry.accounts}>{(data) => <>
    <Metrics items={[
      { title: "Tài khoản mới", value: formatStatisticCount(data.totalNew), subtitle: RANGE_LABEL[retry.range], icon: GroupsOutlinedIcon },
      { title: "Chủ hàng hiện tại", value: formatStatisticCount(data.currentByRole?.SHIPPER), subtitle: "Snapshot tổng thể", icon: BusinessOutlinedIcon },
      { title: "Chủ xe hiện tại", value: formatStatisticCount(data.currentByRole?.CARRIER), subtitle: "Snapshot tổng thể", icon: BusinessOutlinedIcon },
      { title: "Tài khoản đang hoạt động", value: formatStatisticCount(data.currentByStatus?.ACTIVE), subtitle: "Snapshot tổng thể", icon: GroupsOutlinedIcon },
    ]} />
    <Box sx={{ mt: 2 }}><TrendChart title="Tài khoản mới theo thời gian" points={data.series} label="Tài khoản" /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Tài khoản mới theo vai trò" statuses={data.newByRole} /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Tài khoản hiện tại theo trạng thái" statuses={data.currentByStatus} /></Box>
  </>}</SourcePanel>;

  if (topic === "wallet") return <SourcePanel title="giao dịch ví" source={sources.wallet} retry={retry.wallet}>{(data) => <>
    <Metrics items={[
      { title: "Giao dịch thành công", value: formatStatisticCount(data.transactionsByStatus?.SUCCESS), subtitle: RANGE_LABEL[retry.range], icon: AccountBalanceWalletOutlinedIcon },
      { title: "Đang xử lý", value: formatStatisticCount(data.transactionsByStatus?.PENDING), subtitle: "Trong kỳ đã chọn", icon: AccountBalanceWalletOutlinedIcon },
      { title: "Thất bại", value: formatStatisticCount(data.transactionsByStatus?.FAILED), subtitle: "Trong kỳ đã chọn", icon: AccountBalanceWalletOutlinedIcon },
      { title: "Tổng giá trị sổ cái SUCCESS", value: formatStatisticCurrency(data.successfulLedgerAmount), subtitle: "Không phải doanh thu/lợi nhuận", icon: AccountBalanceWalletOutlinedIcon, tooltip: "Tổng amount giao dịch SUCCESS theo loại; đây là luồng sổ cái, không phải doanh thu của nền tảng." },
    ]} />
    <Box sx={{ mt: 2 }}><TrendChart title="Giao dịch SUCCESS theo thời gian" points={data.successfulSeries} label="Giao dịch" /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Giao dịch theo trạng thái" statuses={data.transactionsByStatus} /></Box>
    <Box sx={{ mt: 2 }}><StatusTable title="Giao dịch SUCCESS theo loại" statuses={Object.fromEntries(Object.entries(data.successfulByType || {}).map(([type, item]) => [type, item.count]))} /></Box>
  </>}</SourcePanel>;

  if (topic === "queues" && role === "admin") return <Grid container spacing={2}>
    <Grid item xs={12} md={6}><SourcePanel title="xác minh tài khoản" source={sources.accounts} retry={retry.accounts}>{(data) => <Metrics items={[
      { title: "Doanh nghiệp chờ duyệt", value: formatStatisticCount(data.currentVerificationQueues?.businessPending), subtitle: "Snapshot hiện tại", icon: BusinessOutlinedIcon, href: "/admin/business-verifications" },
      { title: "Người đại diện chờ duyệt", value: formatStatisticCount(data.currentVerificationQueues?.representativePending), subtitle: "Snapshot hiện tại", icon: GroupsOutlinedIcon, href: "/admin/representative-verifications" },
    ]} />}</SourcePanel></Grid>
    <Grid item xs={12} md={6}><SourcePanel title="duyệt đội xe" source={sources.fleet} retry={retry.fleet}>{(data) => <Metrics items={[
      { title: "Phương tiện chờ duyệt", value: formatStatisticCount(data.vehicleByStatus?.PENDING), subtitle: "Snapshot hiện tại", icon: DirectionsCarOutlinedIcon, href: "/admin/fleet-verifications" },
      { title: "Tài xế chờ duyệt", value: formatStatisticCount(data.driverByStatus?.PENDING), subtitle: "Snapshot hiện tại", icon: GroupsOutlinedIcon, href: "/admin/fleet-verifications" },
    ]} />}</SourcePanel></Grid>
    <Grid item xs={12} md={6}><SourcePanel title="rút tiền" source={sources.wallet} retry={retry.wallet}>{(data) => <Metrics items={[
      { title: "Yêu cầu rút tiền chờ xử lý", value: formatStatisticCount(data.withdrawalsByStatus?.PENDING), subtitle: "Snapshot hiện tại", icon: AccountBalanceWalletOutlinedIcon, href: "/admin/wallets" },
      { title: "Đã duyệt", value: formatStatisticCount(data.withdrawalsByStatus?.APPROVED), subtitle: "Snapshot hiện tại", icon: AccountBalanceWalletOutlinedIcon, href: "/admin/wallets" },
    ]} />}</SourcePanel></Grid>
    <Grid item xs={12} md={6}><SourcePanel title="khiếu nại" source={sources.complaints} retry={retry.complaints}>{(data) => <>
      <Metrics items={[{ title: "Khiếu nại cần xử lý", value: formatStatisticCount(data.openCount), subtitle: "Đang chờ hoặc xử lý", icon: GroupsOutlinedIcon, href: "/admin/complaints" }]} />
      <Box sx={{ mt: 2 }}><StatusTable title="Khiếu nại hiện tại theo trạng thái" statuses={data.complaintsByStatus} /></Box>
    </>}</SourcePanel></Grid>
  </Grid>;

  return null;
}

export default function StatisticsScreen({ role }) {
  const config = ROLE_META[role];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlRange = searchParams.get("range");
  const range = VALID_RANGES.has(urlRange) ? urlRange : "30d";
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";
  const [customFrom, setCustomFrom] = useState(urlFrom);
  const [customTo, setCustomTo] = useState(urlTo);
  const [topic, setTopic] = useState(config.topics[0].key);
  const [sources, setSources] = useState(() => initialSources(role));
  const [retryKey, setRetryKey] = useState(0);
  const rangeParams = useMemo(() => buildStatisticsRange(range, { from: urlFrom, to: urlTo }), [range, urlFrom, urlTo]);
  const customRangeError = validateCustomStatisticsRange(customFrom, customTo);

  useEffect(() => {
    if (urlFrom) setCustomFrom(urlFrom);
    if (urlTo) setCustomTo(urlTo);
  }, [urlFrom, urlTo]);

  useEffect(() => {
    let active = true;
    setSources(initialSources(role));
    if (!rangeParams) return () => { active = false; };
    statisticsApi[role](rangeParams).then((result) => { if (active) setSources(result); }).catch((error) => {
      if (active) setSources(Object.fromEntries(Object.keys(initialSources(role)).map((key) => [key, { state: "error", error }])));
    });
    return () => { active = false; };
  }, [rangeParams, retryKey, role]);

  useEffect(() => {
    if (!config.topics.some((item) => item.key === topic)) setTopic(config.topics[0].key);
  }, [config, topic]);

  const retry = (key) => ({
    range,
    [key]: () => setRetryKey((current) => current + 1),
  });
  const setRange = (value, from, to) => {
    const params = new window.URLSearchParams(searchParams.toString());
    params.set("range", value);
    params.delete("from");
    params.delete("to");
    if (value === "custom" && from && to) {
      params.set("from", from);
      params.set("to", to);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
    <PageHeader title={config.title} subtitle="Số liệu được tổng hợp từ dịch vụ nghiệp vụ, theo ngày Việt Nam đã chọn." breadcrumbs={[{ label: "Tổng quan", path: config.dashboard }, { label: "Thống kê" }]} />
    <AppCard component="section" sx={{ p: { xs: 1, sm: 1.5 } }}>
      <Typography component="h2" sx={{ px: 1, pt: 0.5, fontSize: 13, color: "text.secondary", fontWeight: 700 }}>Khoảng thời gian</Typography>
      <Tabs value={range} onChange={(_, value) => setRange(value)} variant="fullWidth" aria-label="Lọc khoảng thời gian" sx={{ width: { xs: "100%", sm: "fit-content" }, maxWidth: { sm: 560 }, minHeight: 44, "& .MuiTab-root": { minHeight: 44, minWidth: 0, px: 0.5, fontSize: { xs: 12, sm: 13 }, whiteSpace: "nowrap" } }}>
        {STAT_RANGE_OPTIONS.map((option) => <Tab key={option.value} value={option.value} label={option.label} />)}
      </Tabs>
      {range === "custom" && <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25, p: 1 }}>
        <TextField type="date" size="small" label="Từ ngày" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" size="small" label="Đến ngày" value={customTo} onChange={(event) => setCustomTo(event.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" disabled={Boolean(customRangeError)} onClick={() => setRange("custom", customFrom, customTo)}>Áp dụng</Button>
        <Typography role="status" aria-live="polite" sx={{ width: "100%", fontSize: 12, color: customRangeError ? "error.main" : "text.secondary" }}>
          {customRangeError ? CUSTOM_RANGE_ERROR[customRangeError] : "Ngày kết thúc được tính trọn ngày; tối đa 24 tháng."}
        </Typography>
      </Box>}
    </AppCard>
    <Tabs value={topic} onChange={(_, value) => setTopic(value)} variant="scrollable" scrollButtons="auto" aria-label="Chủ đề thống kê" sx={{ minHeight: 48, "& .MuiTab-root": { minHeight: 48, px: { xs: 2, sm: 2.5 }, fontWeight: 600 } }}>
      {config.topics.map((item) => <Tab key={item.key} value={item.key} label={item.label} />)}
    </Tabs>
    {rangeParams && <DomainContent role={role} topic={topic} sources={sources} retry={Object.fromEntries(Object.keys(sources).map((key) => [key, retry(key)]))} />}
    <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ alignItems: "center" }}>
      Cập nhật theo dữ liệu của môi trường hiện tại. Kỳ ngày được tính theo Asia/Ho_Chi_Minh; dữ liệu giữa các dịch vụ có thể đồng bộ trễ khác nhau.
    </Alert>
  </Box>;
}
