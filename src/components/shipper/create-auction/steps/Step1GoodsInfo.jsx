"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";

import { GOODS_CATEGORIES, VEHICLE_TYPES, formatDisplayNumber, parseDisplayNumber } from "../mockData";

export default function Step1GoodsInfo({ form, updateForm }) {
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
            value={form.goodsName}
            onChange={(e) => updateForm("goodsName", e.target.value)}
            placeholder="VD: Linh kiện điện tử Samsung"
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <TextField
            fullWidth
            select
            label="Phân loại hàng hóa"
            value={form.goodsCategory}
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
            value={form.weight}
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
            value={form.volume}
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
            value={form.requiredVehicleType}
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
            value={form.requiredTemp}
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
              value={form.vehicleLength}
              onChange={(e) => updateForm("vehicleLength", Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <TextField
              label="Chiều rộng (m)"
              type="number"
              value={form.vehicleWidth}
              onChange={(e) => updateForm("vehicleWidth", Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <TextField
              label="Chiều cao (m)"
              type="number"
              value={form.vehicleHeight}
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
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
          placeholder="Yêu cầu chằng buộc kỹ, chống va đập, bảo quản khô ráo..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />
      </div>
    </div>
  );
}
