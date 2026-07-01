"use client";

import { PageHeader } from "@/components/common";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Helper function to map paths to human-readable Vietnamese titles
const getPageTitle = (slug) => {
  if (!slug || slug.length === 0) return "Trang";
  
  const lastSegment = slug[slug.length - 1];
  
  const translations = {
    // Bidding
    sessions: "Danh sách phiên đấu giá",
    create: "Tạo phiên đấu giá mới",
    history: "Lịch sử đấu giá",
    bidding: "Đấu giá vận tải",
    
    // Fleet
    vehicles: "Quản lý phương tiện",
    drivers: "Quản lý tài xế",
    routes: "Quản lý tuyến đường",
    fleet: "Quản lý đội xe",
    
    // Contracts
    active: "Hợp đồng đang hoạt động",
    pending: "Hợp đồng chờ duyệt",
    completed: "Hợp đồng đã hoàn thành",
    contracts: "Hợp đồng vận chuyển",
    
    // Management
    users: "Quản lý người dùng",
    overview: "Tổng quan ví & giao dịch",
    transactions: "Lịch sử giao dịch",
    wallet: "Ví & Thanh toán",
    reports: "Báo cáo thống kê",
    settings: "Cài đặt hệ thống",
  };
  
  return translations[lastSegment] || lastSegment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
};

export default function CatchAllDashboardPage({ params }) {
  const slug = params.slug || [];
  const slugPath = `/${slug.join("/")}`;
  const pageTitle = getPageTitle(slug);

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={`Thông tin chi tiết phân hệ ${pageTitle.toLowerCase()}`}
        breadcrumbs={[
          { label: "Trang chủ", path: "/" },
          ...slug.slice(0, -1).map((segment, index) => ({
            label: getPageTitle([segment]),
            path: `/${slug.slice(0, index + 1).join("/")}`,
          })),
          { label: pageTitle },
        ]}
      />

      <Card 
        sx={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CardContent className="text-center space-y-4 !p-8">
          <Box
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto animate-float"
            style={{
              background: "linear-gradient(135deg, rgba(27,73,101,0.08) 0%, rgba(95,168,211,0.08) 100%)",
              border: "1px solid rgba(95, 168, 211, 0.15)",
              boxShadow: "0 4px 12px rgba(27, 73, 101, 0.03)",
            }}
          >
            <Typography variant="h5">🚧</Typography>
          </Box>
          
          <div className="space-y-1.5">
            <Typography variant="h6" className="!font-bold text-slate-700">
              Phân hệ đang được thiết lập
            </Typography>
            <Typography variant="body2" className="text-slate-400 max-w-sm mx-auto">
              Giao diện cấu trúc cho trang <code className="bg-slate-100 text-[#1B4965] px-1.5 py-0.5 rounded font-mono text-[0.8rem]">{slugPath}</code> đã hoàn tất. Logic tính năng đang được đồng bộ hóa.
            </Typography>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
