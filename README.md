# ViralFlow AI - Frontend

An AI-powered YouTube Shorts automation platform that streamlines discovering highlights in long-form videos, transcribing dialogue, reframing vertical video, and scheduling releases.

## 🚀 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components & Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Visualization:** Recharts

## 📋 Features Implemented (5 Phases)
1. **Main Dashboard (`/dashboard`)**: 8 KPI summary cards, active background task execution progress, filterable event timeline, and interactive state switcher (`Populated`, `Empty`, `Loading`, `Error`).
2. **Channel Management (`/channels/sources` & `/channels/destinations`)**: Monitored channel crawlers with duplicate detection and OAuth credential architecture (zero browser token exposure).
3. **Video Library (`/library` & `/library/upload`)**: 7 Category filters (*Imported*, *Processing*, *Extracted*, *Pending*, *Scheduled*, *Published*, *Failed*), drag-and-drop file ingestion, and copyright certification.
4. **Clip Studio & Editor (`/clips` & `/clips/[clipId]`)**: Interactive 9:16 vertical phone video player, live subtitles preview overlay, heuristic score breakdown (Hook 25%, Content 25%, Context 20%, Emotion 15%, Pacing 15%), typography styling, metadata editor, and pending approvals queue (`/approvals`).
5. **Publishing Scheduler (`/scheduler` & `/publishing/[clipId]`)**: Calendar views defaulting to `Asia/Kolkata (IST)`, queue management, daily rate limits, pre-publish pre-flight checklist, and status tracker.
6. **Analytics (`/analytics`)**: View velocity trends, engagement distribution charts, and top performing Shorts leaderboard.
7. **Automation Control Center (`/automation`)**: 8 pipeline service controllers with individual start/pause toggles and hardware worker telemetry.
8. **Settings & Health (`/settings`)**: Health verification matrix for Ollama, Qwen, Faster-Whisper, FFmpeg, Supabase, and YouTube API.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build for Production
```bash
npm run build
```
