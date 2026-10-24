import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ScheduleReminder from "./ScheduleReminder";

const INPUT_SX = { "& .MuiOutlinedInput-root": { borderRadius: "16px" } };

const WINDOW_ROWS = [
  [
    { field: "earliestPickup", label: "Nhận hàng sớm nhất" },
    { field: "latestPickup", label: "Nhận hàng trễ nhất" },
  ],
  [
    { field: "earliestDelivery", label: "Giao hàng sớm nhất" },
    { field: "latestDelivery", label: "Giao hàng trễ nhất" },
  ],
];

/** Expected pickup and delivery time windows. */
export default function TimeWindowCard({ form, updateForm }) {
  return (
    <section className="space-y-4 rounded-xl border border-line/80 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning-soft text-warning">
          <AccessTimeIcon className="!text-[1.1rem]" />
        </div>
        <Typography className="!text-sm !font-black text-ink">Khung Thời Gian Vận Chuyển Dự Kiến</Typography>
      </div>

      <ScheduleReminder form={form} step="shipping" />

      {WINDOW_ROWS.map((row) => (
        <div key={row[0].field} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {row.map(({ field, label }) => (
            <TextField
              key={field}
              fullWidth
              type="datetime-local"
              label={label}
              name={field}
              value={form[field]}
              onChange={(event) => updateForm(field, event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={INPUT_SX}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
