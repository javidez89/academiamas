-- Progress v2 is additive and monotonic. Existing verified progress is captured as
-- a floor before the new practice-achievement rule becomes active.

create table if not exists private.verified_progress_checkpoints (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  progress_floor_percent integer not null default 0,
  rule_version text not null default 'practice_achievements_v2',
  captured_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_key),
  constraint verified_progress_checkpoint_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint verified_progress_checkpoint_percent_check
    check (progress_floor_percent between 0 and 100)
);

create table if not exists private.chapter_practice_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  chapter_id integer not null,
  achieved_at timestamptz not null default now(),
  question_count integer not null,
  rule_version text not null default 'practice_achievements_v2',
  primary key (user_id, course_key, chapter_id),
  constraint chapter_practice_achievement_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint chapter_practice_achievement_chapter_check
    check (chapter_id between 1 and 999),
  constraint chapter_practice_achievement_questions_check
    check (question_count > 0)
);

create table if not exists private.practice_question_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  question_id text not null,
  chapter_id integer not null,
  achieved_at timestamptz not null default now(),
  primary key (user_id, course_key, question_id),
  constraint practice_question_achievement_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint practice_question_achievement_question_check
    check (char_length(question_id) between 1 and 120),
  constraint practice_question_achievement_chapter_check
    check (chapter_id between 1 and 999)
);

create index if not exists chapter_practice_achievements_course_idx
  on private.chapter_practice_achievements (user_id, course_key, achieved_at desc);

alter table private.verified_progress_checkpoints enable row level security;
alter table private.chapter_practice_achievements enable row level security;
alter table private.practice_question_achievements enable row level security;
revoke all on table private.verified_progress_checkpoints from public, anon, authenticated;
revoke all on table private.chapter_practice_achievements from public, anon, authenticated;
revoke all on table private.practice_question_achievements from public, anon, authenticated;

-- Capture the value visible immediately before the rule change. No existing
-- enrollment, progress JSON, session, attempt, or answer is rewritten.
with user_dashboards as (
  select distinct enrollment.user_id,
    private.authoritative_learning_dashboard(enrollment.user_id) as dashboard
  from public.course_enrollments as enrollment
), current_progress as (
  select dashboard.user_id,
    course.value->>'course_key' as course_key,
    greatest(0, least(100, coalesce((course.value->>'progress_percent')::integer, 0))) as progress_percent
  from user_dashboards as dashboard
  cross join lateral jsonb_array_elements(dashboard.dashboard->'courses') as course(value)
)
insert into private.verified_progress_checkpoints (
  user_id, course_key, progress_floor_percent, captured_at, updated_at
)
select user_id, course_key, progress_percent, now(), now()
from current_progress
where course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'
on conflict (user_id, course_key) do update set
  progress_floor_percent = greatest(
    private.verified_progress_checkpoints.progress_floor_percent,
    excluded.progress_floor_percent
  ),
  updated_at = now();

-- A correct answer is an immutable achievement: a later retry cannot erase it.
insert into private.practice_question_achievements (
  user_id, course_key, question_id, chapter_id, achieved_at
)
select distinct on (attempt.user_id, attempt.course_key, question.question_id)
  attempt.user_id, attempt.course_key, question.question_id, question.chapter_id, question.answered_at
from private.verified_assessment_attempts as attempt
join private.verified_assessment_questions as question on question.attempt_id = attempt.id
join private.assessment_question_registry as registry
  on registry.course_key = attempt.course_key
 and registry.question_id = question.question_id
 and registry.active
where attempt.activity_type = 'practice'
  and question.answered_at is not null
  and question.is_correct is true
order by attempt.user_id, attempt.course_key, question.question_id, question.answered_at
on conflict (user_id, course_key, question_id) do nothing;

