"use client";

import Typography from "@mui/material/Typography";
import VerifiedIcon from "@mui/icons-material/Verified";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import { ActionButton, AsymmetricCornerBox } from "@/components/common";

export default function CarrierHeroBanner({ carrier, onBack }) {
  return (
    <AsymmetricCornerBox
      cornerPosition="top-right"
      accentBorder={true}
      padding="none"
      className="!bg-gradient-to-br from-[#0D2B3E] via-[#1B4965] to-[#163E56] text-white p-6 md:p-8 shadow-xl relative overflow-hidden mb-6"
    >
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left Avatar & Info */}
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/10 text-white flex items-center justify-center font-black text-2xl md:text-3xl border border-white/20 shadow-inner shrink-0">
            {carrier.avatar}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.7rem] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-0.5 rounded-full border border-emerald-400/30 inline-flex items-center gap-1">
                <VerifiedIcon className="!text-[0.85rem]" /> {carrier.badge}
              </span>
              <span className="text-xs text-slate-300">
                Mã hệ thống: <strong className="text-white font-mono">{carrier.code}</strong>
              </span>
            </div>

            <Typography variant="h4" className="!font-black !text-white !text-xl md:!text-2xl mt-1 leading-tight">
              {carrier.carrierName}
            </Typography>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="!text-[0.95rem] text-emerald-400" />
                Hotline: <strong className="text-white font-mono">{carrier.hotline}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <EmailIcon className="!text-[0.95rem] text-sky-400" />
                {carrier.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          {onBack && (
            <ActionButton
              variant="outlined"
              size="md"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
            >
              Quay lại
            </ActionButton>
          )}

          <ActionButton
            variant="success"
            size="md"
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${carrier.hotline}`)}
          >
            Liên hệ trực tiếp
          </ActionButton>
        </div>
      </div>
    </AsymmetricCornerBox>
  );
}
