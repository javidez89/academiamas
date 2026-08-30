-- The server-authoritative frontend reached production after this transition
-- window. Preserve browser-managed rows created before that release as
-- non-authoritative history, without changing verified activity or eligibility.
insert into private.legacy_course_progress_snapshots (
  user_id,
  course_key,
  schema_version,
  progress,
  enrollment_snapshot,
  source_updated_at
)
select
  progress.user_id,
  progress.course_key,
  progress.schema_version,
  progress.progress,
  jsonb_strip_nulls(jsonb_build_object(
    'status', enrollment.status,
    'started_at', enrollment.started_at,
    'cancelled_at', enrollment.cancelled_at,
    'last_activity_at', enrollment.last_activity_at,
    'estimated_hours', enrollment.estimated_hours,
    'study_seconds', enrollment.study_seconds,
    'simulator_attempts', enrollment.simulator_attempts,
    'practice_answers', enrollment.practice_answers,
    'best_simulator_score', enrollment.best_simulator_score,
    'final_exam_attempts', enrollment.final_exam_attempts,
    'best_final_exam_score', enrollment.best_final_exam_score,
    'final_exam_passed', enrollment.final_exam_passed,
    'final_exam_passed_at', enrollment.final_exam_passed_at,
    'completed_at', enrollment.completed_at
  )),
  progress.updated_at
from public.course_progress as progress
join public.course_enrollments as enrollment
  on enrollment.user_id = progress.user_id
 and enrollment.course_key = progress.course_key
where enrollment.created_at < timestamptz '2026-08-30 17:00:00+00'
  and jsonb_typeof(progress.progress) = 'object'
on conflict (user_id, course_key) do nothing;

comment on table private.legacy_course_progress_snapshots is
  'Immutable browser-managed learning history captured before the server-authoritative production release. It is visible as unverified history and never grants exam or certificate eligibility.';
