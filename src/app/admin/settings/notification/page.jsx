"use client";

import { useState } from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import SaveIcon from "@mui/icons-material/Save";
import Grid from "@mui/material/Grid";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";

import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSectionCard,
} from "@/components/admin/AdminUI";
import { getAdminSettings, saveAdminSettings } from "@/services/adminSettingsApi";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function NotificationSettingsPage() {
  const notify = useGlobalNotification();
  const [sms, setSms] = useState(null);
  const [email, setEmail] = useState(null);
  const [push, setPush] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSettings("notification")
      .then((response) => {
        if (!active) return;
        const values = response.values || {};
        if (typeof values.smsNotifications === "boolean") setSms(values.smsNotifications);
        if (typeof values.emailNotifications === "boolean") setEmail(values.emailNotifications);
        if (typeof values.pushNotifications === "boolean") setPush(values.pushNotifications);
      })
      .catch(() => active && notify.error("Không tải được cấu hình thông báo từ API."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [notify]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveAdminSettings("notification", {
        smsNotifications: sms,
        emailNotifications: email,
        pushNotifications: push,
      });
      notify.success("Đã lưu cấu hình thông báo.");
    } catch {
      notify.error("Không thể lưu cấu hình thông báo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell>
      <form onSubmit={handleSave}>
        <AdminPageHeader
          title="Cấu hình thông báo"
          subtitle="Tùy chỉnh các kênh gửi tin nhắn (SMS, Email, Web Push) tự động toàn diện trên hệ thống."
          breadcrumbs={[
            { label: "Admin", path: "/admin" },
            { label: "Cài đặt" },
            { label: "Cấu hình thông báo" },
          ]}
          action={
            <AdminPrimaryButton type="submit" disabled={loading || saving} startIcon={<SaveIcon />}>
              Lưu thay đổi
            </AdminPrimaryButton>
          }
        />


        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Cấu hình kênh thông báo Form */}
          <Grid item xs={12} lg={8}>
            <AdminSectionCard title="Kênh gửi thông báo" subtitle="Bật/Tắt các kênh truyền tải thông tin">
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: "flex", flexDirection: "column", gap: 3.5 }}>
                
                {/* SMS Channel */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <SmartphoneOutlinedIcon color="primary" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: "text.primary", fontWeight: 700 }}>Thông báo SMS</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Gửi OTP xác thực, mã giao dịch ký quỹ khẩn cấp.
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={sms === true} onChange={(e) => setSms(e.target.checked)} name="smsNotifications" color="primary" disabled={loading} />
                </Box>

                {/* Email Channel */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <MailOutlineIcon color="primary" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: "text.primary", fontWeight: 700 }}>Thông báo Email</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Gửi hợp đồng điện tử, hóa đơn VAT, biên lai thanh toán và báo cáo định kỳ.
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={email === true} onChange={(e) => setEmail(e.target.checked)} name="emailNotifications" color="primary" disabled={loading} />
                </Box>

                {/* Web Push Notification */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <NotificationsActiveOutlinedIcon color="primary" sx={{ mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: "text.primary", fontWeight: 700 }}>Thông báo đẩy (Web Push)</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Nhận thông báo cập nhật lượt đặt giá, đổi trạng thái chuyến hàng trên trình duyệt.
                      </Typography>
                    </Box>
                  </Box>
                  <Switch checked={push === true} onChange={(e) => setPush(e.target.checked)} name="pushNotifications" color="primary" disabled={loading} />
                </Box>

              </Box>
            </AdminSectionCard>
          </Grid>

          {/* Điện thoại Mockup mô phỏng Notification */}
          <Grid item xs={12} lg={4}>
            <AdminSectionCard title="Trực quan hóa thiết bị" subtitle="Xem trước hiển thị thông báo trên thiết bị di động">
              <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                
                {/* Premium Smartphone Mockup container */}
                <Box
                  sx={{
                    width: 240,
                    height: 440,
                    border: "12px solid #0D2B3E",
                    borderRadius: 5,
                    bgcolor: "#1E293B",
                    position: "relative",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Speaker notch */}
                  <Box sx={{ width: 60, height: 16, bgcolor: "#0D2B3E", borderBottomLeftRadius: 10, borderBottomRightRadius: 10, position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 10 }} />

                  {/* Status Bar */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, pt: 1.5, pb: 0.5, color: "rgba(255,255,255,0.7)", fontSize: "0.62rem" }}>
                    <Typography sx={{ fontSize: "inherit", fontWeight: 700 }}>09:41</Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <span>📶</span>
                      <span>🔋</span>
                    </Box>
                  </Box>

                  {/* Screen Content */}
                  <Box sx={{ flex: 1, p: 1.5, display: "flex", flexDirection: "column", gap: 1.5, backgroundImage: "linear-gradient(to bottom, #1e3a8a, #0f172a)" }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.62rem", textAlign: "center", mt: 1 }}>
                      HÔM NAY
                    </Typography>

                    {/* Push preview box */}
                    {push && (
                      <Box sx={{ bgcolor: "rgba(255,255,255,0.92)", borderRadius: 2.5, p: 1.5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "text.primary" }}>
                            BackHaulBid
                          </Typography>
                          <Typography sx={{ fontSize: "0.58rem", color: "text.secondary" }}>
                            bây giờ
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", fontWeight: 600, lineHeight: 1.3 }}>
                          🔥 Đối tác vừa cập nhật giá thầu mới cho lô hàng LH-9041 của bạn!
                        </Typography>
                      </Box>
                    )}

                    {/* SMS preview box */}
                    {sms && (
                      <Box sx={{ bgcolor: "rgba(255,255,255,0.92)", borderRadius: 2.5, p: 1.5, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "text.primary" }}>
                            Tin nhắn (SMS)
                          </Typography>
                          <Typography sx={{ fontSize: "0.58rem", color: "text.secondary" }}>
                            2 phút trước
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", fontWeight: 600, lineHeight: 1.3 }}>
                          [BackHaulBid] Ma OTP xac thuc rut tien tai khoan cua ban la 782997. Khong chia se ma nay voi ai.
                        </Typography>
                      </Box>
                    )}

                    {/* Email placeholder notifier */}
                    {email && (
                      <Box sx={{ bgcolor: "rgba(30, 41, 59, 0.4)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 2.5, p: 1.5, display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.6)" }}>
                        <MailOutlineIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: "0.6rem" }}>
                          Đã gửi báo cáo định kỳ về email của bạn
                        </Typography>
                      </Box>
                    )}
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
