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

## 🏗 Arquitetura

O projeto está organizado em uma arquitetura fullstack com separação clara de responsabilidades:

```
sejais-santo/
│
├── backend/
│   └── api/
│       ├── main.py
│       ├── supabase_client.py
│       └── supabase_storage.py
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── context/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── utils/
│   │   └── styles/
│
├── sql/
│   └── create_verses_table.sql
```

Separação por domínio, contexto e responsabilidade.

---

## 🧩 Tecnologias Utilizadas

### Frontend

* React
* TypeScript
* Vite
* PostCSS
* Componentização modular
* Context API
* Supabase Client

### Backend

* Python
* Integração com Supabase
* Manipulação de Storage
* Estrutura modular (`api/`)

### Banco de Dados

* Supabase
* Script SQL próprio para criação da tabela de versículos

---

## 🔐 Autenticação

A autenticação é gerenciada via Supabase:

* Cliente configurado em `frontend/src/lib/`
* Contexto global em `AuthContext.tsx`
* Estrutura pronta para expansão de regras de acesso

---

## 🛠 Configuração do Projeto

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Criar `.env` com base em `.env.sample`.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Criar `.env` com base em `.env.sample`.

---

## 🗄 Banco de Dados

Executar o script:

```
sql/create_verses_table.sql
```

no Supabase para criar a tabela necessária.

---

## 🎯 Objetivo Técnico

Este projeto foi desenvolvido com foco em:

* Evolução de arquitetura fullstack
* Separação de responsabilidades
* Organização de componentes reutilizáveis
* Integração entre frontend e backend
* Controle de estado via Context
* Integração com banco gerenciado

---

## 🚀 Roadmap (Possíveis Evoluções)

* Testes automatizados
* Dockerização
* CI/CD
* Deploy público
* Documentação formal de API
* Melhorias de arquitetura no backend

---

## 🔒 Licença

Este projeto é privado e proprietário.

All Rights Reserved.
Não é permitida cópia, redistribuição, modificação ou uso comercial sem autorização expressa do autor.

© 2026 Matheus Antunes and © Fred Joaquim

---

## 👨‍💻 Autores

**Matheus Antunes e Fred Joaquim**

Desenvolvedores focados em frontend moderno, integração fullstack e organização de arquiteturas.

