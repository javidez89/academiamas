alter table public.profiles
  add column if not exists last_seen_at timestamptz;

update public.profiles as profile
set last_seen_at = coalesce(profile.last_seen_at, users.last_sign_in_at, profile.updated_at)
from auth.users as users
where users.id = profile.id
  and profile.last_seen_at is null;

create index if not exists profiles_last_seen_at_idx
  on public.profiles (last_seen_at desc)
  where last_seen_at is not null;

create or replace function private.touch_user_presence()
returns timestamptz
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_seen_at timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.profiles
  set last_seen_at = v_seen_at,
      updated_at = v_seen_at
  where id = v_user_id;

  return v_seen_at;
end;
$$;

create or replace function public.touch_user_presence()
returns timestamptz
language sql
volatile
security invoker
set search_path = ''
as $$
  select private.touch_user_presence();
$$;

create or replace function private.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform private.require_platform_admin();

  select jsonb_build_object(
    'registered_users', (select count(*) from auth.users),
    'online_users', (
      select count(*)
      from public.profiles
      where last_seen_at >= now() - interval '2 minutes 30 seconds'
    ),
    'active_users_30d', (
      select count(*)
      from auth.users as users
      left join public.profiles as profiles on profiles.id = users.id
      where coalesce(profiles.last_seen_at, users.last_sign_in_at, users.created_at) >= now() - interval '30 days'
    ),
    'new_users_30d', (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'enrolled_users', (select count(distinct user_id) from public.course_enrollments where status <> 'cancelled'),
    'total_enrollments', (select count(*) from public.course_enrollments),
    'active_enrollments', (select count(*) from public.course_enrollments where status = 'active'),
    'completed_enrollments', (select count(*) from public.course_enrollments where status = 'completed'),
    'cancelled_enrollments', (select count(*) from public.course_enrollments where status = 'cancelled'),
    'study_seconds', (select coalesce(sum(study_seconds), 0) from public.course_enrollments),
    'simulator_attempts', (select coalesce(sum(simulator_attempts), 0) from public.course_enrollments),
    'final_exam_attempts', (select coalesce(sum(final_exam_attempts), 0) from public.course_enrollments)
  ) into v_result;

  return v_result;
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
      coalesce(
        nullif(profiles.full_name, ''),
        nullif(users.raw_user_meta_data ->> 'full_name', ''),
        nullif(users.raw_user_meta_data ->> 'name', ''),
        split_part(coalesce(users.email, ''), '@', 1),
        'Usuario'
      ) as full_name,
      coalesce(
        nullif(profiles.avatar_url, ''),
        nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(users.raw_user_meta_data ->> 'picture', '')
      ) as avatar_url,
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
    select *
    from matching_users
    order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc
    limit v_limit offset v_offset
  ),
  user_rows as (
    select
      page_users.*,
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'course_key', enrollment.course_key,
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
            'completed_at', enrollment.completed_at,
            'progress', coalesce(progress.progress, '{}'::jsonb)
          ) order by enrollment.started_at desc
        )
        from public.course_enrollments as enrollment
        left join public.course_progress as progress
          on progress.user_id = enrollment.user_id
         and progress.course_key = enrollment.course_key
        where enrollment.user_id = page_users.id
      ), '[]'::jsonb) as enrollments
    from page_users
  )
  select jsonb_build_object(
    'total', (select count(*) from matching_users),
    'limit', v_limit,
    'offset', v_offset,
    'users', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', id,
          'email', email,
          'full_name', full_name,
          'avatar_url', avatar_url,
          'created_at', created_at,
          'last_sign_in_at', last_sign_in_at,
          'last_seen_at', last_seen_at,
          'enrollments', enrollments
        ) order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc
      )
      from user_rows
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function private.touch_user_presence() from public, anon;
revoke all on function public.touch_user_presence() from public, anon;
grant execute on function private.touch_user_presence() to authenticated;
grant execute on function public.touch_user_presence() to authenticated;
