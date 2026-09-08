begin;
insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data,aud,role) values
('e319ffd1-c109-421a-a000-000000000001','mindhub-v1-a@example.invalid','{"name":"Teste Perfil A","phone":"+5543999999901"}','{}','authenticated','authenticated'),
('e319ffd1-c109-421a-a000-000000000002','mindhub-v1-b@example.invalid','{"name":"Teste Perfil B","phone":"+5543999999902"}','{}','authenticated','authenticated');
set local role authenticated;
select set_config('request.jwt.claim.sub','e319ffd1-c109-421a-a000-000000000001',true);
update public.patient_profiles set description='Descrição de teste',hobbies=array['Leitura','Cinema'] where user_id='e319ffd1-c109-421a-a000-000000000001';
do $$ begin
if not exists(select 1 from public.patient_profiles where description='Descrição de teste' and hobbies=array['Leitura','Cinema']) then raise exception 'Own update failed'; end if;
if exists(select 1 from public.patient_profiles where user_id='e319ffd1-c109-421a-a000-000000000002') then raise exception 'Other profile visible'; end if;
update public.patient_profiles set description='unexpected' where user_id='e319ffd1-c109-421a-a000-000000000002';
if found then raise exception 'Other profile editable'; end if;
if has_column_privilege('authenticated','public.patient_profiles','user_id','update') then raise exception 'Owner reassignment permitted'; end if;
end $$;
reset role;
do $$ begin
if exists(select 1 from storage.buckets where id='patient-avatars' and public) then raise exception 'Avatar bucket public'; end if;
if (select count(*) from pg_policies where schemaname='storage' and policyname like 'patient_avatar_own_%') <> 4 then raise exception 'Missing avatar policies'; end if;
end $$;
rollback;
