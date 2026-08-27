create or replace function private.public_learning_activity_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'registered_students', (select count(*) from auth.users),
    'online_students', (
      select count(*)
      from public.profiles
      where last_seen_at >= now() - interval '2 minutes 30 seconds'
    ),
    'measured_at', now()
  );
$$;

create or replace function public.public_learning_activity_summary()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.public_learning_activity_summary();
$$;

revoke all on function private.public_learning_activity_summary() from public, anon, authenticated;
revoke all on function public.public_learning_activity_summary() from public, anon, authenticated;
grant execute on function private.public_learning_activity_summary() to anon, authenticated;
grant execute on function public.public_learning_activity_summary() to anon, authenticated;

comment on function public.public_learning_activity_summary() is
  'Returns public aggregate registration and recent-presence counts without exposing user identities.';
