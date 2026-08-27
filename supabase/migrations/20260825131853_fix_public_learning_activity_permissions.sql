create or replace function public.public_learning_activity_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.public_learning_activity_summary();
$$;

revoke all on function public.public_learning_activity_summary() from public, anon, authenticated;
grant execute on function public.public_learning_activity_summary() to anon, authenticated;
