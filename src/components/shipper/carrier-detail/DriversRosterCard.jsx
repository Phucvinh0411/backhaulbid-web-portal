"use client";

import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import { RoundedBox } from "@/components/common";

const getDriverInitials = (name) => {
  if (!name) return "TX";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function DriversRosterCard({ drivers = [] }) {
  return (
    <RoundedBox className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <PersonIcon className="text-emerald-600" />
          <Typography variant="h6" className="!font-bold text-slate-800 !text-base">
            3. Bảng Thống Kê Đội Ngũ Tài Xế Phụ Trách ({drivers.length} Tài xế)
          </Typography>
        </div>
        <span className="text-[0.68rem] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Đủ Điều Kiện Bằng Lái FC / C
        </span>
      </div>

      {/* Drivers Table */}
      <TableContainer component={Paper} elevation={0} className="!rounded-2xl border border-slate-200/80 overflow-hidden">
        <Table size="small">
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Họ & Tên Tài Xế</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Năm Sinh</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Hạng Bằng Lái</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Kinh Nghiệm Chạy Xe</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3">Hồ Sơ An Toàn</TableCell>
              <TableCell className="!font-extrabold !text-slate-600 !text-xs !py-3 text-right">Số Điện Thoại Trực Tiếp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.id} className="hover:bg-slate-50/70 transition-colors">
                <TableCell className="!py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar
                        src={d.avatarUrl}
                        alt={d.name}
                        className="!w-9 !h-9 !text-xs !font-black !bg-gradient-to-br !from-[#1B4965] !to-[#0D2B3E] !text-white !border-2 !border-emerald-400 shadow-sm"
                      >
                        {getDriverInitials(d.name)}
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <strong className="text-slate-800 text-xs font-bold block">{d.name}</strong>
                      <span className="text-[0.65rem] text-slate-400 font-medium">Tài xế xác thực</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-slate-700 font-semibold text-xs">{d.birthYear}</span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="bg-emerald-50 text-emerald-800 font-extrabold text-[0.68rem] px-2.5 py-0.5 rounded border border-emerald-200 inline-block">
                    {d.license}
                  </span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-slate-700 font-medium text-xs">{d.experience}</span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-emerald-700 font-extrabold text-xs inline-flex items-center gap-1">
                    <CheckCircleIcon className="!text-[0.8rem]" /> {d.safetyRecord}
                  </span>
                </TableCell>
                <TableCell className="!py-3 text-right">
                  <a
                    href={`tel:${d.phone}`}
                    className="text-emerald-700 font-bold font-mono text-xs py-1 px-3 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <PhoneIcon className="!text-[0.8rem]" /> {d.phone}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </RoundedBox>
  );
}
