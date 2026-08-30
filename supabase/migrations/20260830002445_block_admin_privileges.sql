-- A blocked account must not retain administrative capabilities. This is an
-- additive security correction and does not read or rewrite learning history.
create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.platform_admins pa
    where pa.user_id = (select auth.uid())
      and pa.active = true
      and not exists (
        select 1
        from private.user_access_controls uac
        where uac.user_id = pa.user_id
          and uac.blocked_at is not null
      )
  );
$$;

create or replace function private.current_platform_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select pa.role
  from private.platform_admins pa
  where pa.user_id = (select auth.uid())
    and pa.active = true
    and not exists (
      select 1
      from private.user_access_controls uac
      where uac.user_id = pa.user_id
        and uac.blocked_at is not null
    );
$$;

revoke all on function private.is_platform_admin() from public, anon, authenticated;
revoke all on function private.current_platform_role() from public, anon, authenticated;
grant execute on function private.is_platform_admin() to authenticated;
