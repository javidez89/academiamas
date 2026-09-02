-- Assessment eligibility is decided and enforced by the database. This
-- migration does not rewrite progress, attempts, achievements, or history.

create or replace function private.assessment_eligibility_decision(
  p_activity_type text,
  p_enrolled boolean,
  p_final_exam_passed boolean,
  p_chapter_count integer,
  p_completed_chapters integer,
  p_progress_percent integer
)
returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_activity_type text := lower(trim(coalesce(p_activity_type, '')));
  v_enrolled boolean := coalesce(p_enrolled, false);
  v_passed boolean := coalesce(p_final_exam_passed, false);
  v_chapter_count integer := greatest(0, coalesce(p_chapter_count, 0));
  v_completed integer := greatest(0, coalesce(p_completed_chapters, 0));
  v_progress integer := greatest(0, least(100, coalesce(p_progress_percent, 0)));
  v_eligible boolean := false;
  v_reason text;
begin
  if v_activity_type not in ('practice', 'simulator', 'final_exam') then
    raise exception 'Invalid assessment activity type' using errcode = '22023';
  end if;

  if not v_enrolled then
    v_reason := 'active_enrollment_required';
  elsif v_activity_type in ('practice', 'simulator') then
    v_eligible := true;
    v_reason := 'available_for_enrolled_user';
  elsif v_passed then
    v_eligible := true;
    v_reason := 'final_exam_already_passed';
  elsif v_chapter_count = 0 then
    v_reason := 'course_requirements_unavailable';
  elsif v_completed < v_chapter_count then
    v_reason := 'complete_all_chapters';
  elsif v_progress < 95 then
    v_reason := 'verified_progress_required';
  else
    v_eligible := true;
    v_reason := 'final_exam_requirements_met';
  end if;

  return jsonb_build_object(
    'eligible', v_eligible,
    'activity_type', v_activity_type,
    'reason_code', v_reason,
    'progress_percent', v_progress,
    'chapter_count', v_chapter_count,
    'completed_chapters', least(v_completed, v_chapter_count),
    'remaining_chapters', greatest(0, v_chapter_count - v_completed),
    'rule_version', 'server_assessment_eligibility_v3'
  );
end;
$$;

