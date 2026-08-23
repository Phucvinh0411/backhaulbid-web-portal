"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { COMPLAINT_ROLE_LABELS, formatComplaintTime } from "./complaintPresentation";

export default function ComplaintConversation({
  messages = [],
  viewerRole,
  onSend,
  sending = false,
  error = "",
  disabled = false,
  realtimeStatus = "idle",
}) {
  const { notify } = useGlobalNotification();
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef(null);
  const orderedMessages = useMemo(
    () => [...messages].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt)),
    [messages],
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [orderedMessages.length]);

  useEffect(() => {
    if (error) notify.error(error);
  }, [error, notify]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending || disabled) return;
    await onSend(content);
    setDraft("");
  };

  return (
    <Box sx={{ border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#FFFFFF", overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75, borderBottom: "1px solid #F1F5F9", bgcolor: "#F8FAFC" }}>
        <Typography sx={{ color: "#1E293B", fontWeight: 800 }}>Trao đổi về khiếu nại</Typography>
        <Typography variant="caption" sx={{ color: "#64748B" }}>
          Mọi tin nhắn được lưu vào hồ sơ để Admin và các bên cùng theo dõi.
        </Typography>
        {realtimeStatus !== "idle" && (
          <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: realtimeStatus === "connected" ? "#15803D" : "#B45309", fontWeight: 700 }}>
            {realtimeStatus === "connected" ? "Dang dong bo realtime" : realtimeStatus === "connecting" ? "Dang ket noi realtime" : "Dang ket noi lai realtime"}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxHeight: 420,
          minHeight: 160,
          overflowY: "auto",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {orderedMessages.length === 0 && (
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Chưa có trao đổi nào. Hãy gửi tin nhắn đầu tiên để bổ sung thông tin.
          </Typography>
        )}
        {orderedMessages.map((message) => {
          const mine = message.senderRole === viewerRole;
          return (
            <Box key={message.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <Box
                sx={{
                  maxWidth: { xs: "92%", sm: "75%" },
                  px: 1.75,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: mine ? "#1B4965" : "#F1F5F9",
                  color: mine ? "#FFFFFF" : "#1E293B",
                }}
              >
                <Typography variant="caption" sx={{ display: "block", color: mine ? "rgba(255,255,255,0.72)" : "#64748B", fontWeight: 800 }}>
                  {mine ? "Bạn" : COMPLAINT_ROLE_LABELS[message.senderRole] || message.senderRole} · {formatComplaintTime(message.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.25 }}>{message.message}</Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={chatEndRef} />
      </Box>
      <Box sx={{ borderTop: "1px solid #F1F5F9", p: { xs: 1.5, sm: 2 } }}>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        {disabled ? (
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            Khiếu nại đã đóng, chỉ có thể xem lại lịch sử trao đổi.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={4}
              label="Tin nhắn"
              placeholder="Nhập nội dung trao đổi..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              inputProps={{ maxLength: 2000, "aria-label": "Nội dung tin nhắn khiếu nại" }}
            />
            <Button
              variant="contained"
              aria-label="Gửi tin nhắn"
              onClick={() => void handleSend()}
              disabled={sending || !draft.trim()}
              sx={{ minWidth: 48, minHeight: 40, borderRadius: 2, bgcolor: "#1B4965", "&:hover": { bgcolor: "#0D2B3E" } }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
