-- Direct administrative messages are independent from contact requests and from
-- every learning-history table.

create table if not exists private.admin_user_messages (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  sent_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint admin_user_messages_subject_length check (char_length(subject) between 3 and 160),
  constraint admin_user_messages_body_length check (char_length(message) between 10 and 5000),
  constraint admin_user_messages_read_time check (read_at is null or read_at >= created_at)
);

create index if not exists admin_user_messages_recipient_created_idx
  on private.admin_user_messages (recipient_user_id, created_at desc);
create index if not exists admin_user_messages_sent_created_idx
  on private.admin_user_messages (sent_by, created_at desc);

alter table private.admin_user_messages enable row level security;
revoke all on table private.admin_user_messages from public, anon, authenticated;

create or replace function private.admin_send_user_message(
  p_user_id uuid,
  p_subject text,
  p_message text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_subject text := regexp_replace(trim(coalesce(p_subject, '')), '\s+', ' ', 'g');
  v_message text := trim(coalesce(p_message, ''));
  v_row private.admin_user_messages;
begin
  perform private.require_platform_admin();
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  if char_length(v_subject) not between 3 and 160 then
    raise exception 'El asunto debe tener entre 3 y 160 caracteres' using errcode = '22023';
  end if;
  if char_length(v_message) not between 10 and 5000 then
    raise exception 'El mensaje debe tener entre 10 y 5000 caracteres' using errcode = '22023';
  end if;

  insert into private.admin_user_messages (recipient_user_id, subject, message, sent_by)
  values (p_user_id, v_subject, v_message, (select auth.uid()))
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'recipient_user_id', v_row.recipient_user_id,
    'subject', v_row.subject,
    'message', v_row.message,
    'created_at', v_row.created_at,
    'read_at', v_row.read_at
  );
end;
$$;

create or replace function public.admin_send_user_message(
  p_user_id uuid,
  p_subject text,
  p_message text
)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select private.admin_send_user_message(p_user_id, p_subject, p_message);
$$;

create or replace function private.list_my_admin_messages()
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
    'id', message.id,
    'kind', 'admin',
    'subject', message.subject,
    'message', message.message,
    'created_at', message.created_at,
    'read_at', message.read_at
  ) order by message.created_at desc), '[]'::jsonb)
  into v_result
  from private.admin_user_messages as message
  where message.recipient_user_id = v_user_id;

  return v_result;
end;
$$;

create or replace function public.list_my_admin_messages()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.list_my_admin_messages();
$$;

create or replace function private.mark_my_admin_message_read(p_message_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update private.admin_user_messages
  set read_at = coalesce(read_at, now())
  where id = p_message_id
    and recipient_user_id = v_user_id;

  return found;
end;
$$;

create or replace function public.mark_my_admin_message_read(p_message_id uuid)
returns boolean
language sql
volatile
security definer
set search_path = ''
as $$
  select private.mark_my_admin_message_read(p_message_id);
$$;

create or replace function private.admin_list_sent_user_messages(
  p_user_id uuid default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit integer := least(200, greatest(1, coalesce(p_limit, 100)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();

  with matching as (
    select message.*,
      auth_user.email,
      coalesce(nullif(profile.full_name, ''), split_part(coalesce(auth_user.email, ''), '@', 1), 'Usuario') as full_name
    from private.admin_user_messages as message
    join auth.users as auth_user on auth_user.id = message.recipient_user_id
    left join public.profiles as profile on profile.id = message.recipient_user_id
    where p_user_id is null or message.recipient_user_id = p_user_id
  ), page as (
    select * from matching order by created_at desc limit v_limit offset v_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from matching),
    'messages', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc) from page), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.admin_list_sent_user_messages(
  p_user_id uuid default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.admin_list_sent_user_messages(p_user_id, p_limit, p_offset);
$$;

revoke all on function private.admin_send_user_message(uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_send_user_message(uuid, text, text) from public, anon, authenticated;
revoke all on function private.list_my_admin_messages() from public, anon, authenticated;
revoke all on function public.list_my_admin_messages() from public, anon, authenticated;
revoke all on function private.mark_my_admin_message_read(uuid) from public, anon, authenticated;
revoke all on function public.mark_my_admin_message_read(uuid) from public, anon, authenticated;
revoke all on function private.admin_list_sent_user_messages(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_list_sent_user_messages(uuid, integer, integer) from public, anon, authenticated;

grant execute on function public.admin_send_user_message(uuid, text, text) to authenticated;
grant execute on function public.list_my_admin_messages() to authenticated;
grant execute on function public.mark_my_admin_message_read(uuid) to authenticated;
grant execute on function public.admin_list_sent_user_messages(uuid, integer, integer) to authenticated;

comment on table private.admin_user_messages is
  'Immutable in-platform messages sent by an authorized administrator to one authenticated user.';
