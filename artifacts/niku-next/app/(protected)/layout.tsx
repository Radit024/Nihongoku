"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAppContext } from "@/context/AppContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="center-screen">
        <div className="session-loading-card" aria-live="polite" aria-busy="true">
          <div className="session-loading-mark">に</div>
          <h2>Memuat sesi</h2>
          <p>Menyiapkan akun kamu...</p>
          <div className="session-loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
