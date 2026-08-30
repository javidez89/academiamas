-- QAvance governance is intentionally additive. This migration must never rewrite
-- learning progress, verified sessions, assessment attempts, or legacy history.

alter table private.contact_messages
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;

alter table private.course_reviews
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;

alter table public.certificates
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

alter table public.course_enrollments
  add column if not exists hidden_at timestamptz;

alter table private.platform_admins
  add column if not exists role text not null default 'admin'
    check (role in ('admin', 'superadmin')),
  add column if not exists active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

update private.platform_admins
set role = 'superadmin', active = true, updated_at = now()
where user_id in (
  select id from auth.users where lower(email) = 'javidez89@gmail.com'
);

insert into private.platform_admins (user_id, role, active)
select id,
  case when lower(email) = 'javidez89@gmail.com' then 'superadmin' else 'admin' end,
  true
from auth.users
where lower(email) in ('javidez89@gmail.com', 'academiaqaoficial@gmail.com')
on conflict (user_id) do update set
  role = case
    when lower((select email from auth.users where id = excluded.user_id)) = 'javidez89@gmail.com'
      then 'superadmin'
    else private.platform_admins.role
  end,
  active = true,
  updated_at = now();

create table if not exists private.user_access_controls (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked_at timestamptz,
  blocked_by uuid references auth.users(id) on delete set null,
  block_reason text,
  updated_at timestamptz not null default now(),
  constraint user_access_reason_length check (block_reason is null or char_length(block_reason) <= 500)
);

create table if not exists private.certificate_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  enabled boolean not null default true,
  reason text,
  enabled_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_key),
  constraint certificate_entitlements_reason_length check (reason is null or char_length(reason) <= 500)
);

alter table private.user_access_controls enable row level security;
alter table private.certificate_entitlements enable row level security;
revoke all on table private.user_access_controls from public, anon, authenticated;
revoke all on table private.certificate_entitlements from public, anon, authenticated;

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
    where user_id = (select auth.uid()) and active = true
  );
$$;

create or replace function private.current_platform_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from private.platform_admins
  where user_id = (select auth.uid()) and active = true;
$$;

create or replace function private.require_platform_superadmin()
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
  if coalesce((select private.current_platform_role()), '') <> 'superadmin' then
    raise exception 'Superadministrator access required' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.is_user_blocked(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.user_access_controls
    where user_id = p_user_id and blocked_at is not null
  );
$$;

create or replace function private.require_active_platform_user()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if (select private.is_user_blocked(v_user_id)) then
    raise exception 'Cuenta bloqueada. Contacta al equipo de QAvance.' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.guard_blocked_user_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is not null and (select private.is_user_blocked(v_user_id)) then
    raise exception 'Cuenta bloqueada. Contacta al equipo de QAvance.' using errcode = '42501';
  end if;
  return new;
end;
$$;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'public.course_enrollments',
    'public.course_progress',
    'private.learning_activity_sessions',
    'private.verified_assessment_attempts',
    'private.verified_assessment_questions'
  ] loop
    if to_regclass(v_table) is not null then
      execute format('drop trigger if exists guard_blocked_user_write on %s', v_table);
      execute format(
        'create trigger guard_blocked_user_write before insert or update on %s for each row execute function private.guard_blocked_user_write()',
        v_table
      );
    end if;
  end loop;
end;
$$;

create or replace function private.restore_visible_enrollment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status in ('active', 'completed') then new.hidden_at := null; end if;
  return new;
end;
$$;

drop trigger if exists restore_visible_enrollment on public.course_enrollments;
create trigger restore_visible_enrollment
before insert or update of status on public.course_enrollments
for each row execute function private.restore_visible_enrollment();

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
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into v_control from private.user_access_controls where user_id = v_user_id;
  return jsonb_build_object(
    'blocked', v_control.blocked_at is not null,
    'blocked_at', v_control.blocked_at,
    'reason', v_control.block_reason,
    'admin_role', (select private.current_platform_role())
  );
end;
$$;

create or replace function private.list_my_contact_messages()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', cm.id,
    'subject', cm.subject,
    'message', cm.message,
    'status', cm.status,
    'admin_reply', cm.admin_reply,
    'created_at', cm.created_at,
    'updated_at', cm.updated_at,
    'replied_at', cm.replied_at
  ) order by cm.created_at desc), '[]'::jsonb)
  into v_result
  from private.contact_messages cm
  where cm.user_id = v_user_id and cm.deleted_at is null;
  return v_result;
end;
$$;

create or replace function public.list_my_contact_messages()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$ select private.list_my_contact_messages(); $$;

