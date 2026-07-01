# Guia de Migração — Projeto Original para Arquitetura Híbrida

> **Versão:** 2.0.0
> **Data:** 30/06/2026
> **Propósito:** Documentar todas as decisões, transformações e aprendizados da migração do Sejais Santo original para a arquitetura híbrida atual.

---

## 1. Contexto

### 1.1 Projetos Originais

Existiam dois projetos independentes:

| Projeto | Stack | Estado |
|---------|-------|--------|
| **ATUAL** (`sejais-santo ATUAL/`) | React + TypeScript + FastAPI + Supabase | Em produção, mas com dívida técnica |
| **NOVA VERSÃO** (`Sejais santo e BD Nova versão/`) | Laravel + Blade + MySQL | Em desenvolvimento, não publicado |

### 1.2 Problemas Identificados

**Projeto ATUAL:**
- Dependência externa frágil (`bible-api.com`) — quedas frequentes quebravam a Bíblia
- Regras de negócio duplicadas entre frontend e backend
- 399 dependências npm (alta superfície de ataque)
- shadcn/ui inchado (48 componentes, usava apenas 2)
- Sem testes automatizados
- CORS aberto
- JWT não assinado
- `alert()` para notificações
- Paleta de cores inconsistente

**Projeto NOVA VERSÃO:**
- Laravel pesado para o porte do projeto
- MySQL sem FTS em português
- Interface não responsiva
- Componentes de qualidade, mas presos ao ecossistema PHP

### 1.3 Decisão Estratégica

Em vez de escolher um dos projetos ou migrar totalmente para Laravel, optou-se por:

> **Arquitetura Híbrida:** Manter React + FastAPI + Supabase como base, extraindo do Laravel os componentes de qualidade, lógicas de negócio bem implementadas e regras de domínio.

**Motivos:**
- Vercel tem suporte nativo a React + Python (Laravel não)
- FastAPI é mais leve que Laravel para APIs
- Equipe tem mais proficiência em TypeScript/Python que PHP
- Dados já estavam no Supabase (migrar para MySQL seria retrocesso)

---

## 2. Plano de Migração

O plano foi dividido em **sprints**, cada uma com entregas claras e validação antes de prosseguir.

```
Sprint 0 ──→ Sprint 1 ──→ Sprint 2 ──→ Sprint 3 ──→ Sprint 4.1 ──→ Sprint 4.2 ──→ RC1 ──→ Sprint 4.3
(infra)     (cleanup)    (gospel)     (liturgia)   (bíblia)      (PWA)         (audit) (NEW_UI)
```

---

## 3. Sprint 0 — Infraestrutura

### Objetivo
Preparar o terreno para as mudanças sem quebrar o que funciona.

### Ações
- **Feature flags** (`config/features.ts`): todas as novas funcionalidades protegidas por flags
- **tsconfig**: strict mode, path alias `@/`
- **Docs**: `BIBLE_ARCHITECTURE.md`, `RC1_AUDIT.md` planejados

### Decisões
- Toda nova funcionalidade começa atrás de uma flag
- Remoção de código legado é uma etapa separada (nunca na mesma sprint da adição)

---

## 4. Sprint 1 — Cleanup

### Objetivo
Reduzir a superfície de ataque e padronizar o código existente.

### Dependências
```diff
- 399 pacotes npm
+ 195 pacotes npm  (-51%)
```

### shadcn/ui
```diff
- 48 componentes
+ 2 componentes (sonner + utils)
```

### Segurança
- CORS restrito a `localhost:5173` e `localhost:4173`
- JWT passou a ser assinado com `SUPABASE_JWT_SECRET` (HS256)
- Removido `alert()` e `console.log` — substituído por `sonner` (toast)

### Design
- Paleta verde corrigida (era `#4CAF50`, passou para `#1a5c2a`)
- Fonte Playfair Display + Inter definidas como padrão

### Lições Aprendidas
- `npx depcheck` é essencial para identificar dependências mortas
- shadcn/ui pode ser importado seletivamente (não precisa do CLI inteiro)

---

## 5. Sprint 2 — Gospel Cache + Bible Navigation

### Objetivo
Eliminar a dependência de `bible-api.com` para o evangelho do dia.

### Ações
- Cache gospel no Supabase (`daily_gospel` table)
- Navegador bíblico com 73 livros (`BibleNavigation.tsx`)
- Feature flags ativadas: `GOSPEL_CACHE`, `BIBLE_NAVIGATION`, `FIXED_LITURGICAL_COLORS`

