"use client";

import { useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";

const COMMENT_LIMIT = 1000;
const RATING_LABELS = ["", "Rất tệ", "Chưa tốt", "Bình thường", "Tốt", "Rất tốt"];

/**
 * The shipper's one review of a completed trip. Sends only the star rating and the trimmed comment;
 * the server takes the carrier and shipper from the trip. A 409 means a review already exists, so the
 * parent reloads the trip's review instead of showing an error.
 */
export default function TripReviewDialog({ open, tripId, onClose, onSaved }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const reset = () => {
    setRating(null);
    setComment("");
    setFieldError("");
    setError("");
  };

  const close = () => {
    if (submittingRef.current) return;
    reset();
    onClose?.();
  };

  /** Sends the review once; a double click while the request is in flight is ignored. */
  const submit = async () => {
    if (submittingRef.current) return;
    if (!rating) {
      setFieldError("Chọn từ 1 đến 5 sao.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const trimmed = comment.trim();
      const saved = await contractApi.createTripReview(tripId, { rating, comment: trimmed || null });
      reset();
      onSaved?.(saved);
    } catch (requestError) {
      if (requestError?.response?.status === 409) {
        reset();
        onSaved?.(null);
        return;
      }
      setError(getApiErrorMessage(requestError, "Chưa gửi được đánh giá. Vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      busy={submitting}
      maxWidth="xs"
      title="Đánh giá nhà xe"
      titleId="trip-review-title"
      actions={
        <>
          <Button color="inherit" onClick={close} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="contained" onClick={submit} disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2" color="text.secondary">
          Đánh giá đã gửi không sửa hoặc xóa được. Số sao không thay đổi điểm uy tín của nhà xe.
        </Typography>
        <Box>
          <Rating
            name="trip-review-rating"
            value={rating}
            size="large"
            disabled={submitting}
            aria-label="Số sao đánh giá"
            onChange={(_, value) => {
              setRating(value);
              setFieldError("");
            }}
          />
          <Typography
            variant="caption"
            display="block"
            role={fieldError ? "alert" : undefined}
            color={fieldError ? "error" : "text.secondary"}
          >
            {fieldError || (rating ? RATING_LABELS[rating] : "Chọn số sao (bắt buộc)")}
          </Typography>
        </Box>
        <TextField
          label="Nhận xét (không bắt buộc)"
          multiline
          minRows={3}
          value={comment}
          disabled={submitting}
          onChange={(event) => setComment(event.target.value.slice(0, COMMENT_LIMIT))}
          helperText={`${comment.length}/${COMMENT_LIMIT}. Không ghi email hoặc số điện thoại trong nhận xét.`}
        />
      </Box>
    </ResponsiveDialog>
  );
}
