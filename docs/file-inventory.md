# File Inventory — Sejais Santo

## Frontend Source Files

### Entry
| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.tsx` | React root + AuthProvider |

### App Layer
| File | Lines | Purpose |
|------|-------|---------|
| `app/App.tsx` | 128 | Root component (layout, modals) |
| `app/App.css` | 131 | App layout + organizer modal styles |
| `app/LiturgicalThemeManager.tsx` | 238 | Dynamic liturgical CSS variables |

### Context
| File | Lines | Purpose |
|------|-------|---------|
| `app/context/AuthContext.tsx` | 55 | Supabase auth state provider |

### Hooks
| File | Lines | Purpose |
|------|-------|---------|
| `app/hooks/useMultiImageGenerator.tsx` | 185 | Split text into multi-page images |

### Services
| File | Lines | Purpose |
|------|-------|---------|
| `app/services/useGospel.ts` | 48 | Fetch gospel of the day |

### Share
| File | Lines | Purpose |
|------|-------|---------|
| `app/share/shareTemplates.ts` | 37 | Template configs (5 gospel + 5 verse) |
| `app/share/shareUtils.ts` | 74 | Web Share API + file helpers |

### Components
| File | Lines | Purpose |
|------|-------|---------|
| `components/Header.tsx` + `.css` | 69+219 | Top bar with logo, auth |
| `components/HeroBanner.tsx` + `.css` | 42+117 | Carlo Acutis hero section |
| `components/FeatureCard.tsx` + `.css` | 117+120 | Three main feature cards |
| `components/GospelCard.tsx` + `.css` | 36+64 | Gospel preview |
| `components/GospelShareImage.tsx` | 68 | Image generator for gospel |
| `components/GospelShareModal.tsx` | 253 | Share modal (largest component) |
| `components/VerseOrganizer.tsx` + `.css` | 196+74 | Verse CRUD |
| `components/VersiculoList.tsx` | 141 | DUPLICATE of VerseOrganizer |
| `components/VersiculoCard.tsx` | 67 | Single verse card |
| `components/VerseItem.tsx` + `.css` | 44+45 | Single verse item |
| `components/VerseShare.tsx` | 120 | Legacy verse share (OurManna) |
| `components/VerseImageShareModal.tsx` | 163 | Verse image share |
| `components/VersododiaModal.tsx` + `.css` | 79+124 | Verse of the day modal |
| `components/EasterBanner.tsx` + `.css` | 32+124 | Easter/Pentecost banner |
| `components/AboutSection.tsx` + `.css` | 63+154 | About Carlo Acutis |
| `components/LiturgicalFooter.tsx` + `.css` | 112+174 | Liturgical season footer |
| `components/Footer.tsx` + `.css` | 122+195 | Site footer |
| `components/ShareSquareCard.tsx` | 143 | Square card for share images |
| `components/ShareTemplatePicker.tsx` + `.css` | 68+103 | Template grid selector |
| `components/ShareComposer.css` | 156 | Share modal layout |
| `components/SobreModal.tsx` + `.css` | 39+41 | About modal |
| `components/VerseOrganizerIcon.tsx` + `.css` | 16+5 | Icon component |
| `components/VerseOrganizerModal.tsx` + `.css` | 92+55 | Modal wrapper |
| `components/figma/ImageWithFallback.tsx` | 22 | Image with error fallback |

### UI (shadcn/ui) — 38 files
| Component | Lines |
|-----------|-------|
| accordion, alert, alert-dialog, aspect-ratio, avatar, badge | 60-143 |
| breadcrumb, button, calendar, card, carousel, chart | 53-317 |
| checkbox, collapsible, command, context-menu, dialog | 28-234 |
| drawer, dropdown-menu, form, hover-card, input, input-otp | 18-239 |
| label, menubar, navigation-menu, pagination, popover | 20-257 |
| progress, radio-group, resizable, scroll-area, select | 27-176 |
| separator, sheet, sidebar, skeleton, slider, sonner | 11-672 |
| switch, table, tabs, textarea, toggle, toggle-group, tooltip | 15-105 |

### Lib
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client with mock fallback |
| `lib/supabaseClient.js` | Legacy Supabase client (unused?) |

### Utils
| File | Purpose |
|------|---------|
| `utils/LiturgicalCalendar.ts` | Computus algorithm for seasons |

### Config
| File | Purpose |
|------|---------|
| `frontend/package.json` | Dependencies + scripts |
| `frontend/vite.config.ts` | Vite + React + legacy plugin |
| `frontend/postcss.config.mjs` | PostCSS (empty — Tailwind v4 handles) |
| `frontend/tsconfig.json` | **MISSING** — no type checking |

## Backend Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `api/main.py` | 146 | FastAPI app with 4 endpoints |
| `api/supabase_client.py` | 16 | Supabase client factory |
| `api/supabase_storage.py` | 59 | Verses CRUD |
| `requirements.txt` | 8 | Python dependencies |

## Database

| File | Purpose |
|------|---------|
| `sql/create_verses_table.sql` | Verses table schema |