### Fluxo Gospel
```
Requisição → FastAPI consulta Supabase → Se existe, retorna → Se não, busca fonte externa → Salva no cache → Retorna
```

### Decisões
- Cache com `upsert` por data (não duplica registros)
- Metadados litúrgicos opcionais (season, cycle, week, pericope)
- Fallback externo mantido para dados não cacheados

---

## 6. Sprint 3 — Engine Litúrgica

### Objetivo
Portar toda a lógica litúrgica do Laravel (Nova Versão) para Python.

### Portados do Laravel
| Arquivo PHP | Destino Python | Observação |
|-------------|----------------|------------|
| `LiturgicalCalendar.php` | `liturgical_lib.py` | Ciclos A/B/C, cores, solenidades |
| `SaintsCalendar.php` | `saints_calendar.py` | 90+ santos com feriabilidade |
| `LiturgicalColorService.php` | `liturgical_lib.py` | Cor separada para Batismo do Senhor |
| `lectionary.php` | `lectionary_data.py` | ~170 entries do Lecionário Dominical |

### Correções Pós-Porte
- **14 pericopes incorretas** em `lectionary_data.py` — identificadas por diff manual
- `liturgical_color()` usa `baptism_of_lord_color()` separada (match exato com `LiturgicalColorService`)
- `upcoming_saints()` retorna `MM-DD` (não datetime)
- Schema `daily_gospel` expandido com colunas litúrgicas

### Lições Aprendidas
- Algoritmos litúrgicos têm particularidades (Ano B/C têm diferenças do A)
- A Páscoa calculada computacionalmente precisa de validação cruzada com tabelas eclesiásticas
- O port de PHP para Python não é 1:1 — Python não tem `DateTimeImmutable`, `match` expression é diferente

---

## 7. Sprint 4.1 — Bíblia Local + Full Text Search

### Objetivo
Eliminar completamente a dependência de `bible-api.com` para leitura bíblica.

### Schema Relacional
```sql
bible_versions (1) ──→ bible_books (N) ──→ bible_chapters (N) ──→ bible_verses (N)
```

### Dados Importados
- 73 livros (46 AT + 27 NT)
- 1.334 capítulos
- 35.450 versículos
- Index GIN para Full Text Search em português

### Parser de Referência
Gramática formal: `[Livro] [capítulo] [,] [versículo] [- [versículo]] [texto extra]`

```
Exemplos:
  Jo 3,16         → João, capítulo 3, versículo 16
  Gn 1,1-5        → Gênesis, capítulo 1, versículos 1 a 5
  Sl 23           → Salmos, capítulo 23 (apenas livro + capítulo)
  1Cor 13,1-13    → 1 Coríntios, capítulo 13, versículos 1 a 13
  amor de deus    → Full Text Search (sem match de livro)
```

- **79 testes** (79/79 passando)
- **Benchmark**: 62 µs/op parse_reference, 1,17 ms/op search_verses
- **ABBREV_MAP**: 45 abreviações → disparam book-only
- **FULLNAME_MAP**: 80+ nomes completos → só resolvem slug

### Endpoints
| Rota | Funcionalidade |
|------|----------------|
| `GET /api/bible/books` | Listar livros |
| `GET /api/bible/{slug}/{chapter}` | Capítulo com navegação |
| `GET /api/bible/{slug}/{chapter}/{verse}` | Versículo único |
| `GET /api/bible/search?q=...` | Busca unificada |

### Decisões
- **Schema relacional** em vez de JSONB: preparado para múltiplas traduções futuras
- **View `vw_bible_verses`**: simplifica queries no Supabase Client
- **Import batch de 500**: evita timeout do Supabase
- **ABBREV_MAP + FULLNAME_MAP separados**: full names não disparam book-only

---

## 8. Sprint 4.2 — PWA + Service Worker

### Objetivo
Transformar o Sejais Santo em um Progressive Web App instalável.

### Ações
- `public/manifest.webmanifest` — nome, ícones, `display: standalone`
- `public/sw.js` — Service Worker manual com 3 estratégias:
  - **Cache First**: `/api/bible/*` (30 dias) — Bíblia offline
  - **Stale-While-Revalidate**: `/api/gospel/*`, `/api/liturgical/*` (7 dias) — dados litúrgicos sempre atuais
  - **Network First**: navegação (fallback para HTML)
- `main.tsx` — registro com `skipWaiting()` + `clients.claim()`
- `public/icons/icon.svg` — ícone da cruz verde

