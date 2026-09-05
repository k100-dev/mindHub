-- Endurecimento para o MindHub exclusivo de Isadora Bezerra.
-- A migração inicial permanece intacta; esta revisão remove acessos públicos e
-- substitui a autorização baseada em metadados por perfis controlados no banco.

alter table public.psychologist_profiles
  add constraint psychologist_verified_slug_check
  check (verification_status <> 'VERIFIED' or public_slug = 'dra-isadora-bezerra');

create unique index psychologist_single_verified_uq
  on public.psychologist_profiles ((verification_status))
  where verification_status = 'VERIFIED';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
language plpgsql
as $$
declare
  safe_name text;
  safe_phone text;
begin
  safe_name := left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Novo usuário'), 120);
  safe_phone := left(coalesce(new.raw_user_meta_data->>'phone', ''), 20);
  insert into public.profiles (user_id, role, name, phone, status)
  values (new.id, 'PATIENT'::public.user_role, safe_name, safe_phone, 'ACTIVE'::public.account_status);
  insert into public.patient_profiles (user_id) values (new.id);
  return new;
end;
$$;

create or replace function public.is_active_patient()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    join public.patient_profiles pp on pp.user_id = p.user_id
    where p.user_id = auth.uid() and p.role = 'PATIENT' and p.status = 'ACTIVE' and pp.status = 'ATIVO'
  );
$$;

create or replace function public.is_isadora_psychologist()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    join public.psychologist_profiles pp on pp.user_id = p.user_id
    where p.user_id = auth.uid() and p.role = 'PSYCHOLOGIST' and p.status = 'ACTIVE'
      and pp.verification_status = 'VERIFIED' and pp.public_slug = 'dra-isadora-bezerra'
  );
$$;

drop policy if exists profiles_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists psychologist_public_verified on public.psychologist_profiles;
drop policy if exists psychologist_update_own on public.psychologist_profiles;
drop policy if exists patient_own on public.patient_profiles;
drop policy if exists patient_update_own on public.patient_profiles;
drop policy if exists relationships_parties on public.psychologist_patients;
drop policy if exists relationships_psychologist_write on public.psychologist_patients;
drop policy if exists notes_psychologist on public.patient_notes;
drop policy if exists availability_public_read on public.availability_rules;
drop policy if exists availability_owner_write on public.availability_rules;
drop policy if exists blocks_owner on public.schedule_blocks;
drop policy if exists blocks_public_read on public.schedule_blocks;
drop policy if exists appointments_parties on public.appointments;
drop policy if exists appointments_psychologist_update on public.appointments;
drop policy if exists appointment_events_parties on public.appointment_events;
drop policy if exists payments_parties on public.payments;
drop policy if exists notifications_psychologist on public.notification_jobs;
drop policy if exists audit_actor on public.audit_logs;

