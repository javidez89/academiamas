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
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Invalid course key' using errcode = '22023';
  end if;

  perform 1
  from public.course_enrollments
  where user_id = v_user_id
    and course_key = v_course_key
    and status = 'cancelled'
  for update;

  if not found then
    raise exception 'Cancelled enrollment required' using errcode = '55000';
  end if;

  delete from public.course_final_exam_attempts
  where user_id = v_user_id
    and course_key = v_course_key;

  delete from public.course_progress
  where user_id = v_user_id
    and course_key = v_course_key;

  delete from public.course_enrollments
  where user_id = v_user_id
    and course_key = v_course_key
    and status = 'cancelled';

  return true;
end;
$$;

create or replace function public.delete_cancelled_course(p_course_key text)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.delete_cancelled_course(p_course_key);
$$;

revoke all on function private.delete_cancelled_course(text) from public, anon;
revoke all on function public.delete_cancelled_course(text) from public, anon;

grant execute on function private.delete_cancelled_course(text) to authenticated;
grant execute on function public.delete_cancelled_course(text) to authenticated;
