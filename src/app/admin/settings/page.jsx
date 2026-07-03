"use client";

import { useState } from "react";
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

import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSectionCard,
} from "@/components/admin/AdminUI";

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
  const [maintenance, setMaintenance] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const settings = Object.fromEntries(data.entries());
    settings.maintenanceMode = maintenance;

    console.log("General settings saved", settings);
    alert("Đã lưu cấu hình chung thành công.");
  };

  return (
    <AdminPageShell>
      <form onSubmit={handleSubmit}>
        <AdminPageHeader
          title="Cài đặt hệ thống"
          subtitle="Quản lý các thông số cấu hình cơ bản, múi giờ và trạng thái bảo trì của nền tảng."
          breadcrumbs={[
            { label: "Admin", path: "/admin" },
            { label: "Cài đặt" },
            { label: "Cấu hình chung" },
          ]}
          action={
            <AdminPrimaryButton type="submit" startIcon={<SaveIcon />}>
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
                  <TextField name="platformName" defaultValue="BackHaulBid" fullWidth size="small" />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Email hệ thống" helper="Địa chỉ email dùng gửi thông báo tự động">
                  <TextField name="systemEmail" defaultValue="noreply@backhaulbid.vn" fullWidth size="small" />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Hotline hỗ trợ" helper="Tổng đài chăm sóc khách hàng 24/7">
                  <TextField name="supportPhone" defaultValue="1900 8899" fullWidth size="small" />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />

                <SettingRow label="Múi giờ hệ thống" helper="Thời gian áp dụng cho các phiên đấu giá">
                  <TextField name="timezone" defaultValue="GMT+7" select fullWidth size="small">
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
                  <CircleIcon color="success" sx={{ fontSize: 14, animation: "pulse 2s infinite" }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "emerald.700", lineHeight: 1.2 }}>
                      Ổn định
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Tất cả các dịch vụ đang chạy tốt
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
                      24%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={24} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.04)" }} />
                </Box>

                {/* RAM usage */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Bộ nhớ RAM
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      62% (10.2 GB / 16 GB)
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={62} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(0,0,0,0.04)" }} />
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
                        Active (Pool: 15 / 50)
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
                        Còn hạn 324 ngày
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
