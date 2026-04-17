"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

export default function DashboardPage() {
  const { user, materials, progressData, refreshMaterials, refreshProgress, getLevelInfo } = useAppContext();

  useEffect(() => {
    void Promise.all([refreshMaterials(), refreshProgress()]);
  }, [refreshMaterials, refreshProgress]);

  const levelInfo = getLevelInfo();

  return (
    <section className="stack-lg">
      <article className="card hero-card">
        <h2>Konnichiwa, {user?.name ?? "Gakusei"}</h2>
        <p>
          Level {levelInfo.level} - {levelInfo.title} ({progressData?.user.xp ?? user?.xp ?? 0} XP)
        </p>
        <p className="muted">Class Code: {user?.classCode || "Belum ada"}</p>
      </article>

      <section className="grid two-col">
        <article className="card">
          <h3>Total Materi</h3>
          <p className="big-number">{materials.length}</p>
        </article>
        <article className="card">
          <h3>Kuis Lulus</h3>
          <p className="big-number">{progressData?.passedQuizzes ?? 0}</p>
        </article>
      </section>

      <section className="grid two-col">
        <Link href="/materi" className="card link-card">
          <h3>Lihat Materi</h3>
          <p className="muted">Buka daftar materi kelas</p>
        </Link>
        {user?.role === "dosen" ? (
          <Link href="/upload" className="card link-card">
            <h3>Upload Materi</h3>
            <p className="muted">Unggah dan review kuis AI</p>
          </Link>
        ) : (
          <Link href="/kuis" className="card link-card">
            <h3>Mulai Kuis</h3>
            <p className="muted">Kerjakan kuis dari materi published</p>
          </Link>
        )}
      </section>
    </section>
  );
}
