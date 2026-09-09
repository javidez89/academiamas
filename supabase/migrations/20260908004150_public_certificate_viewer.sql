alter table public.certificates
  alter column document_type drop not null,
  alter column document_last4 drop not null,
  add column public_pdf boolean not null default false;

comment on column public.certificates.public_pdf is 'Public PDF consent for name-only certificates; legacy PDFs remain private.';

create or replace function public.validate_certificate(p_code text)
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
    'valid', true,
    'code', certificate.certificate_code,
    'status', certificate.status,
    'full_name', certificate.full_name,
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

revoke all on function public.validate_certificate(text) from public, anon, authenticated;
grant execute on function public.validate_certificate(text) to anon, authenticated;
