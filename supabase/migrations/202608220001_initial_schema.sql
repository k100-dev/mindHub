create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.user_role as enum ('PSYCHOLOGIST', 'PATIENT');
create type public.account_status as enum ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED');
create type public.patient_status as enum ('ATIVO', 'INATIVO');
create type public.verification_status as enum ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');
create type public.appointment_status as enum (
  'RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL', 'CONFIRMADO',
  'REALIZADO', 'CANCELADO', 'REMARCADO', 'EXPIRADO', 'NO_SHOW'
);
create type public.appointment_origin as enum ('PUBLIC_AGENDA', 'PSYCHOLOGIST_PANEL');
create type public.payment_status as enum ('CREATED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'CHARGEDBACK', 'EXPIRED');
create type public.job_status as enum ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  name text not null check (char_length(name) between 3 and 120),
  phone text not null,
  status public.account_status not null default 'PENDING_REVIEW',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.psychologist_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  professional_name text not null,
  crp text not null,
  bio text not null default '',
  public_slug text not null unique,
  session_duration_minutes integer not null default 60 check (session_duration_minutes between 20 and 240),
  deposit_amount numeric(10,2) not null default 50 check (deposit_amount >= 0),
  verification_status public.verification_status not null default 'PENDING_REVIEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index psychologist_crp_active_uq
  on public.psychologist_profiles (upper(regexp_replace(crp, '\\s', '', 'g')))
  where verification_status = 'VERIFIED';

create table public.patient_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  birth_date date,
  status public.patient_status not null default 'ATIVO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.psychologist_patients (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles(user_id),
  patient_id uuid not null references public.patient_profiles(user_id),
  status public.patient_status not null default 'ATIVO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (psychologist_id, patient_id)
);

