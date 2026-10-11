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

const EKYC_IMAGES = [
  { part: "front", label: "Mặt trước CCCD" },
  { part: "back", label: "Mặt sau CCCD" },
  { part: "selfie", label: "Ảnh khuôn mặt" },
];

function formatIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "Chưa có";
}

function formatGender(value) {
  return value === "M" ? "Nam" : value === "F" ? "Nữ" : "Chưa có";
}

/** Loads one eKYC image through the admin evidence endpoint; the image stays in memory for this admin session. */
function EkycEvidenceThumb({ reportId, part, label }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    let objectUrl = null;
    axiosClient
      .get(`/api/v1/admin/representative-verifications/${reportId}/evidence/${part}`, {
        responseType: "blob",
      })
      .then(({ data }) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(data);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportId, part]);

  return (
    <Box className="flex flex-col items-center gap-1">
      {src ? (
        <img src={src} alt={label} className="h-28 w-full rounded-lg object-cover" />
      ) : (
        <Box className="flex h-28 w-full items-center justify-center rounded-lg bg-black/5 text-xs text-ink-muted">
          {failed ? "Không tải được ảnh" : "Đang tải…"}
        </Box>
      )}
      <Typography variant="caption" className="text-ink-muted">
        {label}
      </Typography>
    </Box>
  );
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
      setErrorMessage("Tài liệu S3 không có URL hợp lệ.");
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
          <Box className="rounded-xl border border-line bg-surface-sunken p-4">
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
                ? "border-warning-soft bg-warning-soft"
                : "border-success-soft bg-success-soft"
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
            <Typography variant="body2" className="mt-1 text-ink-muted">
              Nếu không trùng, admin cần kiểm tra giấy ủy quyền cùng giấy phép
              kinh doanh trước khi phê duyệt.
            </Typography>
          </Box>

          <Box className="rounded-xl border p-4">
            <Typography variant="subtitle2" className="!font-bold">
              eKYC của người đã xác thực trên hồ sơ này
            </Typography>
            {selected?.ekycRepresentative ? (
              <>
                <Typography variant="body2">
                  Họ và tên: {selected.ekycRepresentative.fullName || "Chưa có"}
                </Typography>
                <Typography variant="body2">
                  Ngày sinh: {formatIsoDate(selected.ekycRepresentative.dateOfBirth)}
                </Typography>
                <Typography variant="body2">
                  Giới tính: {formatGender(selected.ekycRepresentative.gender)}
                </Typography>
                <Typography variant="body2">
                  Số CCCD 12 số: {selected.ekycRepresentative.citizenId || "Chưa có"}
                </Typography>
                <Typography variant="body2">
                  Kết quả eKYC: {selected.ekycRepresentative.status} ·{" "}
                  {selected.ekycRepresentative.verificationMethod || "chưa có phương thức"}
                </Typography>
                {selected.ekycRepresentative.evidenceAvailable ? (
                  <Box className="mt-3 grid grid-cols-3 gap-2">
                    {EKYC_IMAGES.map(({ part, label }) => (
                      <EkycEvidenceThumb
                        key={part}
                        reportId={selected.ekycRepresentative.reportId}
                        part={part}
                        label={label}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" className="mt-2 text-ink-muted">
                    Ảnh eKYC đã hết thời hạn lưu.
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" className="text-ink-muted">
                Chủ tài khoản chưa có hồ sơ eKYC.
              </Typography>
            )}
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
