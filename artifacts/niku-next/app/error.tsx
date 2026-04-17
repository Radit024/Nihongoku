"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="center-screen" style={{ padding: 24 }}>
      <section className="card stack" style={{ width: "min(760px, 100%)" }}>
        <h2>Terjadi error</h2>
        <p className="muted">Aplikasi mengalami gangguan tidak terduga.</p>
        <div className="actions-row">
          <button className="primary-btn" type="button" onClick={() => reset()}>
            Coba Lagi
          </button>
          <button className="ghost-btn" type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </section>
    </main>
  );
}
