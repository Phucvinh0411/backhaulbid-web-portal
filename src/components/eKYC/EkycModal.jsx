"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";

export default function EkycModal({ onClose, role }) {
  const [step, setStep] = useState(1);
  const [companyId, setCompanyId] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const handleUpload = (e) => {
    if (e.target.files?.[0]) {
      setUploadedDoc(e.target.files[0].name);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="backdrop-blur-md"
      PaperProps={{
        className: "!rounded-3xl !p-2",
        sx: {
          background: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.15)",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
        <span className="flex items-center gap-2 text-[#1B4965]">
          <SecurityIcon /> Xác thực tài khoản Doanh nghiệp (eKYC)
        </span>
        <IconButton size="small" onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!pt-2">
        {step === 1 && (
          <Box className="space-y-6 py-2">
            <Typography variant="body2" className="text-slate-500">
              Để bảo vệ quyền lợi và tăng độ tin cậy trên hệ thống đấu thầu BackHaulBid, vui lòng điền thông tin pháp lý doanh nghiệp của bạn.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Mã số thuế Doanh nghiệp"
                  placeholder="Nhập mã số thuế 10 hoặc 13 chữ số"
                  fullWidth
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  InputProps={{ className: "!rounded-2xl" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Tên Doanh nghiệp đăng ký"
                  placeholder="Ví dụ: Công ty TNHH Vận Tải & Logistics ABC"
                  fullWidth
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  InputProps={{ className: "!rounded-2xl" }}
                />
              </Grid>
            </Grid>
            <Box className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={onClose}
                className="!text-slate-500 !font-bold !capitalize !rounded-xl"
              >
                Bỏ qua lúc này
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!taxCode || !companyId}
                className="!font-bold !px-6 !py-2.5 !rounded-xl !capitalize"
                sx={{
                  background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                  },
                }}
              >
                Tiếp tục
              </Button>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box className="space-y-6 py-2">
            <Typography variant="body2" className="text-slate-500">
              Vui lòng tải lên ảnh chụp Giấy chứng nhận đăng ký doanh nghiệp hoặc Giấy phép kinh doanh vận tải để xác thực.
            </Typography>
            <div className="border-2 border-dashed border-slate-200 hover:border-[#1B4965]/50 transition-all rounded-3xl p-8 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer relative group">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <CloudUploadIcon className="!text-4xl text-slate-400 group-hover:text-[#1B4965] group-hover:scale-105 transition-all mb-2" />
              <Typography variant="body2" className="!font-bold text-slate-600">
                {uploadedDoc ? `Đã chọn: ${uploadedDoc}` : "Kéo thả tài liệu vào đây hoặc click để tải lên"}
              </Typography>
              <Typography variant="caption" className="text-slate-400">
                Hỗ trợ định dạng PDF, JPG, PNG tối đa 10MB.
              </Typography>
            </div>
            <Box className="flex justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={() => setStep(1)}
                className="!text-slate-500 !font-bold !capitalize !rounded-xl"
              >
                Quay lại
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  className="!text-slate-400 !font-medium !capitalize !rounded-xl"
                >
                  Bỏ qua
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!uploadedDoc}
                  className="!font-bold !px-6 !py-2.5 !rounded-xl !capitalize"
                  sx={{
                    background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                    },
                  }}
                >
                  Xác nhận gửi
                </Button>
              </div>
            </Box>
          </Box>
        )}

        {step === 3 && (
          <Box className="flex flex-col items-center justify-center text-center py-6 space-y-5 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircleIcon className="!text-4xl" />
            </div>
            <div className="space-y-1.5">
              <Typography variant="h6" className="!font-bold text-slate-800">
                Yêu cầu eKYC đã được tiếp nhận!
              </Typography>
              <Typography variant="body2" className="text-slate-400 leading-relaxed">
                Hệ thống BackHaulBid sẽ kiểm tra và đối chiếu thông tin doanh nghiệp của bạn trong vòng 24h làm việc. Bạn vẫn có thể truy cập hệ thống ngay bây giờ.
              </Typography>
            </div>
            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              className="!font-bold !py-3 !rounded-2xl !capitalize !mt-4"
              sx={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                },
              }}
            >
              Vào Trang Quản Trị
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
