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
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <PersonIcon className="text-success" />
          <Typography variant="h6" className="!font-bold text-ink !text-base">
            3. Bảng Thống Kê Đội Ngũ Tài Xế Phụ Trách ({drivers.length} Tài xế)
          </Typography>
        </div>
        <span className="text-[0.68rem] font-bold px-3 py-1 rounded-full bg-success-soft text-success border border-success-soft">
          Đủ Điều Kiện Bằng Lái FC / C
        </span>
      </div>

      {/* Drivers Table */}
      <TableContainer component={Paper} elevation={0} className="!rounded-xl border border-line/80 overflow-hidden">
        <Table size="small">
          <TableHead className="bg-surface-sunken">
            <TableRow>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Họ & Tên Tài Xế</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Hạng Bằng Lái</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Hồ Sơ An Toàn</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3 text-right">Số Điện Thoại Trực Tiếp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.id} className="hover:bg-surface-sunken/70 transition-colors">
                <TableCell className="!py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar
                        src={d.avatarUrl}
                        alt={d.name}
                        className="!w-9 !h-9 !text-xs !font-black bg-[var(--color-brand)] !text-white shadow-sm"
                      >
                        {getDriverInitials(d.name)}
                      </Avatar>
                    </div>
                    <div>
                      <strong className="text-ink text-xs font-bold block">{d.name}</strong>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="bg-success-soft text-success font-extrabold text-[0.68rem] px-2.5 py-0.5 rounded border border-success-soft inline-block">
                    {d.license}
                  </span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className={`${d.safetyRecord === "Đã xác thực" ? "text-success" : "text-warning"} font-extrabold text-xs inline-flex items-center gap-1`}>
                    {d.safetyRecord === "Đã xác thực" && <CheckCircleIcon className="!text-[0.8rem]" />} {d.safetyRecord}
                  </span>
                </TableCell>
                <TableCell className="!py-3 text-right">
                  <a
                    href={`tel:${d.phone}`}
                    className="text-success font-bold font-mono text-xs py-1 px-3 rounded-lg border border-success-soft bg-white hover:bg-success-soft transition-colors inline-flex items-center gap-1 shadow-2xs"
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
