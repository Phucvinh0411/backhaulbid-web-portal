"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const mockComplaints = [
  {
    id: "BHB-8492",
    title: "Hàng hỏng / thiếu số lượng",
    time: "10 phút trước",
    status: "PROCESSING",
    badge: "Shipper Report",
  },
  {
    id: "BHB-8470",
    title: "Xe đến trễ / không đúng lịch",
    time: "2 giờ trước",
    status: "PENDING",
  },
  {
    id: "BHB-8415",
    title: "Sai thông tin xe tải",
    time: "Hôm qua",
    status: "PROCESSING",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "Shipper ABC",
    time: "10:05 AM",
    text:
      "Hàng giao tới kho lúc 8h sáng nay bị ướt 3 thùng carton. Xe tải thùng bạt bị rách góc phải. Yêu cầu bồi thường 15% giá trị chuyến đi.",
    role: "shipper",
    avatar: "S",
  },
  {
    id: 2,
    sender: "Carrier Bình",
    time: "10:42 AM",
    text:
      "Tôi đã che chắn kỹ. Lúc nhận hàng trời đang mưa to, bốc xếp kho kéo hàng ra ngoài hiên lâu nên mới ướt. Camera kho có thể kiểm tra lại.",
    role: "carrier",
    avatar: "C",
  },
  {
    id: 3,
    type: "system",
    text: "Admin đã yêu cầu trích xuất camera lúc 11:00 AM",
  },
];

const decisionLabels = {
  shipper_win: "Shipper nhận bồi thường",
  carrier_win: "Bác bỏ khiếu nại",
  both: "Phạt cả hai bên",
};

function ComplaintStatus({ status }) {
  if (status === "PROCESSING") {
    return <AdminStatusChip label="Đang xử lý" tone="warning" />;
  }
  return <AdminStatusChip label="Chờ duyệt" tone="neutral" />;
}

