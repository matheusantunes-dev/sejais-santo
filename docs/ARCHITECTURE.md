# Architecture — Sejais Santo

## Overview

```
User ──► Vite Dev Server (port 5173)
             │
             ├── React 18 + TypeScript
             ├── Vite 6 build tool
             └── Proxy (/api → localhost:8000)
                      │
              FastAPI Backend (port 8000)
                  ├── GET  /              health check
                  ├── GET  /verses        list (auth)
                  ├── POST /verses        create (auth)
                  ├── DELETE /verses      delete (auth)
                  └── GET  /gospel        proxy to external liturgy API
                          │
                    liturgia.up.railway.app (external)
                          │
                    ┌──── Supabase ────┐
                    │  Auth (Google)   │
                    │  Database        │
                    │  (verses table)  │
                    └──────────────────┘
```

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.3.1 |
| Language | TypeScript | (via Vite/esbuild) |
| Build Tool | Vite | 6.3.5 |
| Styling | Pure CSS + shadcn/ui (Radix) | — |
| Icons | Lucide React | 0.487.0 |
| Backend Framework | FastAPI (Python) | 0.138.x |
| Database | Supabase (PostgreSQL) | — |
| Auth | Supabase Auth (Google OAuth) | — |
| Hosting | Vercel (planned) | — |

## Folder Structure

```
sejais-santo/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── app/                # App entry + context + hooks + services
│   │   ├── components/         # All UI components
│   │   │   └── ui/             # shadcn/ui primitives (2 files: sonner + utils)
│   │   ├── styles/             # Global CSS (theme, base, fonts, custom)
│   │   ├── lib/                # SDK clients (Supabase)
│   │   ├── utils/              # Pure business logic
│   │   └── assets/             # WebP images, SVG
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   └── api/                    # FastAPI application
│       ├── main.py             # Routes + auth
│       ├── supabase_client.py  # Supabase client factory
│       ├── supabase_storage.py # CRUD operations
│       └── gospel_cache.py     # Daily gospel caching layer
├── sql/
│   ├── create_verses_table.sql
│   └── create_daily_gospel_table.sql
├── docs/                       # Documentation (this sprint)
└── .gitignore
```

## Data Flow

1. **Gospel**: Frontend → `/api/gospel` → FastAPI → Supabase `daily_gospel` cache (if fresh) OR `liturgia.up.railway.app` (if stale/miss) → cache stored → response
2. **Bible Reading**: Frontend → `bible-api.com` (Almeida translation) → book/chapter/verse navigation
3. **Verses (CRUD)**: Frontend → `/api/verses` → FastAPI → Supabase (JWT auth)
4. **Auth**: Supabase Auth (Google OAuth) → session in AuthContext
5. **Liturgical Theme**: `LiturgicalCalendar.ts` (local Computus algorithm) → `LiturgicalThemeManager.tsx` → CSS custom properties

## External Dependencies

| Service | Purpose | Endpoint |
|---------|---------|----------|
| liturgia.up.railway.app | Daily gospel readings | `GET /v2` |
| bible-api.com | Random verse | `GET ?random=verse` |
| ourmanna.com | Daily verse (legacy) | `GET /api/v1/get` |

## Security Model

- JWT Bearer token passed in `Authorization` header
- Backend verifies JWT via `jose.decode()` with `SUPABASE_JWT_SECRET` (HS256, audience=authenticated)
- CORS restricted to `localhost:5173` and `localhost:4173`
- Supabase RLS policies protect verse data by `user_id`

## Performance Notes

- Gospel response cached in Supabase `daily_gospel` table (1 request/day to external API)
- No code splitting
- No lazy loading for components
- Legacy polyfills bundle (537 KB) served to all browsers
