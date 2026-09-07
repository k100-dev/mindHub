-- Remove table-level defaults that otherwise bypass column-level grants.
revoke insert,update,delete,truncate,references,trigger on public.profiles,public.psychologist_profiles,public.patient_profiles,public.psychologist_patients,public.appointments,public.appointment_events,public.payments,public.notification_jobs,public.audit_logs,public.webhook_events from authenticated;
grant update(name,phone,timezone) on public.profiles to authenticated;
grant update(professional_name,bio,session_duration_minutes,deposit_amount,session_price,payment_instructions) on public.psychologist_profiles to authenticated;
grant update(birth_date) on public.patient_profiles to authenticated;
grant update(status) on public.psychologist_patients to authenticated;

create or replace function public.save_weekly_availability(p_professional uuid,p_rules jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare r jsonb; duration integer;
begin
 select pp.session_duration_minutes into duration from public.psychologist_profiles pp join public.profiles p on p.user_id=pp.user_id where pp.user_id=p_professional and p.role='PSYCHOLOGIST' and p.status='ACTIVE' and pp.verification_status='VERIFIED' for update of pp;
 if not found then raise exception 'NOT_FOUND'; end if;
 if jsonb_array_length(p_rules)<>7 or (select count(distinct (x->>'weekday')::int) from jsonb_array_elements(p_rules) x)<>7 then raise exception 'INVALID_RULES'; end if;
 update public.availability_rules set active=false where psychologist_id=p_professional and active;
 for r in select * from jsonb_array_elements(p_rules) loop
  if (r->>'enabled')::boolean then
   insert into public.availability_rules(psychologist_id,weekday,starts_at,ends_at,session_duration_minutes,valid_from) values(p_professional,(r->>'weekday')::smallint,(r->>'startsAt')::time,(r->>'endsAt')::time,duration,(now() at time zone 'America/Sao_Paulo')::date);
  end if;
 end loop;
end; $$;
revoke all on function public.save_weekly_availability(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.save_weekly_availability(uuid,jsonb) to service_role;
