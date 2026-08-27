insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-audio', 'course-audio', false, 5242880, array['audio/mpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.course_audio_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_date date not null default (timezone('utc', now()))::date,
  generations integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, request_date),
  constraint course_audio_usage_generations_check check (generations between 0 and 1000)
);

alter table public.course_audio_usage enable row level security;
revoke all on table public.course_audio_usage from anon, authenticated;

create or replace function public.consume_course_audio_generation(
  p_user_id uuid,
  p_daily_limit integer default 40
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generations integer;
begin
  if p_user_id is null or p_daily_limit < 1 or p_daily_limit > 1000 then
    raise exception 'Invalid audio usage request' using errcode = '22023';
  end if;

  insert into public.course_audio_usage (user_id, request_date, generations, updated_at)
  values (p_user_id, (timezone('utc', now()))::date, 1, now())
  on conflict (user_id, request_date) do update
    set generations = public.course_audio_usage.generations + 1,
        updated_at = now()
    where public.course_audio_usage.generations < p_daily_limit
  returning generations into v_generations;

  return v_generations is not null;
end;
$$;

revoke all on function public.consume_course_audio_generation(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_course_audio_generation(uuid, integer) to service_role;

create or replace function private.sync_course_activity(
  p_course_key text,
  p_practice_answers integer,
  p_study_seconds bigint
)
returns setof public.course_enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
  v_practice_answers integer := greatest(coalesce(p_practice_answers, 0), 0);
  v_study_seconds bigint := greatest(coalesce(p_study_seconds, 0), 0);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_practice_answers > 10000000 or v_study_seconds > 315360000 then
    raise exception 'Invalid activity metrics' using errcode = '22023';
  end if;

  return query
  update public.course_enrollments
    set practice_answers = v_practice_answers,
        study_seconds = greatest(study_seconds, v_study_seconds),
        last_activity_at = now(),
        updated_at = now()
  where user_id = v_user_id
    and course_key = v_course_key
    and status in ('active', 'completed')
  returning *;

  if not found then
    raise exception 'Active enrollment required' using errcode = '42501';
  end if;
end;
$$;
