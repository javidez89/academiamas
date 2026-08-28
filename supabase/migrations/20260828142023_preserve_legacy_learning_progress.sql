create table private.legacy_course_progress_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  schema_version integer not null,
  progress jsonb not null,
  enrollment_snapshot jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz not null,
  captured_at timestamptz not null default now(),
  primary key (user_id, course_key),
  constraint legacy_course_progress_snapshots_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint legacy_course_progress_snapshots_progress_check
    check (jsonb_typeof(progress) = 'object'),
  constraint legacy_course_progress_snapshots_enrollment_check
    check (jsonb_typeof(enrollment_snapshot) = 'object')
);

alter table private.legacy_course_progress_snapshots enable row level security;
revoke all on table private.legacy_course_progress_snapshots from public, anon, authenticated;

create or replace function private.capture_legacy_learning_progress_snapshot()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer := 0;
begin
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
  left join public.course_enrollments as enrollment
    on enrollment.user_id = progress.user_id
   and enrollment.course_key = progress.course_key
  where jsonb_typeof(progress.progress) = 'object'
  on conflict (user_id, course_key) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

select private.capture_legacy_learning_progress_snapshot();

create or replace function private.legacy_learning_progress_for_user(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'course_key', snapshot.course_key,
    'schema_version', snapshot.schema_version,
    'progress', snapshot.progress,
    'enrollment', snapshot.enrollment_snapshot,
    'source_updated_at', snapshot.source_updated_at,
    'captured_at', snapshot.captured_at,
    'verified', false,
    'label', 'Histórico no verificado'
  ) order by snapshot.source_updated_at desc), '[]'::jsonb)
  from private.legacy_course_progress_snapshots as snapshot
  where snapshot.user_id = p_user_id;
$$;

create or replace function private.get_verified_learning_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_dashboard jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  v_dashboard := private.authoritative_learning_dashboard(v_user_id);
  return v_dashboard || jsonb_build_object(
    'legacy_progress', private.legacy_learning_progress_for_user(v_user_id),
    'legacy_transition', jsonb_build_object(
      'label', 'Histórico no verificado',
      'display_threshold_percent', 10,
      'affects_official_progress', false
    )
  );
end;
$$;

create or replace function private.admin_list_users(
  p_search text default '',
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_search text := left(trim(coalesce(p_search, '')), 120);
  v_limit integer := least(100, greatest(1, coalesce(p_limit, 50)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();
  with matching_users as (
    select
      users.id,
      users.email,
      coalesce(nullif(profiles.full_name, ''), nullif(users.raw_user_meta_data ->> 'full_name', ''),
        nullif(users.raw_user_meta_data ->> 'name', ''), split_part(coalesce(users.email, ''), '@', 1), 'Usuario') as full_name,
      coalesce(nullif(profiles.avatar_url, ''), nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(users.raw_user_meta_data ->> 'picture', '')) as avatar_url,
      users.created_at,
      users.last_sign_in_at,
      profiles.last_seen_at
    from auth.users as users
    left join public.profiles as profiles on profiles.id = users.id
    where v_search = ''
      or coalesce(users.email, '') ilike '%' || v_search || '%'
      or coalesce(profiles.full_name, '') ilike '%' || v_search || '%'
      or coalesce(users.raw_user_meta_data ->> 'full_name', '') ilike '%' || v_search || '%'
      or coalesce(users.raw_user_meta_data ->> 'name', '') ilike '%' || v_search || '%'
  ),
  page_users as (
    select * from matching_users
    order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc
    limit v_limit offset v_offset
  ),
  user_rows as (
    select
      page_users.*,
      private.authoritative_learning_dashboard(page_users.id) as dashboard,
      private.legacy_learning_progress_for_user(page_users.id) as legacy_progress
    from page_users
  )
  select jsonb_build_object(
    'total', (select count(*) from matching_users),
    'limit', v_limit,
    'offset', v_offset,
    'verified', true,
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name,
        'avatar_url', avatar_url,
        'created_at', created_at,
        'last_sign_in_at', last_sign_in_at,
        'last_seen_at', last_seen_at,
        'enrollments', dashboard -> 'courses',
        'learning_summary', dashboard -> 'summary',
        'legacy_progress', legacy_progress
      ) order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc)
      from user_rows
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function private.delete_cancelled_course(p_course_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Invalid course key' using errcode = '22023'; end if;
  perform 1 from public.course_enrollments
  where user_id = v_user_id and course_key = v_course_key and status = 'cancelled' for update;
  if not found then raise exception 'Cancelled enrollment required' using errcode = '55000'; end if;

  delete from public.course_final_exam_attempts where user_id = v_user_id and course_key = v_course_key;
  delete from private.verified_assessment_attempts where user_id = v_user_id and course_key = v_course_key;
  delete from private.learning_activity_sessions where user_id = v_user_id and course_key = v_course_key;
  delete from private.legacy_course_progress_snapshots where user_id = v_user_id and course_key = v_course_key;
  delete from public.course_progress where user_id = v_user_id and course_key = v_course_key;
  delete from public.course_enrollments where user_id = v_user_id and course_key = v_course_key and status = 'cancelled';
  return true;
end;
$$;

revoke all on function private.capture_legacy_learning_progress_snapshot() from public, anon, authenticated;
revoke all on function private.legacy_learning_progress_for_user(uuid) from public, anon, authenticated;
revoke all on function private.get_verified_learning_dashboard() from public, anon, authenticated;
revoke all on function private.admin_list_users(text, integer, integer) from public, anon, authenticated;
revoke all on function private.delete_cancelled_course(text) from public, anon, authenticated;
grant execute on function private.get_verified_learning_dashboard() to authenticated;
grant execute on function private.admin_list_users(text, integer, integer) to authenticated;
grant execute on function private.delete_cancelled_course(text) to authenticated;

comment on table private.legacy_course_progress_snapshots is
  'Immutable one-time copy of browser-managed course progress captured before server-authoritative progress became official.';
comment on function private.capture_legacy_learning_progress_snapshot() is
  'Copies only previously unseen legacy progress rows. Existing snapshots are never overwritten.';
comment on function public.get_verified_learning_dashboard() is
  'Returns server-verified progress plus separately labelled, non-authoritative legacy history for the authenticated user.';
