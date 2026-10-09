"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import { formatAmountInput, formatMoney, parseAmountInput } from "@/lib/format";
import { getBidCeiling, getQuickBidAmounts, validateBidAmount } from "@/lib/bidRules";

/**
 * Bid form for PUBLIC and SEALED rooms. `blockedReason` explains why bidding is
 * unavailable (room closed, out of bids, waiting for server confirmation).
 */
export default function CarrierBidPanel({
  auctionType,
  maxPrice,
  priceStep,
  lowestBid,
  remainingBids,
  amount,
  onAmountChange,
  onSubmit,
  submitting,
  blockedReason,
  serverError,
  myLastBid,
}) {
  const sealed = auctionType === "SEALED";
  const context = { auctionType, maxPrice, priceStep, lowestBid, remainingBids };
  const { ceiling } = getBidCeiling(context);
  const quickAmounts = getQuickBidAmounts(context);
  const validation = amount ? validateBidAmount(amount, context) : null;
  const disabled = Boolean(blockedReason) || submitting;
  const helper = validation || (amount ? `Tiết kiệm cho chủ hàng ${formatMoney(Number(maxPrice) - amount)} so với giá trần.` : sealed ? `Tối đa ${formatMoney(maxPrice)}. Giá của bạn không hiển thị cho nhà xe khác.` : `Tối đa ${formatMoney(ceiling)} để được chấp nhận lúc này.`);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled || !amount || validation) return;
    onSubmit();
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} aria-labelledby="bid-form-title" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
        <Typography id="bid-form-title" component="h2" sx={{ fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 0.75 }}>
          {sealed ? <LockIcon fontSize="small" aria-hidden /> : <GavelIcon fontSize="small" aria-hidden />}
          {sealed ? "Gửi giá kín" : "Đặt giá"}
        </Typography>
        <Typography variant="body2" className="tabular" sx={{ color: "text.secondary" }}>
          {remainingBids === null || remainingBids === undefined ? "Không giới hạn lượt" : `Còn ${remainingBids} lượt`}
        </Typography>
      </Box>

      {myLastBid !== null && myLastBid !== undefined && (
        <Typography variant="body2" className="tabular">
          Giá gần nhất của bạn: <strong>{formatMoney(myLastBid)}</strong>
        </Typography>
      )}

      <TextField
        label="Giá của bạn"
        value={formatAmountInput(amount)}
        onChange={(event) => onAmountChange(parseAmountInput(event.target.value))}
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        error={Boolean(validation)}
        helperText={helper}
        InputProps={{ endAdornment: <InputAdornment position="end">₫</InputAdornment> }}
        inputProps={{ inputMode: "numeric", className: "tabular", "aria-describedby": "bid-form-title" }}
        sx={{ "& input": { fontSize: "1.125rem", fontWeight: 700 } }}
      />

      {quickAmounts.length > 0 && !disabled && (
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Chọn nhanh (theo bước giá {formatMoney(priceStep)})
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${quickAmounts.length}, minmax(0, 1fr))`, gap: 1, mt: 0.5 }}>
            {quickAmounts.map((value) => (
              <Button key={value} variant="outlined" color="inherit" onClick={() => onAmountChange(value)} className="tabular" sx={{ fontSize: "0.8125rem", px: 0.5 }}>
                {formatAmountInput(value)}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {serverError && (
        <Typography role="alert" variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
          {serverError}
        </Typography>
      )}
      {blockedReason && (
        <Typography role="status" variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {blockedReason}
        </Typography>
      )}

      <Button type="submit" size="large" variant="contained" disabled={disabled || !amount || Boolean(validation)}>
        {submitting ? "Đang gửi giá..." : sealed ? "Gửi giá kín" : "Đặt giá"}
      </Button>
    </Box>
  );
}
