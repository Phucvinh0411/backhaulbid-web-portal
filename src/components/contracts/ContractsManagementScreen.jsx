"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import ContractItem, { getContractStatusDesign } from "./ContractItem";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { mapContractResponses, getContractTrackingHref } from "@/services/contractMapper";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

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
  const [signing, setSigning] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const isShipper = role === "shipper";
  const basePath = isShipper ? "/shipper" : "/carrier";
  const partnerLabel = isShipper ? "Nhà xe trúng thầu" : "Chủ hàng";

  useEffect(() => {
    let active = true;

    if (Array.isArray(contracts)) {
      setItems(contracts);
      setLoadError("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    contractApi
      .listMine()
      .then((response) => {
        if (active) {
          setItems(mapContractResponses(response, role));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active) {
          const message = getApiErrorMessage(
            error,
            "Không thể tải danh sách hợp đồng. Vui lòng thử lại.",
          );
          setLoadError(message);
          notify.error(message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [contracts, notify, role]);

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
  };

  const openSign = (contract) => {
    setSelectedContract(contract);
    setAgreeTerms(false);
    setOpenSignDialog(true);
  };

  const handleSign = async () => {
    if (selectedContract && agreeTerms && !signing) {
      setSigning(true);
      try {
        const response = await contractApi.sign(selectedContract.backendId);
        const mappedContract = mapContractResponses([response], role)[0];
        setItems((current) => current.map((contract) =>
          contract.id === selectedContract.id ? { ...contract, ...mappedContract } : contract,
        ));
        setOpenSignDialog(false);
        notify.success("Đã ký hợp đồng vận chuyển thành công.");
      } catch (error) {
        notify.error(getApiErrorMessage(error, "Không thể ký hợp đồng."));
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
        <Box className="flex min-h-[320px] items-center justify-center">
          <CircularProgress aria-label="Đang tải danh sách hợp đồng" />
        </Box>
      ) : loadError ? (
        <Box className="rounded-xl border border-danger-soft bg-danger-soft p-6 text-center">
          <Typography variant="h6" className="text-danger">
            Không thể tải danh sách hợp đồng
          </Typography>
          <Typography className="mt-2 text-danger">{loadError}</Typography>
        </Box>
      ) : visibleContracts.length === 0 ? (
        <Box className="rounded-xl border border-line bg-white/70 p-10 text-center">
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
                        {contract.id}
                      </Typography>
                      <Typography variant="caption" className="text-ink-muted">
                        {contract.auctionId}
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
              <DetailRow label="Mã hợp đồng" value={selectedContract.id} />
              <DetailRow
                label="Mã phiên đấu giá"
                value={selectedContract.auctionId}
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

      <Dialog
        open={openSignDialog}
        onClose={() => setOpenSignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "!rounded-xl" }}
      >
        <DialogTitle className="flex items-center gap-2 border-b border-line !font-bold text-[var(--color-brand)]">
          <VerifiedUserIcon color="primary" />
          Ký hợp đồng điện tử
        </DialogTitle>
        <DialogContent className="!pt-5">
          {selectedContract && (
            <Box className="space-y-4">
              <Typography variant="body2" className="text-ink-muted">
                Bạn đang thực hiện ký xác nhận hợp đồng{" "}
                <strong>{selectedContract.id}</strong>. Hệ thống sẽ ghi nhận
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <ActionButton variant="text" onClick={() => setOpenSignDialog(false)}>
            Hủy
          </ActionButton>
          <ActionButton
            variant="primary"
            disabled={!agreeTerms || signing}
            onClick={handleSign}
          >
            {signing ? "Đang ký..." : "Xác nhận ký"}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
