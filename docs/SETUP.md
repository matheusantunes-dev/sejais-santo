# Setup — Sejais Santo

## Prerequisites

- Node.js >= 18 (tested with v24.14.0)
- npm >= 9 (tested with 11.9.0)
- Python >= 3.12 (tested with 3.14.3)
- Git

---

## Quick Start

### 1. Clone & Install Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

The app runs in **development mode with mock Supabase client**. Most features work without a real backend, except:
- Verse CRUD (needs Google Auth)
- Gospel of the Day (uses backend proxy)

### 2. Install & Run Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api.main:app --port 8000
# API at http://localhost:8000
```

### 3. Build for Production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_SUPABASE_URL` | Yes* | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes* | Supabase anon key | `eyJ...` |
| `VITE_API_URL` | Yes | Backend URL | `http://localhost:8000` |

\* Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the frontend uses a **mock client** that allows dev without a real Supabase instance. Auth and verse persistence will not work.

**To create** (after obtaining real credentials):

```bash
cp frontend/.env.sample frontend/.env
# Edit frontend/.env with real values
```

### Backend (`backend/.env`)

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key | `eyJ...` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `SUPABASE_JWT_SECRET` | Yes | JWT secret for token verification | `xxx` |

**To create**:

```bash
cp backend/.env.sample backend/.env
# Edit backend/.env with real values
```

---

## Verified Commands

| Command | Status | Notes |
|---------|--------|-------|
| `npm install` | ✅ | 398 packages |
| `npm run dev` | ✅ | Vite ready in ~2.2s |
| `npm run build` | ✅ | 26s, 1711 modules |
| `pip install -r requirements.txt` | ✅ | All deps installed |
| `uvicorn api.main:app` | ✅ | Health check returns 200 |

---

## Troubleshooting

**Problem**: `npm install` fails with rollup version error
**Solution**: `npm cache clean --force` then retry

**Problem**: Backend won't start (missing env)
**Solution**: Backend uses `load_dotenv()` — without `.env` file, Supabase calls will fail. The health check (`GET /`) works without env vars.

**Problem**: No TypeScript type checking
**Note**: Vite uses esbuild for transpilation (no tsconfig required). For strict type checking, create `tsconfig.json` in `frontend/`.
