-- Manual reservations are persistent. Financial state is independent of attendance.
alter table public.psychologist_profiles drop constraint if exists psychologist_verified_slug_check;
drop index if exists public.psychologist_single_verified_uq;
alter table public.psychologist_profiles add column session_price numeric(10,2) not null default 150 check (session_price > 0);
alter table public.psychologist_profiles add column payment_instructions text not null default '' check (char_length(payment_instructions) <= 1500);
update public.psychologist_profiles set session_duration_minutes=60, deposit_amount=75;
alter table public.psychologist_profiles add constraint deposit_within_price check (deposit_amount <= session_price);
alter table public.appointments drop constraint if exists appointments_check1;
alter table public.appointments add column session_price numeric(10,2) not null default 150 check (session_price > 0);
alter table public.appointments add column deposit_amount numeric(10,2) not null default 75 check (deposit_amount >= 0);
alter table public.appointments add column paid_amount numeric(10,2) not null default 0 check (paid_amount >= 0);
alter table public.appointments add column refund_amount numeric(10,2) not null default 0 check (refund_amount >= 0);
alter table public.appointments add column refund_status text not null default 'NONE' check (refund_status in ('NONE','PENDING','COMPLETED','NOT_ELIGIBLE'));
alter table public.appointments add column cancelled_at timestamptz;
alter table public.appointments add constraint booking_financial_bounds check (deposit_amount <= session_price and paid_amount <= session_price and refund_amount <= paid_amount);
update public.appointments a set session_price=p.session_price, deposit_amount=p.deposit_amount, expires_at=null
from public.psychologist_profiles p where p.user_id=a.psychologist_id;
update public.appointments a set paid_amount=least(a.session_price,coalesce((select sum(amount) from public.payments p where p.appointment_id=a.id and p.status='APPROVED'),0));

create or replace function private.is_isadora_psychologist() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.psychologist_profiles pp on p.user_id=pp.user_id where p.user_id=(select auth.uid()) and p.role='PSYCHOLOGIST' and p.status='ACTIVE' and pp.verification_status='VERIFIED');
$$;
-- Compatibility helper above no longer makes identity part of authorization.
alter policy psychologist_profile_private_read on public.psychologist_profiles using (user_id=(select auth.uid()) or ((select private.is_active_patient()) and verification_status='VERIFIED'));
alter policy psychologist_profile_owner_update on public.psychologist_profiles using (user_id=(select auth.uid()) and (select private.is_isadora_psychologist())) with check (user_id=(select auth.uid()) and verification_status='VERIFIED');
alter policy availability_private_read on public.availability_rules using (psychologist_id=(select auth.uid()));
revoke update on public.appointments from authenticated;
revoke update(status,version) on public.appointments from authenticated;
grant update(session_price,payment_instructions) on public.psychologist_profiles to authenticated;

create or replace function private.assert_bookable(p_professional uuid,p_start timestamptz,p_duration integer) returns void
language plpgsql security invoker set search_path='' as $$
declare local_start timestamp := p_start at time zone 'America/Sao_Paulo';
begin
 perform 1 from public.psychologist_profiles pp join public.profiles p on pp.user_id=p.user_id where pp.user_id=p_professional and pp.verification_status='VERIFIED' and p.status='ACTIVE' and p.role='PSYCHOLOGIST' for update of pp;
 if not found then raise exception 'PROFESSIONAL_UNAVAILABLE'; end if;
 if p_start <= now() then raise exception 'PAST_SLOT'; end if;
 if not exists(select 1 from public.availability_rules r where r.psychologist_id=p_professional and r.active and r.weekday=extract(dow from local_start) and local_start::date>=r.valid_from and (r.valid_until is null or local_start::date<=r.valid_until) and local_start >= local_start::date+r.starts_at and local_start+make_interval(mins=>p_duration)<=local_start::date+r.ends_at and mod(extract(epoch from (local_start-(local_start::date+r.starts_at)))::numeric,p_duration*60)=0) then raise exception 'UNAVAILABLE_SLOT'; end if;
 if exists(select 1 from public.schedule_blocks b where b.psychologist_id=p_professional and b.active and tstzrange(b.starts_at,b.ends_at,'[)') && tstzrange(p_start,p_start+make_interval(mins=>p_duration),'[)')) then raise exception 'BLOCKED_SLOT'; end if;
end; $$;
revoke all on function private.assert_bookable(uuid,timestamptz,integer) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.assert_bookable(uuid,timestamptz,integer) to service_role;