create table public.patient_notes (
  id uuid primary key default gen_random_uuid(),
  psychologist_patient_id uuid not null references public.psychologist_patients(id),
  author_id uuid not null references public.profiles(user_id),
  administrative_content text not null check (char_length(administrative_content) between 3 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles(user_id),
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  session_duration_minutes integer not null check (session_duration_minutes between 20 and 240),
  valid_from date not null default current_date,
  valid_until date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (valid_until is null or valid_until >= valid_from)
);

create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles(user_id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  administrative_reason text not null check (char_length(administrative_reason) between 3 and 300),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles(user_id),
  patient_id uuid not null references public.patient_profiles(user_id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'RESERVADO_TEMPORARIAMENTE',
  origin public.appointment_origin not null default 'PUBLIC_AGENDA',
  expires_at timestamptz,
  rescheduled_from_id uuid references public.appointments(id),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (status not in ('RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL') or expires_at is not null)
);

alter table public.appointments add constraint appointments_no_overlap
  exclude using gist (
    psychologist_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL', 'CONFIRMADO'));

create table public.appointment_events (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.appointments(id),
  actor_id uuid references public.profiles(user_id),
  previous_status public.appointment_status,
  new_status public.appointment_status not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  amount numeric(10,2) not null check (amount >= 0),
  currency char(3) not null default 'BRL',
  provider text not null default 'MERCADO_PAGO',
  external_reference text unique,
  status public.payment_status not null default 'CREATED',
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  channel text not null default 'WHATSAPP',
  template_name text not null,
  recipient_masked text not null,
  scheduled_for timestamptz not null,
  attempts integer not null default 0,
  status public.job_status not null default 'PENDING',
  provider_message_id text,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  payload_hash text not null,
  processed_at timestamptz,
  processing_result text,
  created_at timestamptz not null default now(),
  unique (provider, external_event_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(user_id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index appointments_psychologist_start_idx on public.appointments (psychologist_id, starts_at);
create index appointments_patient_start_idx on public.appointments (patient_id, starts_at desc);
create index appointments_expiration_idx on public.appointments (expires_at) where status in ('RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL');
create index availability_psychologist_weekday_idx on public.availability_rules (psychologist_id, weekday) where active;
create index blocks_psychologist_start_idx on public.schedule_blocks (psychologist_id, starts_at) where active;
create index notifications_pending_idx on public.notification_jobs (scheduled_for) where status = 'PENDING';
create index audit_resource_idx on public.audit_logs (resource_type, resource_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger psychologist_profiles_touch before update on public.psychologist_profiles for each row execute function public.touch_updated_at();
create trigger patient_profiles_touch before update on public.patient_profiles for each row execute function public.touch_updated_at();
create trigger psychologist_patients_touch before update on public.psychologist_patients for each row execute function public.touch_updated_at();
create trigger availability_touch before update on public.availability_rules for each row execute function public.touch_updated_at();
create trigger blocks_touch before update on public.schedule_blocks for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();
create trigger payments_touch before update on public.payments for each row execute function public.touch_updated_at();
create trigger notifications_touch before update on public.notification_jobs for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger security definer set search_path = public language plpgsql as $$
declare
  requested_role public.user_role;
  safe_name text;
  safe_phone text;
  safe_slug text;
begin
  requested_role := case when new.raw_user_meta_data->>'role' = 'PSYCHOLOGIST' then 'PSYCHOLOGIST'::public.user_role else 'PATIENT'::public.user_role end;
  safe_name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Novo usuário'), 120);
  safe_phone := left(coalesce(new.raw_user_meta_data->>'phone', ''), 20);
  insert into public.profiles (user_id, role, name, phone, status)
  values (new.id, requested_role, safe_name, safe_phone, case when requested_role = 'PATIENT' then 'ACTIVE' else 'PENDING_REVIEW' end);
  if requested_role = 'PATIENT' then
    insert into public.patient_profiles (user_id) values (new.id);
  else
    safe_slug := trim(both '-' from regexp_replace(lower(safe_name), '[^a-z0-9]+', '-', 'g')) || '-' || left(new.id::text, 8);
    insert into public.psychologist_profiles (user_id, professional_name, crp, public_slug)
    values (new.id, safe_name, coalesce(new.raw_user_meta_data->>'crp', ''), safe_slug);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.create_appointment_hold(
  requested_psychologist_id uuid,
  requested_starts_at timestamptz,
  hold_minutes integer default 15
) returns public.appointments
security definer set search_path = public language plpgsql as $$
declare
  patient_row public.patient_profiles;
  psychologist_row public.psychologist_profiles;
  result public.appointments;
  duration_minutes integer;
  professional_timezone text;
  local_start timestamp;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select * into patient_row from public.patient_profiles where user_id = auth.uid() and status = 'ATIVO';
  if not found then raise exception 'ACTIVE_PATIENT_REQUIRED' using errcode = '42501'; end if;
  select * into psychologist_row from public.psychologist_profiles where user_id = requested_psychologist_id and verification_status = 'VERIFIED';
  if not found then raise exception 'PSYCHOLOGIST_NOT_AVAILABLE' using errcode = 'P0002'; end if;
  duration_minutes := psychologist_row.session_duration_minutes;
  select timezone into professional_timezone from public.profiles where user_id = requested_psychologist_id;
  local_start := requested_starts_at at time zone coalesce(professional_timezone, 'America/Sao_Paulo');
  update public.appointments set status = 'EXPIRADO'
    where psychologist_id = requested_psychologist_id
      and status in ('RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL')
      and expires_at <= now();
  if requested_starts_at <= now() then raise exception 'PAST_SLOT' using errcode = '22007'; end if;
  if not exists (
    select 1 from public.availability_rules r
    where r.psychologist_id = requested_psychologist_id and r.active
      and r.weekday = extract(dow from local_start)::smallint
      and local_start::date >= r.valid_from
      and (r.valid_until is null or local_start::date <= r.valid_until)
      and local_start::time >= r.starts_at
      and (local_start + make_interval(mins => duration_minutes))::time <= r.ends_at
  ) then raise exception 'UNAVAILABLE_SLOT' using errcode = '22023'; end if;
  if exists (
    select 1 from public.schedule_blocks b
    where b.psychologist_id = requested_psychologist_id and b.active
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(requested_starts_at, requested_starts_at + make_interval(mins => duration_minutes), '[)')
  ) then raise exception 'BLOCKED_SLOT' using errcode = '23P01'; end if;
  insert into public.psychologist_patients (psychologist_id, patient_id)
    values (requested_psychologist_id, auth.uid()) on conflict do nothing;
  insert into public.appointments (psychologist_id, patient_id, starts_at, ends_at, expires_at)
    values (requested_psychologist_id, auth.uid(), requested_starts_at, requested_starts_at + make_interval(mins => duration_minutes), now() + make_interval(mins => greatest(5, least(hold_minutes, 60))))
    returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, new_status, reason)
    values (result.id, auth.uid(), result.status, 'Reserva temporária criada pelo paciente');
  return result;
exception when exclusion_violation then
  raise exception 'SLOT_CONFLICT' using errcode = '23P01';
end;
$$;

alter table public.profiles enable row level security;
alter table public.psychologist_profiles enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.psychologist_patients enable row level security;
alter table public.patient_notes enable row level security;
alter table public.availability_rules enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_events enable row level security;
alter table public.payments enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_own on public.profiles for select using (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy psychologist_public_verified on public.psychologist_profiles for select using (verification_status = 'VERIFIED' or user_id = auth.uid());
create policy psychologist_update_own on public.psychologist_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy patient_own on public.patient_profiles for select using (user_id = auth.uid());
create policy patient_update_own on public.patient_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy relationships_parties on public.psychologist_patients for select using (psychologist_id = auth.uid() or patient_id = auth.uid());
create policy relationships_psychologist_write on public.psychologist_patients for all using (psychologist_id = auth.uid()) with check (psychologist_id = auth.uid());
create policy notes_psychologist on public.patient_notes for all using (
  exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = auth.uid())
) with check (
  author_id = auth.uid() and exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = auth.uid())
);

create policy availability_public_read on public.availability_rules for select using (active);
create policy availability_owner_write on public.availability_rules for all using (psychologist_id = auth.uid()) with check (psychologist_id = auth.uid());
create policy blocks_owner on public.schedule_blocks for all using (psychologist_id = auth.uid()) with check (psychologist_id = auth.uid());
create policy blocks_public_read on public.schedule_blocks for select using (active);
create policy appointments_parties on public.appointments for select using (psychologist_id = auth.uid() or patient_id = auth.uid());
create policy appointments_psychologist_update on public.appointments for update using (psychologist_id = auth.uid()) with check (psychologist_id = auth.uid());
create policy appointment_events_parties on public.appointment_events for select using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = auth.uid() or a.patient_id = auth.uid()))
);
create policy payments_parties on public.payments for select using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = auth.uid() or a.patient_id = auth.uid()))
);
create policy notifications_psychologist on public.notification_jobs for select using (
  exists (select 1 from public.appointments a where a.id = appointment_id and a.psychologist_id = auth.uid())
);
create policy audit_actor on public.audit_logs for select using (actor_id = auth.uid());

