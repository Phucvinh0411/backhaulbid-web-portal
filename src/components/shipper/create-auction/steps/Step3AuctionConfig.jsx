"use client";

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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <GavelIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
            1. Chọn Hình Thức Đấu Giá
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PUBLIC Card */}
          <div
            onClick={() => updateForm("auctionType", "PUBLIC")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
              !isSealed
                ? "border-sky-500 bg-sky-50/70 shadow-md ring-2 ring-sky-100"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <PublicIcon className="!text-[1.1rem]" />
                </div>
                <span className="font-black text-slate-800 text-sm">Đấu Giá Công Khai (Open Bid)</span>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isSealed ? "border-sky-600 bg-sky-600" : "border-slate-300"}`}>
                {!isSealed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>

            <p className="text-[0.73rem] text-slate-600 leading-relaxed font-medium">
              Giá thầu được <strong>công khai theo thời gian thực</strong>. Các nhà xe thấy giá nhau và liên tục điều chỉnh giảm giá. Hệ thống tự động chọn nhà xe có giá thấp nhất khi hết giờ.
            </p>

            <span className="text-[0.65rem] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg w-fit">
              Phù hợp với hàng bách hóa, nông sản, vận tải phổ thông
            </span>
          </div>

          {/* SEALED Card */}
          <div
            onClick={() => updateForm("auctionType", "SEALED")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
              isSealed
                ? "border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-100"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <LockIcon className="!text-[1.1rem]" />
                </div>
                <span className="font-black text-slate-800 text-sm">Đấu Giá Kín (Sealed Bid)</span>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSealed ? "border-amber-600 bg-amber-600" : "border-slate-300"}`}>
                {isSealed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>

            <p className="text-[0.73rem] text-slate-600 leading-relaxed font-medium">
              Giá thầu <strong>bảo mật tuyệt đối</strong> giữa các nhà xe. Mỗi nhà xe chỉ biết giá của mình. Sau khi đóng phiên, chủ hàng xem danh sách xếp hạng và chủ động chọn người thắng thầu.
            </p>

            <span className="text-[0.65rem] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg w-fit">
              Phù hợp với linh kiện cao cấp, hàng đông lạnh, siêu trường
            </span>
          </div>
        </div>
      </div>

      {/* Category 2: Financial Config */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="font-black text-sm">$</span>
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
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
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
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
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-4 transition-colors ${isParticipationFeeRequired ? "border-sky-200 bg-sky-50/60" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isParticipationFeeRequired ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-500"}`}>
                  <PaymentsIcon className="!text-[1.1rem]" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-800">Phí tham gia</p>
                  <p className="text-[0.7rem] text-slate-500 leading-relaxed mt-0.5">Phí dịch vụ, thu một lần khi nhà xe đăng ký.</p>
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
                  endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", backgroundColor: "white" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
              />
            ) : (
              <p className="text-xs font-semibold text-slate-500 bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5">Miễn phí tham gia phiên đấu giá.</p>
            )}
          </div>

          <div className={`rounded-2xl border p-4 transition-colors ${isDepositRequired ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50/60"}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDepositRequired ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>
                  <SecurityIcon className="!text-[1.1rem]" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-800">Tiền đặt cọc</p>
                  <p className="text-[0.7rem] text-slate-500 leading-relaxed mt-0.5">Khóa tạm trong ví, hoàn lại theo điều kiện phiên.</p>
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
                  endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", backgroundColor: "white" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
              />
            ) : (
              <p className="text-xs font-semibold text-slate-500 bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5">Không yêu cầu nhà xe đặt cọc.</p>
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
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 flex items-start gap-2.5">
            <InfoOutlinedIcon className="!text-[1.1rem] text-slate-400 mt-0.5" />
            <p className="text-[0.7rem] text-slate-500 leading-relaxed">Nhà xe sẽ thấy rõ từng khoản và tổng thanh toán trước khi xác nhận đăng ký.</p>
          </div>
        </div>
      </div>

      {/* Category 3: Timeframe */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CalendarMonthIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
            3. Khung Thời Gian Diễn Ra Phiên Đấu Giá
          </Typography>
        </div>

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
