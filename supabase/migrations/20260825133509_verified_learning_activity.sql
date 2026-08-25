create table if not exists private.learning_activity_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_id uuid not null default gen_random_uuid(),
  course_key text not null,
  activity_type text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint learning_activity_sessions_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint learning_activity_sessions_type_check
    check (activity_type in ('practice', 'simulator', 'final_exam')),
  constraint learning_activity_sessions_timestamps_check
    check (last_seen_at >= started_at and (ended_at is null or ended_at >= started_at))
);

alter table private.learning_activity_sessions enable row level security;

revoke all on table private.learning_activity_sessions from public, anon, authenticated;

create unique index if not exists learning_activity_sessions_session_id_idx
  on private.learning_activity_sessions (session_id);
create index if not exists learning_activity_sessions_active_seen_idx
  on private.learning_activity_sessions (last_seen_at desc)
  where ended_at is null;
create index if not exists learning_activity_sessions_active_course_idx
  on private.learning_activity_sessions (course_key, last_seen_at desc)
  where ended_at is null;

create or replace function private.begin_learning_activity(
  p_course_key text,
  p_activity_type text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_activity_type text := lower(trim(coalesce(p_activity_type, '')));
  v_session_id uuid := gen_random_uuid();
  v_started_at timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_activity_type not in ('practice', 'simulator', 'final_exam') then
    raise exception 'Invalid activity type' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_course_key
      and enrollment.status <> 'cancelled'
  ) then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;

  insert into private.learning_activity_sessions (
    user_id,
    session_id,
    course_key,
    activity_type,
    started_at,
    last_seen_at,
    ended_at
  )
  values (
    v_user_id,
    v_session_id,
    v_course_key,
    v_activity_type,
    v_started_at,
    v_started_at,
    null
  )
  on conflict (user_id) do update
    set session_id = excluded.session_id,
        course_key = excluded.course_key,
        activity_type = excluded.activity_type,
        started_at = excluded.started_at,
        last_seen_at = excluded.last_seen_at,
        ended_at = null;

  return jsonb_build_object(
    'session_id', v_session_id,
    'course_key', v_course_key,
    'activity_type', v_activity_type,
    'started_at', v_started_at
  );
end;
$$;

create or replace function private.touch_learning_activity(p_session_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update private.learning_activity_sessions
  set last_seen_at = now()
  where user_id = v_user_id
    and session_id = p_session_id
    and ended_at is null;

  return found;
end;
$$;

create or replace function private.end_learning_activity(p_session_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update private.learning_activity_sessions
  set last_seen_at = now(),
      ended_at = now()
  where user_id = v_user_id
    and session_id = p_session_id
    and ended_at is null;

  return found;
end;
$$;

create or replace function public.begin_learning_activity(
  p_course_key text,
  p_activity_type text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.begin_learning_activity(p_course_key, p_activity_type);
$$;

create or replace function public.touch_learning_activity(p_session_id uuid)
returns boolean
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.touch_learning_activity(p_session_id);
$$;

create or replace function public.end_learning_activity(p_session_id uuid)
returns boolean
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.end_learning_activity(p_session_id);
$$;

create or replace function private.public_learning_activity_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select
      (select count(*) from auth.users) as registered_students,
      (
        select count(distinct enrollment.course_key)
        from public.course_enrollments as enrollment
        where enrollment.status <> 'cancelled'
      ) as active_courses,
      (
        select count(distinct activity.user_id)
        from private.learning_activity_sessions as activity
        where activity.ended_at is null
          and activity.last_seen_at >= now() - interval '90 seconds'
      ) as active_students
  )
  select jsonb_build_object(
    'registered_students', totals.registered_students,
    'active_courses', totals.active_courses,
    'active_students', totals.active_students,
    'online_students', totals.active_students,
    'measured_at', now()
  )
  from totals;
$$;

create or replace function public.public_learning_activity_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.public_learning_activity_summary();
$$;

revoke all on function private.begin_learning_activity(text, text) from public, anon, authenticated;
revoke all on function private.touch_learning_activity(uuid) from public, anon, authenticated;
revoke all on function private.end_learning_activity(uuid) from public, anon, authenticated;
revoke all on function private.public_learning_activity_summary() from public, anon, authenticated;
revoke all on function public.begin_learning_activity(text, text) from public, anon, authenticated;
revoke all on function public.touch_learning_activity(uuid) from public, anon, authenticated;
revoke all on function public.end_learning_activity(uuid) from public, anon, authenticated;
revoke all on function public.public_learning_activity_summary() from public, anon, authenticated;

grant execute on function private.begin_learning_activity(text, text) to authenticated;
grant execute on function private.touch_learning_activity(uuid) to authenticated;
grant execute on function private.end_learning_activity(uuid) to authenticated;
grant execute on function public.begin_learning_activity(text, text) to authenticated;
grant execute on function public.touch_learning_activity(uuid) to authenticated;
grant execute on function public.end_learning_activity(uuid) to authenticated;
grant execute on function public.public_learning_activity_summary() to anon, authenticated;

comment on table private.learning_activity_sessions is
  'Ephemeral authenticated learning presence; one current activity per user and automatic expiry by last_seen_at.';
comment on function public.begin_learning_activity(text, text) is
  'Starts a verified practice, simulator, or final-exam presence for the authenticated enrolled user.';
comment on function public.touch_learning_activity(uuid) is
  'Refreshes a verified learning activity heartbeat owned by the authenticated user.';
comment on function public.end_learning_activity(uuid) is
  'Closes a verified learning activity owned by the authenticated user.';
comment on function public.public_learning_activity_summary() is
  'Returns public aggregate registration, active-course, and verified-learning counts without identities.';
