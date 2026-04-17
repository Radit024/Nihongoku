"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IoBookOutline,
  IoBulbOutline,
  IoCheckmarkCircle,
  IoLogInOutline,
  IoSchoolOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <main className={styles.loadingScreen}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingLogo}>に</div>
          <p>Memuat sesi NIKU...</p>
        </div>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.glowThree} />

      <section className={styles.heroCard}>
        <div className={styles.heroTopRow}>
          <span className={styles.brandTag}>
            <IoSparklesOutline size={14} />
            Nihongoku Learning Space
          </span>
          <span className={styles.versionPill}>Web + Android</span>
        </div>

        <h1 className={styles.title}>Belajar Bahasa Jepang Terasa Seperti Main Quest Harian</h1>
        <p className={styles.subtitle}>
          NIKU menggabungkan materi, kuis, progress XP, dan kelas dalam satu alur yang rapi supaya belajar terasa ringan tapi tetap terarah.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/login" className={styles.primaryCta}>
            <IoLogInOutline size={18} />
            Masuk dan Mulai Belajar
          </Link>
          <Link href="/login" className={styles.secondaryCta}>
            Buat Akun Baru
          </Link>
        </div>

        <div className={styles.quickStats}>
          <article className={styles.statChip}>
            <p className={styles.statValue}>5+</p>
            <p className={styles.statLabel}>Kategori Materi</p>
          </article>
          <article className={styles.statChip}>
            <p className={styles.statValue}>XP</p>
            <p className={styles.statLabel}>Progress Bertahap</p>
          </article>
          <article className={styles.statChip}>
            <p className={styles.statValue}>Kelas</p>
            <p className={styles.statLabel}>Belajar Tersegmentasi</p>
          </article>
        </div>
      </section>

      <section className={styles.featureGrid}>
        <article className={styles.featureCard}>
          <span className={styles.featureIcon}><IoBookOutline size={20} /></span>
          <h2>Materi + Kuis Terhubung</h2>
          <p>Belajar materi dan langsung lanjut kuis tanpa pindah alur yang membingungkan.</p>
        </article>

        <article className={styles.featureCard}>
          <span className={styles.featureIcon}><IoSchoolOutline size={20} /></span>
          <h2>Kelas Berdasarkan Kode</h2>
          <p>Mahasiswa hanya melihat konten kelasnya, dosen bisa mengelola konten dengan lebih fokus.</p>
        </article>

        <article className={styles.featureCard}>
          <span className={styles.featureIcon}><IoBulbOutline size={20} /></span>
          <h2>Draft Soal Dari AI</h2>
          <p>Upload materi lalu dapat draft kuis otomatis yang bisa direview sebelum dipublish.</p>
        </article>
      </section>

      <section className={styles.bottomStrip}>
        <div className={styles.bottomCopy}>
          <h3>Siap lanjut belajar hari ini?</h3>
          <p>Masuk sekarang, gabung kelas, dan selesaikan target belajar kamu.</p>
        </div>
        <Link href="/login" className={styles.bottomCta}>
          <IoCheckmarkCircle size={18} />
          Lanjut ke Login
        </Link>
      </section>
    </main>
  );
}
