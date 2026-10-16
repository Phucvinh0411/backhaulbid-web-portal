"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import AppCard from "@/components/common/AppCard";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PageHeader from "@/components/common/PageHeader";
import { getApiErrorMessage } from "@/services/errorMessage";
import { loadAccountProfile, loadBusinessProfile, loadRepresentativeProfile, updateAccountAvatar } from "@/services/profileApi";
import { mediaApi } from "@/services/mediaApi";
import { GATEWAY_URL } from "@/config/clientConfig";
import { toMediaViewUrl } from "@/lib/mediaUrl";
import CarrierCapabilityPanel from "./CarrierCapabilityPanel";
import { mapBusinessProfile, mapProfileAccount, mapRepresentativeProfile } from "@/services/profileMapper";

const ROLE = {
  shipper: { label: "Chủ hàng", dashboard: "/shipper/dashboard", verify: "/shipper/settings", secondary: "/shipper/fleet/routes", secondaryLabel: "Sổ địa chỉ kho" },
  carrier: { label: "Chủ xe", dashboard: "/carrier/dashboard", verify: "/carrier/settings", secondary: "/carrier/fleet", secondaryLabel: "Quản lý đội xe" },
  admin: { label: "Quản trị viên", dashboard: "/admin" },
};
const STATUS = {
  VERIFIED: { label: "Đã xác minh", color: "success" },
  APPROVED: { label: "Đã xác minh", color: "success" },
  PENDING: { label: "Đang chờ duyệt", color: "warning" },
  REJECTED: { label: "Cần bổ sung", color: "error" },
  NOT_SUBMITTED: { label: "Chưa gửi hồ sơ", color: "default" },
  SUPERSEDED: { label: "Có hồ sơ mới hơn", color: "default" },
};
const roleLabel = { SHIPPER: "Chủ hàng", CARRIER: "Chủ xe", ADMIN: "Quản trị viên" };
const AVATAR_TYPES_BY_EXTENSION = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

function statusProps(status) {
  return STATUS[String(status || "NOT_SUBMITTED").toUpperCase()] || { label: "Chưa xác định", color: "default" };
}

function VerificationStatus({ status }) {
  const props = statusProps(status);
  return <Chip size="small" label={props.label} color={props.color} icon={props.color === "success" ? <VerifiedOutlinedIcon /> : undefined} />;
}

function Field({ label, value, unavailable = "Chưa cập nhật" }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="dt" sx={{ color: "text.secondary", fontSize: 13, mb: 0.5 }}>{label}</Typography>
      <Typography component="dd" sx={{ m: 0, fontSize: 14, fontWeight: 500, overflowWrap: "anywhere" }}>{value || <Typography component="span" sx={{ color: "text.secondary", fontSize: 14 }}>{unavailable}</Typography>}</Typography>
    </Box>
  );
}

function Description({ rows }) {
  return <Box component="dl" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2.5, m: 0 }}>{rows.map((row) => <Field key={row.label} {...row} />)}</Box>;
}

function SectionHeading({ title, status, description, action }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1.5, flexWrap: "wrap", mb: 2.5 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
        {description && <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>{description}</Typography>}
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>{status && <VerificationStatus status={status} />}{action}</Box>
    </Box>
  );
}

function LoadingCard() {
  return <AppCard sx={{ p: { xs: 2, sm: 3 } }}><Skeleton variant="text" width="35%" height={28} /><Skeleton variant="text" width="70%" height={24} /><Skeleton variant="rounded" height={72} sx={{ mt: 2 }} /></AppCard>;
}

function ErrorCard({ message, onRetry }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" startIcon={<RefreshOutlinedIcon />} onClick={onRetry}>Thử lại</Button>}>{message}</Alert>;
}

function AccountPanel({ accountState, account, role, onRetry }) {
  if (accountState === "loading") return <LoadingCard />;
  if (accountState === "error") return <ErrorCard message="Không thể tải thông tin tài khoản." onRetry={onRetry} />;
  return (
    <AppCard component="section" sx={{ p: { xs: 2, sm: 3 } }}>
      <SectionHeading title="Thông tin tài khoản" />
      <Description rows={[
        { label: "Họ và tên", value: account.name !== "Tài khoản" ? account.name : null },
        { label: "Số điện thoại", value: account.phone },
        { label: "Email", value: account.email },
        { label: "Vai trò", value: roleLabel[account.role] || role.label },
      ]} />
    </AppCard>
  );
}

