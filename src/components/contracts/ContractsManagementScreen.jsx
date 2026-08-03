"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
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

export const CONTRACT_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ ký" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export const DEMO_CONTRACTS = [
  {
    id: "HD-2454",
    auctionId: "BID-2454",
    origin: "Hồ Chí Minh",
    destination: "Cần Thơ",
    cargoType: "Hàng tiêu dùng (8 tấn)",
    value: "5.350.000 đ",
    date: "11/08/2026",
    status: "PENDING_SIGNATURE",
    shipperName: "Công ty Cổ phần Thương mại ABC",
    carrierName: "Công ty TNHH Vận tải & Logistics Miền Nam",
    pickupAddress: "KCN Tân Bình, TP. Hồ Chí Minh",
    deliveryAddress: "Kho Cái Răng, Cần Thơ",
  },
  {
    id: "HD-2452",
    auctionId: "BID-2452",
    origin: "Thái Nguyên",
    destination: "Hải Phòng",
    cargoType: "Linh kiện điện tử (5.2 tấn)",
    value: "11.200.000 đ",
    date: "10/08/2026",
    status: "ACTIVE",
    shipperName: "Công ty Cổ phần Sữa Việt Nam",
    carrierName: "Hợp tác xã Vận tải Hữu Nghị",
    pickupAddress: "Kho Samsung Yên Bình, Phổ Yên, Thái Nguyên",
    deliveryAddress: "Cảng Đình Vũ, Hải Phòng",
  },
  {
    id: "HD-2410",
    auctionId: "BID-2410",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    cargoType: "Vật liệu xây dựng (20 tấn)",
    value: "4.000.000 đ",
    date: "01/08/2026",
    status: "COMPLETED",
    shipperName: "Công ty TNHH MTV Xây dựng Phúc Đạt",
    carrierName: "Công ty Vận tải Phước An",
    pickupAddress: "KCN Bắc Thăng Long, Hà Nội",
    deliveryAddress: "KCN Đình Vũ, Hải Phòng",
  },
];

function mapFilter(status) {
  if (status === "PENDING") return "PENDING_SIGNATURE";
  return status;
}

function getPartnerName(contract, role) {
  return role === "shipper" ? contract.carrierName : contract.shipperName;
}

export default function ContractsManagementScreen({
  role = "carrier",
  initialFilter = "ALL",
  contracts = DEMO_CONTRACTS,
}) {
  const [items, setItems] = useState(contracts);
  const [filter, setFilter] = useState(initialFilter);
  const [viewMode, setViewMode] = useState("CARD");
  const [selectedContract, setSelectedContract] = useState(null);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const isShipper = role === "shipper";
  const basePath = isShipper ? "/shipper" : "/carrier";
  const partnerLabel = isShipper ? "Nhà xe trúng thầu" : "Chủ hàng";

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

  const handleSign = () => {
    if (selectedContract) {
      setItems((current) =>
        current.map((contract) =>
          contract.id === selectedContract.id
            ? { ...contract, status: "ACTIVE" }
            : contract
        )
      );
    }
    setOpenSignDialog(false);
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

      <Box className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
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

        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </Box>

      {visibleContracts.length === 0 ? (
        <Box className="rounded-2xl border border-slate-200 bg-white/70 p-10 text-center">
          <Typography variant="h6" className="text-slate-500">
            Không có hợp đồng phù hợp với bộ lọc hiện tại.
          </Typography>
        </Box>
      ) : viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {visibleContracts.map((contract) => (
            <Grid item xs={12} sm={6} md={4} key={contract.id}>
              <ContractItem
                contract={{
                  ...contract,
                  partner: getPartnerName(contract, role),
                }}
                partnerLabel={partnerLabel}
                onSign={openSign}
                onViewDetail={openDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer
          component={Paper}
          className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm"
        >
          <Table sx={{ minWidth: 860 }}>
            <TableHead className="bg-slate-50">
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
                    className="!font-bold text-slate-600"
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
                        className="!font-bold text-[#1B4965]"
                      >
                        {contract.id}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500">
                        {contract.auctionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-semibold">
                        {contract.origin} → {contract.destination}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500">
                        {contract.cargoType}
                      </Typography>
                    </TableCell>
                    <TableCell>{getPartnerName(contract, role)}</TableCell>
                    <TableCell>{contract.date}</TableCell>
                    <TableCell className="!font-bold text-emerald-600">
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
                        {contract.status === "PENDING_SIGNATURE" ? (
                          <ActionButton
                            variant="success"
                            size="sm"
                            startIcon={<VerifiedUserIcon />}
                            onClick={() => openSign(contract)}
                          >
                            Ký
                          </ActionButton>
                        ) : (
                          <ActionButton
                            variant="outlined"
                            size="sm"
                            startIcon={<LocalShippingIcon />}
                            href={
                              isShipper
                                ? `/shipper/tracking?id=${contract.id}`
                                : `/carrier/transports/${contract.id}`
                            }
                          >
                            Theo dõi
                          </ActionButton>
                        )}
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
            <Box className="rounded-2xl border border-slate-100 bg-white p-4">
              <Typography className="mb-2 !font-bold text-[#1B4965]">
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
              <DetailRow
                label="Giá trị"
                value={selectedContract.value}
                valueColor="text-emerald-600"
              />
            </Box>

            <Box className="rounded-2xl border border-slate-100 bg-white p-4">
              <Typography className="mb-2 !font-bold text-[#1B4965]">
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

            {selectedContract.status === "PENDING_SIGNATURE" ? (
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
            ) : (
              <ActionButton
                fullWidth
                variant="outlined"
                startIcon={<LocalShippingIcon />}
                href={
                  isShipper
                    ? `/shipper/tracking?id=${selectedContract.id}`
                    : `/carrier/transports/${selectedContract.id}`
                }
              >
                Theo dõi vận chuyển
              </ActionButton>
            )}
          </Box>
        )}
      </DetailDrawer>

      <Dialog
        open={openSignDialog}
        onClose={() => setOpenSignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "!rounded-2xl" }}
      >
        <DialogTitle className="flex items-center gap-2 border-b border-slate-100 !font-bold text-[#1B4965]">
          <VerifiedUserIcon color="primary" />
          Ký hợp đồng điện tử
        </DialogTitle>
        <DialogContent className="!pt-5">
          {selectedContract && (
            <Box className="space-y-4">
              <Typography variant="body2" className="text-slate-600">
                Bạn đang thực hiện ký xác nhận hợp đồng{" "}
                <strong>{selectedContract.id}</strong>. Chữ ký số này có giá trị
                pháp lý tương đương chữ ký tay trong hệ thống BackHaulBid.
              </Typography>
              <Box className="rounded-xl border border-slate-100 bg-white px-4 py-2">
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
                  <Typography variant="body2" className="text-slate-600">
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
            disabled={!agreeTerms}
            onClick={handleSign}
          >
            Xác nhận ký
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
