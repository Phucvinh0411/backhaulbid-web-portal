import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import { declareEmptyRoute } from "@/services/fleetApi";
import { VIETNAM_PROVINCES } from "@/utils/provinces";

export default function EmptyRouteDialog({ open, onClose, vehicles = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [truckId, setTruckId] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  
  // Toạ độ thực tế thay đổi theo điểm xuất phát
  const [latitude, setLatitude] = useState(10.8231);
  const [longitude, setLongitude] = useState(106.6297);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!truckId || !expectedTime || !origin || !destination) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await declareEmptyRoute({
        truckId,
        companyId: "MY_COMPANY", // Phía backend có thể sẽ bỏ qua hoặc cần thay thế nếu thực sự yêu cầu
        expectedEmptyTime: expectedTime + ":00", // Thêm giây
        latitude,
        longitude,
        origin,
        destination
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Khai báo xe rỗng chiều thất bại.");
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
      setError("");
      setSuccess(false);
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
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Khai báo thành công! Hệ thống sẽ thông báo khi có lô hàng phù hợp.</Alert>}
          
          <TextField
            select
            label="Chọn xe rỗng"
            fullWidth
            required
            value={truckId}
            onChange={(e) => setTruckId(e.target.value)}
            disabled={loading || success}
          >
            {vehicles.length === 0 && <MenuItem value="" disabled>Chưa có xe nào được xác minh</MenuItem>}
            {vehicles.map((v) => (
              <MenuItem key={v.id || v.licensePlate} value={v.id || v.licensePlate}>
                {v.licensePlate} - {v.type} ({v.capacity})
              </MenuItem>
            ))}
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
            disabled={loading || success}
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
            onChange={(e, newValue) => setDestination(newValue ? newValue.name : "")}
            disabled={loading || success}
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
            disabled={loading || success}
          />
          
          <Alert severity="info" className="!mt-2 text-sm">
            Hệ thống BackhaulBid sẽ tự động quét và đề xuất các lô hàng (chiều về) phù hợp nhất với tải trọng, lộ trình và thời gian dự kiến của xe. Bạn sẽ nhận được thông báo ngay khi có kết quả.
          </Alert>

        </DialogContent>
        <DialogActions className="px-6 py-4">
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success}
            sx={{ bgcolor: "#1B4965", "&:hover": { bgcolor: "#0a1929" } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi khai báo"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
