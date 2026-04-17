"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IoCreateOutline,
  IoDocumentText,
  IoFlash,
  IoFlame,
  IoLogOutOutline,
  IoPeopleOutline,
  IoSchoolOutline,
  IoTrophy,
} from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";
import { getCategoryMeta } from "@/lib/categories";

export default function ProgressPage() {
  const {
    user,
    materials,
    progressData,
    logout,
    updateProfile,
    refreshProgress,
    refreshMaterials,
    getLevelInfo,
    createClassroom,
  } = useAppContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const isDosen = user?.role === "dosen";
  const levelInfo = getLevelInfo();
  const xp = progressData?.user.xp ?? user?.xp ?? 0;
  const streak = progressData?.user.streak ?? user?.streak ?? 0;

  const xpInCurrentLevel = xp - levelInfo.xpStart;
  const xpNeeded = Math.max(1, levelInfo.xpEnd - levelInfo.xpStart);
  const xpPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  const initials = (user?.name || "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const myMaterials = useMemo(
    () => materials.filter((material) => material.createdById === user?.id),
    [materials, user?.id],
  );
  const totalSoal = myMaterials.reduce((sum, material) => sum + material.questionCount, 0);

  const dosenCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const material of myMaterials) {
      counts[material.category] = (counts[material.category] || 0) + 1;
    }
    return counts;
  }, [myMaterials]);

  const mahasiswaCategoryProgress = progressData?.categoryProgress ?? [];

  useEffect(() => {
    setName(user?.name ?? "");
    void Promise.all([refreshProgress(), refreshMaterials()]);
  }, [refreshMaterials, refreshProgress, user?.name]);

  const openEditModal = () => {
    setName(user?.name ?? "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowEditModal(true);
    setStatus("");
  };

  const saveProfile = async () => {
    const nameChanged = name.trim() && name.trim() !== user?.name;
    const passwordChanging = newPassword.trim().length > 0;

    if (!nameChanged && !passwordChanging) {
      setStatus("Tidak ada perubahan pada profil.");
      return;
    }

    if (passwordChanging) {
      if (!currentPassword) {
        setStatus("Password lama wajib diisi.");
        return;
      }
      if (newPassword.trim().length < 6) {
        setStatus("Password baru minimal 6 karakter.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatus("Konfirmasi password tidak cocok.");
        return;
      }
    }

    setBusy(true);
    setStatus("");
    try {
      await updateProfile({
        ...(nameChanged ? { name: name.trim() } : {}),
        ...(passwordChanging ? { currentPassword, newPassword } : {}),
      });
      setStatus("Profil berhasil diperbarui.");
      setShowEditModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refreshProgress();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal update profil");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateClass = async () => {
    setBusy(true);
    setStatus("");
    try {
      const code = await createClassroom();
      setStatus(`Kode kelas aktif: ${code}`);
      await Promise.all([refreshProgress(), refreshMaterials()]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal membuat kelas");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="screen progress-screen">
      <header className="screen-header progress-header stack">
        <div className="row-between">
          <div className="profile-headline">
            <div className="avatar-large">{initials}</div>
            <div>
              <h2>{user?.name}</h2>
              <p className="muted">{isDosen ? "Dosen" : `Mahasiswa · Lv.${levelInfo.level} ${levelInfo.title}`}</p>
            </div>
          </div>

          <div className="actions-row">
            <button className="progress-icon-btn" type="button" onClick={openEditModal} aria-label="Edit profil">
              <IoCreateOutline size={18} />
            </button>
            <button className="progress-icon-btn" type="button" onClick={logout} aria-label="Logout">
              <IoLogOutOutline size={18} />
            </button>
          </div>
        </div>

        {!isDosen ? (
          <div className="stack-sm">
            <div className="row-between">
              <p className="hero-kicker">Progress ke Lv.{levelInfo.level + 1}</p>
              <p className="hero-kicker">{xp} XP · {xpPct}%</p>
            </div>
            <div className="xp-track bright">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      <div className="screen-content stack-lg">
      <article className="card stack progress-class-card">
        <div className="row-between">
          <h3>{isDosen ? "Kelas Aktif" : "Kelas Saya"}</h3>
          <div className="actions-row">
            {isDosen ? <IoSchoolOutline size={18} className="class-card-icon" /> : <IoPeopleOutline size={18} className="class-card-icon" />}
            {user?.classCode ? <span className="pill info">{user.classCode}</span> : null}
          </div>
        </div>

        {isDosen ? (
          <p className="muted">
            {user.classCode
              ? "Bagikan kode kelas ini ke mahasiswa agar materi tidak tercampur."
              : "Buat kode kelas sebelum upload materi agar konten tersegmentasi dengan benar."}
          </p>
        ) : (
          <p className="muted">
            {user?.classCode
              ? "Materi yang tampil hanya dari kelas ini."
              : "Masukkan kode kelas dari dosen untuk membuka materi yang sesuai."}
          </p>
        )}

        {isDosen ? (
          <button className="primary-btn" type="button" onClick={handleCreateClass} disabled={busy}>
            {user.classCode ? "Regenerate / Lihat Ulang Kode" : "Buat Kode Kelas"}
          </button>
        ) : (
          <Link className="primary-btn inline-btn" href="/kelas">
            Gabung Kelas di Menu Kelas
          </Link>
        )}
      </article>

      <section className="grid compact-grid">
        {isDosen ? (
          <>
            <article className="card stat-card">
              <span className="stat-icon red"><IoDocumentText size={16} /></span>
              <p className="hero-kicker">Materi Saya</p>
              <p className="big-number">{myMaterials.length}</p>
            </article>
            <article className="card stat-card">
              <span className="stat-icon blue"><IoCreateOutline size={16} /></span>
              <p className="hero-kicker">Soal Dibuat</p>
              <p className="big-number">{totalSoal}</p>
            </article>
            <article className="card stat-card">
              <span className="stat-icon green"><IoSchoolOutline size={16} /></span>
              <p className="hero-kicker">Total Materi</p>
              <p className="big-number">{materials.length}</p>
            </article>
          </>
        ) : (
          <>
            <article className="card stat-card">
              <span className="stat-icon red"><IoFlash size={16} /></span>
              <p className="hero-kicker">Total XP</p>
              <p className="big-number">{xp}</p>
            </article>
            <article className="card stat-card">
              <span className="stat-icon orange"><IoFlame size={16} /></span>
              <p className="hero-kicker">Streak</p>
              <p className="big-number">{streak}</p>
            </article>
            <article className="card stat-card">
              <span className="stat-icon green"><IoTrophy size={16} /></span>
              <p className="hero-kicker">Kuis Lulus</p>
              <p className="big-number">{progressData?.passedQuizzes ?? 0}</p>
            </article>
            <article className="card stat-card">
              <span className="stat-icon blue"><IoDocumentText size={16} /></span>
              <p className="hero-kicker">Total Kuis</p>
              <p className="big-number">{progressData?.totalQuizzes ?? 0}</p>
            </article>
          </>
        )}
      </section>

      <section className="stack">
        <h3>{isDosen ? "Materi per Kategori" : "Progress Kategori"}</h3>

        {isDosen ? (
          Object.keys(dosenCategoryCounts).length > 0 ? (
            Object.entries(dosenCategoryCounts).map(([category, count]) => {
              const pct = myMaterials.length > 0 ? Math.round((count / myMaterials.length) * 100) : 0;
              const meta = getCategoryMeta(category);

              return (
                <article key={category} className="card stack-sm">
                  <div className="row-between">
                    <div className="category-title-row">
                      <span className="category-dot" style={{ backgroundColor: meta.color }} />
                      <p>{category}</p>
                    </div>
                    <p className="muted">{count} materi · {pct}%</p>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                  </div>
                </article>
              );
            })
          ) : (
            <article className="card empty-card">
              <p className="muted">Belum ada materi yang diunggah.</p>
            </article>
          )
        ) : mahasiswaCategoryProgress.length > 0 ? (
          mahasiswaCategoryProgress.map((item) => {
            const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
            const meta = getCategoryMeta(item.category);

            return (
              <article key={item.category} className="card stack-sm">
                <div className="row-between">
                  <div className="category-title-row">
                    <span className="category-dot" style={{ backgroundColor: meta.color }} />
                    <p>{item.category}</p>
                  </div>
                  <p className="muted">{item.completed}/{item.total} · {pct}%</p>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                </div>
              </article>
            );
          })
        ) : (
          <article className="card empty-card">
            <p className="muted">Belum ada data progress.</p>
          </article>
        )}
      </section>

      {status ? <p className="muted">{status}</p> : null}

      {showEditModal ? (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)} role="presentation">
          <article className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Edit Profil</h3>

            <label>
              Nama
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <p className="muted">Kosongkan password jika tidak ingin mengganti.</p>

            <label>
              Password Lama
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label>
              Password Baru
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label>
              Konfirmasi Password Baru
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            <div className="actions-row">
              <button className="ghost-btn" type="button" onClick={() => setShowEditModal(false)}>
                Batal
              </button>
              <button className="primary-btn" type="button" onClick={saveProfile} disabled={busy}>
                Simpan Profil
              </button>
            </div>
          </article>
        </div>
      ) : null}
      </div>
    </section>
  );
}
