begin;

select plan(10);

insert into auth.users (id, email, aud, role, created_at, updated_at)
values (
  '51111111-1111-4111-8111-111111111111',
  'phase-zero-progress@example.com',
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
  '51111111-1111-4111-8111-111111111111',
  'phase-zero-course',
  'active',
  2
)
on conflict (user_id, course_key) do nothing;

insert into public.course_progress (
  user_id, course_key, schema_version, progress
)
values (
  '51111111-1111-4111-8111-111111111111',
  'phase-zero-course',
  3,
  '{"studySeconds":1800,"questionResults":{"PHASE-0-Q1":{"correct":true}}}'::jsonb
)
on conflict (user_id, course_key) do update set progress = excluded.progress;

insert into private.course_chapter_requirements (
  course_key, chapter_id, title, suggested_minutes, objective_count
)
values
  ('phase-zero-course', 1, 'Capitulo uno', 30, 1),
  ('phase-zero-course', 2, 'Capitulo dos', 30, 1)
on conflict (course_key, chapter_id) do nothing;

insert into private.assessment_question_registry (
  course_key, question_id, chapter_id, k_level, learning_objective,
  correct_indices, points, content_fingerprint, bank_revision, active
)
values
  ('phase-zero-course', 'PHASE-0-Q1', 1, 'K1', 'PHASE-0-LO1', array[0]::smallint[], 1, repeat('1', 64), 'phase-zero-v1', true),
  ('phase-zero-course', 'PHASE-0-Q2', 1, 'K1', 'PHASE-0-LO1', array[1]::smallint[], 1, repeat('2', 64), 'phase-zero-v1', true),
  ('phase-zero-course', 'PHASE-0-Q3', 2, 'K1', 'PHASE-0-LO2', array[0]::smallint[], 1, repeat('3', 64), 'phase-zero-v1', true),
  ('phase-zero-course', 'PHASE-0-Q4', 2, 'K1', 'PHASE-0-LO2', array[1]::smallint[], 1, repeat('4', 64), 'phase-zero-v1', true)
on conflict (course_key, question_id) do nothing;

insert into private.verified_progress_checkpoints (
  user_id, course_key, progress_floor_percent
)
values (
  '51111111-1111-4111-8111-111111111111',
  'phase-zero-course',
  42
)
on conflict (user_id, course_key) do update set
  progress_floor_percent = greatest(
    private.verified_progress_checkpoints.progress_floor_percent,
    excluded.progress_floor_percent
  );

create temporary table phase_zero_counts as
select
  (select count(*) from public.course_enrollments) as enrollments,
  (select count(*) from public.course_progress) as histories,
  (select count(*) from private.verified_progress_checkpoints) as floors;

select is(
  (private.authoritative_learning_dashboard('51111111-1111-4111-8111-111111111111') #>> '{courses,0,progress_percent}')::integer,
  42,
  'the release baseline remains the minimum official progress'
);

select ok(
  (private.authoritative_learning_dashboard('51111111-1111-4111-8111-111111111111') #>> '{courses,0,progress_percent}')::integer
    >= (private.authoritative_learning_dashboard('51111111-1111-4111-8111-111111111111') #>> '{courses,0,progress_floor_percent}')::integer,
  'official progress cannot render below its protected floor'
);

update public.course_enrollments
set status = 'cancelled', cancelled_at = now(), updated_at = now()
where user_id = '51111111-1111-4111-8111-111111111111'
  and course_key = 'phase-zero-course';

set local role authenticated;
select set_config('request.jwt.claim.sub', '51111111-1111-4111-8111-111111111111', true);

select is(
  public.archive_cancelled_course('phase-zero-course'),
  true,
  'a cancelled course can be hidden from the account'
);

reset role;

select is(
  (select count(*) from public.course_enrollments),
  (select enrollments from phase_zero_counts),
  'archiving does not delete an enrollment'
);

select is(
  (select count(*) from public.course_progress),
  (select histories from phase_zero_counts),
  'archiving does not delete browser history'
);

select is(
  (select count(*) from private.verified_progress_checkpoints),
  (select floors from phase_zero_counts),
  'archiving does not delete the protected progress floor'
);

select ok(
  (select hidden_at is not null
   from public.course_enrollments
   where user_id = '51111111-1111-4111-8111-111111111111'
     and course_key = 'phase-zero-course'),
  'archiving only marks the cancelled enrollment as hidden'
);

select is(
  (select (progress->>'studySeconds')::integer
   from public.course_progress
   where user_id = '51111111-1111-4111-8111-111111111111'
     and course_key = 'phase-zero-course'),
  1800,
  'the historical study value remains intact'
);

select is(
  (select progress_floor_percent
   from private.verified_progress_checkpoints
   where user_id = '51111111-1111-4111-8111-111111111111'
     and course_key = 'phase-zero-course'),
  42,
  'the exact protected percentage remains intact'
);

select is(
  (select count(*)
   from public.course_enrollments
   where user_id = '51111111-1111-4111-8111-111111111111'
     and course_key = 'phase-zero-course'),
  1::bigint,
  'the complete course record remains available for restoration'
);

select * from finish();
rollback;
