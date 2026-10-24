import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import { secondaryText } from "./placeParser";

/** One suggestion row: place name on top, the rest of the address underneath. */
export default function SuggestionOption({ place }) {
  const secondary = secondaryText(place);
  return (
    <div className="flex w-full items-start gap-3 py-1">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
        <LocationOnIcon className="!text-[1.05rem]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{place.locationName}</p>
        {secondary && <p className="line-clamp-2 text-xs font-medium text-ink-muted">{secondary}</p>}
      </div>
    </div>
  );
}
