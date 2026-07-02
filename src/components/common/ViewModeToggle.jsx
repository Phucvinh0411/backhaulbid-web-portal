"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ViewModule as ViewModuleIcon, ViewList as ViewListIcon } from "@mui/icons-material";

export default function ViewModeToggle({ viewMode, onChange, size = "small", sx = {} }) {
  const handleChange = (e, newMode) => {
    if (newMode !== null) {
      onChange(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleChange}
      size={size}
      sx={sx}
    >
      <ToggleButton value="CARD" aria-label="card view">
        <ViewModuleIcon />
      </ToggleButton>
      <ToggleButton value="TABLE" aria-label="table view">
        <ViewListIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
