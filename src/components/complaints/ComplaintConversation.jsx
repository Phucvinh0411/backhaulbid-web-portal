"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { COMPLAINT_ROLE_LABELS, REALTIME_STATUS_LABELS, formatComplaintTime } from "./complaintPresentation";

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
  const listRef = useRef(null);
  const orderedMessages = useMemo(
    () => [...messages].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt)),
    [messages],
  );

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [orderedMessages.length]);

  useEffect(() => {
    if (error) notify.error(error);
  }, [error, notify]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending || disabled) return;
    try {
      await onSend(content);
      setDraft("");
    } catch {
      // The parent shows the error; the draft is kept so nothing typed is lost.
    }
  };

  const realtimeLabel = REALTIME_STATUS_LABELS[realtimeStatus];

  return (
    <Box component="section" aria-labelledby="complaint-conversation-title" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper", overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Box>
          <Typography id="complaint-conversation-title" component="h2" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            Trao đổi
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Tin nhắn được lưu vào hồ sơ để các bên và quản trị viên cùng theo dõi.
          </Typography>
        </Box>
        {realtimeLabel && (
          <Typography variant="caption" role="status" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: realtimeStatus === "connected" ? "success.main" : "warning.dark" }}>
            <Box component="span" aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "currentColor" }} />
            {realtimeLabel}
          </Typography>
        )}
      </Box>

      <Box
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Lịch sử trao đổi"
        tabIndex={0}
        sx={{ display: "flex", flexDirection: "column", gap: 1.25, maxHeight: { xs: "50vh", md: 440 }, minHeight: 120, overflowY: "auto", p: 2 }}
      >
        {orderedMessages.length === 0 && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Chưa có trao đổi nào.{disabled ? "" : " Gửi tin nhắn để bổ sung thông tin cho hồ sơ."}
          </Typography>
        )}
        {orderedMessages.map((message) => {
          const mine = message.senderRole === viewerRole;
          return (
            <Box key={message.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <Box
                sx={{
                  maxWidth: { xs: "90%", sm: "75%" },
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: mine ? "primary.main" : "var(--color-surface-sunken)",
                  color: mine ? "common.white" : "text.primary",
                  border: message.senderRole === "ADMIN" && !mine ? "1px solid var(--color-line-strong)" : "none",
                }}
              >
                <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: mine ? "rgba(255,255,255,0.85)" : "text.secondary" }}>
                  {mine ? "Bạn" : COMPLAINT_ROLE_LABELS[message.senderRole] || message.senderRole} · {formatComplaintTime(message.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {message.message}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 1.5 }}>
        {error && (
          <Alert severity="error" role="alert" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        {disabled ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Khiếu nại đã đóng. Bạn vẫn xem được toàn bộ lịch sử trao đổi.
          </Typography>
        ) : (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
            sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              label="Tin nhắn"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              inputProps={{ maxLength: 5000 }}
              helperText="Enter để gửi, Shift + Enter để xuống dòng"
            />
            <Button type="submit" variant="contained" aria-label="Gửi tin nhắn" disabled={sending || !draft.trim()} sx={{ minWidth: 48, minHeight: 44, mb: 2.75 }}>
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
