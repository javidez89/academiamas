create table private.assessment_blueprints (
  course_key text primary key,
  total_questions integer not null,
  total_points numeric(8,2) not null,
  passing_points numeric(8,2) not null,
  duration_minutes integer not null,
  matrix jsonb not null,
  bank_revision text not null,
  updated_at timestamptz not null default now(),
  constraint assessment_blueprints_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint assessment_blueprints_values_check
    check (
      total_questions between 1 and 200
      and total_points > 0
      and passing_points > 0
      and passing_points <= total_points
      and duration_minutes between 1 and 480
      and jsonb_typeof(matrix) = 'object'
    )
);

create table private.assessment_question_registry (
  course_key text not null,
  question_id text not null,
  chapter_id integer not null,
  k_level text not null,
  learning_objective text not null,
  correct_indices smallint[] not null,
  points numeric(6,2) not null,
  content_fingerprint text not null,
  bank_revision text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (course_key, question_id),
  constraint assessment_question_registry_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint assessment_question_registry_question_id_check
    check (length(question_id) between 1 and 120),
  constraint assessment_question_registry_chapter_check
    check (chapter_id between 1 and 999),
  constraint assessment_question_registry_k_check
    check (k_level ~ '^K[1-9][0-9]*$'),
  constraint assessment_question_registry_objective_check
    check (length(learning_objective) between 1 and 120),
  constraint assessment_question_registry_answers_check
    check (
      cardinality(correct_indices) between 1 and 4
      and correct_indices <@ array[0, 1, 2, 3]::smallint[]
    ),
  constraint assessment_question_registry_points_check
    check (points > 0 and points <= 100),
  constraint assessment_question_registry_fingerprint_check
    check (content_fingerprint ~ '^[a-f0-9]{64}$')
);

create index assessment_question_registry_selection_idx
  on private.assessment_question_registry (course_key, chapter_id, k_level, active);

create table private.verified_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  activity_session_id uuid not null unique
    references private.learning_activity_sessions(session_id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  activity_type text not null,
  status text not null default 'active',
  question_count integer not null,
  answered_count integer not null default 0,
  correct_answers integer not null default 0,
  earned_points numeric(8,2) not null default 0,
  total_points numeric(8,2) not null,
  passing_points numeric(8,2) not null default 0,
  score numeric(5,2) not null default 0,
  passed boolean,
  duration_seconds integer not null default 0,
  deadline_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint verified_assessment_attempts_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint verified_assessment_attempts_type_check
    check (activity_type in ('practice', 'simulator', 'final_exam')),
  constraint verified_assessment_attempts_status_check
    check (status in ('active', 'completed', 'abandoned')),
  constraint verified_assessment_attempts_counts_check
    check (
      question_count between 1 and 200
      and answered_count between 0 and question_count
      and correct_answers between 0 and question_count
    ),
  constraint verified_assessment_attempts_points_check
    check (
      total_points > 0
      and earned_points between 0 and total_points
      and passing_points between 0 and total_points
      and score between 0 and 100
    ),
  constraint verified_assessment_attempts_duration_check
    check (duration_seconds between 0 and 86400),
  constraint verified_assessment_attempts_completion_check
    check (
      (status = 'active' and completed_at is null and passed is null)
      or (status = 'abandoned' and completed_at is not null and passed is null)
      or (status = 'completed' and completed_at is not null)
    )
);

create unique index verified_assessment_attempts_one_active_user_idx
  on private.verified_assessment_attempts (user_id)
  where status = 'active';

create index verified_assessment_attempts_user_course_idx
  on private.verified_assessment_attempts (user_id, course_key, started_at desc);

create table private.verified_assessment_questions (
  attempt_id uuid not null
    references private.verified_assessment_attempts(id) on delete cascade,
  position integer not null,
  course_key text not null,
  question_id text not null,
  chapter_id integer not null,
  k_level text not null,
  learning_objective text not null,
  correct_indices smallint[] not null,
  selected_indices smallint[],
  points numeric(6,2) not null,
  is_correct boolean,
  points_earned numeric(6,2) not null default 0,
  answered_at timestamptz,
  primary key (attempt_id, question_id),
  unique (attempt_id, position),
  constraint verified_assessment_questions_position_check
    check (position between 1 and 200),
  constraint verified_assessment_questions_answers_check
    check (
      cardinality(correct_indices) between 1 and 4
      and correct_indices <@ array[0, 1, 2, 3]::smallint[]
      and (
        selected_indices is null
        or (
          cardinality(selected_indices) between 1 and 4
          and selected_indices <@ array[0, 1, 2, 3]::smallint[]
        )
      )
    ),
  constraint verified_assessment_questions_result_check
    check (
      (answered_at is null and selected_indices is null and is_correct is null and points_earned = 0)
      or (answered_at is not null and selected_indices is not null and is_correct is not null)
    ),
  constraint verified_assessment_questions_points_check
    check (points > 0 and points_earned between 0 and points)
);