create policy profiles_select_own on public.profiles for select to authenticated using (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy psychologist_profile_private_read on public.psychologist_profiles for select to authenticated using (
  user_id = auth.uid() or (public.is_active_patient() and verification_status = 'VERIFIED' and public_slug = 'dra-isadora-bezerra')
);
create policy psychologist_profile_owner_update on public.psychologist_profiles for update to authenticated using (
  user_id = auth.uid() and public.is_isadora_psychologist()
) with check (user_id = auth.uid() and public_slug = 'dra-isadora-bezerra' and verification_status = 'VERIFIED');
create policy patient_profile_own_read on public.patient_profiles for select to authenticated using (user_id = auth.uid());
create policy patient_profile_own_update on public.patient_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy relationships_parties_read on public.psychologist_patients for select to authenticated using (psychologist_id = auth.uid() or patient_id = auth.uid());
create policy relationships_isadora_update on public.psychologist_patients for update to authenticated using (psychologist_id = auth.uid() and public.is_isadora_psychologist()) with check (psychologist_id = auth.uid());
create policy notes_isadora_all on public.patient_notes for all to authenticated using (
  public.is_isadora_psychologist() and exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = auth.uid())
) with check (
  author_id = auth.uid() and public.is_isadora_psychologist() and exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = auth.uid())
);
create policy availability_private_read on public.availability_rules for select to authenticated using (
  psychologist_id = auth.uid() or (public.is_active_patient() and active and exists (
    select 1 from public.psychologist_profiles pp where pp.user_id = psychologist_id and pp.verification_status = 'VERIFIED' and pp.public_slug = 'dra-isadora-bezerra'
  ))
);
create policy availability_isadora_write on public.availability_rules for all to authenticated using (
  psychologist_id = auth.uid() and public.is_isadora_psychologist()
) with check (psychologist_id = auth.uid() and public.is_isadora_psychologist());
create policy blocks_isadora_only on public.schedule_blocks for all to authenticated using (
  psychologist_id = auth.uid() and public.is_isadora_psychologist()
) with check (psychologist_id = auth.uid() and public.is_isadora_psychologist());
create policy appointments_parties_read on public.appointments for select to authenticated using (psychologist_id = auth.uid() or patient_id = auth.uid());
create policy appointments_isadora_update on public.appointments for update to authenticated using (
  psychologist_id = auth.uid() and public.is_isadora_psychologist()
) with check (psychologist_id = auth.uid());
create policy appointment_events_parties_read on public.appointment_events for select to authenticated using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = auth.uid() or a.patient_id = auth.uid()))
);
create policy payments_parties_read on public.payments for select to authenticated using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = auth.uid() or a.patient_id = auth.uid()))
);
create policy notifications_isadora_read on public.notification_jobs for select to authenticated using (
  public.is_isadora_psychologist() and exists (select 1 from public.appointments a where a.id = appointment_id and a.psychologist_id = auth.uid())
);
create policy audit_actor_read on public.audit_logs for select to authenticated using (actor_id = auth.uid());

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from public, anon;
grant usage on schema public to authenticated;
grant select on public.profiles, public.psychologist_profiles, public.patient_profiles, public.psychologist_patients,
  public.patient_notes, public.availability_rules, public.schedule_blocks, public.appointments,
  public.appointment_events, public.payments, public.notification_jobs, public.audit_logs to authenticated;
grant update (name, phone, timezone) on public.profiles to authenticated;
grant update (professional_name, bio, session_duration_minutes, deposit_amount) on public.psychologist_profiles to authenticated;
grant update (birth_date) on public.patient_profiles to authenticated;
grant update (status) on public.psychologist_patients to authenticated;
grant insert, update, delete on public.patient_notes, public.availability_rules, public.schedule_blocks to authenticated;
grant update (status, version) on public.appointments to authenticated;
grant execute on function public.is_active_patient() to authenticated;
grant execute on function public.is_isadora_psychologist() to authenticated;

create or replace function public.create_appointment_hold(
  requested_psychologist_id uuid,
  requested_starts_at timestamptz,
  hold_minutes integer default 15
) returns public.appointments
security definer
set search_path = ''
language plpgsql
as $$
declare
  psychologist_row public.psychologist_profiles;
  result public.appointments;
  duration_minutes integer;
  professional_timezone text;
  local_start timestamp;
