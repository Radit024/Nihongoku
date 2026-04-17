"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  IoCreateOutline,
  IoDocumentText,
  IoFlash,
  IoFlame,
  IoLogOutOutline,
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
  } = useAppContext();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const isSensei = user?.role === "sensei";
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

  const senseiCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const material of myMaterials) {
      counts[material.category] = (counts[material.category] || 0) + 1;
    }
    return counts;
  }, [myMaterials]);

  const gakouseiCategoryProgress = progressData?.categoryProgress ?? [];

  useEffect(() => {
    setName(user?.name ?? "");
    setAvatarPreview(user?.avatarUrl ?? null);
    setAvatarChanged(false);
    void Promise.all([refreshProgress(), refreshMaterials()]);
  }, [refreshMaterials, refreshProgress, user?.avatarUrl, user?.name]);

  const openEditModal = () => {
    setName(user?.name ?? "");
    setAvatarPreview(user?.avatarUrl ?? null);
    setAvatarChanged(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowEditModal(true);
    setStatus("");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("File foto profil harus berupa gambar.");
      return;
    }

    if (file.size > 1_500_000) {
      setStatus("Ukuran foto profil maksimal 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
        setAvatarChanged(true);
      }
    };
    reader.onerror = () => {
      setStatus("Gagal membaca file foto profil.");
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const clearAvatar = () => {
    setAvatarPreview(null);
    setAvatarChanged(true);
    setStatus("");
  };

  const saveProfile = async () => {
    const nameChanged = name.trim() && name.trim() !== user?.name;
    const passwordChanging = newPassword.trim().length > 0;
    const hasAvatarChanged = avatarChanged;

    if (!nameChanged && !passwordChanging && !hasAvatarChanged) {
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
        ...(hasAvatarChanged ? { avatarUrl: avatarPreview } : {}),
      });
      setStatus("Profil berhasil diperbarui.");
      setShowEditModal(false);
      setAvatarChanged(false);
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

  return (
    <section className="screen progress-screen">
      <header className="screen-header progress-header stack">
        <div className="row-between">
          <div className="profile-headline">
            <div className="avatar-large">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={`Foto profil ${user?.name ?? "pengguna"}`} className="avatar-image" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2>{user?.name}</h2>
              <p className="muted">{isSensei ? "Sensei" : `Gakousei · Lv.${levelInfo.level} ${levelInfo.title}`}</p>
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

        {!isSensei ? (
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
      <section className="grid compact-grid">
        {isSensei ? (
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
            <article className="card stat-card streak-card">
              <span className="stat-icon orange streak-icon"><IoFlame size={16} /></span>
              <p className="hero-kicker">Streak</p>
              <p className="big-number">{streak}</p>
              <p className="streak-caption">{streak > 0 ? "Hari beruntun" : "Mulai hari ini"}</p>
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
        <h3>{isSensei ? "Materi per Kategori" : "Progress Kategori"}</h3>

        {isSensei ? (
          Object.keys(senseiCategoryCounts).length > 0 ? (
            Object.entries(senseiCategoryCounts).map(([category, count]) => {
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
        ) : gakouseiCategoryProgress.length > 0 ? (
          gakouseiCategoryProgress.map((item) => {
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
          <article className="modal-card profile-editor-card" onClick={(event) => event.stopPropagation()}>
            <header className="profile-editor-head">
              <p className="eyebrow">Profil</p>
              <h3>Edit Profil</h3>
              <p className="muted">Atur nama, foto profil, dan password akunmu.</p>
            </header>

            <section className="profile-photo-editor">
              <div className="profile-photo-preview" aria-hidden="true">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview foto profil" className="avatar-image" />
                ) : (
                  initials
                )}
              </div>

              <div className="profile-photo-actions">
                <label className="ghost-btn inline-btn profile-photo-upload-btn">
                  Pilih Foto
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
                <button type="button" className="text-btn inline-btn" onClick={clearAvatar}>
                  Hapus Foto
                </button>
              </div>
            </section>

            <label className="profile-input-group">
              Nama
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            <p className="muted">Kosongkan password jika tidak ingin mengganti.</p>

            <label className="profile-input-group">
              Password Lama
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>

            <label className="profile-input-group">
              Password Baru
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>

            <label className="profile-input-group">
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
