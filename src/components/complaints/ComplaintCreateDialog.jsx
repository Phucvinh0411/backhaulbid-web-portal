"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "@/components/ui";
import { complaintApi } from "@/services/complaintApi";
import { contractApi } from "@/services/contractApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getTripStatusMeta } from "@/lib/statusMeta";
import { shortId } from "@/lib/format";
import { getCategoriesForRole, normalizeComplaintCollection, validateComplaintDraft } from "./complaintPresentation";

const EMPTY = { tripId: "", category: "", title: "", description: "" };
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

/**
 * Create a complaint about one of the reporter's trips.
 * `role` is SHIPPER or CARRIER; only categories that role may report are offered.
 */
export default function ComplaintCreateDialog({ open, onClose, onCreated, role, initialTripId = "" }) {
  const categories = useMemo(() => getCategoriesForRole(role), [role]);
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [trips, setTrips] = useState([]);
  const [tripsState, setTripsState] = useState("idle");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setDraft({ ...EMPTY, tripId: initialTripId || "" });
    setErrors({});
    setSubmitError("");
    setEvidenceFile(null);
    setTripsState("loading");
    contractApi
      .listTrips(undefined, { skipGlobalNotification: true })
      .then((response) => {
        if (!active) return;
        setTrips(normalizeComplaintCollection(response));
        setTripsState("ready");
      })
      .catch(() => {
        if (active) setTripsState("error");
      });
    return () => {
      active = false;
    };
  }, [open, initialTripId]);

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > MAX_EVIDENCE_BYTES) {
      setErrors((current) => ({ ...current, evidence: "Tệp tối đa 10 MB." }));
      setEvidenceFile(null);
      event.target.value = "";
      return;
    }
    setErrors((current) => ({ ...current, evidence: undefined }));
    setEvidenceFile(file);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (submittingRef.current) return;
    const nextErrors = validateComplaintDraft(draft, role);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const evidenceUrl = evidenceFile ? await mediaApi.uploadFile(evidenceFile, "complaints") : null;
      const created = await complaintApi.create({
        tripId: draft.tripId,
        category: draft.category,
        title: draft.title.trim(),
        description: draft.description.trim(),
        evidenceUrl,
      });
      onCreated?.(created);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Chưa gửi được khiếu nại. Nội dung bạn nhập vẫn được giữ, vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      busy={submitting}
      title="Gửi khiếu nại"
      titleId="complaint-create-title"
      actions={
        <>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" form="complaint-create-form" variant="contained" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi khiếu nại"}
          </Button>
        </>
      }
    >
      <Box component="form" id="complaint-create-form" noValidate onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {submitError && (
          <Alert severity="error" role="alert">
            {submitError}
          </Alert>
        )}

        <TextField
          select
          fullWidth
          required
          label="Chuyến vận chuyển"
          value={draft.tripId}
          onChange={(event) => update("tripId", event.target.value)}
          error={Boolean(errors.tripId) || tripsState === "error"}
          disabled={tripsState === "loading"}
          helperText={
            errors.tripId ||
            (tripsState === "loading"
              ? "Đang tải chuyến của bạn..."
              : tripsState === "error"
                ? "Không tải được danh sách chuyến. Đóng và mở lại để thử lại."
                : trips.length === 0
                  ? "Bạn chưa có chuyến nào để khiếu nại."
                  : "Khiếu nại được gửi tới bên còn lại của chuyến và quản trị viên.")
          }
        >
          {trips.map((trip) => (
            <MenuItem key={trip.id} value={trip.id} sx={{ whiteSpace: "normal" }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {trip.pickupLocation || "Chưa rõ"} → {trip.deliveryLocation || "Chưa rõ"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Chuyến {shortId(trip.id)} · {getTripStatusMeta(trip.status).label}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <FormControl error={Boolean(errors.category)} required>
          <FormLabel id="complaint-category-label" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            Loại vấn đề
          </FormLabel>
          <RadioGroup aria-labelledby="complaint-category-label" value={draft.category} onChange={(event) => update("category", event.target.value)}>
            {categories.map((category) => (
              <Box
                key={category.code}
                component="label"
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  p: 1,
                  mb: 0.75,
                  border: "1px solid",
                  borderColor: draft.category === category.code ? "primary.main" : "divider",
                  bgcolor: draft.category === category.code ? "var(--color-brand-soft)" : "transparent",
                  borderRadius: 2,
                  cursor: "pointer",
                }}
              >
                <Radio value={category.code} sx={{ p: 0.75 }} inputProps={{ "aria-describedby": `category-${category.code}-desc` }} />
                <Box sx={{ pt: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{category.label}</Typography>
                  <Typography id={`category-${category.code}-desc`} variant="body2" sx={{ color: "text.secondary" }}>
                    {category.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </RadioGroup>
          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          required
          label="Tiêu đề"
          value={draft.title}
          onChange={(event) => update("title", event.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title || `${draft.title.trim().length}/200`}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          fullWidth
          required
          multiline
          minRows={4}
          label="Mô tả sự việc"
          placeholder="Điều gì đã xảy ra, khi nào, ảnh hưởng thế nào..."
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          error={Boolean(errors.description)}
          helperText={errors.description || `${draft.description.trim().length}/5000`}
          inputProps={{ maxLength: 5000 }}
        />

        <FormControl error={Boolean(errors.evidence)}>
          <FormLabel htmlFor="complaint-evidence" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
            Tệp bằng chứng (không bắt buộc)
          </FormLabel>
          <input
            id="complaint-evidence"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
            className="min-h-[44px] w-full text-sm text-ink-muted file:mr-3 file:min-h-[40px] file:rounded-md file:border file:border-line-strong file:bg-surface file:px-3 file:text-sm file:font-semibold file:text-ink"
          />
          <FormHelperText>{errors.evidence || "Ảnh hoặc PDF, tối đa 10 MB."}</FormHelperText>
        </FormControl>
      </Box>
    </ResponsiveDialog>
  );
}
