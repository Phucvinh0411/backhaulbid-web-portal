"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import { PageHeader } from "@/components/common";

export default function SettingsPage() {
  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Hồ sơ & eKYC" 
        subtitle="Quản lý hồ sơ doanh nghiệp và danh sách phương tiện vận tải"
      />

      <Card className="glass mt-6 border border-slate-200/60 shadow-sm rounded-2xl p-6">
        <Grid container spacing={5}>
            
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
            <Grid item xs={12} lg={6}>
              <Box className="mb-6">
                <Typography variant="h6" className="font-bold text-[#1B4965] flex items-center gap-2 mb-1">
                  <CorporateFareIcon /> Thông tin Doanh nghiệp / Hộ kinh doanh
                </Typography>
                <Typography variant="body2" className="text-slate-500">
                  Thông tin dùng để xuất hóa đơn và ký kết hợp đồng vận tải.
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tên doanh nghiệp" defaultValue="Công ty TNHH Vận Tải Xuyên Việt" variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mã số thuế" defaultValue="0101234567" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email liên hệ" defaultValue="carrier@transport.vn" type="email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" defaultValue="0988112233" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Loại hình" defaultValue="Công ty TNHH" select SelectProps={{ native: true }}>
                    <option>Công ty TNHH</option>
                    <option>Công ty Cổ phần</option>
                    <option>Hộ kinh doanh cá thể</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Địa chỉ đăng ký kinh doanh" defaultValue="Số 1, Đường Lê Duẩn, Quận 1, TP HCM" />
                </Grid>
              </Grid>

              <Box className="mt-8 mb-6">
                <Typography variant="h6" className="font-bold text-[#1B4965] flex items-center gap-2 mb-1">
                  <AssignmentIndIcon /> Người đại diện pháp luật
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ và tên" defaultValue="Nguyễn Văn Chủ Xe" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Chức vụ" defaultValue="Giám đốc" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại cá nhân" defaultValue="0988112233" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email cá nhân" defaultValue="chuxe@gmail.com" />
                </Grid>
              </Grid>

              <Box className="mt-8">
                <Button variant="contained" size="large" sx={{ backgroundColor: "#1B4965", borderRadius: "8px", px: 4 }}>
                  Lưu thông tin
                </Button>
              </Box>
            </Grid>

            {/* CỘT PHẢI: XÁC MINH eKYC */}
            <Grid item xs={12} lg={6}>
              <Box className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 h-full">
                <Box className="mb-6 flex justify-between items-start">
                  <Box>
                    <Typography variant="h6" className="font-bold text-[#1B4965] flex items-center gap-2 mb-1">
                      Xác minh tài liệu (eKYC)
                      <CheckCircleIcon color="success" fontSize="small" />
                    </Typography>
                    <Typography variant="body2" className="text-slate-500">
                      Tải lên các giấy tờ pháp lý để kích hoạt tính năng đấu giá.
                    </Typography>
                  </Box>
                  <Chip label="Đã xác minh" color="success" size="small" className="font-semibold" />
                </Box>
                
                <Box className="space-y-6">
                  {/* Tải Giấy phép ĐKKD */}
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-slate-700 mb-2">
                      Giấy phép đăng ký kinh doanh
                    </Typography>
                    <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-white">
                      <CardContent className="text-center py-6 flex flex-col items-center gap-2">
                        <CloudUploadIcon sx={{ fontSize: 32, color: "#94A3B8" }} />
                        <Typography variant="body2" className="text-slate-600">
                          Kéo thả hoặc <strong>Bấm vào đây</strong> để tải lên PDF/JPG.
                        </Typography>
                        <Typography variant="caption" className="text-slate-400">Tối đa 5MB</Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Tải CCCD Đại diện */}
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold text-slate-700 mb-2">
                      Căn cước công dân (Người đại diện)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-white h-full">
                          <CardContent className="text-center py-5 flex flex-col items-center gap-1">
                            <CloudUploadIcon sx={{ fontSize: 28, color: "#94A3B8" }} />
                            <Typography variant="body2" className="text-slate-600 font-medium">Mặt trước</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-white h-full">
                          <CardContent className="text-center py-5 flex flex-col items-center gap-1">
                            <CloudUploadIcon sx={{ fontSize: 28, color: "#94A3B8" }} />
                            <Typography variant="body2" className="text-slate-600 font-medium">Mặt sau</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

      </Card>
    </Box>
  );
}
