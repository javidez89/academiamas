alter table public.course_enrollments
  add column verified_study_seconds bigint not null default 0,
  add column study_verification_started_at timestamptz not null default now();

alter table public.course_enrollments
  add constraint course_enrollments_verified_study_seconds_check
    check (verified_study_seconds >= 0 and verified_study_seconds <= 315360000);

alter table private.learning_activity_sessions
  add column chapter_id integer,
  add column duration_seconds bigint not null default 0,
  add column heartbeat_count integer not null default 0,
  add column last_counted_at timestamptz;

update private.learning_activity_sessions
set last_counted_at = last_seen_at,
    ended_at = coalesce(ended_at, last_seen_at);

alter table private.learning_activity_sessions
  alter column last_counted_at set default now(),
  alter column last_counted_at set not null,
  drop constraint if exists learning_activity_sessions_pkey,
  drop constraint if exists learning_activity_sessions_type_check,
  drop constraint if exists learning_activity_sessions_timestamps_check;

drop index if exists private.learning_activity_sessions_session_id_idx;

alter table private.learning_activity_sessions
  add constraint learning_activity_sessions_pkey primary key (session_id),
  add constraint learning_activity_sessions_type_check
    check (activity_type in ('reading', 'practice', 'simulator', 'final_exam')),
  add constraint learning_activity_sessions_chapter_check
    check (
      (activity_type = 'reading' and chapter_id between 1 and 999)
      or (
        activity_type <> 'reading'
        and (chapter_id is null or chapter_id between 1 and 999)
      )
    ),
  add constraint learning_activity_sessions_duration_check
    check (duration_seconds >= 0 and duration_seconds <= 315360000),
  add constraint learning_activity_sessions_heartbeat_check
    check (heartbeat_count >= 0),
  add constraint learning_activity_sessions_timestamps_check
    check (
      last_seen_at >= started_at
      and last_counted_at >= started_at
      and (ended_at is null or ended_at >= started_at)
    );

create unique index learning_activity_sessions_one_active_user_idx
  on private.learning_activity_sessions (user_id)
  where ended_at is null;

create index learning_activity_sessions_user_course_started_idx
  on private.learning_activity_sessions (user_id, course_key, started_at desc);

create index learning_activity_sessions_user_chapter_started_idx
  on private.learning_activity_sessions (user_id, course_key, chapter_id, started_at desc)
  where chapter_id is not null;

create or replace function private.learning_activity_elapsed_seconds(
  p_last_seen_at timestamptz,
  p_now timestamptz
)
returns integer
language sql
immutable
strict
security invoker
set search_path = ''
as $$
  select case
    when p_now < p_last_seen_at then 0
    when p_now - p_last_seen_at > interval '90 seconds' then 0
    else least(
      45,
      greatest(0, floor(extract(epoch from (p_now - p_last_seen_at)))::integer)
    )
  end;
$$;

create or replace function private.begin_learning_activity(
  p_course_key text,
  p_activity_type text,
  p_chapter_id integer
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
  v_now timestamptz := now();
  v_previous private.learning_activity_sessions%rowtype;
  v_elapsed integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_activity_type not in ('reading', 'practice', 'simulator', 'final_exam') then
    raise exception 'Invalid activity type' using errcode = '22023';
  end if;
  if p_chapter_id is not null and p_chapter_id not between 1 and 999 then
    raise exception 'Invalid chapter' using errcode = '22023';
  end if;
  if v_activity_type = 'reading' and p_chapter_id is null then
    raise exception 'Reading activity requires a chapter' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_course_key
      and enrollment.status in ('active', 'completed')
  ) then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  select activity.*
  into v_previous
  from private.learning_activity_sessions as activity
  where activity.user_id = v_user_id
    and activity.ended_at is null
  for update;

  if found then
    v_elapsed := private.learning_activity_elapsed_seconds(v_previous.last_seen_at, v_now);
    if not exists (
      select 1
      from public.course_enrollments as enrollment
      where enrollment.user_id = v_user_id
        and enrollment.course_key = v_previous.course_key
        and enrollment.status in ('active', 'completed')
    ) then
      v_elapsed := 0;
    end if;

    update private.learning_activity_sessions
    set duration_seconds = least(315360000, duration_seconds + v_elapsed),
        last_seen_at = v_now,
        last_counted_at = v_now,
        ended_at = v_now
    where session_id = v_previous.session_id;

    update public.course_enrollments
    set verified_study_seconds = least(315360000, verified_study_seconds + v_elapsed),
        last_activity_at = v_now,
        updated_at = v_now
    where user_id = v_user_id
      and course_key = v_previous.course_key
      and status in ('active', 'completed');
  end if;

  insert into private.learning_activity_sessions (
    user_id,
    session_id,
    course_key,
    activity_type,
    chapter_id,
    started_at,
    last_seen_at,
    last_counted_at,
    ended_at,
    duration_seconds,
    heartbeat_count
  ) values (
    v_user_id,
    v_session_id,
    v_course_key,
    v_activity_type,
    p_chapter_id,
    v_now,
    v_now,
    v_now,
    null,
    0,
    0
  );

  update public.course_enrollments
  set last_activity_at = v_now,
      updated_at = v_now
  where user_id = v_user_id
    and course_key = v_course_key;

  return jsonb_build_object(
    'session_id', v_session_id,
    'course_key', v_course_key,
    'activity_type', v_activity_type,
    'chapter_id', p_chapter_id,
    'started_at', v_now,
    'duration_seconds', 0
  );
