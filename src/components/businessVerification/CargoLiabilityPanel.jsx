"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ShieldIcon from "@mui/icons-material/VerifiedUserOutlined";

import { ActionButton } from "@/components/common";
import { loadMyCargoLiability, submitCargoLiability } from "@/services/cargoLiabilityApi";
import { mediaApi } from "@/services/mediaApi";
import {
  CARGO_CERTIFICATE_FOLDER,
  buildCertificateSubmission,
  summarizeCargoLiability,
  validateCertificateForm,
} from "@/lib/cargoLiabilityPresentation";

const EMPTY_FORM = { providerName: "", policyNumber: "", coverageLimit: "", expiredDate: "" };

/**
 * Carrier's cargo-liability certificate. The file goes to the private folder and only its key is sent. An admin
 * reviews it; until then nothing here says the cargo is insured.
 */
export default function CargoLiabilityPanel() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const data = await loadMyCargoLiability();
      setState({ loading: false, data, error: "" });
    } catch (error) {
      setState({
        loading: false,
        data: null,
        error: error.response?.data?.message || "Không thể tải trạng thái chứng từ bảo hiểm.",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = summarizeCargoLiability(state.data ?? {});
  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async () => {
    setMessage({ type: "", text: "" });
    const formError = validateCertificateForm(form, file);
    if (formError) {
      setMessage({ type: "error", text: formError });
      return;
    }

    setSubmitting(true);
    try {
      const certificateKey = await mediaApi.uploadPrivateFile(file, CARGO_CERTIFICATE_FOLDER);
      await submitCargoLiability(buildCertificateSubmission(form, certificateKey));
      setForm(EMPTY_FORM);
      setFile(null);
      setMessage({ type: "success", text: "Đã gửi chứng từ. Quản trị viên sẽ xét duyệt trước khi chứng từ có hiệu lực." });
      await refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Không thể gửi chứng từ bảo hiểm.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="space-y-4">
      <Box>
        <Typography variant="subtitle1" className="flex items-center gap-2 !font-black">
          <ShieldIcon fontSize="small" />
          Bảo hiểm trách nhiệm hàng hóa
        </Typography>
        <Typography variant="body2" className="mt-1 text-ink-muted">
          Gửi hợp đồng để chủ hàng có bằng chứng khi bật yêu cầu bảo hiểm cho một phiên đấu giá. Quản trị viên xét duyệt.
          Nền tảng không bán bảo hiểm và không thay thế bảo hiểm xe.
        </Typography>
      </Box>

      {state.loading ? (
        <Box role="status" className="grid place-items-center py-4">
          <CircularProgress size={24} />
        </Box>
      ) : state.error ? (
        <Alert severity="error" variant="outlined">{state.error}</Alert>
      ) : (
        <Alert severity={summary.tone} variant="outlined">{summary.text}</Alert>
      )}

      {message.text && (
        <Alert severity={message.type} variant="outlined">{message.text}</Alert>
      )}

      {!state.loading && !state.error && summary.canSubmit && (
        <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            label="Tên công ty bảo hiểm"
            value={form.providerName}
            onChange={updateField("providerName")}
            inputProps={{ maxLength: 255 }}
            required
            fullWidth
          />
          <TextField
            label="Số hợp đồng"
            value={form.policyNumber}
            onChange={updateField("policyNumber")}
            inputProps={{ maxLength: 100 }}
            required
            fullWidth
          />
          <TextField
            label="Số tiền bảo hiểm trách nhiệm (không bắt buộc)"
            type="number"
            value={form.coverageLimit}
            onChange={updateField("coverageLimit")}
            inputProps={{ min: 0, step: "any" }}
            helperText="Chỉ là số tự khai, chưa được xác minh."
            fullWidth
          />
          <TextField
            label="Ngày hết hạn hợp đồng"
            type="date"
            value={form.expiredDate}
            onChange={updateField("expiredDate")}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          <Box className="flex flex-wrap items-center gap-3 md:col-span-2">
            <ActionButton component="label" variant="outlined" size="sm">
              {file ? file.name : "Chọn chứng từ (PDF hoặc ảnh, tối đa 15 MB)"}
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </ActionButton>
          </Box>

          <Box className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
            <Typography variant="caption" className="max-w-xl text-ink-muted">
              Chứng từ được lưu riêng tư. Chỉ quản trị viên xem được khi xét duyệt.
            </Typography>
            <ActionButton
              variant="primary"
              disabled={submitting}
              onClick={submit}
              startIcon={submitting ? <CircularProgress size={18} /> : null}
              className="w-full !min-w-52 !shrink-0 sm:w-auto"
            >
              Gửi chứng từ xét duyệt
            </ActionButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