create index verified_assessment_questions_latest_idx
  on private.verified_assessment_questions (course_key, question_id, answered_at desc)
  where answered_at is not null;

alter table private.assessment_blueprints enable row level security;
alter table private.assessment_question_registry enable row level security;
alter table private.verified_assessment_attempts enable row level security;
alter table private.verified_assessment_questions enable row level security;

revoke all on table private.assessment_blueprints from public, anon, authenticated;
revoke all on table private.assessment_question_registry from public, anon, authenticated;
revoke all on table private.verified_assessment_attempts from public, anon, authenticated;
revoke all on table private.verified_assessment_questions from public, anon, authenticated;

alter table public.course_final_exam_attempts
  add column verified boolean not null default false,
  add column assessment_attempt_id uuid
    references private.verified_assessment_attempts(id) on delete restrict;

alter table public.course_final_exam_attempts
  add constraint course_final_exam_attempts_verification_check
    check ((verified and assessment_attempt_id is not null) or not verified);

create unique index course_final_exam_attempts_assessment_idx
  on public.course_final_exam_attempts (assessment_attempt_id)
  where assessment_attempt_id is not null;

create or replace function private.normalize_answer_indices(p_indices smallint[])
returns smallint[]
language sql
immutable
security invoker
set search_path = ''
as $$
  select coalesce(array_agg(distinct value order by value), '{}'::smallint[])
  from unnest(coalesce(p_indices, '{}'::smallint[])) as answer(value);
$$;

create or replace function private.start_verified_assessment(
  p_activity_session_id uuid,
  p_question_ids text[]
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_session private.learning_activity_sessions%rowtype;
  v_blueprint private.assessment_blueprints%rowtype;
  v_attempt private.verified_assessment_attempts%rowtype;
  v_question_count integer := coalesce(cardinality(p_question_ids), 0);
  v_registry_count integer := 0;
  v_total_points numeric(8,2) := 0;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_activity_session_id is null or v_question_count not between 1 and 200 then
    raise exception 'Invalid assessment session' using errcode = '22023';
  end if;
  if (select count(distinct question_id) from unnest(p_question_ids) as selected(question_id)) <> v_question_count then
    raise exception 'Duplicate assessment questions' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 1)
  );

  select activity.*
  into v_session
  from private.learning_activity_sessions as activity
  where activity.session_id = p_activity_session_id
    and activity.user_id = v_user_id
    and activity.ended_at is null
    and activity.activity_type in ('practice', 'simulator', 'final_exam')
  for update;

  if not found then
    raise exception 'Active learning session required' using errcode = '42501';
  end if;

  select attempt.*
  into v_attempt
  from private.verified_assessment_attempts as attempt
  where attempt.activity_session_id = p_activity_session_id;

  if found then
    if v_attempt.status <> 'active'
      or (
        select count(*)
        from private.verified_assessment_questions as question
        where question.attempt_id = v_attempt.id
      ) <> v_question_count
      or exists (
        select selected.question_id
        from unnest(p_question_ids) as selected(question_id)
        except
        select question.question_id
        from private.verified_assessment_questions as question
        where question.attempt_id = v_attempt.id
      ) then
      raise exception 'Assessment session already has a different attempt' using errcode = '55000';
    end if;
    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'course_key', v_attempt.course_key,
      'activity_type', v_attempt.activity_type,
      'question_count', v_attempt.question_count,
      'status', v_attempt.status
    );
  end if;

  if not exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_session.course_key
      and enrollment.status in ('active', 'completed')
  ) then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;

  select count(*), coalesce(sum(question.points), 0)
  into v_registry_count, v_total_points
  from private.assessment_question_registry as question
  where question.course_key = v_session.course_key
    and question.question_id = any(p_question_ids)
    and question.active;

  if v_registry_count <> v_question_count then
    raise exception 'Assessment contains unknown or inactive questions' using errcode = '22023';
  end if;

  if v_session.chapter_id is not null and exists (
    select 1
    from private.assessment_question_registry as question
    where question.course_key = v_session.course_key
      and question.question_id = any(p_question_ids)
      and question.chapter_id <> v_session.chapter_id
  ) then
    raise exception 'Assessment contains questions outside the selected chapter' using errcode = '22023';
  end if;

  if v_session.activity_type in ('simulator', 'final_exam') then
    select blueprint.*
    into v_blueprint
    from private.assessment_blueprints as blueprint
    where blueprint.course_key = v_session.course_key;

    if not found
      or v_question_count <> v_blueprint.total_questions
      or v_total_points <> v_blueprint.total_points then
      raise exception 'Assessment does not match the course blueprint' using errcode = '22023';
    end if;

    if exists (
      select 1
      from jsonb_each(v_blueprint.matrix) as chapter(chapter_id, levels)
      cross join lateral jsonb_each_text(chapter.levels) as level(k_level, expected_count)
      where level.expected_count::integer <> (
        select count(*)
        from private.assessment_question_registry as question
        where question.course_key = v_session.course_key
          and question.question_id = any(p_question_ids)
          and question.chapter_id = chapter.chapter_id::integer
          and question.k_level = level.k_level
      )
    ) then
      raise exception 'Assessment distribution does not match the course blueprint' using errcode = '22023';
    end if;
  end if;

  update private.verified_assessment_attempts
  set status = 'abandoned',
      completed_at = v_now
  where user_id = v_user_id
    and status = 'active';

  insert into private.verified_assessment_attempts (
    activity_session_id,
    user_id,
    course_key,
    activity_type,
    question_count,
    total_points,
    passing_points,
    deadline_at,
    started_at
  ) values (
    p_activity_session_id,
    v_user_id,
    v_session.course_key,
    v_session.activity_type,
    v_question_count,
    v_total_points,
    case when v_session.activity_type = 'practice' then 0 else v_blueprint.passing_points end,
    case when v_session.activity_type = 'practice' then null else v_now + make_interval(mins => v_blueprint.duration_minutes) end,
    v_now
  )
  returning * into v_attempt;

  insert into private.verified_assessment_questions (
    attempt_id,
    position,
    course_key,
    question_id,
    chapter_id,
    k_level,
    learning_objective,
    correct_indices,
    points
  )
  select
    v_attempt.id,
    selected.ordinality::integer,
    question.course_key,
    question.question_id,
    question.chapter_id,
    question.k_level,
    question.learning_objective,
    question.correct_indices,
    question.points
  from unnest(p_question_ids) with ordinality as selected(question_id, ordinality)
  join private.assessment_question_registry as question
    on question.course_key = v_session.course_key
   and question.question_id = selected.question_id
   and question.active
  order by selected.ordinality;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'course_key', v_attempt.course_key,
    'activity_type', v_attempt.activity_type,
    'question_count', v_attempt.question_count,
    'status', v_attempt.status,
    'deadline_at', v_attempt.deadline_at
  );
