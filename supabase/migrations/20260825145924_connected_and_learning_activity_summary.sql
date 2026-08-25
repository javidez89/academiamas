create or replace function private.public_learning_activity_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select
      (select count(*) from auth.users) as registered_students,
      (
        select count(distinct enrollment.course_key)
        from public.course_enrollments as enrollment
        where enrollment.status <> 'cancelled'
      ) as active_courses,
      (
        select count(*)
        from public.profiles as profile
        where profile.last_seen_at >= now() - interval '2 minutes 30 seconds'
      ) as online_students,
      (
        select count(distinct activity.user_id)
        from private.learning_activity_sessions as activity
        where activity.ended_at is null
          and activity.last_seen_at >= now() - interval '90 seconds'
      ) as active_students
  )
  select jsonb_build_object(
    'registered_students', totals.registered_students,
    'active_courses', totals.active_courses,
    'online_students', totals.online_students,
    'active_students', totals.active_students,
    'measured_at', now()
  )
  from totals;
$$;

comment on function public.public_learning_activity_summary() is
  'Returns public aggregate registration, enrollment-course, connected-user, and verified-learning counts without identities.';
