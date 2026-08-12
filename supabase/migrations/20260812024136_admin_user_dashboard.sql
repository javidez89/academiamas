create schema if not exists private;

create table if not exists private.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

revoke all on table private.platform_admins from public, anon, authenticated;

insert into private.platform_admins (user_id)
select id
from auth.users
where lower(email) = lower('javidez89@gmail.com')
on conflict (user_id) do nothing;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.platform_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function private.require_platform_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if not (select private.is_platform_admin()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
end;
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
    'enrolled_users', (select count(distinct user_id) from public.course_enrollments),
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
      u.id,
      u.email,
      coalesce(nullif(p.full_name, ''), split_part(coalesce(u.email, ''), '@', 1), 'Usuario') as full_name,
      p.avatar_url,
      u.created_at,
      u.last_sign_in_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    where v_search = ''
      or coalesce(u.email, '') ilike '%' || v_search || '%'
      or coalesce(p.full_name, '') ilike '%' || v_search || '%'
  ),
  page_users as (
    select *
    from matching_users
    order by coalesce(last_sign_in_at, created_at) desc, created_at desc
    limit v_limit offset v_offset
  ),
  user_rows as (
    select
      pu.*,
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'course_key', e.course_key,
            'status', e.status,
            'started_at', e.started_at,
            'cancelled_at', e.cancelled_at,
            'last_activity_at', e.last_activity_at,
            'estimated_hours', e.estimated_hours,
            'study_seconds', e.study_seconds,
            'simulator_attempts', e.simulator_attempts,
            'practice_answers', e.practice_answers,
            'best_simulator_score', e.best_simulator_score,
            'final_exam_attempts', e.final_exam_attempts,
            'best_final_exam_score', e.best_final_exam_score,
            'final_exam_passed', e.final_exam_passed,
            'completed_at', e.completed_at,
            'progress', coalesce(cp.progress, '{}'::jsonb)
          ) order by e.started_at desc
        )
        from public.course_enrollments e
        left join public.course_progress cp
          on cp.user_id = e.user_id and cp.course_key = e.course_key
        where e.user_id = pu.id
      ), '[]'::jsonb) as enrollments
    from page_users pu
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
          'enrollments', enrollments
        ) order by coalesce(last_sign_in_at, created_at) desc, created_at desc
      )
      from user_rows
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_platform_admin();
$$;

create or replace function public.admin_dashboard_summary()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.admin_dashboard_summary();
$$;

create or replace function public.admin_list_users(
  p_search text default '',
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.admin_list_users(p_search, p_limit, p_offset);
$$;

revoke all on function private.is_platform_admin() from public, anon;
revoke all on function private.require_platform_admin() from public, anon, authenticated;
revoke all on function private.admin_dashboard_summary() from public, anon;
revoke all on function private.admin_list_users(text, integer, integer) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.admin_dashboard_summary() from public, anon;
revoke all on function public.admin_list_users(text, integer, integer) from public, anon;

grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.admin_dashboard_summary() to authenticated;
grant execute on function private.admin_list_users(text, integer, integer) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.admin_dashboard_summary() to authenticated;
grant execute on function public.admin_list_users(text, integer, integer) to authenticated;