create or replace function private.archive_cancelled_course(p_course_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_key text := lower(trim(coalesce(p_course_key, '')));
begin
  perform private.require_active_platform_user();
  update public.course_enrollments
  set hidden_at = now(), updated_at = now()
  where user_id = v_user_id and course_key = v_key and status = 'cancelled';
  return found;
end;
$$;

create or replace function public.archive_cancelled_course(p_course_key text)
returns boolean
language sql
security definer
set search_path = ''
as $$ select private.archive_cancelled_course(p_course_key); $$;

create or replace function private.admin_list_user_governance(p_user_ids uuid[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_result jsonb;
begin
  perform private.require_platform_admin();
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id', u.id,
    'blocked', ac.blocked_at is not null,
    'blocked_at', ac.blocked_at,
    'block_reason', ac.block_reason,
    'admin_role', case when pa.active then pa.role else null end,
    'certificate_entitlements', coalesce((
      select jsonb_agg(jsonb_build_object('course_key', ce.course_key, 'enabled', ce.enabled, 'reason', ce.reason))
      from private.certificate_entitlements ce where ce.user_id = u.id
    ), '[]'::jsonb)
  )), '[]'::jsonb)
  into v_result
  from auth.users u
  left join private.user_access_controls ac on ac.user_id = u.id
  left join private.platform_admins pa on pa.user_id = u.id
  where u.id = any(coalesce(p_user_ids, array[]::uuid[]));
  return v_result;
end;
$$;

create or replace function public.admin_list_user_governance(p_user_ids uuid[])
returns jsonb language sql stable security definer set search_path = ''
as $$ select private.admin_list_user_governance(p_user_ids); $$;

