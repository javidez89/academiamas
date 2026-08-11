alter table public.course_enrollments
  add column study_seconds bigint not null default 0,
  add column final_exam_attempts integer not null default 0,
  add column best_final_exam_score numeric(5,2) not null default 0,
  add column final_exam_passed boolean not null default false,
  add column final_exam_passed_at timestamptz,
  add column completed_at timestamptz,
  add constraint course_enrollments_study_seconds_check
    check (study_seconds >= 0 and study_seconds <= 315360000),
  add constraint course_enrollments_final_exam_attempts_check
    check (final_exam_attempts >= 0),
  add constraint course_enrollments_final_exam_score_check
    check (best_final_exam_score >= 0 and best_final_exam_score <= 100),
  add constraint course_enrollments_final_exam_passed_at_check
    check ((final_exam_passed and final_exam_passed_at is not null) or not final_exam_passed),
  add constraint course_enrollments_completed_at_check
    check ((status = 'completed' and completed_at is not null) or status <> 'completed');

create table public.course_final_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  score numeric(5,2) not null,
  earned_points numeric(8,2) not null,
  total_points numeric(8,2) not null,
  passing_points numeric(8,2) not null,
  correct_answers integer not null,
  total_questions integer not null,
  duration_seconds integer not null,
  passed boolean not null,
  completed_at timestamptz not null default now(),
  constraint course_final_exam_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_final_exam_score_check
    check (score >= 0 and score <= 100),
  constraint course_final_exam_points_check
    check (
      total_points > 0
      and earned_points >= 0
      and earned_points <= total_points
      and passing_points > 0
      and passing_points <= total_points
    ),
  constraint course_final_exam_answers_check
    check (
      total_questions > 0
      and correct_answers >= 0
      and correct_answers <= total_questions
    ),
  constraint course_final_exam_duration_check
    check (duration_seconds >= 0 and duration_seconds <= 86400),
  constraint course_final_exam_passed_check
    check (passed = (earned_points >= passing_points))
);

create index course_final_exam_attempts_user_course_idx
  on public.course_final_exam_attempts (user_id, course_key, completed_at desc);
create index course_final_exam_attempts_course_passed_idx
  on public.course_final_exam_attempts (course_key, passed, completed_at desc);

alter table public.course_final_exam_attempts enable row level security;

revoke all on table public.course_final_exam_attempts from anon, authenticated;
grant select on table public.course_final_exam_attempts to authenticated;

create policy course_final_exam_attempts_select_own
  on public.course_final_exam_attempts
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

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
    set status = case
          when public.course_enrollments.final_exam_passed then 'completed'
          else 'active'
        end,
        cancelled_at = null,
        completed_at = case
          when public.course_enrollments.final_exam_passed
            then coalesce(public.course_enrollments.completed_at, public.course_enrollments.final_exam_passed_at, now())
          else null
        end,
        estimated_hours = excluded.estimated_hours,
        last_activity_at = now(),
        updated_at = now()
  returning *;
end;
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
  v_study_seconds bigint := greatest(coalesce(p_study_seconds, 0), 0);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_practice_answers > 10000000 or v_study_seconds > 315360000 then
    raise exception 'Invalid activity metrics' using errcode = '22023';
  end if;

  return query
  update public.course_enrollments
    set practice_answers = greatest(practice_answers, v_practice_answers),
        study_seconds = greatest(study_seconds, v_study_seconds),
        last_activity_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status in ('active', 'completed')
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
    and status in ('active', 'completed')
  returning *;

  if not found then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.record_final_exam_completion(
  p_course_key text,
  p_score numeric,
  p_earned_points numeric,
  p_total_points numeric,
  p_passing_points numeric,
  p_correct_answers integer,
  p_total_questions integer,
  p_duration_seconds integer
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
  v_earned numeric := round(coalesce(p_earned_points, 0), 2);
  v_total numeric := round(coalesce(p_total_points, 0), 2);
  v_passing numeric := round(coalesce(p_passing_points, 0), 2);
  v_correct integer := coalesce(p_correct_answers, 0);
  v_questions integer := coalesce(p_total_questions, 0);
  v_duration integer := greatest(coalesce(p_duration_seconds, 0), 0);
  v_passed boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$'
    or v_score < 0 or v_score > 100
    or v_total <= 0 or v_earned < 0 or v_earned > v_total
    or v_passing <= 0 or v_passing > v_total
    or v_questions <= 0 or v_correct < 0 or v_correct > v_questions
    or v_duration > 86400 then
    raise exception 'Invalid final exam result' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.course_enrollments
    where user_id = v_user_id
      and course_key = v_course_key
      and status in ('active', 'completed')
  ) then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;

  v_passed := v_earned >= v_passing;

  insert into public.course_final_exam_attempts (
    user_id, course_key, score, earned_points, total_points, passing_points,
    correct_answers, total_questions, duration_seconds, passed
  ) values (
    v_user_id, v_course_key, v_score, v_earned, v_total, v_passing,
    v_correct, v_questions, v_duration, v_passed
  );

  return query
  update public.course_enrollments
    set final_exam_attempts = final_exam_attempts + 1,
        best_final_exam_score = greatest(best_final_exam_score, v_score),
        final_exam_passed = final_exam_passed or v_passed,
        final_exam_passed_at = case
          when v_passed then coalesce(final_exam_passed_at, now())
          else final_exam_passed_at
        end,
        status = case when v_passed or final_exam_passed then 'completed' else status end,
        completed_at = case
          when v_passed or final_exam_passed then coalesce(completed_at, now())
          else completed_at
        end,
        last_activity_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
  returning *;
end;
$$;

create or replace function public.sync_course_activity(
  p_course_key text,
  p_practice_answers integer,
  p_study_seconds bigint
)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.sync_course_activity(p_course_key, p_practice_answers, p_study_seconds);
$$;

create or replace function public.record_final_exam_completion(
  p_course_key text,
  p_score numeric,
  p_earned_points numeric,
  p_total_points numeric,
  p_passing_points numeric,
  p_correct_answers integer,
  p_total_questions integer,
  p_duration_seconds integer
)
returns setof public.course_enrollments
language sql
security invoker
set search_path = ''
as $$
  select * from private.record_final_exam_completion(
    p_course_key,
    p_score,
    p_earned_points,
    p_total_points,
    p_passing_points,
    p_correct_answers,
    p_total_questions,
    p_duration_seconds
  );
$$;

revoke all on function private.sync_course_activity(text, integer, bigint) from public, anon;
revoke all on function private.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) from public, anon;
revoke all on function public.sync_course_activity(text, integer, bigint) from public, anon;
revoke all on function public.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) from public, anon;

grant execute on function private.sync_course_activity(text, integer, bigint) to authenticated;
grant execute on function private.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) to authenticated;
grant execute on function public.sync_course_activity(text, integer, bigint) to authenticated;
grant execute on function public.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) to authenticated;
