"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { ResponsiveDialog } from "@/components/ui";
import { clearCurrentAccountCache } from "@/hooks/useCurrentAccount";

const DASHBOARD_BY_ROLE = {
  ADMIN: "/admin",
  CARRIER: "/carrier/dashboard",
  SHIPPER: "/shipper/dashboard",
};

const ONBOARDING_ROLES = [
  { value: "SHIPPER", title: "Chủ hàng", hint: "Tạo phiên và giao vận", Icon: Inventory2OutlinedIcon },
  { value: "CARRIER", title: "Chủ xe", hint: "Đặt giá và quản lý đội xe", Icon: LocalShippingOutlinedIcon },
];

// Google GSI warns if initialize() runs on every route mount between /login and /register.
let initializedGsiClientId = null;
let activeCredentialHandler = null;

export default function GoogleSignInSection({ mode = "login" }) {
  const router = useRouter();
  const notify = useGlobalNotification();
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(null);

  const [clientId, setClientId] = useState(() => (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim());
  const [configLoaded, setConfigLoaded] = useState(Boolean((process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [onboarding, setOnboarding] = useState(null);
  const [selectedRole, setSelectedRole] = useState("SHIPPER");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (clientId) return undefined;
    let active = true;
    fetch("/api/auth/google/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const resolved = String(data?.clientId || "").trim();
        if (resolved) setClientId(resolved);
        setConfigLoaded(true);
      })
      .catch(() => {
        if (active) setConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  const completeSessionRedirect = async (roleValue) => {
    clearCurrentAccountCache();
    const role = String(roleValue || "").toUpperCase();
    if (role === "DRIVER") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      clearCurrentAccountCache();
      notify.warning("Tài khoản tài xế dùng ứng dụng BackHaulBid trên điện thoại. Cổng web dành cho chủ hàng, chủ xe và quản trị viên.");
      return;
    }
    router.push(DASHBOARD_BY_ROLE[role] || "/");
    router.refresh();
  };

  const handleCredential = async (credential) => {
    if (!credential || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Không thể đăng nhập bằng Google.");
        return;
      }
      if (data?.needsOnboarding) {
        setOnboarding({
          onboardingToken: data.onboardingToken,
          email: data.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
        });
        setSelectedRole("SHIPPER");
        setPhone("");
        return;
      }
      await completeSessionRedirect(data?.data?.role || data?.role);
    } catch {
      setError("Không kết nối được máy chủ khi xác thực Google.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    credentialHandlerRef.current = handleCredential;
    activeCredentialHandler = handleCredential;
  });

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    let active = true;

    const renderButton = () => {
      if (!active || !buttonRef.current || !window.google?.accounts?.id) return;
      buttonRef.current.innerHTML = "";
      if (initializedGsiClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          callback: (response) => activeCredentialHandler?.(response?.credential),
        });
        initializedGsiClientId = clientId;
      }
      const width = Math.min(Math.max(buttonRef.current.clientWidth || 400, 260), 400);
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "register" ? "signup_with" : "signin_with",
        locale: "vi",
        width,
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return () => {
        active = false;
      };
    }

    let script = document.querySelector('script[data-google-gsi="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", renderButton);
    return () => {
      active = false;
      script?.removeEventListener("load", renderButton);
    };
  }, [clientId, mode]);

  const handleCompleteOnboarding = async (event) => {
    event.preventDefault();
    if (!onboarding || submitting) return;
    const cleanPhone = phone.trim();
    if (!/^[0-9]{9,11}$/.test(cleanPhone)) {
      setError("Số điện thoại phải gồm 9 đến 11 chữ số.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingToken: onboarding.onboardingToken,
          role: selectedRole,
          phone: cleanPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Không thể hoàn tất đăng ký Google.");
        return;
      }
      setOnboarding(null);
      await completeSessionRedirect(data?.data?.role || data?.role || selectedRole);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2.5 }}>
      <Divider sx={{ mb: 2, color: "text.secondary", fontSize: "0.85rem" }}>hoặc</Divider>

      {error && !onboarding && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {clientId ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: 999,
              overflow: "hidden",
              "&:hover .google-signin-visual": {
                borderColor: "primary.main",
                bgcolor: "rgba(22, 60, 86, 0.04)",
              },
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="large"
              fullWidth
              disabled={submitting}
              className="google-signin-visual"
              startIcon={
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  sx={{ width: 18, height: 18, flexShrink: 0 }}
                >
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.1 0-.6-.1-1.1-.2-1.6H12Z"
                  />
                  <path
                    fill="#34A853"
                    d="M3.7 7.6 6.9 10c.9-2.6 3.3-4.4 6.1-4.4 1.9 0 3.1.8 3.8 1.5l2.6-2.5C17.8 3.1 15.6 2.2 13 2.2 9.1 2.2 5.6 4.4 3.7 7.6Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 21.4c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-2.8 0-5.2-1.9-6-4.5l-3.2 2.5c1.8 3.6 5.4 5.9 9.2 5.9Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M21 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.4-1.1 2.5-2.1 3.2l3 2.5c1.8-1.6 2.7-4.1 2.7-8Z"
                  />
                </Box>
              }
              sx={{
                pointerEvents: "none",
                borderColor: "divider",
                color: "text.primary",
                bgcolor: "background.paper",
                fontWeight: 600,
              }}
            >
              {mode === "register" ? "Đăng ký bằng Google" : "Đăng nhập bằng Google"}
            </Button>
            <Box
              ref={buttonRef}
              aria-label={mode === "register" ? "Đăng ký bằng Google" : "Đăng nhập bằng Google"}
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: submitting ? "default" : "pointer",
                pointerEvents: submitting ? "none" : "auto",
                "& > div": { width: "100% !important", height: "100% !important" },
                "& iframe": { width: "100% !important", height: "100% !important", transform: "scale(1.08)" },
              }}
            />
          </Box>
          {submitting && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <CircularProgress size={16} />
              <Typography variant="caption">Đang xác thực với Google...</Typography>
            </Box>
          )}
        </Box>
      ) : configLoaded ? (
        <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "text.secondary" }}>
          Đăng nhập bằng Google sẽ khả dụng sau khi cấu hình GOOGLE_CLIENT_ID.
        </Typography>
      ) : null}

      <ResponsiveDialog
        open={Boolean(onboarding)}
        onClose={() => {
          if (!submitting) {
            setOnboarding(null);
            setError("");
          }
        }}
        title="Hoàn tất tài khoản Google"
        titleId="google-onboarding-dialog-title"
        maxWidth="xs"
        busy={submitting}
        actions={
          <>
            <Button
              type="button"
              variant="text"
              disabled={submitting}
              onClick={() => {
                setOnboarding(null);
                setError("");
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="google-onboarding-form"
              variant="contained"
              disabled={submitting || !phone.trim()}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Hoàn tất đăng ký"}
            </Button>
          </>
        }
      >
        <Box
          id="google-onboarding-form"
          component="form"
          onSubmit={handleCompleteOnboarding}
          noValidate
          sx={{ display: "grid", gap: 2 }}
        >
          {onboarding && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Avatar src={onboarding.avatarUrl || undefined} alt="">
                  {onboarding.fullName?.[0]?.toUpperCase() || onboarding.email?.[0]?.toUpperCase() || "G"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  {onboarding.fullName && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                      {onboarding.fullName}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
                    {onboarding.email}
                  </Typography>
                </Box>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Chọn vai trò hoạt động và nhập số điện thoại liên hệ để hoàn tất đăng ký tài khoản BackHaulBid.
            </Typography>

            {error && <Alert severity="error" role="alert">{error}</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }} role="radiogroup" aria-label="Chọn vai trò">
              {ONBOARDING_ROLES.map(({ value, title, hint, Icon }) => {
                const active = selectedRole === value;
                return (
                  <ButtonBase
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedRole(value)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1.5px solid",
                      borderColor: active ? "primary.main" : "divider",
                      bgcolor: active ? "rgba(15, 76, 129, 0.06)" : "background.paper",
                      display: "grid",
                      justifyItems: "start",
                      textAlign: "left",
                      gap: 0.4,
                    }}
                  >
                    <Icon fontSize="small" color={active ? "primary" : "action"} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{hint}</Typography>
                  </ButtonBase>
                );
              })}
            </Box>

            <TextField
              label="Số điện thoại"
              required
              fullWidth
              inputMode="tel"
              placeholder="Ví dụ: 0912345678"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                if (error) setError("");
              }}
              helperText="Gồm 9 đến 11 chữ số."
            />
        </Box>
      </ResponsiveDialog>
    </Box>
  );
}
