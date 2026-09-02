begin;

select plan(19);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  ('41111111-1111-4111-8111-111111111111', 'admin-progress@example.com', 'authenticated', 'authenticated', now(), now()),
  ('42222222-2222-4222-8222-222222222222', 'student-progress@example.com', 'authenticated', 'authenticated', now(), now()),
  ('43333333-3333-4333-8333-333333333333', 'other-progress@example.com', 'authenticated', 'authenticated', now(), now())
on conflict (id) do nothing;

insert into private.platform_admins (user_id)
values ('41111111-1111-4111-8111-111111111111')
on conflict (user_id) do nothing;

insert into public.course_enrollments (user_id, course_key, status, estimated_hours)
values ('42222222-2222-4222-8222-222222222222', 'qa-progress-test', 'active', 2)
on conflict (user_id, course_key) do nothing;

insert into private.course_chapter_requirements (
  course_key, chapter_id, title, suggested_minutes, objective_count
)
values
  ('qa-progress-test', 1, 'Capítulo uno', 30, 1),
  ('qa-progress-test', 2, 'Capítulo dos', 30, 1)
on conflict (course_key, chapter_id) do nothing;

insert into private.assessment_question_registry (
  course_key, question_id, chapter_id, k_level, learning_objective,
  correct_indices, points, content_fingerprint, bank_revision, active
)
values
  ('qa-progress-test', 'QA-P1', 1, 'K1', 'QA-1', array[0]::smallint[], 1, repeat('a', 64), 'test-v1', true),
  ('qa-progress-test', 'QA-P2', 1, 'K1', 'QA-1', array[1]::smallint[], 1, repeat('b', 64), 'test-v1', true),
  ('qa-progress-test', 'QA-P3', 2, 'K1', 'QA-2', array[0]::smallint[], 1, repeat('c', 64), 'test-v1', true),
  ('qa-progress-test', 'QA-P4', 2, 'K1', 'QA-2', array[1]::smallint[], 1, repeat('d', 64), 'test-v1', true)
on conflict (course_key, question_id) do nothing;

insert into private.verified_progress_checkpoints (
  user_id, course_key, progress_floor_percent
)
values ('42222222-2222-4222-8222-222222222222', 'qa-progress-test', 37)
on conflict (user_id, course_key) do update set progress_floor_percent = 37;

