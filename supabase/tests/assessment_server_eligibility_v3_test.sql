begin;

select plan(15);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values (
  '61111111-1111-4111-8111-111111111111',
  'eligibility-student@example.com',
  'authenticated',
  'authenticated',
  now(),
  now()
)
on conflict (id) do nothing;

insert into public.course_enrollments (
  user_id, course_key, status, estimated_hours
)
values (
  '61111111-1111-4111-8111-111111111111',
  'eligibility-course',
  'active',
  2
)
on conflict (user_id, course_key) do nothing;

insert into private.course_chapter_requirements (
  course_key, chapter_id, title, suggested_minutes, objective_count
)
values
  ('eligibility-course', 1, 'Capitulo uno', 30, 1),
  ('eligibility-course', 2, 'Capitulo dos', 30, 1)
on conflict (course_key, chapter_id) do nothing;

insert into private.assessment_question_registry (
  course_key, question_id, chapter_id, k_level, learning_objective,
  correct_indices, points, content_fingerprint, bank_revision, active
)
values
  ('eligibility-course', 'ELIGIBILITY-Q1', 1, 'K1', 'ELIGIBILITY-LO1', array[0]::smallint[], 1, repeat('a', 64), 'eligibility-v1', true),
  ('eligibility-course', 'ELIGIBILITY-Q2', 1, 'K1', 'ELIGIBILITY-LO1', array[1]::smallint[], 1, repeat('b', 64), 'eligibility-v1', true),
  ('eligibility-course', 'ELIGIBILITY-Q3', 2, 'K1', 'ELIGIBILITY-LO2', array[0]::smallint[], 1, repeat('c', 64), 'eligibility-v1', true),
  ('eligibility-course', 'ELIGIBILITY-Q4', 2, 'K1', 'ELIGIBILITY-LO2', array[1]::smallint[], 1, repeat('d', 64), 'eligibility-v1', true)
on conflict (course_key, question_id) do nothing;

insert into private.learning_activity_sessions (
  session_id, user_id, course_key, activity_type, started_at, last_seen_at,
  last_counted_at, ended_at, duration_seconds, heartbeat_count
)
values
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '61111111-1111-4111-8111-111111111111', 'eligibility-course', 'simulator', now(), now(), now(), now(), 0, 0),
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '61111111-1111-4111-8111-111111111111', 'eligibility-course', 'final_exam', now(), now(), now(), now(), 0, 0),
  ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '61111111-1111-4111-8111-111111111111', 'eligibility-course', 'final_exam', now(), now(), now(), null, 0, 0);

select ok(
  has_function_privilege('authenticated', 'public.get_my_assessment_eligibility(text,text)', 'EXECUTE'),
  'authenticated users can request their own eligibility'
);
select ok(
  not has_function_privilege('anon', 'public.get_my_assessment_eligibility(text,text)', 'EXECUTE'),
  'anonymous users cannot request assessment eligibility'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '61111111-1111-4111-8111-111111111111', true);

select is(
  (public.get_my_assessment_eligibility('eligibility-course', 'simulator')->>'eligible')::boolean,
  true,
  'the simulator remains available to an enrolled user'
);
select is(
  public.get_my_assessment_eligibility('eligibility-course', 'simulator')->>'reason_code',
  'available_for_enrolled_user',
  'the simulator decision exposes a stable reason code'
);
select is(
  (public.get_my_assessment_eligibility('eligibility-course', 'final_exam')->>'eligible')::boolean,
  false,
  'the final exam is blocked before all chapter practices are complete'
);
select is(
  public.get_my_assessment_eligibility('eligibility-course', 'final_exam')->>'reason_code',
  'complete_all_chapters',
  'the final exam explains the missing chapter requirement'
);

reset role;

select lives_ok(
  $$insert into private.verified_assessment_attempts (
      id, activity_session_id, user_id, course_key, activity_type,
      status, question_count, total_points
    ) values (
      '6bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
      '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      '61111111-1111-4111-8111-111111111111',
      'eligibility-course', 'simulator', 'active', 4, 4
    )$$,
  'the database permits an enrolled user simulator attempt'
);

select throws_ok(
  $$insert into private.verified_assessment_attempts (
      id, activity_session_id, user_id, course_key, activity_type,
      status, question_count, total_points
    ) values (
      '6bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
      '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      '61111111-1111-4111-8111-111111111111',
      'eligibility-course', 'final_exam', 'active', 4, 4
    )$$,
  '42501',
  'Assessment eligibility required: complete_all_chapters',
  'the database rejects a direct final-exam attempt before eligibility'
);

insert into private.practice_question_achievements (
  user_id, course_key, question_id, chapter_id
)
select
  '61111111-1111-4111-8111-111111111111',
  registry.course_key,
  registry.question_id,
  registry.chapter_id
from private.assessment_question_registry as registry
where registry.course_key = 'eligibility-course'
on conflict (user_id, course_key, question_id) do nothing;

select is(
  (private.practice_achievement_course_metrics(
    '61111111-1111-4111-8111-111111111111',
    'eligibility-course'
  )->>'course_progress_percent')::integer,
  95,
  'all chapter practice achievements produce 95 percent verified progress'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '61111111-1111-4111-8111-111111111111', true);

select is(
  (public.get_my_assessment_eligibility('eligibility-course', 'final_exam')->>'eligible')::boolean,
  true,
  'the final exam unlocks after every chapter practice is complete'
);
select is(
  public.get_my_assessment_eligibility('eligibility-course', 'final_exam')->>'reason_code',
  'final_exam_requirements_met',
  'the unlocked final exam exposes the server-authoritative reason'
);

reset role;

select lives_ok(
  $$insert into private.verified_assessment_attempts (
      id, activity_session_id, user_id, course_key, activity_type,
      status, question_count, total_points
    ) values (
      '6bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
      '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
      '61111111-1111-4111-8111-111111111111',
      'eligibility-course', 'final_exam', 'active', 4, 4
    )$$,
  'the database permits the final-exam attempt after eligibility'
);

select is(
  (private.authoritative_learning_dashboard('61111111-1111-4111-8111-111111111111') #>> '{courses,0,simulator_eligible}')::boolean,
  true,
  'the authoritative dashboard publishes simulator eligibility'
);
select is(
  (private.authoritative_learning_dashboard('61111111-1111-4111-8111-111111111111') #>> '{courses,0,final_exam_eligible}')::boolean,
  true,
  'the authoritative dashboard publishes final-exam eligibility'
);
select is(
  private.authoritative_learning_dashboard('61111111-1111-4111-8111-111111111111')->>'eligibility_rule',
  'server_assessment_eligibility_v3',
  'the dashboard identifies the server eligibility rule'
);

select * from finish();
rollback;
