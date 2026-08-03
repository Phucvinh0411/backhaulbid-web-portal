import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function DetailRow({ label, value, valueColor = "text-slate-800", valueClassName = "" }) {
  const valueClasses = `font-semibold text-right break-words ${valueColor} ${valueClassName}`;

  return (
    <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-2 border-b border-slate-100 last:border-0 gap-1 sm:gap-4">
      <Typography variant="body2" className="text-slate-500 font-medium shrink-0 uppercase text-[0.7rem] tracking-wider">
        {label}
      </Typography>
      {React.isValidElement(value) ? (
        <Box component="div" className={valueClasses}>
          {value}
        </Box>
      ) : (
        <Typography variant="body1" className={valueClasses}>
          {value}
        </Typography>
      )}
    </Box>
  );
}
