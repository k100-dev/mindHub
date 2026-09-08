alter table public.patient_profiles
  add column description text not null default '' check (char_length(description) <= 600),
  add column hobbies text[] not null default '{}' check (cardinality(hobbies) <= 12 and char_length(array_to_string(hobbies, ',')) <= 491);
grant update(description,hobbies) on public.patient_profiles to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('patient-avatars','patient-avatars',false,2097152,array['image/webp']);

create policy "patient_avatar_own_read" on storage.objects for select to authenticated
using (bucket_id='patient-avatars' and name=(select auth.uid())::text || '/avatar.webp');
create policy "patient_avatar_own_insert" on storage.objects for insert to authenticated
with check (bucket_id='patient-avatars' and name=(select auth.uid())::text || '/avatar.webp'
and exists(select 1 from public.profiles where user_id=(select auth.uid()) and role='PATIENT' and status='ACTIVE'));
create policy "patient_avatar_own_update" on storage.objects for update to authenticated
using (bucket_id='patient-avatars' and name=(select auth.uid())::text || '/avatar.webp')
with check (bucket_id='patient-avatars' and name=(select auth.uid())::text || '/avatar.webp'
and exists(select 1 from public.profiles where user_id=(select auth.uid()) and role='PATIENT' and status='ACTIVE'));
create policy "patient_avatar_own_delete" on storage.objects for delete to authenticated
using (bucket_id='patient-avatars' and name=(select auth.uid())::text || '/avatar.webp');