end;
$$;

create or replace function private.begin_learning_activity(
  p_course_key text,
  p_activity_type text
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.begin_learning_activity(p_course_key, p_activity_type, null);
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
  v_activity private.learning_activity_sessions%rowtype;
  v_now timestamptz := now();
  v_elapsed integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select activity.*
  into v_activity
  from private.learning_activity_sessions as activity
  where activity.user_id = v_user_id
    and activity.session_id = p_session_id
    and activity.ended_at is null
  for update;

  if not found then
    return false;
  end if;

  if not exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_activity.course_key
      and enrollment.status in ('active', 'completed')
  ) then
    update private.learning_activity_sessions
    set ended_at = v_now,
        last_counted_at = v_now
    where session_id = p_session_id;
    return false;
  end if;

  v_elapsed := private.learning_activity_elapsed_seconds(v_activity.last_seen_at, v_now);

  update private.learning_activity_sessions
  set duration_seconds = least(315360000, duration_seconds + v_elapsed),
      heartbeat_count = heartbeat_count + 1,
      last_seen_at = v_now,
      last_counted_at = v_now
  where session_id = p_session_id;

  update public.course_enrollments
  set verified_study_seconds = least(315360000, verified_study_seconds + v_elapsed),
      last_activity_at = v_now,
      updated_at = v_now
  where user_id = v_user_id
    and course_key = v_activity.course_key
    and status in ('active', 'completed');

  return true;
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
  v_activity private.learning_activity_sessions%rowtype;
  v_now timestamptz := now();
  v_elapsed integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select activity.*
  into v_activity
  from private.learning_activity_sessions as activity
  where activity.user_id = v_user_id
    and activity.session_id = p_session_id
    and activity.ended_at is null
  for update;

  if not found then
    return false;
  end if;

  v_elapsed := private.learning_activity_elapsed_seconds(v_activity.last_seen_at, v_now);
  if not exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_activity.course_key
      and enrollment.status in ('active', 'completed')
  ) then
    v_elapsed := 0;
  end if;

  update private.learning_activity_sessions
  set duration_seconds = least(315360000, duration_seconds + v_elapsed),
      last_seen_at = v_now,
      last_counted_at = v_now,
      ended_at = v_now
  where session_id = p_session_id;

  update public.course_enrollments
  set verified_study_seconds = least(315360000, verified_study_seconds + v_elapsed),
      last_activity_at = v_now,
      updated_at = v_now
  where user_id = v_user_id
    and course_key = v_activity.course_key
    and status in ('active', 'completed');

  return true;
end;
$$;

