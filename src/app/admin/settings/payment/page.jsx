"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import SaveIcon from "@mui/icons-material/Save";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

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

export default function PaymentSettingsPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const settings = Object.fromEntries(data.entries());

    console.log("Payment settings saved", settings);
    alert("Đã lưu cấu hình thanh toán thành công.");
  };

  return (
    <AdminPageShell>
      <form onSubmit={handleSubmit}>
        <AdminPageHeader
          title="Thanh toán & ký quỹ"
          subtitle="Quản lý tỷ lệ hoa hồng nền tảng, mức ký quỹ tối thiểu và cấu hình rút nạp dòng tiền."
          breadcrumbs={[
            { label: "Admin", path: "/admin" },
            { label: "Cài đặt" },
            { label: "Thanh toán & ký quỹ" },
          ]}
          action={
            <AdminPrimaryButton type="submit" startIcon={<SaveIcon />}>
              Lưu thay đổi
            </AdminPrimaryButton>
          }
        />

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Cấu hình tài chính Form */}
          <Grid item xs={12} lg={8}>
            <AdminSectionCard title="Cấu hình tài chính" subtitle="Cài đặt hoa hồng, ký quỹ toàn hệ thống">
              <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SettingRow label="Hoa hồng nền tảng" helper="Khấu trừ trực tiếp trên tổng giá trị giao dịch (%)">
                  <TextField name="commissionRate" type="number" defaultValue={5} fullWidth size="small" />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Ký quỹ tối thiểu (Chủ hàng)" helper="Hạn mức giữ tiền để đảm bảo khả năng thanh toán">
                  <TextField
                    name="minDepositShipper"
                    defaultValue="1,000,000"
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                  />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />
                
                <SettingRow label="Ký quỹ tối thiểu (Nhà xe)" helper="Đảm bảo trách nhiệm không bùng chuyến">
                  <TextField
                    name="minDepositCarrier"
                    defaultValue="500,000"
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                  />
                </SettingRow>
                
                <Divider sx={{ my: 1 }} />

                <SettingRow label="Cổng thanh toán mặc định" helper="Phương thức nạp/rút tiền hệ thống">
                  <TextField name="paymentGateway" defaultValue="vnpay" select fullWidth size="small">
                    <MenuItem value="vnpay">Cổng thanh toán VNPay</MenuItem>
                    <MenuItem value="momo">Ví điện tử MoMo</MenuItem>
                    <MenuItem value="bank">Chuyển khoản Ngân hàng tự động</MenuItem>
                  </TextField>
                </SettingRow>

                <Divider sx={{ my: 1 }} />

                <SettingRow label="Hạn mức rút tiền tối đa" helper="Hạn mức trong một giao dịch rút (VND)">
                  <TextField
                    name="maxWithdrawLimit"
                    defaultValue="50,000,000"
                    fullWidth
                    size="small"
                    InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                  />
                </SettingRow>
              </Box>
            </AdminSectionCard>
          </Grid>

          {/* Dòng tiền ký quỹ Visualized */}
          <Grid item xs={12} lg={4}>
            <AdminSectionCard title="Tổng quan Ví tổng" subtitle="Hạn mức và luồng tiền hiện tại của hệ thống">
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3.5 }}>
                
                {/* Balance 1 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: "rgba(27, 73, 101, 0.06)", display: "grid", placeItems: "center", color: "primary.main" }}>
                    <AccountBalanceWalletOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}>
                      Tổng số dư ký quỹ đảm bảo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                      1,420,500,000 ₫
                    </Typography>
                  </Box>
                </Box>

                {/* Balance 2 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: "rgba(46, 125, 50, 0.06)", display: "grid", placeItems: "center", color: "success.main" }}>
                    <GavelOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.2 }}>
                      Doanh thu hoa hồng tạm giữ
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "success.main" }}>
                      184,200,000 ₫
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Info Note about Deposit Escrow */}
                <Box sx={{ p: 2, bgcolor: "rgba(248, 250, 252, 0.8)", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                    <SwapHorizIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.primary" }}>
                      Nguyên lý tài khoản đảm bảo
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.4 }}>
                    Khi khớp lệnh thành công, số tiền thầu sẽ được tạm đóng băng ở tài khoản trung gian của nền tảng và chỉ giải ngân cho nhà xe khi chuyến hàng được xác nhận hoàn thành, đảm bảo an toàn tuyệt đối.
                  </Typography>
                </Box>

              </Box>
            </AdminSectionCard>
          </Grid>
        </Grid>
      </form>
    </AdminPageShell>
  );
}
