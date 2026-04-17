"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoCheckmarkCircle, IoChevronForward, IoCloseCircle, IoPerson, IoSearch } from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";
import { ALL_CATEGORIES, getCategoryMeta } from "@/lib/categories";

type KelasTab = "materi" | "kuis";

function getActiveTab(rawTab: string | null, isSensei: boolean): KelasTab {
  if (isSensei) return "materi";
  return rawTab === "kuis" ? "kuis" : "materi";
}

export default function KelasPage() {
  const params = useSearchParams();
  const {
    user,
    materials,
    quizHistory,
    createClassroom,
    joinClassroom,
    refreshMaterials,
    refreshProgress,
    refreshQuizHistory,
  } = useAppContext();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState<KelasTab>("materi");
  const [classNameInput, setClassNameInput] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [senseiStatus, setSenseiStatus] = useState("");
  const [senseiError, setSenseiError] = useState(false);
  const [senseiBusy, setSenseiBusy] = useState(false);
  const [joinStatus, setJoinStatus] = useState("");
  const [joinError, setJoinError] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);

  const isSensei = user?.role === "sensei";

  useEffect(() => {
    const incomingFilter = params.get("filter");
    setSelectedCategory(incomingFilter ?? "Semua");
    setActiveTab(getActiveTab(params.get("tab"), isSensei));
  }, [isSensei, params]);

  useEffect(() => {
    setClassNameInput(user?.className ?? "");
  }, [user?.className]);

  useEffect(() => {
    void Promise.all([refreshMaterials(), refreshProgress(), ...(isSensei ? [] : [refreshQuizHistory()])]);
  }, [isSensei, refreshMaterials, refreshProgress, refreshQuizHistory]);

  const handleJoinClass = async () => {
    if (!classCodeInput.trim()) {
      setJoinStatus("Masukkan kode kelas terlebih dahulu.");
      setJoinError(true);
      return;
    }

    setJoinBusy(true);
    setJoinStatus("");
    setJoinError(false);

    try {
      const code = await joinClassroom(classCodeInput.trim().toUpperCase());
      setClassCodeInput("");
      setJoinStatus(`Berhasil bergabung ke kelas ${code}.`);
      await Promise.all([refreshMaterials(), refreshProgress(), refreshQuizHistory()]);
    } catch (err) {
      setJoinStatus(err instanceof Error ? err.message : "Gagal join kelas");
      setJoinError(true);
    } finally {
      setJoinBusy(false);
    }
  };

  const handleGenerateClassCode = async () => {
    const normalizedClassName = classNameInput.trim();
    if (!normalizedClassName) {
      setSenseiStatus("Isi nama kelas terlebih dahulu.");
      setSenseiError(true);
      return;
    }

    setSenseiBusy(true);
    setSenseiStatus("");
    setSenseiError(false);

    try {
      const code = await createClassroom(normalizedClassName);
      setClassNameInput(normalizedClassName);
      setSenseiStatus(`Kode kelas ${code} siap digunakan untuk kelas ${normalizedClassName}.`);
      await Promise.all([refreshMaterials(), refreshProgress()]);
    } catch (err) {
      setSenseiStatus(err instanceof Error ? err.message : "Gagal membuat kode kelas");
      setSenseiError(true);
    } finally {
      setSenseiBusy(false);
    }
  };

  const handleCopyClassCode = async () => {
    const code = user?.classCode?.trim();
    if (!code) {
      setSenseiStatus("Buat kode kelas terlebih dahulu.");
      setSenseiError(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setSenseiStatus("Kode kelas berhasil disalin.");
      setSenseiError(false);
    } catch {
      setSenseiStatus("Gagal menyalin kode kelas. Silakan salin manual.");
      setSenseiError(true);
    }
  };

  const passedMaterials = useMemo(
    () => new Set(quizHistory.filter((history) => history.passed).map((history) => history.materialId)),
    [quizHistory],
  );

  const bestScoreMap = useMemo(() => {
    const scores = new Map<string, { score: number; total: number; passed: boolean }>();

    for (const item of quizHistory) {
      const current = scores.get(item.materialId);
      if (!current || item.score > current.score) {
        scores.set(item.materialId, {
          score: item.score,
          total: item.total,
          passed: item.passed,
        });
      }
    }

    return scores;
  }, [quizHistory]);

  const filteredMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();

    return materials.filter((item) => {
      const matchCategory = selectedCategory === "Semua" || item.category === selectedCategory;
      const matchSearch = !q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [materials, query, selectedCategory]);

  const showMateriTab = isSensei || activeTab === "materi";
  const showKuisTab = !isSensei && activeTab === "kuis";

  return (
    <section className="screen kelas-screen">
      <header className="screen-header materi-header">
        <h2 className="screen-title">Kelas</h2>
        <p className="screen-subtitle">
          {materials.length} materi {isSensei ? "tersedia" : "dan kuis siap dipelajari"}
        </p>

        <div className="header-search-box">
          <IoSearch size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari materi atau kategori..."
            className="header-search-input"
          />
          {query ? (
            <button className="search-clear-btn" type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <IoCloseCircle size={18} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="kelas-chip-wrap">
        {!isSensei ? (
          <div className="chip-list">
            <button
              type="button"
              className={activeTab === "materi" ? "chip active" : "chip"}
              onClick={() => setActiveTab("materi")}
            >
              Materi
            </button>
            <button
              type="button"
              className={activeTab === "kuis" ? "chip active" : "chip"}
              onClick={() => setActiveTab("kuis")}
            >
              Kuis
            </button>
          </div>
        ) : null}

        <div className="chip-list">
          {ALL_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? "chip active" : "chip"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-content stack">
        {isSensei ? (
          <article className="card stack-sm">
            <div className="row-between">
              <h3>Kode Kelas Sensei</h3>
              {user?.classCode ? <span className="pill info">{user.classCode}</span> : null}
            </div>

            <p className="muted">
              {user?.classCode
                ? "Bagikan kode ini ke gakousei agar mereka bisa bergabung ke kelasmu."
                : "Buat kode kelas untuk mulai mengundang gakousei."}
            </p>

            <div className="class-join-row">
              <input
                placeholder="Nama kelas (contoh: N5 Pagi)"
                value={classNameInput}
                onChange={(event) => setClassNameInput(event.target.value)}
              />
            </div>

            <div className="class-join-row">
              <button
                className="primary-btn inline-btn"
                type="button"
                onClick={handleGenerateClassCode}
                disabled={senseiBusy}
              >
                {senseiBusy ? "Memproses..." : user?.classCode ? "Simpan & Gunakan Kode Kelas" : "Generate Kode Kelas"}
              </button>
              <button
                className="ghost-btn inline-btn"
                type="button"
                onClick={handleCopyClassCode}
                disabled={!user?.classCode}
              >
                Salin Kode
              </button>
            </div>

            {senseiStatus ? (
              senseiError ? <p className="error-text error-box">{senseiStatus}</p> : <div className="status-box success"><p>{senseiStatus}</p></div>
            ) : null}

            {user?.className ? <p className="muted">Nama kelas aktif: {user.className}</p> : null}
          </article>
        ) : (
          <article className="card stack-sm">
            <div className="row-between">
              <h3>Kelas Saya</h3>
              {user?.classCode ? <span className="pill info">{user.classCode}</span> : null}
            </div>

            <p className="muted">
              {user?.classCode
                ? "Masukkan kode baru jika ingin pindah kelas."
                : "Masukkan kode kelas dari sensei untuk membuka materi yang sesuai."}
            </p>

            <div className="class-join-row">
              <input
                placeholder="Masukkan kode kelas"
                value={classCodeInput}
                onChange={(event) => setClassCodeInput(event.target.value)}
                autoCapitalize="characters"
              />
              <button className="primary-btn inline-btn" type="button" onClick={handleJoinClass} disabled={joinBusy}>
                {joinBusy ? "Memproses..." : "Gabung Kelas"}
              </button>
            </div>

            {joinStatus ? (
              joinError ? <p className="error-text error-box">{joinStatus}</p> : <div className="status-box success"><p>{joinStatus}</p></div>
            ) : null}
          </article>
        )}

        {showMateriTab
          ? filteredMaterials.map((item) => (
              <article key={item.id} className="material-list-card">
                <span
                  className="category-icon small"
                  style={{
                    backgroundColor: getCategoryMeta(item.category).soft,
                    color: getCategoryMeta(item.category).color,
                  }}
                >
                  {getCategoryMeta(item.category).icon}
                </span>

                <div className="material-content">
                  <div className="row-between">
                    <h3>{item.title}</h3>
                    {!isSensei && passedMaterials.has(item.id) ? (
                      <span className="pill success with-icon">
                        <IoCheckmarkCircle size={12} />
                        Lulus
                      </span>
                    ) : null}
                    {isSensei && item.createdById === user?.id ? (
                      <span className="pill info with-icon">
                        <IoPerson size={12} />
                        Milik Saya
                      </span>
                    ) : null}
                  </div>

                  {item.description ? <p className="muted material-description">{item.description}</p> : null}

                  <div className="material-meta-row">
                    <span
                      className="pill category"
                      style={{
                        backgroundColor: getCategoryMeta(item.category).soft,
                        color: getCategoryMeta(item.category).color,
                      }}
                    >
                      {item.category}
                    </span>
                    <p className="muted">{item.questionCount} soal</p>
                  </div>

                  {isSensei ? (
                    <Link className="primary-btn inline-btn" href={{ pathname: "/upload", query: { material: item.id } }}>
                      Atur Kuis
                    </Link>
                  ) : (
                    <Link className="primary-btn inline-btn" href={`/quiz?id=${item.id}`}>
                      Buka Kuis
                    </Link>
                  )}
                </div>
              </article>
            ))
          : null}

        {showKuisTab
          ? filteredMaterials.map((item) => (
              <Link key={item.id} href={`/quiz?id=${item.id}`} className="quiz-list-card">
                <span
                  className="category-icon small"
                  style={{
                    backgroundColor: getCategoryMeta(item.category).soft,
                    color: getCategoryMeta(item.category).color,
                  }}
                >
                  {getCategoryMeta(item.category).icon}
                </span>

                <div className="material-content">
                  <div className="row-between">
                    <h3>{item.title}</h3>
                    {bestScoreMap.get(item.id) ? (
                      <span className={bestScoreMap.get(item.id)?.passed ? "pill success with-icon" : "pill danger with-icon"}>
                        {bestScoreMap.get(item.id)?.passed ? <IoCheckmarkCircle size={12} /> : <IoCloseCircle size={12} />}
                        {bestScoreMap.get(item.id)?.score}/{bestScoreMap.get(item.id)?.total}
                      </span>
                    ) : null}
                  </div>

                  <div className="material-meta-row">
                    <span
                      className="pill category"
                      style={{
                        backgroundColor: getCategoryMeta(item.category).soft,
                        color: getCategoryMeta(item.category).color,
                      }}
                    >
                      {item.category}
                    </span>
                    <p className="muted">{item.questionCount} soal</p>
                  </div>

                  {bestScoreMap.get(item.id) && !bestScoreMap.get(item.id)?.passed ? (
                    <p className="muted">Coba lagi untuk lulus.</p>
                  ) : null}
                </div>

                <IoChevronForward size={18} className="quiz-card-chevron" />
              </Link>
            ))
          : null}

        {filteredMaterials.length === 0 ? (
          <article className="card empty-card stack-sm">
            <h4>
              {materials.length === 0
                ? "Belum ada materi"
                : showKuisTab
                  ? "Kuis tidak ditemukan"
                  : "Materi tidak ditemukan"}
            </h4>
            <p className="muted">
              {materials.length === 0
                ? "Tunggu sensei mengunggah materi kelas."
                : "Coba ubah kata kunci atau kategori pencarian."}
            </p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
