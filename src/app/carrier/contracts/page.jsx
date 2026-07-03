"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { 
  Description as DescriptionIcon,
  LocalShipping as LocalShippingIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  FileDownload as FileDownloadIcon,
  VerifiedUser as VerifiedUserIcon
} from "@mui/icons-material";
import { PageHeader, ViewModeToggle, DetailDrawer, DetailRow } from "@/components/common";
import CarrierContractItem from "@/components/carrier/CarrierContractItem";

const initialContracts = [
  {
    id: "HD-2454",
    auctionId: "BID-2454",
    origin: "Hồ Chí Minh",
    destination: "Cần Thơ",
    cargoType: "Hàng tiêu dùng (8 Tấn)",
    value: "5,350,000 ₫",
    date: "11/08/2026",
    status: "PENDING_SIGNATURE",
    partner: "Công ty TNHH Vận tải & Logistics Miền Nam",
  },
  {
    id: "HD-2452",
    auctionId: "BID-2452",
    origin: "Hồ Chí Minh",
    destination: "Đà Nẵng",
    cargoType: "Hàng điện tử (15 Tấn)",
    value: "11,200,000 ₫",
    date: "10/08/2026",
    status: "ACTIVE",
    partner: "Công ty Cổ phần Thương mại ABC",
  },
  {
    id: "HD-2410",
    auctionId: "BID-2410",
    origin: "Hà Nội",
    destination: "Hải Phòng",
    cargoType: "Vật liệu xây dựng (20 Tấn)",
    value: "4,000,000 ₫",
    date: "01/08/2026",
    status: "COMPLETED",
    partner: "Công ty TNHH MTV Xây dựng Phúc Đạt",
  }
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState(initialContracts);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openSignDialog, setOpenSignDialog] = useState(false);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const filteredContracts = React.useMemo(() => {
    return contracts.filter(c => {
      if (filter === "PENDING") return c.status === "PENDING_SIGNATURE";
      if (filter === "ACTIVE") return c.status === "ACTIVE";
      if (filter === "COMPLETED") return c.status === "COMPLETED";
      if (filter === "CANCELLED") return c.status === "CANCELLED";
      return true;
    });
  }, [contracts, filter]);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedContracts = React.useMemo(() => {
    let result = [...filteredContracts];
    result.sort((a, b) => {
      let comparison = 0;
      if (orderBy === "value") {
        // Value format "5,350,000 ₫" -> Parse to int for sort
        const valA = parseInt(a.value.replace(/\D/g, ""), 10) || 0;
        const valB = parseInt(b.value.replace(/\D/g, ""), 10) || 0;
        comparison = valA - valB;
      } else {
        comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      }
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredContracts, order, orderBy]);

  const getStatusConfig = (status) => {
    switch(status) {
      case "PENDING_SIGNATURE":
        return { label: "Chờ ký xác nhận", color: "warning", className: "bg-amber-100 text-amber-700 font-bold" };
      case "ACTIVE":
        return { label: "Đang hoạt động", color: "success", className: "bg-emerald-100 text-emerald-700 font-bold" };
      case "COMPLETED":
        return { label: "Đã hoàn thành", color: "default", className: "bg-slate-200 text-slate-600 font-bold" };
      case "CANCELLED":
        return { label: "Đã hủy", color: "error", className: "bg-rose-100 text-rose-700 font-bold" };
      default:
        return { label: status, color: "default", className: "" };
    }
  };

  const handleOpenSign = (contract) => {
    setSelectedContract(contract);
    setAgreeTerms(false);
    setOpenSignDialog(true);
  };

  const handleOpenDetails = (contract) => {
    setSelectedContract(contract);
    setOpenDetailDrawer(true);
  };

  const handleSign = () => {
    if (selectedContract) {
      setContracts(prev => prev.map(c => 
        c.id === selectedContract.id ? { ...c, status: "ACTIVE" } : c
      ));
    }
    setOpenSignDialog(false);
  };

  return (
    <Box className="animate-fade-in-up pb-10">
      <PageHeader 
        title="Quản lý Hợp đồng" 
        subtitle="Quản lý các hợp đồng vận chuyển điện tử sau khi trúng thầu"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Hợp đồng", path: "/carrier/contracts" }
        ]}
      />

      <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Tabs 
          value={filter} 
          onChange={(e, v) => setFilter(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }
          }}
        >
          <Tab value="ALL" label="Tất cả" />
          <Tab value="PENDING" label="Chờ ký" />
          <Tab value="ACTIVE" label="Đang hoạt động" />
          <Tab value="COMPLETED" label="Đã hoàn thành" />
          <Tab value="CANCELLED" label="Đã hủy" />
        </Tabs>
        
        <ViewModeToggle 
          viewMode={viewMode}
          onChange={setViewMode}
          sx={{ mb: { xs: 2, sm: 0 } }}
        />
      </Box>

      {filteredContracts.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 mb-4">
          <Typography variant="h6" className="text-slate-400">Không tìm thấy hợp đồng nào</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedContracts.map((contract) => (
            <Grid item xs={12} sm={6} md={4} key={contract.id}>
              <CarrierContractItem
                contract={contract}
                onSign={handleOpenSign}
                onViewDetail={handleOpenDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                {[{id: 'id', label: 'Mã HĐ'}, {id: 'route', label: 'Tuyến đường', sortable: false}, {id: 'partner', label: 'Đối tác'}, {id: 'date', label: 'Ngày bốc'}, {id: 'value', label: 'Giá trị'}, {id: 'status', label: 'Trạng thái'}, {id: 'actions', label: 'Thao tác', align: 'right', sortable: false}].map(col => (
                  <TableCell key={col.id} align={col.align || 'left'} className="font-bold text-slate-600">
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleRequestSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedContracts.map((contract) => {
                const statusConfig = getStatusConfig(contract.status);
                return (
                  <TableRow key={contract.id} hover className="transition-colors">
                    <TableCell>
                      <Typography variant="body2" className="font-bold text-[#1B4965]">{contract.id}</Typography>
                      <Typography variant="caption" className="text-slate-500">{contract.auctionId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="font-medium text-slate-800">{contract.origin} &rarr; {contract.destination}</Typography>
                      <Typography variant="caption" className="text-slate-500">{contract.cargoType}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" className="text-slate-700">{contract.partner}</Typography></TableCell>
                    <TableCell><Typography variant="body2" className="text-slate-700">{contract.date}</Typography></TableCell>
                    <TableCell><Typography variant="body2" className="font-bold text-emerald-600">{contract.value}</Typography></TableCell>
                    <TableCell>
                      <Chip 
                        label={statusConfig.label} 
                        size="small" 
                        className={statusConfig.className}
                        sx={{ borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {contract.status === 'PENDING_SIGNATURE' ? (
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleOpenSign(contract)}
                          sx={{ borderRadius: "6px", bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }}
                        >
                          Ký số
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<DescriptionIcon />}
                          onClick={() => handleOpenDetails(contract)}
                          sx={{ borderRadius: "6px", borderColor: "rgba(27,73,101,0.3)", color: "#1B4965" }}
                        >
                          Xem chi tiết
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer Xem Chi tiết */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        title="Chi tiết hợp đồng"
      >
        {selectedContract && (
          <Box className="space-y-4">
            <Typography variant="body1">
              Thông tin chi tiết của hợp đồng <strong>{selectedContract.id}</strong>
            </Typography>
            <Box className="bg-white border border-slate-100 rounded-xl mt-2 overflow-hidden">
              <Box className="px-4 py-2">
                <DetailRow label="Mã phiên đấu giá" value={selectedContract.auctionId} />
                <DetailRow label="Đối tác" value={selectedContract.partner} />
                <DetailRow label="Hàng hóa" value={selectedContract.cargoType} />
                <DetailRow label="Tuyến đường" value={`${selectedContract.origin} - ${selectedContract.destination}`} />
                <DetailRow label="Ngày bốc hàng" value={selectedContract.date} />
                <DetailRow label="Giá trị" value={selectedContract.value} valueColor="text-emerald-600" />
                <DetailRow label="Trạng thái" value={getStatusConfig(selectedContract.status).label} />
              </Box>
            </Box>
            {selectedContract.status === 'PENDING_SIGNATURE' && (
              <Button 
                variant="contained" 
                fullWidth
                startIcon={<VerifiedUserIcon />}
                onClick={() => {
                  setOpenDetailDrawer(false);
                  handleOpenSign(selectedContract);
                }}
                sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#133850" }, mt: 2 }}
              >
                Ký điện tử ngay
              </Button>
            )}
          </Box>
        )}
      </DetailDrawer>

      {/* Dialog Ký điện tử */}
      <Dialog 
        open={openSignDialog} 
        onClose={() => setOpenSignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}
      >
        <DialogTitle className="font-bold text-[#1B4965] border-b border-slate-100 pb-3 flex items-center gap-2">
          <VerifiedUserIcon color="primary" />
          Ký Hợp Đồng Điện Tử
        </DialogTitle>
        <DialogContent className="pt-5">
          {selectedContract && (
            <Box className="mb-4">
              <Typography variant="body1" className="mb-2">
                Bạn đang thực hiện ký xác nhận hợp đồng vận chuyển <strong>{selectedContract.id}</strong>.
              </Typography>
              <Box className="bg-white border border-slate-100 rounded-xl mt-2 overflow-hidden mb-4">
                <Box className="px-4 py-2">
                  <DetailRow label="Đối tác" value={selectedContract.partner} />
                  <DetailRow label="Hàng hóa" value={selectedContract.cargoType} />
                  <DetailRow label="Tuyến đường" value={`${selectedContract.origin} - ${selectedContract.destination}`} />
                  <DetailRow label="Giá trị" value={selectedContract.value} />
                </Box>
              </Box>
              
              <FormControlLabel 
                control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />} 
                label={
                  <Typography variant="body2" className="text-slate-600">
                    Tôi đã đọc, hiểu rõ và đồng ý với các <span className="text-[#1B4965] font-semibold underline cursor-pointer">Điều khoản dịch vụ</span> &amp; <span className="text-[#1B4965] font-semibold underline cursor-pointer">Chính sách vận tải</span> của BackHaulBid. Chữ ký số này có giá trị pháp lý tương đương chữ ký tay.
                  </Typography>
                }
                className="items-start mt-2"
                sx={{ "& .MuiCheckbox-root": { mt: "-8px" } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4 pt-0">
          <Button onClick={() => setOpenSignDialog(false)} color="inherit" sx={{ borderRadius: "8px" }}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSign}
            disabled={!agreeTerms}
            sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" } }}
          >
            Xác nhận Ký số
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
