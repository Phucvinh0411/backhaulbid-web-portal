"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import BidsTable from "./BidsTable";

export default function FullBidsDetailModal({
  open,
  onClose,
  bids = [],
  shipmentStatus,
  onOpenOtpDialog,
  onOpenCarrierModal,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="backdrop-blur-sm"
      PaperProps={{
        className: "!rounded-3xl !p-2",
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-slate-800 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <GavelIcon className="text-[#1B4965]" />
          <span>Bảng Chi Tiết Tất Cả Báo Giá Nhà Xe (Thời gian thực)</span>
        </div>
        <IconButton size="small" onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!py-4">
        <BidsTable
          bids={bids}
          shipmentStatus={shipmentStatus}
          onOpenOtpDialog={onOpenOtpDialog}
          onOpenCarrierModal={onOpenCarrierModal}
          isSimplified={false}
          isModalView={true}
        />
      </DialogContent>
    </Dialog>
  );
}
