create schema if not exists private;

create table if not exists private.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  source_path text not null default '',
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'responded', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(full_name) between 2 and 120),
  constraint contact_messages_email_length check (char_length(email) between 5 and 254),
  constraint contact_messages_subject_length check (char_length(subject) between 3 and 160),
  constraint contact_messages_body_length check (char_length(message) between 10 and 5000),
  constraint contact_messages_reply_length check (admin_reply is null or char_length(admin_reply) <= 5000)
);

create index if not exists contact_messages_status_created_idx
  on private.contact_messages (status, created_at desc);
create index if not exists contact_messages_email_created_idx
  on private.contact_messages (email, created_at desc);
create index if not exists contact_messages_user_created_idx
  on private.contact_messages (user_id, created_at desc)
  where user_id is not null;

alter table private.contact_messages enable row level security;
revoke all on table private.contact_messages from public, anon, authenticated;

create table if not exists private.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_reviews_key_format check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_reviews_comment_length check (comment is null or char_length(comment) <= 1000),
  constraint course_reviews_user_course_unique unique (user_id, course_key)
);

create index if not exists course_reviews_status_created_idx
  on private.course_reviews (status, created_at desc);
create index if not exists course_reviews_course_status_created_idx
  on private.course_reviews (course_key, status, created_at desc);

alter table private.course_reviews enable row level security;
revoke all on table private.course_reviews from public, anon, authenticated;

create or replace function private.submit_contact_message(
  p_full_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_source_path text default '',
  p_website text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_name text := regexp_replace(trim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  v_email text := lower(trim(coalesce(p_email, '')));
  v_subject text := regexp_replace(trim(coalesce(p_subject, '')), '\s+', ' ', 'g');
  v_message text := trim(coalesce(p_message, ''));
  v_source_path text := left(trim(coalesce(p_source_path, '')), 300);
  v_row private.contact_messages;
begin
  if trim(coalesce(p_website, '')) <> '' then
    raise exception 'Invalid form submission' using errcode = '22023';
  end if;
  if char_length(v_name) not between 2 and 120 then
    raise exception 'El nombre completo debe tener entre 2 y 120 caracteres' using errcode = '22023';
  end if;
  if char_length(v_email) not between 5 and 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'El correo electrónico no es válido' using errcode = '22023';
  end if;
  if char_length(v_subject) not between 3 and 160 then
    raise exception 'El asunto debe tener entre 3 y 160 caracteres' using errcode = '22023';
  end if;
  if char_length(v_message) not between 10 and 5000 then
    raise exception 'El mensaje debe tener entre 10 y 5000 caracteres' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_email, 0));
  if exists (
    select 1 from private.contact_messages cm
    where cm.created_at > now() - interval '10 minutes'
      and (cm.email = v_email or (v_user_id is not null and cm.user_id = v_user_id))
  ) then
    raise exception 'Espera unos minutos antes de enviar otro mensaje' using errcode = 'P0001';
  end if;
  if (
    select count(*) from private.contact_messages cm
    where cm.created_at > now() - interval '24 hours'
      and (cm.email = v_email or (v_user_id is not null and cm.user_id = v_user_id))
  ) >= 5 then
    raise exception 'Alcanzaste el límite diario de mensajes' using errcode = 'P0001';
  end if;

  insert into private.contact_messages (user_id, full_name, email, subject, message, source_path)
  values (v_user_id, v_name, v_email, v_subject, v_message, v_source_path)
  returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'status', 'received', 'created_at', v_row.created_at);
end;
$$;

