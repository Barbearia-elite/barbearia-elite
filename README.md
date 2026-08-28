# Barbearia Elite — Montezuma, MG

Sistema completo de agendamento online para barbearia: site institucional, galeria de cortes, equipe e **agendamento em 5 passos**, com painel administrativo para os barbeiros controlarem a agenda em tempo real.

<p align="center">
  <img src="https://img.shields.io/badge/CI-passing-2ea44f?logo=githubactions&logoColor=white" alt="CI">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-v6-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase">
</p>

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [API](#api)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Deploy em produção](#deploy-em-produção)

---

## Funcionalidades

- **Agendamento online em 5 passos** — profissional, serviço, data/horário e dados do cliente, com confirmação instantânea.
- **Painel administrativo** — login por token para cada barbeiro, com isolamento de agenda (cada um vê só os seus agendamentos).
- **Controle de horários** — cronograma semanal configurável e bloqueio de dias/horários específicos.
- **Conflito inteligente** — o sistema considera a duração de cada serviço ("Cabelo & Barba" de 60 min bloqueia faixas adjacentes) e os agendamentos "Qualquer um".
- **Gestão de status** — confirmado, concluído e cancelado, atualizado em um clique.
- **Métricas** — gráficos de agendamentos e faturamento estimado (Recharts).
- **Exportação de agenda** em CSV para o dia.
- **Site institucional** — Home, Sobre, Galeria, Equipe e Localização, com animações e tema escuro.
- **Performance** — carregamento sob demanda (code-splitting por página).

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion, Lucide, Recharts |
| **Backend** | Node.js, Express 5, sessão admin assinada em HMAC-SHA256 (cookie `HttpOnly`) |
| **Banco** | Supabase (PostgreSQL) — acesso exclusivo do servidor via Service Role Key |

## Como rodar localmente

Pré-requisitos: **Node.js 20.11+** e npm.

```bash
npm install
cp .env.example .env   # preencha os valores reais
npm run build          # gera dist/ (frontend + backend)
npm start              # servidor em http://localhost:3000
```

Em desenvolvimento no frontend, use dois terminais:

```bash
npm run dev:web        # Vite dev server (hot reload + proxy /api → :3000)
npm run dev            # backend em :3000 servindo o build atual
```

## Banco de dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Abra o **SQL Editor** e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) — cria as tabelas `bookings`, `blocked_slots` e `settings`.
3. Em **Settings → API**, copie a `Project URL` e as chaves para o seu `.env`.

> **Importante:** a `SUPABASE_SERVICE_ROLE_KEY` (secreta) **nunca** deve ir para o frontend. Todos os acessos ao banco acontecem apenas no `server.ts`. A chave anônima (`VITE_SUPABASE_ANON_KEY`) é pública e usada somente no build do frontend.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `SUPABASE_URL` | sim | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Service Role Key (secreta, apenas no servidor) |
| `SESSION_SECRET` | sim | Segredo para assinar as sessões admin (use algo longo e aleatório) |
| `JOAO_TOKEN` | sim | Token de acesso do João Neto no Portal Admin |
| `CRISTIAN_TOKEN` | sim | Token de acesso do Cristian Mauro no Portal Admin |
| `VITE_SUPABASE_URL` | sim (build) | Mesma URL do projeto, para o build do frontend |
| `VITE_SUPABASE_ANON_KEY` | sim (build) | Anon key pública, para o build do frontend |
| `NODE_ENV` | não | `production` habilita o atributo `secure` do cookie |
| `PORT` | não | Porta do servidor (padrão `3000`) |

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o backend (`tsx server.ts`) |
| `npm run dev:web` | Vite dev server com hot reload |
| `npm run build` | Gera o frontend e o bundle do backend em `dist/` |
| `npm start` | Serve em produção (`node dist/server.cjs`) |
| `npm run lint` | ESLint (zero avisos permitidos) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |

## API

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `POST /api/auth/login` | público | Troca o token de barbeiro por uma sessão admin |
| `GET /api/auth/session` | admin | Valida a sessão atual |
| `POST /api/auth/logout` | admin | Encerra a sessão |
| `GET /api/public/occupied-times` | público | Horários ocupados / dia fechado para data + barbeiro + serviço |
| `POST /api/public/bookings` | público | Cria um agendamento (com honeypot anti-bot) |
| `GET /api/admin/bookings` | admin | Lista agendamentos (isolamento por barbeiro + filtros) |
| `PATCH /api/admin/bookings/:id/status` | admin | Altera o status (confirmado / concluído / cancelado) |
| `GET / PUT /api/admin/schedule-settings` | admin | Lê / atualiza o cronograma semanal |
| `POST /api/admin/blocked-slots` | admin | Bloqueia um dia ou horário |
| `DELETE /api/admin/blocked-slots/:id` | admin | Remove um bloqueio |

Comportamentos implementados no servidor:

- Validação completa dos dados (data real, horário `HH:MM`, telefone e serviço dentro do expediente).
- Conflito por **sobreposição de duração** do serviço, considerando os agendamentos “Qualquer um”.
- Isolamento por barbeiro: cada um vê e gerencia apenas os próprios agendamentos + “Qualquer um”.
- Rate limiting por IP nas rotas sensíveis e honeypot no agendamento público.
- Headers de segurança, `X-Powered-By` desativado e erro 500 genérico (sem expor detalhes internos).

## Estrutura do projeto

```
.
├── src/
│   ├── pages/          Home, About, Gallery, Barbers, Booking, Location, Admin
│   ├── components/     Layout, Logo, PageTransition, AnimatedScissor...
│   └── lib/            auth (sessão), supabase (cliente), theme, businessHours
├── public/             imagens (corte_28.png, joao_42.png, cristiano_50.png)
├── server.ts           API Express + serve do build em produção
├── supabase/
│   └── schema.sql      tabelas bookings, blocked_slots, settings (com RLS)
├── .github/
│   └── workflows/ci.yml  typecheck + lint + build a cada push
└── vite.config.ts
```

## Segurança

- Credenciais geridas **exclusivamente por variáveis de ambiente** — nada de segredos hardcoded no código; o servidor **não inicia** sem elas.
- Acesso ao banco apenas pelo servidor (Service Role Key), com RLS ativada para bloquear a chave anônima.
- Sessões admin assinadas com HMAC-SHA256, expiração de 30 dias e cookie `HttpOnly`.
- Rate limiting por IP e honeypot anti-spam no agendamento público.

## Deploy em produção

O `dist/server.cjs` é um único arquivo Node que serve a API **e** o frontend (com fallback SPA), facilitando o deploy em qualquer PaaS:

- **Build:** `npm install && npm run build`
- **Start:** `npm start`
- **Variáveis:** defina no painel do provedor todas as variáveis da [tabela acima](#variáveis-de-ambiente)

Exemplos de provedores compatíveis: Render, Railway e Vercel (via Adapta/Node).