export default function AdminComplaintsPage() {
  const [selectedId, setSelectedId] = useState(mockComplaints[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [decision, setDecision] = useState("shipper_win");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const filteredComplaints = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return mockComplaints.filter((complaint) => {
      return (
        query.length === 0 ||
        complaint.id.toLocaleLowerCase("vi").includes(query) ||
        complaint.title.toLocaleLowerCase("vi").includes(query)
      );
    });
  }, [searchQuery]);

  const selectedComplaint = mockComplaints.find((complaint) => complaint.id === selectedId) || mockComplaints[0];

  const handleKeyDown = useCallback(
    (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          setOpenConfirmDialog(true);
          event.preventDefault();
        }
        return;
      }

      const currentIndex = mockComplaints.findIndex((complaint) => complaint.id === selectedId);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, mockComplaints.length - 1);
        setSelectedId(mockComplaints[nextIndex].id);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const previousIndex = Math.max(currentIndex - 1, 0);
        setSelectedId(mockComplaints[previousIndex].id);
      }
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpenConfirmDialog(true);
      }
    },
    [selectedId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Giải quyết khiếu nại"
        subtitle="Xử lý tranh chấp giữa chủ hàng và nhà xe bằng hồ sơ, bằng chứng và kết luận rõ ràng."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/complaints" },
          { label: "Khiếu nại" },
        ]}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <AdminSectionCard title="Danh sách khiếu nại" subtitle={`${filteredComplaints.length} hồ sơ`} sx={{ height: "100%" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <AdminSearchField
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm mã đơn, nội dung..."
              />
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filteredComplaints.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <Box
                    key={item.id}
                    component="button"
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "rgba(27, 73, 101, 0.08)" : "background.paper",
                      borderRadius: "10px",
                      p: 2,
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", bgcolor: isSelected ? "rgba(27, 73, 101, 0.08)" : "rgba(27, 73, 101, 0.04)" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: isSelected ? "primary.main" : "text.primary", fontWeight: 700 }}>
                        #{item.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                        {item.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.25 }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <ComplaintStatus status={item.status} />
                      {item.badge && <AdminStatusChip label={item.badge} tone="primary" />}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AdminSectionCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <AdminSectionCard
            title={
              <Box component="span">
                Chi tiết khiếu nại <Box component="span" sx={{ color: "primary.main" }}>#{selectedComplaint.id}</Box>
              </Box>
            }
            subtitle="Mở lúc 09:45 AM, 24/10/2026"
            action={<AdminSecondaryButton startIcon={<DownloadIcon />}>Tải hồ sơ</AdminSecondaryButton>}
            sx={{ minHeight: 640, height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
                  gap: 2,
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  bgcolor: "rgba(27, 73, 101, 0.02)",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>S</Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      SHIPPER (NGUYÊN ĐƠN)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                      Công ty TNHH Vận tải ABC
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Lý do: Hàng hóa bị ẩm ướt trong quá trình vận chuyển.
                    </Typography>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: "info.main", fontWeight: 700 }}>C</Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      CARRIER (BỊ ĐƠN)
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                      Nguyễn Văn Bình
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Biển số: 51C-889.22
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography sx={{ color: "text.primary", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <InsertDriveFileOutlinedIcon fontSize="small" /> Bằng chứng đính kèm
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {["Evidence 1", "Evidence 2"].map((label) => (
                    <Box
                      key={label}
                      sx={{
                        width: 132,
                        height: 92,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "10px",
                        bgcolor: "rgba(27, 73, 101, 0.02)",
                        display: "grid",
                        placeItems: "center",
                        color: "text.secondary",
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Box>
                  ))}
                  <Box
                    component="button"
                    type="button"
                    sx={{
                      width: 132,
                      height: 92,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                      color: "primary.main",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <AddCircleOutlineIcon fontSize="small" />
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 800 }}>
                        Yêu cầu thêm tài liệu
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography sx={{ color: "text.primary", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <ChatBubbleOutlineIcon fontSize="small" /> Nhật ký trao đổi
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {mockMessages.map((message) => {
                    if (message.type === "system") {
                      return (
                        <Box key={message.id} sx={{ display: "flex", justifyContent: "center" }}>
                          <AdminStatusChip label={message.text} tone="neutral" icon={<SearchIcon />} />
                        </Box>
                      );
                    }

                    const isShipper = message.role === "shipper";
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: "flex",
                          flexDirection: isShipper ? "row" : "row-reverse",
                          gap: 1.5,
                          alignItems: "flex-start",
                        }}
                      >
                        <Avatar sx={{ bgcolor: isShipper ? "primary.main" : "info.main", width: 34, height: 34, fontWeight: 700 }}>
                          {message.avatar}
                        </Avatar>
                        <Box sx={{ maxWidth: "76%", textAlign: isShipper ? "left" : "right" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                            {message.sender} • {message.time}
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.5,
                              p: 1.5,
                              borderRadius: "10px",
                              bgcolor: isShipper ? "background.paper" : "primary.main",
                              color: isShipper ? "text.primary" : "primary.contrastText",
                              border: "1px solid",
                              borderColor: isShipper ? "divider" : "primary.main",
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "rgba(27, 73, 101, 0.02)" }}>
              <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}>
                Kết luận & xử lý
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.5 }}>
                <TextField
                  placeholder="Nhập tóm tắt kết luận và căn cứ giải quyết..."
                  size="small"
                  fullWidth
                  sx={{ bgcolor: "background.paper", "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
                  <FormControl size="small" sx={{ minWidth: 220, bgcolor: "background.paper" }}>
                    <Select value={decision} onChange={(event) => setDecision(event.target.value)} sx={{ borderRadius: "8px" }}>
                      <MenuItem value="shipper_win">Shipper nhận bồi thường</MenuItem>
                      <MenuItem value="carrier_win">Bác bỏ khiếu nại</MenuItem>
                      <MenuItem value="both">Phạt cả hai bên</MenuItem>
                    </Select>
                  </FormControl>
                  <AdminPrimaryButton onClick={() => setOpenConfirmDialog(true)} sx={{ minWidth: 150 }}>
                    Chốt phương án
                  </AdminPrimaryButton>
                </Box>
              </Box>
            </Box>
          </AdminSectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px", maxWidth: 460 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary", fontWeight: 700 }}>
          <ErrorOutlineIcon sx={{ color: "warning.dark" }} /> Xác nhận chốt khiếu nại
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Bạn đang chuẩn bị chốt quyết định cho hồ sơ <strong>#{selectedId}</strong>.
          </Typography>
          <Box sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "10px", bgcolor: "rgba(27, 73, 101, 0.02)" }}>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
              {decisionLabels[decision]}
            </Typography>
          </Box>
          <Box sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: "warning.light", borderRadius: "10px", bgcolor: "rgba(237, 108, 2, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 600 }}>
              Quyết định cuối cùng sẽ được gửi đến hai bên và có thể tác động đến số dư ví của người dùng.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AdminSecondaryButton onClick={() => setOpenConfirmDialog(false)}>Xem lại</AdminSecondaryButton>
          <AdminPrimaryButton
            onClick={() => {
              setOpenConfirmDialog(false);
              alert("Đã chốt phương án thành công.");
            }}
          >
            Chốt quyết định
          </AdminPrimaryButton>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
