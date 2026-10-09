"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { Panel } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { formatDateTime } from "@/lib/format";
import TripReviewDialog from "./TripReviewDialog";

/**
 * Shipper-only review block for a delivered or completed trip. The review opens only after the shipper
 * accepted the delivery (status COMPLETED); the server enforces the same rule.
 */
export default function TripReviewPanel({ trip }) {
  const [state, setState] = useState({ loading: false, review: null, error: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const completed = trip.status === "COMPLETED";

  /** Loads the trip's review (zero or one). Errors are shown as errors, never as "no review". */
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const reviews = await contractApi.getTripReviews(trip.id);
      setState({ loading: false, review: reviews?.[0] ?? null, error: "" });
    } catch (error) {
      setState({ loading: false, review: null, error: getApiErrorMessage(error, "Chưa tải được đánh giá của chuyến.") });
    }
  }, [trip.id]);

  useEffect(() => {
    if (completed) void load();
  }, [completed, load]);

  if (trip.status !== "COMPLETED" && trip.status !== "DELIVERED") return null;

  return (
    <Panel title="Đánh giá nhà xe">
      {!completed ? (
        <Typography variant="body2" color="text.secondary">
          Xác nhận đã nhận hàng ở phần thao tác phía trên để mở đánh giá nhà xe.
        </Typography>
      ) : state.loading ? (
        <Typography variant="body2" color="text.secondary">Đang tải đánh giá...</Typography>
      ) : state.error ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>
          {state.error}
        </Alert>
      ) : state.review ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Rating value={state.review.rating} readOnly size="small" aria-label={`Đã đánh giá ${state.review.rating} sao`} />
          <Typography variant="body2">{state.review.comment || "Không có nhận xét."}</Typography>
          <Typography variant="caption" color="text.secondary">Đã gửi {formatDateTime(state.review.createdAt)}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
          <Typography variant="body2" color="text.secondary">
            Chuyến đã hoàn tất. Đánh giá giúp chủ hàng khác biết chất lượng vận chuyển của nhà xe.
          </Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>Đánh giá nhà xe</Button>
        </Box>
      )}
      <TripReviewDialog
        open={dialogOpen}
        tripId={trip.id}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          void load();
        }}
      />
    </Panel>
  );
}
