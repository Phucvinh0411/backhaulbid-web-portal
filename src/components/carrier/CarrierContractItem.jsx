"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoneyOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUserOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownloadOutlined";

export default function CarrierContractItem({ contract, onSign, onViewDetail }) {
  const getStatusDesign = (status) => {
    switch (status) {
      case "PENDING_SIGNATURE":
        return {
          label: "Chờ ký xác nhận",
          bgColor: "#FFFBEB", // amber-50
          textColor: "#D97706", // amber-600
          borderColor: "#FDE68A", // amber-200
          pulse: true,
        };
      case "ACTIVE":
        return {
          label: "Đang hoạt động",
          bgColor: "#ECFDF5", // emerald-50
          textColor: "#059669", // emerald-600
          borderColor: "#D1FAE5", // emerald-200
        };
      case "COMPLETED":
        return {
          label: "Đã hoàn thành",
          bgColor: "#F1F5F9", // slate-100
          textColor: "#64748B", // slate-500
          borderColor: "#E2E8F0", // slate-200
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          bgColor: "#FEF2F2", // rose-50
          textColor: "#E11D48", // rose-600
          borderColor: "#FECDD3", // rose-200
        };
      default:
        return {
          label: status,
          bgColor: "#F8FAFC",
          textColor: "#64748B",
          borderColor: "#E2E8F0",
        };
    }
  };

  const design = getStatusDesign(contract.status);

  return (
    <Card 
      className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100/80 !rounded-3xl relative overflow-hidden h-full flex flex-col"
      sx={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        "&:hover": {
          borderColor: contract.status === 'PENDING_SIGNATURE' ? "rgba(245, 158, 11, 0.3)" : "rgba(27, 73, 101, 0.15)",
          boxShadow: contract.status === 'PENDING_SIGNATURE' ? "0 12px 30px rgba(245, 158, 11, 0.1)" : "0 12px 30px rgba(27, 73, 101, 0.05)",
        }
      }}
    >
      <Box className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-300 ${contract.status === 'PENDING_SIGNATURE' ? 'from-amber-400 to-amber-200' : 'from-[#1B4965] to-[#62B6CB]'}`} />
      
      <CardContent className="!p-6 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <Typography className="!font-mono !font-bold text-[#1B4965] text-sm flex items-center gap-1.5">
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

        <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/50 space-y-3.5">
          <div className="flex items-start gap-3">
            <WorkspacePremiumIcon className="text-slate-400 !text-[1.1rem] mt-0.5" />
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">
                Đối tác
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold line-clamp-1">
                {contract.partner}
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <EventIcon className="text-slate-400 !text-[1.1rem] mt-0.5" />
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">
                Ngày bốc hàng
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold">
                {contract.date}
              </Typography>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center">
            <Typography className="text-slate-500 font-medium">Phiên đấu giá:</Typography>
            <Typography className="font-semibold text-slate-700">{contract.auctionId}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography className="text-slate-500 font-medium">Tuyến đường:</Typography>
            <Typography className="font-semibold text-slate-700">{contract.origin} &rarr; {contract.destination}</Typography>
          </div>
          <div className="flex justify-between items-center">
            <Typography className="text-slate-500 font-medium">Hàng hóa:</Typography>
            <Typography className="font-semibold text-slate-700">{contract.cargoType}</Typography>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <AttachMoneyIcon className="text-emerald-500 !text-[1.1rem]" />
            </div>
            <div>
              <Typography className="!text-[0.68rem] text-slate-400 font-bold leading-none mb-0.5">Giá trị hợp đồng</Typography>
              <Typography className="font-bold text-emerald-600">{contract.value}</Typography>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="flex items-center justify-between p-4 pt-3 border-t border-slate-100 gap-3">
        {contract.status === 'PENDING_SIGNATURE' ? (
          <>
            <Button 
              variant="text" 
              size="small"
              onClick={() => onViewDetail && onViewDetail(contract)}
              className="!text-[#1B4965] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
              sx={{ flex: 1, "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
            >
              Chi tiết
            </Button>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<VerifiedUserIcon />}
              onClick={() => onSign && onSign(contract)}
              className="!bg-[#1B4965] hover:!bg-[#133850] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
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
              onClick={() => onViewDetail && onViewDetail(contract)}
              className="!text-[#1B4965] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
              sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
            >
              Chi tiết
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<FileDownloadIcon />}
              className="!text-[#1B4965] !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300 !font-bold !text-[0.8rem] !capitalize !rounded-xl"
            >
              Tải PDF
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