function BusinessPanel({ state, business, retry }) {
  if (state === "loading") return <LoadingCard />;
  if (state === "error") return <ErrorCard message="Không thể tải hồ sơ doanh nghiệp. Thử tải lại mục này." onRetry={retry} />;
  return (
    <AppCard component="section" sx={{ p: { xs: 2, sm: 3 } }}>
      <SectionHeading title="Doanh nghiệp" status={business.status} description="Thông tin từ hồ sơ doanh nghiệp đã gửi." />
      {business.status === "REJECTED" && business.rejectionReason && <Alert severity="warning" sx={{ mb: 2 }}>{business.rejectionReason}</Alert>}
      <Description rows={[
        { label: "Tên doanh nghiệp", value: business.companyName },
        { label: "Mã số thuế", value: business.taxCode },
        { label: "Địa chỉ đăng ký", value: business.registeredAddress },
        { label: "Người đại diện", value: business.legalRepresentative },
      ]} />
    </AppCard>
  );
}

function dateLabel(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toLocaleDateString("vi-VN");
}

function RepresentativePanel({ state, profile, retry }) {
  if (state === "loading") return <LoadingCard />;
  if (state === "error") return <ErrorCard message="Không thể tải trạng thái xác minh người đại diện." onRetry={retry} />;
  const pendingDetails = state === "partial-error";
  const noReport = state === "no-report";
  const value = profile.fields;
  return (
    <AppCard component="section" sx={{ p: { xs: 2, sm: 3 } }}>
      <SectionHeading title="Người đại diện" status={profile.status} description={profile.statusReason} />
      {profile.status === "REJECTED" && profile.statusReason && <Alert severity="warning" sx={{ mb: 2 }}>{profile.statusReason}</Alert>}
      {pendingDetails && <Alert severity="info" sx={{ mb: 2 }}>Trạng thái hồ sơ đã tải; một số trường chi tiết hiện chưa lấy được.</Alert>}
      {noReport && <Alert severity="info" sx={{ mb: 2 }}>Hồ sơ được đánh dấu đã xác minh nhưng không có báo cáo eKYC kèm theo, nên không có họ tên, số CCCD, ngày sinh và giới tính để hiển thị.</Alert>}
      <Description rows={[
        { label: "Họ và tên", value: value.fullName },
        { label: "Số CCCD 12 số", value: value.citizenId, unavailable: "Chưa thu thập" },
        { label: "Ngày sinh", value: dateLabel(value.dateOfBirth), unavailable: "Chưa thu thập" },
        { label: "Giới tính", value: value.gender === "M" ? "Nam" : value.gender === "F" ? "Nữ" : value.gender, unavailable: "Chưa thu thập" },
      ]} />
    </AppCard>
  );
}

