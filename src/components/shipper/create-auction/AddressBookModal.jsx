"use client";

import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";

import { ResponsiveDialog } from "@/components/ui";
import { addressBookApi } from "@/services/addressBookApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function AddressBookModal({ open, onClose, onSelectAddress, targetType }) {
  const notify = useGlobalNotification();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setLoading(true);
    setLoadError("");

    addressBookApi
      .list()
      .then((data) => {
        if (active) setAddresses(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!active) return;
        const message = getApiErrorMessage(
          error,
          "Không thể tải sổ địa chỉ. Vui lòng thử lại.",
        );
        setLoadError(message);
        notify.error(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, notify]);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info-soft text-info flex items-center justify-center">
            <LocationOnIcon className="!text-[1.1rem]" />
          </div>
          <div>
            <span className="font-bold text-ink text-base block">Sổ địa chỉ đã lưu</span>
            <span className="text-[0.75rem] text-ink-muted font-normal block">
              Chọn nhanh cho {targetType === "FROM" ? "Điểm nhận (Point A)" : "Điểm giao (Point B)"}
            </span>
          </div>
        </div>
      }
      titleId="address-book-modal-title"
      maxWidth="sm"
      actions={
        <Button onClick={onClose} variant="text">Đóng</Button>
      }
    >
      <div className="space-y-2.5">
        {loading ? (
          <div className="flex min-h-36 items-center justify-center">
            <CircularProgress size={28} sx={{ color: "var(--color-info)" }} />
          </div>
        ) : loadError ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
            <Typography className="!font-semibold text-danger">{loadError}</Typography>
            <Button onClick={onClose} variant="outlined">
              Đóng
            </Button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center text-center">
            <Typography className="text-ink-muted">Bạn chưa lưu địa chỉ nào. Hãy thêm địa chỉ trong phần Sổ địa chỉ.</Typography>
          </div>
        ) : addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => {
              onSelectAddress(addr);
              onClose();
            }}
            className="w-full text-left group p-4 rounded-xl border border-line bg-white hover:bg-info-soft/50 hover:border-info cursor-pointer transition-colors flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <span className="font-bold text-ink text-sm group-hover:text-info transition-colors block">
                {addr.label}
              </span>
              <p className="text-[0.75rem] text-ink-muted font-medium flex items-center gap-1">
                <LocationOnIcon className="!text-[0.8rem] text-info shrink-0" />
                {addr.detail}, {addr.province}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[0.72rem] text-ink-subtle font-medium">
                <span className="flex items-center gap-1">
                  <PersonIcon className="!text-[0.75rem]" /> {addr.contactName}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <PhoneIcon className="!text-[0.75rem]" /> {addr.contactPhone}
                </span>
              </div>
            </div>

            <span className="shrink-0 text-xs font-semibold text-info bg-info-soft group-hover:bg-info group-hover:text-white px-3 py-1.5 rounded-full transition-colors">
              Chọn
            </span>
          </button>
        ))}
      </div>
    </ResponsiveDialog>
  );
}
