"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import { AppCard, PageHeader } from "@/components/common";
import VNPTEkyc from "@/components/eKYC/VNPTEkyc";

export default function EkycPage() {
  const [result, setResult] = useState(null);

  const handleEkycResult = (res) => {
    setResult(res);
  };

  return (
    <Box className="min-h-screen bg-[#F6F8FC] px-4 py-6 md:px-8 md:py-8">
      <Box className="mx-auto max-w-7xl">
        <PageHeader
          title="Xác thực danh tính eKYC"
          subtitle="Hoàn tất xác thực người đại diện để sử dụng các tính năng giao dịch trên BackHaulBid."
          breadcrumbs={[{ label: "Trang chủ", path: "/" }, { label: "eKYC" }]}
        />

        <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <AppCard className="p-4 sm:p-6" showAccent={false}>
            <Box className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <Box className="flex items-center gap-3">
                <Box className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-[#1B4965]">
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography variant="h6" className="!font-bold text-slate-800">
                    Xác thực bằng CCCD và khuôn mặt
                  </Typography>
                  <Typography variant="body2" className="text-slate-500">
                    Làm theo hướng dẫn của VNPT eKYC trên màn hình.
                  </Typography>
                </Box>
              </Box>
              <Chip
                icon={<SecurityIcon />}
                label="Bảo mật"
                color="info"
                variant="outlined"
                className="!w-fit !font-bold"
              />
            </Box>

            <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <VNPTEkyc onResult={handleEkycResult} />
            </Box>
          </AppCard>

          <Box className="flex flex-col gap-6">
            <AppCard className="p-5 sm:p-6" showAccent={false}>
              <Typography variant="h6" className="!font-bold text-slate-800">
                Cần chuẩn bị gì?
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-500">
                Chuẩn bị trước các điều kiện sau để xác thực không bị gián đoạn.
              </Typography>

              <Box component="ol" className="mt-5 space-y-4">
                {[
                  "CCCD bản gốc còn rõ thông tin và không bị che khuất.",
                  "Thiết bị có camera và cho phép trình duyệt truy cập camera.",
                  "Đứng ở nơi đủ sáng, nhìn thẳng và làm đúng hướng dẫn chuyển động.",
                ].map((item, index) => (
                  <Box component="li" key={item} className="flex gap-3">
                    <Box className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B4965] text-sm font-bold text-white">
                      {index + 1}
                    </Box>
                    <Typography variant="body2" className="pt-1 text-slate-600">
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box className="mt-5 flex gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-cyan-900">
                <InfoOutlinedIcon className="mt-0.5 !text-lg" />
                <Typography variant="caption">
                  Nếu thiếu cấu hình access token, hệ thống sẽ thông báo rõ biến cần bổ sung thay vì hiển thị lỗi kỹ thuật.
                </Typography>
              </Box>
            </AppCard>

            <AppCard className="p-5 sm:p-6" showAccent={false}>
              <Box className="flex items-center gap-2">
                <CheckCircleOutlineIcon className="text-emerald-600" />
                <Typography variant="h6" className="!font-bold text-slate-800">
                  Kết quả xác thực
                </Typography>
              </Box>

              {result ? (
                <Box className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4" role="status">
                  <Typography variant="body2" className="!font-semibold text-emerald-800">
                    VNPT đã trả về kết quả. Hãy tiếp tục theo bước xác nhận trên màn hình.
                  </Typography>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-[#1B4965]">
                      Dữ liệu kỹ thuật
                    </summary>
                    <Box className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-300">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </Box>
                  </details>
                </Box>
              ) : (
                <Box className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4" role="status">
                  <Typography variant="body2" className="!font-semibold text-slate-700">
                    Chưa có kết quả xác thực
                  </Typography>
                  <Typography variant="caption" className="mt-1 block text-slate-500">
                    Hoàn tất các bước CCCD và khuôn mặt ở khung bên trái để nhận kết quả.
                  </Typography>
                </Box>
              )}
            </AppCard>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