grant execute on function public.create_appointment_hold(uuid, timestamptz, integer) to authenticated;

create or replace function public.transition_appointment(
  requested_appointment_id uuid,
  requested_status public.appointment_status,
  requested_reason text
) returns public.appointments
security definer set search_path = public language plpgsql as $$
declare
  current_row public.appointments;
  result public.appointments;
begin
  select * into current_row from public.appointments
    where id = requested_appointment_id and psychologist_id = auth.uid() for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if not (
    (current_row.status = 'RESERVADO_TEMPORARIAMENTE' and requested_status in ('AGUARDANDO_SINAL','EXPIRADO','CANCELADO')) or
    (current_row.status = 'AGUARDANDO_SINAL' and requested_status in ('CONFIRMADO','EXPIRADO','CANCELADO')) or
    (current_row.status = 'CONFIRMADO' and requested_status in ('REALIZADO','CANCELADO','REMARCADO','NO_SHOW'))
  ) then raise exception 'INVALID_TRANSITION' using errcode = '22023'; end if;
  update public.appointments set status = requested_status, version = version + 1
    where id = requested_appointment_id returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, previous_status, new_status, reason)
    values (result.id, auth.uid(), current_row.status, requested_status, requested_reason);
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
    values (auth.uid(), 'APPOINTMENT_STATUS_CHANGED', 'appointment', result.id, jsonb_build_object('from', current_row.status, 'to', requested_status));
  return result;
end;
$$;

grant execute on function public.transition_appointment(uuid, public.appointment_status, text) to authenticated;
