"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";

import {
  ActionButton,
  DetailDrawer,
  DetailRow,
  PageHeader,
  ViewModeToggle,
} from "@/components/common";
import { ErrorState, ListSkeleton, ResponsiveDialog } from "@/components/ui";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ContractItem, { getContractStatusDesign } from "./ContractItem";
import { contractApi } from "@/services/contractApi";
import { getAuction } from "@/services/biddingApi";
import { carrierProfileApi } from "@/services/carrierProfileApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { mapContractResponses, getContractTrackingHref } from "@/services/contractMapper";
import { formatContractCode, shortId } from "@/lib/format";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import useAccountVerification from "@/hooks/useAccountVerification";

export const CONTRACT_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ ký" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "EXPIRED", label: "Hợp đồng hết hạn" },
];

function mapFilter(status) {
  if (status === "PENDING") return "PENDING_SIGNATURE";
  return status;
}

function getPartnerName(contract, role) {
  return role === "shipper" ? contract.carrierName : contract.shipperName;
}

function getTrackingHref(contract, isShipper) {
  return getContractTrackingHref(contract, isShipper ? "shipper" : "carrier");
}

function extractAuctionCargoLabel(auction) {
  return auction?.goodsType || auction?.cargoName || auction?.cargoType || auction?.title || null;
}

const isGenericCargo = (contract) => !contract?.cargoType || contract.cargoType === "Vận chuyển hàng hóa";