create or replace function private.admin_set_user_blocked(p_user_id uuid, p_blocked boolean, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  perform private.require_platform_admin();
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if exists (select 1 from private.platform_admins where user_id = p_user_id and role = 'superadmin' and active) then
    perform private.require_platform_superadmin();
    if p_user_id = v_actor and p_blocked then
      raise exception 'No puedes bloquear tu propia cuenta superadministradora' using errcode = '42501';
    end if;
  end if;
  insert into private.user_access_controls (user_id, blocked_at, blocked_by, block_reason, updated_at)
  values (p_user_id, case when p_blocked then now() else null end, case when p_blocked then v_actor else null end,
    case when p_blocked then v_reason else null end, now())
  on conflict (user_id) do update set
    blocked_at = excluded.blocked_at,
    blocked_by = excluded.blocked_by,
    block_reason = excluded.block_reason,
    updated_at = now();
  return jsonb_build_object('user_id', p_user_id, 'blocked', p_blocked, 'reason', case when p_blocked then v_reason else null end);
end;
$$;

create or replace function public.admin_set_user_blocked(p_user_id uuid, p_blocked boolean, p_reason text default null)
returns jsonb language sql security definer set search_path = ''
as $$ select private.admin_set_user_blocked(p_user_id, p_blocked, p_reason); $$;

create or replace function private.admin_set_user_role(p_user_id uuid, p_role text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_role text := nullif(lower(trim(coalesce(p_role, ''))), 'none');
begin
  perform private.require_platform_superadmin();
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if v_role is not null and v_role not in ('admin', 'superadmin') then
    raise exception 'Rol no válido' using errcode = '22023';
  end if;
  if p_user_id = v_actor and v_role is distinct from 'superadmin' then
    raise exception 'No puedes retirar tu propio rol superadministrador' using errcode = '42501';
  end if;
  if v_role is null then
    update private.platform_admins set active = false, updated_at = now(), updated_by = v_actor where user_id = p_user_id;
  else
    insert into private.platform_admins (user_id, role, active, updated_at, updated_by)
    values (p_user_id, v_role, true, now(), v_actor)
    on conflict (user_id) do update set role = excluded.role, active = true, updated_at = now(), updated_by = v_actor;
  end if;
  return jsonb_build_object('user_id', p_user_id, 'role', v_role);
end;
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role text)
returns jsonb language sql security definer set search_path = ''
as $$ select private.admin_set_user_role(p_user_id, p_role); $$;

create or replace function private.admin_set_certificate_eligibility(
  p_user_id uuid, p_course_key text, p_enabled boolean, p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := lower(trim(coalesce(p_course_key, '')));
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  perform private.require_platform_superadmin();
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if v_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Curso no válido' using errcode = '22023';
  end if;
  insert into private.certificate_entitlements (user_id, course_key, enabled, reason, enabled_by, updated_at)
  values (p_user_id, v_key, p_enabled, v_reason, (select auth.uid()), now())
  on conflict (user_id, course_key) do update set
    enabled = excluded.enabled,
    reason = excluded.reason,
    enabled_by = excluded.enabled_by,
    updated_at = now();
  return jsonb_build_object('user_id', p_user_id, 'course_key', v_key, 'enabled', p_enabled, 'reason', v_reason);
end;
$$;

create or replace function public.admin_set_certificate_eligibility(
  p_user_id uuid, p_course_key text, p_enabled boolean, p_reason text default null
)
returns jsonb language sql security definer set search_path = ''
as $$ select private.admin_set_certificate_eligibility(p_user_id, p_course_key, p_enabled, p_reason); $$;

create or replace function public.get_certificate_entitlement(p_user_id uuid, p_course_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.certificate_entitlements
    where user_id = p_user_id and course_key = lower(trim(coalesce(p_course_key, ''))) and enabled = true
  );
$$;

create or replace function private.admin_soft_delete_contact_message(p_message_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_platform_admin();
  update private.contact_messages
  set deleted_at = now(), deleted_by = (select auth.uid()), updated_at = now()
  where id = p_message_id and deleted_at is null;
  return found;
end;
$$;

create or replace function public.admin_soft_delete_contact_message(p_message_id uuid)
returns boolean language sql security definer set search_path = ''
as $$ select private.admin_soft_delete_contact_message(p_message_id); $$;

create or replace function private.admin_soft_delete_course_review(p_review_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_platform_admin();
  update private.course_reviews
  set status = 'rejected', deleted_at = now(), deleted_by = (select auth.uid()), updated_at = now()
  where id = p_review_id and deleted_at is null;
  return found;
end;
$$;

create or replace function public.admin_soft_delete_course_review(p_review_id uuid)
returns boolean language sql security definer set search_path = ''
as $$ select private.admin_soft_delete_course_review(p_review_id); $$;

create or replace function private.admin_update_certificate_status(
  p_certificate_id uuid, p_action text, p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text := lower(trim(coalesce(p_action, '')));
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_row public.certificates;
begin
  perform private.require_platform_admin();
  if v_action not in ('revoke', 'restore', 'archive', 'unarchive') then
    raise exception 'Acción no válida' using errcode = '22023';
  end if;
  update public.certificates set
    status = case when v_action = 'revoke' then 'REVOKED' when v_action = 'restore' then 'VALID' else status end,
    revoked_at = case when v_action = 'revoke' then now() when v_action = 'restore' then null else revoked_at end,
    revoke_reason = case when v_action = 'revoke' then v_reason when v_action = 'restore' then null else revoke_reason end,
    archived_at = case when v_action = 'archive' then now() when v_action = 'unarchive' then null else archived_at end,
    archived_by = case when v_action = 'archive' then (select auth.uid()) when v_action = 'unarchive' then null else archived_by end
  where id = p_certificate_id
  returning * into v_row;
  if v_row.id is null then raise exception 'Certificado no encontrado' using errcode = 'P0002'; end if;
  return jsonb_build_object('id', v_row.id, 'status', v_row.status, 'archived_at', v_row.archived_at, 'revoke_reason', v_row.revoke_reason);
end;
$$;

create or replace function public.admin_update_certificate_status(
  p_certificate_id uuid, p_action text, p_reason text default null
)
returns jsonb language sql security definer set search_path = ''
as $$ select private.admin_update_certificate_status(p_certificate_id, p_action, p_reason); $$;

-- Existing list functions are wrapped to omit soft-deleted content.
create or replace function private.list_approved_course_reviews(p_course_key text default null, p_limit integer default 8)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_course_key text := nullif(lower(trim(coalesce(p_course_key, ''))), '');
  v_limit integer := least(24, greatest(1, coalesce(p_limit, 8)));
  v_result jsonb;
begin
  with approved as (
    select cr.id, cr.course_key, cr.rating, cr.comment, cr.created_at,
      coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1), 'Estudiante') as full_name
    from private.course_reviews cr
    join auth.users u on u.id = cr.user_id
    left join public.profiles p on p.id = cr.user_id
    where cr.status = 'approved' and cr.deleted_at is null
      and (v_course_key is null or cr.course_key = v_course_key)
  ), page as (select * from approved order by created_at desc limit v_limit)
  select jsonb_build_object(
    'average_rating', coalesce((select round(avg(rating)::numeric, 1) from approved), 0),
    'total', (select count(*) from approved),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'course_key', course_key, 'rating', rating, 'comment', comment,
      'display_name', split_part(full_name, ' ', 1) || case when position(' ' in full_name) > 0 then ' ' || left(split_part(full_name, ' ', 2), 1) || '.' else '' end,
      'created_at', created_at
    ) order by created_at desc) from page), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function private.admin_list_contact_messages(
  p_status text default '', p_search text default '', p_limit integer default 100, p_offset integer default 0
)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_status, '')));
  v_search text := left(trim(coalesce(p_search, '')), 120);
  v_limit integer := least(200, greatest(1, coalesce(p_limit, 100)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();
  if v_status <> '' and v_status not in ('new', 'in_progress', 'responded', 'closed') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  with matching as (
    select cm.* from private.contact_messages cm
    where cm.deleted_at is null and (v_status = '' or cm.status = v_status)
      and (v_search = '' or cm.full_name ilike '%' || v_search || '%' or cm.email ilike '%' || v_search || '%' or cm.subject ilike '%' || v_search || '%')
  ), page as (select * from matching order by created_at desc limit v_limit offset v_offset)
  select jsonb_build_object('total', (select count(*) from matching),
    'messages', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc) from page), '[]'::jsonb))
  into v_result;
  return v_result;
