import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-screen" style={{ padding: 24 }}>
      <section className="card stack" style={{ width: "min(620px, 100%)" }}>
        <h2>Halaman tidak ditemukan</h2>
        <p className="muted">URL yang kamu akses tidak tersedia di aplikasi ini.</p>
        <Link className="primary-btn inline-btn" href="/dashboard">
          Kembali ke Beranda
        </Link>
      </section>
    </main>
  );
}
