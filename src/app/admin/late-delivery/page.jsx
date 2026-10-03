"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { contractApi } from "@/services/contractApi";

const rowsFrom = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

export default function AdminLateDeliveryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(rowsFrom(await contractApi.listDelaySettlementsForAdmin()));
      setError("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không thể tải các khoản xử lý giao trễ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <Box className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h4" className="!font-black">Xử lý chuyến giao trễ</Typography>
          <Typography className="!mt-1 text-slate-500">Xem các bậc trễ, tiền bồi thường, điểm uy tín và trạng thái xử lý của mọi chuyến.</Typography>
        </div>
        <Button variant="outlined" onClick={load} disabled={loading}>Làm mới</Button>
      </div>
      {error && <Alert severity="error" className="!mb-4">{error}</Alert>}
      {loading ? (
        <Box className="flex min-h-48 items-center justify-center"><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info">Chưa có dữ liệu xử lý giao trễ.</Alert>
      ) : (
        <Paper variant="outlined" className="overflow-x-auto !rounded-2xl">
          <table className="w-full min-w-[950px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>{["Chuyến / phiên", "Chủ hàng", "Chủ xe", "Mức trễ", "Bồi thường", "Điểm uy tín", "Trạng thái xử lý"].map((label) => <th key={label} className="p-4 font-bold">{label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="p-4"><div className="font-bold">{String(row.tripId).slice(0, 8)}</div><div className="text-xs text-slate-500">Phiên {row.auctionId || "—"}</div><div className="text-xs">Bậc {row.tier} · {row.lateMinutes} phút</div></td>
                  <td className="p-4 font-mono text-xs">{row.shipperId}</td>
                  <td className="p-4 font-mono text-xs">{row.carrierId}</td>
                  <td className="p-4">{row.cumulativePenaltyPercent}% tiền cọc</td>
                  <td className="p-4"><div>{money(row.totalCompensationAmount)} tổng mức</div><div className="text-xs text-slate-500">+{money(row.incrementalCompensationAmount)} ở bậc này</div></td>
                  <td className="p-4">−{row.pointsDeducted} điểm</td>
                  <td className="p-4"><div className="flex flex-wrap gap-1"><Chip size="small" label={`Ví: ${row.walletStatus}`} color={row.walletStatus === "COMPLETED" ? "success" : "warning"} /><Chip size="small" label={`Uy tín: ${row.reputationStatus}`} color={row.reputationStatus === "COMPLETED" ? "success" : "warning"} /><Chip size="small" label={`Thông báo: ${row.notificationStatus}`} color={row.notificationStatus === "COMPLETED" ? "success" : "warning"} /></div>{row.lastError && <div className="mt-2 max-w-sm text-xs text-rose-700">{row.lastError}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}
    </Box>
  );
}