create or replace function public.submit_contact_message(
  p_full_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_source_path text default '',
  p_website text default ''
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.submit_contact_message(p_full_name, p_email, p_subject, p_message, p_source_path, p_website);
$$;

create or replace function private.submit_course_review(
  p_course_key text,
  p_rating integer,
  p_comment text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_comment text := nullif(trim(coalesce(p_comment, '')), '');
  v_row private.course_reviews;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    raise exception 'Curso no válido' using errcode = '22023';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'La calificación debe estar entre 1 y 5 estrellas' using errcode = '22023';
  end if;
  if v_comment is not null and char_length(v_comment) > 1000 then
    raise exception 'El comentario no puede superar 1000 caracteres' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.course_enrollments ce
    where ce.user_id = v_user_id
      and ce.course_key = v_course_key
      and ce.status in ('active', 'completed')
  ) then
    raise exception 'Debes estar inscrito en el curso para calificarlo' using errcode = '42501';
  end if;

  insert into private.course_reviews (user_id, course_key, rating, comment)
  values (v_user_id, v_course_key, p_rating, v_comment)
  on conflict (user_id, course_key) do update set
    rating = excluded.rating,
    comment = excluded.comment,
    status = 'pending',
    moderated_at = null,
    moderated_by = null,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'course_key', v_row.course_key,
    'rating', v_row.rating,
    'comment', v_row.comment,
    'status', v_row.status,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.submit_course_review(
  p_course_key text,
  p_rating integer,
  p_comment text default null
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.submit_course_review(p_course_key, p_rating, p_comment);
$$;

create or replace function private.get_my_course_review(p_course_key text)
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
  select to_jsonb(cr) - 'user_id' - 'moderated_by'
  into v_result
  from private.course_reviews cr
  where cr.user_id = v_user_id and cr.course_key = lower(trim(coalesce(p_course_key, '')));
  return v_result;
end;
$$;

create or replace function public.get_my_course_review(p_course_key text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.get_my_course_review(p_course_key);
$$;

create or replace function private.list_approved_course_reviews(
  p_course_key text default null,
  p_limit integer default 8
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_course_key text := nullif(lower(trim(coalesce(p_course_key, ''))), '');
  v_limit integer := least(24, greatest(1, coalesce(p_limit, 8)));
  v_result jsonb;
begin
  with approved as (
    select
      cr.id,
      cr.course_key,
      cr.rating,
      cr.comment,
      cr.created_at,
      coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1), 'Estudiante') as full_name
    from private.course_reviews cr
    join auth.users u on u.id = cr.user_id
    left join public.profiles p on p.id = cr.user_id
    where cr.status = 'approved'
      and (v_course_key is null or cr.course_key = v_course_key)
  ), page as (
    select * from approved order by created_at desc limit v_limit
  )
  select jsonb_build_object(
    'average_rating', coalesce((select round(avg(rating)::numeric, 1) from approved), 0),
    'total', (select count(*) from approved),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id,
      'course_key', course_key,
      'rating', rating,
      'comment', comment,
      'display_name', split_part(full_name, ' ', 1)
        || case when position(' ' in full_name) > 0 then ' ' || left(split_part(full_name, ' ', 2), 1) || '.' else '' end,
      'created_at', created_at
    ) order by created_at desc) from page), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.list_approved_course_reviews(
  p_course_key text default null,
  p_limit integer default 8
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.list_approved_course_reviews(p_course_key, p_limit);
$$;

create or replace function private.admin_list_contact_messages(
  p_status text default '',
  p_search text default '',
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
    select cm.*
    from private.contact_messages cm
    where (v_status = '' or cm.status = v_status)
      and (v_search = '' or cm.full_name ilike '%' || v_search || '%'
        or cm.email ilike '%' || v_search || '%'
        or cm.subject ilike '%' || v_search || '%')
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

create or replace function public.admin_list_contact_messages(
  p_status text default '', p_search text default '', p_limit integer default 100, p_offset integer default 0
)
returns jsonb language sql stable security definer set search_path = '' as $$
  select private.admin_list_contact_messages(p_status, p_search, p_limit, p_offset);
$$;

create or replace function private.admin_update_contact_message(
  p_message_id uuid,
  p_status text,
  p_admin_reply text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_status, '')));
  v_reply text := nullif(trim(coalesce(p_admin_reply, '')), '');
  v_row private.contact_messages;
begin
  perform private.require_platform_admin();
  if v_status not in ('new', 'in_progress', 'responded', 'closed') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  if v_status = 'responded' and v_reply is null then
    raise exception 'Escribe una respuesta antes de marcar el mensaje como respondido' using errcode = '22023';
  end if;
  if v_reply is not null and char_length(v_reply) > 5000 then
    raise exception 'La respuesta no puede superar 5000 caracteres' using errcode = '22023';
  end if;

  update private.contact_messages set
    status = v_status,
    admin_reply = coalesce(v_reply, admin_reply),
    replied_at = case when v_status = 'responded' then now() else replied_at end,
    replied_by = case when v_status = 'responded' then (select auth.uid()) else replied_by end,
    updated_at = now()
  where id = p_message_id
  returning * into v_row;
  if v_row.id is null then raise exception 'Mensaje no encontrado' using errcode = 'P0002'; end if;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.admin_update_contact_message(
  p_message_id uuid, p_status text, p_admin_reply text default null
)
returns jsonb language sql security definer set search_path = '' as $$
  select private.admin_update_contact_message(p_message_id, p_status, p_admin_reply);
