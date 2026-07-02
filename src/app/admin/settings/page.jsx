"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";
import SaveIcon from "@mui/icons-material/Save";
import { PageHeader } from "@/components/common";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    commissionRate: 5,
    minDeposit: "1,000,000",
    defaultAuctionTime: 30,
  });

  const handleChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.value,
    });
  };

  const handleSave = () => {
    // Implement save logic here
    console.log("Settings saved", settings);
    alert("Đã lưu cấu hình thành công!");
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Cấu hình Hệ thống" 
        subtitle="Quản lý các tham số vận hành cốt lõi của nền tảng."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Hệ thống", path: "#" },
          { label: "Cài đặt chung" },
        ]}
      />

      <Card 
        className="glass mt-6 max-w-4xl" 
        sx={{ 
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
        }}
      >
        <CardContent className="!p-8 flex flex-col gap-8">
          {/* Item 1 */}
          <Box className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <Box className="md:col-span-4 flex flex-col gap-1">
              <Typography variant="subtitle2" className="font-bold text-slate-800">
                Tỷ lệ phí hoa hồng nền tảng
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                Phần trăm hoa hồng được khấu trừ từ mỗi giao dịch thành công.
              </Typography>
            </Box>
            <Box className="md:col-span-8">
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                value={settings.commissionRate}
                onChange={handleChange("commissionRate")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  className: "!rounded-lg bg-white",
                }}
              />
            </Box>
          </Box>

          <Divider className="border-slate-100" />

          {/* Item 2 */}
          <Box className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <Box className="md:col-span-4 flex flex-col gap-1">
              <Typography variant="subtitle2" className="font-bold text-slate-800">
                Số tiền ký quỹ tối thiểu
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                Số dư tối thiểu yêu cầu trong ví để nhà xe có thể tham gia đấu giá.
              </Typography>
            </Box>
            <Box className="md:col-span-8">
              <TextField
                fullWidth
                variant="outlined"
                value={settings.minDeposit}
                onChange={handleChange("minDeposit")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                  className: "!rounded-lg bg-white",
                  inputProps: { className: "text-right" }
                }}
              />
            </Box>
          </Box>

          <Divider className="border-slate-100" />

          {/* Item 3 */}
          <Box className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <Box className="md:col-span-4 flex flex-col gap-1">
              <Typography variant="subtitle2" className="font-bold text-slate-800">
                Thời gian mặc định phiên đấu giá
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                Thời gian đếm ngược mặc định khi một phiên đấu giá mới được khởi tạo.
              </Typography>
            </Box>
            <Box className="md:col-span-8">
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                value={settings.defaultAuctionTime}
                onChange={handleChange("defaultAuctionTime")}
                InputProps={{
                  endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                  className: "!rounded-lg bg-white",
                }}
              />
            </Box>
          </Box>

          <Box className="flex justify-end pt-4 mt-2 border-t border-slate-100">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                backgroundColor: "#1B4965",
                "&:hover": { backgroundColor: "#12344D" },
                borderRadius: "8px",
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              Lưu thay đổi cấu hình
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