create or replace function private.get_verified_study_time(p_course_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'course_key', v_course_key,
    'verified_study_seconds', coalesce(sum(activity.duration_seconds), 0),
    'session_count', count(activity.session_id),
    'verification_started_at', enrollment.study_verification_started_at,
    'chapters', coalesce((
      select jsonb_object_agg(chapter.chapter_id::text, chapter.duration_seconds)
      from (
        select session.chapter_id, sum(session.duration_seconds) as duration_seconds
        from private.learning_activity_sessions as session
        where session.user_id = v_user_id
          and session.course_key = v_course_key
          and session.chapter_id is not null
        group by session.chapter_id
      ) as chapter
    ), '{}'::jsonb),
    'activities', coalesce((
      select jsonb_object_agg(kind.activity_type, kind.duration_seconds)
      from (
        select session.activity_type, sum(session.duration_seconds) as duration_seconds
        from private.learning_activity_sessions as session
        where session.user_id = v_user_id
          and session.course_key = v_course_key
        group by session.activity_type
      ) as kind
    ), '{}'::jsonb)
  )
  into v_result
  from public.course_enrollments as enrollment
  left join private.learning_activity_sessions as activity
    on activity.user_id = enrollment.user_id
   and activity.course_key = enrollment.course_key
  where enrollment.user_id = v_user_id
    and enrollment.course_key = v_course_key
  group by enrollment.study_verification_started_at;

  if v_result is null then
    raise exception 'Enrollment required' using errcode = '42501';
  end if;

  return v_result;
end;
$$;

create or replace function public.begin_learning_activity(
  p_course_key text,
  p_activity_type text,
  p_chapter_id integer
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.begin_learning_activity(p_course_key, p_activity_type, p_chapter_id);
$$;

create or replace function public.get_verified_study_time(p_course_key text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_verified_study_time(p_course_key);
$$;

create or replace function private.sync_course_activity(
  p_course_key text,
  p_practice_answers integer,
  p_study_seconds bigint
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
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_practice_answers > 10000000 then
    raise exception 'Invalid activity metrics' using errcode = '22023';
  end if;

  return query
  update public.course_enrollments
  set practice_answers = v_practice_answers,
      last_activity_at = now(),
      updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status in ('active', 'completed')
  returning *;

  if not found then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;
end;
$$;

revoke all on function private.learning_activity_elapsed_seconds(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.begin_learning_activity(text, text, integer) from public, anon, authenticated;
revoke all on function private.begin_learning_activity(text, text) from public, anon, authenticated;
revoke all on function private.touch_learning_activity(uuid) from public, anon, authenticated;
revoke all on function private.end_learning_activity(uuid) from public, anon, authenticated;
revoke all on function private.get_verified_study_time(text) from public, anon, authenticated;
revoke all on function public.begin_learning_activity(text, text, integer) from public, anon, authenticated;
revoke all on function public.begin_learning_activity(text, text) from public, anon, authenticated;
revoke all on function public.touch_learning_activity(uuid) from public, anon, authenticated;
revoke all on function public.end_learning_activity(uuid) from public, anon, authenticated;
revoke all on function public.get_verified_study_time(text) from public, anon, authenticated;

grant execute on function private.begin_learning_activity(text, text, integer) to authenticated;
grant execute on function private.begin_learning_activity(text, text) to authenticated;
grant execute on function private.touch_learning_activity(uuid) to authenticated;
grant execute on function private.end_learning_activity(uuid) to authenticated;
grant execute on function private.get_verified_study_time(text) to authenticated;
grant execute on function public.begin_learning_activity(text, text, integer) to authenticated;
grant execute on function public.begin_learning_activity(text, text) to authenticated;
grant execute on function public.touch_learning_activity(uuid) to authenticated;
grant execute on function public.end_learning_activity(uuid) to authenticated;
grant execute on function public.get_verified_study_time(text) to authenticated;

comment on column public.course_enrollments.verified_study_seconds is
  'Server-computed study time from authenticated learning session heartbeats; clients cannot submit this value.';
comment on column public.course_enrollments.study_verification_started_at is
  'Boundary after which study time is computed from verified server events.';
comment on table private.learning_activity_sessions is
  'Immutable-session history for reading, practice, simulator, and final-exam activity with server-computed duration.';
comment on function public.begin_learning_activity(text, text, integer) is
  'Starts one authenticated learning session and closes any previous active session for the user.';
comment on function public.touch_learning_activity(uuid) is
  'Adds at most 45 seconds using database time and ignores heartbeats after 90 seconds of inactivity.';
comment on function public.get_verified_study_time(text) is
  'Returns the authenticated user verified time totals by course, chapter, and activity type.';
