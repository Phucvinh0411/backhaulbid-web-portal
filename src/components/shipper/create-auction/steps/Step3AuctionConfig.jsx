"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScheduleReminder from "./route/ScheduleReminder";
import { AUCTION_TIME_FIELDS, suggestAuctionSchedule } from "../auctionSchedule";

import {
  formatDisplayNumber,
  getParticipationFeeQuote,
  parseDisplayNumber,
} from "../mockData";

export default function Step3AuctionConfig({ form, updateForm }) {
  const isSealed = form.auctionType === "SEALED";
  const isDepositRequired = form.isDepositRequired ?? true;
  const isParticipationFeeRequired = true;
  const participationFeeQuote = getParticipationFeeQuote(form.maxPrice);

  const [autoFilled, setAutoFilled] = useState(false);

  const applySuggestedSchedule = () => {
    const suggestion = suggestAuctionSchedule(form);
    AUCTION_TIME_FIELDS.forEach((field) => updateForm(field, suggestion[field]));
    setAutoFilled(true);
  };

  // Fill the timeframe once when the shipper first reaches this step; after that every field is theirs to edit.
  useEffect(() => {
    if (AUCTION_TIME_FIELDS.every((field) => !form[field])) applySuggestedSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDepositRequired = (checked) => {
    updateForm("isDepositRequired", checked);
    if (checked && !form.depositAmount) {
      updateForm("depositAmount", Math.floor((form.maxPrice || 0) * 0.1));
    }
    if (!checked) updateForm("depositAmount", 0);
  };

  return (
    <div className="space-y-6">
      {/* Category 1: Auction Mode Selection */}
      <div className="bg-white rounded-xl border border-line/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
            <GavelIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-ink !text-sm">
            1. Chọn Hình Thức Đấu Giá
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PUBLIC Card */}
          <div
            onClick={() => updateForm("auctionType", "PUBLIC")}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
              !isSealed
                ? "border-info bg-info-soft/70 shadow-md ring-2 ring-info-soft"
                : "border-line bg-white hover:border-line-strong hover:bg-surface-sunken"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-info-soft text-info flex items-center justify-center">
                  <PublicIcon className="!text-[1.1rem]" />
                </div>
                <span className="font-black text-ink text-sm">Đấu Giá Công Khai (Open Bid)</span>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isSealed ? "border-info bg-info" : "border-line-strong"}`}>
                {!isSealed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>

            <p className="text-[0.73rem] text-ink-muted leading-relaxed font-medium">
              Giá thầu được <strong>công khai theo thời gian thực</strong>. Các nhà xe thấy giá nhau và liên tục điều chỉnh giảm giá. Hệ thống tự động chọn nhà xe có giá thấp nhất khi hết giờ.
            </p>

            <span className="text-[0.65rem] font-extrabold text-info bg-info-soft px-2.5 py-1 rounded-lg w-fit">
              Phù hợp với hàng bách hóa, nông sản, vận tải phổ thông
            </span>
          </div>

          {/* SEALED Card */}
          <div
            onClick={() => updateForm("auctionType", "SEALED")}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
              isSealed
                ? "border-warning bg-warning-soft/70 shadow-md ring-2 ring-warning-soft"
                : "border-line bg-white hover:border-line-strong hover:bg-surface-sunken"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-warning-soft text-warning flex items-center justify-center">
                  <LockIcon className="!text-[1.1rem]" />
                </div>
                <span className="font-black text-ink text-sm">Đấu Giá Kín (Sealed Bid)</span>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSealed ? "border-warning bg-warning" : "border-line-strong"}`}>
                {isSealed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>

            <p className="text-[0.73rem] text-ink-muted leading-relaxed font-medium">
              Giá thầu <strong>bảo mật tuyệt đối</strong> giữa các nhà xe. Mỗi nhà xe chỉ biết giá của mình. Sau khi đóng phiên, chủ hàng xem danh sách xếp hạng và chủ động chọn người thắng thầu.
            </p>

            <span className="text-[0.65rem] font-extrabold text-warning bg-warning-soft px-2.5 py-1 rounded-lg w-fit">
              Phù hợp với linh kiện cao cấp, hàng đông lạnh, siêu trường
            </span>
          </div>
        </div>
      </div>

      {/* Category 2: Financial Config */}
      <div className="bg-white rounded-xl border border-line/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <div className="w-8 h-8 rounded-xl bg-success-soft text-success flex items-center justify-center">
            <span className="font-black text-sm">$</span>
          </div>
          <Typography className="!font-black text-ink !text-sm">
            2. Cấu Hình Tài Chính & Tiền Cọc
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Giá trần tối đa (VNĐ)"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(form.maxPrice)}
            onChange={(e) => {
              const val = parseDisplayNumber(e.target.value);
              updateForm("maxPrice", val);
              updateForm("participationFee", getParticipationFeeQuote(val).amount);
              if (isDepositRequired) {
                updateForm("depositAmount", Math.floor(val * 0.1));
              }
            }}
            placeholder="VD: 12.500.000"
            required
            helperText="Giá tối đa chủ hàng chấp nhận chi trả"
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-ink-muted">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontFamily: "monospace", fontWeight: 700, fontSize: "1rem" } }}
          />

          <TextField
            fullWidth
            label="Bước giá tối thiểu (VNĐ)"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(form.priceStep)}
            onChange={(e) => updateForm("priceStep", parseDisplayNumber(e.target.value))}
            placeholder="VD: 100.000"
            helperText="Mức giảm tối thiểu mỗi lượt thầu"
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-ink-muted">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-xl border p-4 transition-colors ${isParticipationFeeRequired ? "border-info-soft bg-info-soft/60" : "border-line bg-surface-sunken/60"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isParticipationFeeRequired ? "bg-info-soft text-info" : "bg-line text-ink-muted"}`}>
                  <PaymentsIcon className="!text-[1.1rem]" />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">Phí tham gia</p>
                  <p className="text-[0.7rem] text-ink-muted leading-relaxed mt-0.5">Phí dịch vụ, thu một lần khi nhà xe đăng ký.</p>
                </div>
              </div>
            </div>
            {isParticipationFeeRequired ? (
              <TextField
                fullWidth
                label="Mức phí (VNĐ)"
                type="text"
                inputMode="numeric"
                value={formatDisplayNumber(participationFeeQuote.amount)}
                helperText={`Auto-calculated from max price (${participationFeeQuote.tier})`}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-ink-muted">đ</span></InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", backgroundColor: "white" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
              />
            ) : (
              <p className="text-xs font-semibold text-ink-muted bg-white/70 border border-line rounded-xl px-3 py-2.5">Miễn phí tham gia phiên đấu giá.</p>
            )}
          </div>

          <div className={`rounded-xl border p-4 transition-colors ${isDepositRequired ? "border-warning-soft bg-warning-soft/60" : "border-line bg-surface-sunken/60"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDepositRequired ? "bg-warning-soft text-warning" : "bg-line text-ink-muted"}`}>
                  <SecurityIcon className="!text-[1.1rem]" />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">Tiền đặt cọc</p>
                  <p className="text-[0.7rem] text-ink-muted leading-relaxed mt-0.5">Khóa tạm trong ví, hoàn lại theo điều kiện phiên.</p>
                </div>
              </div>
              <FormControlLabel
                label=""
                control={<Switch size="small" checked={isDepositRequired} onChange={(e) => setDepositRequired(e.target.checked)} color="warning" />}
                sx={{ margin: 0 }}
              />
            </div>
            {isDepositRequired ? (
              <TextField
                fullWidth
                label="Mức cọc (VNĐ)"
                type="text"
                inputMode="numeric"
                value={formatDisplayNumber(form.depositAmount)}
                onChange={(e) => updateForm("depositAmount", parseDisplayNumber(e.target.value))}
                helperText="Gợi ý mặc định: 10% giá trần"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-ink-muted">đ</span></InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", backgroundColor: "white" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
              />
            ) : (
              <p className="text-xs font-semibold text-ink-muted bg-white/70 border border-line rounded-xl px-3 py-2.5">Không yêu cầu nhà xe đặt cọc.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Số lượt ra giá tối đa"
            type="number"
            name="maxBids" value={form.maxBids}
            onChange={(e) => updateForm("maxBids", Number(e.target.value))}
            helperText="Lần / nhà xe"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
          <div className="rounded-xl border border-line bg-surface-sunken/70 px-4 py-3 flex items-start gap-2.5">
            <InfoOutlinedIcon className="!text-[1.1rem] text-ink-subtle mt-0.5" />
            <p className="text-[0.7rem] text-ink-muted leading-relaxed">Nhà xe sẽ thấy rõ từng khoản và tổng thanh toán trước khi xác nhận đăng ký.</p>
          </div>
        </div>
      </div>

      {/* Category 3: Timeframe */}
      <div className="bg-white rounded-xl border border-line/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <div className="w-8 h-8 rounded-xl bg-info-soft text-info flex items-center justify-center">
            <CalendarMonthIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-ink !text-sm">
            3. Khung Thời Gian Diễn Ra Phiên Đấu Giá
          </Typography>
          <Button size="small" onClick={applySuggestedSchedule} sx={{ ml: "auto", textTransform: "none", fontWeight: 700 }}>
            Gợi ý lại
          </Button>
        </div>

        {autoFilled && (
          <p className="text-[0.72rem] text-ink-muted">
            {form.earliestPickup || form.latestPickup
              ? "Đã tự điền theo khung vận chuyển ở Bước 2."
              : "Đã tự điền mặc định: đăng ký 1 ngày, đấu giá 2 giờ."}{" "}
            Bạn có thể sửa từng mốc bên dưới.
          </p>
        )}

        <ScheduleReminder form={form} step="auction" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            type="datetime-local"
            label="Mở đăng ký tham gia"
            name="regStartTime" value={form.regStartTime}
            onChange={(e) => updateForm("regStartTime", e.target.value)}
            max={form.regEndTime || undefined}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Đóng đăng ký tham gia"
            name="regEndTime" value={form.regEndTime}
            onChange={(e) => updateForm("regEndTime", e.target.value)}
            min={form.regStartTime || undefined}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            type="datetime-local"
            label="Bắt đầu đấu giá trực tiếp"
            name="startTime" value={form.startTime}
            onChange={(e) => updateForm("startTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Kết thúc đấu giá (Đóng thầu)"
            name="endTime" value={form.endTime}
            onChange={(e) => updateForm("endTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>
    </div>
  );
}
