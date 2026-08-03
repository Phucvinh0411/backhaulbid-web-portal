"use client";

import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import { AppCard } from "@/components/common";

const STATUS_DESIGN = {
  PENDING_SIGNATURE: {
    label: "Chờ ký xác nhận",
    bgColor: "#FFFBEB",
    textColor: "#D97706",
    borderColor: "#FDE68A",
    pulse: true,
  },
  ACTIVE: {
    label: "Đang hoạt động",
    bgColor: "#ECFDF5",
    textColor: "#059669",
    borderColor: "#D1FAE5",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    bgColor: "#F1F5F9",
    textColor: "#64748B",
    borderColor: "#E2E8F0",
  },
  CANCELLED: {
    label: "Đã hủy",
    bgColor: "#FEF2F2",
    textColor: "#E11D48",
    borderColor: "#FECDD3",
  },
};

export function getContractStatusDesign(status) {
  return (
    STATUS_DESIGN[status] || {
      label: status,
      bgColor: "#F8FAFC",
      textColor: "#64748B",
      borderColor: "#E2E8F0",
    }
  );
}

export default function ContractItem({
  contract,
  partnerLabel = "Đối tác",
  onSign,
  onViewDetail,
}) {
  const design = getContractStatusDesign(contract.status);
  const isPendingSignature = contract.status === "PENDING_SIGNATURE";

  return (
    <AppCard
      accent={isPendingSignature ? "warning" : "primary"}
      sx={{
        "&:hover": {
          borderColor: isPendingSignature
            ? "rgba(245, 158, 11, 0.3)"
            : "rgba(27, 73, 101, 0.15)",
          boxShadow: isPendingSignature
            ? "0 12px 30px rgba(245, 158, 11, 0.1)"
            : "0 12px 30px rgba(27, 73, 101, 0.05)",
        },
      }}
    >
      <CardContent className="flex-1 space-y-4 !p-6">
        <div className="flex items-center justify-between gap-3">
          <Typography className="flex items-center gap-1.5 text-sm text-[#1B4965] !font-mono !font-bold">
            <DescriptionIcon sx={{ fontSize: "1.1rem" }} />
            {contract.id}
          </Typography>
          <Chip
            label={design.label}
            size="small"
            className={design.pulse ? "animate-pulse-subtle" : ""}
            sx={{
              fontWeight: "bold",
              fontSize: "0.72rem",
              px: 1,
              py: 0.5,
              borderRadius: "9999px",
              border: "1px solid",
              backgroundColor: `${design.bgColor} !important`,
              color: `${design.textColor} !important`,
              borderColor: `${design.borderColor} !important`,
            }}
          />
        </div>

        <div className="space-y-3.5 rounded-2xl border border-slate-100/50 bg-slate-50/60 p-3.5">
          <div className="flex items-start gap-3">
            <WorkspacePremiumIcon className="mt-0.5 text-slate-400 !text-[1.1rem]" />
            <div className="min-w-0">
              <Typography className="mb-0.5 text-slate-500 uppercase tracking-wider !text-[0.68rem] !font-bold leading-none">
                {partnerLabel}
              </Typography>
              <Typography variant="body2" className="line-clamp-1 font-bold text-slate-700">
                {contract.partner}
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <EventIcon className="mt-0.5 text-slate-400 !text-[1.1rem]" />
            <div className="min-w-0">
              <Typography className="mb-0.5 text-slate-500 uppercase tracking-wider !text-[0.68rem] !font-bold leading-none">
                Ngày bốc hàng
              </Typography>
              <Typography variant="body2" className="font-bold text-slate-700">
                {contract.date}
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <Typography className="font-medium text-slate-500">Phiên đấu giá:</Typography>
            <Typography className="font-semibold text-slate-700">{contract.auctionId}</Typography>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Typography className="font-medium text-slate-500">Tuyến đường:</Typography>
            <Typography className="text-right font-semibold text-slate-700">
              {contract.origin} → {contract.destination}
            </Typography>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Typography className="font-medium text-slate-500">Hàng hóa:</Typography>
            <Typography className="text-right font-semibold text-slate-700">
              {contract.cargoType}
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
              <CurrencyExchangeIcon
                titleAccess="Tiền tệ Việt Nam"
                className="text-emerald-500 !text-[1.1rem]"
              />
            </div>
            <div>
              <Typography className="mb-0.5 text-slate-400 !text-[0.68rem] font-bold leading-none">
                Giá trị hợp đồng
              </Typography>
              <Typography className="font-bold text-emerald-600">{contract.value}</Typography>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 pt-3">
        {isPendingSignature ? (
          <>
            <Button
              variant="text"
              size="small"
              onClick={() => onViewDetail?.(contract)}
              className="!rounded-xl !text-[0.8rem] !font-bold !normal-case !text-[#1B4965]"
              sx={{ flex: 1, "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
            >
              Chi tiết
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<VerifiedUserIcon />}
              onClick={() => onSign?.(contract)}
              className="!rounded-xl !bg-[#1B4965] !text-[0.8rem] !font-bold !normal-case hover:!bg-[#133850]"
              sx={{ flex: 1.5, boxShadow: "none" }}
            >
              Ký điện tử
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="text"
              size="small"
              onClick={() => onViewDetail?.(contract)}
              className="!rounded-xl !text-[0.8rem] !font-bold !normal-case !text-[#1B4965]"
              sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
            >
              Chi tiết
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              className="!rounded-xl !border-slate-200 !text-[0.8rem] !font-bold !normal-case !text-[#1B4965] hover:!border-slate-300 hover:!bg-slate-50"
            >
              Tải PDF
            </Button>
          </>
        )}
      </div>
    </AppCard>
  );
}
