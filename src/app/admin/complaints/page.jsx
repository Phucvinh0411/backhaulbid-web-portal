"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/common";

export default function AdminComplaintsPage() {
  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Báo cáo Khiếu nại" 
        subtitle="Quản lý và giải quyết các báo cáo vi phạm, khiếu nại từ người dùng"
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "#" },
          { label: "Khiếu nại" },
        ]}
      />

      <Card className="glass mt-6 text-center py-20" sx={{ borderRadius: "16px" }}>
        <CardContent>
          <Typography variant="h5" className="text-slate-500 mb-2 font-bold">
            Tính năng đang phát triển
          </Typography>
          <Typography variant="body1" className="text-slate-400">
            Trang Quản lý khiếu nại sẽ sớm được cập nhật đầy đủ tính năng.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
