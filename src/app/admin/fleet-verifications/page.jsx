"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  AdminDialog,
  AdminEmptyState,
  AdminLoadingState,
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminSelectField,
  AdminStatusChip,
  AdminTableContainer,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import {
  getAdminDriverReviews,
  getAdminVehicleReviews,
  reviewAdminDriver,
  reviewAdminVehicle,
} from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const STATUS_META = {
  PENDING: { label: "Chờ duyệt", tone: "warning" },
  VERIFIED: { label: "Đã duyệt", tone: "success" },
  REJECTED: { label: "Từ chối", tone: "danger" },
  INACTIVE: { label: "Vô hiệu hóa", tone: "neutral" },
};

const statusOptions = (tab) => [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "VERIFIED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  ...(tab === "drivers" ? [{ value: "INACTIVE", label: "Vô hiệu hóa" }] : []),
];

function ReviewStatusChip({ status }) {
  const meta = STATUS_META[status] || {
    label: status || "Chưa rõ",
    tone: "neutral",
  };
  return <AdminStatusChip label={meta.label} tone={meta.tone} />;
}

export default function FleetVerificationsPage() {
  const notify = useGlobalNotification();
  const [tab, setTab] = useState("vehicles");
  const [status, setStatus] = useState("PENDING");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data =
        tab === "vehicles"
          ? await getAdminVehicleReviews(status)
          : await getAdminDriverReviews(
              status === "INACTIVE" ? "EXPIRED" : status,
            );
      setRows(Array.isArray(data) ? data : []);
    } catch (loadError) {
      notify.error(
        getApiErrorMessage(
          loadError,
          "Không thể tải hồ sơ đội xe. Vui lòng thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [notify, status, tab]);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setStatus("PENDING");
  };

  const submitReview = async () => {
    if (!reviewing) return;
    if (reviewing.decision === "REJECT" && !reason.trim()) {
      notify.warning("Cần nhập lý do từ chối.");
      return;
    }
    setSaving(true);
    try {
      const review = {
        decision: reviewing.decision,
        reason: reason.trim() || null,
      };
      if (tab === "vehicles")
        await reviewAdminVehicle(reviewing.row.id, review);
      else await reviewAdminDriver(reviewing.row.id, review);
      notify.success("Đã cập nhật kết quả duyệt hồ sơ đội xe.");
      setReviewing(null);
      await loadReviews();
    } catch (reviewError) {
      notify.error(
        getApiErrorMessage(
          reviewError,
          "Không thể cập nhật kết quả duyệt. Vui lòng thử lại.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Duyệt đội xe"
        subtitle="Kiểm tra và phê duyệt phương tiện, tài xế trước khi tham gia vận chuyển."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/fleet-verifications" },
          { label: "Duyệt đội xe" },
        ]}
      />

      <AdminSectionCard>
        <Box
          sx={{
            px: 2.5,
            pt: 1,
            borderBottom: "1px solid #E2E8F0",
            bgcolor: "rgba(248,250,252,0.72)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => changeTab(value)}
            aria-label="Loại hồ sơ đội xe"
          >
            <Tab
              value="vehicles"
              label="Phương tiện"
              sx={{ textTransform: "none", fontWeight: 800 }}
            />
            <Tab
              value="drivers"
              label="Tài xế"
              sx={{ textTransform: "none", fontWeight: 800 }}
            />
          </Tabs>
        </Box>
        <AdminToolbar
          title="Hồ sơ chờ duyệt"
          subtitle={`${rows.length} hồ sơ phù hợp`}
        >
          <AdminSelectField
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={statusOptions(tab)}
            minWidth={180}
          />
        </AdminToolbar>

        {loading ? (
          <AdminLoadingState label="Đang tải hồ sơ đội xe..." />
        ) : rows.length === 0 ? (
          <AdminEmptyState>Không có hồ sơ phù hợp.</AdminEmptyState>
        ) : (
          <AdminTableContainer minWidth={760}>
            <Table aria-label="Danh sách hồ sơ đội xe">
              <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
                <TableRow>
                  {[
                    "Đối tượng",
                    "Chủ xe",
                    "Thông tin",
                    "Trạng thái",
                    "Thao tác",
                  ].map((label) => (
                    <TableCell
                      key={label}
                      sx={{ fontWeight: 800, color: "text.secondary" }}
                      align={label === "Thao tác" ? "right" : "left"}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {tab === "vehicles" ? row.licensePlate : row.fullName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontFamily: "monospace",
                        }}
                      >
                        {row.id}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                    >
                      {tab === "vehicles" ? row.carrierId : "—"}
                    </TableCell>
                    <TableCell>
                      {tab === "vehicles"
                        ? `${row.vehicleType || "Chưa rõ"} · ${row.payloadCapacity || "?"} tấn`
                        : `${row.phone || "Chưa có SĐT"} · GPLX ${row.licenseNumber || "?"}`}
                    </TableCell>
                    <TableCell>
                      <ReviewStatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <AdminSecondaryButton
                          size="small"
                          onClick={() => setDetailRow(row)}
                        >
                          Xem hồ sơ
                        </AdminSecondaryButton>
                        {row.status === "PENDING" && (
                          <>
                            <AdminPrimaryButton
                              size="small"
                              onClick={() => {
                                setReason("");
                                setReviewing({ row, decision: "APPROVE" });
                              }}
                            >
                              Duyệt
                            </AdminPrimaryButton>
                            <AdminSecondaryButton
                              size="small"
                              onClick={() => {
                                setReason("");
                                setReviewing({ row, decision: "REJECT" });
                              }}
                              sx={{ color: "#BE123C", borderColor: "#FECDD3" }}
                            >
                              Từ chối
                            </AdminSecondaryButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableContainer>
        )}
      </AdminSectionCard>

      <AdminDialog
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ borderBottom: "1px solid #E2E8F0", fontWeight: 800 }}
        >
          Hồ sơ {tab === "vehicles" ? "phương tiện" : "tài xế"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailRow && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Trạng thái
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  <ReviewStatusChip status={detailRow.status} />
                </Box>
              </Box>
              <Typography variant="body2">
                <strong>{tab === "vehicles" ? "Biển số" : "Họ tên"}:</strong>{" "}
                {tab === "vehicles"
                  ? detailRow.licensePlate
                  : detailRow.fullName}
              </Typography>
              <Typography variant="body2">
                <strong>
                  {tab === "vehicles" ? "Chủ xe" : "Số điện thoại"}:
                </strong>{" "}
                {tab === "vehicles" ? detailRow.carrierId : detailRow.phone}
              </Typography>
              {tab === "vehicles" ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {[
                    {
                      label: "Cà vẹt / đăng ký",
                      url: detailRow.registrationDocumentUrl,
                    },
                    {
                      label: "Đăng kiểm",
                      url: detailRow.inspectionDocumentUrl,
                    },
                  ].map((document) => (
                    <Box
                      key={document.label}
                      sx={{
                        p: 1.5,
                        border: "1px solid #E2E8F0",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "text.secondary" }}
                      >
                        {document.label}
                      </Typography>
                      {document.url ? (
                        <Button
                          component="a"
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                        >
                          Mở tài liệu
                        </Button>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "#BE123C", mt: 0.5 }}
                        >
                          Thiếu tài liệu
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{ p: 1.5, border: "1px solid #E2E8F0", borderRadius: 2 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "text.secondary" }}
                  >
                    Ảnh GPLX
                  </Typography>
                  {detailRow.licenseImageUrl ? (
                    <Button
                      component="a"
                      href={detailRow.licenseImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                    >
                      Mở tài liệu
                    </Button>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "#BE123C", mt: 0.5 }}
                    >
                      Thiếu tài liệu
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
          <AdminSecondaryButton onClick={() => setDetailRow(null)}>
            Đóng
          </AdminSecondaryButton>
        </DialogActions>
      </AdminDialog>

      <AdminDialog
        open={Boolean(reviewing)}
        onClose={() => !saving && setReviewing(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {reviewing?.decision === "APPROVE" ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}
        </DialogTitle>
        <DialogContent>
          {reviewing?.decision === "REJECT" ? (
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              label="Lý do từ chối"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography color="text.secondary">
              Xác nhận hồ sơ này hợp lệ và cho phép sử dụng trong hệ thống?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AdminSecondaryButton
            onClick={() => setReviewing(null)}
            disabled={saving}
          >
            Hủy
          </AdminSecondaryButton>
          <AdminPrimaryButton
            onClick={() => void submitReview()}
            disabled={saving}
            sx={
              reviewing?.decision === "REJECT"
                ? { bgcolor: "#BE123C", "&:hover": { bgcolor: "#9F1239" } }
                : undefined
            }
          >
            {saving ? "Đang lưu..." : "Xác nhận"}
          </AdminPrimaryButton>
        </DialogActions>
      </AdminDialog>
    </AdminPageShell>
  );
}