end;
$$;

create or replace function private.submit_verified_answer(
  p_attempt_id uuid,
  p_question_id text,
  p_selected_indices smallint[]
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_attempt private.verified_assessment_attempts%rowtype;
  v_question private.verified_assessment_questions%rowtype;
  v_selected smallint[] := private.normalize_answer_indices(p_selected_indices);
  v_is_correct boolean := false;
  v_unique_answers integer := 0;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_attempt_id is null
    or length(trim(coalesce(p_question_id, ''))) not between 1 and 120
    or cardinality(v_selected) not between 1 and 4
    or not (v_selected <@ array[0, 1, 2, 3]::smallint[]) then
    raise exception 'Invalid assessment answer' using errcode = '22023';
  end if;

  select attempt.*
  into v_attempt
  from private.verified_assessment_attempts as attempt
  where attempt.id = p_attempt_id
    and attempt.user_id = v_user_id
    and attempt.status = 'active'
  for update;

  if not found then
    raise exception 'Active assessment attempt required' using errcode = '42501';
  end if;
  if v_attempt.deadline_at is not null and v_now > v_attempt.deadline_at + interval '60 seconds' then
    raise exception 'Assessment time expired' using errcode = '57014';
  end if;

  select question.*
  into v_question
  from private.verified_assessment_questions as question
  where question.attempt_id = p_attempt_id
    and question.question_id = trim(p_question_id)
  for update;

  if not found then
    raise exception 'Question does not belong to this attempt' using errcode = '22023';
  end if;

  v_is_correct := v_selected = private.normalize_answer_indices(v_question.correct_indices);

  update private.verified_assessment_questions
  set selected_indices = v_selected,
      is_correct = v_is_correct,
      points_earned = case when v_is_correct then points else 0 end,
      answered_at = v_now
  where attempt_id = p_attempt_id
    and question_id = v_question.question_id;

  if v_attempt.activity_type = 'practice' then
    select count(distinct answer.question_id)
    into v_unique_answers
    from private.verified_assessment_attempts as attempt
    join private.verified_assessment_questions as answer
      on answer.attempt_id = attempt.id
     and answer.answered_at is not null
    where attempt.user_id = v_user_id
      and attempt.course_key = v_attempt.course_key
      and attempt.activity_type = 'practice';

    update public.course_enrollments
    set practice_answers = v_unique_answers,
        last_activity_at = v_now,
        updated_at = v_now
    where user_id = v_user_id
      and course_key = v_attempt.course_key
      and status in ('active', 'completed');
  end if;

  return jsonb_build_object(
    'accepted', true,
    'question_id', v_question.question_id,
    'correct', case when v_attempt.activity_type = 'practice' then v_is_correct else null end
  );
end;
$$;

create or replace function private.complete_verified_assessment(p_attempt_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_attempt private.verified_assessment_attempts%rowtype;
  v_session private.learning_activity_sessions%rowtype;
  v_enrollment public.course_enrollments%rowtype;
  v_answered integer := 0;
  v_correct integer := 0;
  v_earned numeric(8,2) := 0;
  v_total numeric(8,2) := 0;
  v_score numeric(5,2) := 0;
  v_passed boolean;
  v_duration integer := 0;
  v_unique_answers integer := 0;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select attempt.*
  into v_attempt
  from private.verified_assessment_attempts as attempt
  where attempt.id = p_attempt_id
    and attempt.user_id = v_user_id
  for update;

  if not found then
    raise exception 'Assessment attempt not found' using errcode = '42501';
  end if;

  if v_attempt.status = 'completed' then
    select enrollment.*
    into v_enrollment
    from public.course_enrollments as enrollment
    where enrollment.user_id = v_user_id
      and enrollment.course_key = v_attempt.course_key;
    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'activity_type', v_attempt.activity_type,
      'answered_count', v_attempt.answered_count,
      'correct_answers', v_attempt.correct_answers,
      'earned_points', v_attempt.earned_points,
      'total_points', v_attempt.total_points,
      'passing_points', v_attempt.passing_points,
      'score', v_attempt.score,
      'passed', v_attempt.passed,
      'duration_seconds', v_attempt.duration_seconds,
      'enrollment', to_jsonb(v_enrollment)
    );
  end if;
  if v_attempt.status <> 'active' then
    raise exception 'Assessment attempt is not active' using errcode = '55000';
  end if;

  perform private.end_learning_activity(v_attempt.activity_session_id);

  select activity.*
  into v_session
  from private.learning_activity_sessions as activity
  where activity.session_id = v_attempt.activity_session_id;

  select
    count(*) filter (where question.answered_at is not null)::integer,
    count(*) filter (where question.is_correct)::integer,
    coalesce(sum(question.points_earned), 0),
    coalesce(sum(question.points), 0)
  into v_answered, v_correct, v_earned, v_total
  from private.verified_assessment_questions as question
  where question.attempt_id = v_attempt.id;

  v_score := case when v_total > 0 then round((v_earned * 100) / v_total, 2) else 0 end;
  v_passed := case
    when v_attempt.activity_type = 'practice' then null
    else v_earned >= v_attempt.passing_points
  end;
  v_duration := least(86400, greatest(0, coalesce(v_session.duration_seconds, 0)::integer));

  update private.verified_assessment_attempts
  set status = 'completed',
      answered_count = v_answered,
      correct_answers = v_correct,
      earned_points = v_earned,
      total_points = v_total,
      score = v_score,
      passed = v_passed,
      duration_seconds = v_duration,
      completed_at = v_now
  where id = v_attempt.id
  returning * into v_attempt;

  if v_attempt.activity_type = 'practice' then
    select count(distinct answer.question_id)
    into v_unique_answers
    from private.verified_assessment_attempts as attempt
    join private.verified_assessment_questions as answer
      on answer.attempt_id = attempt.id
     and answer.answered_at is not null
    where attempt.user_id = v_user_id
      and attempt.course_key = v_attempt.course_key
      and attempt.activity_type = 'practice';

    update public.course_enrollments
    set practice_answers = v_unique_answers,
        last_activity_at = v_now,
        updated_at = v_now
    where user_id = v_user_id
      and course_key = v_attempt.course_key
      and status in ('active', 'completed')
    returning * into v_enrollment;
  elsif v_attempt.activity_type = 'simulator' then
    update public.course_enrollments
    set simulator_attempts = simulator_attempts + 1,
        best_simulator_score = greatest(best_simulator_score, v_score),
        last_activity_at = v_now,
        updated_at = v_now
    where user_id = v_user_id
      and course_key = v_attempt.course_key
      and status in ('active', 'completed')
    returning * into v_enrollment;
  else
    insert into public.course_final_exam_attempts (
      user_id,
      course_key,
      score,
      earned_points,
      total_points,
      passing_points,
      correct_answers,
      total_questions,
      duration_seconds,
      passed,
      verified,
      assessment_attempt_id
    ) values (
      v_user_id,
      v_attempt.course_key,
      v_score,
      v_earned,
      v_total,
      v_attempt.passing_points,
      v_correct,
      v_attempt.question_count,
      v_duration,
      v_passed,
      true,
      v_attempt.id
    );

    update public.course_enrollments
    set final_exam_attempts = final_exam_attempts + 1,
        best_final_exam_score = greatest(best_final_exam_score, v_score),
        final_exam_passed = final_exam_passed or v_passed,
        final_exam_passed_at = case when v_passed then coalesce(final_exam_passed_at, v_now) else final_exam_passed_at end,
        status = case when v_passed or final_exam_passed then 'completed' else status end,
        completed_at = case when v_passed or final_exam_passed then coalesce(completed_at, v_now) else completed_at end,
        last_activity_at = v_now,
        updated_at = v_now
    where user_id = v_user_id
      and course_key = v_attempt.course_key
      and status in ('active', 'completed')
    returning * into v_enrollment;
  end if;

  if v_enrollment.user_id is null then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'activity_type', v_attempt.activity_type,
    'answered_count', v_attempt.answered_count,
    'correct_answers', v_attempt.correct_answers,
    'earned_points', v_attempt.earned_points,
    'total_points', v_attempt.total_points,
    'passing_points', v_attempt.passing_points,
    'score', v_attempt.score,
    'passed', v_attempt.passed,
    'duration_seconds', v_attempt.duration_seconds,
    'enrollment', to_jsonb(v_enrollment)
  );
