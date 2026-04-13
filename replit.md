# NIKU - Nihongoku

## Overview
Japanese language learning EdTech mobile app built with Expo (React Native). Features dynamic content powered by Gemini AI — dosen (teachers) upload PDF/image materials, AI auto-generates quiz questions, mahasiswa (students) take quizzes. PostgreSQL backend with Express API.

## Architecture
- **Mobile App**: Expo SDK 54 / React Native 0.81 via Expo Router v6
- **API Server**: Express 5 + Drizzle ORM + PostgreSQL
- **AI**: Gemini 2.5 Flash via Replit AI Integrations (content extraction + quiz generation)
- **Routing**: File-based routing with Expo Router; 5 tabs (Beranda, Materi, Upload, Kuis, Progress) + quiz stack
- **State**: React Context + AsyncStorage for auth caching; API-driven data
- **Auth**: Email/password with bcryptjs hashing; role-based (dosen/mahasiswa)
- **Fonts**: Inter (body) via @expo-google-fonts/inter; Georgia/serif (headings)

## User Flow
1. Dosen uploads PDF/image material via Upload tab
2. Gemini AI reads and understands the content
3. AI auto-generates lesson summary + 10 quiz questions with explanations
4. Material + questions stored in PostgreSQL
5. Mahasiswa sees materials in Materi tab, takes quizzes in Kuis tab
6. XP/streak tracked per user in the database

## Key Files

### API Server
- `artifacts/api-server/src/routes/auth.ts` — Register/login with role (dosen/mahasiswa)
- `artifacts/api-server/src/routes/materials.ts` — Upload (multer + Gemini AI), list, get, delete
- `artifacts/api-server/src/routes/quizzes.ts` — Submit quiz answers, history, progress

### Database
- `lib/db/src/schema/users.ts` — Users with role, XP, streak
- `lib/db/src/schema/materials.ts` — Materials with AI-generated lesson content
- `lib/db/src/schema/quizQuestions.ts` — Quiz questions with options, correct answer, explanation
- `lib/db/src/schema/quizAttempts.ts` — Quiz attempt history

### Mobile App
- `artifacts/niku/lib/api.ts` — API client for all endpoints
- `artifacts/niku/context/AppContext.tsx` — Global state with API integration
- `artifacts/niku/app/login.tsx` — Login/register with role selection
- `artifacts/niku/app/(tabs)/upload.tsx` — Dosen file upload (PDF/image)
- `artifacts/niku/app/(tabs)/index.tsx` — Beranda/Home
- `artifacts/niku/app/(tabs)/materi.tsx` — Lessons list with search & filter
- `artifacts/niku/app/(tabs)/kuis.tsx` — Quiz selection
- `artifacts/niku/app/(tabs)/progress.tsx` — Progress stats
- `artifacts/niku/app/quiz/[id].tsx` — Interactive quiz (lesson → questions → results)

### Gemini AI Integration
- `lib/integrations-gemini-ai/src/client.ts` — Pre-configured Gemini SDK client
- AI processes uploaded PDF/images and generates structured JSON: title, category, lesson summary, 10 quiz questions

## Design System
- **Primary (Crimson)**: #C0272D
- **Secondary (Sakura)**: #F2A8B0
- **Background (Cream)**: #F5EDE6
- **Navy**: #1C2340
- **Tan (Accent)**: #C9A882
- **Radius scale**: sm(8), md(12), lg(16), xl(20), xxl(24), full(9999)
- **Headings**: Georgia (iOS) / serif (Android/Web)
- **Body**: Inter

## API Endpoints
- POST /api/auth/register — Register with name, email, password, role
- POST /api/auth/login — Login with email, password
- POST /api/materials/upload — Upload PDF/image (multipart, dosen only)
- GET /api/materials — List all materials
- GET /api/materials/:id — Get material with quiz questions
- DELETE /api/materials/:id — Delete material (dosen owner only)
- POST /api/quizzes/:materialId/submit — Submit quiz answers
- GET /api/quizzes/history — User quiz history
- GET /api/progress — User progress stats

## Features
- Role-based auth: Dosen uploads materials, Mahasiswa takes quizzes
- AI-powered content processing: Gemini reads PDF/images, generates quizzes
- XP system: 10 XP per correct answer + 20 XP bonus for passing (>=80%)
- Streak tracking with daily active date logic
- Category-based progress tracking
- Search & filter on Materi screen
- Upload tab visible only to Dosen users
- Quiz: 3 phases — lesson content → interactive quiz (green/red feedback) → results

## Level System
- Lv.1 Pemula: 0-99 XP
- Lv.2 Dasar: 100-299 XP
- Lv.3 Menengah: 300-599 XP
- Lv.4 Mahir: 600-999 XP
- Lv.5 Master: 1000+ XP