export default function ProfileScreen({ role }) {
  const config = ROLE[role] || ROLE.admin;
  const [tab, setTab] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [accountResult, setAccountResult] = useState({ state: "loading" });
  const [businessResult, setBusinessResult] = useState({ state: "loading" });
  const [representativeResult, setRepresentativeResult] = useState({ state: "loading" });
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState(null);

  useEffect(() => {
    let active = true;
    setAccountResult({ state: "loading" });
    loadAccountProfile().then((result) => {
      if (active) setAccountResult(result.state === "ready" ? { state: "ready", data: mapProfileAccount(result.data) } : result);
    });

    if (role !== "admin") {
      setBusinessResult({ state: "loading" });
      setRepresentativeResult({ state: "loading" });
      Promise.all([loadBusinessProfile(), loadRepresentativeProfile()]).then(([business, representative]) => {
        if (!active) return;
        setBusinessResult(business.state === "ready" ? { state: "ready", data: mapBusinessProfile(business.data) } : business);

        if (representative.verification.state !== "ready") {
          setRepresentativeResult(representative.verification);
          return;
        }
        const mapped = mapRepresentativeProfile(representative.verification.data, representative.overview.data);
        const status = mapped.status;
        if (representative.overview.state === "error" && status === "NOT_SUBMITTED") {
          setRepresentativeResult({ state: "ready", data: mapped });
        } else if (representative.overview.state === "error" && representative.overview.error?.response?.status === 404 && status === "VERIFIED") {
          // A status with no eKYC report behind it (for example seeded demo data): say so instead of a load error.
          setRepresentativeResult({ state: "no-report", data: mapped });
        } else if (representative.overview.state === "error" && ["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
          setRepresentativeResult({ state: "partial-error", data: mapped });
        } else {
          setRepresentativeResult({ state: "ready", data: mapped });
        }
      });
    }
    return () => { active = false; };
  }, [reloadKey, role]);

  const account = accountResult.data;
  const representative = representativeResult.data || mapRepresentativeProfile(null, null);
  const companyStatus = businessResult.data?.status;
  const representativeStatus = representative.status;
  const retryAll = () => setReloadKey((key) => key + 1);
  const retryBusiness = () => {
    setBusinessResult({ state: "loading" });
    loadBusinessProfile().then((result) => setBusinessResult(result.state === "ready" ? { state: "ready", data: mapBusinessProfile(result.data) } : result));
  };

  const handleAvatarChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || AVATAR_TYPES_BY_EXTENSION[extension] !== file.type) {
      setAvatarFeedback({ severity: "error", message: "Chọn ảnh PNG, JPEG hoặc WebP." });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarFeedback({ severity: "error", message: "Ảnh đại diện cần nhỏ hơn 5 MB." });
      return;
    }

    setAvatarSaving(true);
    setAvatarFeedback(null);
    try {
      const uploadedUrl = await mediaApi.uploadFile(file, "avatars");
      if (!uploadedUrl) throw new Error("Máy chủ không trả về đường dẫn ảnh.");
      const savedAccount = await updateAccountAvatar(uploadedUrl);
      const avatarUrl = savedAccount?.avatarUrl || uploadedUrl;
      setAccountResult((previous) => previous.data
        ? { ...previous, data: { ...previous.data, avatarUrl } }
        : previous);
      window.dispatchEvent(new Event("account-profile-updated"));
      setAvatarFeedback({ severity: "success", message: "Đã cập nhật ảnh đại diện." });
    } catch (error) {
      setAvatarFeedback({ severity: "error", message: getApiErrorMessage(error, "Không thể cập nhật ảnh đại diện.") });
    } finally {
      setAvatarSaving(false);
    }
  };

  const isAdmin = role === "admin";
  const tabName = useMemo(() => {
    if (isAdmin) return "account";
    const tabs = ["account", "business", "representative", ...(role === "carrier" ? ["capability"] : [])];
    return tabs[tab] || "account";
  }, [isAdmin, role, tab]);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageHeader title="Hồ sơ" subtitle="Thông tin tài khoản, doanh nghiệp và người đại diện nằm trong các mục bên dưới. eKYC và hồ sơ xác minh được quản lý riêng trong Xác minh tài khoản." breadcrumbs={[{ label: config.label, path: config.dashboard }, { label: "Hồ sơ" }]} />

      <AppCard component="section" sx={{ p: { xs: 2, sm: 3 }, display: "flex", alignItems: { xs: "flex-start", sm: "center" }, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
          <Avatar src={toMediaViewUrl(account?.avatarUrl, GATEWAY_URL) || undefined} alt="" sx={{ width: 56, height: 56, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 20, fontWeight: 700 }}>{account?.name?.[0]?.toLocaleUpperCase("vi-VN") || "T"}</Avatar>
          <IconButton component="label" disabled={avatarSaving} title="Cập nhật ảnh đại diện" aria-label="Cập nhật ảnh đại diện" size="small" sx={{ position: "absolute", right: -6, bottom: -5, width: 28, height: 28, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: 1, "&:hover": { bgcolor: "action.hover" } }}>
            {avatarSaving ? <CircularProgress size={15} aria-label="Đang tải ảnh" /> : <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />}
            <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {accountResult.state === "loading" ? <Skeleton width={180} height={30} /> : <Typography sx={{ fontSize: 20, fontWeight: 700, overflowWrap: "anywhere" }}>{account?.name || "Tài khoản"}</Typography>}
          <Typography sx={{ fontSize: 14, color: "text.secondary", mt: 0.25 }}>{account?.phone || config.label}</Typography>
        </Box>
        {!isAdmin && <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}><VerificationStatus status={companyStatus} /><VerificationStatus status={representativeStatus} /></Box>}
        {avatarFeedback && <Alert severity={avatarFeedback.severity} sx={{ flexBasis: "100%", py: 0 }}>{avatarFeedback.message}</Alert>}
      </AppCard>

      {!isAdmin && <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Nhóm thông tin hồ sơ" variant="scrollable" scrollButtons={false} sx={{ minHeight: 44, "& .MuiTab-root": { minHeight: 44, px: 2, fontSize: { xs: 13, sm: 14 } } }}>
        <Tab label="Tài khoản" />
        <Tab label="Doanh nghiệp" />
        <Tab label="Đại diện" />
        {role === "carrier" && <Tab label="Năng lực nhà xe" />}
      </Tabs>}

      {tabName === "account" && <AccountPanel accountState={accountResult.state} account={account} role={config} onRetry={retryAll} />}
      {tabName === "business" && <BusinessPanel state={businessResult.state} business={businessResult.data || mapBusinessProfile(null)} retry={retryBusiness} />}
      {tabName === "representative" && <RepresentativePanel state={representativeResult.state} profile={representative} retry={retryAll} />}
      {tabName === "capability" && <CarrierCapabilityPanel accountId={account?.id} />}

      {!isAdmin && <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button component="a" href={config.verify} variant="contained" startIcon={<FactCheckOutlinedIcon />}>Mở xác minh tài khoản</Button>
        <Button component="a" href={config.secondary} variant="outlined" startIcon={tab === 0 ? <AccountCircleOutlinedIcon /> : <BusinessOutlinedIcon />}>{config.secondaryLabel}</Button>
      </Box>}
      {accountResult.state === "error" && <Typography role="alert" className="sr-only">{getApiErrorMessage(accountResult.error, "Không thể tải thông tin tài khoản.")}</Typography>}
    </Box>
  );
}
