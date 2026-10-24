import CircularProgress from "@mui/material/CircularProgress";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TouchAppIcon from "@mui/icons-material/TouchAppOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";

const STATUS_MESSAGE = {
  idle: "Chạm vào bản đồ hoặc tìm địa chỉ để đặt ghim. Có thể kéo ghim để chỉnh đúng cổng kho.",
  loading: "Đang xác định địa chỉ tại ghim…",
  notFound: "Không xác định được địa chỉ tại điểm này. Hãy chọn một điểm khác gần đường hoặc công trình.",
  error: "Chưa lấy được địa chỉ do lỗi kết nối. Thử chạm lại vào bản đồ.",
};

/** What the dialog will save: the resolved address, or why there is none yet. */
export default function ResolvedPlacePanel({ place, status }) {
  if (status === "ready" && place?.address) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-sunken/60 p-3">
        <LocationOnIcon className="mt-0.5 text-danger" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{place.locationName}</p>
          <p className="text-xs font-medium text-ink-muted">{place.address}</p>
        </div>
      </div>
    );
  }

  const isProblem = status === "notFound" || status === "error";
  const Icon = isProblem ? WarningAmberIcon : TouchAppIcon;
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${isProblem ? "border-warning-soft bg-warning-soft/40" : "border-line bg-surface-sunken/60"}`}>
      {status === "loading" ? <CircularProgress size={18} /> : <Icon className={isProblem ? "text-warning" : "text-ink-subtle"} />}
      <p className="text-xs font-medium text-ink-muted">{STATUS_MESSAGE[status] ?? STATUS_MESSAGE.idle}</p>
    </div>
  );
}
