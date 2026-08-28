\set ON_ERROR_STOP on

begin;

create temp table transition_test_users as
select (md5('qavance-legacy-transition-' || sequence)::uuid) as user_id,
       sequence
from generate_series(1, 23) as sequence;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  user_id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'transition-' || sequence || '@example.invalid',
  '',
  now(),
  '{"provider":"google","providers":["google"]}'::jsonb,
  jsonb_build_object('full_name', 'Usuario transición ' || sequence),
  now(),
  now()
from transition_test_users;

with course_keys(course_key, estimated_hours) as (
  values
    ('ctfl', 18::numeric),
    ('ct-genai', 14::numeric),
    ('ctai', 20::numeric),
    ('cybersecurity-awareness', 12::numeric),
    ('project-management-essentials', 18::numeric),
    ('scrum-fundamentals', 10::numeric),
    ('scrum-master', 12::numeric),
    ('scrum-product-owner', 14::numeric)
)
insert into public.course_enrollments (
  user_id,
  course_key,
  status,
  estimated_hours,
  study_seconds,
  practice_answers,
  simulator_attempts,
  final_exam_attempts,
  best_final_exam_score,
  final_exam_passed,
  last_activity_at,
  created_at,
  updated_at
)
select
  users.user_id,
  courses.course_key,
  'active',
  courses.estimated_hours,
  1800 + users.sequence,
  3,
  1,
  0,
  0,
  false,
  now(),
  now(),
  now()
from transition_test_users as users
cross join course_keys as courses;

with numbered_enrollments as (
  select
    enrollment.user_id,
    enrollment.course_key,
    row_number() over (order by enrollment.user_id, enrollment.course_key) as row_number
  from public.course_enrollments as enrollment
  join transition_test_users as users on users.user_id = enrollment.user_id
)
insert into public.course_progress (user_id, course_key, schema_version, progress, updated_at)
select
  enrollment.user_id,
  enrollment.course_key,
  5,
  jsonb_build_object(
    '_schema', 5,
    'studySeconds', 1800 + enrollment.row_number,
    'attempts', '[]'::jsonb,
    'marked', '[]'::jsonb,
    'chapterActivity', jsonb_build_object(
      '1', jsonb_build_object('studySeconds', 900, 'visitedAt', now())
    ),
    'questionResults', '{}'::jsonb
  ),
  now()
from numbered_enrollments as enrollment
where enrollment.row_number <= 179;

select private.capture_legacy_learning_progress_snapshot() as captured_rows;

do $$
declare
  v_enrollments integer;
  v_histories integer;
  v_snapshots integer;
  v_immutable integer;
begin
  select count(*) into v_enrollments
  from public.course_enrollments as enrollment
  join transition_test_users as users on users.user_id = enrollment.user_id;

  select count(*) into v_histories
  from public.course_progress as progress
  join transition_test_users as users on users.user_id = progress.user_id;

  select count(*) into v_snapshots
  from private.legacy_course_progress_snapshots as snapshot
  join transition_test_users as users on users.user_id = snapshot.user_id;

  perform private.capture_legacy_learning_progress_snapshot();
  select count(*) into v_immutable
  from private.legacy_course_progress_snapshots as snapshot
  join transition_test_users as users on users.user_id = snapshot.user_id;

  if v_enrollments <> 184 then
    raise exception 'Expected 184 enrollments after transition, found %', v_enrollments;
  end if;
  if v_histories <> 179 then
    raise exception 'Expected 179 legacy histories after transition, found %', v_histories;
  end if;
  if v_snapshots <> 179 then
    raise exception 'Expected 179 immutable snapshots, found %', v_snapshots;
  end if;
  if v_immutable <> 179 then
    raise exception 'Snapshot capture is not immutable: expected 179, found %', v_immutable;
  end if;

  raise notice 'PASS: 184 enrollments, 179 histories and 179 immutable snapshots preserved.';
end;
$$;

rollback;
