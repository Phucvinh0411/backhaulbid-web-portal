import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { declareEmptyRoute } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { VIETNAM_PROVINCES } from "@/utils/provinces";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function EmptyRouteDialog({ open, onClose, vehicles = [] }) {
  const notify = useGlobalNotification();
  const [loading, setLoading] = useState(false);

  // Form state
  const [truckId, setTruckId] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // Toạ độ thực tế thay đổi theo điểm xuất phát
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!truckId || !expectedTime || !origin || !destination) {
      notify.warning("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (latitude === null || longitude === null) {
      notify.warning("Vui lòng chọn tỉnh/thành phố điểm bắt đầu để xác định tọa độ.");
      return;
    }

    setLoading(true);

    try {
      await declareEmptyRoute({
        truckId,
        expectedEmptyTime: expectedTime + ":00", // Thêm giây
        latitude,
        longitude,
        origin,
        destination,
      });
      notify.success(
        "Khai báo thành công! Hệ thống sẽ thông báo khi có lô hàng phù hợp.",
      );
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      notify.error(
        getApiErrorMessage(
          err,
          "Khai báo xe rỗng chiều thất bại. Vui lòng kiểm tra thông tin rồi thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTruckId("");
      setExpectedTime("");
      setOrigin("");
      setDestination("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" className="font-bold text-[#1B4965]">
          Khai báo chuyến xe rỗng chiều
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers className="flex flex-col gap-4">
          <TextField
            select
            label="Chọn xe rỗng"
            fullWidth
            required
            value={truckId}
            onChange={(e) => setTruckId(e.target.value)}
            disabled={loading}
          >
            {vehicles.length === 0 && (
              <MenuItem value="" disabled>
                Chưa có xe nào trong hệ thống
              </MenuItem>
            )}
            {vehicles.map((v) => {
              const isVerified = (v.verification || v.status) === "VERIFIED";
              return (
                <MenuItem
                  key={v.id || v.licensePlate}
                  value={v.licensePlate || v.plate || ""}
                  disabled={!isVerified}
                >
                  {v.licensePlate} - {v.type} ({v.capacity}){" "}
                  {!isVerified
                    ? `[${v.verification || v.status || "Chờ duyệt"}]`
                    : "✓ Đã duyệt"}
                </MenuItem>
              );
            })}
          </TextField>

          <Autocomplete
            options={VIETNAM_PROVINCES}
            getOptionLabel={(option) => option.name || ""}
            onChange={(e, newValue) => {
              if (newValue) {
                setOrigin(newValue.name);
                setLatitude(newValue.lat);
                setLongitude(newValue.lng);
              } else {
                setOrigin("");
              }
            }}
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Điểm bắt đầu rỗng chiều (Điểm đi)"
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                required
              />
            )}
          />

          <Autocomplete
            options={VIETNAM_PROVINCES}
            getOptionLabel={(option) => option.name || ""}
            onChange={(e, newValue) =>
              setDestination(newValue ? newValue.name : "")
            }
            disabled={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Khu vực mong muốn đến (Điểm đến)"
                placeholder="Ví dụ: Hà Nội"
                required
              />
            )}
          />

          <TextField
            label="Thời gian dự kiến xe rỗng"
            type="datetime-local"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: new Date().toISOString().slice(0, 16),
            }}
            value={expectedTime}
            onChange={(e) => setExpectedTime(e.target.value)}
            disabled={loading}
          />

          <Alert severity="info" className="!mt-2 text-sm">
            Hệ thống BackhaulBid sẽ tự động quét và đề xuất các lô hàng (chiều
            về) phù hợp nhất với tải trọng, lộ trình và thời gian dự kiến của
            xe. Bạn sẽ nhận được thông báo ngay khi có kết quả.
          </Alert>
        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "#1B4965", "&:hover": { bgcolor: "#0a1929" } }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Gửi khai báo"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
