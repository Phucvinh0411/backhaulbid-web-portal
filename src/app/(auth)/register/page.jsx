"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AuthShell from "@/components/auth/AuthShell";
import { GATEWAY_URL } from "@/config/clientConfig";

// identity-service RegisterRequest: phone (9–11 digits), optional email, password 8–72 bytes, role.
const ROLES = [
  { value: "SHIPPER", label: "Chủ hàng", hint: "Đăng lô hàng và chọn nhà xe qua đấu giá.", Icon: Inventory2OutlinedIcon },
  { value: "CARRIER", label: "Chủ xe", hint: "Tìm hàng cho xe chiều về và đặt giá.", Icon: LocalShippingOutlinedIcon },
];

function validate({ phone, email, password }) {
  const errors = {};
  if (!/^[0-9]{9,11}$/.test(phone.trim())) errors.phone = "Số điện thoại gồm 9–11 chữ số.";
  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Email chưa đúng định dạng.";
  if (password.length < 8) errors.password = "Mật khẩu ít nhất 8 ký tự.";
  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ role: "SHIPPER", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim(), password: form.password, email: form.email.trim() || undefined, role: form.role }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) router.push("/login");
      else setSubmitError(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Đăng ký chưa thành công. Vui lòng thử lại.");
    } catch {
      setSubmitError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Tài xế được chủ xe mời và dùng ứng dụng trên điện thoại."
      footer={
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Đã có tài khoản?{" "}
          <Box component={Link} href="/login" sx={{ color: "primary.main", fontWeight: 600 }}>Đăng nhập</Box>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "grid", gap: 2.5 }}>
        {submitError && <Alert severity="error" role="alert">{submitError}</Alert>}
        <Box component="fieldset" sx={{ border: 0, p: 0, m: 0 }}>
          <Typography component="legend" sx={{ fontWeight: 600, mb: 1 }}>Bạn là</Typography>
          <Box role="radiogroup" aria-label="Vai trò tài khoản" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {ROLES.map(({ value, label, hint, Icon }) => {
              const selected = form.role === value;
              return (
                <ButtonBase
                  key={value}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setForm((current) => ({ ...current, role: value }))}
                  sx={{
                    display: "block",
                    textAlign: "left",
                    p: 2,
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: selected ? "primary.main" : "var(--color-surface-sunken)",
                    bgcolor: selected ? "var(--color-brand-soft)" : "var(--color-surface-sunken)",
                    "&.Mui-focusVisible": { outline: "2px solid var(--color-focus)", outlineOffset: 2 },
                  }}
                >
                  <Icon aria-hidden sx={{ color: selected ? "primary.main" : "text.secondary", mb: 0.5 }} />
                  <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{hint}</Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
        <TextField label="Số điện thoại" required fullWidth size="medium" autoComplete="tel" inputMode="numeric"
          value={form.phone} onChange={set("phone")} error={Boolean(errors.phone)} helperText={errors.phone} />
        <TextField label="Email (không bắt buộc)" type="email" fullWidth size="medium" autoComplete="email"
          value={form.email} onChange={set("email")} error={Boolean(errors.email)} helperText={errors.email} />
        <TextField label="Mật khẩu" type="password" required fullWidth size="medium" autoComplete="new-password"
          value={form.password} onChange={set("password")} error={Boolean(errors.password)} helperText={errors.password || "Ít nhất 8 ký tự."} />
        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" aria-label="Đang tạo tài khoản" /> : "Tạo tài khoản"}
        </Button>
      </Box>
    </AuthShell>
  );
}
