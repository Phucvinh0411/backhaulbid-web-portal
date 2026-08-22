"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";

import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSectionCard,
} from "@/components/admin/AdminUI";
import { getAdminSettings, saveAdminSettings } from "@/services/adminSettingsApi";

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

export default function AuctionSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;
    getAdminSettings("auction")
      .then((response) => active && setSettings((current) => ({ ...current, ...(response.values || {}) })))
      .catch(() => active && setFeedback({ severity: "error", message: "Không tải được luật đấu giá từ API." }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      values.autoExtend = values.autoExtend === "on";
      await saveAdminSettings("auction", values);
      setFeedback({ severity: "success", message: "Đã lưu luật đấu giá." });
    } catch {
      setFeedback({ severity: "error", message: "Không thể lưu luật đấu giá." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell>
      <form onSubmit={handleSave} key={loading ? "settings-loading" : "settings-loaded"}>
        <AdminPageHeader
          title="Luật đấu giá"
          subtitle="Thiết lập thời gian mặc định, bước giá tối thiểu và quy tắc gia hạn cho các phiên đấu giá ngược."
          breadcrumbs={[
            { label: "Admin", path: "/admin" },
            { label: "Cài đặt" },
            { label: "Luật đấu giá" },
          ]}
          action={
            <AdminPrimaryButton type="submit" disabled={loading || saving} startIcon={<SaveIcon />}>
              Lưu thay đổi
            </AdminPrimaryButton>
          }
        />

        {feedback && <Alert severity={feedback.severity} sx={{ mt: 2 }}>{feedback.message}</Alert>}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Cấu hình luật Form */}
          <Grid item xs={12} lg={8}>
            <AdminSectionCard title="Cấu hình quy tắc" subtitle="Thiết lập cơ chế tính giá và thời gian của phiên thầu">
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SettingRow label="Thời gian đếm ngược mặc định" helper="Áp dụng khi tạo phiên mới (Đơn vị: phút)">
                  <TextField name="defaultAuctionTime" type="number" defaultValue={settings.defaultAuctionTime ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Bước giá tối thiểu" helper="Khoảng cách tối thiểu giữa 2 lần đặt giá">
                  <TextField
                    name="minBidIncrement"
                    defaultValue={settings.minBidIncrement ?? ""}
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                    disabled={loading}
                  />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Gia hạn tự động" helper="Cộng thêm thời gian nếu có lượt đặt giá cuối phiên">
                  <FormControlLabel
                    control={<Switch name="autoExtend" defaultChecked={settings.autoExtend === true} color="primary" disabled={loading} />}
                    label="Kích hoạt tự động gia hạn"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.85rem", fontWeight: 600 } }}
                  />
                </SettingRow>

                <Divider sx={{ my: 1 }} />

                <SettingRow label="Thời gian gia hạn cộng thêm" helper="Thời gian cộng thêm khi kích hoạt gia hạn (phút)">
                  <TextField name="extendDuration" type="number" defaultValue={settings.extendDuration ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>

                <Divider sx={{ my: 1 }} />

                <SettingRow label="Thời hạn thanh toán" helper="Thời gian tối đa để chủ hàng thanh toán sau khi chốt thầu (giờ)">
                  <TextField name="paymentDeadline" type="number" defaultValue={settings.paymentDeadline ?? ""} fullWidth size="small" disabled={loading} />
                </SettingRow>
              </Box>
            </AdminSectionCard>
          </Grid>

          {/* Quy trình đấu giá ngược Visualized */}
          <Grid item xs={12} lg={4}>
            <AdminSectionCard title="Cơ chế Đấu giá ngược" subtitle="Trực quan hóa luồng vận hành của luật thầu">
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
                
                {/* Step 1 */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                      1
                    </Box>
                    <Box sx={{ w: 2, flex: 1, borderLeft: "2px dashed", borderColor: "divider", my: 0.5 }} />
                  </Box>
                  <Box sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Tạo & Khởi chạy phiên
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Chủ hàng đưa ra mức giá trần. Phiên đếm ngược từ 30 phút bắt đầu.
                    </Typography>
                  </Box>
                </Box>

                {/* Step 2 */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                      2
                    </Box>
                    <Box sx={{ w: 2, flex: 1, borderLeft: "2px dashed", borderColor: "divider", my: 0.5 }} />
                  </Box>
                  <Box sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Đấu giá công khai
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Nhà xe đặt giá thấp dần. Giá sau phải thấp hơn giá trước ít nhất 50,000 VND.
                    </Typography>
                  </Box>
                </Box>

                {/* Step 3 */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                      3
                    </Box>
                    <Box sx={{ w: 2, flex: 1, borderLeft: "2px dashed", borderColor: "divider", my: 0.5 }} />
                  </Box>
                  <Box sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      Gia hạn cuối phiên
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Nếu có lượt đặt giá trong 5 phút cuối, phiên tự động cộng thêm 5 phút đếm ngược.
                    </Typography>
                  </Box>
                </Box>

                {/* Step 4 */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "success.main", color: "white", display: "grid", placeItems: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                      ✓
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "success.main" }}>
                      Khớp lệnh & Thanh toán
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Nhà xe có giá thấp nhất trúng thầu. Chủ hàng thanh toán trong vòng 24 giờ.
                    </Typography>
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
