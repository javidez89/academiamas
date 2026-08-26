create schema if not exists private;

create table if not exists private.certificate_course_modules (
  course_key text not null check (course_key ~ '^[a-z0-9-]{2,80}$'),
  module_order smallint not null check (module_order between 1 and 99),
  title text not null check (char_length(btrim(title)) between 3 and 240),
  primary key (course_key, module_order)
);

revoke all on table private.certificate_course_modules from public, anon, authenticated;

insert into private.certificate_course_modules (course_key, module_order, title)
values
  ('ct-genai', 1, 'Introducción a la IA generativa para las pruebas de software'),
  ('ct-genai', 2, 'Ingeniería de prompts para las pruebas de software efectivas'),
  ('ct-genai', 3, 'Gestión de riesgos de la IA generativa en las pruebas de software'),
  ('ct-genai', 4, 'Infraestructura de pruebas impulsada por los LLM para las pruebas de software'),
  ('ct-genai', 5, 'Despliegue e integración de la IA generativa en las organizaciones de prueba'),
  ('ctai', 1, 'Introducción a la Inteligencia Artificial'),
  ('ctai', 2, 'Características de Calidad para Sistemas Basados en IA'),
  ('ctai', 3, 'Aprendizaje Automático'),
  ('ctai', 4, 'Pruebas de Sistemas Basados en IA'),
  ('ctai', 5, 'Pruebas de Datos de Entrada para Sistemas de Aprendizaje Automático'),
  ('ctai', 6, 'Pruebas de Modelos para Sistemas de Aprendizaje Automático'),
  ('ctai', 7, 'Pruebas del Desarrollo y Despliegue de Aprendizaje Automático'),
  ('ctfl', 1, 'Fundamentos de la Prueba'),
  ('ctfl', 2, 'Pruebas a lo largo del Ciclo de Vida'),
  ('ctfl', 3, 'Pruebas Estáticas'),
  ('ctfl', 4, 'Análisis y Diseño de Pruebas'),
  ('ctfl', 5, 'Gestión de las Actividades de Prueba'),
  ('ctfl', 6, 'Herramientas de Prueba'),
  ('cybersecurity-awareness', 1, 'Introducción a la Ciberseguridad'),
  ('cybersecurity-awareness', 2, 'Conceptos Básicos de Ciberseguridad'),
  ('cybersecurity-awareness', 3, 'Principios de Ciberseguridad'),
  ('cybersecurity-awareness', 4, 'Amenazas y Vulnerabilidades Comunes'),
  ('cybersecurity-awareness', 5, 'Vulnerabilidades Comunes'),
  ('cybersecurity-awareness', 6, 'Medidas de Protección y Mejores Prácticas'),
  ('cybersecurity-awareness', 7, 'Respuesta a Incidentes y Mejores Prácticas'),
  ('cybersecurity-awareness', 8, 'Políticas y Cumplimiento'),
  ('cybersecurity-awareness', 9, 'Ciberseguridad en el entorno empresarial'),
  ('project-management-essentials', 1, 'Introducción a la Guía PM2'),
  ('project-management-essentials', 2, 'Gestión de Proyectos'),
  ('project-management-essentials', 3, 'Descripción de la Metodología PM2'),
  ('project-management-essentials', 4, 'Roles y Organización del Proyecto'),
  ('project-management-essentials', 5, 'Fase de Inicio'),
  ('project-management-essentials', 6, 'Fase de Planificación'),
  ('project-management-essentials', 7, 'Fase de Ejecución'),
  ('project-management-essentials', 8, 'Fase de Cierre'),
  ('project-management-essentials', 9, 'Seguimiento y Control'),
  ('scrum-fundamentals', 1, 'Propósito de la Guía Scrum'),
  ('scrum-fundamentals', 2, 'Definición de Scrum'),
  ('scrum-fundamentals', 3, 'Teoría de Scrum'),
  ('scrum-fundamentals', 4, 'Valores de Scrum'),
  ('scrum-fundamentals', 5, 'Scrum Team'),
  ('scrum-fundamentals', 6, 'Eventos de Scrum'),
  ('scrum-fundamentals', 7, 'Artefactos de Scrum'),
  ('scrum-fundamentals', 8, 'Nota final y cambios Scrum 2020'),
  ('scrum-master', 1, 'Propósito, definición y uso de Scrum'),
  ('scrum-master', 2, 'Teoría empírica y valores Scrum'),
  ('scrum-master', 3, 'Scrum Team y responsabilidades'),
  ('scrum-master', 4, 'Eventos Scrum y Sprint'),
  ('scrum-master', 5, 'Artefactos y compromisos'),
  ('scrum-master', 6, 'Scrum Master, adopción y cierre de la guía'),
  ('scrum-product-owner', 1, 'Rol, accountability y Scrum Framework'),
  ('scrum-product-owner', 2, 'Visión, estrategia, Product Goal y roadmap'),
  ('scrum-product-owner', 3, 'Descubrimiento de producto y entendimiento del cliente'),
  ('scrum-product-owner', 4, 'Product Backlog, refinamiento e historias de usuario'),
  ('scrum-product-owner', 5, 'Priorización, alcance y contratos ágiles'),
  ('scrum-product-owner', 6, 'Sprint, releases, MVP/MMP y calidad'),
  ('scrum-product-owner', 7, 'Stakeholders, cambio y enfoques complementarios'),
  ('scrum-product-owner', 8, 'Métricas, outcomes e IA para Product Owner')
on conflict (course_key, module_order)
do update set title = excluded.title;

create or replace function public.get_certificate_course_modules(p_course_key text)
returns table (module_order smallint, title text)
language sql
stable
security definer
set search_path = ''
as $$
  select modules.module_order, modules.title
  from private.certificate_course_modules as modules
  where modules.course_key = lower(btrim(p_course_key))
  order by modules.module_order;
$$;

revoke all on function public.get_certificate_course_modules(text) from public, anon, authenticated;
grant execute on function public.get_certificate_course_modules(text) to service_role;

comment on table private.certificate_course_modules is
  'Temario aprobado usado exclusivamente para generar el anexo de constancias.';
comment on function public.get_certificate_course_modules(text) is
  'Devuelve el temario ordenado para el servicio privado de emisión de constancias.';
