revoke all on function public.validate_certificate(text) from public, anon, authenticated;
revoke all on function private.validate_certificate(text) from public, anon, authenticated;

drop function if exists public.validate_certificate(text);
drop function if exists private.validate_certificate(text);
