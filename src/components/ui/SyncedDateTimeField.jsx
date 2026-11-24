"use client";

import TextField from "@mui/material/TextField";
import { useNativeInputSync } from "@/hooks/useNativeInputSync";

/**
 * Controlled MUI `datetime-local` input that also listens to native `input`/`change` events
 * so programmatic fills and step transitions never drop uncommitted DOM values.
 */
export default function SyncedDateTimeField({
  value,
  onValueChange,
  InputLabelProps,
  ...textFieldProps
}) {
  const inputRef = useNativeInputSync((nextValue) => onValueChange?.(nextValue));

  return (
    <TextField
      fullWidth
      type="datetime-local"
      value={value ?? ""}
      onChange={(event) => onValueChange?.(event.target.value)}
      onInput={(event) => onValueChange?.(event.target.value)}
      inputRef={inputRef}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...textFieldProps}
    />
  );
}
