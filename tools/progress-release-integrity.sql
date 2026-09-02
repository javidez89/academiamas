-- Run before and after every progress-related release.
-- The result contains aggregates only; it does not expose user identities.
with dashboard_users as materialized (
  select distinct enrollment.user_id
  from public.course_enrollments as enrollment
), dashboards as materialized (
  select dashboard_users.user_id,
    private.authoritative_learning_dashboard(dashboard_users.user_id) as payload
  from dashboard_users
), courses as materialized (
  select dashboards.user_id,
    course.value->>'course_key' as course_key,
    course.value as course
  from dashboards
  cross join lateral jsonb_array_elements(
    coalesce(dashboards.payload->'courses', '[]'::jsonb)
  ) as course(value)
)
select jsonb_build_object(
  'captured_at', now(),
  'users', (select count(*) from auth.users),
  'profiles', (select count(*) from public.profiles),
  'enrollments', (select count(*) from public.course_enrollments),
  'active_or_completed_enrollments', (
    select count(*)
    from public.course_enrollments
    where status in ('active', 'completed')
  ),
  'progress_histories', (select count(*) from public.course_progress),
  'learning_sessions', (select count(*) from private.learning_activity_sessions),
  'assessment_attempts', (select count(*) from private.verified_assessment_attempts),
  'answered_questions', (
    select count(*)
    from private.verified_assessment_questions
    where answered_at is not null
  ),
  'question_achievements', (select count(*) from private.practice_question_achievements),
  'chapter_achievements', (select count(*) from private.chapter_practice_achievements),
  'progress_floors', (select count(*) from private.verified_progress_checkpoints),
  'progress_above_10', (
    select count(*)
    from courses
    where coalesce((course->>'progress_percent')::integer, 0) > 10
  ),
  'final_exam_eligible', (
    select count(*)
    from courses
    where coalesce((course->>'final_exam_eligible')::boolean, false)
  ),
  'final_exam_passed', (
    select count(*)
    from courses
    where coalesce((course->>'final_exam_passed')::boolean, false)
  ),
  'valid_certificates', (
    select count(*)
    from public.certificates
    where status = 'VALID'
  ),
  'regressions_below_floor', (
    select count(*)
    from courses
    where coalesce((course->>'progress_percent')::integer, 0)
      < coalesce((course->>'progress_floor_percent')::integer, 0)
  )
) as progress_release_integrity;
