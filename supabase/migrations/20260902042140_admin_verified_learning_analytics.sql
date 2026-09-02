create index if not exists learning_activity_sessions_started_course_analytics_idx
  on private.learning_activity_sessions (started_at, course_key)
  include (user_id, duration_seconds, activity_type);

create index if not exists verified_assessment_attempts_completed_course_analytics_idx
  on private.verified_assessment_attempts (completed_at, course_key, activity_type)
  include (user_id, status, score, passed)
  where completed_at is not null;

create index if not exists course_enrollments_created_course_analytics_idx
  on public.course_enrollments (created_at, course_key)
  include (user_id, status);

create index if not exists course_enrollments_cancelled_course_analytics_idx
  on public.course_enrollments (cancelled_at, course_key)
  include (user_id)
  where cancelled_at is not null;

create index if not exists certificate_orders_approved_course_analytics_idx
  on public.certificate_orders (approved_at, course_key)
  include (amount_in_cents)
  where status = 'APPROVED' and approved_at is not null;

create or replace function private.admin_verified_learning_analytics(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_course_key text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_to timestamptz := least(coalesce(p_to, now()), now());
  v_from timestamptz := coalesce(p_from, least(coalesce(p_to, now()), now()) - interval '30 days');
  v_course_key text := nullif(lower(trim(coalesce(p_course_key, ''))), '');
  v_result jsonb;
begin
  perform private.require_platform_admin();

  if v_from >= v_to or v_to - v_from > interval '366 days' then
    raise exception 'Invalid analytics period' using errcode = '22023';
  end if;
  if v_course_key is not null and v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_course_key is not null and not exists (
    select 1
    from private.course_chapter_requirements as requirement
    where requirement.course_key = v_course_key
  ) then
    raise exception 'Unknown course key' using errcode = '22023';
  end if;

  with
  course_catalog as (
    select distinct requirement.course_key
    from private.course_chapter_requirements as requirement
    where v_course_key is null or requirement.course_key = v_course_key
  ),
  period_sessions as (
    select session.*
    from private.learning_activity_sessions as session
    where session.started_at >= v_from
      and session.started_at < v_to
      and (v_course_key is null or session.course_key = v_course_key)
  ),
  period_attempts as (
    select attempt.*
    from private.verified_assessment_attempts as attempt
    where attempt.status = 'completed'
      and attempt.completed_at >= v_from
      and attempt.completed_at < v_to
      and (v_course_key is null or attempt.course_key = v_course_key)
  ),
  period_enrollments as (
    select enrollment.*
    from public.course_enrollments as enrollment
    where enrollment.created_at >= v_from
      and enrollment.created_at < v_to
      and (v_course_key is null or enrollment.course_key = v_course_key)
  ),
  current_enrollments as (
    select enrollment.*
    from public.course_enrollments as enrollment
    where enrollment.status <> 'cancelled'
      and (v_course_key is null or enrollment.course_key = v_course_key)
  ),
  period_cancellations as (
    select enrollment.*
    from public.course_enrollments as enrollment
    where enrollment.cancelled_at >= v_from
      and enrollment.cancelled_at < v_to
      and (v_course_key is null or enrollment.course_key = v_course_key)
  ),
  period_certificates as (
    select certificate.*
    from public.certificates as certificate
    where certificate.issued_at >= v_from
      and certificate.issued_at < v_to
      and (v_course_key is null or certificate.course_key = v_course_key)
  ),
  period_orders as (
    select certificate_order.*
    from public.certificate_orders as certificate_order
    where certificate_order.status = 'APPROVED'
      and certificate_order.approved_at >= v_from
      and certificate_order.approved_at < v_to
      and (v_course_key is null or certificate_order.course_key = v_course_key)
  ),
  course_metrics as (
    select
      catalog.course_key,
      (select count(distinct enrollment.user_id) from current_enrollments as enrollment where enrollment.course_key = catalog.course_key)::integer as enrolled_users,
      (select count(*) from period_enrollments as enrollment where enrollment.course_key = catalog.course_key)::integer as new_enrollments,
      (select count(distinct session.user_id) from period_sessions as session where session.course_key = catalog.course_key)::integer as active_learners,
      (select count(*) from period_sessions as session where session.course_key = catalog.course_key)::integer as learning_sessions,
      (select coalesce(sum(session.duration_seconds), 0) from period_sessions as session where session.course_key = catalog.course_key)::bigint as study_seconds,
      (select count(*) from period_attempts as attempt where attempt.course_key = catalog.course_key and attempt.activity_type = 'practice')::integer as practice_attempts,
      (select count(*) from period_attempts as attempt where attempt.course_key = catalog.course_key and attempt.activity_type = 'simulator')::integer as simulator_attempts,
      (select count(*) from period_attempts as attempt where attempt.course_key = catalog.course_key and attempt.activity_type = 'final_exam')::integer as final_exam_attempts,
      (select count(*) from period_attempts as attempt where attempt.course_key = catalog.course_key and attempt.activity_type = 'final_exam' and attempt.passed)::integer as final_exams_passed,
      coalesce((select round(avg(attempt.score), 1) from period_attempts as attempt where attempt.course_key = catalog.course_key and attempt.activity_type = 'final_exam'), 0)::numeric(5,1) as average_final_score,
      (select count(*) from period_certificates as certificate where certificate.course_key = catalog.course_key)::integer as certificates_issued,
      (select count(*) from period_cancellations as enrollment where enrollment.course_key = catalog.course_key)::integer as cancellations
    from course_catalog as catalog
  ),
  day_range as (
    select generate_series(
      (v_from at time zone 'America/Bogota')::date,
      ((v_to - interval '1 millisecond') at time zone 'America/Bogota')::date,
      interval '1 day'
    )::date as day
  ),
  session_days as (
    select
      (session.started_at at time zone 'America/Bogota')::date as day,
      count(*)::integer as learning_sessions,
      count(distinct session.user_id)::integer as active_learners,
      coalesce(sum(session.duration_seconds), 0)::bigint as study_seconds
    from period_sessions as session
    group by (session.started_at at time zone 'America/Bogota')::date
  ),
  enrollment_days as (
    select
      (enrollment.created_at at time zone 'America/Bogota')::date as day,
      count(*)::integer as enrollments
    from period_enrollments as enrollment
    group by (enrollment.created_at at time zone 'America/Bogota')::date
  ),
  attempt_days as (
    select
      (attempt.completed_at at time zone 'America/Bogota')::date as day,
      count(*)::integer as assessments,
      count(*) filter (where attempt.activity_type = 'final_exam' and attempt.passed)::integer as final_exams_passed
    from period_attempts as attempt
    group by (attempt.completed_at at time zone 'America/Bogota')::date
  ),
  daily_metrics as (
    select jsonb_build_object(
      'date', day.day,
      'active_learners', coalesce(session.active_learners, 0),
      'learning_sessions', coalesce(session.learning_sessions, 0),
      'study_seconds', coalesce(session.study_seconds, 0),
      'enrollments', coalesce(enrollment.enrollments, 0),
      'assessments', coalesce(attempt.assessments, 0),
      'final_exams_passed', coalesce(attempt.final_exams_passed, 0)
    ) as value
    from day_range as day
    left join session_days as session on session.day = day.day
    left join enrollment_days as enrollment on enrollment.day = day.day
    left join attempt_days as attempt on attempt.day = day.day
  ),
  summary as (
    select jsonb_build_object(
      'registered_users', (select count(*) from auth.users as users where users.created_at < v_to),
      'new_users', (select count(*) from auth.users as users where users.created_at >= v_from and users.created_at < v_to),
      'online_users', (
        select count(distinct profile.id)
        from public.profiles as profile
        where profile.last_seen_at >= now() - interval '2 minutes 30 seconds'
      ),
      'active_learners', (select count(distinct session.user_id) from period_sessions as session),
      'active_courses', (select count(*) from course_catalog),
      'current_enrollments', (select count(*) from current_enrollments),
      'new_enrollments', (select count(*) from period_enrollments),
      'cancellations', (select count(*) from period_cancellations),
      'learning_sessions', (select count(*) from period_sessions),
      'study_seconds', (select coalesce(sum(session.duration_seconds), 0) from period_sessions as session),
      'average_study_minutes', coalesce(round(
        (select sum(session.duration_seconds) from period_sessions as session)::numeric
        / nullif((select count(distinct session.user_id) from period_sessions as session), 0)
        / 60.0,
        1
      ), 0),
      'practice_attempts', (select count(*) from period_attempts as attempt where attempt.activity_type = 'practice'),
      'simulator_attempts', (select count(*) from period_attempts as attempt where attempt.activity_type = 'simulator'),
      'final_exam_attempts', (select count(*) from period_attempts as attempt where attempt.activity_type = 'final_exam'),
      'final_exams_passed', (select count(*) from period_attempts as attempt where attempt.activity_type = 'final_exam' and attempt.passed),
      'final_exam_pass_rate', coalesce(round(
        100.0 * (select count(*) from period_attempts as attempt where attempt.activity_type = 'final_exam' and attempt.passed)
        / nullif((select count(*) from period_attempts as attempt where attempt.activity_type = 'final_exam'), 0),
        1
      ), 0),
      'certificates_issued', (select count(*) from period_certificates),
      'certificate_revenue_cop', (select coalesce(sum(certificate_order.amount_in_cents), 0) / 100 from period_orders as certificate_order)
    ) as value
  )
  select jsonb_build_object(
    'verified', true,
    'generated_at', now(),
    'timezone', 'America/Bogota',
    'period', jsonb_build_object('from', v_from, 'to', v_to, 'course_key', v_course_key),
    'summary', (select value from summary),
    'courses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'course_key', course.course_key,
        'enrolled_users', course.enrolled_users,
        'new_enrollments', course.new_enrollments,
        'active_learners', course.active_learners,
        'learning_sessions', course.learning_sessions,
        'study_seconds', course.study_seconds,
        'practice_attempts', course.practice_attempts,
        'simulator_attempts', course.simulator_attempts,
        'final_exam_attempts', course.final_exam_attempts,
        'final_exams_passed', course.final_exams_passed,
        'final_exam_pass_rate', case when course.final_exam_attempts > 0 then round(100.0 * course.final_exams_passed / course.final_exam_attempts, 1) else 0 end,
        'average_final_score', course.average_final_score,
        'certificates_issued', course.certificates_issued,
        'cancellations', course.cancellations
      ) order by course.active_learners desc, course.study_seconds desc, course.course_key)
      from course_metrics as course
    ), '[]'::jsonb),
    'daily', coalesce((select jsonb_agg(day.value order by day.value ->> 'date') from daily_metrics as day), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.admin_verified_learning_analytics(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_course_key text default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.admin_verified_learning_analytics(p_from, p_to, p_course_key);
$$;

revoke all on function private.admin_verified_learning_analytics(timestamptz, timestamptz, text) from public, anon, authenticated;
revoke all on function public.admin_verified_learning_analytics(timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function private.admin_verified_learning_analytics(timestamptz, timestamptz, text) to authenticated;
grant execute on function public.admin_verified_learning_analytics(timestamptz, timestamptz, text) to authenticated;

comment on function public.admin_verified_learning_analytics(timestamptz, timestamptz, text) is
  'Returns read-only, server-aggregated learning metrics for platform administrators. It never reads browser-managed progress.';
