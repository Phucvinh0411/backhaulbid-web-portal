"use client";

import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import SuggestionOption from "./SuggestionOption";
import { MIN_QUERY_LENGTH, usePlaceSearch } from "./usePlaceSearch";

const NO_OPTIONS_TEXT = {
  idle: `Nhập ít nhất ${MIN_QUERY_LENGTH} ký tự để tìm địa chỉ`,
  loading: "Đang tìm địa chỉ…",
  empty: "Không tìm thấy địa chỉ phù hợp. Thử từ khoá khác hoặc chọn trên bản đồ.",
  error: "Không tải được gợi ý. Thử lại hoặc chọn trên bản đồ.",
  ready: "",
};

const INPUT_SX = { "& .MuiOutlinedInput-root": { borderRadius: "16px" } };

/**
 * Single text box with address suggestions. Only a picked suggestion becomes the value: typing after a pick clears it,
 * so the form never holds text that does not match its province and pin.
 */
export default function AddressSearchInput({
  value,
  onSelect,
  onClear,
  label = "Địa chỉ",
  placeholder = "Tìm tên kho, đường, khu công nghiệp…",
  required = false,
  disabled = false,
  error = false,
  helperText,
  autoFocus = false,
}) {
  const selectedAddress = value?.address ?? "";
  const [inputValue, setInputValue] = useState(selectedAddress);
  const [syncedAddress, setSyncedAddress] = useState(selectedAddress);

  // A value set from outside (address book, map) replaces the text. A cleared value keeps what the user is typing.
  if (selectedAddress && selectedAddress !== syncedAddress) {
    setSyncedAddress(selectedAddress);
    setInputValue(selectedAddress);
  }

  const isBrowsingSelection = Boolean(value) && inputValue === selectedAddress;
  const { places, status } = usePlaceSearch(isBrowsingSelection ? "" : inputValue);
  const options = value ? [value, ...places.filter((place) => place.id !== value.id)] : places;

  const handleInputChange = (_event, nextText, reason) => {
    setInputValue(nextText);
    if (reason === "input" && value) onClear();
  };

  const handleChange = (_event, place) => {
    if (place) onSelect(place);
    else onClear();
  };

  return (
    <Autocomplete
      fullWidth
      autoHighlight
      // Keeps typed text when the value is cleared; otherwise MUI would wipe the input on each keystroke after a pick.
      clearOnBlur={false}
      value={value ?? null}
      inputValue={inputValue}
      options={options}
      filterOptions={(items) => items}
      getOptionLabel={(place) => place?.address ?? ""}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={status === "loading"}
      loadingText={NO_OPTIONS_TEXT.loading}
      noOptionsText={NO_OPTIONS_TEXT[status]}
      disabled={disabled}
      renderOption={({ key, ...optionProps }, place) => (
        <li key={key} {...optionProps}>
          <SuggestionOption place={place} />
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          autoFocus={autoFocus}
          sx={INPUT_SX}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-ink-subtle" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {status === "loading" && <CircularProgress size={18} color="inherit" />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
