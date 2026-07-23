"use client";

import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";

export default function AuctionTypeBanner({ auctionType }) {
  const isSealed = auctionType === "SEALED";

  return (
    <div
      className={`w-full rounded-2xl px-5 py-3.5 mb-5 border flex items-start gap-3 ${
        isSealed
          ? "bg-amber-50 border-amber-200"
          : "bg-sky-50 border-sky-200"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isSealed ? "bg-amber-100 border border-amber-200" : "bg-sky-100 border border-sky-200"
        }`}
      >
        {isSealed
          ? <LockIcon className="!text-[1.1rem] text-amber-700" />
          : <PublicIcon className="!text-[1.1rem] text-sky-700" />
        }
      </div>

      <div>
        <p className={`font-extrabold text-sm ${isSealed ? "text-amber-900" : "text-sky-900"}`}>
          {isSealed ? "🔒 Đấu giá Kín (Sealed Bid)" : "🌐 Đấu giá Công khai (Open Bid)"}
        </p>
        <p className={`text-[0.73rem] font-medium mt-0.5 leading-relaxed ${isSealed ? "text-amber-800" : "text-sky-800"}`}>
          {isSealed
            ? "Giá thầu của bạn được bảo mật hoàn toàn — Nhà xe khác không thấy giá của nhau. Hãy ra giá tốt nhất ngay từ đầu vì bạn chỉ có tối đa 5 lần điều chỉnh. Sau khi đóng thầu, chủ hàng sẽ xem xét toàn bộ danh sách và chọn người trúng thầu phù hợp nhất."
            : "Giá thầu được hiển thị công khai theo thời gian thực — Bạn thấy giá của các nhà xe khác và có thể liên tục điều chỉnh giảm giá. Người ra giá thấp nhất khi đồng hồ về 0 sẽ tự động trúng thầu."}
        </p>
      </div>
    </div>
  );
}
