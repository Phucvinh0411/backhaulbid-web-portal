"use client";

import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCarOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import SpeedIcon from "@mui/icons-material/SpeedOutlined";
import BuildCircleIcon from "@mui/icons-material/BuildCircleOutlined";
import { AppCard } from "@/components/common";

export default function CarrierVehicleItem({ vehicle, onViewDetail }) {
  const getVerificationDesign = (status) => {
    switch (status) {
      case "VERIFIED":
        return {
          label: "Đã duyệt",
          bgColor: "var(--color-success-soft)",
          textColor: "var(--color-success)",
          borderColor: "var(--color-success-soft)",
        };
      case "PENDING":
        return {
          label: "Chờ duyệt",
          bgColor: "var(--color-warning-soft)",
          textColor: "var(--color-warning)",
          borderColor: "var(--color-warning-soft)",
          pulse: true,
        };
      case "REJECTED":
        return {
          label: "Từ chối",
          bgColor: "var(--color-danger-soft)",
          textColor: "var(--color-danger)",
          borderColor: "var(--color-danger-soft)",
        };
      case "INACTIVE":
        return {
          label: "Ngừng sử dụng",
          bgColor: "var(--color-surface-sunken)",
          textColor: "var(--color-ink-muted)",
          borderColor: "var(--color-line)",
        };
      default:
        return {
          label: status,
          bgColor: "var(--color-surface-sunken)",
          textColor: "var(--color-ink-muted)",
          borderColor: "var(--color-line)",
        };
    }
  };

  const verifyDesign = getVerificationDesign(vehicle.verification);
  const isPending = vehicle.verification === 'PENDING';

  return (
    <AppCard
      accent={isPending ? "warning" : "primary"}
      sx={{
        "&:hover": {
          borderColor: isPending ? "rgba(245, 158, 11, 0.3)" : "rgba(27, 73, 101, 0.15)",
          boxShadow: isPending ? "0 12px 30px rgba(245, 158, 11, 0.1)" : "0 12px 30px rgba(27, 73, 101, 0.05)",
        }
      }}
    >
      <CardContent className="!p-6 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <Typography className="!font-mono !font-bold text-[var(--color-brand)] text-lg flex items-center gap-2">
            <DirectionsCarIcon sx={{ fontSize: "1.3rem" }} />
            {vehicle.plate}
          </Typography>
          <Chip
            label={verifyDesign.label}
            size="small"
            className={verifyDesign.pulse ? "animate-pulse-subtle" : ""}
            sx={{
              fontWeight: "bold",
              fontSize: "0.72rem",
              px: 1,
              py: 0.5,
              borderRadius: "9999px",
              border: "1px solid",
              backgroundColor: `${verifyDesign.bgColor} !important`,
              color: `${verifyDesign.textColor} !important`,
              borderColor: `${verifyDesign.borderColor} !important`,
            }}
          />
        </div>

        <div className="bg-surface-sunken/60 p-3.5 rounded-xl border border-line/50 space-y-3.5">
          <div className="flex items-start gap-3">
            <SpeedIcon className="text-ink-subtle !text-[1.1rem] mt-0.5" />
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-ink-muted uppercase tracking-wider leading-none mb-0.5">
                Tải trọng
              </Typography>
              <Typography variant="body2" className="text-ink font-bold">
                {vehicle.capacity}
              </Typography>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BuildCircleIcon className="text-ink-subtle !text-[1.1rem] mt-0.5" />
            <div className="min-w-0">
              <Typography className="!text-[0.68rem] !font-bold text-ink-muted uppercase tracking-wider leading-none mb-0.5">
                Loại xe
              </Typography>
              <Typography variant="body2" className="text-ink font-bold">
                {vehicle.type}
              </Typography>
              {vehicle.bodyType && (
                <Typography variant="caption" className="text-ink-muted block text-[0.72rem]">
                  {vehicle.bodyType}
                </Typography>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center">
            <Typography className="text-ink-muted font-medium">Trạng thái xe:</Typography>
            <Typography className={`font-semibold ${vehicle.active ? 'text-success' : 'text-ink-muted'}`}>
              {vehicle.active ? 'Sẵn sàng hoạt động' : 'Đang bảo trì'}
            </Typography>
          </div>
        </div>
      </CardContent>

      <div className="flex justify-end p-4 pt-3 border-t border-line gap-3">
        <Button 
          size="small" 
          variant="text" 
          color="primary" 
          startIcon={<SettingsIcon />} 
          onClick={() => onViewDetail && onViewDetail(vehicle)}
          className="!text-[var(--color-brand)] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
          sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
        >
          Chi tiết
        </Button>
      </div>
    </AppCard>
  );
}
