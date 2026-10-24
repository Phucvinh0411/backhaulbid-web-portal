import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import ImportContactsIcon from "@mui/icons-material/ImportContactsOutlined";

/** Card header: A/B badge, title, and the address book actions. */
export default function RoutePointHeader({ config, saving, onOpenAddressBook, onSave }) {
  const { badge, title, subtitle, classes } = config;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-xs ${classes.badge}`}>
          {badge}
        </span>
        <div>
          <Typography className="!text-sm !font-black text-ink">{title}</Typography>
          <span className="text-[0.7rem] font-medium text-ink-subtle">{subtitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="small"
          variant="outlined"
          onClick={onOpenAddressBook}
          startIcon={<ImportContactsIcon className="!text-[0.9rem]" />}
          className={`!rounded-xl !px-3 !py-1.5 !text-xs !font-bold !capitalize ${classes.outlinedButton}`}
        >
          Sổ Địa Chỉ
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <BookmarkAddOutlinedIcon className="!text-[0.95rem]" />}
          className={`!rounded-xl !px-3 !py-1.5 !text-xs !font-bold !capitalize !text-white shadow-xs ${classes.containedButton}`}
        >
          {saving ? "Đang lưu..." : "Lưu địa chỉ"}
        </Button>
      </div>
    </div>
  );
}
