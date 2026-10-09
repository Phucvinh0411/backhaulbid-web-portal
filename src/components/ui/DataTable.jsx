"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

const cellValue = (column, row) => (column.render ? column.render(row) : row[column.key] ?? "—");

/**
 * DESIGN.md data table: soft header, hairline rows, numeric columns right-aligned with
 * tabular figures. Below `md` the same rows render as stacked cards so nothing scrolls sideways.
 * columns: [{ key, label, numeric?, align?, primary?, hideOnMobile?, render?(row) }]
 */
export default function DataTable({ columns, rows, getRowKey = (row) => row.id, onRowClick, rowLabel, caption, emptyText = "Chưa có dữ liệu." }) {
  if (!rows.length) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", p: 2, bgcolor: "var(--color-surface-sunken)", borderRadius: 2 }}>
        {emptyText}
      </Typography>
    );
  }
  const primary = columns.find((column) => column.primary) || columns[0];

  return (
    <>
      <Box sx={{ display: { xs: "none", md: "block" }, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Table size="small" aria-label={caption}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.numeric ? "right" : column.align || "left"} sx={{ py: 1.25 }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? "pointer" : "default", "&:last-child td": { borderBottom: 0 } }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.numeric ? "right" : column.align || "left"} className={column.numeric ? "tabular" : undefined} sx={{ py: 1.5 }}>
                    {cellValue(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box component="ul" aria-label={caption} sx={{ display: { xs: "grid", md: "none" }, gap: 1, m: 0, p: 0 }}>
        {rows.map((row) => {
          const content = (
            <Box sx={{ width: "100%", textAlign: "left", display: "grid", gap: 0.75 }}>
              <Box sx={{ fontWeight: 600, color: "text.primary" }}>{cellValue(primary, row)}</Box>
              <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 1.5, rowGap: 0.5 }}>
                {columns.filter((column) => column !== primary && !column.hideOnMobile).map((column) => (
                  <Box key={column.key} sx={{ display: "contents" }}>
                    <Typography component="dt" variant="body2" sx={{ color: "text.secondary" }}>{column.label}</Typography>
                    <Typography component="dd" variant="body2" className={column.numeric ? "tabular" : undefined} sx={{ m: 0, textAlign: "right", color: "text.primary", overflowWrap: "anywhere" }}>
                      {cellValue(column, row)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
          return (
            <Box component="li" key={getRowKey(row)} sx={{ listStyle: "none", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              {onRowClick ? (
                <ButtonBase onClick={() => onRowClick(row)} aria-label={rowLabel ? rowLabel(row) : undefined} sx={{ display: "block", width: "100%", p: 2, borderRadius: 2 }}>
                  {content}
                </ButtonBase>
              ) : (
                <Box sx={{ p: 2 }}>{content}</Box>
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
}
