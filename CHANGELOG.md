# Changelog

## [2.0.0] — 2026-06-30

### Arquitetura
- Schema relacional completo da Bíblia (73 livros, 1.334 capítulos, 35.450 versículos)
- Engine litúrgica portada do Laravel (ciclos A/B/C, cores, 90+ santos, lecionário)
- Full Text Search com índice GIN em português
- Parser de referência bíblica com 79 testes (62 µs/op)
- PWA com Service Worker manual (3 estratégias de cache)
- RLS policies em todas as 7 tabelas do Supabase
- Backend com service_role para operações de escrita (menor privilégio)

### Funcionalidades
- Navegador bíblico com 73 livros, capítulos e versículos
- Busca unificada: referência (Jo 3,16) + FTS (amor de deus) + book-only (Romanos)
- Calendário litúrgico com estações, cores e santos do dia
- Cache do evangelho com fallback externo e metadados litúrgicos
- CRUD de versículos do usuário com autenticação Google
- PWA instalável com cache offline da Bíblia
- Design System com tokens (cores, tipografia, espaçamento, bordas, sombras)

### Performance
- Bundle total: 8.376 KB → 4.707 KB (-44%)
- `biblePaperImage2.webp`: 3.419 KB → 132 KB (-96%)
- Dependências: 399 → 195 (-51%)
- shadcn/ui: 48 → 2 componentes (-96%)
- Bundle JS moderno gzipado: 94 KB

### Segurança
- 0 vulnerabilidades npm audit (Vite 6.3.5 → 6.4.3)
- CORS restrito a origins conhecidas
- JWT assinado com HS256 e SUPABASE_JWT_SECRET
- RLS em todas as tabelas (SELECT público, INSERT/UPDATE service_role ou auth.uid)
- Service role key para backend (escritas no banco)

### UX/UI
- Design System com tokens de cor, tipografia, espaçamento, bordas e sombras
- Header, Footer, FeatureCards, Modais modernizados
- Responsividade aprimorada (mobile-first grid)
- Header com nav semântico e login responsivo (texto curto em mobile)
- Footer com grid adaptável (3 colunas → 1 coluna)

### Acessibilidade (WCAG)
- Contraste corrigido (Tempo Pascal #f5c500 → #c8960f) — WCAG AA
- Focus management em modais (focus trap + retorno ao elemento anterior)
- `outline:none` removido de BibleSearch e GospelCard; `focus-visible` com gold
- `aria-label` em todos os botões interativos
- HTML semântico: `<nav>`, `<article>`, `role="banner"`, `role="dialog"`, `aria-modal`

### SEO
- `<link rel="canonical">` apontando para domínio de produção
- Open Graph: og:type, og:url, og:title, og:description, og:image, og:locale
- Twitter Cards: summary_large_image
- JSON-LD Structured Data (WebSite + SearchAction)
- `<link rel="preconnect">` para Google Fonts
- `<meta name="robots" content="index, follow">`

### Dependências
- Vite 6.3.5 → 6.4.3 (fix path traversal vulnerability)
- Removidos 204 pacotes não utilizados (depcheck)
- @vitejs/plugin-legacy mantido (Chrome 50+)

### Breaking Changes
- `bible-api.com` não é mais fonte primária da Bíblia (usar API local via Supabase + FastAPI)
- `SUPABASE_SERVICE_KEY` é obrigatória no backend (escritas no banco)
- CORS agora exige origens explícitas (adicionar domínio de produção)

### Documentação
- `RELEASE_NOTES_2.0.0.md` — Release notes completa
- `MIGRATION.md` — Guia completo de migração do projeto original para arquitetura híbrida
- `DEPLOY.md` — Guia completo de deploy em produção (Vercel + Railway + Supabase)
- `BIBLE_ARCHITECTURE.md` — Documentação detalhada do schema bíblico e parser
- `RC1_AUDIT.md` — Relatório de auditoria pré-deploy
- `CHANGELOG.md` — Este arquivo

### Configuração de Deploy
- `frontend/vercel.json` — SPA rewrites para rotas React
- `backend/nixpacks.toml` — Build config para Railway/Nixpacks
- `backend/Procfile` — Start command para Railway/Render
- `frontend/src/lib/api.ts` — Adaptador de URL de API para produção

## [1.0.0] — 2025 (versão anterior, não documentada)
