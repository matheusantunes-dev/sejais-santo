# Release Notes — Sejais Santo 2.0.0

> **Data:** 30/06/2026
> **Propósito:** Release 2.0.0 — Arquitetura consolidada, nova interface, PWA, acessibilidade e SEO

---

## Resumo Executivo

O Sejais Santo passou por uma reestruturação completa do zero ao topo. O que começou como uma aplicação com dependências externas frágeis (`bible-api.com`), regras de negócio espalhadas entre frontend e backend, e baixa padronização, tornou-se uma plataforma com:

- **Arquitetura híbrida** (React + TypeScript + FastAPI + Supabase), aproveitando o melhor dos dois projetos originais
- **Backend com bíblia local** (35.450 versículos com Full Text Search em português)
- **Engine litúrgica completa** (ciclos A/B/C, cores, santos, lecionário)
- **PWA progressivo** com Service Worker offline
- **Design System** próprio com tokens de cor, tipografia e espaçamento
- **Zero vulnerabilidades** de segurança
- **Release Candidate 1 aprovado** antes da nova interface

---

## Principais Mudanças Arquiteturais

### Antes (v1.x)
```
bible-api.com (externo, frágil)
    ↕
React SPA (regras de negócio no frontend)
    ↕
FastAPI (endpoints mínimos)
    ↕
Supabase (tabelas soltas, sem RLS)
```

### Depois (v2.0.0)
```
FastAPI (toda regra de negócio)
  ├── /api/bible/*    — Bíblia local (FTS + parser)
  ├── /api/gospel     — Gospel cache + fallback
  ├── /liturgical/*   — Ciclos, cores, santos
  └── /verses         — CRUD com RLS + service_role
        ↕
Supabase (schema normalizado, RLS ativo)
  ├── bible_versions → bible_books → bible_chapters → bible_verses
  ├── daily_gospel (cache com metadados litúrgicos)
  └── verses (protegido por auth.uid())
        ↕
React SPA (só renderiza dados)
  ├── Design System próprio
  ├── PWA + Service Worker
  ├── SEO completo
  └── WCAG parcial
```

### Decisões-Chave

| Decisão | Motivo |
|---------|--------|
| **Manter React+FastAPI** em vez de migrar para Laravel | Vercel tem suporte nativo; Laravel adicionaria complexidade sem benefício ao usuário final |
| **Backend como única fonte de verdade** | Evita duplicação de lógica (ex.: cor litúrgica calculada apenas no backend) |
| **Bíblia local em vez de API externa** | Elimina dependência de terceiros, permite FTS, offline via PWA |
| **Parser de referência com regex** (Jo 3,16 → Gn 1,1-5) | 62 µs/op, 79 testes, gramática documentada |
| **PWA manual sem Workbox** | Workbox incompatível com Node v24 |
| **Design System em CSS puro** | Tailwind removido por conflito com personalizações litúrgicas |

---

## Novas Funcionalidades

### Bíblia Completa (Sprint 4.1)
- **73 livros**, 1.334 capítulos, 35.450 versículos — dados importados no Supabase
- **Busca unificada**: parser de referência (`Jo 3,16`) + Full Text Search (`amor de deus`) + book-only (`Romanos`)
- **Navegação bíblica**: capítulo anterior/próximo, breadcrumb
- **ABBREV_MAP + FULLNAME_MAP** separados (full names não disparam book-only, caem em FTS)

### Engine Litúrgica (Sprint 3)
- **Ciclos A/B/C** completos (A validado, B e C implementados)
- **Cores litúrgicas** por data (roxo, verde, vermelho, branco, rosa)
- **90+ santos** no calendário com feriabilidade
- **Lecionário Dominical** (~170 entries)
- **Batismo do Senhor** com cor separada

### PWA (Sprint 4.2)
- **Manifest** com `display: standalone`, tema verde `#1a5c2a`
- **Service Worker** com 3 estratégias de cache:
  - Cache First: `/api/bible/*` (30 dias)
  - Stale-While-Revalidate: `/api/gospel/*`, `/api/liturgical/*` (7 dias)
  - Network First: navegação
- **Registro automático** com `skipWaiting()` + `clients.claim()`

---

## Melhorias de Performance

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| Bundle total | **8.376 KB** | **4.707 KB** | **-44%** |
| `biblePaperImage2.webp` | 3.419 KB | 132 KB | **-96%** |
| Imagens totais | 6.797 KB | 3.095 KB | **-54%** |
| JS moderno (gzip) | 94 KB | 94 KB | estável |
| FCP estimado | ~2-3s | ~1.5-2s | ~30% |
| LCP estimado | ~4-6s | ~2-3s | ~50% |
| Dependências totais | 399 | 195 | **-51%** |

### Principais Ações
- Compressão de todas as imagens .webp (ffmpeg, qualidade 75, resize 1920px)
- Remoção de dependências não utilizadas (195 vs 399 originais)
- shadcn/ui reduzido de 48 para 2 arquivos
- Code splitting disponível para BibleSearch e BibleNavigation

