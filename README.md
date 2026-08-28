# Barbearia Elite

Site completo de agendamento para uma barbearia em Montezuma - MG: página institucional, galeria de cortes, equipe e **agendamento online em 5 passos**, com painel administrativo para os barbeiros.

## Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion (animações), Lucide (ícones), Recharts (métricas)
- **Backend:** Node.js + Express 5 (`server.ts`), sessão admin com token assinado em HMAC-SHA256 (cookie `HttpOnly`)
- **Banco:** Supabase (PostgreSQL) — acesso exclusivo do servidor via Service Role Key
- **Código dividido por páginas** (React.lazy) para carregamento sob demanda

## Como rodar localmente

Pré-requisitos: Node.js **20.11+** e npm.

```bash
npm install
cp .env.example .env       # preencha os valores reais
npm run build              # gera dist/ (frontend + backend)
npm start                  # servidor em http://localhost:3000
```

Em desenvolvimento frontend, use dois terminais:

```bash
npm run dev:web            # Vite dev server (hot reload)
npm run dev                # backend em :3000 servindo o dist/ já buildado
```

## Banco de dados (Supabase)

1. Crie um projeto em https://supabase.com.
2. Abra **SQL Editor** e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) — cria as tabelas `bookings`, `blocked_slots` e `settings`.
3. Em **Settings → API**, copie a `Project URL` e as chaves para o `.env`.

> ⚠️ A `SUPABASE_SERVICE_ROLE_KEY` (secret) **nunca** deve ir para o frontend. Todos os acessos ao banco acontecem no `server.ts`. A chave anônima (`VITE_SUPABASE_ANON_KEY`) é pública e usada apenas no build do frontend.

> ⚠️ O projeto Supabase usava no código original (`juykxghopyduhyfqikaz.supabase.co`) foi **deletado** — ele não resolve mais em DNS. As credenciais antigas apontam para um banco inexistente; por isso o `.env` com um projeto novo é obrigatório.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `SUPABASE_URL` | sim | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Service Role Key (secret, só no servidor) |
| `SESSION_SECRET` | sim | Segredo para assinar sessões admin (use algo longo/aleatório) |
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
| `npm run dev:web` | Vite dev server |
| `npm run build` | Gera o frontend e o bundle do backend em `dist/` |
| `npm run start` | Serve produção (`node dist/server.cjs`) |
| `npm run lint` | ESLint (zero avisos permitidos) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |

## API (resumo)

| Método e rota | Acesso | Descrição |
| --- | --- | --- |
| `POST /api/auth/login` | público | Troca o token de barbeiro por sessão admin |
| `GET /api/auth/session` | admin | Valida a sessão atual |
| `POST /api/auth/logout` | admin | Encerra a sessão |
| `GET /api/public/occupied-times` | público | Horários ocupados/dia fechado para data+barbeiro+serviço |
| `POST /api/public/bookings` | público | Cria um agendamento (com honeypot anti-bot) |
| `GET /api/admin/bookings` | admin | Lista agendamentos (com isolamento por barbeiro) |
| `PATCH /api/admin/bookings/:id/status` | admin | Altera status (confirmado/concluido/cancelado) |
| `GET/PUT /api/admin/schedule-settings` | admin | Lê/atualiza o cronograma semanal |
| `POST /api/admin/blocked-slots` | admin | Bloqueia dia ou horário |
| `DELETE /api/admin/blocked-slots/:id` | admin | Remove um bloqueio |

Principais comportamentos implementados no servidor:

- Validação completa de dados (data real, horário HH:MM, telefone, dentro do expediente).
- **Conflito por sobreposição de duração** (ex.: “Cabelo & Barba” de 60min bloqueia o início e a faixa seguinte), considerando agendamentos `Qualquer um`.
- Isolamento: cada barbeiro vê apenas os próprios agendamentos + `Qualquer um`.
- Rate limiting por IP nas rotas sensíveis e honeypot no agendamento público.
- Headers de segurança, `X-Powered-By` desativado e erro 500 genérico (sem vazar detalhes).

## Estrutura

```
src/
  pages/          Home, About, Gallery, Barbers, Booking, Location, Admin
  components/     Layout, Logo, PageTransition, AnimatedScissor...
  lib/            auth (sessão), supabase (cliente), theme, businessHours
server.ts         API + serve do dist/ em produção
supabase/schema.sql
public/           imagens (corte_28.png, joao_42.png, cristiano_50.png)
```

## Notas de segurança

- Os PINs antigos (`4321`/`1234`) e o `SESSION_SECRET` hardcoded foram removidos do código: os dois são exigidos via variáveis de ambiente e o servidor **não inicia** sem eles.
- As credenciais do Supabase não estão mais embutidas no cliente/bundle.
- Tokens de admin são assinados com HMAC-SHA256, expiram em 30 dias e expiraram localmente são descartados.