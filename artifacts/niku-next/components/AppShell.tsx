"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAppContext } from "@/context/AppContext";

const DOSEN_NAV = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/materi", label: "Materi" },
  { href: "/upload", label: "Upload" },
  { href: "/progress", label: "Profil" },
];

const MAHASISWA_NAV = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/materi", label: "Materi" },
  { href: "/kuis", label: "Kuis" },
  { href: "/progress", label: "Profil" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAppContext();
  const links = user?.role === "dosen" ? DOSEN_NAV : MAHASISWA_NAV;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="topbar-sub">NIKU Web</p>
          <h1 className="topbar-title">{user?.name ?? "Pengguna"}</h1>
          <p className="topbar-meta">
            {user?.role === "dosen" ? "Sensei" : "Mahasiswa"}
            {user?.classCode ? ` - ${user.classCode}` : " - Belum gabung kelas"}
          </p>
        </div>
        <button className="ghost-btn" onClick={logout} type="button">
          Logout
        </button>
      </header>

      <main className="page-body">{children}</main>

      <nav className="bottom-nav">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
