# Back-end (Sejais Santo) — GitHub storage

## Instalação local
1. Crie virtualenv e instale deps:
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt


2. Copie `.env.sample` para `.env` e preencha:
- GITHUB_TOKEN (Personal Access Token com scope `repo`)
- GITHUB_REPO (ex: my-org/sejais-data)
- GOOGLE_CLIENT_ID (do Google Cloud OAuth client)
- GITHUB_BRANCH (opcional, default: main)

3. Rode local:
uvicorn main:app --reload --port 8000


## Deploy (Vercel)
- Crie projeto no Vercel apontando para este diretório.
- Adicione Environment Variables no painel do Vercel com os mesmos nomes (GITHUB_TOKEN, GITHUB_REPO, GOOGLE_CLIENT_ID).
- Use `uvicorn main:app --host 0.0.0.0 --port $PORT` se precisar em build steps. (Vercel tem suporte a Python Serverless; confira docs da Vercel para Python functions).

## Observações de segurança
- NÃO comite GITHUB_TOKEN nem .env.
- Restrinja o PAT ao mínimo de permissões (repo) e revogue caso necessário.