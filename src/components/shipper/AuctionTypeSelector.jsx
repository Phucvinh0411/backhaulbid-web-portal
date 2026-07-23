"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PublicIcon from "@mui/icons-material/Public";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function AuctionTypeSelector({ value, onChange }) {
  const options = [
    {
      id: "PUBLIC",
      title: "Đấu giá công khai (Public Reverse Auction)",
      description: "Chủ xe tham gia thầu có thể nhìn thấy mức giá thấp nhất hiện tại từ đối thủ khác (nhưng ẩn danh tính người ra giá). Khi kết thúc phiên đấu giá, hệ thống sẽ tự động chọn nhà xe có mức giá đề xuất thấp nhất.",
      icon: <PublicIcon sx={{ fontSize: 32 }} />,
      tag: "Phổ biến",
      tagColor: "bg-sky-100 text-sky-700 border-sky-200"
    },
    {
      id: "SEALED",
      title: "Đấu giá kín / Đấu thầu (Sealed-bid Auction)",
      description: "Các chủ xe tự đề xuất giá của riêng mình và không nhìn thấy giá của các đối thủ khác. Sau khi kết thúc, chủ hàng (Shipper) sẽ nhận danh sách giá sắp xếp tăng dần và chủ động lựa chọn nhà xe trúng thầu dựa trên mức giá, độ uy tín, đánh giá tín nhiệm, và mô tả phương tiện.",
      icon: <LockOutlinedIcon sx={{ fontSize: 32 }} />,
      tag: "Bảo mật cao",
      tagColor: "bg-amber-100 text-amber-700 border-amber-200"
    }
  ];

  return (
    <Box className="space-y-4">
      <Typography variant="body2" className="text-slate-600 font-bold mb-2">
        Hình thức tổ chức đấu giá
      </Typography>
      <Grid container spacing={3}>
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <Grid item xs={12} md={6} key={opt.id}>
              <Paper
                onClick={() => onChange(opt.id)}
                className={`cursor-pointer p-5 rounded-3xl border transition-all duration-300 relative h-full flex flex-col justify-between ${
                  isSelected
                    ? "border-[#1B4965] bg-[#1B4965]/[0.02] shadow-[0_8px_24px_rgba(27,73,101,0.06)]"
                    : "border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/50 shadow-sm"
                }`}
                sx={{
                  outline: isSelected ? "2px solid #1B4965" : "none",
                }}
              >
                <Box className="space-y-4">
                  {/* Top Header inside Option Card */}
                  <Box className="flex items-start justify-between">
                    <Box
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#1B4965] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {opt.icon}
                    </Box>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.tagColor}`}>
                      {opt.tag}
                    </span>
                  </Box>

                  {/* Title and description */}
                  <div className="space-y-1">
                    <Typography
                      variant="subtitle1"
                      className={`!font-extrabold transition-colors ${
                        isSelected ? "text-[#1B4965]" : "text-slate-800"
                      }`}
                    >
                      {opt.title}
                    </Typography>
                    <Typography variant="caption" className="text-slate-500 leading-relaxed block">
                      {opt.description}
                    </Typography>
                  </div>
                </Box>

                {/* Selected Indicator Checkmark */}
                {isSelected && (
                  <Box className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-[#1B4965] text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
