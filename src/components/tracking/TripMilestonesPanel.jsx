"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { Panel, ResponsiveDialog, StatusBadge } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { MILESTONE_STATUS_META } from "@/lib/statusMeta";
import { formatDateTime } from "@/lib/format";

const EMPTY_FORM = { milestoneName: "", targetLat: "", targetLng: "" };

function validate(form) {
  const errors = {};
  const lat = Number(form.targetLat);
  const lng = Number(form.targetLng);
  if (!form.milestoneName.trim()) errors.milestoneName = "Nhập tên cột mốc.";
  if (form.targetLat === "" || !Number.isFinite(lat) || lat < -90 || lat > 90) errors.targetLat = "Vĩ độ từ -90 đến 90.";
  if (form.targetLng === "" || !Number.isFinite(lng) || lng < -180 || lng > 180) errors.targetLng = "Kinh độ từ -180 đến 180.";
  return errors;
}

/**
 * Milestones the carrier sets for a trip. Drivers check in from the app within the server's
 * geo-fence; this panel only shows the result and lets the carrier add new milestones.
 */
export default function TripMilestonesPanel({ trip, milestones, canCreate, onChanged }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const reached = milestones.filter((item) => item.status === "REACHED").length;

  const close = () => {
    if (saving) return;
    setOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setSubmitError("");
    try {
      const nextOrder = milestones.reduce((max, item) => Math.max(max, Number(item.sequenceOrder) || 0), 0) + 1;
      await contractApi.createMilestone(trip.id, {
        milestoneName: form.milestoneName.trim(),
        targetLat: Number(form.targetLat),
        targetLng: Number(form.targetLng),
        sequenceOrder: nextOrder,
      });
      setSaving(false);
      close();
      await onChanged?.();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Không thể thêm cột mốc."));
      setSaving(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm((current) => ({ ...current, [name]: event.target.value })),
    error: Boolean(errors[name]),
    helperText: errors[name],
    disabled: saving,
    fullWidth: true,
  });

  return (
    <Panel
      title="Cột mốc hành trình"
      subtitle={milestones.length ? `${reached}/${milestones.length} cột mốc đã check-in` : "Chuyến chưa có cột mốc."}
      actions={canCreate ? <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Thêm cột mốc</Button> : null}
    >
      {milestones.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {canCreate ? "Thêm cột mốc để tài xế check-in theo vị trí khi chạy qua." : "Chủ xe chưa đặt cột mốc cho chuyến này."}
        </Typography>
      ) : (
        <Box component="ol" sx={{ m: 0, p: 0, display: "grid", gap: 1 }}>
          {milestones.map((milestone) => {
            const meta = MILESTONE_STATUS_META[milestone.status] || MILESTONE_STATUS_META.PENDING;
            return (
              <Box component="li" key={milestone.id} sx={{ listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", overflowWrap: "anywhere" }}>
                    {milestone.sequenceOrder}. {milestone.milestoneName}
                  </Typography>
                  <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
                    {milestone.reachedAt ? `Check-in ${formatDateTime(milestone.reachedAt)}` : `${Number(milestone.targetLat).toFixed(4)}, ${Number(milestone.targetLng).toFixed(4)}`}
                  </Typography>
                </Box>
                <StatusBadge size="sm" meta={meta} />
              </Box>
            );
          })}
        </Box>
      )}

      <ResponsiveDialog
        open={open}
        onClose={close}
        busy={saving}
        maxWidth="xs"
        title="Thêm cột mốc"
        titleId="add-milestone-title"
        actions={
          <>
            <Button color="inherit" onClick={close} disabled={saving}>Hủy</Button>
            <Button variant="contained" type="submit" form="add-milestone-form" disabled={saving}>
              {saving ? "Đang lưu..." : "Thêm cột mốc"}
            </Button>
          </>
        }
      >
        <Box component="form" id="add-milestone-form" noValidate onSubmit={submit} sx={{ display: "grid", gap: 2, pt: 0.5 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField label="Tên cột mốc" placeholder="Ví dụ: Trạm thu phí Long Thành" {...field("milestoneName")} />
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
            <TextField label="Vĩ độ" inputMode="decimal" {...field("targetLat")} />
            <TextField label="Kinh độ" inputMode="decimal" {...field("targetLng")} />
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Tài xế chỉ check-in được khi ở gần tọa độ này; máy chủ kiểm tra khoảng cách.
          </Typography>
        </Box>
      </ResponsiveDialog>
    </Panel>
  );
}