### Desafios
- **Workbox incompatível com Node v24** — decisão de fazer SW manual
- **Sem precache de assets** — sem Workbox, não há precache automático de JS/CSS
- **Cache de navegação pode falhar** — Network First sem fallback HTML completo para SPA

### Decisões
- SW registrado com `onload` (não bloqueia renderização inicial)
- Cache de imagens e Google Fonts adicionados para performance

---

## 9. RC1 Audit

### Objetivo
Validar se a arquitetura está pronta para produção antes da nova interface.

### Metodologia
Análise estática de: bundle, acessibilidade, SEO, segurança, testes, PWA, feature flags, dívida técnica.

### Resultados
| Camada | Status |
|--------|--------|
| Backend APIs | ✅ Aprovado |
| Liturgical Engine | ✅ Aprovado |
| Bible Search & FTS | ✅ Aprovado |
| Banco de Dados | ⚠️ Ressalvas (RLS ausente) |
| PWA | ✅ Aprovado |
| Bundle / Performance | ⚠️ Ressalvas (imagens pesadas) |
| Segurança | ⚠️ Ressalvas (RLS ausente) |
| Testes | ⚠️ Ressalvas (só bible_search) |
| Acessibilidade | ❌ Reprovado |
| SEO | ❌ Reprovado |

### Itens Críticos Resolvidos
1. **Imagens**: `biblePaperImage2.webp` 3,4 MB → 132 KB (com ffmpeg, resize 1920px, quality 75)
2. **RLS**: migration `sql/enable_rls_policies.sql` para todas as 7 tabelas
3. **Service Role**: backend atualizado para usar `SUPABASE_SERVICE_KEY` em escritas

### Lições Aprendidas
- Separar auditoria de infraestrutura do redesign de interface foi acertado
- O relatório serviu como check-list para a Sprint 4.3

---

## 10. Sprint 4.3 — NEW_UI + SEO + WCAG

### Objetivo
Modernizar a interface sem alterar regras de negócio nem arquitetura.

### Design System
Criado `styles/design-tokens.css` com:
- **Cores**: brand verde, litúrgico vermelho, dourado, neutro, semântico
- **Tipografia**: Playfair Display (títulos) + Inter (corpo), escala 1.125
- **Espaçamento**: escala 4px (`--space-0` a `--space-24`)
- **Bordas**: escala de raio (none a full)
- **Sombras**: 6 níveis (sm, md, lg, xl, 2xl, inner)
- **Transições**: 150ms, 200ms, 300ms com easings

### SEO
- `<link rel="canonical">` apontando para `https://sejais-santo.com/`
- Open Graph completo (og:type, og:url, og:title, og:description, og:image)
- Twitter Cards (summary_large_image)
- JSON-LD Structured Data (WebSite + SearchAction)
- Preconnect para Google Fonts
- `<meta name="robots" content="index, follow">`

### Acessibilidade
| WCAG | Problema | Solução |
|------|----------|---------|
| 1.1.1 | Imagens sem alt descritivo | Alt texts específicos |
| 1.4.3 | Contraste `#f5c500` + white | Cor alterada para `#c8960f` |
| 2.4.3 | Foco não gerenciado em modais | Focus trap com useRef + useEffect |
| 2.4.7 | `outline: none` removido | `focus-visible` com outline gold |
| 4.1.2 | Botões sem aria-label | Todos os botões com aria-label |
| 4.1.2 | Landmarks HTML ausentes | `<nav>`, `<article>`, `role` attributes |

### Componentes Modernizados
- **Header**: nav semântico, design tokens, focus-visible
- **Footer**: grid responsivo, acessibilidade, design tokens
- **FeatureCard**: `article` semântico, aria-labels, `aria-hidden` em ícones decorativos
- **SobreModal**: focus management, `role="dialog"`, `aria-modal`, fechar com Escape
- **LiturgicalFooter**: contraste corrigido, animações consistentes
- **App.css**: dead code removido, design tokens, animações via tokens

---

## 11. Arquivos Criados/Modificados

