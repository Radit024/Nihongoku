"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoBriefcaseOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoSchoolOutline,
} from "react-icons/io5";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user, isLoading } = useAppContext();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"mahasiswa" | "dosen">("mahasiswa");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, role);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-blob blob-one" />
      <div className="auth-blob blob-two" />
      <div className="auth-blob blob-three" />

      <section className="auth-mobile-shell">
        <div className="auth-top-decoration">
          <div className="logo-circle">に</div>
          <h1>NIKU</h1>
          <p className="eyebrow">Nihongoku</p>
          <p className="muted">Belajar Bahasa Jepang dengan Mudah</p>
        </div>

        <article className="auth-card auth-mobile-card">
          <h2>{mode === "login" ? "Masuk" : "Buat Akun"}</h2>

          <form className="stack" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label>
                Nama
                <div className="field-shell">
                  <span className="field-icon"><IoPersonOutline size={16} /></span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </label>
            ) : null}

            {mode === "register" ? (
              <div className="role-picker-row">
                <button
                  type="button"
                  className={role === "mahasiswa" ? "role-pill active" : "role-pill"}
                  onClick={() => setRole("mahasiswa")}
                >
                  <IoSchoolOutline size={16} />
                  Mahasiswa
                </button>
                <button
                  type="button"
                  className={role === "dosen" ? "role-pill active" : "role-pill"}
                  onClick={() => setRole("dosen")}
                >
                  <IoBriefcaseOutline size={16} />
                  Dosen
                </button>
              </div>
            ) : null}

            <label>
              Email
              <div className="field-shell">
                <span className="field-icon"><IoMailOutline size={16} /></span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </label>

            <label>
              Password
              <div className="field-shell">
                <span className="field-icon"><IoLockClosedOutline size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  className="ghost-btn inline-btn"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                </button>
              </div>
            </label>

            {error ? <p className="error-text error-box">{error}</p> : null}

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Sekarang"}
            </button>
          </form>

          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setError("");
              setMode((prev) => (prev === "login" ? "register" : "login"));
            }}
          >
            {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </article>
      </section>
    </main>
  );
}
