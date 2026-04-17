"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiMaterial, EditableQuizQuestionInput } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";

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
  const { user, materials, refreshMaterials } = useAppContext();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [editorMaterial, setEditorMaterial] = useState<ApiMaterial | null>(null);
  const [editorQuestions, setEditorQuestions] = useState<EditableQuestion[]>([]);
  const [editorBusy, setEditorBusy] = useState(false);

  useEffect(() => {
    void refreshMaterials();
  }, [refreshMaterials]);

  const myMaterials = useMemo(() => materials.filter((item) => item.createdById === user?.id), [materials, user?.id]);

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

    setBusy(true);
    setStatus("Mengunggah dan memproses AI...");
    try {
      const result = await api.uploadMaterial(user.id, file);
      setStatus(`Draft dibuat: ${result.title}. Review dulu sebelum publish.`);
      setFile(null);
      await refreshMaterials();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal upload materi");
    } finally {
      setBusy(false);
    }
  };

  const openEditor = async (materialId: string) => {
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

  return (
    <section className="stack-lg">
      <article className="card stack">
        <h2>Upload Materi</h2>
        <p className="muted">Format: PDF, PPT/PPTX, DOC/DOCX, dan gambar.</p>

        <input
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <button className="primary-btn" type="button" onClick={handleUpload} disabled={busy || !file}>
          {busy ? "Memproses..." : "Upload + Generate AI"}
        </button>

        {status ? <p className="muted">{status}</p> : null}
      </article>

      <section className="stack">
        <h3>Materi Saya ({myMaterials.length})</h3>
        {myMaterials.map((material) => (
          <article key={material.id} className="card stack-sm">
            <div className="row-between">
              <div>
                <h4>{material.title}</h4>
                <p className="muted">
                  {material.category} - {material.questionCount} soal - {material.isPublished ? "Published" : "Draft"}
                </p>
              </div>
              <span className={material.isPublished ? "pill published" : "pill draft"}>
                {material.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <div className="actions-row">
              <button className="ghost-btn" type="button" onClick={() => openEditor(material.id)}>
                Atur Kuis
              </button>
              <button className="primary-btn inline-btn" type="button" onClick={() => togglePublish(material)}>
                {material.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button className="danger-btn inline-btn" type="button" onClick={() => removeMaterial(material.id)}>
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
              Regenerate AI
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
                  <button
                    type="button"
                    className="danger-btn inline-btn"
                    onClick={() => setEditorQuestions((prev) => prev.filter((_, index) => index !== qIndex))}
                    disabled={editorQuestions.length <= 1}
                  >
                    Hapus Soal
                  </button>
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
                      <button
                        type="button"
                        className={question.correctAnswer === optionIndex ? "ghost-btn selected-correct" : "ghost-btn"}
                        onClick={() => {
                          const next = [...editorQuestions];
                          next[qIndex] = { ...next[qIndex], correctAnswer: optionIndex };
                          setEditorQuestions(next);
                        }}
                      >
                        Benar
                      </button>
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
              + Tambah Soal
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
