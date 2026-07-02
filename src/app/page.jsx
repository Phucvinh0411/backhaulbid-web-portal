"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "../components/public/LandingPage";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  return <LandingPage />;
}