insert into private.learning_activity_sessions (
  session_id, user_id, course_key, activity_type, started_at, last_seen_at,
  ended_at, duration_seconds, heartbeat_count, last_counted_at
)
values
  ('4aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '42222222-2222-4222-8222-222222222222', 'qa-progress-test', 'practice', now() - interval '5 minutes', now(), now(), 300, 10, now()),
  ('4aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '42222222-2222-4222-8222-222222222222', 'qa-progress-test', 'practice', now() - interval '2 minutes', now(), now(), 120, 4, now());

insert into private.verified_assessment_attempts (
  id, activity_session_id, user_id, course_key, activity_type, status,
  question_count, total_points, started_at
)
values
  ('4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '4aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '42222222-2222-4222-8222-222222222222', 'qa-progress-test', 'practice', 'active', 2, 2, now() - interval '5 minutes'),
  ('4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '4aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '42222222-2222-4222-8222-222222222222', 'qa-progress-test', 'practice', 'active', 2, 2, now() - interval '2 minutes');

select is(
  (select count(*)::integer from private.verified_assessment_attempts where user_id = '42222222-2222-4222-8222-222222222222' and status = 'active'),
  2,
  'independent live attempts can coexist for one user'
);

update private.verified_assessment_attempts
set status = 'abandoned', completed_at = now()
where id = '4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';

select is(
  (select status from private.verified_assessment_attempts where id = '4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'),
  'active',
  'automatic abandonment cannot invalidate a recent live attempt'
);

insert into private.verified_assessment_questions (
  attempt_id, position, course_key, question_id, chapter_id, k_level,
  learning_objective, correct_indices, points
)
values
  ('4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 1, 'qa-progress-test', 'QA-P1', 1, 'K1', 'QA-1', array[0]::smallint[], 1),
  ('4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 2, 'qa-progress-test', 'QA-P2', 1, 'K1', 'QA-1', array[1]::smallint[], 1);

select is(
  (private.authoritative_learning_dashboard('42222222-2222-4222-8222-222222222222') #>> '{courses,0,progress_percent}')::integer,
  37,
  'the previous verified percentage is preserved as the initial floor'
);

update private.verified_assessment_questions
set selected_indices = correct_indices, is_correct = true, points_earned = points, answered_at = now()
where attempt_id = '4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';

select is(
  (select count(*)::integer from private.practice_question_achievements where user_id = '42222222-2222-4222-8222-222222222222'),
  2,
  'each unique correct practice answer becomes an immutable achievement'
);
select is(
  (select count(*)::integer from private.chapter_practice_achievements where user_id = '42222222-2222-4222-8222-222222222222'),
  1,
  'a chapter achievement is awarded only after all of its questions are correct'
);
select is(
  (private.practice_achievement_course_metrics('42222222-2222-4222-8222-222222222222', 'qa-progress-test') ->> 'completed_chapters')::integer,
  1,
  'one of two chapters is complete'
);
select is(
  (private.authoritative_learning_dashboard('42222222-2222-4222-8222-222222222222') #>> '{courses,0,calculated_progress_percent}')::integer,
  48,
  'one of two chapter achievements contributes half of the 95 percent course component'
);
select is(
  (private.authoritative_learning_dashboard('42222222-2222-4222-8222-222222222222') #>> '{courses,0,progress_percent}')::integer,
  48,
  'the official percentage increases above its floor'
);

update private.verified_assessment_questions
set selected_indices = array[3]::smallint[], is_correct = false, points_earned = 0, answered_at = now()
where attempt_id = '4bbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  and question_id = 'QA-P1';

select is(
  (select count(*)::integer from private.practice_question_achievements where user_id = '42222222-2222-4222-8222-222222222222'),
  2,
  'a later incorrect retry does not erase a correct achievement'
);
select is(
  (private.practice_achievement_course_metrics('42222222-2222-4222-8222-222222222222', 'qa-progress-test') #>> '{chapters,0,practice_complete}')::boolean,
  true,
  'the completed chapter remains complete after a later incorrect retry'
);
select is(
  (private.authoritative_learning_dashboard('42222222-2222-4222-8222-222222222222') #>> '{courses,0,progress_percent}')::integer,
  48,
  'the official progress never regresses after a retry'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '43333333-3333-4333-8333-333333333333', true);
select throws_ok(
  $$select public.admin_send_user_message('42222222-2222-4222-8222-222222222222', 'Aviso', 'Mensaje administrativo de prueba')$$,
  '42501',
  'Administrator access required',
  'a regular user cannot send administrative messages'
);

select set_config('request.jwt.claim.sub', '41111111-1111-4111-8111-111111111111', true);
select ok(
  set_config(
    'qavance.test_message_id',
    public.admin_send_user_message('42222222-2222-4222-8222-222222222222', 'Avance del curso', 'Tu avance se encuentra protegido en QAvance') ->> 'id',
    true
  ) <> '',
  'an administrator can send a direct message'
);

select set_config('request.jwt.claim.sub', '42222222-2222-4222-8222-222222222222', true);
select is(jsonb_array_length(public.list_my_admin_messages()), 1, 'the recipient sees the direct message');

select set_config('request.jwt.claim.sub', '43333333-3333-4333-8333-333333333333', true);
select is(jsonb_array_length(public.list_my_admin_messages()), 0, 'another user cannot see the message');
select is(
  public.mark_my_admin_message_read(current_setting('qavance.test_message_id')::uuid),
  false,
  'another user cannot mark the message as read'
);

select set_config('request.jwt.claim.sub', '42222222-2222-4222-8222-222222222222', true);
select is(
  public.mark_my_admin_message_read(current_setting('qavance.test_message_id')::uuid),
  true,
  'the recipient can mark the message as read'
);

reset role;
select ok((select read_at is not null from private.admin_user_messages limit 1), 'the read timestamp is stored');
select is(
  (select count(*)::integer from public.course_enrollments where user_id = '42222222-2222-4222-8222-222222222222'),
  1,
  'the migration and messaging flow do not delete enrollment history'
);

select * from finish();
rollback;
