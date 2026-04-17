"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function MateriPage() {
  const { user, materials, refreshMaterials } = useAppContext();
  const [query, setQuery] = useState("");

  useEffect(() => {
    void refreshMaterials();
  }, [refreshMaterials]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [materials, query]);

  return (
    <section className="stack-lg">
      <article className="card">
        <h2>Materi Kelas</h2>
        <p className="muted">{materials.length} materi tersedia</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari materi"
          className="search-input"
        />
      </article>

      <section className="stack">
        {filtered.map((item) => (
          <article key={item.id} className="card">
            <div className="row-between">
              <div>
                <h3>{item.title}</h3>
                <p className="muted">
                  {item.category} - {item.questionCount} soal
                </p>
              </div>
              {user?.role === "mahasiswa" ? (
                <Link className="primary-btn inline-btn" href={`/quiz?id=${item.id}`}>
                  Buka Kuis
                </Link>
              ) : (
                <Link className="primary-btn inline-btn" href="/upload">
                  Kelola
                </Link>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 ? <p className="muted">Belum ada materi.</p> : null}
      </section>
    </section>
  );
}