### Novos Arquivos
```
frontend/src/styles/design-tokens.css    — Design System
frontend/public/sw.js                     — Service Worker
frontend/public/manifest.webmanifest      — PWA Manifest
frontend/public/icons/icon.svg            — Ícone PWA
sql/enable_rls_policies.sql               — RLS Migration
sql/create_bible_schema.sql               — Schema Bíblia
scripts/import_bible.py                   — Import de dados
docs/BIBLE_ARCHITECTURE.md               — Docs Bíblia
docs/RC1_AUDIT.md                        — Auditoria RC1
tests/test_bible_search.py               — 79 testes
backend/api/bible.py                     — Router Bíblia
backend/api/bible_repository.py          — Data Access Layer
backend/api/bible_search.py              — Parser + FTS
backend/api/saints_calendar.py           — 90+ santos
backend/api/lectionary_data.py           — ~170 entries
```

### Arquivos Removidos
```
frontend/src/styles/app.css              — Dead code
```

### Arquivos Substancialmente Modificados
```
frontend/index.html                       — SEO + PWA tags
frontend/src/main.tsx                     — SW registration
frontend/src/styles/theme.css             — Clean Tailwind artifacts
frontend/src/styles/index.css             — Design tokens import
frontend/src/app/components/Header.tsx    — +Acessibilidade +tokens
frontend/src/app/components/Footer.tsx    — +Acessibilidade +tokens
frontend/src/app/components/FeatureCard.tsx — +Semântica +tokens
frontend/src/app/components/SobreModal.tsx — +Focus trap
frontend/src/app/components/GospelCard.tsx   — +Focus visible
frontend/src/app/components/BibleSearch.tsx  — +Focus visible
frontend/src/app/components/LiturgicalFooter.tsx — +Contraste +tokens
frontend/src/app/App.css                  — +tokens +responsive
backend/api/supabase_client.py            — +Service role
backend/api/gospel_cache.py               — Service role writes
backend/api/bible_cache.py                — Service role writes
backend/api/liturgical_lib.py             — Sprint 3 + correções
backend/api/main.py                       — +Routers
```

---

## 12. Métricas de Migração

### Código
| Métrica | Antes | Depois | Variação |
|---------|-------|--------|----------|
| Dependências npm | 399 | 195 | **-51%** |
| Componentes shadcn/ui | 48 | 2 | **-96%** |
| Testes backend | 0 | 79 | **+79** |
| Testes frontend | 0 | 0 | — |
| Arquivos SQL | 4 | 6 | **+50%** |
| Scripts Python | ~5 | ~10 | **+100%** |

### Bundle
| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| Bundle total | 8.376 KB | 4.707 KB | **-44%** |
| Imagens | 6.797 KB | 3.095 KB | **-54%** |
| JS moderno (gzip) | 94 KB | 94 KB | estável |

### Segurança
| Métrica | Antes | Depois |
|---------|-------|--------|
| npm audit (vulns) | Presentes | **0** |
| CORS | Aberto | **Restrito** |
| JWT | Sem assinatura | **HS256** |
| RLS | Ausente | **7 tabelas** |
| Service Role | Ausente | **Implementado** |

### Banco de Dados
| Métrica | Antes | Depois |
|---------|-------|--------|
| Tabelas | ~5 | ~10 |
| Versículos | 0 (API externa) | 35.450 |
| FTS | ❌ | ✅ GIN index |
| RLS | ❌ | ✅ 7 tabelas |

---

## 13. Decisões Técnicas Comentadas

### Por que schema relacional e não JSONB?
JSONB é flexível, mas impossibilita FTS eficiente, índices por coluna, e consultas like `WHERE book = 'João'`. O schema relacional prepara o terreno para:
- Múltiplas traduções
- Consultas complexas (ex.: "todos os versículos com 'amor' em João")
- Integridade referencial (FKs evitam dados órfãos)

### Por que PWA manual e não Workbox?
Workbox (v7) depende de `@rollup/plugin-node-resolve` que não é compatível com Node v24. A incompatibilidade é no `off-main-thread` resolver. A decisão foi:
1. Tentar Workbox + vite-plugin-pwa → falhou
2. Tentar `@trickfilm400/rollup-plugin-off-main-thread` → falhou
3. **Fazer SW manual** → funcionou

### Por que remover Tailwind?
O Tailwind v4 estava gerando conflitos com as personalizações litúrgicas dinâmicas (via `LiturgicalThemeManager`). O `@apply` com `@theme` não funcionava corretamente com variáveis CSS calculadas em runtime. A decisão foi migrar para CSS puro com custom properties.

### Por que parser de regex e não NLP?
Regex é deterministico (62 µs/op), testável (79 testes), e a gramática bíblica portuguesa é suficientemente regular para ser capturada por regex. NLP adicionaria complexidade e latência sem benefício real.

