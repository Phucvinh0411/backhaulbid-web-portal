"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";

import {
  AdminPageHeader,
  AdminDialog,
  AdminTableContainer,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminSelectField,
  AdminStatusChip,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { formatDateTime, formatMoney } from "@/lib/format";
import { formatIsoDateVi } from "@/lib/cargoLiabilityPresentation";
import {
  fetchCargoLiabilityCertificate,
  loadCargoLiabilityReviews,
  reviewCargoLiability,
} from "@/services/cargoLiabilityApi";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Đang chờ duyệt" },
  { value: "VERIFIED", label: "Đã xác minh" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "EXPIRED", label: "Đã hết hạn" },
];

const STATUS_CHIPS = {
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  VERIFIED: { label: "Đã xác minh", tone: "success" },
  REJECTED: { label: "Đã từ chối", tone: "danger" },
  EXPIRED: { label: "Đã hết hạn", tone: "neutral" },
};

function StatusChip({ status }) {
  const chip = STATUS_CHIPS[status] ?? { label: status || "Không rõ", tone: "neutral" };
  return <AdminStatusChip label={chip.label} tone={chip.tone} />;
}

export default function AdminCargoLiabilityPage() {
  const [status, setStatus] = useState("PENDING");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await loadCargoLiabilityReviews({ status, page, pageSize });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotalItems(Number(data?.totalItems) || 0);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Không thể tải danh sách chứng từ bảo hiểm.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const review = async (decision) => {
    if (decision === "REJECT" && !rejectionReason.trim()) {
      setErrorMessage("Vui lòng nhập lý do từ chối chứng từ.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      await reviewCargoLiability(selected.id, {
        decision,
        rejectionReason: decision === "REJECT" ? rejectionReason.trim() : undefined,
      });
      setSelected(null);
      setRejectionReason("");
      await loadRows();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Không thể cập nhật kết quả xét duyệt.");
    } finally {
      setSubmitting(false);
    }
  };

  /** The certificate is private: fetched with the admin's session, then shown from a short-lived local URL. */
  const viewCertificate = async () => {
    setErrorMessage("");
    try {
      const blob = await fetchCargoLiabilityCertificate(selected.id);
      const objectUrl = URL.createObjectURL(blob);
      const opened = window.open(objectUrl, "_blank");
      if (!opened) {
        setErrorMessage("Trình duyệt đã chặn cửa sổ mới. Hãy cho phép cửa sổ bật lên để xem chứng từ.");
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Không thể tải chứng từ bảo hiểm.");
    }
  };

  const isPending = selected?.status === "PENDING";

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Xét duyệt bảo hiểm hàng hóa"
        subtitle="Đối chiếu hợp đồng bảo hiểm trách nhiệm hàng hóa với chứng từ đính kèm."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Xét duyệt bảo hiểm hàng hóa" },
        ]}
      />

      <Alert severity="info" variant="outlined">
        Chỉ phê duyệt khi chứng từ là bảo hiểm trách nhiệm hàng hóa, còn hiệu lực và khớp với thông tin đã khai. Bảo hiểm
        xe không đủ điều kiện.
      </Alert>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <AdminSectionCard>
        <AdminToolbar
          title="Chứng từ bảo hiểm của nhà xe"
          subtitle={`${rows.length} chứng từ trên trang này`}
        >
          <AdminSelectField
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            options={STATUS_OPTIONS}
            minWidth={190}
          />
        </AdminToolbar>

        {loading ? (
          <Box role="status" sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
            <CircularProgress size={30} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">Không có chứng từ phù hợp với trạng thái này.</Typography>
          </Box>
        ) : (
          <>
            <AdminTableContainer minWidth={960}>
              <Table aria-label="Danh sách chứng từ bảo hiểm hàng hóa">
                <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
                  <TableRow>
                    <TableCell>Doanh nghiệp</TableCell>
                    <TableCell>Hợp đồng</TableCell>
                    <TableCell>Số tiền tự khai</TableCell>
                    <TableCell>Hết hạn</TableCell>
                    <TableCell>Gửi lúc</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{row.companyName}</Typography>
                        <Typography variant="caption" color="text.secondary">MST: {row.taxCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{row.providerName}</Typography>
                        <Typography variant="caption" color="text.secondary">Số HĐ: {row.policyNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        {row.coverageLimit ? formatMoney(row.coverageLimit) : "Không khai báo"}
                      </TableCell>
                      <TableCell>{formatIsoDateVi(row.expiredDate) || "Chưa cập nhật"}</TableCell>
                      <TableCell>{formatDateTime(row.submittedAt)}</TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell align="right">
                        <AdminPrimaryButton
                          size="small"
                          onClick={() => {
                            setSelected(row);
                            setRejectionReason("");
                          }}
                        >
                          {row.status === "PENDING" ? "Xét duyệt" : "Xem"}
                        </AdminPrimaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[10, 20, 50]}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
            />
          </>
        )}
      </AdminSectionCard>

      <AdminDialog
        open={Boolean(selected)}
        onClose={submitting ? undefined : () => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chứng từ bảo hiểm hàng hóa</DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          <Box className="rounded-xl border border-line bg-surface-sunken p-4">
            <Typography variant="h6" fontWeight={700}>{selected?.companyName}</Typography>
            <Typography variant="body2">MST: {selected?.taxCode}</Typography>
            <Typography variant="body2">Công ty bảo hiểm (tự khai): {selected?.providerName}</Typography>
            <Typography variant="body2">Số hợp đồng: {selected?.policyNumber}</Typography>
            <Typography variant="body2">
              Số tiền tự khai: {selected?.coverageLimit ? formatMoney(selected.coverageLimit) : "Không khai báo"}
            </Typography>
            <Typography variant="body2">Hết hạn: {formatIsoDateVi(selected?.expiredDate) || "Chưa cập nhật"}</Typography>
          </Box>

          <Box className="flex flex-wrap gap-2">
            <AdminSecondaryButton startIcon={<VisibilityIcon />} onClick={viewCertificate}>
              Xem chứng từ
            </AdminSecondaryButton>
          </Box>

          {isPending && (
            <TextField
              label="Lý do từ chối (bắt buộc nếu từ chối)"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              fullWidth
            />
          )}

          {selected?.rejectionReason && (
            <Alert severity="error" icon={<WarningIcon />}>
              Lý do từ chối: {selected.rejectionReason}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AdminSecondaryButton disabled={submitting} onClick={() => setSelected(null)}>
            Đóng
          </AdminSecondaryButton>
          {isPending && (
            <>
              <AdminSecondaryButton
                disabled={submitting || !rejectionReason.trim()}
                onClick={() => review("REJECT")}
                sx={{ color: "error.main", borderColor: "error.light" }}
              >
                Từ chối
              </AdminSecondaryButton>
              <AdminPrimaryButton disabled={submitting} onClick={() => review("APPROVE")}>
                Phê duyệt
              </AdminPrimaryButton>
            </>
          )}
        </DialogActions>
      </AdminDialog>
    </AdminPageShell>
  );
}
