create table if not exists private.course_audio_monthly_usage (
  usage_month date primary key,
  reserved_characters integer not null default 0,
  completed_characters integer not null default 0,
  limit_characters integer not null default 500000,
  updated_at timestamptz not null default now(),
  constraint course_audio_monthly_usage_reserved_check check (reserved_characters between 0 and 500000),
  constraint course_audio_monthly_usage_completed_check check (completed_characters between 0 and reserved_characters),
  constraint course_audio_monthly_usage_limit_check check (limit_characters between 1 and 500000)
);

create table if not exists private.course_audio_generations (
  audio_hash text primary key,
  provider text not null,
  voice text not null,
  course_key text not null,
  content_id text not null,
  character_count integer not null,
  usage_month date not null references private.course_audio_monthly_usage(usage_month),
  status text not null default 'pending',
  object_path text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_audio_generations_hash_check check (audio_hash ~ '^[a-f0-9]{64}$'),
  constraint course_audio_generations_character_count_check check (character_count between 20 and 4096),
  constraint course_audio_generations_status_check check (status in ('pending', 'ready', 'failed'))
);

alter table private.course_audio_monthly_usage enable row level security;
alter table private.course_audio_generations enable row level security;
revoke all on table private.course_audio_monthly_usage from public, anon, authenticated;
revoke all on table private.course_audio_generations from public, anon, authenticated;

create or replace function public.reserve_course_audio_generation(
  p_audio_hash text,
  p_provider text,
  p_voice text,
  p_course_key text,
  p_content_id text,
  p_character_count integer,
  p_monthly_limit integer default 500000
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_limit integer := least(greatest(coalesce(p_monthly_limit, 500000), 1), 500000);
  v_usage private.course_audio_monthly_usage%rowtype;
  v_generation private.course_audio_generations%rowtype;
begin
  if coalesce(p_audio_hash, '') !~ '^[a-f0-9]{64}$'
    or length(trim(coalesce(p_provider, ''))) < 2
    or length(trim(coalesce(p_voice, ''))) < 2
    or length(trim(coalesce(p_course_key, ''))) < 2
    or length(trim(coalesce(p_content_id, ''))) < 2
    or coalesce(p_character_count, 0) not between 20 and 4096 then
    raise exception 'Invalid course audio reservation' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('qavance-course-audio:' || p_audio_hash, 0));

  select * into v_generation
  from private.course_audio_generations
  where audio_hash = p_audio_hash;

  if found and v_generation.status = 'ready' then
    return jsonb_build_object('status', 'ready', 'usageMonth', v_generation.usage_month, 'remainingCharacters', 0);
  end if;

  if found and v_generation.usage_month = v_month then
    return jsonb_build_object(
      'status', v_generation.status,
      'usageMonth', v_generation.usage_month,
      'remainingCharacters', greatest(0, v_limit - (
        select reserved_characters from private.course_audio_monthly_usage where usage_month = v_month
      ))
    );
  end if;

  insert into private.course_audio_monthly_usage (usage_month, reserved_characters, completed_characters, limit_characters, updated_at)
  values (v_month, 0, 0, v_limit, now())
  on conflict (usage_month) do update
    set limit_characters = least(private.course_audio_monthly_usage.limit_characters, excluded.limit_characters),
        updated_at = now();

  select * into v_usage
  from private.course_audio_monthly_usage
  where usage_month = v_month
  for update;

  if v_usage.reserved_characters + p_character_count > least(v_usage.limit_characters, v_limit) then
    return jsonb_build_object(
      'status', 'limit',
      'usageMonth', v_month,
      'remainingCharacters', greatest(0, least(v_usage.limit_characters, v_limit) - v_usage.reserved_characters)
    );
  end if;

  update private.course_audio_monthly_usage
  set reserved_characters = reserved_characters + p_character_count,
      updated_at = now()
  where usage_month = v_month;

  insert into private.course_audio_generations (
    audio_hash,
    provider,
    voice,
    course_key,
    content_id,
    character_count,
    usage_month,
    status,
    object_path,
    last_error,
    created_at,
    updated_at
  ) values (
    p_audio_hash,
    trim(p_provider),
    trim(p_voice),
    lower(trim(p_course_key)),
    lower(trim(p_content_id)),
    p_character_count,
    v_month,
    'pending',
    null,
    null,
    now(),
    now()
  )
  on conflict (audio_hash) do update
    set provider = excluded.provider,
        voice = excluded.voice,
        course_key = excluded.course_key,
        content_id = excluded.content_id,
        character_count = excluded.character_count,
        usage_month = excluded.usage_month,
        status = 'pending',
        object_path = null,
        last_error = null,
        updated_at = now();

  return jsonb_build_object(
    'status', 'reserved',
    'usageMonth', v_month,
    'remainingCharacters', greatest(0, least(v_usage.limit_characters, v_limit) - v_usage.reserved_characters - p_character_count)
  );
end;
$$;

create or replace function public.complete_course_audio_generation(
  p_audio_hash text,
  p_object_path text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_generation private.course_audio_generations%rowtype;
begin
  update private.course_audio_generations
  set status = 'ready',
      object_path = trim(p_object_path),
      last_error = null,
      updated_at = now()
  where audio_hash = p_audio_hash
    and status = 'pending'
  returning * into v_generation;

  if not found then
    raise exception 'Pending course audio generation not found' using errcode = 'P0002';
  end if;

  update private.course_audio_monthly_usage
  set completed_characters = least(reserved_characters, completed_characters + v_generation.character_count),
      updated_at = now()
  where usage_month = v_generation.usage_month;
end;
$$;

create or replace function public.fail_course_audio_generation(
  p_audio_hash text,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.course_audio_generations
  set status = 'failed',
      last_error = left(trim(coalesce(p_error, 'Unknown provider error')), 500),
      updated_at = now()
  where audio_hash = p_audio_hash
    and status = 'pending';
end;
$$;

revoke all on function public.reserve_course_audio_generation(text, text, text, text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.complete_course_audio_generation(text, text) from public, anon, authenticated;
revoke all on function public.fail_course_audio_generation(text, text) from public, anon, authenticated;
grant execute on function public.reserve_course_audio_generation(text, text, text, text, text, integer, integer) to service_role;
grant execute on function public.complete_course_audio_generation(text, text) to service_role;
grant execute on function public.fail_course_audio_generation(text, text) to service_role;

comment on table private.course_audio_monthly_usage is 'Hard monthly character budget for cached course narration. The limit never exceeds Azure Speech F0.';
comment on table private.course_audio_generations is 'Administrative generation registry. Students can only consume completed files from private Storage.';
