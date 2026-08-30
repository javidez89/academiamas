create or replace function public.get_my_access_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_control private.user_access_controls;
  v_entitlements jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into v_control from private.user_access_controls where user_id = v_user_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'course_key', ce.course_key,
    'enabled', ce.enabled,
    'reason', ce.reason,
    'updated_at', ce.updated_at
  ) order by ce.updated_at desc), '[]'::jsonb)
  into v_entitlements
  from private.certificate_entitlements ce
  where ce.user_id = v_user_id and ce.enabled = true;
  return jsonb_build_object(
    'blocked', v_control.blocked_at is not null,
    'blocked_at', v_control.blocked_at,
    'reason', v_control.block_reason,
    'admin_role', (select private.current_platform_role()),
    'certificate_entitlements', v_entitlements
  );
end;
$$;

revoke all on function public.get_my_access_status() from public, anon, authenticated;
grant execute on function public.get_my_access_status() to authenticated;

comment on function public.get_my_access_status() is
  'Returns only the authenticated user access state and certificate entitlements.';
