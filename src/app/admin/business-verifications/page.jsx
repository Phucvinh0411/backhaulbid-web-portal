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
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
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
import { axiosClient } from "@/configs/axiosClient";
import {
  BUSINESS_VERIFICATION_PATH,
  businessVerificationDocumentPath,
} from "@/components/businessVerification/businessVerificationApi";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Đang chờ duyệt" },
  { value: "VERIFIED", label: "Đã xác minh" },
  { value: "REJECTED", label: "Đã từ chối" },
];

function StatusChip({ status }) {
  if (status === "PENDING") {
    return <AdminStatusChip label="Chờ duyệt" tone="warning" />;
  }
  if (status === "VERIFIED") {
    return <AdminStatusChip label="Đã xác minh" tone="success" />;
  }
  return <AdminStatusChip label="Đã từ chối" tone="danger" />;
}

function getLegalRepresentative(row) {
  return row?.legalRepresentativeName || row?.legalRepresentative || "Chưa có";
}

function getEkycRepresentative(row) {
  return row?.ekycRepresentativeName || row?.representativeName || "Chưa có";
}

function getRepresentativeMatchStatus(row) {
  if (row?.representativeMatched === true) return "MATCH";
  if (row?.representativeMatched === false || row?.requiresAuthorization) {
    return "MISMATCH";
  }
  return "UNKNOWN";
}