---

## Melhorias de Segurança

| Item | v1.x | v2.0.0 |
|------|------|--------|
| npm audit | Vulnerabilidades | **0 vulnerabilidades** |
| Vite | 6.3.5 | **6.4.3** (fix path traversal) |
| CORS | Aberto | **Restrito** a origins conhecidas |
| JWT | Plaintext | **HS256** com `SUPABASE_JWT_SECRET` |
| RLS | ❌ Ausente | ✅ **Ativo** em 7 tabelas |
| Service Role | ❌ Não usado | ✅ **Usado** para escritas no banco |
| Alert/console.log | Presente | ✅ **Removido** (substituído por sonner) |

### Políticas RLS Implementadas
- **Tabelas bíblicas** (versions, books, chapters, verses): leitura pública, escrita service_role
- **daily_gospel**: leitura pública, escrita service_role
- **verses** (conteúdo do usuário): acesso por `auth.uid()` — cada usuário vê apenas seus próprios versículos
- **bible_cache** (legado): leitura pública, escrita service_role

---

## Melhorias de UX/UI

### Design System (novo)
- **Tokens de cor**: paleta brand (verde), litúrgico (vermelho), dourado, neutro, semântico
- **Tipografia**: Playfair Display (títulos) + Inter (corpo)
- **Escala de espaçamento**: 4px grid (`--space-0` a `--space-24`)
- **Sombras**: 6 níveis (sm, md, lg, xl, 2xl, inner)
- **Bordas**: escala de raio (none a full)
- **Transições**: tokens consistentes (150ms, 200ms, 300ms)

### Componentes Modernizados
- **Header**: design tokens, `role="banner"`, nav semântico, foco visível, imagens com dimensões
- **Footer**: grid responsivo, 3 colunas, glow effects, backdrop-filter, acessibilidade
- **FeatureCards**: `article` semântico, hover elevado, botões com ícones
- **Modais**: foco gerenciado, `role="dialog"` + `aria-modal`, fechar com Escape
- **LiturgicalFooter**: cards sazonais com overlay escuro, animação, active state

### Responsividade
- Cards grid: 1 col (mobile) → 3 col (tablet+)
- Footer: 3 col (desktop) → 1 col (mobile)
- Header: login responsivo (texto curto em mobile)
- Modais: 90% width com max-width

---

## Melhorias de Acessibilidade (WCAG)

| Critério | Antes | Depois |
|----------|-------|--------|
| **1.1.1** (imagens sem alt) | ❌ Imagens sem descrição | ✅ Alt texts específicos |
| **1.4.3** (contraste) | ❌ `#f5c500` + white text | ✅ `#c8960f` (AA compliant) |
| **2.1.1** (teclado) | ❌ `div` como botão sem role | ✅ `button` nativo |
| **2.4.3** (foco em modais) | ❌ Sem gerenciamento | ✅ Focus trap + retorno |
| **2.4.7** (foco visível) | ❌ `outline: none` | ✅ `focus-visible` com outline gold |
| **3.3.2** (labels) | ❌ Inputs sem label | ✅ labels + aria-labels |
| **4.1.2** (aria-label) | ❌ 21+ botões sem nome | ✅ Todos os botões com aria-label |
| **4.1.2** (landmarks) | ❌ Sem `<nav>`, `<article>` | ✅ HTML semântico |

---

## Melhorias de SEO/PWA

### SEO
| Tag | v1.x | v2.0.0 |
|-----|------|--------|
| `<title>` | Sim | ✅ Aprimorado |
| `<meta description>` | Sim | ✅ Aprimorado |
| `<link rel="canonical">` | ❌ | ✅ `https://sejais-santo.com/` |
| Open Graph | ❌ | ✅ og:type, url, title, description, image, locale |
| Twitter Cards | ❌ | ✅ summary_large_image |
| JSON-LD | ❌ | ✅ WebSite + SearchAction |
| `<meta name="robots">` | ❌ | ✅ index, follow |
| `<link rel="preconnect">` | ❌ | ✅ Google Fonts |
| `<html lang="pt-BR">` | Sim | ✅ Mantido |

### PWA
| Item | v1.x | v2.0.0 |
|------|------|--------|
| Manifest | ❌ | ✅ `manifest.webmanifest` |
| Service Worker | ❌ | ✅ 3 estratégias de cache |
| Ícones | ❌ | ✅ SVG (cruz verde) |
| Apple meta tags | ❌ | ✅ apple-mobile-web-app |
| Offline | ❌ | ✅ Parcial (cache-first Bible API) |

---

## Mudanças de Banco de Dados

### Schema Relacional
```sql
-- Novo (substitui bible_cache.jsonb)
bible_versions → bible_books → bible_chapters → bible_verses
                                         └── search_vector (GIN index para FTS)
Views: vw_bible_verses, vw_bible_chapters
```

