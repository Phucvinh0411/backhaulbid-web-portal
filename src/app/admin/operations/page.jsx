"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { PageHeader } from "@/components/common";

const operationsData = [
  { id: "BID-2454", route: "Hà Nội → Hải Phòng", shipper: "Hoàng Phát Logistics", status: "Chờ duyệt", price: "2.400.000 đ", date: "02/07/2026", participants: 0 },
  { id: "BID-2455", route: "TP.HCM → Bình Dương", shipper: "Kho Lạnh Nam Việt", status: "Đang diễn ra", price: "1.250.000 đ", date: "02/07/2026", participants: 5 },
  { id: "BID-2456", route: "Đà Nẵng → Quảng Nam", shipper: "CP XNK Việt Tín", status: "Hoàn thành", price: "3.500.000 đ", date: "01/07/2026", participants: 12 },
  { id: "BID-2457", route: "Hà Nội → Bắc Ninh", shipper: "Hoàng Phát Logistics", status: "Vi phạm", price: "1.800.000 đ", date: "01/07/2026", participants: 3 },
  { id: "BID-2458", route: "TP.HCM → Đồng Nai", shipper: "Kho Lạnh Nam Việt", status: "Chờ duyệt", price: "1.500.000 đ", date: "30/06/2026", participants: 0 },
  { id: "BID-2459", route: "Hải Phòng → Quảng Ninh", shipper: "CP XNK Việt Tín", status: "Đang diễn ra", price: "2.100.000 đ", date: "30/06/2026", participants: 8 },
  { id: "BID-2460", route: "Đà Nẵng → Huế", shipper: "Hoàng Phát Logistics", status: "Hoàn thành", price: "1.900.000 đ", date: "29/06/2026", participants: 4 },
  { id: "BID-2461", route: "TP.HCM → Vũng Tàu", shipper: "Kho Lạnh Nam Việt", status: "Chờ duyệt", price: "2.800.000 đ", date: "29/06/2026", participants: 0 },
  { id: "BID-2462", route: "Hà Nội → Vĩnh Phúc", shipper: "CP XNK Việt Tín", status: "Đang diễn ra", price: "1.600.000 đ", date: "28/06/2026", participants: 6 },
  { id: "BID-2463", route: "Hải Phòng → Nam Định", shipper: "Hoàng Phát Logistics", status: "Hoàn thành", price: "2.200.000 đ", date: "28/06/2026", participants: 9 },
  { id: "BID-2464", route: "Đồng Nai → Vũng Tàu", shipper: "Kho Lạnh Nam Việt", status: "Vi phạm", price: "1.100.000 đ", date: "27/06/2026", participants: 2 },
];

export default function AdminOperationsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ duyệt": return "warning";
      case "Đang diễn ra": return "info";
      case "Hoàn thành": return "success";
      case "Vi phạm": return "error";
      default: return "default";
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Giám sát Đấu giá & Giao dịch" 
        subtitle="Quản lý và giám sát các phiên đấu giá theo thời gian thực"
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/operations" },
          { label: "Giám sát Đấu giá" },
        ]}
      />

      <Card 
        className="glass mt-6"
        sx={{
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
        }}
      >
        <CardContent className="!p-0">
          <Box className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <div>
              <Typography variant="h6" className="!font-bold text-slate-700 leading-none mb-1">
                Danh sách Phiên thầu & Giao dịch
              </Typography>
            </div>
          </Box>
          <TableContainer>
            <Table aria-label="operations table">
              <TableHead sx={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}>
                <TableRow>
                  <TableCell className="!font-bold">Mã Phiên</TableCell>
                  <TableCell className="!font-bold">Tuyến đường</TableCell>
                  <TableCell className="!font-bold">Người đăng</TableCell>
                  <TableCell className="!font-bold">Người tham gia</TableCell>
                  <TableCell className="!font-bold">Giá hiện tại</TableCell>
                  <TableCell className="!font-bold">Ngày tạo</TableCell>
                  <TableCell className="!font-bold">Trạng thái</TableCell>
                  <TableCell className="!font-bold text-right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operationsData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow 
                      key={row.id} 
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 }, transition: "all 0.2s" }}
                    >
                      <TableCell component="th" scope="row" className="font-semibold text-[#1B4965]">
                        {row.id}
                      </TableCell>
                      <TableCell>{row.route}</TableCell>
                      <TableCell>{row.shipper}</TableCell>
                      <TableCell>
                        <Typography variant="body2" className="font-bold">{row.participants} xe</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="text-emerald-600 font-bold">{row.price}</Typography>
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          color={getStatusColor(row.status)} 
                          size="small" 
                          className={row.status === "Đang diễn ra" ? "animate-pulse-glow !font-semibold" : "!font-semibold"}
                          variant={row.status === "Đang diễn ra" ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" title="Xem chi tiết">
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        {row.status === "Đang diễn ra" && (
                          <IconButton size="small" color="error" title="Dừng phiên">
                            <StopCircleIcon fontSize="small" />
                          </IconButton>
                        )}
                        {(row.status === "Vi phạm" || row.status === "Chờ duyệt") && (
                          <IconButton size="small" color="error" title="Khóa/Từ chối">
                            <BlockOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={operationsData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
            sx={{ borderTop: "1px solid rgba(226, 232, 240, 0.5)" }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
