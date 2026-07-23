"use client";

import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import NavigationIcon from "@mui/icons-material/NavigationOutlined";
import ImportContactsIcon from "@mui/icons-material/ImportContactsOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";

export default function Step2RouteInfo({ form, updateForm, onOpenAddressBook }) {
  return (
    <div className="space-y-6">
      {/* Point A: Pickup Location */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-sky-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
              A
            </span>
            <div>
              <Typography className="!font-black text-slate-800 !text-sm">
                Điểm Nhận Hàng (Pickup)
              </Typography>
              <span className="text-[0.68rem] text-slate-400 font-medium">Nơi nhà xe đến bốc hàng lên</span>
            </div>
          </div>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onOpenAddressBook("FROM")}
            startIcon={<ImportContactsIcon className="!text-[0.9rem]" />}
            className="!rounded-xl !text-xs !font-bold !capitalize !text-sky-700 !border-sky-200 hover:!bg-sky-50"
          >
            Sổ Địa Chỉ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Tên kho / nhà máy nhận"
            value={form.fromLocationName}
            onChange={(e) => updateForm("fromLocationName", e.target.value)}
            placeholder="VD: Kho Samsung Yên Bình"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Tỉnh / Thành phố"
            value={form.fromProvince}
            onChange={(e) => updateForm("fromProvince", e.target.value)}
            placeholder="VD: Thái Nguyên"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <TextField
          fullWidth
          label="Địa chỉ chi tiết (Đường, Phường/Xã, Quận/Huyện)"
          value={form.fromAddress}
          onChange={(e) => updateForm("fromAddress", e.target.value)}
          placeholder="VD: Cổng số 3, KCN Yên Bình, Phổ Yên"
          required
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Người liên hệ tại điểm nhận"
            value={form.fromContactName}
            onChange={(e) => updateForm("fromContactName", e.target.value)}
            placeholder="VD: Trần Thế Hải"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Số điện thoại người giao"
            value={form.fromContactPhone}
            onChange={(e) => updateForm("fromContactPhone", e.target.value)}
            placeholder="VD: 0912.345.678"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>

      {/* Point B: Delivery Location */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
              B
            </span>
            <div>
              <Typography className="!font-black text-slate-800 !text-sm">
                Điểm Giao Hàng (Delivery)
              </Typography>
              <span className="text-[0.68rem] text-slate-400 font-medium">Nơi nhà xe dỡ hàng bàn giao</span>
            </div>
          </div>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onOpenAddressBook("TO")}
            startIcon={<ImportContactsIcon className="!text-[0.9rem]" />}
            className="!rounded-xl !text-xs !font-bold !capitalize !text-emerald-700 !border-emerald-200 hover:!bg-emerald-50"
          >
            Sổ Địa Chỉ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Tên kho / cảng giao"
            value={form.toLocationName}
            onChange={(e) => updateForm("toLocationName", e.target.value)}
            placeholder="VD: Kho Cảng Đình Vũ"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Tỉnh / Thành phố"
            value={form.toProvince}
            onChange={(e) => updateForm("toProvince", e.target.value)}
            placeholder="VD: Hải Phòng"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <TextField
          fullWidth
          label="Địa chỉ chi tiết (Đường, Phường/Xã, Quận/Huyện)"
          value={form.toAddress}
          onChange={(e) => updateForm("toAddress", e.target.value)}
          placeholder="VD: Cầu cảng số 2, Cảng Đình Vũ, Đông Hải 2"
          required
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Người nhận tại điểm giao"
            value={form.toContactName}
            onChange={(e) => updateForm("toContactName", e.target.value)}
            placeholder="VD: Phạm Hồng Minh"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Số điện thoại người nhận"
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
            value={form.earliestPickup}
            onChange={(e) => updateForm("earliestPickup", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Nhận hàng trễ nhất"
            value={form.latestPickup}
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
            value={form.earliestDelivery}
            onChange={(e) => updateForm("earliestDelivery", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            type="datetime-local"
            label="Giao hàng trễ nhất"
            value={form.latestDelivery}
            onChange={(e) => updateForm("latestDelivery", e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>
      </div>
    </div>
  );
}
