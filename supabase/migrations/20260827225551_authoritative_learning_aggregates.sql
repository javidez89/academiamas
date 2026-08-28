create table private.course_chapter_requirements (
  course_key text not null,
  chapter_id integer not null,
  title text not null,
  suggested_minutes integer not null,
  objective_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (course_key, chapter_id),
  constraint course_chapter_requirements_course_key_check
    check (course_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint course_chapter_requirements_chapter_check
    check (chapter_id between 1 and 999),
  constraint course_chapter_requirements_title_check
    check (length(trim(title)) between 1 and 240),
  constraint course_chapter_requirements_values_check
    check (suggested_minutes between 1 and 10080 and objective_count between 0 and 1000)
);

alter table private.course_chapter_requirements enable row level security;
revoke all on table private.course_chapter_requirements from public, anon, authenticated;

-- BEGIN GENERATED COURSE CHAPTER REQUIREMENTS
-- 8 cursos y 58 capítulos derivados de courses/*/course-data.js.
insert into private.course_chapter_requirements (
  course_key, chapter_id, title, suggested_minutes, objective_count
) values
('ct-genai', 1, 'Introduccion a la IA generativa para las pruebas de software', 100, 6),
('ct-genai', 2, 'Ingenieria de prompts para las pruebas de software efectivas', 365, 10),
('ct-genai', 3, 'Gestion de riesgos de la IA generativa en las pruebas de software', 160, 9),
('ct-genai', 4, 'Infraestructura de pruebas impulsada por los LLM para las pruebas de software', 110, 5),
('ct-genai', 5, 'Despliegue e integracion de la IA generativa en las organizaciones de prueba', 80, 7),
('ctai', 1, 'Introducción a la Inteligencia Artificial', 120, 8),
('ctai', 2, 'Características de Calidad para Sistemas Basados en IA', 45, 3),
('ctai', 3, 'Aprendizaje Automático', 375, 8),
('ctai', 4, 'Pruebas de Sistemas Basados en IA', 195, 7),
('ctai', 5, 'Pruebas de Datos de Entrada para Sistemas de Aprendizaje Automático', 180, 6),
('ctai', 6, 'Pruebas de Modelos para Sistemas de Aprendizaje Automático', 225, 9),
('ctai', 7, 'Pruebas del Desarrollo y Despliegue de Aprendizaje Automático', 30, 2),
('ctfl', 1, 'Fundamentos de la Prueba', 180, 14),
('ctfl', 2, 'Pruebas a lo largo del Ciclo de Vida', 130, 10),
('ctfl', 3, 'Pruebas Estáticas', 80, 8),
('ctfl', 4, 'Análisis y Diseño de Pruebas', 390, 14),
('ctfl', 5, 'Gestión de las Actividades de Prueba', 335, 16),
('ctfl', 6, 'Herramientas de Prueba', 20, 2),
('cybersecurity-awareness', 1, 'Introduccion a la Ciberseguridad', 55, 4),
('cybersecurity-awareness', 2, 'Conceptos Basicos de Ciberseguridad', 65, 4),
('cybersecurity-awareness', 3, 'Principios de Ciberseguridad', 75, 4),
('cybersecurity-awareness', 4, 'Amenazas y Vulnerabilidades Comunes', 75, 4),
('cybersecurity-awareness', 5, 'Vulnerabilidades Comunes', 65, 4),
('cybersecurity-awareness', 6, 'Medidas de Proteccion y Mejores Practicas', 85, 4),
('cybersecurity-awareness', 7, 'Respuesta a Incidentes y Mejores Practicas', 75, 4),
('cybersecurity-awareness', 8, 'Politicas y Cumplimiento', 75, 4),
('cybersecurity-awareness', 9, 'Ciberseguridad en el entorno empresarial', 85, 4),
('project-management-essentials', 1, 'Introduccion a la Guia PM2', 60, 4),
('project-management-essentials', 2, 'Gestion de Proyectos', 75, 4),
('project-management-essentials', 3, 'Descripcion de la Metodologia PM2', 80, 4),
('project-management-essentials', 4, 'Roles y Organizacion del Proyecto', 85, 4),
('project-management-essentials', 5, 'Fase de Inicio', 70, 4),
('project-management-essentials', 6, 'Fase de Planificacion', 90, 4),
('project-management-essentials', 7, 'Fase de Ejecucion', 75, 4),
('project-management-essentials', 8, 'Fase de Cierre', 70, 4),
('project-management-essentials', 9, 'Seguimiento y Control', 95, 4),
('scrum-fundamentals', 1, 'Proposito de la Guia Scrum', 45, 4),
('scrum-fundamentals', 2, 'Definicion de Scrum', 55, 4),
('scrum-fundamentals', 3, 'Teoria de Scrum', 60, 4),
('scrum-fundamentals', 4, 'Valores de Scrum', 50, 4),
('scrum-fundamentals', 5, 'Scrum Team', 85, 4),
('scrum-fundamentals', 6, 'Eventos de Scrum', 95, 4),
('scrum-fundamentals', 7, 'Artefactos de Scrum', 90, 4),
('scrum-fundamentals', 8, 'Nota final y cambios Scrum 2020', 55, 4),
('scrum-master', 1, 'Propósito, definición y uso de Scrum', 70, 4),
('scrum-master', 2, 'Teoría empírica y valores Scrum', 80, 5),
('scrum-master', 3, 'Scrum Team y responsabilidades', 110, 6),
('scrum-master', 4, 'Eventos Scrum y Sprint', 120, 6),
('scrum-master', 5, 'Artefactos y compromisos', 100, 5),
('scrum-master', 6, 'Scrum Master, adopción y cierre de la guía', 80, 4),
('scrum-product-owner', 1, 'Rol, accountability y Scrum Framework', 90, 4),
('scrum-product-owner', 2, 'Vision, estrategia, Product Goal y roadmap', 95, 4),
('scrum-product-owner', 3, 'Descubrimiento de producto y entendimiento del cliente', 95, 4),
('scrum-product-owner', 4, 'Product Backlog, refinamiento e historias de usuario', 110, 4),
('scrum-product-owner', 5, 'Priorizacion, alcance y contratos agiles', 105, 4),
('scrum-product-owner', 6, 'Sprint, releases, MVP/MMP y calidad', 95, 4),
('scrum-product-owner', 7, 'Stakeholders, cambio y enfoques complementarios', 80, 4),
('scrum-product-owner', 8, 'Metricas, outcomes e IA para Product Owner', 100, 4)
on conflict (course_key, chapter_id) do update set
  title = excluded.title,
  suggested_minutes = excluded.suggested_minutes,
  objective_count = excluded.objective_count,
  updated_at = now();
-- END GENERATED COURSE CHAPTER REQUIREMENTS

create or replace function private.authoritative_learning_dashboard(p_user_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with enrollments as (
    select enrollment.*
    from public.course_enrollments as enrollment
    where enrollment.user_id = p_user_id
  ),
  question_requirements as (
    select
      registry.course_key,
      registry.chapter_id,
      count(*)::integer as question_count,
      count(distinct registry.learning_objective)::integer as registry_objective_count
    from private.assessment_question_registry as registry
    where registry.active
    group by registry.course_key, registry.chapter_id
  ),
  chapter_requirements as (
    select
      requirement.course_key,
      requirement.chapter_id,
      requirement.title,
      requirement.suggested_minutes,
      greatest(requirement.objective_count, coalesce(questions.registry_objective_count, 0))::integer as objective_count,
      coalesce(questions.question_count, 0)::integer as question_count
    from private.course_chapter_requirements as requirement
    join enrollments as enrollment on enrollment.course_key = requirement.course_key
    left join question_requirements as questions
      on questions.course_key = requirement.course_key
     and questions.chapter_id = requirement.chapter_id
  ),
  reading_activity as (
    select
      activity.course_key,
      activity.chapter_id,
      coalesce(sum(activity.duration_seconds), 0)::bigint as study_seconds,
      min(activity.started_at) as visited_at,
      max(activity.last_seen_at) as last_studied_at
    from private.learning_activity_sessions as activity
    where activity.user_id = p_user_id
      and activity.activity_type = 'reading'
      and activity.chapter_id is not null
    group by activity.course_key, activity.chapter_id
  ),
  course_activity as (
    select
      activity.course_key,
      coalesce(sum(activity.duration_seconds), 0)::bigint as study_seconds,
      count(*)::integer as session_count,
      min(activity.started_at) as verification_started_at,
      max(activity.last_seen_at) as last_activity_at
    from private.learning_activity_sessions as activity
    where activity.user_id = p_user_id
    group by activity.course_key
  ),
  latest_practice as (
    select distinct on (attempt.course_key, question.question_id)
      attempt.course_key,
      question.question_id,
      question.chapter_id,
      question.learning_objective,
      question.is_correct,
      question.answered_at
    from private.verified_assessment_attempts as attempt
    join private.verified_assessment_questions as question on question.attempt_id = attempt.id
    where attempt.user_id = p_user_id
      and attempt.activity_type = 'practice'
      and question.answered_at is not null
    order by attempt.course_key, question.question_id, question.answered_at desc, attempt.started_at desc
  ),
  practice_by_chapter as (
    select
      practice.course_key,
      practice.chapter_id,
      count(*)::integer as unique_answered,
      count(*) filter (where practice.is_correct)::integer as unique_correct,
      count(distinct practice.learning_objective)::integer as touched_objectives,
      max(practice.answered_at) as last_answered_at
    from latest_practice as practice
    group by practice.course_key, practice.chapter_id
  ),
  chapter_base as (
    select
      requirement.*,
      coalesce(reading.study_seconds, 0)::bigint as study_seconds,
      reading.visited_at,
      reading.last_studied_at,
      coalesce(practice.unique_answered, 0)::integer as unique_answered,
      coalesce(practice.unique_correct, 0)::integer as unique_correct,
      coalesce(practice.touched_objectives, 0)::integer as touched_objectives,
      practice.last_answered_at,
      least(100, round(
        100.0 * coalesce(reading.study_seconds, 0)
        / greatest(60, requirement.suggested_minutes * 60)
      ))::integer as reading_progress,
      case when requirement.question_count > 0 then least(100, round(
        100.0 * coalesce(practice.unique_answered, 0) / requirement.question_count
      ))::integer else 0 end as practice_coverage,
      case when requirement.question_count > 0 then least(100, round(
        100.0 * coalesce(practice.unique_correct, 0) / requirement.question_count
      ))::integer else 0 end as domain
    from chapter_requirements as requirement
    left join reading_activity as reading
      on reading.course_key = requirement.course_key
     and reading.chapter_id = requirement.chapter_id
    left join practice_by_chapter as practice
      on practice.course_key = requirement.course_key
     and practice.chapter_id = requirement.chapter_id
  ),
  chapter_metrics as (
    select
      chapter.*,
      least(100, round((chapter.reading_progress * 0.4) + (chapter.practice_coverage * 0.6)))::integer as coverage
    from chapter_base as chapter
  ),
  course_chapters as (
    select
      chapter.course_key,
      count(*)::integer as chapter_count,
      round(avg(chapter.coverage))::integer as chapter_average,
      case when sum(chapter.question_count) > 0 then round(
        sum(chapter.domain * chapter.question_count)::numeric / sum(chapter.question_count)
      )::integer else round(avg(chapter.domain))::integer end as chapter_domain_average,
      sum(chapter.question_count)::integer as question_count,
      sum(chapter.unique_answered)::integer as unique_answered,
      sum(chapter.unique_correct)::integer as unique_correct,
      jsonb_agg(jsonb_build_object(
        'chapter_id', chapter.chapter_id,
        'title', chapter.title,
        'suggested_minutes', chapter.suggested_minutes,
        'objective_count', chapter.objective_count,
        'question_count', chapter.question_count,
        'study_seconds', chapter.study_seconds,
        'study_minutes', round(chapter.study_seconds / 60.0),
        'unique_answered', chapter.unique_answered,
        'unique_correct', chapter.unique_correct,
        'touched_objectives', chapter.touched_objectives,
        'reading_progress', chapter.reading_progress,
        'practice_coverage', chapter.practice_coverage,
        'coverage', chapter.coverage,
        'domain', chapter.domain,
        'visited_at', chapter.visited_at,
        'last_studied_at', greatest(chapter.last_studied_at, chapter.last_answered_at)
      ) order by chapter.chapter_id) as chapters
    from chapter_metrics as chapter
    group by chapter.course_key
  ),
  assessment_metrics as (
    select
      attempt.course_key,
      count(*) filter (where attempt.activity_type = 'simulator' and attempt.status = 'completed')::integer as simulator_attempts,
      coalesce(max(attempt.score) filter (where attempt.activity_type = 'simulator' and attempt.status = 'completed'), 0)::numeric(5,2) as best_simulator_score,
      count(*) filter (where attempt.activity_type = 'final_exam' and attempt.status = 'completed')::integer as final_exam_attempts,
      coalesce(max(attempt.score) filter (where attempt.activity_type = 'final_exam' and attempt.status = 'completed'), 0)::numeric(5,2) as best_final_exam_score,
      coalesce(bool_or(attempt.passed) filter (where attempt.activity_type = 'final_exam' and attempt.status = 'completed'), false) as final_exam_passed,
      min(attempt.started_at) as verification_started_at,
      max(coalesce(attempt.completed_at, attempt.started_at)) as last_activity_at,
      max(attempt.completed_at) filter (where attempt.activity_type = 'final_exam' and attempt.status = 'completed' and attempt.passed) as final_exam_passed_at
    from private.verified_assessment_attempts as attempt
    where attempt.user_id = p_user_id
    group by attempt.course_key
  ),
  course_base as (
    select
      enrollment.course_key,
      enrollment.status as legacy_status,
      enrollment.started_at,
      enrollment.cancelled_at,
      enrollment.estimated_hours,
      enrollment.created_at,
      enrollment.updated_at,
      coalesce(chapters.chapter_count, 0)::integer as chapter_count,
      coalesce(chapters.chapter_average, 0)::integer as chapter_average,
      coalesce(chapters.chapter_domain_average, 0)::integer as chapter_domain_average,
      coalesce(chapters.question_count, 0)::integer as question_count,
      coalesce(chapters.unique_answered, 0)::integer as practice_answers,
      coalesce(chapters.unique_correct, 0)::integer as practice_correct,
      coalesce(chapters.chapters, '[]'::jsonb) as chapters,
      coalesce(activity.study_seconds, 0)::bigint as study_seconds,
      coalesce(activity.session_count, 0)::integer as session_count,
      coalesce(assessment.simulator_attempts, 0)::integer as simulator_attempts,
      coalesce(assessment.best_simulator_score, 0)::numeric(5,2) as best_simulator_score,
      coalesce(assessment.final_exam_attempts, 0)::integer as final_exam_attempts,
      coalesce(assessment.best_final_exam_score, 0)::numeric(5,2) as best_final_exam_score,
      coalesce(assessment.final_exam_passed, false) as final_exam_passed,
      assessment.final_exam_passed_at,
      least(activity.verification_started_at, assessment.verification_started_at) as verification_started_at,
      greatest(activity.last_activity_at, assessment.last_activity_at) as last_activity_at
    from enrollments as enrollment
    left join course_chapters as chapters on chapters.course_key = enrollment.course_key
    left join course_activity as activity on activity.course_key = enrollment.course_key
    left join assessment_metrics as assessment on assessment.course_key = enrollment.course_key
  ),
  course_metrics as (
    select
      course.*,
      case when course.final_exam_passed then 100
        else least(95, round(course.chapter_average * 0.95))::integer end as progress_percent,
      least(100, round(((course.chapter_domain_average * 95) + (course.best_final_exam_score * 5)) / 100.0))::integer as mastery_percent
    from course_base as course
  ),
  course_rows as (
    select jsonb_build_object(
      'course_key', course.course_key,
      'status', case when course.legacy_status = 'cancelled' then 'cancelled' when course.final_exam_passed then 'completed' else 'active' end,
      'legacy_status', course.legacy_status,
      'started_at', course.started_at,
      'cancelled_at', course.cancelled_at,
      'last_activity_at', course.last_activity_at,
      'estimated_hours', course.estimated_hours,
      'study_seconds', course.study_seconds,
      'verified_study_seconds', course.study_seconds,
      'session_count', course.session_count,
      'simulator_attempts', course.simulator_attempts,
      'practice_answers', course.practice_answers,
      'practice_correct', course.practice_correct,
      'best_simulator_score', round(course.best_simulator_score),
      'final_exam_attempts', course.final_exam_attempts,
      'best_final_exam_score', round(course.best_final_exam_score),
      'final_exam_passed', course.final_exam_passed,
      'final_exam_passed_at', course.final_exam_passed_at,
      'completed_at', course.final_exam_passed_at,
      'verification_started_at', course.verification_started_at,
      'chapter_count', course.chapter_count,
      'chapter_average', course.chapter_average,
      'chapter_domain_average', course.chapter_domain_average,
      'question_count', course.question_count,
      'progress_percent', course.progress_percent,
      'mastery_percent', course.mastery_percent,
      'final_exam_eligible', course.final_exam_passed or course.progress_percent >= 95,
      'verified', true,
      'chapters', course.chapters
    ) as value,
    course.*
    from course_metrics as course
  )
  select jsonb_build_object(
    'verified', true,
    'generated_at', now(),
    'courses', coalesce((select jsonb_agg(row.value order by row.started_at desc) from course_rows as row), '[]'::jsonb),
    'summary', jsonb_build_object(
      'enrolled_courses', (select count(*) from course_rows where legacy_status <> 'cancelled'),
      'completed_courses', (select count(*) from course_rows where legacy_status <> 'cancelled' and final_exam_passed),
      'progress_percent', coalesce((select round(avg(progress_percent)) from course_rows where legacy_status <> 'cancelled'), 0),
      'mastery_percent', coalesce((select round(avg(mastery_percent)) from course_rows where legacy_status <> 'cancelled'), 0),
      'study_seconds', coalesce((select sum(study_seconds) from course_rows where legacy_status <> 'cancelled'), 0),
      'simulator_attempts', coalesce((select sum(simulator_attempts) from course_rows where legacy_status <> 'cancelled'), 0),
      'final_exam_attempts', coalesce((select sum(final_exam_attempts) from course_rows where legacy_status <> 'cancelled'), 0)
    )
  );
$$;

create or replace function private.get_verified_learning_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  return private.authoritative_learning_dashboard(v_user_id);
end;
$$;

create or replace function public.get_verified_learning_dashboard()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select private.get_verified_learning_dashboard();
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
    'online_users', (select count(*) from public.profiles where last_seen_at >= now() - interval '2 minutes 30 seconds'),
    'active_users_30d', (
      select count(*) from auth.users as users
      left join public.profiles as profiles on profiles.id = users.id
      where coalesce(profiles.last_seen_at, users.last_sign_in_at, users.created_at) >= now() - interval '30 days'
    ),
    'new_users_30d', (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'enrolled_users', (select count(distinct user_id) from public.course_enrollments where status <> 'cancelled'),
    'total_enrollments', (select count(*) from public.course_enrollments),
    'active_enrollments', (
      select count(*) from public.course_enrollments as enrollment
      where enrollment.status <> 'cancelled'
        and not exists (
          select 1 from private.verified_assessment_attempts as attempt
          where attempt.user_id = enrollment.user_id
            and attempt.course_key = enrollment.course_key
            and attempt.activity_type = 'final_exam'
            and attempt.status = 'completed'
            and attempt.passed
        )
    ),
    'completed_enrollments', (
      select count(*) from public.course_enrollments as enrollment
      where enrollment.status <> 'cancelled'
        and exists (
          select 1 from private.verified_assessment_attempts as attempt
          where attempt.user_id = enrollment.user_id
            and attempt.course_key = enrollment.course_key
            and attempt.activity_type = 'final_exam'
            and attempt.status = 'completed'
            and attempt.passed
        )
    ),
    'cancelled_enrollments', (select count(*) from public.course_enrollments where status = 'cancelled'),
    'study_seconds', (select coalesce(sum(duration_seconds), 0) from private.learning_activity_sessions),
    'simulator_attempts', (
      select count(*) from private.verified_assessment_attempts where activity_type = 'simulator' and status = 'completed'
    ),
    'final_exam_attempts', (
      select count(*) from private.verified_assessment_attempts where activity_type = 'final_exam' and status = 'completed'
    ),
    'issued_certificates', (select count(*) from public.certificates where status = 'VALID'),
    'certificate_revenue_cop', (
      select coalesce(sum(amount_in_cents), 0) / 100 from public.certificate_orders where status = 'APPROVED'
    ),
    'verified', true
  ) into v_result;
  return v_result;
end;
$$;

create or replace function private.admin_list_users(
  p_search text default '',
  p_limit integer default 50,
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
  v_limit integer := least(100, greatest(1, coalesce(p_limit, 50)));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
  v_result jsonb;
begin
  perform private.require_platform_admin();
  with matching_users as (
    select
      users.id,
      users.email,
      coalesce(nullif(profiles.full_name, ''), nullif(users.raw_user_meta_data ->> 'full_name', ''),
        nullif(users.raw_user_meta_data ->> 'name', ''), split_part(coalesce(users.email, ''), '@', 1), 'Usuario') as full_name,
      coalesce(nullif(profiles.avatar_url, ''), nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
        nullif(users.raw_user_meta_data ->> 'picture', '')) as avatar_url,
      users.created_at,
      users.last_sign_in_at,
      profiles.last_seen_at
    from auth.users as users
    left join public.profiles as profiles on profiles.id = users.id
    where v_search = ''
      or coalesce(users.email, '') ilike '%' || v_search || '%'
      or coalesce(profiles.full_name, '') ilike '%' || v_search || '%'
      or coalesce(users.raw_user_meta_data ->> 'full_name', '') ilike '%' || v_search || '%'
      or coalesce(users.raw_user_meta_data ->> 'name', '') ilike '%' || v_search || '%'
  ),
  page_users as (
    select * from matching_users
    order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc
    limit v_limit offset v_offset
  ),
  user_rows as (
    select page_users.*, private.authoritative_learning_dashboard(page_users.id) as dashboard
    from page_users
  )
  select jsonb_build_object(
    'total', (select count(*) from matching_users),
    'limit', v_limit,
    'offset', v_offset,
    'verified', true,
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'email', email,
        'full_name', full_name,
        'avatar_url', avatar_url,
        'created_at', created_at,
        'last_sign_in_at', last_sign_in_at,
        'last_seen_at', last_seen_at,
        'enrollments', dashboard -> 'courses',
        'learning_summary', dashboard -> 'summary'
      ) order by coalesce(last_seen_at, last_sign_in_at, created_at) desc, created_at desc)
      from user_rows
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function private.delete_cancelled_course(p_course_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_course_key text := lower(trim(coalesce(p_course_key, '')));
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if v_course_key !~ '^[a-z0-9][a-z0-9-]{0,79}$' then raise exception 'Invalid course key' using errcode = '22023'; end if;
  perform 1 from public.course_enrollments
  where user_id = v_user_id and course_key = v_course_key and status = 'cancelled' for update;
  if not found then raise exception 'Cancelled enrollment required' using errcode = '55000'; end if;

  delete from public.course_final_exam_attempts where user_id = v_user_id and course_key = v_course_key;
  delete from private.verified_assessment_attempts where user_id = v_user_id and course_key = v_course_key;
  delete from private.learning_activity_sessions where user_id = v_user_id and course_key = v_course_key;
  delete from public.course_progress where user_id = v_user_id and course_key = v_course_key;
  delete from public.course_enrollments where user_id = v_user_id and course_key = v_course_key and status = 'cancelled';
  return true;
end;
$$;

revoke all on function private.authoritative_learning_dashboard(uuid) from public, anon, authenticated;
revoke all on function private.get_verified_learning_dashboard() from public, anon, authenticated;
revoke all on function public.get_verified_learning_dashboard() from public, anon, authenticated;
grant execute on function private.get_verified_learning_dashboard() to authenticated;
grant execute on function public.get_verified_learning_dashboard() to authenticated;

comment on table private.course_chapter_requirements is
  'Server-owned chapter durations and titles used to calculate authoritative learning progress.';
comment on function public.get_verified_learning_dashboard() is
  'Returns only server-verified study time, unique practice coverage and assessment results for the authenticated user.';
