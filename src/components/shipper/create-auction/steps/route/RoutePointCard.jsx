import TextField from "@mui/material/TextField";
import AddressPickerField from "@/components/address-picker";
import RoutePointHeader from "./RoutePointHeader";

const INPUT_SX = { "& .MuiOutlinedInput-root": { borderRadius: "16px" } };

/** One route point (A or B): address picker plus on-site contact. Field names come from config. */
export default function RoutePointCard({ config, form, updateForm, saving, onOpenAddressBook, onSave }) {
  const place = form[config.placeField];
  const contactName = form[config.contactNameField];
  const contactPhone = form[config.contactPhoneField];

  return (
    <section className="space-y-5 rounded-xl border border-line/80 bg-white p-6 shadow-xs">
      <RoutePointHeader
        config={config}
        saving={saving}
        onOpenAddressBook={() => onOpenAddressBook(config.target)}
        onSave={() => onSave(config.target, place, { contactName, contactPhone })}
      />

      <AddressPickerField
        required
        value={place}
        onChange={(next) => updateForm(config.placeField, next)}
        label={config.addressLabel}
        placeholder={config.addressPlaceholder}
        mapTitle={config.mapTitle}
      />

      <div className="grid grid-cols-1 gap-5 pt-1 md:grid-cols-2">
        <TextField
          fullWidth
          label={config.contactNameLabel}
          name={config.contactNameField}
          value={contactName}
          onChange={(event) => updateForm(config.contactNameField, event.target.value)}
          placeholder={config.contactNamePlaceholder}
          sx={INPUT_SX}
        />
        <TextField
          fullWidth
          label={config.contactPhoneLabel}
          name={config.contactPhoneField}
          value={contactPhone}
          onChange={(event) => updateForm(config.contactPhoneField, event.target.value)}
          placeholder={config.contactPhonePlaceholder}
          inputProps={{ inputMode: "tel" }}
          sx={INPUT_SX}
        />
      </div>
    </section>
  );
}
