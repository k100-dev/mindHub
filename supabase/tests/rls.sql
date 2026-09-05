begin;

insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role)
values
  ('10000000-0000-0000-0000-000000000001', 'isadora.rls@example.invalid', '{"name":"Isadora RLS","phone":"+5511999999001","role":"PSYCHOLOGIST"}', '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-000000000001', 'paciente1.rls@example.invalid', '{"name":"Paciente Um","phone":"+5511999999002"}', '{}', 'authenticated', 'authenticated'),
  ('20000000-0000-0000-0000-000000000002', 'paciente2.rls@example.invalid', '{"name":"Paciente Dois","phone":"+5511999999003"}', '{}', 'authenticated', 'authenticated');

do $$
begin
  if (select role from public.profiles where user_id = '10000000-0000-0000-0000-000000000001') <> 'PATIENT' then
    raise exception 'Cadastro público aceitou papel profissional vindo de metadados';
  end if;
end $$;

delete from public.patient_profiles where user_id = '10000000-0000-0000-0000-000000000001';
update public.profiles set role = 'PSYCHOLOGIST', status = 'ACTIVE' where user_id = '10000000-0000-0000-0000-000000000001';
insert into public.psychologist_profiles (user_id, professional_name, crp, public_slug, verification_status)
values ('10000000-0000-0000-0000-000000000001', 'Isadora RLS', '00/000000', 'dra-isadora-bezerra', 'VERIFIED');
insert into public.availability_rules (psychologist_id, weekday, starts_at, ends_at, session_duration_minutes, valid_from)
values ('10000000-0000-0000-0000-000000000001', extract(dow from date '2099-01-05'), '09:00', '12:00', 60, '2099-01-01');
insert into public.schedule_blocks (psychologist_id, starts_at, ends_at, administrative_reason)
values ('10000000-0000-0000-0000-000000000001', '2099-01-05 11:00:00-03', '2099-01-05 12:00:00-03', 'Motivo confidencial RLS');

do $$
begin
  if has_table_privilege('anon', 'public.availability_rules', 'select') then raise exception 'anon possui SELECT em disponibilidade'; end if;
  if has_table_privilege('anon', 'public.schedule_blocks', 'select') then raise exception 'anon possui SELECT em bloqueios'; end if;
  if has_function_privilege('anon', 'public.create_appointment_hold_for_patient(uuid,uuid,timestamptz,integer)', 'execute') then raise exception 'anon pode criar reserva'; end if;
  if has_function_privilege('authenticated', 'public.create_appointment_hold_for_patient(uuid,uuid,timestamptz,integer)', 'execute') then raise exception 'cliente autenticado acessa mutação reservada ao servidor'; end if;
end $$;

select (public.create_appointment_hold_for_patient('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2099-01-05 09:00:00-03', 15)).id;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
do $$
begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'paciente leu perfis de terceiros'; end if;
  if (select count(*) from public.psychologist_profiles where public_slug = 'dra-isadora-bezerra') <> 1 then raise exception 'paciente ativo não acessou perfil verificado'; end if;
  if (select count(*) from public.availability_rules) <> 1 then raise exception 'paciente ativo não acessou disponibilidade'; end if;
  if (select count(*) from public.schedule_blocks) <> 0 then raise exception 'paciente acessou bloqueios ou motivo administrativo'; end if;
end $$;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
do $$
begin
  if (select count(*) from public.appointments) <> 0 then raise exception 'paciente acessou agendamento de outro paciente'; end if;
end $$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$
begin
  if (select count(*) from public.schedule_blocks where administrative_reason = 'Motivo confidencial RLS') <> 1 then raise exception 'profissional não acessou seu bloqueio'; end if;
end $$;

reset role;
rollback;
