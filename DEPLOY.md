# Guia de Deploy — Sejais Santo 2.0.0

> **Versão:** 2.0.0  
> **Data:** 30/06/2026  
> **Propósito:** Guia completo e reproduzível para deploy em produção, do zero ao DNS.

---

## Índice

1. [Arquitetura de Deploy](#1-arquitetura-de-deploy)
2. [Pré-requisitos](#2-pré-requisitos)
3. [GitLab — Organização de Branches e Release](#3-gitlab--organização-de-branches-e-release)
4. [Supabase — Database e Auth](#4-supabase--database-e-auth)
5. [Google OAuth — Console Cloud](#5-google-oauth--console-cloud)
6. [Variáveis de Ambiente](#6-variáveis-de-ambiente)
7. [Deploy do Frontend (Vercel)](#7-deploy-do-frontend-vercel)
8. [Deploy do Backend (Railway)](#8-deploy-do-backend-railway)
9. [Integração Frontend ↔ Backend](#9-integração-frontend--backend)
10. [Domínio e DNS](#10-domínio-e-dns)
11. [Testes Pós-Deploy](#11-testes-pós-deploy)
12. [Rollback](#12-rollback)
13. [Release Oficial v2.0.0](#13-release-oficial-v200)
14. [Manutenção Contínua](#14-manutenção-contínua)
15. [Apêndice: Comandos Rápidos](#15-apêndice-comandos-rápidos)

---

## 1. Arquitetura de Deploy

```
                    ┌─────────────────────┐
                    │     Cloudflare       │  (DNS + SSL opcional)
                    │   sejais-santo.com   │
                    └────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────┐ ┌──────────────┐
     │   Vercel     │ │ Railway  │ │   Supabase   │
     │  (Frontend)  │ │ (Backend)│ │  (Database)  │
     │              │ │          │ │              │
     │  React SPA   │ │ FastAPI  │ │ PostgreSQL   │
     │  PWA + SW    │ │ Uvicorn  │ │ Auth + RLS   │
     │  Static      │ │ Gospel   │ │ Storage      │
     └──────────────┘ └──────────┘ └──────────────┘
```

### Justificativa das Escolhas

| Serviço | Por quê? |
|---------|----------|
| **Vercel** (Frontend) | CDN global, HTTPS automático, deploy por git, preview deployments, suporte nativo a Vite/React, generous free tier ($0), custom domains com SSL |
| **Railway** (Backend) | Native FastAPI/Uvicorn, deploy por git, env vars gerenciadas, free tier com $5 crédito/mês, HTTPS incluso, sleep automático (economia) |
| **Supabase** (Banco) | Já está em uso, PostgreSQL gerenciado, Auth integrado, RLS nativo, Storage, SQL Editor |

### Alternativas Caso Railway Não Atenda

| Serviço | Diferença |
|---------|-----------|
| **Render** | Mais maduro, sem sleep no paid tier, deploy via git, suporte a FastAPI. Requer `render.yaml` ou dashboard |
| **Fly.io** | Mais barato que Railway em escala, requer Dockerfile, mais complexo |
| **DigitalOcean App Platform** | Mais caro, mas com SLA. Requer Dockerfile |

Este guia usa **Railway como padrão** e **Render como alternativa** quando relevante.

---

## 2. Pré-requisitos

### 2.1 Contas Necessárias

| Serviço | Link | Plano |
|---------|------|-------|
| GitLab | https://gitlab.com | Free |
| Vercel | https://vercel.com | Free (Hobby) |
| Railway | https://railway.app | Free (Developer) |
| Supabase | https://supabase.com | Free (Project) |
| Google Cloud Console | https://console.cloud.google.com | Free (OAuth consent) |

### 2.2 Ferramentas Locais

```bash
# Verificar instalações
git --version         # >= 2.40
node --version        # >= 20
npm --version         # >= 9
python --version      # >= 3.12

# CLI Railway (opcional, mas útil)
npm install -g @railway/cli

# CLI Vercel (opcional)
npm install -g vercel

# GitLab CLI (opcional)
# https://gitlab.com/gitlab-org/cli
```

### 2.3 Acesso ao Projeto

```bash
# Clone (se ainda não tiver local)
git clone https://gitlab.com/seu-usuario/sejais-santo.git
cd sejais-santo

# Verificar remote
git remote -v
# origin  https://gitlab.com/seu-usuario/sejais-santo.git (fetch)
# origin  https://gitlab.com/seu-usuario/sejais-santo.git (push)
```

---

## 3. GitLab — Organização de Branches e Release

### 3.1 Estrutura de Branches

```
main                 ← produção (protegida, apenas merge)
  └── develop        ← integração (pré-produção)
       ├── feat/*    ← funcionalidades novas
       ├── fix/*     ← correções
       └── chore/*   ← manutenção (deps, config)
```

### 3.2 Configuração Inicial

```bash
# 1. Renomear branch principal para main (se ainda estiver como master)
git branch -M main

# 2. Criar branch de desenvolvimento
git checkout -b develop
git push -u origin develop

# 3. Proteger branch main no GitLab:
#    Settings → Repository → Protected Branches
#    - Branch: main
#    - Allowed to merge: Maintainers
#    - Allowed to push: No one (apenas merge request)

# 4. Voltar para main
git checkout main
```

### 3.3 Fluxo de Desenvolvimento

```bash
# Iniciar funcionalidade
git checkout develop
git checkout -b feat/nova-funcionalidade
# ... trabalhar ...
git add .
git commit -m "feat: descrição da funcionalidade"
git push -u origin feat/nova-funcionalidade

# Criar Merge Request no GitLab: feat/* → develop
# Após aprovação:

# De develop para main (release)
git checkout main
git merge develop --no-ff
git tag -a v2.0.0 -m "Release 2.0.0"
git push origin main --tags
```

### 3.4 Criando a Tag v2.0.0

```bash
# Certifique-se de estar na main com tudo commitado
git checkout main
git pull origin main

# Verificar log
git log --oneline -5

# Criar tag assinada (recomendado) ou leve
git tag -a v2.0.0 -m "Release 2.0.0 — Arquitetura consolidada, PWA, SEO, acessibilidade"

# Enviar tag
git push origin v2.0.0
```

### 3.5 Criando Release no GitLab

1. Acesse: **GitLab → seu-projeto → Deployments → Releases**
2. Clique **"New Release"**
3. Preencha:
   - **Tag name:** `v2.0.0`
   - **Release title:** `Sejais Santo 2.0.0`
   - **Release notes:** Cole o conteúdo de `RELEASE_NOTES_2.0.0.md`
   - **Milestone:** (crie se quiser) `v2.0.0`
4. Clique **"Create release"**

### 3.6 CHANGELOG.md

Crie na raiz do projeto:

```bash
cat > CHANGELOG.md << 'EOF'
# Changelog

## [2.0.0] — 2026-06-30

### Arquitetura
- Schema relacional completo da Bíblia (73 livros, 35.450 versículos)
- Engine litúrgica portada do Laravel (ciclos A/B/C, cores, santos, lecionário)
- Full Text Search com índice GIN em português
- Parser de referência bíblica com 79 testes (regex, 62 µs/op)
- PWA com Service Worker manual (3 estratégias de cache)
- RLS policies em todas as 7 tabelas do Supabase
- Backend com service_role para operações de escrita

### Funcionalidades
- Navegador bíblico com 73 livros, capítulos e versículos
- Busca unificada: referência (Jo 3,16) + FTS (amor de deus) + book-only (Romanos)
- Calendário litúrgico com estações, cores e santos do dia
- Cache do evangelho com fallback externo
- CRUD de versículos do usuário com autenticação
- PWA instalável com cache offline da Bíblia

### Performance
- Bundle total: 8.376 KB → 4.707 KB (-44%)
- biblePaperImage2.webp: 3.419 KB → 132 KB (-96%)
- Dependências: 399 → 195 (-51%)
- shadcn/ui: 48 → 2 componentes

### Segurança
- 0 vulnerabilidades npm audit (Vite 6.4.3)
- CORS restrito a origins conhecidas
- JWT assinado com HS256
- RLS em todas as tabelas (menor privilégio)
- Service role key para backend

### UX/UI
- Design System com tokens (cores, tipografia, espaçamento, sombras)
- Header, Footer, FeatureCards, Modais modernizados
- Responsividade aprimorada (mobile-first)

### Acessibilidade (WCAG)
- Contraste corrigido (#f5c500 → #c8960f)
- Focus management em modais (focus trap + return)
- outline:none removido (focus-visible com gold)
- aria-labels em todos os botões
- HTML semântico (nav, article, header, footer)

### SEO
- Canonical, Open Graph, Twitter Cards
- JSON-LD Structured Data
- Preconnect para Google Fonts

### Dependências
- Vite 6.3.5 → 6.4.3 (segurança)
- Removidos 204 pacotes não utilizados
- @vitejs/plugin-legacy mantido (Chrome 50+)

### Breaking Changes
- bible-api.com não é mais fonte primária (usar API local)
- SUPABASE_SERVICE_KEY necessária no backend
- CORS agora exige origens explícitas

### Documentação
- RELEASE_NOTES_2.0.0.md
- MIGRATION.md
- DEPLOY.md (este documento)
- BIBLE_ARCHITECTURE.md
- RC1_AUDIT.md

## [1.0.0] — Versão anterior (não documentada)
EOF

git add CHANGELOG.md
git commit -m "docs: add CHANGELOG.md for v2.0.0"
git push origin main
```

---

## 4. Supabase — Database e Auth

### 4.1 Criar Projeto no Supabase

1. Acesse https://supabase.com → **New project**
2. Preencha:
   - **Name:** `sejais-santo`
   - **Database Password:** (guarde em cofre)
   - **Region:** `South America (São Paulo)` — menor latência para público BR
   - **Pricing Plan:** Free
3. Clique **"Create new project"**
4. Aguarde ~2 minutos para provisionamento

### 4.2 Obter Credenciais

No dashboard do projeto:

```
Project Settings → API:
  - Project URL:             https://xxxxxxxxxxxx.supabase.co
  - anon public key:         eyJhbGciOiJIUzI1NiIs...
  - service_role key:        eyJhbGciOiJIUzI1NiIs... (GUARDE COM SEGURANÇA)
  - JWT Secret:              (Project Settings → API → JWT Settings)
```

> **⚠️ CRÍTICO:** A `service_role key` tem acesso total ao banco. **Nunca** compartilhe ou exponha no frontend. Use apenas no backend.

### 4.3 Executar Migrations SQL

1. No Supabase Dashboard, vá para **SQL Editor**
2. Execute **em ordem** cada arquivo de `sql/`:

```sql
-- 1. Schema da Bíblia
-- Conteúdo de: sql/create_bible_schema.sql
-- Cria: bible_versions, bible_books, bible_chapters, bible_verses
-- Cria: vw_bible_verses, vw_bible_chapters
-- Cria: triggers de updated_at
-- Cria: índice GIN para FTS

-- 2. Tabela de versículos do usuário
-- Conteúdo de: sql/create_verses_table.sql
-- Cria: verses (id, text, note, author_email, author_id, scheduled_at, raw)

-- 3. Tabela de cache do evangelho
-- Conteúdo de: sql/create_daily_gospel_table.sql
-- Cria: daily_gospel

-- 4. Colunas litúrgicas no daily_gospel
-- Conteúdo de: sql/update_daily_gospel_table.sql
-- Adiciona: liturgical_season, sunday_cycle, ferial_cycle, etc.

-- 5. Tabela bible_cache (legado)
-- Conteúdo de: sql/create_bible_cache_table.sql
-- Cria: bible_cache

-- 6. RLS Policies (deve vir por último)
-- Conteúdo de: sql/enable_rls_policies.sql
-- Aplica RLS em todas as tabelas
```

> **Dica:** Você pode executar todos os SQLs de uma vez copiando e colando cada arquivo em sequência. Separe por comentários.

### 4.4 Importar Dados da Bíblia (One-Time)

Este passo popula as 35.450 linhas de versículos. Execute localmente ou de um ambiente com acesso ao Supabase.

```bash
# 1. Garantir dependências Python
cd backend
pip install -r requirements.txt

# 2. Configurar .env com service_role
cat > .env << 'EOF'
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # service_role key
EOF

# 3. Executar import
cd ..
python scripts/import_bible.py

# Saída esperada:
# Creating bible version 'ave-maria'...
# Version ave-maria created (id=1)
# Importing 73 books...
# 73 books imported
# Importing chapters (batch 500)...
# 1334 chapters imported
# Importing verses (batch 500)...
# 35450 verses imported
# Done!
```

> **Possível erro:** `ModuleNotFoundError: No module named 'api'`  
> **Solução:** Execute da raiz do projeto (`sejais-santo ATUAL/`), não de `scripts/`.

### 4.5 Verificar Dados no Supabase

Vá para **Supabase Dashboard → Table Editor** e confira:

| Tabela | Linhas Esperadas |
|--------|------------------|
| `bible_versions` | 1 |
| `bible_books` | 73 |
| `bible_chapters` | 1.334 |
| `bible_verses` | 35.450 |
| `daily_gospel` | 0 (será populado pelo backend) |

### 4.6 Autenticação — Configurar Google OAuth

1. Vá para **Supabase Dashboard → Authentication → Providers**
2. Habilite **"Google"**
3. Deixe os campos **Client ID** e **Client Secret** em branco por enquanto
4. Anote a **Redirect URL** que o Supabase exibe (ex: `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`)

Voltaremos a esta etapa após configurar o Google Cloud Console.

---

## 5. Google OAuth — Console Cloud

### 5.1 Criar Projeto no Google Cloud

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ou selecione existente): **"Sejais Santo"**
3. Navegue para **APIs & Services → OAuth consent screen**
4. Escolha **"External"** (usuários Google com qualquer email)
5. Preencha:
   - **App name:** `Sejais Santo`
   - **User support email:** seu email
   - **Developer contact:** seu email
6. **Scopes:** mantenha o padrão (`.../auth/userinfo.email`, `.../auth/userinfo.profile`)
7. **Test users:** deixe vazio (ou adicione emails para teste)
8. Publique o app (mude de "Testing" para "In production")

### 5.2 Criar Credenciais OAuth 2.0

1. **APIs & Services → Credentials**
2. Clique **"+ Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Application type:** "Web application"
4. **Name:** "Sejais Santo Web"
5. **Authorized JavaScript origins:**

```
http://localhost:5173              (desenvolvimento)
https://sejais-santo.com           (produção — ajuste para seu domínio)
https://sejais-santo.vercel.app    (produção — preview Vercel)
```

6. **Authorized redirect URIs:**

```
http://localhost:5173              (desenvolvimento)
https://sejais-santo.com           (produção)
https://xxxxxxxxxxxx.supabase.co/auth/v1/callback   (Supabase Auth callback)
```

7. Clique **"Create"**
8. Anote o **Client ID** e **Client Secret** gerados

### 5.3 Configurar no Supabase

1. Volte para **Supabase Dashboard → Authentication → Providers → Google**
2. Preencha:
   - **Client ID:** (copiado do Google Cloud)
   - **Client Secret:** (copiado do Google Cloud)
3. Salve

### 5.4 Configurar no Frontend

A variável `VITE_GOOGLE_CLIENT_ID` deve apontar para o Client ID do Google.

```bash
# frontend/.env (local dev)
VITE_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

> **Nota:** No Vercel, esta variável será configurada via dashboard.

---

## 6. Variáveis de Ambiente

### 6.1 Frontend (Vercel)

| Variável | Onde obter | Exemplo |
|----------|------------|---------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `eyJhbGciOiJI...` |
| `VITE_API_URL` | URL do backend após deploy no Railway | `https://sejais-santo-api.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → Client ID | `123456789-xxxxx.apps.googleusercontent.com` |

### 6.2 Backend (Railway)

| Variável | Onde obter | Exemplo |
|----------|------------|---------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | `https://xxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `eyJhbGciOiJI...` |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Settings → API → service_role | `eyJhbGciOiJI...` |
| `SUPABASE_JWT_SECRET` | Supabase Dashboard → Settings → API → JWT Settings | `secret-key-aqui` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → Client ID | `123456789-xxxxx.apps.googleusercontent.com` |

### 6.3 Onde Configurar Cada Uma

| Variável | Local Dev (.env) | Vercel (Dashboard) | Railway (Dashboard) |
|----------|------------------|---------------------|---------------------|
| `VITE_SUPABASE_URL` | `frontend/.env` | ✅ Project Settings → Environment Variables | — |
| `VITE_SUPABASE_ANON_KEY` | `frontend/.env` | ✅ | — |
| `VITE_API_URL` | `frontend/.env` | ✅ | — |
| `VITE_GOOGLE_CLIENT_ID` | `frontend/.env` | ✅ | — |
| `SUPABASE_URL` | `backend/.env` | — | ✅ |
| `SUPABASE_ANON_KEY` | `backend/.env` | — | ✅ |
| `SUPABASE_SERVICE_KEY` | `backend/.env` | — | ✅ |
| `SUPABASE_JWT_SECRET` | `backend/.env` | — | ✅ |
| `GOOGLE_CLIENT_ID` | `backend/.env` | — | ✅ |

### 6.4 Arquivo .env de Referência

**`frontend/.env`** (para desenvolvimento local):
```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

**`backend/.env`** (para desenvolvimento local):
```bash
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_JWT_SECRET=secret-key-aqui
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

---

## 7. Deploy do Frontend (Vercel)

### 7.1 Antes de Enviar — Configurações Obrigatórias

Antes de fazer o deploy, ajuste os seguintes arquivos:

**a) `vite.config.ts` — Habilitar minificação para produção:**
```typescript
build: {
  target: 'es2015',
  minify: 'esbuild',       // ← mude de false para 'esbuild'
}
```

**b) `backend/api/main.py` — Adicionar domínio de produção ao CORS:**
```python
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://sejais-santo.com",            // ← adicione
    "https://sejais-santo.vercel.app",     // ← adicione (preview)
]
```

**c) Verificar `VITE_API_URL` no frontend** — O código atual usa o proxy do Vite (`/api` → `localhost:8000`) em dev. Em produção, o frontend precisa chamar o backend diretamente. Verifique se há código usando `VITE_API_URL`:

```bash
grep -r "VITE_API_URL" frontend/src/
```

Se não houver uso, o frontend está usando caminhos relativos (`/api/...`) que precisam ser proxy reverso ou URL absoluta. Para Vercel, você precisa:

1. No `vite.config.ts`, o proxy só funciona em dev
2. Em produção, defina `VITE_API_URL` para a URL do Railway e use-a nas chamadas

Vamos criar um adaptador:

```typescript
// frontend/src/lib/api.ts — criar este arquivo
const API_BASE = import.meta.env.VITE_API_URL || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
```

```bash
cat > frontend/src/lib/api.ts << 'EOF'
const API_BASE = import.meta.env.VITE_API_URL || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
EOF
```

Depois, atualize os componentes que chamam a API para usar `apiUrl()`.

### 7.2 Fazer o Deploy pelo Git (Recomendado)

#### 7.2.1 Conectar Vercel ao GitLab

1. Acesse https://vercel.com → **Add New → Project**
2. Clique em **"Import Git Repository"**
3. Selecione **GitLab** (pode precisar autorizar)
4. Busque e selecione `seu-usuario/sejais-santo`
5. **Configure Project:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (❗ importante — o projeto está em subdiretório)
   - **Build Command:** `npm run build` (default, mas verifique)
   - **Output Directory:** `dist` (default para Vite)
   - **Install Command:** `npm install`

#### 7.2.2 Configurar Variáveis de Ambiente no Vercel

No mesmo formulário, seção **"Environment Variables"**, adicione:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJI...` |
| `VITE_API_URL` | `https://sejais-santo-api.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | `123456789-xxxxx.apps.googleusercontent.com` |

#### 7.2.3 Deploy

Clique **"Deploy"**. Aguarde o build (~1-2 min).

**Saída esperada:**
```
✓  Build completed.
   Installing...
   Running build...
   ✓  Build completed in 45s
   Deploying...
   ✓  Production: https://sejais-santo.vercel.app
```

### 7.3 Verificar Preview

A Vercel gera uma URL de preview automaticamente: `https://sejais-santo.vercel.app`

Antes de configurar o domínio, teste:
1. A aplicação abre (sem erros no console)
2. O PWA manifest carrega (`/manifest.webmanifest`)
3. O Service Worker registra (`/sw.js`)
4. As chamadas para `/api/bible/*` funcionam (ajuste CORS e VITE_API_URL)

### 7.4 Domínio Personalizado

Após configurar o domínio (seção 10), vá para:

**Vercel Dashboard → seu-projeto → Settings → Domains**

Adicione `sejais-santo.com` (ou seu domínio). A Vercel fornecerá um registro CNAME ou DNS para configurar.

### 7.5 Configurar HTTPS

A Vercel fornece SSL automático (Let's Encrypt) assim que o domínio é configurado. Nenhuma ação manual é necessária.

---

## 8. Deploy do Backend (Railway)

### 8.1 Preparar o Projeto

O backend precisa de alguns arquivos de configuração para o Railway. Crie-os:

**a) `backend/requirements.txt`** (já existe, verificar se está completo):
```
fastapi
uvicorn[standard]
python-dotenv
supabase
google-auth
requests
python-multipart
python-jose[cryptography]
```

**b) `backend/nixpacks.toml`** (instruções para o build do Railway/Nixpacks):
```toml
# backend/nixpacks.toml
[phases.setup]
nixPkgs = ["python311", "gcc", "libffi", "openssl"]

[start]
cmd = "uvicorn api.main:app --host 0.0.0.0 --port $PORT"
```

**c) `backend/Procfile`** (alternativa para Railway — usado caso o Nixpacks não detecte):
```
web: uvicorn api.main:app --host 0.0.0.0 --port $PORT
```

> **Nota:** Railway usa `$PORT` (variável de ambiente definida automaticamente).

### 8.2 Fazer o Deploy

#### 8.2.1 Conectar Railway ao GitLab

1. Acesse https://railway.app → **New Project**
2. Clique **"Deploy from GitHub repo"** (Railway não tem integração direta com GitLab)
3. Selecione **"Configure GitHub App"** e autorize o acesso ao repositório

**Alternativa (Deploy via Railway CLI — funciona com GitLab):**

```bash
# 1. Instalar Railway CLI (se não tiver)
npm install -g @railway/cli

# 2. Login
railway login

# 3. Iniciar projeto
cd backend
railway init

# 4. Vincular ao repositório GitLab
#    Railway perguntará o nome do projeto. Crie um novo.

# 5. Fazer deploy
railway up

# 6. Abrir no dashboard
railway open
```

#### 8.2.2 Configurar Root Directory

No Railway Dashboard, o build precisa ser configurado para usar `backend/` como diretório raiz:

1. **Railway Dashboard → Project Settings → Deploy**
2. **Root Directory:** `backend`
3. **Build Command:** deixe vazio (Railway detecta automaticamente)
4. **Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

#### 8.2.3 Configurar Variáveis de Ambiente

No Railway Dashboard → **Variables**, adicione:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJI...` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJI...` |
| `SUPABASE_JWT_SECRET` | `secret-key-aqui` |
| `GOOGLE_CLIENT_ID` | `123456789-xxxxx.apps.googleusercontent.com` |

#### 8.2.4 Deploy

Após configurar as variáveis, o Railway automaticamente fará o build e deploy.

**Saída esperada:**
```
✓ Build started
  Installing pip dependencies...
  Collecting fastapi...
  Successfully installed...
✓ Build completed
✓ Deploy started
  Starting uvicorn api.main:app --host 0.0.0.0 --port 8080
✓ Deploy ready
  URL: https://sejais-santo-api.up.railway.app
```

### 8.3 Verificar o Backend

```bash
# Health check
curl https://sejais-santo-api.up.railway.app/

# Resposta esperada:
# {"status":"alive, ok"}
```

### 8.4 Logs

Para acompanhar os logs em tempo real:

```bash
railway logs
```

Ou acesse o **Railway Dashboard → Deployments → (último deploy) → Logs**.

### 8.5 Alternativa: Deploy no Render

Caso Railway não atenda:

1. Crie conta em https://render.com
2. **New → Web Service**
3. Conecte ao GitLab
4. Config:
   - **Name:** `sejais-santo-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. Adicione as mesmas env vars do Railway
6. **Deploy**

---

## 9. Integração Frontend ↔ Backend

### 9.1 O Que Precisa Ser Alterado

Após ambos os deploys, estes são os valores que conectam as peças:

| Configuração | Onde | Valor |
|-------------|------|-------|
| `VITE_API_URL` | Vercel (env var) | `https://sejais-santo-api.up.railway.app` |
| CORS origins | `backend/api/main.py` | Incluir `https://sejais-santo.vercel.app` e `https://sejais-santo.com` |
| Redirect URI Google | Google Cloud Console | Incluir `https://sejais-santo.com` |

### 9.2 Testar a Integração

Após configurar tudo, teste sequencialmente:

```bash
# 1. Health check do backend
curl https://sejais-santo-api.up.railway.app/
# → {"status":"alive, ok"}

# 2. Livros da Bíblia
curl https://sejais-santo-api.up.railway.app/api/bible/books
# → [{"slug":"genesis","name":"Gênesis",...}, ...]

# 3. Capítulo
curl https://sejais-santo-api.up.railway.app/api/bible/joao/3
# → {"book":...,"chapter":3,"verses":[...],"nav":{"prev":...,"next":...}}

# 4. Busca
curl "https://sejais-santo-api.up.railway.app/api/bible/search?q=Jo+3,16"
# → {"type":"reference","result":[...]}

# 5. Liturgia
curl https://sejais-santo-api.up.railway.app/liturgical/today
# → {"date":"...","season":"Tempo Comum","color":"green",...}

# 6. Gospel
curl https://sejais-santo-api.up.railway.app/gospel
# → {"cached":true/false,"leituras":{...},"liturgical":{...}}
```

### 9.3 CORS — Debug

Se as chamadas falharem com erro de CORS no navegador:

1. Verifique se o domínio está na lista `origins` em `backend/api/main.py`
2. Se estiver usando `https://sejais-santo.vercel.app` (preview), adicione também
3. Faça o deploy novamente do backend após alterar
4. Teste com curl para confirmar que o header `Access-Control-Allow-Origin` está presente:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://sejais-santo.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://sejais-santo-api.up.railway.app/api/bible/books

# Deve conter:
# access-control-allow-origin: https://sejais-santo.vercel.app
```

---

## 10. Domínio e DNS

### 10.1 Cenário: Domínio Próprio (sejais-santo.com)

Assumindo que você possui `sejais-santo.com` registrado em algum provedor (GoDaddy, Registro.br, Cloudflare, etc.).

### 10.2 Configuração DNS

#### Opção 1: Vercel Nameservers (Recomendado)

A Vercel gerencia DNS automaticamente.

1. **Vercel Dashboard → seu-projeto → Settings → Domains**
2. Adicione `sejais-santo.com`
3. A Vercel exibirá os nameservers para apontar:

```
dns1.vercel-dns.com
dns2.vercel-dns.com
```

4. No seu provedor de domínio, altere os nameservers para os da Vercel
5. Aguarde propagação (pode levar até 48h, geralmente 1-2h)
6. A Vercel configurará SSL automaticamente

#### Opção 2: Cloudflare (Proxy + CDN)

Se usar Cloudflare como proxy:

1. Adicione o domínio ao Cloudflare
2. **DNS → Records:**

| Type | Name | Content |
|------|------|---------|
| CNAME | `@` | `sejais-santo.vercel.app` |
| CNAME | `www` | `sejais-santo.vercel.app` |

3. Cloudflare: ative o proxy (laranja) para proteção DDoS e CDN
4. SSL/TLS → **Full (strict)**
5. Na Vercel, adicione o domínio normalmente

#### Opção 3: Backend em Subdomínio

Se quiser separar frontend e backend:

| Type | Name | Content |
|------|------|---------|
| CNAME | `@` | `sejais-santo.vercel.app` |
| CNAME | `api` | `sejais-santo-api.up.railway.app` |

Neste caso, o backend ficaria em `https://api.sejais-santo.com`.

Atualize `VITE_API_URL` no Vercel para `https://api.sejais-santo.com`.

### 10.3 SSL

- **Vercel:** SSL automático (Let's Encrypt) para todos os domínios configurados
- **Railway:** SSL automático (`*.up.railway.app`)
- **Domínio próprio:** SSL automático se configurado via Vercel ou Cloudflare

### 10.4 Verificar DNS

```bash
# Verificar propagação
nslookup sejais-santo.com
dig sejais-santo.com +short

# Verificar SSL
curl -I https://sejais-santo.com
# Deve retornar 200 OK com Strict-Transport-Security
```

---

## 11. Testes Pós-Deploy

### 11.1 Checklist de Verificação

Após o deploy completo, execute **cada item** sequencialmente:

| # | Teste | Como Testar | Critério de Sucesso |
|---|-------|-------------|---------------------|
| 1 | **Aplicação abre** | Acessar `https://sejais-santo.com` | Página carrega sem erros no console |
| 2 | **HTTPS** | Verificar cadeado no navegador | SSL válido, sem warnings |
| 3 | **Responsividade** | Redimensionar navegador (mobile/tablet/desktop) | Layout adapta sem quebras |
| 4 | **Evangelho do dia** | Card "Evangelho do Dia" carrega | Referência + texto visíveis |
| 5 | **Bíblia — navegação** | Clicar "Abrir a Bíblia" → navegar por livro/capítulo | Versículos carregam, navegação prev/next funciona |
| 6 | **Bíblia — busca** | Buscar "Jo 3,16" e "amor de deus" | Referência + FTS retornam resultados |
| 7 | **Liturgia — cor** | Verificar cor do dia no footer | Cor corresponde ao período litúrgico |
| 8 | **Liturgia — santos** | Verificar widget de santos | Santo do dia + próximos exibidos |
| 9 | **Login Google** | Clicar "Entrar com Google" | Fluxo OAuth completo, retorna à página |
| 10 | **Versículos (auth)** | Após login, criar versículo | Aparece na lista do usuário |
| 11 | **PWA — manifest** | DevTools → Application → Manifest | Manifest carrega com dados corretos |
| 12 | **PWA — Service Worker** | DevTools → Application → Service Workers | SW ativo, cache populado |
| 13 | **PWA — instalável** | Navegador deve exibir "Adicionar à tela inicial" | Prompt de instalação aparece |
| 14 | **Cache Bible** | Fazer request bíblico, verificar cache | DevTools → Network → `(from service worker)` |
| 15 | **SEO — Open Graph** | Compartilhar link no WhatsApp/Telegram | Preview com título, descrição, imagem |
| 16 | **SEO — JSON-LD** | `curl https://sejais-santo.com \| grep -o '<script type="application/ld+json">.*</script>'` | Script JSON-LD presente |
| 17 | **Lighthouse** | DevTools → Lighthouse → Generate report | Performance ≥ 80, SEO ≥ 90, A11y ≥ 80 |
| 18 | **404** | Acessar `https://sejais-santo.com/pagina-inexistente` | SPA trata rota (não cai em 404 do servidor) |
| 19 | **Rollback test** | Git revert + redeploy | Versão anterior volta ao ar |

### 11.2 Ferramentas para Teste

```bash
# SEO / OG tags
curl -s https://sejais-santo.com | grep -E "og:|twitter:|canonical|description|title"

# Headers HTTP
curl -I https://sejais-santo.com

# Service Worker
curl -I https://sejais-santo.com/sw.js

# PWA manifest
curl -s https://sejais-santo.com/manifest.webmanifest | python -m json.tool

# Performance (Lighthouse via CLI)
npm install -g lighthouse
lighthouse https://sejais-santo.com --output=html --output-path=./lighthouse-report.html
```

### 11.3 Possíveis Erros e Soluções

| Erro | Causa Provável | Solução |
|------|----------------|---------|
| `ERR_CONNECTION_REFUSED` | Backend não está rodando | Verificar Railway Dashboard → Deployments |
| `CORS header missing` | Domínio não listado em `origins` | Adicionar ao `main.py` e redeploy |
| `401 Unauthorized` | JWT secret incorreto | Verificar `SUPABASE_JWT_SECRET` no Railway |
| `Failed to fetch` | `VITE_API_URL` incorreta | Verificar env var no Vercel |
| `Service Worker not registering` | HTTPS obrigatório para SW | Verificar SSL (não funciona em HTTP) |
| `Blank page` | Erro no build do frontend | Verificar Vercel Deploy Logs |
| `404 on page reload` | SPA sem fallback | Configurar `vercel.json` com rewrites |

**Solução para 404 em SPA (Vercel):**

Crie `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 12. Rollback

### 12.1 Rollback no Vercel (Frontend)

**Automático (mais rápido):**
1. **Vercel Dashboard → Deployments**
2. Identifique o deploy anterior (funcional)
3. Clique nos **três pontos (...)** → **"Promote to Production"**

**Via Git (recomendado para mudanças complexas):**
```bash
# 1. Identificar o commit anterior funcional
git log --oneline -10

# 2. Reverter o merge (se foi um merge de develop para main)
git revert -m 1 HEAD
# ou para um commit específico:
git revert <commit-hash>

# 3. Forçar push
git push origin main

# 4. Vercel detecta o push e faz deploy automático
```

### 12.2 Rollback no Railway (Backend)

**Automático:**
1. **Railway Dashboard → Deployments**
2. Encontre o deploy estável anterior
3. Clique nos **três pontos (...)** → **"Redeploy"**

**Via Git:**
```bash
# Mesmo processo do frontend — reverter commit e push
git revert HEAD
git push origin main
```

### 12.3 Rollback no Supabase (Banco)

O Supabase Free não tem point-in-time recovery. Estratégias:

1. **Antes de migrations destrutivas:** faça backup manual via **Database → Backup**
2. **Para dados:** mantenha uma tabela de `_deleted` ou soft-delete
3. **Para schema:** migrations são versionadas em `sql/` — basta reexecutar a migration anterior

**Procedimento de emergência (caso algo quebre):**
```sql
-- 1. Identificar a última migration segura
-- 2. Reverter via SQL Editor (se possível)
-- 3. Ou recriar tabelas a partir do SQL salvo
-- 4. Reimportar dados do backup
```

### 12.4 Script de Rollback Completo

```bash
#!/bin/bash
# rollback.sh — Reverte frontend + backend para tag anterior

TAG="${1:-v1.0.0}"  # default: v1.0.0

echo "⚠️  Revertendo para $TAG..."

# 1. Verificar se tag existe
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "❌ Tag $TAG não encontrada"
    exit 1
fi

# 2. Reverter para a tag
git checkout "$TAG"

# 3. Forçar push (cuidado: reescreve histórico!)
# git push --force origin main

echo "✅ Pronto. Faça o push com: git push --force origin main"
echo "   Vercel e Railway farão deploy automático."
```

---

## 13. Release Oficial v2.0.0

### 13.1 Checklist Pré-Release

- [ ] Código completo e testado localmente
- [ ] `npm run build` sem erros
- [ ] `npm audit` — 0 vulnerabilidades
- [ ] Testes backend passando (`pytest` — 79/79)
- [ ] Variáveis de ambiente configuradas em Vercel e Railway
- [ ] Domínio configurado e SSL ativo
- [ ] Google OAuth configurado com redirect URIs de produção
- [ ] CORS atualizado com domínio de produção
- [ ] RLS policies executadas no Supabase
- [ ] Dados bíblicos importados no Supabase
- [ ] CHANGELOG.md atualizado
- [ ] Tag `v2.0.0` criada e enviada
- [ ] Release criada no GitLab
- [ ] Checklist de testes pós-deploy executado

### 13.2 Comandos Finais

```bash
# 1. Garantir que está na main
git checkout main
git pull origin main

# 2. Última verificação
npm run build --prefix frontend
cd backend && pytest && cd ..
npm audit --prefix frontend

# 3. Criar tag
git tag -a v2.0.0 -m "Release 2.0.0 — Arquitetura consolidada, PWA, SEO, acessibilidade"

# 4. Enviar
git push origin main --tags

# 5. Criar Release no GitLab (via web ou CLI)
# GitLab CLI:
# glab release create v2.0.0 \
#   --name "Sejais Santo 2.0.0" \
#   --notes-file RELEASE_NOTES_2.0.0.md
```

### 13.3 Pós-Release

- [ ] Monitorar logs do Railway nas primeiras 24h
- [ ] Verificar erros no console do Vercel
- [ ] Coletar feedback dos primeiros usuários
- [ ] Executar Lighthouse semanalmente
- [ ] Manter `CHANGELOG.md` atualizado

---

## 14. Manutenção Contínua

### 14.1 Atualizações de Dependências

```bash
# Mensalmente:
cd frontend
npx npm-check-updates -u
npm install
npm audit
npm run build

# Se tudo ok:
git add package.json package-lock.json
git commit -m "chore(deps): update dependencies"
```

### 14.2 Backup do Banco

Semanalmente (ou antes de migrations destrutivas):

1. **Supabase Dashboard → Database → Backups**
2. Clique **"Create backup"** (Free tier: apenas schema, sem dados)
3. Para dados: use `pg_dump` se tiver acesso direto ao PostgreSQL

### 14.3 Monitoramento

| Ferramenta | O Que Monitorar | Gratuita? |
|------------|----------------|-----------|
| Vercel Analytics | Performance, erros, tráfego | Sim (Hobby) |
| Railway Dashboard | Uso de CPU/RAM, uptime | Sim |
| Supabase Dashboard | Uso do banco, tráfego, erros | Sim |
| Google Search Console | SEO, indexação, erros | Sim |
| PageSpeed Insights | Performance, acessibilidade | Sim |

### 14.4 Próximos Passos (v2.1.0)

Ver `RELEASE_NOTES_2.0.0.md` → Roadmap Sugerido.

---

## 15. Apêndice: Comandos Rápidos

### 15.1 Deploy Completo (do zero)

```bash
# 1. Git
git checkout -b main
git push -u origin main

# 2. Supabase (manual via dashboard)
# - Criar projeto
# - Executar SQL migrations
# - Importar Bíblia (scripts/import_bible.py)
# - Configurar Google OAuth

# 3. Frontend (Vercel — via dashboard)
# - Importar projeto
# - Root: frontend
# - Envs: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL, VITE_GOOGLE_CLIENT_ID
# - Deploy

# 4. Backend (Railway — via dashboard ou CLI)
# railway init
# railway up
# Envs: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, SUPABASE_JWT_SECRET, GOOGLE_CLIENT_ID

# 5. Google Cloud Console
# - Authorized origins + redirect URIs
# - Client ID → Supabase + Vercel envs

# 6. Domínio (Vercel)
# - Adicionar domínio
# - Configurar DNS

# 7. Testar (curl + navegador)
```

### 15.2 Redeploy Rápido (após alteração)

```bash
# Frontend: push na main → Vercel detecta
git add .
git commit -m "fix: descrição"
git push origin main

# Backend: redeploy via Railway CLI
railway up

# Ou: push na main → Railway detecta
```

### 15.3 Verificar Status

```bash
# Frontend
curl -s https://sejais-santo.com | head -5
curl -sI https://sejais-santo.com | grep "HTTP/"

# Backend
curl -s https://sejais-santo-api.up.railway.app/

# Supabase (via API):
curl -s -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/bible_versions" | head -5

# Logs
railway logs --tail
```

### 15.4 Arquivos de Configuração (Resumo)

```bash
# Criar estes arquivos antes do deploy:

# backend/nixpacks.toml
cat > backend/nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["python311", "gcc", "libffi", "openssl"]

[start]
cmd = "uvicorn api.main:app --host 0.0.0.0 --port $PORT"
EOF

# backend/Procfile
echo "web: uvicorn api.main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile

# frontend/vercel.json (SPA fallback)
cat > frontend/vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF

# frontend/src/lib/api.ts (API URL adapter)
cat > frontend/src/lib/api.ts << 'EOF'
const API_BASE = import.meta.env.VITE_API_URL || "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
EOF
```

---

> **Fim do Guia de Deploy.**  
> Mantenha este documento atualizado a cada nova release.  
> Qualquer dúvida, consulte `MIGRATION.md` para contexto histórico ou `RELEASE_NOTES_2.0.0.md` para o changelog completo.
