# NIKU - Nihongoku

## Overview
Japanese language learning EdTech mobile app built with Expo (React Native). Features adaptive learning with quiz-based lesson unlocking and AsyncStorage persistence (no backend required).

## Architecture
- **Framework**: Expo SDK 54 / React Native 0.81 via Expo Router v6
- **Routing**: File-based routing with Expo Router; 4 tabs + quiz stack
- **State**: React Context + AsyncStorage (`niku_app_state_v1`) — no backend
- **Fonts**: Inter (body) via @expo-google-fonts/inter; Georgia/serif (headings, system font)

## Key Files
- `artifacts/niku/app/_layout.tsx` — Root layout with AppProvider + AuthGate redirect
- `artifacts/niku/app/(tabs)/_layout.tsx` — Tab bar (NativeTabs with liquid glass / classic Tabs fallback)
- `artifacts/niku/context/AppContext.tsx` — Global state: auth, XP, streak, lesson progress, badges
- `artifacts/niku/data/seed.ts` — 5 lessons, 10 quiz questions each, 6 badges, 3 notifications
- `artifacts/niku/constants/colors.ts` — NIKU design tokens
- `artifacts/niku/app/login.tsx` — Login screen
- `artifacts/niku/app/(tabs)/index.tsx` — Beranda/Home
- `artifacts/niku/app/(tabs)/materi.tsx` — Lessons list with search & filter
- `artifacts/niku/app/(tabs)/kuis.tsx` — Quiz selection
- `artifacts/niku/app/(tabs)/progress.tsx` — Progress, stats, badges, streak calendar
- `artifacts/niku/app/quiz/[id].tsx` — Interactive quiz (lesson → questions → results)

## Design System
- **Primary (Crimson)**: #C0272D
- **Secondary (Sakura)**: #F2A8B0
- **Background (Cream)**: #F5EDE6
- **Navy**: #1C2340
- **Tan (Accent)**: #C9A882
- **Border Radius**: 16dp
- **Headings**: Georgia (iOS) / serif (Android/Web)
- **Body**: Inter

## Lessons (5 total)
1. Partikel は (wa) — unlocked by default
2. Partikel に (ni) — locked, unlocked after passing L1 quiz (80% threshold)
3. Konjugasi て-Form — unlocked by default
4. Kosakata Sehari-hari — unlocked by default
5. Kanji Dasar N5 — unlocked by default

## Features
- Login with any email/password (mock auth) or Google (simulated)
- XP system: 10 XP per correct answer + 20 XP bonus for passing (≥80%)
- Streak tracking: weekly calendar with flame indicators
- Badge system: 6 badges earned by XP milestones, streak, quiz completions
- Quiz: 3 phases — lesson content → interactive quiz (green/red feedback) → results
- Lesson locking: passing L1 quiz unlocks L2
- Search & filter by category on Materi screen
- Persistent state via AsyncStorage

## Level System
- Lv.1 Pemula: 0–99 XP
- Lv.2 Dasar: 100–299 XP
- Lv.3 Menengah: 300–599 XP
- Lv.4 Mahir: 600–999 XP
- Lv.5 Master: 1000+ XP