export default function ContractsManagementScreen({
  role = "carrier",
  initialFilter = "ALL",
  contracts = null,
}) {
  const notify = useGlobalNotification();
  const [items, setItems] = useState(Array.isArray(contracts) ? contracts : []);
  const [loading, setLoading] = useState(!Array.isArray(contracts));
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [viewMode, setViewMode] = useState("CARD");
  const [selectedContract, setSelectedContract] = useState(null);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpInfo, setOtpInfo] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [signing, setSigning] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const isShipper = role === "shipper";
  const basePath = isShipper ? "/shipper" : "/carrier";
  const verification = useAccountVerification(true);
  const signingLocked = !verification.loading && !verification.fullyVerified;
  const partnerLabel = isShipper ? "Nhà xe trúng thầu" : "Chủ hàng";

  const loadContracts = useCallback(async () => {
    if (Array.isArray(contracts)) {
      setItems(contracts);
      setLoadError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const response = await contractApi.listMine();
      const mapped = mapContractResponses(response, role);
      setItems(mapped);

      const uniquePartnerIds = role === "shipper"
        ? [...new Set(
            mapped
              .filter((contract) => !contract.carrierName || contract.carrierName.startsWith("Nhà xe #"))
              .map((contract) => contract.partnerId)
              .filter(Boolean),
          )]
        : [];
      const uniqueAuctionIds = [
        ...new Set(
          mapped
            .filter((contract) => isGenericCargo(contract) && contract.auctionId && /^[0-9a-f-]{36}$/i.test(String(contract.auctionId)))
            .map((contract) => String(contract.auctionId)),
        ),
      ];
      if (uniquePartnerIds.length > 0 || uniqueAuctionIds.length > 0) {
        const [companyEntries, auctionEntries] = await Promise.all([
          Promise.all(
            uniquePartnerIds.map(async (partnerId) => {
              const company = await carrierProfileApi
                .getCompany(partnerId, { skipGlobalNotification: true })
                .catch(() => null);
              const data = company?.data ?? company;
              return [String(partnerId), data?.companyName || null];
            }),
          ),
          Promise.all(
            uniqueAuctionIds.map(async (auctionId) => {
              const auction = await getAuction(auctionId, { skipGlobalNotification: true }).catch(() => null);
              return [auctionId, extractAuctionCargoLabel(auction)];
            }),
          ),
        ]);
        const companyById = Object.fromEntries(companyEntries.filter(([, name]) => Boolean(name)));
        const cargoByAuctionId = Object.fromEntries(auctionEntries.filter(([, cargo]) => Boolean(cargo)));
        if (Object.keys(companyById).length > 0 || Object.keys(cargoByAuctionId).length > 0) {
          setItems((current) =>
            current.map((contract) => {
              const companyName = contract.partnerId ? companyById[String(contract.partnerId)] : null;
              const cargoLabel = contract.auctionId ? cargoByAuctionId[String(contract.auctionId)] : null;
              if (!companyName && !cargoLabel) return contract;
              return {
                ...contract,
                ...(companyName ? { carrierName: companyName } : {}),
                ...(cargoLabel && isGenericCargo(contract) ? { cargoType: cargoLabel } : {}),
              };
            }),
          );
        }
      }
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể tải danh sách hợp đồng. Vui lòng thử lại.",
      );
      setLoadError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [contracts, notify, role]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const visibleContracts = useMemo(() => {
    const expectedStatus = mapFilter(filter);
    const filtered =
      filter === "ALL"
        ? items
        : items.filter((contract) => contract.status === expectedStatus);

    return [...filtered].sort((a, b) => {
      const aValue =
        orderBy === "partner" ? getPartnerName(a, role) : a[orderBy] || "";
      const bValue =
        orderBy === "partner" ? getPartnerName(b, role) : b[orderBy] || "";
      const comparison = String(aValue).localeCompare(String(bValue), "vi");
      return order === "desc" ? -comparison : comparison;
    });
  }, [filter, items, order, orderBy, role]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const openDetails = (contract) => {
    setSelectedContract(contract);
    setOpenDetailDrawer(true);
    const auctionId = contract?.auctionId;
    if (isGenericCargo(contract) && auctionId && /^[0-9a-f-]{36}$/i.test(auctionId)) {
      getAuction(auctionId, { skipGlobalNotification: true })
        .then((auction) => {
          const cargoLabel = extractAuctionCargoLabel(auction);
          if (!cargoLabel) return;
          setSelectedContract((current) =>
            current && current.backendId === contract.backendId
              ? { ...current, cargoType: cargoLabel }
              : current,
          );
          setItems((current) =>
            current.map((item) =>
              item.backendId === contract.backendId ? { ...item, cargoType: cargoLabel } : item,
            ),
          );
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((current) => (current > 1 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const openSign = (contract) => {
    if (signingLocked) {
      notify.warning("Tài khoản cần hoàn tất xác thực eKYC và xác thực doanh nghiệp trước khi ký hợp đồng.");
      return;
    }
    setSelectedContract(contract);
    setAgreeTerms(false);
    setOtpCode("");
    setOtpInfo(null);
    setOtpError("");
    setResendSeconds(0);
    setOpenSignDialog(true);
  };

  const handleRequestOtp = async () => {
    if (!selectedContract || sendingOtp || resendSeconds > 0 || signingLocked) return;
    setSendingOtp(true);
    setOtpError("");
    try {
      const response = await contractApi.requestSignOtp(selectedContract.backendId, { skipGlobalNotification: true });
      const data = response?.data ?? response;
      setOtpInfo(data);
      const cooldown = Number(data?.resendAfterSeconds);
      setResendSeconds(Number.isFinite(cooldown) && cooldown > 0 ? cooldown : 60);
      notify.success(`Đã gửi mã OTP tới ${data?.maskedEmail || "email tài khoản"}.`);
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể gửi mã OTP qua email.");
      setOtpError(message);
      notify.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSign = async () => {
    const cleanOtp = otpCode.trim();
    if (selectedContract && agreeTerms && /^\d{6}$/.test(cleanOtp) && !signing) {
      setSigning(true);
      setOtpError("");
      try {
        const response = await contractApi.sign(selectedContract.backendId, { otpCode: cleanOtp }, { skipGlobalNotification: true });
        const mappedContract = mapContractResponses([response], role)[0];
        setItems((current) => current.map((contract) =>
          contract.id === selectedContract.id ? { ...contract, ...mappedContract } : contract,
        ));
        setOpenSignDialog(false);
        notify.success("Đã ký hợp đồng vận chuyển thành công.");
      } catch (error) {
        const message = getApiErrorMessage(error, "Không thể ký hợp đồng.");
        setOtpError(message);
        notify.error(message);
      } finally {
        setSigning(false);
      }
    }
  };

  const title = isShipper ? "Quản lý hợp đồng vận chuyển" : "Quản lý hợp đồng";
  const subtitle = isShipper
    ? "Theo dõi hợp đồng sau khi chốt thầu, ký xác nhận và chuyển sang giám sát hành trình"
    : "Quản lý các hợp đồng vận chuyển điện tử sau khi trúng thầu";

  return (
    <Box className="animate-fade-in-up pb-10">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[
          {
            label: "Trang chủ",
            path: isShipper ? "/shipper/dashboard" : "/carrier/dashboard",
          },
          { label: "Hợp đồng", path: `${basePath}/contracts` },
        ]}
      />

      <Box className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <Tabs
          value={filter}
          onChange={(_, value) => setFilter(value)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            },
          }}
        >
          {CONTRACT_FILTERS.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>

        {!isMobile && <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />}
      </Box>

      {loading ? (
        <ListSkeleton rows={4} height={140} label="Đang tải danh sách hợp đồng..." />
      ) : loadError ? (
        <ErrorState description={loadError} onRetry={loadContracts} />
      ) : visibleContracts.length === 0 ? (
        <Box className="rounded-xl border border-line bg-surface p-10 text-center">
          <Typography variant="h6" className="text-ink-muted">
            Không có hợp đồng phù hợp với bộ lọc hiện tại.
          </Typography>
        </Box>
      ) : isMobile || viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {visibleContracts.map((contract) => (
            <Grid item xs={12} sm={6} md={4} key={contract.id}>
              <ContractItem
                contract={{
                  ...contract,
                  partner: getPartnerName(contract, role),
                }}
                partnerLabel={partnerLabel}
                trackingHref={getTrackingHref(contract, isShipper)}
                onSign={openSign}
                signDisabled={signingLocked}
                onViewDetail={openDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer
          component={Paper}
          className="overflow-x-auto rounded-xl border border-line shadow-sm"
        >
          <Table sx={{ minWidth: 860 }}>
            <TableHead className="bg-surface-sunken">
              <TableRow>
                {[
                  { id: "id", label: "Mã HĐ" },
                  { id: "route", label: "Tuyến đường", sortable: false },
                  { id: "partner", label: partnerLabel },
                  { id: "date", label: "Ngày bốc" },
                  { id: "value", label: "Giá trị" },
                  { id: "status", label: "Trạng thái", sortable: false },
                  {
                    id: "actions",
                    label: "Thao tác",
                    align: "right",
                    sortable: false,
                  },
                ].map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    className="!font-bold text-ink-muted"
                  >
                    {column.sortable === false ? (
                      column.label
                    ) : (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleContracts.map((contract) => {
                const design = getContractStatusDesign(contract.status);
                return (
                  <TableRow key={contract.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        className="!font-bold text-[var(--color-brand)]"
                      >
                        {formatContractCode(contract.id)}
                      </Typography>
                      <Typography variant="caption" className="text-ink-muted">
                        {contract.auctionId && contract.auctionId !== "Chưa có mã phiên"
                          ? `Phiên #${shortId(contract.auctionId)}`
                          : contract.auctionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-semibold">
                        {contract.origin} → {contract.destination}
                      </Typography>
                      <Typography variant="caption" className="text-ink-muted">
                        {contract.cargoType}
                      </Typography>
                    </TableCell>
                    <TableCell>{getPartnerName(contract, role)}</TableCell>
                    <TableCell>{contract.date}</TableCell>
                    <TableCell className="!font-bold text-success">
                      {contract.value}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex rounded-md border px-2 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: design.bgColor,
                          color: design.textColor,
                          borderColor: design.borderColor,
                        }}
                      >
                        {design.label}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-2">
                        <ActionButton
                          variant="outlined"
                          size="sm"
                          startIcon={<DescriptionIcon />}
                          onClick={() => openDetails(contract)}
                        >
                          Chi tiết
                        </ActionButton>
                        {contract.status === "PENDING_SIGNATURE" && contract.canSign ? (
                          <ActionButton
                            variant="success"
                            size="sm"
                            startIcon={<VerifiedUserIcon />}
                            disabled={signingLocked}
                            onClick={() => openSign(contract)}
                          >
                            Ký
                          </ActionButton>
                        ) : contract.status === "PENDING_SIGNATURE" ? (
                          <ActionButton variant="outlined" size="sm" disabled>
                            {contract.pendingMessage}
                          </ActionButton>
                        ) : ["ACTIVE", "COMPLETED"].includes(contract.status) ? (
                          <ActionButton
                            variant="outlined"
                            size="sm"
                            startIcon={<LocalShippingIcon />}
                            href={
                              getTrackingHref(contract, isShipper)
                            }
                          >
                            Theo dõi
                          </ActionButton>
                        ) : null}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        title="Chi tiết hợp đồng"
        width={540}
      >
        {selectedContract && (
          <Box className="space-y-4">
            <Box className="rounded-xl border border-line bg-white p-4">
              <Typography className="mb-2 !font-bold text-[var(--color-brand)]">
                1. Thông tin hợp đồng
              </Typography>
              <DetailRow label="Mã hợp đồng" value={formatContractCode(selectedContract.id)} />
              <DetailRow
                label="Mã phiên đấu giá"
                value={
                  selectedContract.auctionId && selectedContract.auctionId !== "Chưa có mã phiên"
                    ? `#${shortId(selectedContract.auctionId)}`
                    : selectedContract.auctionId
                }
              />
              <DetailRow
                label={partnerLabel}
                value={getPartnerName(selectedContract, role)}
              />
              <DetailRow
                label="Trạng thái"
                value={getContractStatusDesign(selectedContract.status).label}
              />
              {selectedContract.status === "PENDING_SIGNATURE" && (
                <DetailRow
                  label="Hạn ký"
                  value={selectedContract.signingDeadlineAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "Asia/Ho_Chi_Minh",
                      }).format(new Date(selectedContract.signingDeadlineAt))
                    : "Chưa cập nhật"}
                />
              )}
              <DetailRow
                label="Giá trị"
                value={selectedContract.value}
                valueColor="text-success"
              />
            </Box>

            <Box className="rounded-xl border border-line bg-white p-4">
              <Typography className="mb-2 !font-bold text-[var(--color-brand)]">
                2. Hàng hóa & tuyến vận chuyển
              </Typography>
              <DetailRow label="Hàng hóa" value={selectedContract.cargoType} />
              <DetailRow
                label="Tuyến đường"
                value={`${selectedContract.origin} → ${selectedContract.destination}`}
              />
              <DetailRow
                label="Điểm nhận"
                value={selectedContract.pickupAddress || selectedContract.origin}
              />
              <DetailRow
                label="Điểm giao"
                value={
                  selectedContract.deliveryAddress ||
                  selectedContract.destination
                }
              />
              <DetailRow label="Ngày bốc hàng" value={selectedContract.date} />
            </Box>

            {selectedContract.status === "PENDING_SIGNATURE" && selectedContract.canSign ? (
              <ActionButton
                fullWidth
                variant="primary"
                startIcon={<VerifiedUserIcon />}
                disabled={signingLocked}
                onClick={() => {
                  setOpenDetailDrawer(false);
                  openSign(selectedContract);
                }}
              >
                Ký điện tử ngay
              </ActionButton>
            ) : selectedContract.status === "PENDING_SIGNATURE" ? (
              <Typography role="status" className="rounded-xl bg-surface-sunken p-3 text-sm text-ink-muted">
                {selectedContract.pendingMessage}
              </Typography>
            ) : ["ACTIVE", "COMPLETED"].includes(selectedContract.status) ? (
              <ActionButton
                fullWidth
                variant="outlined"
                startIcon={<LocalShippingIcon />}
                href={
                  getTrackingHref(selectedContract, isShipper)
                }
              >
                Theo dõi vận chuyển
              </ActionButton>
            ) : null}
          </Box>
        )}
      </DetailDrawer>

      <ResponsiveDialog
        open={openSignDialog}
        onClose={() => setOpenSignDialog(false)}
        busy={signing}
        titleId="sign-contract-dialog-title"
        title={
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <VerifiedUserIcon color="primary" aria-hidden />
            Ký hợp đồng điện tử
          </Box>
        }
        actions={
          <>
            <ActionButton variant="text" onClick={() => setOpenSignDialog(false)} disabled={signing}>
              Hủy
            </ActionButton>
            <ActionButton
              variant="primary"
              disabled={!agreeTerms || !/^\d{6}$/.test(otpCode.trim()) || signing || signingLocked}
              onClick={handleSign}
            >
              {signing ? "Đang ký..." : "Xác nhận ký"}
            </ActionButton>
          </>
        }
      >
          {selectedContract && (
            <Box className="space-y-4">
              <Typography variant="body2" className="text-ink-muted">
                Bạn đang thực hiện ký xác nhận hợp đồng{" "}
                <strong>{formatContractCode(selectedContract.id)}</strong>. Hệ thống sẽ ghi nhận
                xác nhận của tài khoản bạn và tiếp tục quy trình vận chuyển
                khi các bên đã ký đầy đủ.
              </Typography>
              <Box className="rounded-xl border border-line bg-white px-4 py-2">
                <DetailRow
                  label={partnerLabel}
                  value={getPartnerName(selectedContract, role)}
                />
                <DetailRow label="Hàng hóa" value={selectedContract.cargoType} />
                <DetailRow
                  label="Tuyến đường"
                  value={`${selectedContract.origin} → ${selectedContract.destination}`}
                />
                <DetailRow label="Giá trị" value={selectedContract.value} />
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" className="text-ink-muted">
                    Tôi đã đọc, hiểu rõ và đồng ý với điều khoản hợp đồng vận
                    chuyển điện tử.
                  </Typography>
                }
              />
              <Box className="space-y-3 rounded-xl border border-line bg-white p-4">
                <Box className="flex flex-wrap items-center justify-between gap-2">
                  <Typography variant="subtitle2" className="!font-semibold text-ink">
                    Xác thực OTP qua email
                  </Typography>
                  <ActionButton
                    variant="outlined"
                    size="sm"
                    startIcon={<MailOutlineIcon />}
                    disabled={sendingOtp || resendSeconds > 0 || signingLocked}
                    onClick={handleRequestOtp}
                  >
                    {sendingOtp
                      ? "Đang gửi..."
                      : resendSeconds > 0
                        ? `Gửi lại (${resendSeconds}s)`
                        : otpInfo
                          ? "Gửi lại mã OTP"
                          : "Gửi mã OTP"}
                  </ActionButton>
                </Box>
                {otpInfo?.maskedEmail && (
                  <Alert severity="info">
                    Mã OTP 6 chữ số đã được gửi tới <strong>{otpInfo.maskedEmail}</strong>. Vui lòng kiểm tra hộp thư (kể cả Spam/Quảng cáo).
                  </Alert>
                )}
                {otpError && (
                  <Alert
                    severity="warning"
                    action={
                      /chưa có email/i.test(otpError) ? (
                        <Button component={Link} href={`${basePath}/profile`} color="inherit" size="small" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          Thêm email
                        </Button>
                      ) : undefined
                    }
                  >
                    {otpError}
                  </Alert>
                )}
                <TextField
                  label="Mã OTP"
                  placeholder="6 chữ số"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputProps={{
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    maxLength: 6,
                    "aria-describedby": "sign-otp-helper",
                    style: { letterSpacing: "0.35em", fontVariantNumeric: "tabular-nums", fontWeight: 600 },
                  }}
                  helperText={<span id="sign-otp-helper">Nhập mã 6 chữ số được gửi tới email tài khoản.</span>}
                  fullWidth
                />
              </Box>
            </Box>
          )}
      </ResponsiveDialog>
    </Box>
  );
}
