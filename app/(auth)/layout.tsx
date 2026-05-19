"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { LoaderOverlay } from "@/components/ui/loader-overlay";
import { getStoredSession } from "@/lib/auth/session";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (getStoredSession()) {
        router.replace("/chat");
        return;
      }

      setIsChecking(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [router]);

  if (isChecking) {
    return <LoaderOverlay />;
  }

  return children;
}
