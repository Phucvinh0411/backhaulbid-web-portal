"use client";

import React, { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PinDropIcon from "@mui/icons-material/PinDrop";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import CarrierTransportItem from "@/components/carrier/CarrierTransportItem";

const mockTransports = [
  {
    id: "TRP-9001",
    auctionId: "BID-2451",
    route: "Hà Nội - Đà Nẵng",
    vehicle: "29H-123.45",
    driver: null,
    pin: null,
    status: "WAITING_DRIVER", // Chờ điều phối
  },
  {
    id: "TRP-9002",
    auctionId: "BID-2420",
    route: "Hải Phòng - Hà Nội",
    vehicle: "30F-987.65",
    driver: "Lê Văn B",
    pin: "482019",
    status: "IN_TRANSIT", // Đang giao
  },
  {
    id: "TRP-8990",
    auctionId: "BID-2310",
    route: "Hồ Chí Minh - Cần Thơ",
    vehicle: "51C-444.22",
    driver: "Trần Văn C",
    pin: "110293",
    status: "COMPLETED", // Hoàn thành
  },
];

const mockDrivers = [
  { id: "D1", name: "Nguyễn Văn A", phone: "0901234567" },
  { id: "D2", name: "Lê Văn B", phone: "0912345678" },
];

export default function TransportsPage() {
  const [viewMode, setViewMode] = useState("CARD");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedTransports = React.useMemo(() => {
    let result = [...mockTransports];
    result.sort((a, b) => {
      let comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [order, orderBy]);

  const handleOpenAssign = (transport) => {
    setSelectedTransport(transport);
    setSelectedDriver("");
    setGeneratedPin("");
    setOpenDialog(true);
  };

  const handleOpenDetails = (transport) => {
    setSelectedTransport(transport);
    setOpenDetailsModal(true);
  };

  const handleGeneratePin = () => {
    // Mock PIN generation
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(pin);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "WAITING_DRIVER":
        return <Chip label="Chờ điều phối" color="warning" size="small" />;
      case "IN_TRANSIT":
        return <Chip label="Đang vận chuyển" color="info" size="small" />;
      case "COMPLETED":
        return <Chip label="Hoàn thành" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Quản lý Vận chuyển" 
        subtitle="Điều phối tài xế, cấp mã PIN và theo dõi các chuyến hàng"
        action={
          <ViewModeToggle 
            viewMode={viewMode}
            onChange={setViewMode}
          />
        }
      />

      {viewMode === "TABLE" ? (
        <Card className="glass mt-6">
          <TableContainer>
            <Table aria-label="transports table">
              <TableHead sx={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}>
                <TableRow>
                  {[{id: 'id', label: 'Mã Chuyến'}, {id: 'route', label: 'Tuyến đường'}, {id: 'vehicle', label: 'Phương tiện'}, {id: 'driver', label: 'Tài xế'}, {id: 'pin', label: 'Mã PIN'}, {id: 'status', label: 'Trạng thái'}, {id: 'actions', label: 'Thao tác', align: 'right', sortable: false}].map(col => (
                    <TableCell key={col.id} align={col.align || 'left'} className="!font-bold">
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
                {sortedTransports.map((row) => (
                  <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell component="th" scope="row" className="font-semibold text-[#1B4965]">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.route}</TableCell>
                    <TableCell>{row.vehicle}</TableCell>
                    <TableCell>{row.driver || <Typography variant="caption" className="text-slate-400 italic">Chưa gán</Typography>}</TableCell>
                    <TableCell>
                      {row.pin ? (
                        <Box className="flex items-center gap-1">
                          <Typography variant="body2" className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {row.pin}
                          </Typography>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell align="right">
                      <Box className="flex justify-end gap-2">
                        <Button size="small" variant="outlined" color="inherit" startIcon={<InfoOutlinedIcon />} onClick={() => handleOpenDetails(row)}>
                          Chi tiết
                        </Button>
                        {row.status === "WAITING_DRIVER" ? (
                          <Button size="small" variant="contained" color="primary" onClick={() => handleOpenAssign(row)}>
                            Điều phối
                          </Button>
                        ) : (
                          <Button size="small" variant="outlined" startIcon={<PinDropIcon />} component={Link} href={`/carrier/transports/${row.id}`}>
                            Theo dõi
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Grid container spacing={3} className="mt-2">
          {sortedTransports.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.id}>
              <CarrierTransportItem
                transport={row}
                onAssign={handleOpenAssign}
                onViewDetail={handleOpenDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Assign Driver Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-2xl" }}>
        <DialogTitle className="text-[#1B4965] font-bold">
          Điều phối chuyến {selectedTransport?.id}
        </DialogTitle>
        <DialogContent dividers>
          <Box className="space-y-4 pt-2">
            <Typography variant="body2" className="text-slate-600">
              Chọn tài xế thực hiện chuyến hàng này. Sau khi xác nhận, hệ thống sẽ tạo một Mã PIN duy nhất cho tài xế để xác nhận nhận hàng và giao hàng.
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Chọn tài xế"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              {mockDrivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} - {d.phone}
                </MenuItem>
              ))}
            </TextField>

            {selectedDriver && !generatedPin && (
              <Button variant="outlined" onClick={handleGeneratePin} fullWidth>
                Khởi tạo Mã PIN
              </Button>
            )}

            {generatedPin && (
              <Box className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <Typography variant="caption" className="text-emerald-700 font-semibold uppercase tracking-wider block mb-2">
                  Mã PIN xác thực của tài xế
                </Typography>
                <Box className="flex items-center justify-center gap-2">
                  <Typography variant="h4" className="font-mono font-black text-emerald-800 tracking-widest">
                    {generatedPin}
                  </Typography>
                  <IconButton size="small" color="success">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" className="text-emerald-600 mt-2 block">
                  Vui lòng gửi mã này cho tài xế hoặc họ có thể xem trên ứng dụng của tài xế.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setOpenDialog(false)} color="inherit">Hủy</Button>
          <Button variant="contained" disabled={!generatedPin} onClick={() => setOpenDialog(false)}>
            Lưu điều phối
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết đơn hàng vận chuyển */}
      <DetailDrawer 
        open={openDetailsModal} 
        onClose={() => setOpenDetailsModal(false)} 
        title={
          <Box className="flex items-center justify-between w-full pr-4">
            <span>Chi tiết Vận chuyển {selectedTransport?.id}</span>
            {selectedTransport && getStatusChip(selectedTransport.status)}
          </Box>
        }
      >
        {selectedTransport && (
          <Box className="space-y-4">
            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase">Thông tin Đấu giá</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Mã phiên đấu giá</Typography>
                <Typography variant="body1" className="font-bold text-[#1B4965]">{selectedTransport.auctionId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Tuyến đường</Typography>
                <Typography variant="body1" className="font-bold">{selectedTransport.route}</Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />
            
            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase">Thông tin Hàng hóa</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Loại hàng</Typography>
                <Typography variant="body1" className="font-medium">Hàng tổng hợp</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Trọng lượng</Typography>
                <Typography variant="body1" className="font-medium">10 Tấn</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" className="text-slate-500">Ngày bốc hàng dự kiến</Typography>
                <Typography variant="body1" className="font-medium text-emerald-600">15/08/2026</Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography variant="subtitle2" className="text-slate-500 font-bold uppercase">Điều phối</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Phương tiện (Đã đăng ký)</Typography>
                <Typography variant="body1" className="font-bold text-[#1B4965]">{selectedTransport.vehicle}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Tài xế phụ trách</Typography>
                <Typography variant="body1" className="font-medium">
                  {selectedTransport.driver || <span className="text-amber-600 italic">Chưa điều phối</span>}
                </Typography>
              </Grid>
            </Grid>
            
            <Box className="mt-6 flex justify-end">
              <Button onClick={() => setOpenDetailsModal(false)} variant="contained" fullWidth sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
                Đóng
              </Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
