"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import LandingPage from "../components/public/LandingPage";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = window.localStorage.getItem("userRole");
      if (role) {
        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace(`/${role}/dashboard`);
        }
      } else {
        setIsRedirecting(false);
      }
    }
  }, [router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-surface-sunken flex items-center justify-center">
        <CircularProgress size={32} aria-label="Đang chuyển hướng" />
      </div>
    );
  }

  return <LandingPage />;
}
