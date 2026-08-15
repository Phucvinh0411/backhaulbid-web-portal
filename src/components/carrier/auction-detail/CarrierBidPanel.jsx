"use client";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import GavelIcon from "@mui/icons-material/GavelOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDownOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";

import { formatCurrency } from "@/utils/auctionFormatters";

const QUICK_DROPS_PUBLIC = [50000, 100000, 200000, 500000];
const QUICK_DROPS_SEALED = [100000, 200000, 500000, 1000000];

// Format a raw number as "11.200.000" (vi-VN without currency symbol)
const formatDisplay = (val) =>
  val > 0
    ? new Intl.NumberFormat("vi-VN").format(val)
    : "";

// Strip thousand separators and parse to number
const parseDisplay = (str) =>
  Number(str.replace(/[.\s]/g, "").replace(/[^0-9]/g, "")) || 0;

// ─── Validation Helper ────────────────────────────────────────────
function validateBid({ value, maxPrice, currentLowest, remainingBids, isSealed }) {
  if (!value || isNaN(value) || value <= 0) return { ok: false, msg: "Vui lòng nhập số tiền hợp lệ." };
  if (value > maxPrice) return { ok: false, msg: `Giá thầu không được vượt giá trần (${formatCurrency(maxPrice)}).` };
  if (!isSealed && value >= currentLowest) return { ok: false, msg: "Giá thầu phải thấp hơn giá thấp nhất hiện tại." };
  if (remainingBids !== null && remainingBids <= 0) return { ok: false, msg: "Bạn đã hết lượt ra giá." };
  return { ok: true, msg: "" };
}

