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
npm run dev -w niku-next
```

Alternatif singkat dari root workspace:

```bash
npx nex dev
```

Perintah ini menjalankan mode development monolith: frontend Next dan backend API dalam satu process/server.

Untuk build frontend + backend sekaligus:

```bash
npx nex build
```

Secara default mode dev monolith menggunakan satu origin:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8080/api`

Jika butuh mode lama (split process), jalankan:

```bash
npm run dev:split
```

Mode split memakai:

- Frontend: `http://localhost:8082`
- Backend API: `http://localhost:8080/api`

### Environment

Salin `.env.example` menjadi `.env.local` lalu sesuaikan URL API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Untuk mode single-hosting (frontend disajikan dari backend yang sama), gunakan:

```bash
NEXT_PUBLIC_API_URL=/api
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

### Deploy single-hosting (1 service)

Bangun frontend statis + backend lalu jalankan backend saja:

```bash
npm run deploy:single-hosting
```

`api-server` akan otomatis menyajikan hasil build frontend dari folder `artifacts/niku-next/out` sekaligus endpoint `/api`, jadi tidak perlu dua hosting terpisah.
