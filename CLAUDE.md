# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Environment Setup

**Required:** Create `.env` file in project root:
```bash
cp .env.example .env
```

**Configuration:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - New publishable key (sb_publishable_...)

**Get keys:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy URL and publishable key
3. Add to `.env` file

**Note:** Legacy anon keys (eyJhbGci...) deprecated, use new publishable keys.

## Docker Deployment

**Build image with env vars:**
```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://amwivjkqhskhzbauzwcj.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  -t wine-lottery .
```

**Run container:**
```bash
docker run -p 80:80 wine-lottery
```

**GitHub Actions:** Add secrets in repo Settings → Secrets → Actions:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **UI:** shadcn-ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **State:** TanStack Query (React Query)
- **Forms:** react-hook-form + zod

### Directory Structure
```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   │   ├── lotteries/  # Lottery management
│   │   ├── prizes/     # Prize management
│   │   └── entries/    # Entry management
│   ├── lottery/        # Public lottery UI
│   └── ui/             # shadcn-ui components
├── contexts/           # React contexts
│   ├── AuthContext.tsx            # Supabase auth state
│   └── PasswordVerificationContext.tsx  # Lottery password protection
├── hooks/              # Custom React hooks
├── integrations/
│   └── supabase/       # Supabase client & types
├── pages/              # Route components
├── lib/                # Utility functions
└── utils/              # Helper utilities
```

### Key Architectural Patterns

**Authentication System:**
- Admin access uses Supabase Auth (email/password + Google OAuth)
- Public lottery access protected by per-lottery password verification
- `AuthContext` manages admin session state
- `PasswordVerificationContext` manages lottery password state
- Admin check via `admin_users` table join with Supabase auth

**Data Flow:**
- TanStack Query handles all data fetching/caching
- Supabase realtime subscriptions for live updates
- Custom hooks encapsulate query logic (e.g., `useActiveLottery`, `useLotteryEntries`)

**Active Lottery Concept:**
- Single "active" lottery = earliest incomplete lottery with draw_date >= today
- Fetched via `useActiveLottery` hook
- Referenced throughout app for entries, prizes, status

**Tab-Based Navigation:**
- Main page (`Index.tsx`) uses tabs: Lottery, Live Draw, Admin
- Lottery/Live Draw tabs require password verification
- Admin tab requires authentication
- Tab switching handled with state to manage verification flow

**Supabase Schema:**
- `lotteries` - lottery events
- `prizes` - prizes per lottery
- `entries` - user entries per lottery
- `lottery_status` - lottery state (locked/unlocked)
- `admin_users` - admin user IDs

**Path Alias:**
- `@/` maps to `./src/` (configured in vite.config.ts & tsconfig.json)
