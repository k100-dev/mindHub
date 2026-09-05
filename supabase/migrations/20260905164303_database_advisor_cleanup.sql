create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_active_patient()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.patient_profiles pp on pp.user_id = p.user_id
    where p.user_id = (select auth.uid()) and p.role = 'PATIENT' and p.status = 'ACTIVE' and pp.status = 'ATIVO'
  );
$$;

create or replace function private.is_isadora_psychologist()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.psychologist_profiles pp on pp.user_id = p.user_id
    where p.user_id = (select auth.uid()) and p.role = 'PSYCHOLOGIST' and p.status = 'ACTIVE'
      and pp.verification_status = 'VERIFIED' and pp.public_slug = 'dra-isadora-bezerra'
  );
$$;

revoke all on function private.is_active_patient() from public, anon;
revoke all on function private.is_isadora_psychologist() from public, anon;
grant execute on function private.is_active_patient() to authenticated;
grant execute on function private.is_isadora_psychologist() to authenticated;

alter policy profiles_select_own on public.profiles using (user_id = (select auth.uid()));
alter policy profiles_update_own on public.profiles using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy psychologist_profile_private_read on public.psychologist_profiles using (
  user_id = (select auth.uid()) or ((select private.is_active_patient()) and verification_status = 'VERIFIED' and public_slug = 'dra-isadora-bezerra')
);
alter policy psychologist_profile_owner_update on public.psychologist_profiles using (
  user_id = (select auth.uid()) and (select private.is_isadora_psychologist())
) with check (user_id = (select auth.uid()) and public_slug = 'dra-isadora-bezerra' and verification_status = 'VERIFIED');
alter policy patient_profile_own_read on public.patient_profiles using (user_id = (select auth.uid()));
alter policy patient_profile_own_update on public.patient_profiles using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy relationships_parties_read on public.psychologist_patients using (psychologist_id = (select auth.uid()) or patient_id = (select auth.uid()));
alter policy relationships_isadora_update on public.psychologist_patients using (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
) with check (psychologist_id = (select auth.uid()));
alter policy notes_isadora_all on public.patient_notes using (
  (select private.is_isadora_psychologist()) and exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = (select auth.uid()))
) with check (
  author_id = (select auth.uid()) and (select private.is_isadora_psychologist()) and exists (select 1 from public.psychologist_patients pp where pp.id = psychologist_patient_id and pp.psychologist_id = (select auth.uid()))
);
alter policy availability_private_read on public.availability_rules using (
  psychologist_id = (select auth.uid()) or ((select private.is_active_patient()) and active and exists (
    select 1 from public.psychologist_profiles pp where pp.user_id = psychologist_id and pp.verification_status = 'VERIFIED' and pp.public_slug = 'dra-isadora-bezerra'
  ))
);
drop policy availability_isadora_write on public.availability_rules;
create policy availability_isadora_insert on public.availability_rules for insert to authenticated with check (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
);
create policy availability_isadora_update on public.availability_rules for update to authenticated using (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
) with check (psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist()));
create policy availability_isadora_delete on public.availability_rules for delete to authenticated using (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
);
alter policy blocks_isadora_only on public.schedule_blocks using (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
) with check (psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist()));
alter policy appointments_parties_read on public.appointments using (psychologist_id = (select auth.uid()) or patient_id = (select auth.uid()));
alter policy appointments_isadora_update on public.appointments using (
  psychologist_id = (select auth.uid()) and (select private.is_isadora_psychologist())
) with check (psychologist_id = (select auth.uid()));
alter policy appointment_events_parties_read on public.appointment_events using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = (select auth.uid()) or a.patient_id = (select auth.uid())))
);
alter policy payments_parties_read on public.payments using (
  exists (select 1 from public.appointments a where a.id = appointment_id and (a.psychologist_id = (select auth.uid()) or a.patient_id = (select auth.uid())))
);
alter policy notifications_isadora_read on public.notification_jobs using (
  (select private.is_isadora_psychologist()) and exists (select 1 from public.appointments a where a.id = appointment_id and a.psychologist_id = (select auth.uid()))
);
alter policy audit_actor_read on public.audit_logs using (actor_id = (select auth.uid()));

create or replace function public.is_active_patient()
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.is_active_patient();
$$;
create or replace function public.is_isadora_psychologist()
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.is_isadora_psychologist();
$$;
revoke all on function public.is_active_patient() from public, anon, authenticated;
revoke all on function public.is_isadora_psychologist() from public, anon, authenticated;

create index appointment_events_appointment_idx on public.appointment_events (appointment_id);
create index appointment_events_actor_idx on public.appointment_events (actor_id);
create index appointments_rescheduled_from_idx on public.appointments (rescheduled_from_id);
create index audit_actor_idx on public.audit_logs (actor_id);
create index notification_jobs_appointment_idx on public.notification_jobs (appointment_id);
create index patient_notes_author_idx on public.patient_notes (author_id);
create index patient_notes_relationship_idx on public.patient_notes (psychologist_patient_id);
create index payments_appointment_idx on public.payments (appointment_id);
create index psychologist_patients_patient_idx on public.psychologist_patients (patient_id);

create schema if not exists extensions;
alter extension btree_gist set schema extensions;

-- A ausência de política em webhook_events é intencional: somente o service role
-- usado pelos handlers de webhook pode ler ou gravar nessa tabela.
