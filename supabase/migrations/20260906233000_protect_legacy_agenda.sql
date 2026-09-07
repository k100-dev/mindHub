-- Preserve legacy data while removing unused public access.
alter table if exists public.agendamentos enable row level security;
revoke all on table public.agendamentos from anon, authenticated;
alter function public.set_updated_at() set search_path = '';
