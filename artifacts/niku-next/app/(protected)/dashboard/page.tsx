"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  IoBookOutline,
  IoChatbubblesOutline,
  IoChevronForward,
  IoCloudUploadOutline,
  IoCreateOutline,
  IoDocumentText,
  IoFlame,
  IoFlash,
  IoGlobeOutline,
  IoHelpCircleOutline,
  IoLanguageOutline,
  IoListOutline,
  IoTrophy,
} from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";

const CATEGORIES = [
  { key: "Tata Bahasa", icon: IoLanguageOutline, color: "#C0272D", bg: "#FFF0F0" },
  { key: "Kosakata", icon: IoListOutline, color: "#059669", bg: "#ECFDF5" },
  { key: "Kanji", icon: IoCreateOutline, color: "#7C3AED", bg: "#F5F3FF" },
  { key: "Percakapan", icon: IoChatbubblesOutline, color: "#2563EB", bg: "#EFF6FF" },
  { key: "Budaya", icon: IoGlobeOutline, color: "#D97706", bg: "#FFFBEB" },
];

export default function DashboardPage() {
  const { user, materials, progressData, refreshMaterials, refreshProgress, getLevelInfo } = useAppContext();

  useEffect(() => {
    void Promise.all([refreshMaterials(), refreshProgress()]);
  }, [refreshMaterials, refreshProgress]);

  const isSensei = user?.role === "sensei";
  const levelInfo = getLevelInfo();
  const firstName = user?.name?.split(" ")[0] || "Gakusei";
  const fullName = user?.name || "Gakusei";
  const userInitial = fullName.charAt(0).toUpperCase();
  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;
  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = Math.max(1, levelInfo.xpEnd - levelInfo.xpStart);
  const xpPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  const myMaterials = useMemo(
    () => materials.filter((material) => material.createdById === user?.id),
    [materials, user?.id],
  );
  const totalSoal = myMaterials.reduce((sum, material) => sum + material.questionCount, 0);

  const categoryCounts = useMemo(() => {
    const record: Record<string, number> = {};
    for (const material of materials) {
      record[material.category] = (record[material.category] || 0) + 1;
    }
    return record;
  }, [materials]);

  const activeCategories = useMemo(() => {
    return CATEGORIES.filter((category) => categoryCounts[category.key]);
  }, [categoryCounts]);

  return (
    <section className="screen dashboard-screen">
      <header className="screen-header dashboard-header">
        {isSensei ? (
          <>
            <div className="row-between">
              <div>
                <p className="dashboard-sub">Konnichiwa, Sensei</p>
                <h2 className="dashboard-title">{firstName}</h2>
              </div>
              <span className="dashboard-role-badge">Sensei</span>
            </div>

            <section className="dashboard-stat-row">
              <article className="dashboard-stat glass">
                <p className="dashboard-stat-value">{myMaterials.length}</p>
                <p className="dashboard-stat-label">Materi</p>
              </article>
              <article className="dashboard-stat glass">
                <p className="dashboard-stat-value">{totalSoal}</p>
                <p className="dashboard-stat-label">Soal Dibuat</p>
              </article>
              <article className="dashboard-stat glass">
                <p className="dashboard-stat-value">{materials.length}</p>
                <p className="dashboard-stat-label">Total Materi</p>
              </article>
            </section>
          </>
        ) : (
          <>
            <div className="dashboard-user-row">
              <div className="dashboard-user-left">
                <div className="dashboard-avatar">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`Foto profil ${fullName}`} className="avatar-image" />
                  ) : (
                    userInitial
                  )}
                </div>
                <div>
                  <h2 className="dashboard-user-name">{fullName}</h2>
                  <p className="dashboard-sub">Gakousei · Lv.{levelInfo.level} {levelInfo.title}</p>
                </div>
              </div>

              <Link href="/progress" className="dashboard-edit-btn" aria-label="Edit profil">
                <IoCreateOutline size={14} />
              </Link>
            </div>

            <div className="stack-sm">
              <div className="row-between">
                <p className="dashboard-sub">Progress Lv.{levelInfo.level + 1}</p>
                <p className="dashboard-sub">{xp} XP · {xpPct}%</p>
              </div>
              <div className="xp-track bright">
                <div className="xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </>
        )}
      </header>

      {!isSensei ? (
        <section className="dashboard-strip">
          <article className="dashboard-mini-card">
            <span className="dashboard-mini-icon bg-red"><IoFlash size={13} /></span>
            <p className="dashboard-mini-value">{xp}</p>
            <p className="dashboard-mini-label">Total XP</p>
          </article>
          <article className="dashboard-mini-card streak-mini-card">
            <span className="dashboard-mini-icon bg-orange streak-mini-icon"><IoFlame size={13} /></span>
            <p className="dashboard-mini-value">{streak}</p>
            <p className="dashboard-mini-label streak-mini-label">Streak</p>
          </article>
          <article className="dashboard-mini-card">
            <span className="dashboard-mini-icon bg-green"><IoTrophy size={13} /></span>
            <p className="dashboard-mini-value">{progressData?.passedQuizzes ?? 0}</p>
            <p className="dashboard-mini-label">Kuis Lulus</p>
          </article>
          <article className="dashboard-mini-card">
            <span className="dashboard-mini-icon bg-blue"><IoDocumentText size={13} /></span>
            <p className="dashboard-mini-value">{progressData?.totalQuizzes ?? 0}</p>
            <p className="dashboard-mini-label">Total Kuis</p>
          </article>
        </section>
      ) : null}

      <div className="screen-content stack-lg">
        <section className="stack">
          <h3 className="section-title">{isSensei ? "Kategori Materi" : "Progress Kategori"}</h3>

          {activeCategories.length > 0 ? (
            <section className="category-grid">
              {activeCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.key}
                    href={{ pathname: "/kelas", query: { tab: "materi", filter: category.key } }}
                    className="category-tile"
                  >
                    <span className="category-icon-box" style={{ backgroundColor: category.bg, color: category.color }}>
                      <Icon size={20} />
                    </span>
                    <h4>{category.key}</h4>
                    <p className="muted">{categoryCounts[category.key]} materi</p>
                  </Link>
                );
              })}
            </section>
          ) : (
            <article className="card empty-card stack-sm">
              <span className="empty-icon"><IoBookOutline size={34} /></span>
              <p className="muted">
                {isSensei
                  ? "Belum ada materi. Mulai unggah di tab Upload."
                  : "Belum ada materi. Tunggu sensei mengunggah materi."}
              </p>
            </article>
          )}
        </section>

        {isSensei ? (
          <Link href="/upload" className="cta-tile">
            <span className="cta-icon-box"><IoCloudUploadOutline size={24} /></span>
            <div className="cta-content">
              <h3>Upload Materi Baru</h3>
              <p className="muted">PDF/PPT/Word/foto - AI buat soal draft untuk direview</p>
            </div>
            <IoChevronForward size={18} className="cta-chevron" />
          </Link>
        ) : materials.length > 0 ? (
          <Link href={{ pathname: "/kelas", query: { tab: "kuis" } }} className="cta-tile">
            <span className="cta-icon-box"><IoHelpCircleOutline size={24} /></span>
            <div className="cta-content">
              <h3>Mulai Kuis</h3>
              <p className="muted">{materials.length} kuis tersedia untukmu</p>
            </div>
            <IoChevronForward size={18} className="cta-chevron" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