$$;

create or replace function private.admin_list_course_reviews(
  p_status text default '',
  p_search text default '',
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
    select cr.*, u.email,
      coalesce(nullif(p.full_name, ''), split_part(coalesce(u.email, ''), '@', 1), 'Usuario') as full_name
    from private.course_reviews cr
    join auth.users u on u.id = cr.user_id
    left join public.profiles p on p.id = cr.user_id
    where (v_status = '' or cr.status = v_status)
      and (v_search = '' or cr.course_key ilike '%' || v_search || '%'
        or coalesce(u.email, '') ilike '%' || v_search || '%'
        or coalesce(p.full_name, '') ilike '%' || v_search || '%')
  ), page as (
    select * from matching order by created_at desc limit v_limit offset v_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from matching),
    'reviews', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc) from page), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.admin_list_course_reviews(
  p_status text default '', p_search text default '', p_limit integer default 100, p_offset integer default 0
)
returns jsonb language sql stable security definer set search_path = '' as $$
  select private.admin_list_course_reviews(p_status, p_search, p_limit, p_offset);
$$;

create or replace function private.admin_moderate_course_review(p_review_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text := lower(trim(coalesce(p_status, '')));
  v_row private.course_reviews;
begin
  perform private.require_platform_admin();
  if v_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  update private.course_reviews set
    status = v_status,
    moderated_at = case when v_status = 'pending' then null else now() end,
    moderated_by = case when v_status = 'pending' then null else (select auth.uid()) end,
    updated_at = now()
  where id = p_review_id
  returning * into v_row;
  if v_row.id is null then raise exception 'Calificación no encontrada' using errcode = 'P0002'; end if;
  return to_jsonb(v_row) - 'user_id';
end;
$$;

create or replace function public.admin_moderate_course_review(p_review_id uuid, p_status text)
returns jsonb language sql security definer set search_path = '' as $$
  select private.admin_moderate_course_review(p_review_id, p_status);
$$;

revoke all on function private.submit_contact_message(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.submit_contact_message(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function private.submit_course_review(text, integer, text) from public, anon, authenticated;
revoke all on function public.submit_course_review(text, integer, text) from public, anon, authenticated;
revoke all on function private.get_my_course_review(text) from public, anon, authenticated;
revoke all on function public.get_my_course_review(text) from public, anon, authenticated;
revoke all on function private.list_approved_course_reviews(text, integer) from public, anon, authenticated;
revoke all on function public.list_approved_course_reviews(text, integer) from public, anon, authenticated;
revoke all on function private.admin_list_contact_messages(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_list_contact_messages(text, text, integer, integer) from public, anon, authenticated;
revoke all on function private.admin_update_contact_message(uuid, text, text) from public, anon, authenticated;
revoke all on function public.admin_update_contact_message(uuid, text, text) from public, anon, authenticated;
revoke all on function private.admin_list_course_reviews(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_list_course_reviews(text, text, integer, integer) from public, anon, authenticated;
revoke all on function private.admin_moderate_course_review(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_moderate_course_review(uuid, text) from public, anon, authenticated;

grant execute on function public.submit_contact_message(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.submit_course_review(text, integer, text) to authenticated;
grant execute on function public.get_my_course_review(text) to authenticated;
grant execute on function public.list_approved_course_reviews(text, integer) to anon, authenticated;
grant execute on function public.admin_list_contact_messages(text, text, integer, integer) to authenticated;
grant execute on function public.admin_update_contact_message(uuid, text, text) to authenticated;
grant execute on function public.admin_list_course_reviews(text, text, integer, integer) to authenticated;
grant execute on function public.admin_moderate_course_review(uuid, text) to authenticated;
