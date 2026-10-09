"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import EkycModal from "@/components/eKYC/EkycModal";

/** Opens the shared NFC verification flow when the user visits the eKYC route. */
export default function EkycPage() {
  const router = useRouter();

  /** Returns to the page that opened the standalone verification route. */
  function returnToPreviousPage() {
    router.back();
  }

  return (
    <Box className="min-h-screen bg-canvas">
      <EkycModal open onClose={returnToPreviousPage} />
    </Box>
  );
}
