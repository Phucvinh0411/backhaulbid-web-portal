"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { useParams } from "next/navigation";

import TripTrackingView from "@/components/tracking/TripTrackingView";

export default function TransportTrackingPage() {
  const params = useParams();
  const transportId = params.id;
  const shortId = String(transportId).slice(0, 8);

  return (
    <Box className="flex w-full flex-col gap-6 pb-12 mt-6 animate-fade-in-up">
      <Box className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Box>
          <Box className="mb-2 flex items-center gap-1 text-slate-500">
            <Typography component={Link} href="/carrier/transports" variant="body2" className="transition-colors hover:text-[#1B4965]">
              Quản lý vận chuyển
            </Typography>
            <ChevronRightIcon fontSize="small" />
            <Typography variant="body2" className="font-medium text-slate-800">
              Theo dõi #{shortId}
            </Typography>
          </Box>
          <Typography variant="h5" className="font-bold text-[#1B4965]">
            Theo Dõi Chuyến Vận Chuyển
          </Typography>
        </Box>
      </Box>

      <TripTrackingView tripId={transportId} />
    </Box>
  );
}
