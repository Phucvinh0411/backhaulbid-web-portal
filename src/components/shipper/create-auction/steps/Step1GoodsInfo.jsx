"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";

import { GOODS_CATEGORIES, VEHICLE_TYPES, formatDisplayNumber, parseDisplayNumber } from "../mockData";

export default function Step1GoodsInfo({ form, updateForm, imageUploading, onImagesSelected, onRemoveImage }) {
  return (
    <div className="space-y-6">
      {/* Category 1: General Cargo Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <InventoryIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
            1. Thông Tin Lô Hàng
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            label="Tên lô hàng / sản phẩm"
            name="goodsName" value={form.goodsName}
            onChange={(e) => updateForm("goodsName", e.target.value)}
            placeholder="VD: Linh kiện điện tử Samsung"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            select
            label="Phân loại hàng hóa"
            name="goodsCategory" value={form.goodsCategory}
            onChange={(e) => updateForm("goodsCategory", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          >
            {GOODS_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            fullWidth
            label="Tổng trọng lượng (Tấn)"
            type="number"
            name="weight" value={form.weight}
            onChange={(e) => updateForm("weight", Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-400">tấn</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Tổng thể tích (m³)"
            type="number"
            name="volume" value={form.volume}
            onChange={(e) => updateForm("volume", Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-400">m³</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            label="Giá trị ước tính lô hàng"
            type="text"
            inputMode="numeric"
            value={formatDisplayNumber(form.goodsValue)}
            onChange={(e) => updateForm("goodsValue", parseDisplayNumber(e.target.value))}
            placeholder="VD: 180.000.000"
            InputProps={{
              endAdornment: <InputAdornment position="end"><span className="text-xs font-bold text-slate-500">đ</span></InputAdornment>,
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" }, "& input": { fontFamily: "monospace", fontWeight: 700 } }}
          />

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Typography className="!font-black text-slate-800 !text-sm">Ảnh hàng hóa</Typography>
                <Typography variant="caption" className="text-slate-500">
                  JPEG, PNG hoặc WebP · tối đa 5 ảnh · 10 MB/ảnh
                </Typography>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1B4965] px-4 py-2 text-sm font-bold text-white hover:bg-[#153b52]">
                {imageUploading ? <CircularProgress size={18} className="!text-white" /> : <CloudUploadIcon fontSize="small" />}
                {imageUploading ? "Đang tải..." : "Chọn ảnh"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={imageUploading}
                  onChange={onImagesSelected}
                />
              </label>
            </div>
            {form.images?.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {form.images.map((imageUrl) => (
                  <div key={imageUrl} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div
                      role="img"
                      aria-label="Ảnh hàng hóa"
                      className="h-24 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    <button
                      type="button"
                      aria-label="Xóa ảnh hàng hóa"
                      onClick={() => onRemoveImage(imageUrl)}
                      className="absolute right-1 top-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs font-bold text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body2" className="mt-3 text-slate-500">Chưa có ảnh hàng hóa.</Typography>
            )}
          </div>
        </div>
      </div>

      {/* Category 2: Vehicle Specs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <LocalShippingIcon className="!text-[1.1rem]" />
          </div>
          <Typography className="!font-black text-slate-800 !text-sm">
            2. Yêu Cầu Phương Tiện Vận Chuyển
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            fullWidth
            select
            label="Loại xe yêu cầu"
            name="requiredVehicleType" value={form.requiredVehicleType}
            onChange={(e) => updateForm("requiredVehicleType", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          >
            {VEHICLE_TYPES.map((v) => (
              <MenuItem key={v.value} value={v.value}>
                {v.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Nhiệt độ bảo quản (Nếu có)"
            name="requiredTemp" value={form.requiredTemp}
            onChange={(e) => updateForm("requiredTemp", e.target.value)}
            placeholder="VD: -18 °C (cho hàng lạnh) hoặc Bỏ trống"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 block mb-4">Kích thước lọt lòng thùng xe tối thiểu (Dài × Rộng × Cao):</label>
          <div className="grid grid-cols-3 gap-3">
            <TextField
              label="Chiều dài (m)"
              type="number"
              name="vehicleLength" value={form.vehicleLength}
              onChange={(e) => updateForm("vehicleLength", Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <TextField
              label="Chiều rộng (m)"
              type="number"
              name="vehicleWidth" value={form.vehicleWidth}
              onChange={(e) => updateForm("vehicleWidth", Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <TextField
              label="Chiều cao (m)"
              type="number"
              name="vehicleHeight" value={form.vehicleHeight}
              onChange={(e) => updateForm("vehicleHeight", Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
          </div>
        </div>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Mô tả hàng hóa & Yêu cầu bốc xếp / bảo quản"
          name="description" value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
          placeholder="Yêu cầu chằng buộc kỹ, chống va đập, bảo quản khô ráo..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />
      </div>
    </div>
  );
}
