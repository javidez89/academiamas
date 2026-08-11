create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.enroll_in_course(
  p_course_key text,
  p_estimated_hours numeric
)
returns setof public.course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_estimated_hours numeric := round(coalesce(p_estimated_hours, 0), 1);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_estimated_hours <= 0 or v_estimated_hours > 500 then
    raise exception 'Invalid estimated hours' using errcode = '22023';
  end if;

  return query
  insert into public.course_enrollments (
    user_id, course_key, status, estimated_hours, last_activity_at, updated_at
  )
  values (
    v_user_id, v_course_key, 'active', v_estimated_hours, now(), now()
  )
  on conflict (user_id, course_key) do update
    set status = 'active',
        cancelled_at = null,
        estimated_hours = excluded.estimated_hours,
        last_activity_at = now(),
        updated_at = now()
  returning *;
end;
$$;

create or replace function private.cancel_course(p_course_key text)
returns setof public.course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  return query
  update public.course_enrollments
    set status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status <> 'cancelled'
  returning *;
end;
$$;

create or replace function private.sync_course_activity(
  p_course_key text,
  p_practice_answers integer
)
returns setof public.course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_practice_answers integer := greatest(coalesce(p_practice_answers, 0), 0);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  return query
  update public.course_enrollments
    set practice_answers = greatest(practice_answers, v_practice_answers),
        last_activity_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status = 'active'
  returning *;
end;
$$;

create or replace function private.record_simulator_completion(
  p_course_key text,
  p_score numeric
)
returns setof public.course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_score numeric := round(coalesce(p_score, 0), 2);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_score < 0 or v_score > 100 then
    raise exception 'Invalid simulator score' using errcode = '22023';
  end if;

  return query
  update public.course_enrollments
    set simulator_attempts = simulator_attempts + 1,
        best_simulator_score = greatest(best_simulator_score, v_score),
        last_activity_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status = 'active'
  returning *;

  if not found then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.enroll_in_course(text, numeric) from public, anon;
revoke all on function private.cancel_course(text) from public, anon;
revoke all on function private.sync_course_activity(text, integer) from public, anon;
revoke all on function private.record_simulator_completion(text, numeric) from public, anon;

grant execute on function private.enroll_in_course(text, numeric) to authenticated;
grant execute on function private.cancel_course(text) to authenticated;
grant execute on function private.sync_course_activity(text, integer) to authenticated;
grant execute on function private.record_simulator_completion(text, numeric) to authenticated;

create or replace function public.enroll_in_course(
  p_course_key text,
  p_estimated_hours numeric
)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.enroll_in_course(p_course_key, p_estimated_hours);
$$;

create or replace function public.cancel_course(p_course_key text)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.cancel_course(p_course_key);
$$;

create or replace function public.sync_course_activity(
  p_course_key text,
  p_practice_answers integer
)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.sync_course_activity(p_course_key, p_practice_answers);
$$;

create or replace function public.record_simulator_completion(
  p_course_key text,
  p_score numeric
)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.record_simulator_completion(p_course_key, p_score);
$$;

revoke all on function public.enroll_in_course(text, numeric) from public, anon;
revoke all on function public.cancel_course(text) from public, anon;
revoke all on function public.sync_course_activity(text, integer) from public, anon;
revoke all on function public.record_simulator_completion(text, numeric) from public, anon;

grant execute on function public.enroll_in_course(text, numeric) to authenticated;
grant execute on function public.cancel_course(text) to authenticated;
grant execute on function public.sync_course_activity(text, integer) to authenticated;
grant execute on function public.record_simulator_completion(text, numeric) to authenticated;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = id);
