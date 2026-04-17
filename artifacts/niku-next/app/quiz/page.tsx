"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, QuizResult } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";

export default function QuizDetailPage() {
  const router = useRouter();
  const { user, refreshProgress, refreshQuizHistory } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [material, setMaterial] = useState<Awaited<ReturnType<typeof api.getMaterial>> | null>(null);

  const [phase, setPhase] = useState<"lesson" | "quiz" | "result">("lesson");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const materialId = new URLSearchParams(window.location.search).get("id");

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "dosen") {
      router.replace("/upload");
      return;
    }

    if (!materialId) {
      setError("ID materi tidak ditemukan");
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .getMaterial(user.id, materialId)
      .then((data) => setMaterial(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat materi"))
      .finally(() => setLoading(false));
  }, [router, user]);

  const question = useMemo(() => material?.questions?.[current] ?? null, [current, material?.questions]);

  const chooseAnswer = (index: number) => {
    const next = [...answers];
    next[current] = index;
    setAnswers(next);
  };

  const nextQuestion = () => {
    const total = material?.questions?.length ?? 0;
    if (current < total - 1) {
      setCurrent((prev) => prev + 1);
      return;
    }
    void submitQuiz();
  };

  const submitQuiz = async () => {
    if (!user || !material) return;
    setSubmitting(true);
    try {
      const payload = await api.submitQuiz(user.id, material.id, answers);
      setResult(payload);
      setPhase("result");
      await Promise.all([refreshProgress(), refreshQuizHistory()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal submit kuis");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="center-screen">Memuat materi...</div>;
  if (error) return <div className="center-screen error-text">{error}</div>;
  if (!material) return <div className="center-screen">Materi tidak ditemukan</div>;

  return (
    <main className="quiz-page">
      <div className="quiz-header">
        <button type="button" className="ghost-btn" onClick={() => router.back()}>
          Kembali
        </button>
        <h2>{material.title}</h2>
      </div>

      {phase === "lesson" ? (
        <section className="stack-lg">
          <article className="card">
            <p className="badge">{material.category}</p>
            <h3>Baca Materi</h3>
            <p className="prewrap">{material.lessonContent}</p>
          </article>
          <button type="button" className="primary-btn" onClick={() => setPhase("quiz")}>
            Mulai Kuis ({material.questions?.length ?? 0} Soal)
          </button>
        </section>
      ) : null}

      {phase === "quiz" && question ? (
        <section className="stack-lg">
          <article className="card">
            <p className="muted">
              Soal {current + 1}/{material.questions?.length ?? 0}
            </p>
            <h3>{question.question}</h3>
          </article>

          <section className="stack">
            {question.options.map((option, index) => {
              const selected = answers[current] === index;
              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  className={selected ? "option-btn selected" : "option-btn"}
                  onClick={() => chooseAnswer(index)}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              );
            })}
          </section>

          <button
            type="button"
            className="primary-btn"
            onClick={nextQuestion}
            disabled={answers[current] == null || submitting}
          >
            {submitting ? "Memproses..." : current + 1 < (material.questions?.length ?? 0) ? "Soal Berikutnya" : "Lihat Hasil"}
          </button>
        </section>
      ) : null}

      {phase === "result" && result ? (
        <section className="stack-lg">
          <article className="card">
            <h3>{result.passed ? "Selamat, Lulus!" : "Belum Lulus"}</h3>
            <p className="big-number">
              {result.score}/{result.total}
            </p>
            <p className="muted">XP didapat: {result.xpEarned}</p>
          </article>
          <button type="button" className="primary-btn" onClick={() => router.replace("/kuis")}>
            Kembali ke Daftar Kuis
          </button>
        </section>
      ) : null}
    </main>
  );
}
