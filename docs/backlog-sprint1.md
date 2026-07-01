# Sprint 1 — Quick Wins (Alto Impacto / Baixo Risco)

## Sprint 0 Completed

Preparação do projeto concluída em 30/06/2026:
- ✅ tsconfig.json criado (strict mode)
- ✅ vite-env.d.ts com tipos Vite
- ✅ @types/react-dom instalado
- ✅ Feature flags (src/config/features.ts)
- ✅ Documentação em docs/

**Known pre-existing type errors** (17 TS6133 unused vars + 6 type mismatches):
Serão corrigidos ao alterar cada arquivo afetado nas sprints seguintes. O build Vite não é impactado (esbuild não checa tipos).

**Prioridade**: Menor risco, maior impacto

## Tarefas

### 1.1 Remover dependências não utilizadas
- **Arquivos**: `frontend/package.json`
- **Remover**: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `recharts`, `react-slick`, `react-dnd`, `react-dnd-html5-backend`, `cmdk`, `embla-carousel-react`, `input-otp`, `react-hook-form`, `next-themes`, `react-resizable-panels`, `react-responsive-masonry`, `vaul`, `@popperjs/core`, `react-popper`
- **Impacto**: ~635 KB de bundle
- **Risco**: Baixo (não importados em nenhum source)

### 1.2 Remover shadcn/ui não utilizados
- **Arquivos**: `frontend/src/app/components/ui/` (~20 de 38)
- **Remover**: sidebar, chart, context-menu, menubar, navigation-menu, drawer, resizable, carousel, form, input-otp, hover-card, command, toggle-group, breadcrumb, pagination, sheet, slider, switch, radio-group, checkbox, collapsible, aspect-ratio, menubar
- **Impacto**: ~50 KB de bundle
- **Risco**: Baixo (não importados)

### 1.3 Remover VersiculoList (duplicata)
- **Arquivo**: `frontend/src/app/components/VersiculoList.tsx`, `VersiculoCard.tsx`
- **Impacto**: Eliminar ~200 linhas de código duplicado
- **Risco**: Médio (verificar se há imports)

### 1.4 tsconfig.json
- **Criar**: `frontend/tsconfig.json` com strict mode
- **Impacto**: Type checking completo
- **Risco**: Médio (pode expor erros existentes)

### 1.5 Corrigir CORS
- **Arquivo**: `backend/api/main.py:19`
- **Alterar**: `allow_origins=["*"]` → `["https://sejais-santo.vercel.app", "http://localhost:5173"]`
- **Impacto**: Segurança
- **Risco**: Baixo

### 1.6 Corrigir JWT verification
- **Arquivo**: `backend/api/main.py:61`
- **Alterar**: `get_unverified_claims()` → `supabase.auth.get_user(token)`
- **Impacto**: Segurança
- **Risco**: Médio

### 1.7 Corrigir paleta de cores litúrgicas
- **Arquivos**: `app/LiturgicalThemeManager.tsx`, `utils/LiturgicalCalendar.ts`
- **Impacto**: UX (Tempo Comum deve ser verde, não marrom)
- **Risco**: Baixo

### 1.8 Substituir alert() por toasts
- **Arquivos**: `FeatureCard.tsx`, `VersiculoList.tsx`, `VerseOrganizer.tsx`, `App.tsx`
- **Impacto**: UX (sonner já instalado)
- **Risco**: Baixo

### 1.9 Remover SVG velvet filter
- **Arquivo**: `app/App.tsx:40-58`
- **Impacto**: Performance (GPU filter removido)
- **Risco**: Baixo
