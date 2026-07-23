"use client";

import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import GpsFixedIcon from "@mui/icons-material/GpsFixedOutlined";
import AspectRatioIcon from "@mui/icons-material/AspectRatioOutlined";
import { RoundedBox } from "@/components/common";

export default function FleetOverviewCard({ fleet = [] }) {
  return (
    <RoundedBox className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <LocalShippingIcon className="text-[#1B4965]" />
          <Typography variant="h6" className="!font-bold text-slate-800 !text-base">
            2. Bảng Thống Kê Đội Xe Vận Tải ({fleet.length} Phương tiện)
          </Typography>
        </div>
      </div>

      {/* Fleet Table */}
      <TableContainer component={Paper} elevation={0} className="!rounded-2xl border border-slate-200/80 overflow-hidden">
        <Table size="small">
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Biển Số Xe (Biển Vàng)</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Loại Xe & Dòng Xe</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Kích Thước Thùng (D x R x C)</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Thể Tích</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Tải Trọng</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3 text-right">Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fleet.map((v) => (
              <TableRow key={v.id} className="hover:bg-slate-50/70 transition-colors">
                <TableCell className="!py-3">
                  <span className="bg-amber-100 text-amber-900 font-mono font-black text-xs px-2.5 py-1 rounded border border-amber-200 inline-block shadow-2xs">
                    {v.plate}
                  </span>
                </TableCell>
                <TableCell className="!py-3">
                  <strong className="text-slate-800 text-xs font-bold block">{v.type}</strong>
                  <span className="text-[0.68rem] text-slate-500 font-medium">{v.brand}</span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="font-mono text-[#1B4965] font-bold text-xs flex items-center gap-1">
                     {v.dims}
                  </span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-slate-700 font-semibold text-xs">{v.volume}</span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-slate-800 font-extrabold text-xs">{v.payload}</span>
                </TableCell>
                
                <TableCell className="!py-3 text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
                    {v.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </RoundedBox>
  );
}
