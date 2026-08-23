"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import SaveIcon from "@mui/icons-material/Save";
import CircleIcon from "@mui/icons-material/Circle";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import { getAdminSettings, getGatewayHealth, saveAdminSettings } from "@/services/adminSettingsApi";

import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSectionCard,
} from "@/components/admin/AdminUI";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

function SettingRow({ label, helper, children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "240px 1fr" },
        gap: { xs: 1, md: 2 },
        alignItems: "center",
        py: 2,
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700 }}>
          {label}
        </Typography>
        {helper && (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
            {helper}
          </Typography>
        )}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

export default function AdminSettingsPage() {
  const notify = useGlobalNotification();
  const [maintenance, setMaintenance] = useState(false);
  const [settings, setSettings] = useState({});
  const [serverHealth, setServerHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSettings("general")
      .then((response) => {
        if (!active) return;
        const values = response.values || {};
        setSettings((current) => ({ ...current, ...values }));
        setMaintenance(Boolean(values.maintenanceMode));
      })
      .catch(() => active && notify.error("Không tải được cấu hình chung từ API."))
      .finally(() => active && setLoading(false));
    getGatewayHealth()
      .then((response) => active && setServerHealth(response?.status === "UP"))
      .catch(() => active && setServerHealth(false));
    return () => { active = false; };
  }, [notify]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      values.maintenanceMode = maintenance;
      await saveAdminSettings("general", values);
      notify.success("Đã lưu cấu hình chung.");
    } catch {
      notify.error("Không thể lưu cấu hình chung.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell>
      <form onSubmit={handleSave} key={loading ? "settings-loading" : "settings-loaded"}>
        <AdminPageHeader
          title="Cài đặt hệ thống"
          subtitle="Quản lý các thông số cấu hình cơ bản, múi giờ và trạng thái bảo trì của nền tảng."
          breadcrumbs={[
            { label: "Admin", path: "/admin" },
            { label: "Cài đặt" },
            { label: "Cấu hình chung" },
          ]}
          action={
            <AdminPrimaryButton type="submit" disabled={loading || saving} startIcon={<SaveIcon />}>
              Lưu thay đổi
            </AdminPrimaryButton>
          }
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Cấu hình chung Form */}
          <Grid item xs={12} lg={8}>
            <AdminSectionCard title="Cấu hình hệ thống" subtitle="Các cài đặt cốt lõi toàn nền tảng">
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SettingRow label="Tên nền tảng" helper="Hiển thị trên tiêu đề và email gửi đi">
                  <TextField name="platformName" defaultValue={settings.platformName ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Email hệ thống" helper="Địa chỉ email dùng gửi thông báo tự động">
                  <TextField name="systemEmail" defaultValue={settings.systemEmail ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Hotline hỗ trợ" helper="Tổng đài chăm sóc khách hàng 24/7">
                  <TextField name="supportPhone" defaultValue={settings.supportPhone ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />

                <SettingRow label="Múi giờ hệ thống" helper="Thời gian áp dụng cho các phiên đấu giá">
                  <TextField name="timezone" defaultValue={settings.timezone ?? ""} select fullWidth size="small" disabled={loading}>
                    <MenuItem value="GMT+7">Hà Nội, Băng Cốc, Jakarta (GMT+7)</MenuItem>
                    <MenuItem value="GMT+8">Singapore, Bắc Kinh, Manila (GMT+8)</MenuItem>
                    <MenuItem value="GMT+0">Giờ chuẩn quốc tế (GMT+0)</MenuItem>
                  </TextField>
                </SettingRow>

                <Divider sx={{ my: 1 }} />

                <SettingRow label="Chế độ bảo trì" helper="Chặn truy cập từ phía người dùng để nâng cấp">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={maintenance}
                        onChange={(e) => setMaintenance(e.target.checked)}
                        color="error"
                        disabled={loading}
                      />
                    }
                    label={maintenance ? "Đang bật (Chỉ admin truy cập)" : "Đang tắt (Hoạt động bình thường)"}
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.85rem", fontWeight: 600, color: maintenance ? "error.main" : "text.secondary" } }}
                  />
                </SettingRow>
              </Box>
            </AdminSectionCard>
          </Grid>

          {/* Trạng thái máy chủ / Server status info */}
          <Grid item xs={12} lg={4}>
            <AdminSectionCard title="Trạng thái máy chủ" subtitle="Giám sát hiệu năng phần cứng thời gian thực">
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3.5 }}>
                
                {/* Status indicator */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, bgcolor: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: 3 }}>
                  <CircleIcon color={serverHealth ? "success" : "disabled"} sx={{ fontSize: 14, animation: serverHealth ? "pulse 2s infinite" : "none" }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "emerald.700", lineHeight: 1.2 }}>
                      {serverHealth === null ? "Đang kiểm tra hệ thống" : serverHealth ? "Hệ thống đang hoạt động" : "Không kết nối được health endpoint"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Trạng thái được đọc trực tiếp từ actuator của API gateway
                    </Typography>
                  </Box>
                </Box>

                {/* CPU usage */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Hiệu năng CPU
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Not available
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.04)" }} />
                </Box>

                {/* RAM usage */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Bộ nhớ RAM
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      Not available
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.04)" }} />
                </Box>

                <Divider />

                {/* Details list */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <DnsOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Database Connection
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {serverHealth === null ? "Đang kiểm tra..." : serverHealth ? "Đã kết nối" : "Không kết nối"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <ShieldOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Chứng chỉ SSL
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                        Not available
                      </Typography>
                    </Box>
                  </Box>
                </Box>

              </Box>
            </AdminSectionCard>
          </Grid>
        </Grid>
      </form>
    </AdminPageShell>
  );
}
