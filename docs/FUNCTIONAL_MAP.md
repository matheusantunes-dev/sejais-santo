# Functional Map — Sejais Santo

All existing features with their source files and regression test notes.

## F1 — Evangelho do Dia (Gospel)

| Item | Files | Status |
|------|-------|--------|
| Fetch gospel from API | `app/services/useGospel.ts` | ✅ Verified (200 OK) |
| Gospel card display | `app/components/GospelCard.tsx`, `GospelCard.css` | ✅ |
| Gospel share modal | `app/components/GospelShareModal.tsx` | ✅ |
| Image generation | `app/components/GospelShareImage.tsx` | ✅ |
| Template picker | `app/components/ShareTemplatePicker.tsx` | ✅ |
| Backend proxy | `backend/api/main.py` (GET /gospel) | ✅ Verified (Mt 8,23-27) |
| **Regression test** | Gospel preview + share → generate image | Manual |

## F2 — Versículos (Verses)

| Item | Files | Status |
|------|-------|--------|
| Verse of the Day modal | `app/components/VersododiaModal.tsx` | ✅ |
| Legacy verse share | `app/components/VerseShare.tsx` | ✅ |
| Verse share image modal | `app/components/VerseImageShareModal.tsx` | ✅ |
| **Regression test** | Open modal → see verse → share | Manual |

## F3 — Organizador de Versículos (CRUD)

| Item | Files | Status |
|------|-------|--------|
| Verse organizer | `app/components/VerseOrganizer.tsx`, `VerseOrganizer.css` | ✅ |
| Verse organizer icon | `app/components/VerseOrganizerIcon.tsx`, `VerseOrganizerIcon.css` | ✅ |
| Verse organizer modal | `app/components/VerseOrganizerModal.tsx`, `VerseOrganizerModal.css` | ✅ |
| Verse list (DUPLICATE) | `app/components/VersiculoList.tsx` | ⚠️ Duplicate |
| Verse item | `app/components/VerseItem.tsx`, `VerseItem.css` | ✅ |
| Versiculo card | `app/components/VersiculoCard.tsx` | ✅ |
| Backend CRUD | `backend/api/main.py` (GET/POST/DELETE /verses) | ✅ |
| Supabase storage | `backend/api/supabase_storage.py` | ✅ |
| **Regression test** | Login → create → list → delete verse | Manual (needs Google Auth) |

## F4 — Autenticação

| Item | Files | Status |
|------|-------|--------|
| Auth context | `app/context/AuthContext.tsx` | ✅ |
| Supabase client | `lib/supabase.ts` | ✅ (mock fallback) |
| Google login button | `app/components/Header.tsx` | ✅ |
| **Regression test** | Login Google → see avatar → logout | Manual (needs .env) |

## F5 — Tema Litúrgico

| Item | Files | Status |
|------|-------|--------|
| Liturgical calendar | `utils/LiturgicalCalendar.ts` | ✅ (6 seasons) |
| Theme manager | `app/LiturgicalThemeManager.tsx` | ✅ |
| Liturgical footer | `app/components/LiturgicalFooter.tsx`, `LiturgicalFooter.css` | ✅ |
| **Regression test** | Page loads → header/cards show correct season colors | Manual |

## F6 — Compartilhamento

| Item | Files | Status |
|------|-------|--------|
| Share utilities | `app/share/shareUtils.ts` | ✅ |
| Share templates | `app/share/shareTemplates.ts` | ✅ |
| Multi-image generator | `app/hooks/useMultiImageGenerator.tsx` | ✅ |
| Share square card | `app/components/ShareSquareCard.tsx` | ✅ |
| **Regression test** | Share gospel → choose template → share image | Manual |

## F7 — Páginas Institucionais

| Item | Files | Status |
|------|-------|--------|
| Hero banner | `app/components/HeroBanner.tsx`, `HeroBanner.css` | ✅ |
| About section | `app/components/AboutSection.tsx`, `AboutSection.css` | ✅ |
| About modal | `app/components/SobreModal.tsx`, `SobreModal.css` | ✅ |
| Feature cards | `app/components/FeatureCard.tsx`, `FeatureCard.css` | ✅ |
| Easter banner | `app/components/EasterBanner.tsx`, `EasterBanner.css` | ✅ |
| Footer | `app/components/Footer.tsx`, `Footer.css` | ✅ |
| **Regression test** | Scroll page → all sections render | Manual |
