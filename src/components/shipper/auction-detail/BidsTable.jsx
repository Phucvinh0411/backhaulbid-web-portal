"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import Rating from "@mui/material/Rating";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { formatCurrency } from "./mockData";

export default function BidsTable({
  bids = [],
  shipmentStatus,
  onOpenOtpDialog,
  onOpenCarrierModal,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("bidAmount");

  const [columnsList, setColumnsList] = useState([
    { id: "carrierName", label: "Nhà xe", align: "left" },
    { id: "rating", label: "Đánh giá tín nhiệm", align: "center" },
    { id: "bidAmount", label: "Giá thầu đề xuất", align: "right" },
    { id: "time", label: "Thời điểm đặt", align: "right", sortable: false },
    { id: "status", label: "Trạng thái", align: "center", sortable: false },
    { id: "actions", label: "Thao tác", align: "center", sortable: false }
  ]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("colIndex", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    const dragIndex = Number(e.dataTransfer.getData("colIndex"));
    if (isNaN(dragIndex) || dragIndex === index) return;
    const updated = [...columnsList];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setColumnsList(updated);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedBids = useMemo(() => {
    let result = [...bids];
    result.sort((a, b) => {
      let comparison = 0;
      if (orderBy === "bidAmount") {
        comparison = a.bidAmount - b.bidAmount;
      } else if (orderBy === "rating") {
        comparison = a.rating - b.rating;
      } else {
        comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      }
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [bids, order, orderBy]);

  return (
    <Card
      className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden"
      sx={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
      }}
    >
      <Box className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <Typography variant="h6" className="!font-bold text-slate-700">
            Danh sách báo giá tham gia thầu
          </Typography>
          <Typography variant="caption" className="text-slate-400">
            Cập nhật trực tiếp thời gian thực từ các nhà xe
          </Typography>
        </div>
        <Chip
          label={`${bids.length} nhà xe báo giá`}
          size="small"
          className="!font-bold !text-[0.72rem] !px-2.5 !py-1 rounded-full bg-slate-100 text-slate-600"
        />
      </Box>

      <TableContainer component={Paper} className="!shadow-none !bg-transparent">
        <Table sx={{ minWidth: 650 }}>
          <TableHead className="bg-slate-50/50">
            <TableRow>
              {columnsList.map((col, idx) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100 select-none hover:bg-slate-100/80 transition-colors cursor-move"
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleRequestSort(col.id)}
                      className="!font-bold hover:!text-slate-700"
                      sx={{ '& .MuiTableSortLabel-icon': { color: '#64748B !important' } }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnsList.length} align="center" className="!py-12 !border-none">
                  <Typography variant="body2" className="text-slate-400 font-medium">
                    Chưa có nhà xe nào báo giá cho lô hàng này.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedBids.map((bid) => (
                <TableRow
                  key={bid.id}
                  className={`transition-colors ${
                    bid.isLowest
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  {columnsList.map((col) => {
                    if (col.id === "carrierName") {
                      return (
                        <TableCell key={col.id} className="!font-bold !text-slate-700 !border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span 
                                onClick={() => onOpenCarrierModal(bid)}
                                className="hover:text-[#1B4965] hover:underline cursor-pointer transition-colors"
                              >
                                {bid.carrierName}
                              </span>
                              <span className="text-[0.68rem] text-slate-400 font-medium flex items-center gap-1">
                                <VerifiedIcon className="!text-[0.7rem] text-sky-500" /> B2B Verified Member
                              </span>
                            </div>
                            <IconButton 
                              size="small" 
                              onClick={() => onOpenCarrierModal(bid)} 
                              className="!p-0.5 text-slate-400 hover:text-[#1B4965]"
                              title="Xem hồ sơ nhà xe"
                            >
                              <InfoIcon className="!text-[1rem]" />
                            </IconButton>
                          </div>
                        </TableCell>
                      );
                    }
                    if (col.id === "rating") {
                      return (
                        <TableCell key={col.id} align="center" className="!border-slate-100">
                          <div className="flex items-center justify-center gap-1.5">
                            <Rating
                              name="read-only"
                              value={bid.rating}
                              precision={0.1}
                              readOnly
                              size="small"
                              emptyIcon={<StarIcon className="text-slate-200" fontSize="inherit" />}
                            />
                            <span className="text-xs font-bold text-slate-600">{bid.rating}</span>
                            <span className="text-[0.7rem] text-slate-400">({bid.ratingCount})</span>
                          </div>
                        </TableCell>
                      );
                    }
                    if (col.id === "bidAmount") {
                      return (
                        <TableCell
                          key={col.id}
                          align="right"
                          className={`!font-mono !font-bold !border-slate-100 ${
                            bid.isLowest ? "!text-emerald-600 !text-base" : "!text-slate-600"
                          }`}
                        >
                          {formatCurrency(bid.bidAmount)}
                        </TableCell>
                      );
                    }
                    if (col.id === "time") {
                      return (
                        <TableCell key={col.id} align="right" className="!text-slate-500 !text-xs !border-slate-100">
                          {bid.time}
                        </TableCell>
                      );
                    }
                    if (col.id === "status") {
                      return (
                        <TableCell key={col.id} align="center" className="!border-slate-100">
                          {bid.isLowest ? (
                            <Chip
                              label="Thấp nhất"
                              size="small"
                              color="success"
                              className="!font-extrabold !text-[0.68rem] bg-emerald-500 text-white rounded-md"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">-</span>
                          )}
                        </TableCell>
                      );
                    }
                    if (col.id === "actions") {
                      return (
                        <TableCell key={col.id} align="center" className="!border-slate-100">
                          {shipmentStatus === "active_bids" ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => onOpenOtpDialog(bid)}
                              className="!bg-[#1B4965] hover:!bg-[#0D2B3E] !text-white !font-bold !text-[0.7rem] !capitalize !rounded-lg !px-3"
                            >
                              Chọn trúng thầu
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold italic">Không khả dụng</span>
                          )}
                        </TableCell>
                      );
                    }
                    return null;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
