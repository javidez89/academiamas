begin;

select plan(10);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'admin-analytics@example.com', 'authenticated', 'authenticated', now() - interval '20 days', now()),
  ('22222222-2222-4222-8222-222222222222', 'student-analytics@example.com', 'authenticated', 'authenticated', now() - interval '10 days', now()),
  ('33333333-3333-4333-8333-333333333333', 'regular-analytics@example.com', 'authenticated', 'authenticated', now() - interval '5 days', now())
on conflict (id) do nothing;

insert into private.platform_admins (user_id)
values ('11111111-1111-4111-8111-111111111111')
on conflict (user_id) do nothing;

insert into public.course_enrollments (
  user_id, course_key, status, started_at, last_activity_at, estimated_hours, created_at, updated_at
)
values (
  '22222222-2222-4222-8222-222222222222', 'ctfl', 'active', now() - interval '2 days', now() - interval '1 day', 20, now() - interval '2 days', now()
)
on conflict (user_id, course_key) do nothing;

insert into private.learning_activity_sessions (
  session_id, user_id, course_key, activity_type, chapter_id, started_at, last_seen_at,
  ended_at, duration_seconds, heartbeat_count, last_counted_at
)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '22222222-2222-4222-8222-222222222222', 'ctfl', 'reading', 1, now() - interval '1 day 2 hours', now() - interval '1 day 1 hour 50 minutes', now() - interval '1 day 1 hour 50 minutes', 600, 20, now() - interval '1 day 1 hour 50 minutes'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'ctfl', 'simulator', null, now() - interval '1 day 1 hour', now() - interval '1 day 45 minutes', now() - interval '1 day 45 minutes', 900, 30, now() - interval '1 day 45 minutes'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'ctfl', 'final_exam', null, now() - interval '1 day 30 minutes', now() - interval '1 day 10 minutes', now() - interval '1 day 10 minutes', 1200, 40, now() - interval '1 day 10 minutes');

insert into private.verified_assessment_attempts (
  id, activity_session_id, user_id, course_key, activity_type, status, question_count,
  answered_count, correct_answers, earned_points, total_points, passing_points, score,
  passed, duration_seconds, started_at, completed_at
)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'ctfl', 'simulator', 'completed', 40, 40, 32, 32, 40, 26, 80, true, 900, now() - interval '1 day 1 hour', now() - interval '1 day 45 minutes'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '22222222-2222-4222-8222-222222222222', 'ctfl', 'final_exam', 'completed', 40, 40, 34, 34, 40, 26, 85, true, 1200, now() - interval '1 day 30 minutes', now() - interval '1 day 10 minutes');

set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select throws_ok(
  $$select public.admin_verified_learning_analytics(now() - interval '7 days', now(), null)$$,
  '42501',
  'Administrator access required',
  'a regular authenticated user cannot read administrative analytics'
);

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,active_learners}')::integer,
  1,
  'active learners are counted once'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,learning_sessions}')::integer,
  3,
  'verified learning sessions are counted exactly'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,study_seconds}')::bigint,
  2700::bigint,
  'verified duration is summed from server sessions'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,simulator_attempts}')::integer,
  1,
  'completed simulator attempts are counted'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,final_exam_attempts}')::integer,
  1,
  'completed final exams are counted'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), null) #>> '{summary,final_exams_passed}')::integer,
  1,
  'passed final exams are counted'
);
select is(
  (public.admin_verified_learning_analytics(now() - interval '7 days', now(), 'ctfl') #>> '{courses,0,course_key}'),
  'ctfl',
  'course filtering returns the requested course'
);
select is(
  jsonb_array_length(public.admin_verified_learning_analytics(now() - interval '7 days', now(), 'ctfl') -> 'daily'),
  8,
  'the server returns a complete daily series for the selected rolling period'
);

reset role;
select is(
  (select count(*)::integer from public.course_enrollments where user_id = '22222222-2222-4222-8222-222222222222'),
  1,
  'running analytics does not alter enrollment history'
);

select * from finish();
rollback;
