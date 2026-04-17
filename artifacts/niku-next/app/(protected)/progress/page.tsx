"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function ProgressPage() {
  const {
    user,
    progressData,
    updateProfile,
    refreshProgress,
    refreshMaterials,
    createClassroom,
    joinClassroom,
  } = useAppContext();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    void Promise.all([refreshProgress(), refreshMaterials()]);
  }, [refreshMaterials, refreshProgress, user?.name]);

  const saveProfile = async () => {
    setBusy(true);
    setStatus("");
    try {
      await updateProfile({
        ...(name.trim() && name.trim() !== user?.name ? { name: name.trim() } : {}),
        ...(newPassword.trim() ? { currentPassword, newPassword } : {}),
      });
      setStatus("Profil berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
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

  const handleJoinClass = async () => {
    if (!classCodeInput.trim()) {
      setStatus("Masukkan kode kelas terlebih dahulu.");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const code = await joinClassroom(classCodeInput.trim().toUpperCase());
      setClassCodeInput("");
      setStatus(`Berhasil bergabung ke kelas ${code}.`);
      await Promise.all([refreshProgress(), refreshMaterials()]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal join kelas");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="stack-lg">
      <article className="card stack">
        <h2>Profil</h2>
        <p className="muted">XP: {progressData?.user.xp ?? user?.xp ?? 0} | Streak: {progressData?.user.streak ?? user?.streak ?? 0}</p>

        <label>
          Nama
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Password Lama
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        </label>

        <label>
          Password Baru
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        </label>

        <button className="primary-btn" type="button" onClick={saveProfile} disabled={busy}>
          Simpan Profil
        </button>
      </article>

      <article className="card stack">
        <h3>Kelas</h3>
        <p className="muted">Role: {user?.role === "dosen" ? "Dosen" : "Mahasiswa"}</p>
        <p className="muted">Class Code saat ini: {user?.classCode || "Belum ada"}</p>

        {user?.role === "dosen" ? (
          <button className="primary-btn" type="button" onClick={handleCreateClass} disabled={busy}>
            {user.classCode ? "Regenerate / Lihat Ulang Kode" : "Buat Kode Kelas"}
          </button>
        ) : (
          <div className="stack-sm">
            <input
              placeholder="Masukkan kode kelas"
              value={classCodeInput}
              onChange={(event) => setClassCodeInput(event.target.value)}
            />
            <button className="primary-btn" type="button" onClick={handleJoinClass} disabled={busy}>
              Gabung Kelas
            </button>
          </div>
        )}
      </article>

      <article className="card stack-sm">
        <h3>Ringkasan Progress</h3>
        <p className="muted">Total kuis: {progressData?.totalQuizzes ?? 0}</p>
        <p className="muted">Lulus: {progressData?.passedQuizzes ?? 0}</p>
        <p className="muted">Materi lulus unik: {progressData?.uniqueMaterialsPassed ?? 0}</p>
      </article>

      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
