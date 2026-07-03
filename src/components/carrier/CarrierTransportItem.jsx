"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import PinDropIcon from "@mui/icons-material/PinDropOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Link from "next/link";

export default function CarrierTransportItem({ transport, onAssign, onViewDetail }) {
  const getStatusDesign = (status) => {
    switch (status) {
      case "WAITING_DRIVER":
        return {
          label: "Chờ điều phối",
          bgColor: "#FFFBEB", // amber-50
          textColor: "#D97706", // amber-600
          borderColor: "#FDE68A", // amber-200
        };
      case "IN_TRANSIT":
        return {
          label: "Đang vận chuyển",
          bgColor: "#F0F9FF", // sky-50
          textColor: "#0284C7", // sky-600
          borderColor: "#BAE6FD", // sky-200
          pulse: true,
        };
      case "COMPLETED":
        return {
          label: "Hoàn thành",
          bgColor: "#ECFDF5", // emerald-50
          textColor: "#059669", // emerald-600
          borderColor: "#D1FAE5", // emerald-200
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

  const design = getStatusDesign(transport.status);
  // parse origin and destination from "Hà Nội - Đà Nẵng"
  const routeParts = transport.route.split(" - ");
  const origin = routeParts[0] || "---";
  const destination = routeParts[1] || "---";

  return (
    <Card 
      className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100/80 !rounded-3xl relative overflow-hidden h-full flex flex-col"
      sx={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        "&:hover": {
          borderColor: "rgba(27, 73, 101, 0.15)",
          boxShadow: "0 12px 30px rgba(27, 73, 101, 0.05)",
        }
      }}
    >
      <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B4965] to-[#62B6CB] opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      <CardContent className="!p-6 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <Typography className="!font-mono !font-bold text-[#1B4965] text-sm flex items-center gap-1.5">
            <LocalShippingIcon sx={{ fontSize: "1.1rem" }} />
            {transport.id}
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

        {/* Address Route Timeline Visual */}
        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-sky-500 bg-white" />
              <div className="w-0.5 h-6 bg-slate-200" />
            </div>
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-sky-600 uppercase tracking-wider leading-none">
                Lấy Hàng
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold mt-0.5">
                {origin}
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-emerald-600 uppercase tracking-wider leading-none">
                Giao Hàng
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold mt-0.5">
                {destination}
              </Typography>
            </div>
          </div>
        </div>

        {/* Transport Info */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <Typography className="text-slate-500 font-medium">Phiên đấu giá:</Typography>
            <Typography className="font-semibold text-slate-700">{transport.auctionId}</Typography>
          </div>
          <div className="flex justify-between items-center text-xs">
            <Typography className="text-slate-500 font-medium">Phương tiện:</Typography>
            <Typography className="font-semibold text-[#1B4965] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {transport.vehicle}
            </Typography>
          </div>
          <div className="flex justify-between items-center text-xs">
            <Typography className="text-slate-500 font-medium">Tài xế:</Typography>
            {transport.driver ? (
              <Typography className="font-semibold text-slate-700">{transport.driver}</Typography>
            ) : (
              <Typography className="italic text-amber-500 font-semibold">Chưa điều phối</Typography>
            )}
          </div>
          <div className="flex justify-between items-center text-xs">
            <Typography className="text-slate-500 font-medium">Mã PIN xác thực:</Typography>
            {transport.pin ? (
              <Typography className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {transport.pin}
              </Typography>
            ) : (
              <Typography className="text-slate-400">---</Typography>
            )}
          </div>
        </div>
      </CardContent>

      {/* Card Actions */}
      <div className="flex items-center justify-between p-4 pt-3 border-t border-slate-100 gap-3">
        <Button
          variant="text"
          size="small"
          onClick={() => onViewDetail && onViewDetail(transport)}
          startIcon={<InfoOutlinedIcon />}
          className="!text-[#1B4965] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
          sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
        >
          Chi tiết
        </Button>
        
        {transport.status === "WAITING_DRIVER" ? (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => onAssign && onAssign(transport)}
            className="!bg-[#1B4965] hover:!bg-[#0d2b3e] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
            sx={{ px: 3, boxShadow: "none" }}
          >
            Điều phối
          </Button>
        ) : (
          <Button
            component={Link}
            href={`/carrier/transports/${transport.id}`}
            variant="outlined"
            size="small"
            startIcon={<PinDropIcon />}
            className="!text-[#1B4965] !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300 !font-bold !text-[0.8rem] !capitalize !rounded-xl"
            sx={{ px: 2 }}
          >
            Theo dõi
          </Button>
        )}
      </div>
    </Card>
  );
}
