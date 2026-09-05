create or replace function public.create_appointment_hold_for_patient(
  requested_patient_id uuid,
  requested_psychologist_id uuid,
  requested_starts_at timestamptz,
  hold_minutes integer default 15
) returns public.appointments
security definer set search_path = '' language plpgsql as $$
declare
  psychologist_row public.psychologist_profiles;
  result public.appointments;
  duration_minutes integer;
  professional_timezone text;
  local_start timestamp;
begin
  if not exists (
    select 1 from public.profiles p join public.patient_profiles pp on pp.user_id = p.user_id
    where p.user_id = requested_patient_id and p.role = 'PATIENT' and p.status = 'ACTIVE' and pp.status = 'ATIVO'
  ) then raise exception 'ACTIVE_PATIENT_REQUIRED' using errcode = '42501'; end if;
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
  insert into public.psychologist_patients (psychologist_id, patient_id) values (requested_psychologist_id, requested_patient_id) on conflict do nothing;
  insert into public.appointments (psychologist_id, patient_id, starts_at, ends_at, expires_at)
    values (requested_psychologist_id, requested_patient_id, requested_starts_at, requested_starts_at + pg_catalog.make_interval(mins => duration_minutes), now() + pg_catalog.make_interval(mins => greatest(5, least(hold_minutes, 60)))) returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, new_status, reason) values (result.id, requested_patient_id, result.status, 'Reserva temporária criada pelo paciente');
  return result;
exception when exclusion_violation then raise exception 'SLOT_CONFLICT' using errcode = '23P01';
end;
$$;

create or replace function public.transition_appointment_for_psychologist(
  requested_psychologist_id uuid,
  requested_appointment_id uuid,
  requested_status public.appointment_status,
  requested_reason text
) returns public.appointments
security definer set search_path = '' language plpgsql as $$
declare
  current_row public.appointments;
  result public.appointments;
begin
  if not exists (
    select 1 from public.profiles p join public.psychologist_profiles pp on pp.user_id = p.user_id
    where p.user_id = requested_psychologist_id and p.role = 'PSYCHOLOGIST' and p.status = 'ACTIVE'
      and pp.verification_status = 'VERIFIED' and pp.public_slug = 'dra-isadora-bezerra'
  ) then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  select * into current_row from public.appointments where id = requested_appointment_id and psychologist_id = requested_psychologist_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if not (
    (current_row.status = 'RESERVADO_TEMPORARIAMENTE' and requested_status in ('AGUARDANDO_SINAL','EXPIRADO','CANCELADO')) or
    (current_row.status = 'AGUARDANDO_SINAL' and requested_status in ('CONFIRMADO','EXPIRADO','CANCELADO')) or
    (current_row.status = 'CONFIRMADO' and requested_status in ('REALIZADO','CANCELADO','REMARCADO','NO_SHOW'))
  ) then raise exception 'INVALID_TRANSITION' using errcode = '22023'; end if;
  update public.appointments set status = requested_status, version = version + 1 where id = requested_appointment_id returning * into result;
  insert into public.appointment_events (appointment_id, actor_id, previous_status, new_status, reason) values (result.id, requested_psychologist_id, current_row.status, requested_status, requested_reason);
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata) values (requested_psychologist_id, 'APPOINTMENT_STATUS_CHANGED', 'appointment', result.id, pg_catalog.jsonb_build_object('from', current_row.status, 'to', requested_status));
  return result;
end;
$$;

revoke all on function public.create_appointment_hold_for_patient(uuid, uuid, timestamptz, integer) from public, anon, authenticated;
revoke all on function public.transition_appointment_for_psychologist(uuid, uuid, public.appointment_status, text) from public, anon, authenticated;
grant execute on function public.create_appointment_hold_for_patient(uuid, uuid, timestamptz, integer) to service_role;
grant execute on function public.transition_appointment_for_psychologist(uuid, uuid, public.appointment_status, text) to service_role;

drop function public.create_appointment_hold(uuid, timestamptz, integer);
drop function public.transition_appointment(uuid, public.appointment_status, text);
