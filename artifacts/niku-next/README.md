## NIKU Next + Capacitor

Migrasi aplikasi Nihongoku dari React Native ke Next.js (App Router) dengan target mobile melalui Capacitor Android.

### Fitur yang dimigrasikan
- Login dan register
- Role dosen/mahasiswa
- Create/join class code
- Daftar materi kelas
- Upload PDF/PPT/Word/gambar
- Generate kuis AI, edit/tambah/hapus/reorder soal
- Publish/unpublish kuis
- Kerjakan kuis dan lihat hasil/progress

### Menjalankan versi web

```bash
npx next dev --port 8082
```

App berjalan di `http://localhost:8082`.

### Environment

Salin `.env.example` menjadi `.env.local` lalu sesuaikan URL API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Build web statis untuk Capacitor

```bash
npx next build
```

Output statis ada di folder `out`.

### Sync ke Android (Capacitor)

```bash
npx cap sync android
npx cap open android
```

`android:sync` akan build Next.js lalu copy ke project Android Capacitor.

### Catatan
- API server tetap memakai service yang sama di `artifacts/api-server`.
- Untuk Android emulator, fallback API di native mode menggunakan `http://10.0.2.2:8080/api` jika env tidak diisi.
