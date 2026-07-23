"use client";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";

import { formatCurrency, formatDisplayNumber, parseDisplayNumber } from "../mockData";

export default function Step3AuctionConfig({ form, updateForm }) {
  const isSealed = form.auctionType === "SEALED";

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
              // Auto calculate 10% deposit
              updateForm("depositAmount", Math.floor(val * 0.1));
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            fullWidth
            label="Tiền cọc trước nhà xe (10% trần)"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(form.depositAmount)}
            onChange={(e) => updateForm("depositAmount", parseDisplayNumber(e.target.value))}
            helperText="Hoàn lại khi hoàn thành chuyến"
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
          />

          <TextField
            fullWidth
            label="Phí tham gia phiên (VNĐ)"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(form.participationFee)}
            onChange={(e) => updateForm("participationFee", parseDisplayNumber(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Số lượt ra giá tối đa"
            type="number"
            value={form.maxBids}
            onChange={(e) => updateForm("maxBids", Number(e.target.value))}
            helperText="Lần / nhà xe"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
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
            value={form.regStartTime}
            onChange={(e) => updateForm("regStartTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Đóng đăng ký tham gia"
            value={form.regEndTime}
            onChange={(e) => updateForm("regEndTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            type="datetime-local"
            label="Bắt đầu đấu giá trực tiếp"
            value={form.startTime}
            onChange={(e) => updateForm("startTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Kết thúc đấu giá (Đóng thầu)"
            value={form.endTime}
            onChange={(e) => updateForm("endTime", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>
    </div>
  );
}