begin
  if auth.uid() is null or not public.is_active_patient() then raise exception 'ACTIVE_PATIENT_REQUIRED' using errcode = '42501'; end if;
  select * into psychologist_row from public.psychologist_profiles
    where user_id = requested_psychologist_id and verification_status = 'VERIFIED' and public_slug = 'dra-isadora-bezerra';
  if not found then raise exception 'PSYCHOLOGIST_NOT_AVAILABLE' using errcode = 'P0002'; end if;
  duration_minutes := psychologist_row.session_duration_minutes;
  select timezone into professional_timezone from public.profiles where user_id = requested_psychologist_id;
  local_start := requested_starts_at at time zone coalesce(professional_timezone, 'America/Sao_Paulo');
  update public.appointments set status = 'EXPIRADO'
    where psychologist_id = requested_psychologist_id and status in ('RESERVADO_TEMPORARIAMENTE', 'AGUARDANDO_SINAL') and expires_at <= now();
  if requested_starts_at <= now() then raise exception 'PAST_SLOT' using errcode = '22007'; end if;
  if not exists (
    select 1 from public.availability_rules r where r.psychologist_id = requested_psychologist_id and r.active
      and r.weekday = extract(dow from local_start)::smallint and local_start::date >= r.valid_from
      and (r.valid_until is null or local_start::date <= r.valid_until) and local_start::time >= r.starts_at
      and (local_start + pg_catalog.make_interval(mins => duration_minutes))::time <= r.ends_at
  ) then raise exception 'UNAVAILABLE_SLOT' using errcode = '22023'; end if;
  if exists (
    select 1 from public.schedule_blocks b where b.psychologist_id = requested_psychologist_id and b.active
      and pg_catalog.tstzrange(b.starts_at, b.ends_at, '[)') && pg_catalog.tstzrange(requested_starts_at, requested_starts_at + pg_catalog.make_interval(mins => duration_minutes), '[)')
  ) then raise exception 'BLOCKED_SLOT' using errcode = '23P01'; end if;
  insert into public.psychologist_patients (psychologist_id, patient_id) values (requested_psychologist_id, auth.uid()) on conflict do nothing;
  insert into public.appointments (psychologist_id, patient_id, starts_at, ends_at, expires_at)
    values (requested_psychologist_id, auth.uid(), requested_starts_at, requested_starts_at + pg_catalog.make_interval(mins => duration_minutes), now() + pg_catalog.make_interval(mins => greatest(5, least(hold_minutes, 60)))) returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, new_status, reason) values (result.id, auth.uid(), result.status, 'Reserva temporária criada pelo paciente');
  return result;
exception when exclusion_violation then raise exception 'SLOT_CONFLICT' using errcode = '23P01';
end;
$$;

create or replace function public.transition_appointment(
  requested_appointment_id uuid,
  requested_status public.appointment_status,
  requested_reason text
) returns public.appointments
security definer
set search_path = ''
language plpgsql
as $$
declare
  current_row public.appointments;
  result public.appointments;
begin
  if not public.is_isadora_psychologist() then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  select * into current_row from public.appointments where id = requested_appointment_id and psychologist_id = auth.uid() for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if not (
    (current_row.status = 'RESERVADO_TEMPORARIAMENTE' and requested_status in ('AGUARDANDO_SINAL','EXPIRADO','CANCELADO')) or
    (current_row.status = 'AGUARDANDO_SINAL' and requested_status in ('CONFIRMADO','EXPIRADO','CANCELADO')) or
    (current_row.status = 'CONFIRMADO' and requested_status in ('REALIZADO','CANCELADO','REMARCADO','NO_SHOW'))
  ) then raise exception 'INVALID_TRANSITION' using errcode = '22023'; end if;
  update public.appointments set status = requested_status, version = version + 1 where id = requested_appointment_id returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, previous_status, new_status, reason) values (result.id, auth.uid(), current_row.status, requested_status, requested_reason);
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata) values (auth.uid(), 'APPOINTMENT_STATUS_CHANGED', 'appointment', result.id, pg_catalog.jsonb_build_object('from', current_row.status, 'to', requested_status));
  return result;
end;
$$;

grant execute on function public.create_appointment_hold(uuid, timestamptz, integer) to authenticated;
grant execute on function public.transition_appointment(uuid, public.appointment_status, text) to authenticated;
revoke execute on function public.create_appointment_hold(uuid, timestamptz, integer) from public, anon;
revoke execute on function public.transition_appointment(uuid, public.appointment_status, text) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
