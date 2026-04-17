create extension if not exists pgcrypto;

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome_paciente text not null,
  nome_psicologo text not null,
  data date not null,
  horario time not null,
  status text not null check (status in ('Pendente', 'Confirmado', 'Cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_agendamentos_updated_at on public.agendamentos;
create trigger tg_agendamentos_updated_at
before update on public.agendamentos
for each row
execute procedure public.set_updated_at();