create or replace function private.assessment_eligibility(
  p_user_id uuid,
  p_course_key text,
  p_activity_type text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_activity_type text := lower(trim(coalesce(p_activity_type, '')));
  v_enrolled boolean := false;
  v_passed boolean := false;
  v_metrics jsonb := '{}'::jsonb;
begin
  if p_user_id is null then
    raise exception 'User is required' using errcode = '22023';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;
  if v_activity_type not in ('practice', 'simulator', 'final_exam') then
    raise exception 'Invalid assessment activity type' using errcode = '22023';
  end if;

  select exists (
    select 1
    from public.course_enrollments as enrollment
    where enrollment.user_id = p_user_id
      and enrollment.course_key = v_course_key
      and enrollment.status in ('active', 'completed')
  ) into v_enrolled;

  if v_enrolled then
    v_metrics := private.practice_achievement_course_metrics(p_user_id, v_course_key);
    select exists (
      select 1
      from private.verified_assessment_attempts as attempt
      where attempt.user_id = p_user_id
        and attempt.course_key = v_course_key
        and attempt.activity_type = 'final_exam'
        and attempt.status = 'completed'
        and attempt.passed is true
    ) into v_passed;
  end if;

  return private.assessment_eligibility_decision(
    v_activity_type,
    v_enrolled,
    v_passed,
    coalesce((v_metrics->>'chapter_count')::integer, 0),
    coalesce((v_metrics->>'completed_chapters')::integer, 0),
    coalesce((v_metrics->>'course_progress_percent')::integer, 0)
  );
end;
$$;

create or replace function public.get_my_assessment_eligibility(
  p_course_key text,
  p_activity_type text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform private.require_active_platform_user();
  return private.assessment_eligibility(v_user_id, p_course_key, p_activity_type);
end;
$$;

create or replace function private.enforce_verified_assessment_eligibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eligibility jsonb;
begin
  if (tg_op = 'INSERT' and new.status = 'active')
    or (tg_op = 'UPDATE' and old.status is distinct from 'completed' and new.status = 'completed') then
    v_eligibility := private.assessment_eligibility(
      new.user_id,
      new.course_key,
      new.activity_type
    );
    if coalesce((v_eligibility->>'eligible')::boolean, false) is not true then
      raise exception 'Assessment eligibility required: %', v_eligibility->>'reason_code'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_verified_assessment_eligibility
  on private.verified_assessment_attempts;
create trigger enforce_verified_assessment_eligibility
before insert or update of status on private.verified_assessment_attempts
for each row execute function private.enforce_verified_assessment_eligibility();

do $$
begin
  if to_regprocedure('private.authoritative_learning_dashboard_v2(uuid)') is null then
    alter function private.authoritative_learning_dashboard(uuid)
      rename to authoritative_learning_dashboard_v2;
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
  v_base jsonb := private.authoritative_learning_dashboard_v2(p_user_id);
  v_courses jsonb := '[]'::jsonb;
  v_course jsonb;
  v_simulator jsonb;
  v_final_exam jsonb;
  v_enrolled boolean;
begin
  for v_course in
    select value
    from jsonb_array_elements(coalesce(v_base->'courses', '[]'::jsonb))
  loop
    v_enrolled := coalesce(v_course->>'legacy_status', '') in ('active', 'completed');
    v_simulator := private.assessment_eligibility_decision(
      'simulator',
      v_enrolled,
      coalesce((v_course->>'final_exam_passed')::boolean, false),
      coalesce((v_course->>'chapter_count')::integer, 0),
      coalesce((v_course->>'completed_chapters')::integer, 0),
      coalesce((v_course->>'calculated_progress_percent')::integer, 0)
    );
    v_final_exam := private.assessment_eligibility_decision(
      'final_exam',
      v_enrolled,
      coalesce((v_course->>'final_exam_passed')::boolean, false),
      coalesce((v_course->>'chapter_count')::integer, 0),
      coalesce((v_course->>'completed_chapters')::integer, 0),
      coalesce((v_course->>'calculated_progress_percent')::integer, 0)
    );

    v_courses := v_courses || jsonb_build_array(v_course || jsonb_build_object(
      'simulator_eligible', v_simulator->'eligible',
      'simulator_eligibility_reason', v_simulator->>'reason_code',
      'final_exam_eligible', v_final_exam->'eligible',
      'final_exam_eligibility_reason', v_final_exam->>'reason_code',
      'remaining_chapters', v_final_exam->'remaining_chapters',
      'eligibility_rule', 'server_assessment_eligibility_v3'
    ));
  end loop;

  return jsonb_set(v_base, '{courses}', v_courses, true)
    || jsonb_build_object('eligibility_rule', 'server_assessment_eligibility_v3');
end;
$$;

revoke all on function private.assessment_eligibility_decision(text, boolean, boolean, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function private.assessment_eligibility(uuid, text, text)
  from public, anon, authenticated;
revoke all on function private.enforce_verified_assessment_eligibility()
  from public, anon, authenticated;
revoke all on function private.authoritative_learning_dashboard_v2(uuid)
  from public, anon, authenticated;
revoke all on function private.authoritative_learning_dashboard(uuid)
  from public, anon, authenticated;
revoke all on function public.get_my_assessment_eligibility(text, text)
  from public, anon, authenticated;
grant execute on function public.get_my_assessment_eligibility(text, text)
  to authenticated;

comment on function public.get_my_assessment_eligibility(text, text) is
  'Returns the authenticated user assessment eligibility calculated from immutable server achievements.';
comment on function private.enforce_verified_assessment_eligibility() is
  'Rejects assessment attempts that do not satisfy the server-authoritative eligibility rule.';
