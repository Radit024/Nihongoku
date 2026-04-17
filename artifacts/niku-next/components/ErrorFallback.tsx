"use client";

import React, { useState } from "react";

type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <main className="center-screen" style={{ padding: 24 }}>
      <section className="card stack" style={{ width: "min(760px, 100%)" }}>
        <h2>Terjadi gangguan pada aplikasi</h2>
        <p className="muted">Coba ulangi, atau reload aplikasi jika masih terjadi.</p>

        <div className="actions-row">
          <button className="primary-btn" type="button" onClick={resetError}>
            Coba Lagi
          </button>
          <button className="ghost-btn" type="button" onClick={() => window.location.reload()}>
            Reload App
          </button>
          <button className="ghost-btn" type="button" onClick={() => setShowDetails((prev) => !prev)}>
            {showDetails ? "Sembunyikan Detail" : "Lihat Detail"}
          </button>
        </div>

        {showDetails ? (
          <pre className="error-pre">{`Error: ${error.message}\n\n${error.stack ?? ""}`}</pre>
        ) : null}
      </section>
    </main>
  );
}

export type { ErrorFallbackProps };
