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
      certificate.revoked_at,
      certificate.archived_at,
      certificate.public_pdf
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
    'certificates', coalesce(
      (select jsonb_agg(to_jsonb(page_rows) order by issued_at desc) from page_rows),
      '[]'::jsonb
    )
  ) into v_result;

  return v_result;
end;
$$;
