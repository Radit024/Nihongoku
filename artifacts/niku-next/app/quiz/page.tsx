"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPlayCircle,
  IoRefreshCircle,
  IoTrophy,
} from "react-icons/io5";
import { api, QuizResult } from "@/lib/api";
import { useAppContext } from "@/context/AppContext";
import { getCategoryMeta } from "@/lib/categories";

export default function QuizDetailPage() {
  const router = useRouter();
  const { user, refreshProgress, refreshQuizHistory } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [material, setMaterial] = useState<Awaited<ReturnType<typeof api.getMaterial>> | null>(null);

  const [phase, setPhase] = useState<"lesson" | "quiz" | "result">("lesson");
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
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
  const progressPct = material?.questions?.length
    ? Math.round(((current + 1) / material.questions.length) * 100)
    : 0;

  const chooseAnswer = (index: number) => {
    if (showFeedback) return;

    setSelectedAnswer(index);
    setShowFeedback(true);

    const next = [...answers];
    next[current] = index;
    setAnswers(next);
  };

  const nextQuestion = () => {
    const total = material?.questions?.length ?? 0;
    if (current < total - 1) {
      setCurrent((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
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
          <IoArrowBack size={18} />
          Kembali
        </button>
        <h2>
          {phase === "lesson"
            ? "Baca Materi"
            : phase === "quiz"
              ? `Soal ${current + 1}/${material.questions?.length ?? 0}`
              : "Hasil Kuis"}
        </h2>
      </div>

      {phase === "lesson" ? (
        <section className="stack-lg">
          <article className="card">
            <p
              className="badge"
              style={{
                backgroundColor: getCategoryMeta(material.category).soft,
                color: getCategoryMeta(material.category).color,
              }}
            >
              {material.category}
            </p>
            <h3>{material.title}</h3>
            <p className="prewrap">{material.lessonContent}</p>
          </article>
          <button type="button" className="primary-btn" onClick={() => setPhase("quiz")}>
            <IoPlayCircle size={18} />
            Mulai Kuis ({material.questions?.length ?? 0} Soal)
          </button>
        </section>
      ) : null}

      {phase === "quiz" && question ? (
        <section className="stack-lg">
          <article className="card stack-sm">
            <div className="row-between">
              <p className="muted">Soal {current + 1} dari {material.questions?.length ?? 0}</p>
              <p className="muted">{progressPct}%</p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </article>

          <article className="card">
            <h3>{question.question}</h3>
          </article>

          <section className="stack">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              let className = "option-btn";

              if (showFeedback) {
                if (isCorrect) {
                  className = "option-btn correct";
                } else if (isSelected && !isCorrect) {
                  className = "option-btn wrong";
                }
              } else if (isSelected) {
                className = "option-btn selected";
              }

              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  className={className}
                  onClick={() => chooseAnswer(index)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                  {showFeedback && isCorrect ? (
                    <span className="answer-badge good with-icon"><IoCheckmarkCircle size={14} />Benar</span>
                  ) : null}
                  {showFeedback && isSelected && !isCorrect ? (
                    <span className="answer-badge bad with-icon"><IoCloseCircle size={14} />Salah</span>
                  ) : null}
                </button>
              );
            })}
          </section>

          {showFeedback && question.explanation ? (
            <article className="card explanation-card">
              <p className="explanation-label">PENJELASAN</p>
              <p>{question.explanation}</p>
            </article>
          ) : null}

          {showFeedback ? (
            <button
              type="button"
              className="primary-btn"
              onClick={nextQuestion}
              disabled={submitting}
            >
              {submitting
                ? "Memproses..."
                : current + 1 < (material.questions?.length ?? 0)
                  ? "Soal Berikutnya"
                  : "Lihat Hasil"}
            </button>
          ) : null}
        </section>
      ) : null}

      {phase === "result" && result ? (
        <section className="stack-lg">
          <article className="card result-card">
            <div className={result.passed ? "result-icon success" : "result-icon fail"}>
              {result.passed ? <IoTrophy size={34} /> : <IoRefreshCircle size={34} />}
            </div>
            <h3>{result.passed ? "Selamat!" : "Hampir!"}</h3>
            <p className="big-number">{result.score}/{result.total}</p>
            <p className="muted">{result.passed ? "Kamu berhasil lulus kuis ini." : "Pelajari lagi dan coba lebih baik."}</p>
          </article>

          <section className="grid result-grid">
            <article className="card stat-card">
              <p className="hero-kicker">XP Didapat</p>
              <p className="big-number">+{result.xpEarned}</p>
            </article>
            <article className="card stat-card">
              <p className="hero-kicker">Skor</p>
              <p className="big-number">{Math.round((result.score / result.total) * 100)}%</p>
            </article>
            <article className="card stat-card">
              <p className="hero-kicker">Status</p>
              <p className="big-number status-text">{result.passed ? "Lulus" : "Coba Lagi"}</p>
            </article>
          </section>

          <button type="button" className="primary-btn" onClick={() => router.replace("/kelas?tab=kuis")}>
            Kembali ke Daftar Kuis
          </button>
        </section>
      ) : null}
    </main>
  );
}