end;
$$;

create or replace function private.admin_list_course_reviews(
  p_status text default '', p_search text default '', p_limit integer default 100, p_offset integer default 0
)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_status, '')));
  v_search text := left(trim(coalesce(p_search, '')), 120);
  v_limit integer := least(200, greatest(1, coalesce(p_limit, 100)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();
  if v_status <> '' and v_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  with matching as (
    select cr.*, u.email, coalesce(nullif(p.full_name, ''), split_part(coalesce(u.email, ''), '@', 1), 'Usuario') as full_name
    from private.course_reviews cr join auth.users u on u.id = cr.user_id left join public.profiles p on p.id = cr.user_id
    where cr.deleted_at is null and (v_status = '' or cr.status = v_status)
      and (v_search = '' or cr.course_key ilike '%' || v_search || '%' or coalesce(u.email, '') ilike '%' || v_search || '%' or coalesce(p.full_name, '') ilike '%' || v_search || '%')
  ), page as (select * from matching order by created_at desc limit v_limit offset v_offset)
  select jsonb_build_object('total', (select count(*) from matching),
    'reviews', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc) from page), '[]'::jsonb))
  into v_result;
  return v_result;
end;
$$;

revoke all on function public.get_my_access_status() from public, anon, authenticated;
revoke all on function public.list_my_contact_messages() from public, anon, authenticated;
revoke all on function public.archive_cancelled_course(text) from public, anon, authenticated;
revoke all on function public.admin_list_user_governance(uuid[]) from public, anon, authenticated;
revoke all on function public.admin_set_user_blocked(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.admin_set_user_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_set_certificate_eligibility(uuid, text, boolean, text) from public, anon, authenticated;
revoke all on function public.get_certificate_entitlement(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.admin_soft_delete_contact_message(uuid) from public, anon, authenticated;
revoke all on function public.admin_soft_delete_course_review(uuid) from public, anon, authenticated;
revoke all on function public.admin_update_certificate_status(uuid, text, text) from public, anon, authenticated;
revoke all on function private.current_platform_role() from public, anon, authenticated;
revoke all on function private.require_platform_superadmin() from public, anon, authenticated;
revoke all on function private.is_user_blocked(uuid) from public, anon, authenticated;
revoke all on function private.require_active_platform_user() from public, anon, authenticated;
revoke all on function private.guard_blocked_user_write() from public, anon, authenticated;

grant execute on function public.get_my_access_status() to authenticated;
grant execute on function public.list_my_contact_messages() to authenticated;
grant execute on function public.archive_cancelled_course(text) to authenticated;
grant execute on function public.admin_list_user_governance(uuid[]) to authenticated;
grant execute on function public.admin_set_user_blocked(uuid, boolean, text) to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_set_certificate_eligibility(uuid, text, boolean, text) to authenticated;
grant execute on function public.get_certificate_entitlement(uuid, text) to service_role;
grant execute on function public.admin_soft_delete_contact_message(uuid) to authenticated;
grant execute on function public.admin_soft_delete_course_review(uuid) to authenticated;
grant execute on function public.admin_update_certificate_status(uuid, text, text) to authenticated;

-- The old destructive operation is retained for migration history but is no
-- longer callable by users. Its replacement only hides a cancelled enrollment.
revoke all on function public.delete_cancelled_course(text) from public, anon, authenticated;

comment on function public.archive_cancelled_course(text) is
  'Hides a cancelled enrollment while preserving all learning and assessment history.';
comment on table private.certificate_entitlements is
  'Superadmin overrides for certificate checkout eligibility. Does not mark a course as completed.';