create or replace function public.create_appointment_hold_for_patient(requested_patient_id uuid,requested_psychologist_id uuid,requested_starts_at timestamptz,hold_minutes integer default 15) returns public.appointments
language plpgsql security invoker set search_path='' as $$
declare pp public.psychologist_profiles; result public.appointments;
begin
 if not exists(select 1 from public.profiles p join public.patient_profiles pt on pt.user_id=p.user_id where p.user_id=requested_patient_id and p.role='PATIENT' and p.status='ACTIVE' and pt.status='ATIVO') then raise exception 'ACTIVE_PATIENT_REQUIRED'; end if;
 if exists(select 1 from public.psychologist_patients where psychologist_id=requested_psychologist_id and patient_id=requested_patient_id and status='INATIVO') then raise exception 'INACTIVE_RELATIONSHIP'; end if;
 select * into pp from public.psychologist_profiles where user_id=requested_psychologist_id for update;
 perform private.assert_bookable(requested_psychologist_id,requested_starts_at,pp.session_duration_minutes);
 insert into public.psychologist_patients(psychologist_id,patient_id) values(requested_psychologist_id,requested_patient_id) on conflict do nothing;
 insert into public.appointments(psychologist_id,patient_id,starts_at,ends_at,status,expires_at,session_price,deposit_amount) values(requested_psychologist_id,requested_patient_id,requested_starts_at,requested_starts_at+make_interval(mins=>pp.session_duration_minutes),'AGUARDANDO_SINAL',null,pp.session_price,pp.deposit_amount) returning * into result;
 insert into public.appointment_events(appointment_id,actor_id,new_status,reason) values(result.id,requested_patient_id,result.status,'Solicitação de novo atendimento');
 return result;
exception when exclusion_violation then raise exception 'SLOT_CONFLICT' using errcode='23P01';
end; $$;

create or replace function public.manage_manual_appointment(p_actor uuid,p_appointment uuid,p_action text,p_start timestamptz default null,p_amount numeric default null) returns public.appointments
language plpgsql security invoker set search_path='' as $$
declare a public.appointments; result public.appointments; professional boolean; old_start timestamptz; eligible boolean;
begin
 -- Lock the professional first, consistently with reservation and blocking operations.
 perform 1 from public.psychologist_profiles where user_id=(select psychologist_id from public.appointments where id=p_appointment) for update;
 select * into a from public.appointments where id=p_appointment for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 professional := a.psychologist_id=p_actor and exists(select 1 from public.profiles p join public.psychologist_profiles pp on p.user_id=pp.user_id where p.user_id=p_actor and p.role='PSYCHOLOGIST' and p.status='ACTIVE' and pp.verification_status='VERIFIED');
 if not professional and not (a.patient_id=p_actor and exists(select 1 from public.profiles p join public.patient_profiles pt on pt.user_id=p.user_id where p.user_id=p_actor and p.role='PATIENT' and p.status='ACTIVE' and pt.status='ATIVO')) then raise exception 'NOT_FOUND'; end if;
 eligible := a.starts_at >= now()+interval '24 hours';
 if p_action='PAYMENT' then
  if not professional or a.status not in ('AGUARDANDO_SINAL','RESERVADO_TEMPORARIAMENTE','CONFIRMADO','REALIZADO','NO_SHOW','CANCELADO') then raise exception 'INVALID_TRANSITION'; end if;
  if p_amount is null or p_amount <= a.paid_amount or p_amount > a.session_price or p_amount<>round(p_amount,2) or a.refund_status='COMPLETED' then raise exception 'INVALID_AMOUNT'; end if;
  insert into public.payments(appointment_id,amount,provider,status,confirmed_at) values(a.id,p_amount-a.paid_amount,'MANUAL','APPROVED',now());
  update public.appointments set paid_amount=p_amount, refund_amount=case when refund_status='PENDING' then p_amount else refund_amount end where id=a.id;
 elsif p_action='REFUND' then
  if not professional or a.refund_status<>'PENDING' or a.refund_amount<=0 then raise exception 'INVALID_TRANSITION'; end if;
  update public.appointments set refund_status='COMPLETED' where id=a.id;
  update public.payments set status='REFUNDED' where appointment_id=a.id and status='APPROVED';
 elsif p_action='CANCEL' then
  if a.status not in ('AGUARDANDO_SINAL','RESERVADO_TEMPORARIAMENTE','CONFIRMADO') or (not professional and a.starts_at<=now()) then raise exception 'INVALID_TRANSITION'; end if;
  update public.appointments set status='CANCELADO',cancelled_at=now(),expires_at=null,refund_amount=case when eligible or professional then paid_amount else 0 end,refund_status=case when eligible or professional then 'PENDING' else 'NOT_ELIGIBLE' end where id=a.id;
 elsif p_action='RESCHEDULE' then
  if a.status not in ('AGUARDANDO_SINAL','RESERVADO_TEMPORARIAMENTE','CONFIRMADO') then raise exception 'INVALID_TRANSITION'; end if;
  if not professional and not eligible then raise exception 'TOO_LATE'; end if;
  if p_start is null or p_start=a.starts_at then raise exception 'UNAVAILABLE_SLOT'; end if;
  perform private.assert_bookable(a.psychologist_id,p_start,(extract(epoch from a.ends_at-a.starts_at)/60)::integer);
  update public.appointments set starts_at=p_start,ends_at=p_start+(a.ends_at-a.starts_at),status='AGUARDANDO_SINAL',expires_at=null where id=a.id;
 elsif p_action='CONFIRM' then
  if not professional or a.status not in ('AGUARDANDO_SINAL','RESERVADO_TEMPORARIAMENTE') or a.starts_at<=now() then raise exception 'INVALID_TRANSITION'; end if;
  if a.paid_amount<a.deposit_amount then raise exception 'DEPOSIT_REQUIRED'; end if;
  update public.appointments set status='CONFIRMADO' where id=a.id;
 elsif p_action in ('COMPLETE','NO_SHOW') then
  if not professional or a.status<>'CONFIRMADO' or a.ends_at>now() then raise exception 'INVALID_TRANSITION'; end if;
  update public.appointments set status=case when p_action='COMPLETE' then 'REALIZADO'::public.appointment_status else 'NO_SHOW'::public.appointment_status end where id=a.id;
 else raise exception 'INVALID_ACTION'; end if;
 update public.appointments set version=version+1 where id=a.id returning * into result;
 insert into public.appointment_events(appointment_id,actor_id,previous_status,new_status,reason) values(a.id,p_actor,a.status,result.status,case when p_action='RESCHEDULE' then 'Remarcação de '||a.starts_at::text||' para '||result.starts_at::text else p_action end);
 insert into public.audit_logs(actor_id,action,resource_type,resource_id,metadata) values(p_actor,p_action,'appointment',a.id,jsonb_build_object('previous_start',a.starts_at,'new_start',result.starts_at,'paid_amount',result.paid_amount));
 return result;