### Tabelas
| Tabela | Ação | Detalhes |
|--------|------|----------|
| `bible_versions` | **Criada** | Preparada para múltiplas traduções |
| `bible_books` | **Criada** | 73 livros (46 AT + 27 NT) |
| `bible_chapters` | **Criada** | 1.334 capítulos |
| `bible_verses` | **Criada** | 35.450 versos, FTS GIN index |
| `daily_gospel` | **Modificada** | +8 colunas litúrgicas |
| `verses` | **Modificada** | +user_id, +RLS |
| `bible_cache` | **Legado** | A ser removida |

### Views
- `vw_bible_verses` — junta verses + chapters + books para queries simplificadas
- `vw_bible_chapters` — junta chapters + books com metadados

### RLS
- Migration `sql/enable_rls_policies.sql` — policies para todas as 7 tabelas
- Escritas via `service_role` (backend), leitura pública

---

## Mudanças de API

### Novos Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/bible/books` | Lista livros (filtro `?testament=AT\|NT`) |
| GET | `/api/bible/{slug}/{chapter}` | Capítulo com navegação prev/next |
| GET | `/api/bible/{slug}/{chapter}/{verse}` | Versículo único |
| GET | `/api/bible/search?q=...` | Busca unificada (referência + FTS + book-only) |
| GET | `/liturgical/today` | Dia litúrgico (cor, ciclo, semana, pericope) |
| GET | `/liturgical/color` | Cor litúrgica do dia |
| GET | `/liturgical/saints` | Santos do dia (today + upcoming 5) |
| GET | `/gospel` | Evangelho do dia (cache + fallback externo) |
| GET | `/verses` | Listar versículos do usuário (auth) |
| POST | `/verses` | Criar versículo (auth) |
| DELETE | `/verses/{id}` | Deletar versículo (auth) |

### Endpoints Modificados
- **Nenhum endpoint foi removido.** Todos os endpoints v1.x continuam funcionando.
- `GET /gospel` agora retorna metadados litúrgicos adicionais (se aplicável)

---

## Breaking Changes

### ⚠️ Remoção de Dependência Externa
- **`bible-api.com`** não é mais usado como fonte primária. A bíblia agora é servida localmente via Supabase + FastAPI.
- Se você dependia da API externa para algum integrador, o comportamento local pode diferir em casos extremos (diferenças textuais entre traduções).

### ⚠️ Service Role Key Necessária
- O backend agora exige `SUPABASE_SERVICE_KEY` no `.env` para operações de escrita no banco (gospel cache, bible cache).
- Adicione ao seu ambiente: `SUPABASE_SERVICE_KEY=eyJ...` (service_role key do Supabase)

### ⚠️ CORS Restrito
- O CORS agora exige origens explícitas. Adicione seu domínio de produção ao `backend/api/main.py` se necessário.

### ✅ Sem Breaking Changes de Dados
- Nenhuma tabela existente foi removida ou renomeada
- `bible_cache` continua funcionando (legado, será removida no Sprint 5)
- Todos os dados de usuário (verses) foram preservados

---

## Roadmap Sugerido — Versão 2.1.0

### Curto Prazo (Sprint 5)
- [ ] Remover `bible_cache` legado (tabela + código + SQL)
- [ ] Remover dead feature flags: `GOSPEL_CACHE`, `NEW_UI`, `FIXED_LITURGICAL_COLORS`
- [ ] Remover `VersododiaModal` legado (usa bible-api.com)
- [ ] Remover `GoogleOAuthProvider` e `clientId` mortos do `main.tsx`
- [ ] Adicionar teste para liturgical engine (ciclos A/B/C, cores, santos)
- [ ] Adicionar teste para gospel cache
- [ ] Adicionar teste para bible API endpoints

### Médio Prazo
- [ ] Rate limiting no backend (proteção contra abuso)
- [ ] Remover legacy polyfill (1,1 MB) se IE11 não for requisito
- [ ] Code splitting: BibleSearch + BibleNavigation carregados sob demanda
- [ ] Lazy loading de imagens de background
- [ ] Testes frontend (componentes + integração)
- [ ] Múltiplas traduções bíblicas (NVI, KJV)
- [ ] Cache gospel em background (cron job)

### Longo Prazo
- [ ] Dashboard admin para dados litúrgicos
- [ ] Testes end-to-end
- [ ] Serviço de orações / meditações guiadas
- [ ] App mobile nativo (React Native)
- [ ] Service Worker com precache total (quando Workbox for compatível com Node v24+)

---

## Agradecimentos

Esta versão não seria possível sem o trabalho de:

- **Matheus Antunes** — arquitetura, backend, bíblia, liturgia, testes, documentação
- **Fred Joaquim** — frontend, design, PWA, componentes, SEO

---

*"Tudo o que fizerdes, fazei-o de todo o coração, como para o Senhor, e não para os homens." — Colossenses 3:23*
