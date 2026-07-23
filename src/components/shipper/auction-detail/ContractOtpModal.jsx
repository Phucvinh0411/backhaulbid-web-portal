"use client";

import { useRef } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";

export default function ContractOtpModal({
  open,
  onClose,
  otpValues,
  setOtpValues,
  isOtpSuccess,
  onSubmitOtp,
  winnerCarrierName,
}) {
  const otpInputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace handling
    if (e.key === "Backspace" && !otpValues[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      className="backdrop-blur-sm"
      PaperProps={{
        className: "!rounded-3xl !p-2",
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
        Chốt thầu & Ký Hợp đồng điện tử
        <IconButton size="small" onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="flex flex-col items-center justify-center text-center space-y-4 !py-4">
        {isOtpSuccess ? (
          <div className="space-y-4 py-4 flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 animate-bounce">
              <CheckCircleIcon className="!text-4xl" />
            </div>
            <div className="space-y-1">
              <Typography className="!font-bold text-slate-800 text-base">
                Xác nhận ký hợp đồng thành công!
              </Typography>
              <Typography variant="body2" className="text-slate-400 max-w-xs">
                Hợp đồng vận chuyển điện tử đang được tạo. Hệ thống sẽ kết nối trực tiếp với tài xế của nhà xe {winnerCarrierName || "Phước An"}.
              </Typography>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 text-xl">
              <SecurityIcon />
            </div>
            
            <div className="space-y-1.5">
              <Typography variant="body2" className="text-slate-500">
                Vui lòng nhập mã xác thực OTP 6 chữ số đã được gửi qua số điện thoại để ký kết hợp đồng điện tử với nhà xe.
              </Typography>
              <Typography variant="caption" className="text-slate-400 font-bold block">
                (Nhập mã giả định: <span className="text-[#1B4965] font-mono">123456</span> để kiểm thử)
              </Typography>
            </div>

            {/* Segmented OTP Input */}
            <div className="flex gap-2 justify-center py-2">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-xl font-bold rounded-xl border border-slate-200 focus:border-[#1B4965] focus:outline-none transition-all bg-slate-50/50 focus:bg-white"
                />
              ))}
            </div>
          </>
        )}
      </DialogContent>
      {!isOtpSuccess && (
        <DialogActions className="!px-6 !pb-4 flex justify-between gap-3 border-t border-slate-100/50 pt-3">
          <Typography variant="caption" className="text-slate-400 font-semibold cursor-pointer hover:text-[#1B4965] transition-colors">
            Gửi lại mã OTP
          </Typography>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="text"
              className="!text-slate-500 !font-bold !capitalize !rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={onSubmitOtp}
              disabled={otpValues.join("").length < 6}
              variant="contained"
              className="!font-bold !capitalize !rounded-xl !px-5"
              sx={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                "&.Mui-disabled": {
                  background: "#E2E8F0",
                  color: "#94A3B8"
                }
              }}
            >
              Xác nhận ký
            </Button>
          </div>
        </DialogActions>
      )}
    </Dialog>
  );
}