export default function AdminBusinessVerificationsPage() {
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
      const { data } = await axiosClient.get(BUSINESS_VERIFICATION_PATH, {
        params: { status, page, pageSize },
      });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotalItems(Number(data?.totalItems) || 0);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Không thể tải danh sách hồ sơ doanh nghiệp."
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const review = async (decision) => {
    if (decision === "REJECT" && !rejectionReason.trim()) {
      setErrorMessage("Vui lòng nhập lý do từ chối hồ sơ.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      await axiosClient.patch(
        `${BUSINESS_VERIFICATION_PATH}/${selected.id}`,
        {
          decision,
          rejectionReason:
            decision === "REJECT" ? rejectionReason.trim() : undefined,
        }
      );
      setSelected(null);
      setRejectionReason("");
      await loadRows();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Không thể cập nhật kết quả xét duyệt."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadDocument = async (documentType = "businessLicense") => {
    const s3Url = documentType === "authorizationLetter"
      ? selected?.authorizationLetterUrl
      : selected?.businessLicenseUrl;
    if (!/^https:\/\//i.test(s3Url || "")) {
      setErrorMessage("TÃ i liá»‡u S3 khÃ´ng cÃ³ URL há»£p lá»‡.");
      return;
    }
    window.open(s3Url, "_blank", "noopener,noreferrer");
    if (s3Url) return;

    try {
      const { data } = await axiosClient.get(
        businessVerificationDocumentPath(selected.id, documentType),
        { responseType: "blob" }
      );
      const objectUrl = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download =
        documentType === "authorizationLetter"
          ? selected.authorizationLetterFilename || "giay-uy-quyen"
          : selected.businessLicenseFilename || "giay-phep-doanh-nghiep";
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Không thể tải tài liệu doanh nghiệp."
      );
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Xét duyệt doanh nghiệp"
        subtitle="Đối chiếu thông tin mã số thuế và giấy phép đăng ký kinh doanh."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Xét duyệt doanh nghiệp" },
        ]}
      />

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <AdminSectionCard>
        <AdminToolbar
          title="Hồ sơ xác minh doanh nghiệp"
          subtitle={`${rows.length} hồ sơ`}
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
          <Box
            role="status"
            sx={{ minHeight: 220, display: "grid", placeItems: "center" }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">
              Không có hồ sơ phù hợp với trạng thái này.
            </Typography>
          </Box>
        ) : (
          <>
            <AdminTableContainer minWidth={900}>
              <Table aria-label="Danh sách hồ sơ xác minh doanh nghiệp">
              <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
                <TableRow>
                  <TableCell>Doanh nghiệp</TableCell>
                  <TableCell>Mã số thuế</TableCell>
                    <TableCell>Người đại diện</TableCell>
                    <TableCell>Loại tài khoản</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {row.companyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.contactPhone || row.contactEmail || "Không có liên hệ"}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.taxCode}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {getLegalRepresentative(row)}
                      </Typography>
                      {getRepresentativeMatchStatus(row) === "MISMATCH" ? (
                        <Typography variant="caption" color="warning.main">
                          Cần giấy ủy quyền
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {getRepresentativeMatchStatus(row) === "MATCH"
                            ? "Trùng eKYC"
                            : "Chưa đủ dữ liệu"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.accountRole === "SHIPPER" ? "Chủ hàng" : "Nhà xe"}
                    </TableCell>
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
                        {row.status === "PENDING" ? "Xét duyệt" : "Xem hồ sơ"}
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
        <DialogTitle>Hồ sơ xác minh doanh nghiệp</DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          <Box className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Typography variant="h6" fontWeight={700}>
              {selected?.companyName}
            </Typography>
            <Typography variant="body2">MST: {selected?.taxCode}</Typography>
            <Typography variant="body2">
              Người đại diện doanh nghiệp: {getLegalRepresentative(selected)}
            </Typography>
            <Typography variant="body2">
              Người đại diện eKYC: {getEkycRepresentative(selected)}
            </Typography>
            <Typography variant="body2">{selected?.address}</Typography>
          </Box>

          <Box
            className={`rounded-xl border p-4 ${
              getRepresentativeMatchStatus(selected) === "MISMATCH"
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <Typography
              variant="subtitle2"
              className="flex items-center gap-2 !font-bold"
              color={
                getRepresentativeMatchStatus(selected) === "MISMATCH"
                  ? "warning.dark"
                  : "success.dark"
              }
            >
              {getRepresentativeMatchStatus(selected) === "MISMATCH" ? (
                <WarningIcon fontSize="small" />
              ) : null}
              {getRepresentativeMatchStatus(selected) === "MISMATCH"
                ? "Người đại diện doanh nghiệp không trùng người đã eKYC"
                : getRepresentativeMatchStatus(selected) === "MATCH"
                  ? "Người đại diện doanh nghiệp trùng khớp eKYC"
                  : "Chưa có dữ liệu so khớp người đại diện"}
            </Typography>
            <Typography variant="body2" className="mt-1 text-slate-600">
              Nếu không trùng, admin cần kiểm tra giấy ủy quyền cùng giấy phép
              kinh doanh trước khi phê duyệt.
            </Typography>
          </Box>

          <Box className="flex flex-wrap gap-2">
            <AdminSecondaryButton
              startIcon={<DownloadIcon />}
              onClick={() => downloadDocument("businessLicense")}
            >
              Tải {selected?.businessLicenseFilename || "giấy phép"}
            </AdminSecondaryButton>
            {(selected?.authorizationLetterFilename ||
              selected?.requiresAuthorization) && (
              <AdminSecondaryButton
                startIcon={<DownloadIcon />}
                onClick={() => downloadDocument("authorizationLetter")}
              >
                Tải {selected?.authorizationLetterFilename || "giấy ủy quyền"}
              </AdminSecondaryButton>
            )}
          </Box>

          {selected?.status === "PENDING" && (
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
            <Alert severity="error">
              Lý do từ chối: {selected.rejectionReason}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AdminSecondaryButton
            disabled={submitting}
            onClick={() => setSelected(null)}
          >
            Đóng
          </AdminSecondaryButton>
          {selected?.status === "PENDING" && (
            <>
              <AdminSecondaryButton
                disabled={submitting || !rejectionReason.trim()}
                onClick={() => review("REJECT")}
                sx={{ color: "error.main", borderColor: "error.light" }}
              >
                Từ chối
              </AdminSecondaryButton>
              <AdminPrimaryButton
                disabled={submitting}
                onClick={() => review("APPROVE")}
              >
                Phê duyệt
              </AdminPrimaryButton>
            </>
          )}
        </DialogActions>
      </AdminDialog>
    </AdminPageShell>
  );
}
