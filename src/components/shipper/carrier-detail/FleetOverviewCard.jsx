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
import { RoundedBox } from "@/components/common";

export default function FleetOverviewCard({ fleet = [] }) {
  return (
    <RoundedBox className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <LocalShippingIcon className="text-[var(--color-brand)]" />
          <Typography variant="h6" className="!font-bold text-ink !text-base">
            2. Bảng Thống Kê Đội Xe Vận Tải ({fleet.length} Phương tiện)
          </Typography>
        </div>
      </div>

      {/* Fleet Table */}
      <TableContainer component={Paper} elevation={0} className="!rounded-xl border border-line/80 overflow-hidden">
        <Table size="small">
          <TableHead className="bg-surface-sunken">
            <TableRow>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Biển Số Xe (Biển Vàng)</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Loại Xe & Dòng Xe</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3">Tải Trọng</TableCell>
              <TableCell className="!font-extrabold !text-ink-muted !text-xs !py-3 text-right">Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fleet.map((v) => (
              <TableRow key={v.id} className="hover:bg-surface-sunken/70 transition-colors">
                <TableCell className="!py-3">
                  <span className="bg-warning-soft text-warning font-mono font-black text-xs px-2.5 py-1 rounded border border-warning-soft inline-block shadow-2xs">
                    {v.plate}
                  </span>
                </TableCell>
                <TableCell className="!py-3">
                  <strong className="text-ink text-xs font-bold block">{v.type}</strong>
                  <span className="text-[0.68rem] text-ink-muted font-medium">{v.brand}</span>
                </TableCell>
                <TableCell className="!py-3">
                  <span className="text-ink font-extrabold text-xs">{v.payload}</span>
                </TableCell>
                
                <TableCell className="!py-3 text-right">
                  <span className="text-xs font-bold text-success bg-success-soft/60 px-2.5 py-1 rounded-lg border border-success-soft/60 inline-block">
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