end;
$$;

create or replace function public.start_verified_assessment(
  p_activity_session_id uuid,
  p_question_ids text[]
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.start_verified_assessment(p_activity_session_id, p_question_ids);
$$;

create or replace function public.submit_verified_answer(
  p_attempt_id uuid,
  p_question_id text,
  p_selected_indices smallint[]
)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.submit_verified_answer(p_attempt_id, p_question_id, p_selected_indices);
$$;

create or replace function public.complete_verified_assessment(p_attempt_id uuid)
returns jsonb
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.complete_verified_assessment(p_attempt_id);
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
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;

  return query
  update public.course_enrollments
  set last_activity_at = now(),
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

revoke all on function private.normalize_answer_indices(smallint[]) from public, anon, authenticated;
revoke all on function private.start_verified_assessment(uuid, text[]) from public, anon, authenticated;
revoke all on function private.submit_verified_answer(uuid, text, smallint[]) from public, anon, authenticated;
revoke all on function private.complete_verified_assessment(uuid) from public, anon, authenticated;
revoke all on function public.start_verified_assessment(uuid, text[]) from public, anon, authenticated;
revoke all on function public.submit_verified_answer(uuid, text, smallint[]) from public, anon, authenticated;
revoke all on function public.complete_verified_assessment(uuid) from public, anon, authenticated;

grant execute on function private.start_verified_assessment(uuid, text[]) to authenticated;
grant execute on function private.submit_verified_answer(uuid, text, smallint[]) to authenticated;
grant execute on function private.complete_verified_assessment(uuid) to authenticated;
grant execute on function public.start_verified_assessment(uuid, text[]) to authenticated;
grant execute on function public.submit_verified_answer(uuid, text, smallint[]) to authenticated;
grant execute on function public.complete_verified_assessment(uuid) to authenticated;

revoke all on function private.record_simulator_completion(text, numeric) from public, anon, authenticated;
revoke all on function public.record_simulator_completion(text, numeric) from public, anon, authenticated;
revoke all on function private.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.record_final_exam_completion(text, numeric, numeric, numeric, numeric, integer, integer, integer) from public, anon, authenticated;

comment on table private.assessment_question_registry is
  'Canonical private answer registry generated from versioned course banks; never exposed through the Data API.';
comment on table private.verified_assessment_attempts is
  'Authenticated assessment attempts whose scores and completion are calculated only by PostgreSQL.';
comment on function public.start_verified_assessment(uuid, text[]) is
  'Validates the selected question set against the canonical course registry and blueprint.';
comment on function public.submit_verified_answer(uuid, text, smallint[]) is
  'Records one answer owned by the authenticated user without accepting a client-computed score.';
comment on function public.complete_verified_assessment(uuid) is
  'Calculates score, unique coverage, duration, passing status, and enrollment metrics on the server.';
