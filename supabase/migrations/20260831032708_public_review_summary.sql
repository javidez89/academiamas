-- Extend the public review contract without changing stored reviews or moderation.
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
    select
      cr.id,
      cr.course_key,
      cr.rating,
      cr.comment,
      cr.created_at,
      coalesce(
        nullif(p.full_name, ''),
        nullif(u.raw_user_meta_data ->> 'full_name', ''),
        split_part(coalesce(u.email, ''), '@', 1),
        'Estudiante'
      ) as full_name,
      coalesce(
        nullif(p.avatar_url, ''),
        nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(u.raw_user_meta_data ->> 'picture', '')
      ) as avatar_url
    from private.course_reviews cr
    join auth.users u on u.id = cr.user_id
    left join public.profiles p on p.id = cr.user_id
    where cr.status = 'approved'
      and cr.deleted_at is null
      and (v_course_key is null or cr.course_key = v_course_key)
  ), page as (
    select * from approved order by created_at desc limit v_limit
  )
  select jsonb_build_object(
    'average_rating', coalesce((select round(avg(rating)::numeric, 1) from approved), 0),
    'total', (select count(*) from approved),
    'rating_distribution', jsonb_build_object(
      '5', (select count(*) from approved where rating = 5),
      '4', (select count(*) from approved where rating = 4),
      '3', (select count(*) from approved where rating = 3),
      '2', (select count(*) from approved where rating = 2),
      '1', (select count(*) from approved where rating = 1)
    ),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id,
      'course_key', course_key,
      'rating', rating,
      'comment', comment,
      'display_name', split_part(full_name, ' ', 1)
        || case when position(' ' in full_name) > 0 then ' ' || left(split_part(full_name, ' ', 2), 1) || '.' else '' end,
      'avatar_url', case when avatar_url ~* '^https://' then avatar_url else null end,
      'created_at', created_at
    ) order by created_at desc) from page), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function private.list_approved_course_reviews(text, integer) from public, anon, authenticated;
