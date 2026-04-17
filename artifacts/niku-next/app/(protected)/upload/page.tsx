"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IoAddCircleOutline,
  IoArrowDown,
  IoArrowUp,
  IoCameraOutline,
  IoCheckmarkCircle,
  IoCloudUploadOutline,
  IoCreateOutline,
  IoDocumentTextOutline,
  IoEyeOffOutline,
  IoSendOutline,
  IoSparklesOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { api, ApiMaterial, EditableQuizQuestionInput } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";
import { getCategoryMeta } from "@/lib/categories";

type EditableQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

function normalizeQuestion(raw: EditableQuestion): EditableQuestion {
  const options = [...raw.options.slice(0, 4)];
  while (options.length < 4) options.push("");
  return { ...raw, options };
}

function createBlankQuestion(): EditableQuestion {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  };
}

export default function UploadPage() {
  const params = useSearchParams();
  const { user, materials, refreshMaterials } = useAppContext();

  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const [editorMaterial, setEditorMaterial] = useState<ApiMaterial | null>(null);
  const [editorQuestions, setEditorQuestions] = useState<EditableQuestion[]>([]);
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorPublishing, setEditorPublishing] = useState(false);

  useEffect(() => {
    void refreshMaterials();
  }, [refreshMaterials]);

  const myMaterials = useMemo(
    () => materials.filter((item) => item.createdById === user?.id),
    [materials, user?.id],
  );

  const openEditor = useCallback(async (materialId: string) => {
    if (!user) return;
    setEditorBusy(true);
    try {
      const material = await api.getMaterial(user.id, materialId);
      const mapped = (material.questions || []).map((question) => ({
        id: question.id,
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      }));

      setEditorMaterial(material);
      setEditorQuestions(mapped.length > 0 ? mapped.map(normalizeQuestion) : [createBlankQuestion()]);
    } finally {
      setEditorBusy(false);
    }
  }, [user]);

  useEffect(() => {
    const materialId = params.get("material");
    if (!materialId || user?.role !== "dosen") {
      return;
    }
    if (editorMaterial?.id === materialId) {
      return;
    }
    void openEditor(materialId);
  }, [editorMaterial?.id, openEditor, params, user?.role]);

  if (user?.role !== "dosen") {
    return (
      <article className="card">
        <h2>Halaman ini khusus dosen</h2>
        <p className="muted">Mahasiswa tidak memiliki akses upload materi.</p>
      </article>
    );
  }

  const handleUpload = async () => {
    if (!user) return;
    if (!user.classCode) {
      setStatus("Buat kode kelas dulu di profil sebelum upload.");
      return;
    }
    if (!file) {
      setStatus("Pilih file terlebih dahulu.");
      return;
    }

    setUploadSuccess(false);
    setBusy(true);
    setStatus("Mengunggah dan memproses AI...");
    try {
      const result = await api.uploadMaterial(user.id, file);
      setStatus(`Draft dibuat: ${result.title}. Review dulu sebelum publish.`);
      setUploadSuccess(true);
      setFile(null);
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      await refreshMaterials();
    } catch (err) {
      setUploadSuccess(false);
      setStatus(err instanceof Error ? err.message : "Gagal upload materi");
    } finally {
      setBusy(false);
    }
  };

  const closeEditor = () => {
    setEditorMaterial(null);
    setEditorQuestions([]);
  };

  const saveEditor = async () => {
    if (!user || !editorMaterial) return;

    const payload: EditableQuizQuestionInput[] = [];
    for (let i = 0; i < editorQuestions.length; i++) {
      const q = normalizeQuestion(editorQuestions[i]);
      if (!q.question.trim()) {
        setStatus(`Pertanyaan #${i + 1} masih kosong.`);
        return;
      }
      if (q.options.some((option) => !option.trim())) {
        setStatus(`Semua opsi di pertanyaan #${i + 1} wajib diisi.`);
        return;
      }
      payload.push({
        question: q.question.trim(),
        options: q.options.map((option) => option.trim()),
        correctAnswer: Math.max(0, Math.min(3, q.correctAnswer)),
        explanation: q.explanation.trim(),
      });
    }

    setEditorBusy(true);
    try {
      await api.updateMaterialQuestions(user.id, editorMaterial.id, payload);
      setStatus("Kuis tersimpan sebagai draft.");
      await Promise.all([openEditor(editorMaterial.id), refreshMaterials()]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan kuis");
    } finally {
      setEditorBusy(false);
    }
  };

  const regenerateQuiz = async () => {
    if (!user || !editorMaterial) return;

    if (!window.confirm("Regenerasi akan mengganti semua soal saat ini. Lanjut?")) {
      return;
    }

    setEditorBusy(true);
    try {
      await api.regenerateMaterialQuiz(user.id, editorMaterial.id);
      setStatus("Soal baru dari AI berhasil dibuat. Review sebelum publish.");
      await Promise.all([openEditor(editorMaterial.id), refreshMaterials()]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal regenerasi kuis");
    } finally {
      setEditorBusy(false);
    }
  };

  const togglePublish = async (material: ApiMaterial) => {
    if (!user) return;
    setBusy(true);
    try {
      const published = !(material.isPublished ?? false);
      await api.setMaterialPublishState(user.id, material.id, published);
      setStatus(published ? "Materi dipublish untuk mahasiswa." : "Materi dikembalikan ke draft.");
      await refreshMaterials();
      if (editorMaterial?.id === material.id) {
        await openEditor(material.id);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal ubah status publish");
    } finally {
      setBusy(false);
    }
  };

  const toggleEditorPublish = async () => {
    if (!user || !editorMaterial) return;

    setEditorPublishing(true);
    try {
      const published = !(editorMaterial.isPublished ?? false);
      await api.setMaterialPublishState(user.id, editorMaterial.id, published);
      setStatus(published ? "Materi dipublish untuk mahasiswa." : "Materi dikembalikan ke draft.");
      await refreshMaterials();
      await openEditor(editorMaterial.id);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal ubah status publish");
    } finally {
      setEditorPublishing(false);
    }
  };

  const removeMaterial = async (materialId: string) => {
    if (!user) return;
    setBusy(true);
    try {
      await api.deleteMaterial(user.id, materialId);
      if (editorMaterial?.id === materialId) {
        closeEditor();
      }
      await refreshMaterials();
      setStatus("Materi dihapus.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal hapus materi");
    } finally {
      setBusy(false);
    }
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setEditorQuestions((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.splice(target, 0, picked);
      return next;
    });
  };

  const handleFilePicked = (picked: File | null) => {
    setFile(picked);
    setUploadSuccess(false);
    if (picked) {
      setStatus("");
    }
  };

  return (
    <section className="screen upload-screen">
      <header className="screen-header upload-header">
        <h2 className="screen-title">Upload Materi</h2>
        <p className="screen-subtitle">Unggah PDF, PPT, Word, atau foto. Edit soal lalu publish ke mahasiswa.</p>
      </header>

      <div className="screen-content stack-lg">
      <article className="card stack">
        <h3>Pilih File</h3>

        <input
          ref={documentInputRef}
          hidden
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={(event) => handleFilePicked(event.target.files?.[0] ?? null)}
        />
        <input
          ref={imageInputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(event) => handleFilePicked(event.target.files?.[0] ?? null)}
        />

        <div className="upload-pickers">
          <button className="picker-card" type="button" onClick={() => documentInputRef.current?.click()} disabled={busy}>
            <span className="picker-icon"><IoDocumentTextOutline size={24} /></span>
            <p className="picker-title">Upload Dokumen</p>
            <p className="muted">PDF, PPT, DOC</p>
          </button>
          <button className="picker-card" type="button" onClick={() => imageInputRef.current?.click()} disabled={busy}>
            <span className="picker-icon"><IoCameraOutline size={24} /></span>
            <p className="picker-title">Upload Foto</p>
            <p className="muted">Papan tulis / buku</p>
          </button>
        </div>

        {file ? (
          <div className="pill-row">
            <span className="pill info">{file.name}</span>
            <span className="pill">{Math.max(1, Math.round(file.size / 1024))} KB</span>
          </div>
        ) : null}

        <button className="primary-btn" type="button" onClick={handleUpload} disabled={busy || !file}>
          {busy ? "Memproses..." : "Upload + Generate AI"}
        </button>

        {status ? (
          <div className={uploadSuccess ? "status-box success" : "status-box processing"}>
            {uploadSuccess ? <IoCheckmarkCircle size={18} /> : <IoCloudUploadOutline size={18} />}
            <p>{status}</p>
          </div>
        ) : null}
      </article>

      <section className="stack">
        <h3>Materi Saya ({myMaterials.length})</h3>
        {myMaterials.map((material) => (
          <article key={material.id} className="card stack-sm material-own-card">
            <div className="row-between">
              <div>
                <h4>{material.title}</h4>
                <div className="material-meta-row">
                  <span
                    className="pill category"
                    style={{
                      backgroundColor: getCategoryMeta(material.category).soft,
                      color: getCategoryMeta(material.category).color,
                    }}
                  >
                    {material.category}
                  </span>
                  <p className="muted">{material.questionCount} soal</p>
                  {material.sourceFileName ? <p className="muted">{material.sourceFileName}</p> : null}
                </div>
              </div>
              <span className={material.isPublished ? "pill published" : "pill draft"}>
                {material.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <div className="actions-row">
              <button className="ghost-btn" type="button" onClick={() => openEditor(material.id)}>
                <IoCreateOutline size={14} />
                Atur Kuis
              </button>
              <button className="primary-btn inline-btn" type="button" onClick={() => togglePublish(material)}>
                {material.isPublished ? <IoEyeOffOutline size={14} /> : <IoSendOutline size={14} />}
                {material.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button className="danger-btn inline-btn" type="button" onClick={() => removeMaterial(material.id)}>
                <IoTrashOutline size={14} />
                Hapus
              </button>
            </div>
          </article>
        ))}
      </section>

      {editorMaterial ? (
        <section className="card stack-lg">
          <div className="row-between">
            <div>
              <h3>Editor Kuis: {editorMaterial.title}</h3>
              <p className="muted">Simpan perubahan akan mengembalikan status ke draft.</p>
            </div>
            <button type="button" className="ghost-btn" onClick={closeEditor}>
              Tutup
            </button>
          </div>

          <div className="actions-row">
            <button type="button" className="ghost-btn" onClick={regenerateQuiz} disabled={editorBusy}>
              <IoSparklesOutline size={14} />
              Regenerate AI
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={toggleEditorPublish}
              disabled={editorPublishing || editorBusy}
            >
              {editorMaterial.isPublished ? <IoEyeOffOutline size={14} /> : <IoSendOutline size={14} />}
              {editorMaterial.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button type="button" className="primary-btn inline-btn" onClick={saveEditor} disabled={editorBusy}>
              Simpan Soal
            </button>
          </div>

          <div className="stack">
            {editorQuestions.map((question, qIndex) => (
              <article key={question.id} className="card stack-sm nested-card">
                <div className="row-between">
                  <h4>Soal #{qIndex + 1}</h4>
                  <div className="actions-row">
                    <button type="button" className="ghost-btn inline-btn" onClick={() => moveQuestion(qIndex, -1)}>
                      <IoArrowUp size={14} />
                      Naik
                    </button>
                    <button type="button" className="ghost-btn inline-btn" onClick={() => moveQuestion(qIndex, 1)}>
                      <IoArrowDown size={14} />
                      Turun
                    </button>
                    <button
                      type="button"
                      className="danger-btn inline-btn"
                      onClick={() => setEditorQuestions((prev) => prev.filter((_, index) => index !== qIndex))}
                      disabled={editorQuestions.length <= 1}
                    >
                      <IoTrashOutline size={14} />
                      Hapus
                    </button>
                  </div>
                </div>

                <label>
                  Pertanyaan
                  <textarea
                    value={question.question}
                    onChange={(event) => {
                      const next = [...editorQuestions];
                      next[qIndex] = { ...next[qIndex], question: event.target.value };
                      setEditorQuestions(next);
                    }}
                  />
                </label>

                {normalizeQuestion(question).options.map((option, optionIndex) => (
                  <label key={`${question.id}-opt-${optionIndex}`}>
                    Opsi {String.fromCharCode(65 + optionIndex)}
                    <div className="option-editor-row">
                      <button
                        type="button"
                        className={question.correctAnswer === optionIndex ? "option-marker active" : "option-marker"}
                        onClick={() => {
                          const next = [...editorQuestions];
                          next[qIndex] = { ...next[qIndex], correctAnswer: optionIndex };
                          setEditorQuestions(next);
                        }}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </button>
                      <input
                        value={option}
                        onChange={(event) => {
                          const next = [...editorQuestions];
                          const opts = normalizeQuestion(next[qIndex]).options;
                          opts[optionIndex] = event.target.value;
                          next[qIndex] = { ...next[qIndex], options: opts };
                          setEditorQuestions(next);
                        }}
                      />
                    </div>
                  </label>
                ))}

                <label>
                  Penjelasan
                  <textarea
                    value={question.explanation}
                    onChange={(event) => {
                      const next = [...editorQuestions];
                      next[qIndex] = { ...next[qIndex], explanation: event.target.value };
                      setEditorQuestions(next);
                    }}
                  />
                </label>
              </article>
            ))}

            <button
              type="button"
              className="ghost-btn"
              onClick={() => setEditorQuestions((prev) => [...prev, createBlankQuestion()])}
            >
              <IoAddCircleOutline size={14} />
              + Tambah Soal
            </button>
          </div>
        </section>
      ) : null}
      </div>
    </section>
  );
}
