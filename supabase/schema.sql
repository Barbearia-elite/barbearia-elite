-- ============================================================
-- Barbearia Elite — schema do banco (Supabase / PostgreSQL)
-- Execute este script no SQL Editor do Supabase do seu novo projeto.
-- O servidor (server.ts) usa a Service Role Key, que ignora a RLS.
-- As regras de RLS abaixo impedem acesso direto pela chave anônima.
-- ============================================================

create extension if not exists pgcrypto;

-- Agendamentos
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  barber text not null check (barber in ('João Neto', 'Cristian Mauro', 'Qualquer um')),
  service text not null check (service in ('Cabelo', 'Barba', 'Cabelo & Barba')),
  date date not null,
  time text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  name text not null,
  phone text not null,
  status text not null default 'confirmado' check (status in ('confirmado', 'concluido', 'cancelado')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists bookings_date_barber_time_idx on public.bookings (date, barber, time);

-- Bloqueios de horário/dia (folgas, feriados, horário fechado)
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text,
  barber text not null check (barber in ('Todos', 'João Neto', 'Cristian Mauro')),
  reason text,
  created_at timestamptz not null default now(),
  unique (date, coalesce(time, ''), barber)
);

create index if not exists blocked_slots_date_idx on public.blocked_slots (date);

-- Configurações (ex.: cronograma semanal em JSON)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Segurança: com RLS ativada e sem políticas, só a Service Role Key
-- (usada no servidor) consegue acessar as tabelas.
alter table public.bookings enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.settings enable row level security;