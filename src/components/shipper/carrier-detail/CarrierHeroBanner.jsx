"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import { HighlightPanel, StatusBadge } from "@/components/ui";

const hasValue = (value) => Boolean(value) && value !== "Chưa cập nhật";

/** Carrier identity on the navy band (DESIGN.md): the one inverted panel of the profile page. */
export default function CarrierHeroBanner({ carrier, onBack }) {
  const canCall = hasValue(carrier.hotline);
  return (
    <HighlightPanel component="header" sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <Box aria-hidden sx={{ width: { xs: 56, md: 72 }, height: { xs: 56, md: 72 }, borderRadius: 2, bgcolor: "var(--color-band-hover)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" }, flexShrink: 0 }}>
            {carrier.avatar}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <StatusBadge size="sm" tone={carrier.verified ? "success" : "neutral"} icon={carrier.verified ? "done" : "help"} label={carrier.badge} />
            <Typography component="h1" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 700, mt: 0.75, overflowWrap: "anywhere" }}>
              {carrier.carrierName}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.5, sm: 2 }, mt: 0.75, color: "var(--color-on-band-soft)", fontSize: "0.875rem" }}>
              <Box component="span" className="tabular">Mã hệ thống: {carrier.code}</Box>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon aria-hidden sx={{ fontSize: 16 }} /> <span className="tabular">{carrier.hotline}</span>
              </Box>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, overflowWrap: "anywhere" }}>
                <EmailIcon aria-hidden sx={{ fontSize: 16 }} /> {carrier.email}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
          {onBack && (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack} sx={HighlightPanel.secondaryButtonSx}>
              Quay lại
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PhoneIcon />}
            disabled={!canCall}
            component="a"
            href={canCall ? `tel:${carrier.hotline}` : undefined}
            sx={HighlightPanel.buttonSx}
          >
            Gọi nhà xe
          </Button>
        </Box>
      </Box>
    </HighlightPanel>
  );
}