with active_requirements as (
  select registry.course_key, registry.chapter_id, count(*)::integer as question_count
  from private.assessment_question_registry as registry
  where registry.active
  group by registry.course_key, registry.chapter_id
), correct_achievements as (
  select achievement.user_id, achievement.course_key, achievement.chapter_id,
    count(*)::integer as correct_count,
    max(achievement.achieved_at) as achieved_at
  from private.practice_question_achievements as achievement
  join private.assessment_question_registry as registry
    on registry.course_key = achievement.course_key
   and registry.question_id = achievement.question_id
   and registry.active
  group by achievement.user_id, achievement.course_key, achievement.chapter_id
)
insert into private.chapter_practice_achievements (
  user_id, course_key, chapter_id, achieved_at, question_count
)
select achievement.user_id, achievement.course_key, achievement.chapter_id,
  coalesce(achievement.achieved_at, now()), requirement.question_count
from correct_achievements as achievement
join active_requirements as requirement
  on requirement.course_key = achievement.course_key
 and requirement.chapter_id = achievement.chapter_id
where achievement.correct_count >= requirement.question_count
on conflict (user_id, course_key, chapter_id) do nothing;

create or replace function private.practice_achievement_course_metrics(
  p_user_id uuid,
  p_course_key text
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with requirements as (
    select requirement.chapter_id,
      requirement.title,
      requirement.suggested_minutes,
      greatest(requirement.objective_count, count(distinct registry.learning_objective))::integer as objective_count,
      count(registry.question_id)::integer as question_count
    from private.course_chapter_requirements as requirement
    left join private.assessment_question_registry as registry
      on registry.course_key = requirement.course_key
     and registry.chapter_id = requirement.chapter_id
     and registry.active
    where requirement.course_key = lower(trim(p_course_key))
    group by requirement.chapter_id, requirement.title, requirement.suggested_minutes, requirement.objective_count
  ), answer_rollup as (
    select question.chapter_id,
      question.question_id,
      max(question.answered_at) as last_answered_at
    from private.verified_assessment_attempts as attempt
    join private.verified_assessment_questions as question on question.attempt_id = attempt.id
    join private.assessment_question_registry as registry
      on registry.course_key = attempt.course_key
     and registry.question_id = question.question_id
     and registry.active
    where attempt.user_id = p_user_id
      and attempt.course_key = lower(trim(p_course_key))
      and attempt.activity_type = 'practice'
      and question.answered_at is not null
    group by question.chapter_id, question.question_id
  ), answer_counts as (
    select answer.chapter_id,
      count(*)::integer as unique_answered,
      max(answer.last_answered_at) as last_answered_at
    from answer_rollup as answer
    group by answer.chapter_id
  ), achievement_counts as (
    select achievement.chapter_id, count(*)::integer as unique_correct
    from private.practice_question_achievements as achievement
    join private.assessment_question_registry as registry
      on registry.course_key = achievement.course_key
     and registry.question_id = achievement.question_id
     and registry.active
    where achievement.user_id = p_user_id
      and achievement.course_key = lower(trim(p_course_key))
    group by achievement.chapter_id
  ), chapter_rows as (
    select requirement.*,
      coalesce(answer.unique_answered, 0)::integer as unique_answered,
      coalesce(correct.unique_correct, 0)::integer as unique_correct,
      answer.last_answered_at,
      achievement.achieved_at,
      case when requirement.question_count > 0 then least(100, round(
        100.0 * coalesce(answer.unique_answered, 0) / requirement.question_count
      ))::integer else 0 end as practice_coverage,
      case
        when requirement.question_count > 0 and coalesce(correct.unique_correct, 0) >= requirement.question_count then 100
        when requirement.question_count > 0 then least(100, round(
          100.0 * coalesce(correct.unique_correct, 0) / requirement.question_count
        ))::integer
        else 0
      end as practice_mastery,
      requirement.question_count > 0
        and coalesce(correct.unique_correct, 0) >= requirement.question_count as practice_complete
    from requirements as requirement
    left join answer_counts as answer on answer.chapter_id = requirement.chapter_id
    left join achievement_counts as correct on correct.chapter_id = requirement.chapter_id
    left join private.chapter_practice_achievements as achievement
      on achievement.user_id = p_user_id
     and achievement.course_key = lower(trim(p_course_key))
     and achievement.chapter_id = requirement.chapter_id
  )
  select jsonb_build_object(
    'chapter_count', count(*),
    'completed_chapters', count(*) filter (where practice_complete),
    'chapter_average', coalesce(round(avg(practice_mastery)), 0),
    'course_progress_percent', case when count(*) > 0
      then least(95, round(95.0 * count(*) filter (where practice_complete) / count(*))::integer)
      else 0 end,
    'question_count', coalesce(sum(question_count), 0),
    'unique_answered', coalesce(sum(unique_answered), 0),
    'unique_correct', coalesce(sum(unique_correct), 0),
    'chapters', coalesce(jsonb_agg(jsonb_build_object(
      'chapter_id', chapter_id,
      'title', title,
      'suggested_minutes', suggested_minutes,
      'objective_count', objective_count,
      'question_count', question_count,
      'unique_answered', unique_answered,
      'unique_correct', unique_correct,
      'practice_coverage', practice_coverage,
      'domain', practice_mastery,
      'coverage', practice_mastery,
      'practice_complete', practice_complete,
      'practice_achieved_at', achieved_at,
      'last_answered_at', last_answered_at
    ) order by chapter_id), '[]'::jsonb)
  )
  from chapter_rows;
$$;

create or replace function private.refresh_practice_achievement_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt private.verified_assessment_attempts%rowtype;
  v_required integer := 0;
  v_correct integer := 0;
  v_metrics jsonb;
  v_candidate integer := 0;
begin
  if new.answered_at is null or new.is_correct is not true then
    return new;
  end if;

  select attempt.* into v_attempt
  from private.verified_assessment_attempts as attempt
  where attempt.id = new.attempt_id;

  if not found or v_attempt.activity_type <> 'practice' then
    return new;
  end if;

  insert into private.practice_question_achievements (
    user_id, course_key, question_id, chapter_id, achieved_at
  ) values (
    v_attempt.user_id, v_attempt.course_key, new.question_id, new.chapter_id, new.answered_at
  ) on conflict (user_id, course_key, question_id) do nothing;

  select count(*)::integer into v_required
  from private.assessment_question_registry as registry
  where registry.course_key = v_attempt.course_key
    and registry.chapter_id = new.chapter_id
    and registry.active;

  select count(*)::integer into v_correct
  from private.practice_question_achievements as achievement
  join private.assessment_question_registry as registry
    on registry.course_key = achievement.course_key
   and registry.question_id = achievement.question_id
   and registry.active
  where achievement.user_id = v_attempt.user_id
    and achievement.course_key = v_attempt.course_key
    and achievement.chapter_id = new.chapter_id;

  if v_required > 0 and v_correct >= v_required then
    insert into private.chapter_practice_achievements (
      user_id, course_key, chapter_id, achieved_at, question_count
    ) values (
      v_attempt.user_id, v_attempt.course_key, new.chapter_id, now(), v_required
    ) on conflict (user_id, course_key, chapter_id) do update set
      achieved_at = case
        when private.chapter_practice_achievements.question_count < excluded.question_count then excluded.achieved_at
        else private.chapter_practice_achievements.achieved_at
      end,
      question_count = greatest(private.chapter_practice_achievements.question_count, excluded.question_count);
  end if;

  v_metrics := private.practice_achievement_course_metrics(v_attempt.user_id, v_attempt.course_key);
  v_candidate := least(95, greatest(0, coalesce((v_metrics->>'course_progress_percent')::integer, 0)));

  insert into private.verified_progress_checkpoints (
    user_id, course_key, progress_floor_percent, captured_at, updated_at
  ) values (
    v_attempt.user_id, v_attempt.course_key, v_candidate, now(), now()
  ) on conflict (user_id, course_key) do update set
    progress_floor_percent = greatest(
      private.verified_progress_checkpoints.progress_floor_percent,
      excluded.progress_floor_percent
    ),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists refresh_practice_achievement_progress on private.verified_assessment_questions;
create trigger refresh_practice_achievement_progress
after update of is_correct, answered_at on private.verified_assessment_questions
for each row execute function private.refresh_practice_achievement_progress();

-- Backfill the checkpoint with achievements already present. The greater value
-- wins, so this operation can only preserve or increase the protected floor.
with candidates as (
  select enrollment.user_id, enrollment.course_key,
    least(95, greatest(0, coalesce(
      (private.practice_achievement_course_metrics(enrollment.user_id, enrollment.course_key)->>'course_progress_percent')::integer,
      0
    ))) as progress_percent
  from public.course_enrollments as enrollment
)
insert into private.verified_progress_checkpoints (
  user_id, course_key, progress_floor_percent, captured_at, updated_at
)
select user_id, course_key, progress_percent, now(), now()
from candidates
on conflict (user_id, course_key) do update set
  progress_floor_percent = greatest(
    private.verified_progress_checkpoints.progress_floor_percent,
    excluded.progress_floor_percent
  ),
  updated_at = now();

do $$
begin
  if to_regprocedure('private.authoritative_learning_dashboard_v1(uuid)') is null then
    alter function private.authoritative_learning_dashboard(uuid)
      rename to authoritative_learning_dashboard_v1;
  end if;
end;
$$;

create or replace function private.authoritative_learning_dashboard(p_user_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_base jsonb := private.authoritative_learning_dashboard_v1(p_user_id);
  v_courses jsonb := '[]'::jsonb;
  v_course jsonb;
  v_metrics jsonb;
  v_chapters jsonb;
  v_floor integer;
  v_calculated integer;
  v_effective integer;
  v_mastery integer;
  v_summary jsonb;
begin
  for v_course in select value from jsonb_array_elements(coalesce(v_base->'courses', '[]'::jsonb))
  loop
    v_metrics := private.practice_achievement_course_metrics(p_user_id, v_course->>'course_key');
    select coalesce(checkpoint.progress_floor_percent, 0)
    into v_floor
    from private.verified_progress_checkpoints as checkpoint
    where checkpoint.user_id = p_user_id
      and checkpoint.course_key = v_course->>'course_key';

    v_floor := coalesce(v_floor, 0);
    v_calculated := least(95, greatest(0, coalesce((v_metrics->>'course_progress_percent')::integer, 0)));
    v_effective := case when coalesce((v_course->>'final_exam_passed')::boolean, false)
      then 100 else greatest(v_floor, v_calculated) end;
    v_mastery := least(100, greatest(0, round((
      coalesce((v_metrics->>'chapter_average')::numeric, 0) * 95
      + coalesce((v_course->>'best_final_exam_score')::numeric, 0) * 5
    ) / 100)::integer));

    select coalesce(jsonb_agg(
      chapter.value || coalesce((
        select metric.value
        from jsonb_array_elements(coalesce(v_metrics->'chapters', '[]'::jsonb)) as metric(value)
        where metric.value->>'chapter_id' = chapter.value->>'chapter_id'
        limit 1
      ), '{}'::jsonb)
      order by (chapter.value->>'chapter_id')::integer
    ), '[]'::jsonb)
    into v_chapters
    from jsonb_array_elements(coalesce(v_course->'chapters', '[]'::jsonb)) as chapter(value);

    v_courses := v_courses || jsonb_build_array(v_course || jsonb_build_object(
      'chapters', v_chapters,
      'chapter_average', coalesce((v_metrics->>'chapter_average')::integer, 0),
      'chapter_domain_average', coalesce((v_metrics->>'chapter_average')::integer, 0),
      'completed_chapters', coalesce((v_metrics->>'completed_chapters')::integer, 0),
      'practice_answers', coalesce((v_metrics->>'unique_answered')::integer, 0),
      'practice_correct', coalesce((v_metrics->>'unique_correct')::integer, 0),
      'progress_percent', v_effective,
      'progress_floor_percent', v_floor,
      'calculated_progress_percent', v_calculated,
      'mastery_percent', v_mastery,
      'final_exam_eligible', coalesce((v_course->>'final_exam_passed')::boolean, false) or v_effective >= 95,
      'progress_rule', 'practice_achievements_v2'
    ));
  end loop;

  select jsonb_build_object(
    'enrolled_courses', count(*) filter (where course.value->>'legacy_status' <> 'cancelled'),
    'completed_courses', count(*) filter (where course.value->>'legacy_status' <> 'cancelled' and (course.value->>'final_exam_passed')::boolean),
    'progress_percent', coalesce(round(avg((course.value->>'progress_percent')::numeric) filter (where course.value->>'legacy_status' <> 'cancelled')), 0),
    'mastery_percent', coalesce(round(avg((course.value->>'mastery_percent')::numeric) filter (where course.value->>'legacy_status' <> 'cancelled')), 0),
    'study_seconds', coalesce(sum((course.value->>'study_seconds')::bigint) filter (where course.value->>'legacy_status' <> 'cancelled'), 0),
    'simulator_attempts', coalesce(sum((course.value->>'simulator_attempts')::integer) filter (where course.value->>'legacy_status' <> 'cancelled'), 0),
    'final_exam_attempts', coalesce(sum((course.value->>'final_exam_attempts')::integer) filter (where course.value->>'legacy_status' <> 'cancelled'), 0),
    'progress_rule', 'practice_achievements_v2'
  ) into v_summary
  from jsonb_array_elements(v_courses) as course(value);

  return v_base || jsonb_build_object(
    'courses', v_courses,
    'summary', v_summary,
    'progress_rule', 'practice_achievements_v2'
  );
end;
$$;

-- Keep valid attempts from different tabs or devices independent. Only stale
-- attempts may be auto-abandoned when a new one starts.
drop index if exists private.verified_assessment_attempts_one_active_user_idx;
create index if not exists verified_assessment_attempts_active_user_idx
  on private.verified_assessment_attempts (user_id, started_at desc)
  where status = 'active';

create or replace function private.protect_live_verified_attempts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'active' and new.status = 'abandoned' then
    if old.activity_type = 'practice' and old.started_at >= now() - interval '24 hours' then
      return null;
    end if;
    if old.activity_type in ('simulator', 'final_exam')
      and (old.deadline_at is null or old.deadline_at >= now() - interval '60 seconds') then
      return null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_live_verified_attempts on private.verified_assessment_attempts;
create trigger protect_live_verified_attempts
before update of status on private.verified_assessment_attempts
for each row execute function private.protect_live_verified_attempts();

revoke all on function private.authoritative_learning_dashboard_v1(uuid) from public, anon, authenticated;
revoke all on function private.authoritative_learning_dashboard(uuid) from public, anon, authenticated;
revoke all on function private.practice_achievement_course_metrics(uuid, text) from public, anon, authenticated;
revoke all on function private.refresh_practice_achievement_progress() from public, anon, authenticated;
revoke all on function private.protect_live_verified_attempts() from public, anon, authenticated;

comment on table private.verified_progress_checkpoints is
  'Monotonic floor that prevents a verified course percentage from decreasing after rule or curriculum changes.';
comment on table private.chapter_practice_achievements is
  'Permanent achievement awarded when every active practice question in a chapter has been answered correctly at least once.';
comment on table private.practice_question_achievements is
  'Immutable server-side record that a user answered a practice question correctly at least once.';
comment on function private.authoritative_learning_dashboard(uuid) is
  'Returns server-authoritative progress based on unique correct practice achievements, preserving the previous verified percentage as a floor.';
