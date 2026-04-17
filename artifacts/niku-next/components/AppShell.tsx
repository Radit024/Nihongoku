"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  IoBook,
  IoBookOutline,
  IoCloudUpload,
  IoCloudUploadOutline,
  IoHome,
  IoHomeOutline,
  IoPersonCircle,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";

const DOSEN_NAV = [
  { href: "/dashboard", label: "Beranda", activeIcon: IoHome, icon: IoHomeOutline },
  { href: "/kelas", label: "Kelas", activeIcon: IoBook, icon: IoBookOutline },
  { href: "/upload", label: "Upload", activeIcon: IoCloudUpload, icon: IoCloudUploadOutline },
  { href: "/progress", label: "Profil", activeIcon: IoPersonCircle, icon: IoPersonCircleOutline },
];

const MAHASISWA_NAV = [
  { href: "/dashboard", label: "Beranda", activeIcon: IoHome, icon: IoHomeOutline },
  { href: "/kelas", label: "Kelas", activeIcon: IoBook, icon: IoBookOutline },
  { href: "/progress", label: "Profil", activeIcon: IoPersonCircle, icon: IoPersonCircleOutline },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAppContext();
  const isDosen = user?.role === "dosen";
  const links = isDosen ? DOSEN_NAV : MAHASISWA_NAV;
  const firstName = user?.name?.split(" ")[0] ?? "Gakusei";

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-nav-header">
          <p className="side-nav-kicker">Nihongoku</p>
          <h2>Halo, {firstName}</h2>
          <p className="muted">{isDosen ? "Portal Dosen" : "Portal Mahasiswa"}</p>
        </div>

        <nav
          className="side-nav-links"
          style={{ "--nav-count": links.length } as React.CSSProperties}
        >
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = active ? link.activeIcon : link.icon;

            return (
              <Link key={link.href} href={link.href} className={active ? "side-nav-link active" : "side-nav-link"}>
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="shell-main">
        <main className="page-body">{children}</main>

        <nav
          className="bottom-nav"
          style={{ "--nav-count": links.length } as React.CSSProperties}
        >
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = active ? link.activeIcon : link.icon;

            return (
              <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
                <Icon size={22} className="nav-icon" />
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