exception when exclusion_violation then raise exception 'SLOT_CONFLICT' using errcode='23P01';
end; $$;
revoke all on function public.manage_manual_appointment(uuid,uuid,text,timestamptz,numeric) from public,anon,authenticated;
grant execute on function public.manage_manual_appointment(uuid,uuid,text,timestamptz,numeric) to service_role;
revoke all on function public.create_appointment_hold_for_patient(uuid,uuid,timestamptz,integer) from public,anon,authenticated;
grant execute on function public.create_appointment_hold_for_patient(uuid,uuid,timestamptz,integer) to service_role;

-- Existing status endpoint remains compatible, but all changes use the same rules.
create or replace function public.transition_appointment_for_psychologist(requested_psychologist_id uuid,requested_appointment_id uuid,requested_status public.appointment_status,requested_reason text) returns public.appointments language plpgsql security invoker set search_path='' as $$
begin
 return public.manage_manual_appointment(requested_psychologist_id,requested_appointment_id,case requested_status when 'CONFIRMADO' then 'CONFIRM' when 'CANCELADO' then 'CANCEL' when 'REALIZADO' then 'COMPLETE' when 'NO_SHOW' then 'NO_SHOW' else 'INVALID' end);
end; $$;

create or replace function private.guard_schedule_block() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.psychologist_profiles where user_id=new.psychologist_id for update;
 if new.active and exists(select 1 from public.appointments a where a.psychologist_id=new.psychologist_id and a.status in ('RESERVADO_TEMPORARIAMENTE','AGUARDANDO_SINAL','CONFIRMADO') and tstzrange(a.starts_at,a.ends_at,'[)') && tstzrange(new.starts_at,new.ends_at,'[)')) then raise exception 'SLOT_CONFLICT' using errcode='23P01'; end if;
 return new;
end; $$;
revoke all on function private.guard_schedule_block() from public,anon,authenticated;
create trigger schedule_blocks_guard before insert or update on public.schedule_blocks for each row execute function private.guard_schedule_block();
