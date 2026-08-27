create table if not exists public.course_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  cancelled_at timestamptz,
  last_activity_at timestamptz not null default now(),
  estimated_hours numeric(6,1) not null,
  simulator_attempts integer not null default 0,
  practice_answers integer not null default 0,
  best_simulator_score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_key),
  constraint course_enrollments_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_enrollments_status_check
    check (status in ('active', 'cancelled', 'completed')),
  constraint course_enrollments_estimated_hours_check
    check (estimated_hours > 0 and estimated_hours <= 500),
  constraint course_enrollments_simulator_attempts_check
    check (simulator_attempts >= 0),
  constraint course_enrollments_practice_answers_check
    check (practice_answers >= 0),
  constraint course_enrollments_best_score_check
    check (best_simulator_score >= 0 and best_simulator_score <= 100),
  constraint course_enrollments_cancelled_at_check
    check ((status = 'cancelled' and cancelled_at is not null) or status <> 'cancelled')
);

create index if not exists course_enrollments_user_status_idx
  on public.course_enrollments (user_id, status);
create index if not exists course_enrollments_course_status_idx
  on public.course_enrollments (course_key, status);

alter table public.course_enrollments enable row level security;

revoke all on table public.course_enrollments from anon, authenticated;
grant select on table public.course_enrollments to authenticated;

drop policy if exists course_enrollments_select_own on public.course_enrollments;
create policy course_enrollments_select_own
  on public.course_enrollments
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create table if not exists public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  schema_version integer not null default 3,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_key),
  constraint course_progress_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_progress_schema_version_check
    check (schema_version > 0 and schema_version <= 100),
  constraint course_progress_object_check
    check (jsonb_typeof(progress) = 'object'),
  constraint course_progress_size_check
    check (octet_length(progress::text) <= 2000000)
);

alter table public.course_progress enable row level security;

revoke all on table public.course_progress from anon, authenticated;
grant select, insert, update on table public.course_progress to authenticated;

drop policy if exists course_progress_select_own on public.course_progress;
create policy course_progress_select_own
  on public.course_progress
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists course_progress_insert_own on public.course_progress;
create policy course_progress_insert_own
  on public.course_progress
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists course_progress_update_own on public.course_progress;
create policy course_progress_update_own
  on public.course_progress
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.enroll_in_course(
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
    user_id,
    course_key,
    status,
    estimated_hours,
    last_activity_at,
    updated_at
  )
  values (
    v_user_id,
    v_course_key,
    'active',
    v_estimated_hours,
    now(),
    now()
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

create or replace function public.cancel_course(p_course_key text)
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

create or replace function public.sync_course_activity(
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

create or replace function public.record_simulator_completion(
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

revoke all on function public.enroll_in_course(text, numeric) from public, anon;
revoke all on function public.cancel_course(text) from public, anon;
revoke all on function public.sync_course_activity(text, integer) from public, anon;
revoke all on function public.record_simulator_completion(text, numeric) from public, anon;

grant execute on function public.enroll_in_course(text, numeric) to authenticated;
grant execute on function public.cancel_course(text) to authenticated;
grant execute on function public.sync_course_activity(text, integer) to authenticated;
grant execute on function public.record_simulator_completion(text, numeric) to authenticated;