### Por que service_role e não anon key para escritas?
A anon key é pública (exposta no frontend). Qualquer um poderia escrever no `daily_gospel` se a policy permitisse. Com `service_role`:
- A chave fica apenas no backend
- As policies SQL restringem escritas a `service_role`
- O frontend nunca tem acesso de escrita

---

## 14. Fluxo de Dados Atual

```
Usuário ──→ Browser ──→ React SPA ──→ FastAPI ──→ Supabase
                                ↓                      ↓
                           Service Worker         PostgreSQL + FTS
                           (Cache First)          (RLS + service_role)
                                ↓
                           Cache (bible-v1)
                           (30 dias)
```

### Requisição Típica (Bíblia)
```
1. User digita "Jo 3,16" no BibleSearch
2. React envia GET /api/bible/search?q=Jo+3,16
3. FastAPI bible_search.py:
   a. Regex separa livro="Jo", capítulo=3, versículo=16
   b. ABBREV_MAP resolve Jo → joão
   c. bible_repository.py busca no Supabase (vw_bible_verses)
4. Supabase retorna o versículo
5. Service Worker cacheia a resposta (cache-first)
6. React renderiza o resultado
```

### Requisição Típica (Liturgia)
```
1. React renderiza LiturgicalFooter
2. LiturgicalThemeManager injeta variáveis CSS sazonais
3. Se ADVANCED_LITURGICAL_CALENDAR ativo:
   a. GET /liturgical/today → cor, ciclo, semana
   b. GET /liturgical/saints → santos do dia
4. Service Worker serve stale-while-revalidate
5. React renderiza badges sazonais + cores
```

---

## 15. Verificação Pós-Migração

### Checklist para Validar a Migração

- [x] `npm run build` — sem erros
- [x] `npm audit` — 0 vulnerabilidades
- [x] Backend inicia sem erros (`python -m api.main`)
- [x] Testes passam (`pytest` — 79/79)
- [x] PWA manifest carrega (`/manifest.webmanifest`)
- [x] Service Worker registra (`/sw.js`)
- [x] RLS migration executável (`sql/enable_rls_policies.sql`)
- [x] SEO tags presentes (curl + grep)
- [x] Imagens comprimidas (< 300 KB cada)

---

## 16. Troubleshooting Comum

### "SUPABASE_SERVICE_KEY not configured"
O backend precisa da service role key para escrever no banco.
```bash
# .env
SUPABASE_SERVICE_KEY=eyJ...  # service_role key
```

### "Bible search retorna vazio para nomes completos"
Full names (ex.: "Romanos") usam `FULLNAME_MAP`, que **não** dispara book-only. Se quiser buscar apenas o livro, use abreviação curta (ex.: "Rm").

### "Service Worker não atualiza"
O SW usa `skipWaiting()` + `clients.claim()`, mas o navegador pode manter o SW antigo em cache. Force atualização com:
1. Abra DevTools → Application → Service Workers
2. Clique "Update" ou "Unregister"
3. Recarregue a página

### "Build falha com erro de memória"
O Vite pode consumir muita memória com imagens grandes. As imagens já foram comprimidas, mas se adicionar novas:
```bash
# Windows
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## 17. Referências

- `docs/BIBLE_ARCHITECTURE.md` — Documentação detalhada do schema bíblico, endpoints e parser
- `docs/RC1_AUDIT.md` — Relatório completo da auditoria RC1
- `sql/enable_rls_policies.sql` — Migration de RLS
- `sql/create_bible_schema.sql` — Schema relacional da Bíblia
- `frontend/src/styles/design-tokens.css` — Design System tokens
- `frontend/public/sw.js` — Service Worker runtime caching

---

## 18. Glossário

| Termo | Significado |
|-------|-------------|
| **ABBREV_MAP** | Mapa de abreviações curtas (ex.: "Jo" → "joão") que disparam book-only |
| **FULLNAME_MAP** | Mapa de nomes completos (ex.: "Romanos" → "romanos") que só resolvem slug |
| **FTS** | Full Text Search — busca textual indexada com GIN no PostgreSQL |
| **RLS** | Row Level Security — políticas de acesso por linha no Supabase |
| **Service Role** | Chave de backend com permissões elevadas no Supabase |
| **Workbox** | Biblioteca Google para Service Workers (incompatível com Node v24) |
| **Lectionary** | Conjunto de leituras bíblicas para cada domingo e solenidade |
| **Pericope** | Trecho bíblico específico (ex.: "Jo 3,14-21") |
