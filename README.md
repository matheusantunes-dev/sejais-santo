<!-- HEADER -->

<h1 align="center">🙏 Sejais Santo</h1>

<p align="center">
  <strong>Aplicação fullstack para organização e vivência de versículos bíblicos com foco no calendário litúrgico católico.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-blue" />
  <img src="https://img.shields.io/badge/backend-Python-green" />
  <img src="https://img.shields.io/badge/database-Supabase-3FCF8E" />
  <img src="https://img.shields.io/badge/licen%C3%A7a-All%20Rights%20Reserved-red" />
</p>

---

## 📖 Sobre o Projeto

**Sejais Santo** é um projeto pessoal desenvolvido com o objetivo de oferecer uma experiência digital organizada, moderna e visualmente estruturada para leitura e organização de versículos bíblicos, integrando elementos do calendário litúrgico.

O projeto nasceu da combinação entre:

* Desenvolvimento web moderno
* Organização de conteúdo religioso
* Integração com backend e banco gerenciado
* Estrutura pensada para escalabilidade

É um projeto privado e proprietário.

---

## ✨ Funcionalidades Atuais

✔ Exibição de versículos
✔ Organização de versículos
✔ Modal de versículo do dia
✔ Componentes visuais para tempos litúrgicos
✔ Integração com Supabase
✔ Autenticação via contexto global
✔ Separação clara entre frontend e backend

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| `docs/SETUP.md` | Guia de configuração do ambiente |
| `docs/ARCHITECTURE.md` | Arquitetura, fluxo de dados e stack |
| `docs/FUNCTIONAL_MAP.md` | Mapeamento de todas as funcionalidades |
| `docs/file-inventory.md` | Inventário completo de arquivos |
| `docs/backlog-sprint1.md` | Planejamento da Sprint 1 |

---

## 🧩 Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Estilos | Pure CSS + shadcn/ui (Radix) |
| Ícones | Lucide React |
| Backend | Python + FastAPI |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |

---

## 🛠 Configuração Rápida

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (outro terminal)
cd backend
pip install -r requirements.txt
python -m uvicorn api.main:app --port 8000
```

Ambiente funciona com mock Supabase para desenvolvimento (auth e persistência precisam de `.env`).

---

## 🔒 Licença

Este projeto é privado e proprietário.

All Rights Reserved.
Não é permitida cópia, redistribuição, modificação ou uso comercial sem autorização expressa do autor.

© 2026 Matheus Antunes and © Fred Joaquim

## 📄 License
This project is licensed under the MIT License.

---

## 👨‍💻 Autores

**Matheus Antunes, Fred Joaquim e Raimundo Barbosa**

Desenvolvedores focados em frontend moderno, integração fullstack e organização de arquiteturas.

