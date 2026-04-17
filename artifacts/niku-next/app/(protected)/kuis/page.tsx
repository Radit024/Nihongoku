"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

export default function KuisPage() {
  const { user, materials, quizHistory, refreshMaterials, refreshQuizHistory } = useAppContext();

  useEffect(() => {
    void Promise.all([refreshMaterials(), refreshQuizHistory()]);
  }, [refreshMaterials, refreshQuizHistory]);

  if (user?.role === "dosen") {
    return (
      <article className="card">
        <h2>Halaman ini khusus mahasiswa</h2>
        <p className="muted">Sebagai dosen, gunakan menu Upload untuk mengelola kuis.</p>
      </article>
    );
  }

  const bestScoreMap = new Map<string, string>();
  for (const item of quizHistory) {
    const current = bestScoreMap.get(item.materialId);
    if (!current) {
      bestScoreMap.set(item.materialId, `${item.score}/${item.total}`);
    }
  }

  return (
    <section className="stack-lg">
      <article className="card">
        <h2>Daftar Kuis</h2>
        <p className="muted">Hanya materi published yang muncul di sini</p>
      </article>

      <section className="stack">
        {materials.map((item) => (
          <article key={item.id} className="card">
            <div className="row-between">
              <div>
                <h3>{item.title}</h3>
                <p className="muted">
                  {item.category} - {item.questionCount} soal
                </p>
                {bestScoreMap.has(item.id) ? <p className="muted">Best: {bestScoreMap.get(item.id)}</p> : null}
              </div>
              <Link href={`/quiz?id=${item.id}`} className="primary-btn inline-btn">
                Kerjakan
              </Link>
            </div>
          </article>
        ))}

        {materials.length === 0 ? <p className="muted">Belum ada kuis yang dipublish.</p> : null}
      </section>
    </section>
  );
}