// ─── Public Bid Panel ─────────────────────────────────────────────
function PublicBidPanel({ shipment, currentLowest, remainingBids, myBid, setMyBid, onSubmit }) {
  const savings = shipment.maxPrice - myBid;
  const savingsPct = shipment.maxPrice > 0 ? ((savings / shipment.maxPrice) * 100).toFixed(1) : 0;
  const validation = validateBid({ value: myBid, maxPrice: shipment.maxPrice, currentLowest, remainingBids, isSealed: false });

  return (
    <div className="space-y-4">
      {/* Current lowest reference */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[0.68rem] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingDownIcon className="!text-[0.8rem]" /> Giá thấp nhất hiện tại
          </p>
          <p className="font-black text-emerald-700 text-2xl font-mono mt-0.5">
            {formatCurrency(currentLowest)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.68rem] text-slate-500 font-medium">Giá trần tối đa</p>
          <p className="font-bold text-slate-700 font-mono text-sm">{formatCurrency(shipment.maxPrice)}</p>
        </div>
      </div>

      {/* Input — formatted display (11.200.000 đ) */}
      <TextField
        fullWidth
        label="Giá thầu của bạn"
        type="text"
        inputMode="numeric"
        value={formatDisplay(myBid)}
        onChange={(e) => setMyBid(parseDisplay(e.target.value))}
        placeholder="VD: 11.200.000"
        InputProps={{
          endAdornment: <InputAdornment position="end"><span className="text-slate-500 text-sm font-bold">đ</span></InputAdornment>,
        }}
        error={!validation.ok && myBid > 0}
        helperText={!validation.ok && myBid > 0 ? validation.msg : myBid > 0 ? `Tiết kiệm cho chủ hàng: ${formatCurrency(savings)} (${savingsPct}%)` : "Nhập số tiền không có ký tự đặc biệt"}
        FormHelperTextProps={{ className: validation.ok && myBid > 0 ? "!text-emerald-600 !font-semibold" : "!text-slate-400" }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontWeight: 700, fontFamily: "monospace", fontSize: "1rem", letterSpacing: "0.02em" } }}
      />

      {/* Quick bid buttons */}
      <div>
        <p className="text-[0.7rem] text-slate-500 font-medium mb-2">Giảm nhanh so với giá thấp nhất:</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_DROPS_PUBLIC.map((drop) => (
            <button
              key={drop}
              onClick={() => setMyBid(Math.max(currentLowest - drop, 1))}
              className="text-[0.7rem] font-bold py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
            >
              -{formatCurrency(drop).replace(" đ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        fullWidth variant="contained"
        disabled={!validation.ok}
        onClick={onSubmit}
        className="!rounded-2xl !py-3.5 !font-bold !text-sm !capitalize !shadow-md hover:!shadow-lg hover:!-translate-y-0.5 !transition-all"
        sx={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", "&:hover": { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" } }}
        startIcon={<GavelIcon />}
      >
        {remainingBids === null ? "Đặt giá" : remainingBids > 0 ? `Đặt giá (còn ${remainingBids} lượt)` : "Hết lượt ra giá"}
      </Button>
    </div>
  );
}

// ─── Sealed Bid Panel ─────────────────────────────────────────────
function SealedBidPanel({ shipment, remainingBids, myBid, setMyBid, onSubmit, alreadySubmitted }) {
  const savings = shipment.maxPrice - myBid;
  const savingsPct = shipment.maxPrice > 0 ? ((savings / shipment.maxPrice) * 100).toFixed(1) : 0;
  const validation = validateBid({ value: myBid, maxPrice: shipment.maxPrice, remainingBids, isSealed: true });

  if (alreadySubmitted) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
        <CheckCircleIcon className="!text-3xl text-amber-600" />
        <p className="font-black text-amber-900 text-base">Đã gửi báo giá thành công!</p>
        <p className="text-[0.75rem] text-amber-800">
          Giá thầu của bạn:{" "}
          <strong className="font-mono text-base">{formatCurrency(myBid)}</strong>
        </p>
        <p className="text-[0.7rem] text-amber-700 font-medium">
          Bạn có thể điều chỉnh giá thầu trước khi phiên đóng thầu.{remainingBids !== null && <> Còn lại: <strong>{remainingBids} lượt</strong>.</>}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Max price reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[0.68rem] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1">
            <LockIcon className="!text-[0.8rem]" /> Giá trần tối đa (chuẩn tham chiếu)
          </p>
          <p className="font-black text-amber-700 text-2xl font-mono mt-0.5">
            {formatCurrency(shipment.maxPrice)}
          </p>
        </div>
        {remainingBids !== null && (
          <div className="text-right">
            <p className="text-[0.68rem] text-slate-500">Số lượt còn lại</p>
            <p className="font-black text-slate-800 text-xl">{remainingBids} lượt</p>
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2 text-[0.72rem] text-amber-800 bg-amber-50/80 border border-amber-100 rounded-xl p-3">
        <WarningIcon className="!text-[1rem] text-amber-600 shrink-0 mt-0.5" />
        <span>Đây là đấu giá kín. Giá thầu của bạn sẽ được <strong>bảo mật hoàn toàn</strong> với các nhà xe khác. Hãy ra giá cạnh tranh nhất ngay từ đầu.</span>
      </div>

      {/* Input — formatted display (11.200.000 đ) */}
      <TextField
        fullWidth
        label="Giá thầu của bạn"
        type="text"
        inputMode="numeric"
        value={formatDisplay(myBid)}
        onChange={(e) => setMyBid(parseDisplay(e.target.value))}
        placeholder="VD: 28.000.000"
        InputProps={{
          endAdornment: <InputAdornment position="end"><span className="text-slate-500 text-sm font-bold">đ</span></InputAdornment>,
        }}
        error={!validation.ok && myBid > 0}
        helperText={!validation.ok && myBid > 0 ? validation.msg : myBid > 0 ? `Tiết kiệm cho chủ hàng: ${formatCurrency(savings)} (${savingsPct}%)` : "Nhập số tiền không có ký tự đặc biệt"}
        FormHelperTextProps={{ className: validation.ok && myBid > 0 ? "!text-amber-700 !font-semibold" : "!text-slate-400" }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontWeight: 700, fontFamily: "monospace", fontSize: "1rem", letterSpacing: "0.02em" } }}
      />

      {/* Quick bid buttons — anchor to maxPrice for sealed */}
      <div>
        <p className="text-[0.7rem] text-slate-500 font-medium mb-2">Giảm nhanh so với giá trần:</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_DROPS_SEALED.map((drop) => (
            <button
              key={drop}
              onClick={() => setMyBid(Math.max(shipment.maxPrice - drop, 1))}
              className="text-[0.7rem] font-bold py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-all"
            >
              -{formatCurrency(drop).replace(" đ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        fullWidth variant="contained"
        disabled={!validation.ok}
        onClick={onSubmit}
        className="!rounded-2xl !py-3.5 !font-bold !text-sm !capitalize !shadow-md hover:!shadow-lg hover:!-translate-y-0.5 !transition-all"
        sx={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", "&:hover": { background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)" } }}
        startIcon={<LockIcon />}
      >
        {remainingBids === null ? "Gửi giá thầu bảo mật" : remainingBids > 0 ? `Gửi giá thầu bảo mật (còn ${remainingBids} lượt)` : "Hết lượt ra giá"}
      </Button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export default function CarrierBidPanel({
  shipment,
  auctionType,
  currentLowest,
  remainingBids,
  myBid,
  setMyBid,
  alreadySubmitted,
  onSubmit,
}) {
  const isSealed = auctionType === "SEALED";

  return (
    <div
      className={`rounded-3xl border overflow-hidden shadow-sm ${
        isSealed ? "border-amber-200 bg-white" : "border-emerald-200 bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`px-5 py-3.5 border-b flex items-center gap-2 ${
          isSealed ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isSealed ? "bg-amber-100 border border-amber-200" : "bg-emerald-100 border border-emerald-200"
          }`}
        >
          {isSealed
            ? <LockIcon className="!text-[1rem] text-amber-700" />
            : <PublicIcon className="!text-[1rem] text-emerald-700" />
          }
        </div>
        <div>
          <Typography className="!font-black !text-sm text-slate-800">
            {isSealed ? "Đặt giá thầu kín" : "Đặt giá thầu cạnh tranh"}
          </Typography>
          <Typography variant="caption" className={isSealed ? "text-amber-700" : "text-emerald-700"}>
            {isSealed ? "Giá bảo mật — Chỉ chủ hàng mới thấy" : "Cạnh tranh với các nhà xe khác theo thời gian thực"}
          </Typography>
        </div>
      </div>

      <div className="p-5">
        {isSealed ? (
          <SealedBidPanel
            shipment={shipment}
            remainingBids={remainingBids}
            myBid={myBid}
            setMyBid={setMyBid}
            onSubmit={onSubmit}
            alreadySubmitted={alreadySubmitted}
          />
        ) : (
          <PublicBidPanel
            shipment={shipment}
            currentLowest={currentLowest}
            remainingBids={remainingBids}
            myBid={myBid}
            setMyBid={setMyBid}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}
