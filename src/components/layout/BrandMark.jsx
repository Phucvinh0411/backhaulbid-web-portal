import Box from "@mui/material/Box";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

/** Product wordmark: a rounded square mark and the product name. `inverted` is for the navy band. */
export default function BrandMark({ compact = false, inverted = false }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 32,
          borderRadius: "10px",
          bgcolor: inverted ? "common.white" : "primary.main",
          color: inverted ? "primary.main" : "common.white",
          display: "grid",
          placeItems: "center",
        }}
      >
        <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} />
      </Box>
      {!compact && (
        <Box component="span" sx={{ fontWeight: 700, fontSize: "1.0625rem", color: inverted ? "common.white" : "text.primary" }}>
          BackHaulBid
        </Box>
      )}
    </Box>
  );
}
