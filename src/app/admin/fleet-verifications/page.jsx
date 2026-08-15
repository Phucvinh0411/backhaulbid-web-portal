"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/common";
import {
  getAdminDriverReviews,
  getAdminVehicleReviews,
  reviewAdminDriver,
  reviewAdminVehicle,
} from "@/services/fleetApi";

const statusLabel = {
  PENDING: "Chờ duyệt",
  VERIFIED: "Đã duyệt",
  REJECTED: "Từ chối",
  INACTIVE: "Vô hiệu hóa",
};

export default function FleetVerificationsPage() {
  const [tab, setTab] = useState("vehicles");
  const [status, setStatus] = useState("PENDING");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const data = tab === "vehicles"
        ? await getAdminVehicleReviews(status)
        : await getAdminDriverReviews(status === "INACTIVE" ? "EXPIRED" : status);
      setRows(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải hồ sơ đội xe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [tab, status]);

  const openReview = (row, decision) => {
    setReason("");
    setReviewing({ row, decision });
  };

  const openDetail = (row) => setDetailRow(row);

  const submitReview = async () => {
    if (!reviewing) return;
    if (reviewing.decision === "REJECT" && !reason.trim()) {
      setError("Cần nhập lý do từ chối.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const review = { decision: reviewing.decision, reason: reason.trim() || null };
      if (tab === "vehicles") await reviewAdminVehicle(reviewing.row.id, review);
      else await reviewAdminDriver(reviewing.row.id, review);
      setReviewing(null);
      await loadReviews();
    } catch (reviewError) {
      setError(reviewError?.response?.data?.message || "Không thể cập nhật kết quả duyệt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader
        title="Duyệt đội xe"
        subtitle="Kiểm tra và phê duyệt xe, tài xế trước khi tham gia vận chuyển"
        breadcrumbs={[{ label: "Tổng quan", path: "/admin" }, { label: "Duyệt đội xe", path: "/admin/fleet-verifications" }]}
      />

      {error && <Box role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</Box>}

      <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200">
        <Tabs value={tab} onChange={(_, value) => setTab(value)} className="border-b border-slate-200 px-3">
          <Tab value="vehicles" label="Phương tiện" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab value="drivers" label="Tài xế" sx={{ textTransform: "none", fontWeight: 700 }} />
        </Tabs>

        <Box className="flex flex-wrap items-center gap-2 p-4">
          {['PENDING', 'VERIFIED', 'REJECTED'].map((value) => (
            <Button key={value} size="small" variant={status === value ? "contained" : "outlined"} onClick={() => setStatus(value)}>
              {statusLabel[value]}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Box role="status" className="p-8 text-center text-slate-500">Đang tải hồ sơ...</Box>
        ) : rows.length === 0 ? (
          <Box role="status" className="p-8 text-center text-slate-500">Không có hồ sơ phù hợp.</Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead className="bg-slate-50">
                <TableRow>
                  <TableCell className="font-bold">Đối tượng</TableCell>
                  <TableCell className="font-bold">Chủ xe</TableCell>
                  <TableCell className="font-bold">Thông tin</TableCell>
                  <TableCell className="font-bold">Trạng thái</TableCell>
                  <TableCell align="right" className="font-bold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography className="font-semibold">{tab === "vehicles" ? row.licensePlate : row.fullName}</Typography>
                      <Typography variant="caption" className="font-mono text-slate-500">{row.id}</Typography>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tab === "vehicles" ? row.carrierId : "—"}</TableCell>
                    <TableCell>
                      {tab === "vehicles" ? `${row.vehicleType} · ${row.payloadCapacity} tấn` : `${row.phone} · GPLX ${row.licenseNumber}`}
                    </TableCell>
                    <TableCell><Chip size="small" label={statusLabel[row.status] || row.status} /></TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="text" onClick={() => openDetail(row)}>Xem ho so</Button>
                      {row.status === "PENDING" && (
                        <Box className="flex justify-end gap-2">
                          <Button size="small" variant="contained" onClick={() => openReview(row, "APPROVE")}>Duyệt</Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => openReview(row, "REJECT")}>Từ chối</Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!detailRow} onClose={() => setDetailRow(null)} fullWidth maxWidth="sm">
        <DialogTitle>Hồ sơ {tab === "vehicles" ? "xe" : "tài xế"}</DialogTitle>
        <DialogContent className="space-y-3">
          {detailRow && <>
            <Typography variant="body2"><strong>{tab === "vehicles" ? "Biển số" : "Họ tên"}:</strong> {tab === "vehicles" ? detailRow.licensePlate : detailRow.fullName}</Typography>
            <Typography variant="body2"><strong>{tab === "vehicles" ? "Chủ xe" : "Số điện thoại"}:</strong> {tab === "vehicles" ? detailRow.carrierId : detailRow.phone}</Typography>
            {tab === "vehicles" ? (
              <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[{ label: "Cà vẹt / đăng ký", url: detailRow.registrationDocumentUrl }, { label: "Đăng kiểm", url: detailRow.inspectionDocumentUrl }].map((document) => <Box key={document.label} className="rounded-lg border border-slate-200 p-3"><Typography variant="caption" className="block text-slate-500">{document.label}</Typography>{document.url ? <Button component="a" href={document.url} target="_blank" rel="noreferrer" size="small">Mở tài liệu</Button> : <Typography variant="body2" className="text-red-600">Thiếu tài liệu</Typography>}</Box>)}
              </Box>
            ) : <Box className="rounded-lg border border-slate-200 p-3"><Typography variant="caption" className="block text-slate-500">Ảnh GPLX</Typography>{detailRow.licenseImageUrl ? <Button component="a" href={detailRow.licenseImageUrl} target="_blank" rel="noreferrer" size="small">Mở tài liệu</Button> : <Typography variant="body2" className="text-red-600">Thiếu tài liệu</Typography>}</Box>}
          </>}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailRow(null)}>Đóng</Button></DialogActions>
      </Dialog>

      <Dialog open={!!reviewing} onClose={() => !saving && setReviewing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{reviewing?.decision === "APPROVE" ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}</DialogTitle>
        <DialogContent>
          {reviewing?.decision === "REJECT" && (
            <TextField autoFocus fullWidth multiline minRows={3} label="Lý do từ chối" value={reason} onChange={(event) => setReason(event.target.value)} sx={{ mt: 1 }} />
          )}
          {reviewing?.decision === "APPROVE" && <Typography className="text-slate-600">Xác nhận hồ sơ này đã hợp lệ và cho phép sử dụng trong hệ thống?</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewing(null)} disabled={saving}>Hủy</Button>
          <Button onClick={submitReview} disabled={saving} variant="contained" color={reviewing?.decision === "REJECT" ? "error" : "primary"}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
