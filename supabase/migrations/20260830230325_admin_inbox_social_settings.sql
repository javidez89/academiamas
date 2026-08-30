create table if not exists private.platform_social_settings (
  id smallint primary key default 1 check (id = 1),
  linkedin_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  whatsapp_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint platform_social_linkedin_https check (linkedin_url is null or linkedin_url ~ '^https://'),
  constraint platform_social_facebook_https check (facebook_url is null or facebook_url ~ '^https://'),
  constraint platform_social_tiktok_https check (tiktok_url is null or tiktok_url ~ '^https://'),
  constraint platform_social_youtube_https check (youtube_url is null or youtube_url ~ '^https://'),
  constraint platform_social_whatsapp_https check (
    whatsapp_url is null
    or whatsapp_url ~ '^https://(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)/'
  )
);

alter table private.platform_social_settings enable row level security;
revoke all on table private.platform_social_settings from public, anon, authenticated;

insert into private.platform_social_settings (id, linkedin_url)
values (1, 'https://www.linkedin.com/in/javierchilatra89/')
on conflict (id) do nothing;

create or replace function private.get_public_social_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'linkedin_url', linkedin_url,
    'facebook_url', facebook_url,
    'tiktok_url', tiktok_url,
    'youtube_url', youtube_url,
    'whatsapp_url', whatsapp_url
  )
  from private.platform_social_settings
  where id = 1;
$$;

create or replace function public.get_public_social_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.get_public_social_settings();
$$;

create or replace function private.admin_update_social_settings(
  p_linkedin_url text default null,
  p_facebook_url text default null,
  p_tiktok_url text default null,
  p_youtube_url text default null,
  p_whatsapp_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_linkedin_url text := nullif(trim(coalesce(p_linkedin_url, '')), '');
  v_facebook_url text := nullif(trim(coalesce(p_facebook_url, '')), '');
  v_tiktok_url text := nullif(trim(coalesce(p_tiktok_url, '')), '');
  v_youtube_url text := nullif(trim(coalesce(p_youtube_url, '')), '');
  v_whatsapp_url text := nullif(trim(coalesce(p_whatsapp_url, '')), '');
  v_row private.platform_social_settings;
begin
  perform private.require_platform_admin();

  if exists (
    select 1 from unnest(array[v_linkedin_url, v_facebook_url, v_tiktok_url, v_youtube_url]) as value
    where value is not null and value !~ '^https://'
  ) then
    raise exception 'Las redes sociales deben usar direcciones HTTPS' using errcode = '22023';
  end if;
  if v_whatsapp_url is not null
    and v_whatsapp_url !~ '^https://(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)/' then
    raise exception 'La dirección de WhatsApp no es válida' using errcode = '22023';
  end if;
  if greatest(
    coalesce(char_length(v_linkedin_url), 0),
    coalesce(char_length(v_facebook_url), 0),
    coalesce(char_length(v_tiktok_url), 0),
    coalesce(char_length(v_youtube_url), 0),
    coalesce(char_length(v_whatsapp_url), 0)
  ) > 500 then
    raise exception 'Las direcciones no pueden superar 500 caracteres' using errcode = '22023';
  end if;

  insert into private.platform_social_settings (
    id, linkedin_url, facebook_url, tiktok_url, youtube_url, whatsapp_url, updated_at, updated_by
  ) values (
    1, v_linkedin_url, v_facebook_url, v_tiktok_url, v_youtube_url, v_whatsapp_url, now(), (select auth.uid())
  )
  on conflict (id) do update set
    linkedin_url = excluded.linkedin_url,
    facebook_url = excluded.facebook_url,
    tiktok_url = excluded.tiktok_url,
    youtube_url = excluded.youtube_url,
    whatsapp_url = excluded.whatsapp_url,
    updated_at = now(),
    updated_by = (select auth.uid())
  returning * into v_row;

  return jsonb_build_object(
    'linkedin_url', v_row.linkedin_url,
    'facebook_url', v_row.facebook_url,
    'tiktok_url', v_row.tiktok_url,
    'youtube_url', v_row.youtube_url,
    'whatsapp_url', v_row.whatsapp_url,
    'updated_at', v_row.updated_at
  );
end;
$$;

create or replace function public.admin_update_social_settings(
  p_linkedin_url text default null,
  p_facebook_url text default null,
  p_tiktok_url text default null,
  p_youtube_url text default null,
  p_whatsapp_url text default null
)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select private.admin_update_social_settings(
    p_linkedin_url, p_facebook_url, p_tiktok_url, p_youtube_url, p_whatsapp_url
  );
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
  if v_status <> '' and v_status not in ('new', 'in_progress', 'responded', 'closed', 'archived') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  with matching as (
    select cm.* from private.contact_messages cm
    where ((v_status = 'archived' and cm.deleted_at is not null)
      or (v_status <> 'archived' and cm.deleted_at is null and (v_status = '' or cm.status = v_status)))
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
  if v_status <> '' and v_status not in ('pending', 'approved', 'rejected', 'archived') then
    raise exception 'Estado no válido' using errcode = '22023';
  end if;
  with matching as (
    select cr.*, u.email, coalesce(nullif(p.full_name, ''), split_part(coalesce(u.email, ''), '@', 1), 'Usuario') as full_name
    from private.course_reviews cr
    join auth.users u on u.id = cr.user_id
    left join public.profiles p on p.id = cr.user_id
    where ((v_status = 'archived' and cr.deleted_at is not null)
      or (v_status <> 'archived' and cr.deleted_at is null and (v_status = '' or cr.status = v_status)))
      and (v_search = '' or cr.course_key ilike '%' || v_search || '%' or coalesce(u.email, '') ilike '%' || v_search || '%' or coalesce(p.full_name, '') ilike '%' || v_search || '%')
  ), page as (select * from matching order by created_at desc limit v_limit offset v_offset)
  select jsonb_build_object('total', (select count(*) from matching),
    'reviews', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc) from page), '[]'::jsonb))
  into v_result;
  return v_result;
end;
$$;

revoke all on function private.get_public_social_settings() from public, anon, authenticated;
revoke all on function public.get_public_social_settings() from public, anon, authenticated;
revoke all on function private.admin_update_social_settings(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_update_social_settings(text, text, text, text, text) from public, anon, authenticated;

grant execute on function public.get_public_social_settings() to anon, authenticated;
grant execute on function public.admin_update_social_settings(text, text, text, text, text) to authenticated;
