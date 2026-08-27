create table if not exists public.certificate_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  reference text not null unique check (reference ~ '^ACQA-CERT-[A-Z0-9-]{8,64}$'),
  price_usd numeric(8,2) not null default 25.00 check (price_usd > 0 and price_usd <= 10000),
  trm_cop_per_usd numeric(12,4) not null check (trm_cop_per_usd > 0),
  amount_in_cents bigint not null check (amount_in_cents > 0),
  currency text not null default 'COP' check (currency = 'COP'),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'EXPIRED')),
  wompi_transaction_id text unique,
  wompi_payment_method_type text,
  wompi_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_at timestamptz,
  consumed_at timestamptz
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  certificate_code text not null unique check (certificate_code ~ '^ACQA-[A-Z0-9]{12}$'),
  full_name text not null check (char_length(full_name) between 3 and 120),
  document_type text not null check (document_type in ('CC', 'CE', 'NIT', 'PP', 'TI', 'DNI', 'RG', 'OTHER')),
  document_last4 text not null check (char_length(document_last4) between 2 and 4),
  course_name text not null check (char_length(course_name) between 3 and 180),
  estimated_hours numeric(8,2) not null check (estimated_hours > 0 and estimated_hours <= 500),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  issued_at timestamptz not null default now(),
  status text not null default 'VALID' check (status in ('VALID', 'REVOKED')),
  pdf_path text not null unique,
  payment_order_id uuid not null unique references public.certificate_orders(id) on delete restrict,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now(),
  unique (user_id, course_key)
);

create index if not exists certificate_orders_user_created_idx
  on public.certificate_orders (user_id, created_at desc);
create index if not exists certificate_orders_reference_status_idx
  on public.certificate_orders (reference, status);
create index if not exists certificate_orders_course_status_idx
  on public.certificate_orders (user_id, course_key, status, created_at desc);
create unique index if not exists certificate_orders_one_open_order_idx
  on public.certificate_orders (user_id, course_key)
  where status in ('PENDING', 'APPROVED') and consumed_at is null;
create index if not exists certificates_user_issued_idx
  on public.certificates (user_id, issued_at desc);
create index if not exists certificates_course_issued_idx
  on public.certificates (course_key, issued_at desc);

alter table public.certificate_orders enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Users read own certificate orders" on public.certificate_orders;
create policy "Users read own certificate orders"
  on public.certificate_orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users read own certificates" on public.certificates;
create policy "Users read own certificates"
  on public.certificates
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.certificate_orders from public, anon, authenticated;
revoke all on table public.certificates from public, anon, authenticated;
grant select on table public.certificate_orders to authenticated;
grant select on table public.certificates to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificates', 'certificates', false, 15728640, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.validate_certificate(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_result jsonb;
begin
  if v_code !~ '^ACQA-[A-Z0-9]{12}$' then
    return jsonb_build_object('valid', false, 'code', v_code);
  end if;

  select jsonb_build_object(
    'valid', certificate.status = 'VALID',
    'code', certificate.certificate_code,
    'status', certificate.status,
    'full_name', certificate.full_name,
    'document', certificate.document_type || ' ••••' || certificate.document_last4,
    'course_key', certificate.course_key,
    'course_name', certificate.course_name,
    'estimated_hours', certificate.estimated_hours,
    'started_at', certificate.started_at,
    'completed_at', certificate.completed_at,
    'issued_at', certificate.issued_at
  )
  into v_result
  from public.certificates as certificate
  where certificate.certificate_code = v_code
    and certificate.status = 'VALID';

  return coalesce(v_result, jsonb_build_object('valid', false, 'code', v_code));
end;
$$;

create or replace function public.validate_certificate(p_code text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.validate_certificate(p_code);
$$;

create or replace function private.admin_list_certificates(
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
  v_search text := left(trim(coalesce(p_search, '')), 120);
  v_limit integer := least(200, greatest(1, coalesce(p_limit, 100)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();

  with matching as (
    select
      certificate.id,
      certificate.user_id,
      certificate.certificate_code,
      certificate.full_name,
      users.email,
      certificate.document_type || ' ••••' || certificate.document_last4 as document,
      certificate.course_key,
      certificate.course_name,
      certificate.estimated_hours,
      certificate.started_at,
      certificate.completed_at,
      certificate.issued_at,
      certificate.status,
      certificate.revoked_at
    from public.certificates as certificate
    join auth.users as users on users.id = certificate.user_id
    where v_search = ''
      or certificate.certificate_code ilike '%' || v_search || '%'
      or certificate.full_name ilike '%' || v_search || '%'
      or certificate.course_name ilike '%' || v_search || '%'
      or coalesce(users.email, '') ilike '%' || v_search || '%'
  ),
  page_rows as (
    select *
    from matching
    order by issued_at desc
    limit v_limit offset v_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from matching),
    'limit', v_limit,
    'offset', v_offset,
    'certificates', coalesce((select jsonb_agg(to_jsonb(page_rows) order by issued_at desc) from page_rows), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.admin_list_certificates(
  p_search text default '',
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.admin_list_certificates(p_search, p_limit, p_offset);
$$;

create or replace function private.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  perform private.require_platform_admin();

  select jsonb_build_object(
    'registered_users', (select count(*) from auth.users),
    'online_users', (
      select count(*)
      from public.profiles
      where last_seen_at >= now() - interval '2 minutes 30 seconds'
    ),
    'active_users_30d', (
      select count(*)
      from auth.users as users
      left join public.profiles as profiles on profiles.id = users.id
      where coalesce(profiles.last_seen_at, users.last_sign_in_at, users.created_at) >= now() - interval '30 days'
    ),
    'new_users_30d', (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'enrolled_users', (select count(distinct user_id) from public.course_enrollments where status <> 'cancelled'),
    'total_enrollments', (select count(*) from public.course_enrollments),
    'active_enrollments', (select count(*) from public.course_enrollments where status = 'active'),
    'completed_enrollments', (select count(*) from public.course_enrollments where status = 'completed'),
    'cancelled_enrollments', (select count(*) from public.course_enrollments where status = 'cancelled'),
    'study_seconds', (select coalesce(sum(study_seconds), 0) from public.course_enrollments),
    'simulator_attempts', (select coalesce(sum(simulator_attempts), 0) from public.course_enrollments),
    'final_exam_attempts', (select coalesce(sum(final_exam_attempts), 0) from public.course_enrollments),
    'issued_certificates', (select count(*) from public.certificates where status = 'VALID'),
    'certificate_revenue_cop', (
      select coalesce(sum(amount_in_cents), 0) / 100
      from public.certificate_orders
      where status = 'APPROVED'
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function private.validate_certificate(text) from public, anon, authenticated;
revoke all on function public.validate_certificate(text) from public, anon, authenticated;
revoke all on function private.admin_list_certificates(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_list_certificates(text, integer, integer) from public, anon, authenticated;

grant execute on function private.validate_certificate(text) to anon, authenticated;
grant execute on function public.validate_certificate(text) to anon, authenticated;
grant execute on function private.admin_list_certificates(text, integer, integer) to authenticated;
grant execute on function public.admin_list_certificates(text, integer, integer) to authenticated;
