"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAppContext();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isLoading, router, user]);

  return (
    <div className="center-screen">
      <p>Memuat aplikasi...</p>
    </div>
  );
}
