"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";

import { MOCK_ADDRESS_BOOK } from "./mockData";

export default function AddressBookModal({ open, onClose, onSelectAddress, targetType }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth paperProps={{ className: "!rounded-3xl !p-2" }}>
      <DialogTitle className="!flex items-center justify-between !pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <LocationOnIcon className="!text-[1.1rem]" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-base block">Sổ Địa Chỉ Đã Lưu</span>
            <span className="text-[0.7rem] text-slate-500 font-medium">
              Chọn địa chỉ nhanh cho {targetType === "FROM" ? "Điểm Nhận (Point A)" : "Điểm Giao (Point B)"}
            </span>
          </div>
        </div>
        <IconButton onClick={onClose} size="small" className="!bg-slate-100 hover:!bg-slate-200">
          <CloseIcon className="!text-[1rem] text-slate-600" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!pt-2 space-y-2.5">
        {MOCK_ADDRESS_BOOK.map((addr) => (
          <div
            key={addr.id}
            onClick={() => {
              onSelectAddress(addr);
              onClose();
            }}
            className="group p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-sky-50/60 hover:border-sky-300 cursor-pointer transition-all flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-sm group-hover:text-sky-900 transition-colors block">
                {addr.label}
              </span>
              <p className="text-[0.73rem] text-slate-500 font-medium flex items-center gap-1">
                <LocationOnIcon className="!text-[0.8rem] text-sky-600 shrink-0" />
                {addr.detail}, {addr.province}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[0.7rem] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <PersonIcon className="!text-[0.75rem]" /> {addr.contactName}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="!text-[0.75rem]" /> {addr.contactPhone}
                </span>
              </div>
            </div>

            <button className="shrink-0 text-xs font-bold text-sky-700 bg-sky-100 group-hover:bg-sky-600 group-hover:text-white px-3 py-1.5 rounded-xl transition-all">
              Chọn
            </button>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
