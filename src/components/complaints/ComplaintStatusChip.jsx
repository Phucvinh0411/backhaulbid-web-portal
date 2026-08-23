"use client";

import Chip from "@mui/material/Chip";
import { getComplaintStatusMeta } from "./complaintPresentation";

const toneStyles = {
  success: { backgroundColor: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" },
  warning: { backgroundColor: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  danger: { backgroundColor: "#FFF1F2", color: "#BE123C", borderColor: "#FECDD3" },
  info: { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
  neutral: { backgroundColor: "#F8FAFC", color: "#475569", borderColor: "#E2E8F0" },
};

export default function ComplaintStatusChip({ status, ...props }) {
  const meta = getComplaintStatusMeta(status);
  const style = toneStyles[meta.tone] || toneStyles.neutral;

  return (
    <Chip
      {...props}
      label={meta.label}
      size="small"
      sx={{
        ...style,
        border: "1px solid",
        borderRadius: 1.5,
        fontWeight: 800,
        fontSize: "0.72rem",
        height: 26,
        ...props.sx,
      }}
    />
  );
}
