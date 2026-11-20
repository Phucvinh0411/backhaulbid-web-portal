"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import EkycModal from "@/components/eKYC/EkycModal";
import { notifyAccountVerificationUpdated } from "@/hooks/useAccountVerification";

/** Opens the shared NFC verification flow when the user visits the eKYC route. */
export default function EkycPage() {
  const router = useRouter();

  /** Returns to the page that opened the standalone verification route. */
  function returnToPreviousPage() {
    router.back();
  }

  function handleComplete() {
    notifyAccountVerificationUpdated();
    router.back();
  }

  return (
    <Box className="min-h-screen bg-canvas">
      <EkycModal open onClose={returnToPreviousPage} onComplete={handleComplete} />
    </Box>
  );
}
