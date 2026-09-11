import { useState } from "react";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ImportContactsIcon from "@mui/icons-material/ImportContactsOutlined";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";

import Autocomplete from "@mui/material/Autocomplete";
import { VIETNAM_PROVINCES } from "@/utils/provinces";
import { addressBookApi } from "@/services/addressBookApi";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";

const PROVINCE_NAMES = VIETNAM_PROVINCES.map((p) => p.name);

export default function Step2RouteInfo({ form, updateForm, onOpenAddressBook }) {
  const notify = useGlobalNotification();
  const [savingFrom, setSavingFrom] = useState(false);
  const [savingTo, setSavingTo] = useState(false);

  const handleSaveAddress = async (type) => {
    const isFrom = type === "FROM";
    const label = isFrom ? form.fromLocationName : form.toLocationName;
    const province = isFrom ? form.fromProvince : form.toProvince;
    const detail = isFrom ? form.fromAddress : form.toAddress;
    const contactName = isFrom ? form.fromContactName : form.toContactName;
    const contactPhone = isFrom ? form.fromContactPhone : form.toContactPhone;

    if (!label?.trim() || !province?.trim() || !detail?.trim()) {
      notify.warning(
        `Vui lòng nhập đầy đủ Tên kho, Tỉnh/Thành phố và Địa chỉ chi tiết của Điểm ${
          isFrom ? "Nhận (A)" : "Giao (B)"
        } trước khi lưu.`,
      );
      return;
    }

    if (isFrom) setSavingFrom(true);
    else setSavingTo(true);

    try {
      await addressBookApi.create({
        label: label.trim(),
        province: province.trim(),
        detail: detail.trim(),
        contactName: contactName?.trim() || "Chưa cập nhật",
        contactPhone: contactPhone?.trim() || "Chưa cập nhật",
      });
      notify.success(`Đã lưu "${label.trim()}" vào Sổ địa chỉ kho thành công!`);
    } catch (error) {
      notify.error(
        getApiErrorMessage(error, "Không thể lưu địa chỉ vào sổ kho."),
      );
    } finally {
      if (isFrom) setSavingFrom(false);
      else setSavingTo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Point A: Pickup Location */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
              A
            </span>
            <div>
              <Typography className="!font-black text-slate-800 !text-sm">
                Điểm Nhận Hàng (Pickup)
              </Typography>
              <span className="text-[0.7rem] text-slate-400 font-medium">
                Nơi nhà xe đến bốc hàng lên
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onOpenAddressBook("FROM")}
              startIcon={<ImportContactsIcon className="!text-[0.9rem]" />}
              className="!rounded-xl !text-xs !font-bold !capitalize !text-sky-700 !border-sky-200 hover:!bg-sky-50 !py-1.5 !px-3"
            >
              Sổ Địa Chỉ
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleSaveAddress("FROM")}
              disabled={savingFrom}
              startIcon={
                savingFrom ? (
                  <CircularProgress size={13} color="inherit" />
                ) : (
                  <BookmarkAddOutlinedIcon className="!text-[0.95rem]" />
                )
              }
              className="!rounded-xl !text-xs !font-bold !capitalize !bg-sky-700 hover:!bg-sky-800 !text-white !py-1.5 !px-3 shadow-xs"
            >
              {savingFrom ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            fullWidth
            label="Tên kho / nhà máy nhận"
            name="fromLocationName"
            value={form.fromLocationName}
            onChange={(e) => updateForm("fromLocationName", e.target.value)}
            placeholder="VD: Kho Samsung Yên Bình"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <Autocomplete
            freeSolo
            options={PROVINCE_NAMES}
            value={form.fromProvince || ""}
            onChange={(event, newValue) => updateForm("fromProvince", newValue || "")}
            onInputChange={(event, newInputValue) => updateForm("fromProvince", newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Tỉnh / Thành phố"
                placeholder="VD: Thái Nguyên"
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            )}
          />
        </div>

        <TextField
          fullWidth
          label="Địa chỉ chi tiết (Đường, Phường/Xã, Quận/Huyện)"
          name="fromAddress"
          value={form.fromAddress}
          onChange={(e) => updateForm("fromAddress", e.target.value)}
          placeholder="VD: Cổng số 3, KCN Yên Bình, Phổ Yên"
          required
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <TextField
            fullWidth
            label="Người liên hệ tại điểm nhận"
            name="fromContactName"
            value={form.fromContactName}
            onChange={(e) => updateForm("fromContactName", e.target.value)}
            placeholder="VD: Trần Thế Hải"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Số điện thoại người giao"
            name="fromContactPhone"
            value={form.fromContactPhone}
            onChange={(e) => updateForm("fromContactPhone", e.target.value)}
            placeholder="VD: 0912.345.678"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>

      {/* Point B: Delivery Location */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
              B
            </span>
            <div>
              <Typography className="!font-black text-slate-800 !text-sm">
                Điểm Giao Hàng (Delivery)
              </Typography>
              <span className="text-[0.7rem] text-slate-400 font-medium">
                Nơi nhà xe dỡ hàng bàn giao
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onOpenAddressBook("TO")}
              startIcon={<ImportContactsIcon className="!text-[0.9rem]" />}
              className="!rounded-xl !text-xs !font-bold !capitalize !text-emerald-700 !border-emerald-200 hover:!bg-emerald-50 !py-1.5 !px-3"
            >
              Sổ Địa Chỉ
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleSaveAddress("TO")}
              disabled={savingTo}
              startIcon={
                savingTo ? (
                  <CircularProgress size={13} color="inherit" />
                ) : (
                  <BookmarkAddOutlinedIcon className="!text-[0.95rem]" />
                )
              }
              className="!rounded-xl !text-xs !font-bold !capitalize !bg-emerald-700 hover:!bg-emerald-800 !text-white !py-1.5 !px-3 shadow-xs"
            >
              {savingTo ? "Đang lưu..." : "Lưu địa chỉ"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            fullWidth
            label="Tên kho / cảng giao"
            name="toLocationName"
            value={form.toLocationName}
            onChange={(e) => updateForm("toLocationName", e.target.value)}
            placeholder="VD: Kho Cảng Đình Vũ"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <Autocomplete
            freeSolo
            options={PROVINCE_NAMES}
            value={form.toProvince || ""}
            onChange={(event, newValue) => updateForm("toProvince", newValue || "")}
            onInputChange={(event, newInputValue) => updateForm("toProvince", newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Tỉnh / Thành phố"
                placeholder="VD: Hải Phòng"
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            )}
          />
        </div>

        <TextField
          fullWidth
          label="Địa chỉ chi tiết (Đường, Phường/Xã, Quận/Huyện)"
          name="toAddress"
          value={form.toAddress}
          onChange={(e) => updateForm("toAddress", e.target.value)}
          placeholder="VD: Cầu cảng số 2, Cảng Đình Vũ, Đông Hải 2"
          required
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          <TextField
            fullWidth
            label="Người nhận tại điểm giao"
            name="toContactName"
            value={form.toContactName}
            onChange={(e) => updateForm("toContactName", e.target.value)}
            placeholder="VD: Phạm Hồng Minh"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Số điện thoại người nhận"
            name="toContactPhone"
            value={form.toContactPhone}
            onChange={(e) => updateForm("toContactPhone", e.target.value)}
            placeholder="VD: 0904.445.555"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>

      {/* Time Windows */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <AccessTimeIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
            Khung Thời Gian Vận Chuyển Dự Kiến
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            type="datetime-local"
            label="Nhận hàng sớm nhất"
            name="earliestPickup" value={form.earliestPickup}
            onChange={(e) => updateForm("earliestPickup", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Nhận hàng trễ nhất"
            name="latestPickup" value={form.latestPickup}
            onChange={(e) => updateForm("latestPickup", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            type="datetime-local"
            label="Giao hàng sớm nhất"
            name="earliestDelivery" value={form.earliestDelivery}
            onChange={(e) => updateForm("earliestDelivery", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Giao hàng trễ nhất"
            name="latestDelivery" value={form.latestDelivery}
            onChange={(e) => updateForm("latestDelivery", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>
    </div>
  );
}
