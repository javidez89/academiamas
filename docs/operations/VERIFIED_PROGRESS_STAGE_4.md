# Etapa 4: agregados oficiales de aprendizaje

## Objetivo

Mi cuenta, Administración y Constancias deben mostrar la misma información académica verificable. El navegador conserva una caché para continuidad de uso, pero no decide avance oficial, tiempo, aprobación ni elegibilidad.

## Fuente oficial

- `private.learning_activity_sessions`: tiempo autenticado de lectura, práctica, simulacro y examen final.
- `private.verified_assessment_attempts` y `private.verified_assessment_answers`: respuestas, aciertos y resultados calculados por el servidor.
- `private.assessment_question_registry`: banco canónico y respuestas correctas no expuestas al navegador.
- `private.course_chapter_requirements`: duración, capítulos y objetivos derivados de `courses/*/course-data.js`.
- `public.course_enrollments`: matrícula, estado y fechas del curso.

## Reglas

- El avance de capítulo combina 40% de lectura verificada y 60% de cobertura de preguntas únicas.
- Repetir una pregunta no aumenta cobertura; se conserva el resultado verificado más reciente por pregunta.
- Sin examen final aprobado, el avance del curso no supera 95%.
- El 100%, la finalización y la constancia requieren examen final verificado y aprobado.
- El tiempo oficial se suma desde sesiones del servidor y descuenta inactividad mediante el protocolo de latidos existente.

## Consumidores

- `public.get_verified_learning_dashboard()` entrega al usuario autenticado únicamente su agregado.
- `private.admin_list_users()` consulta el mismo agregado para cada usuario y no usa el JSON heredado de `course_progress`.
- `certificate-service` vuelve a validar 100% y examen aprobado antes de crear el pago o emitir la constancia.
- La interfaz prefiere siempre registros con `verified: true`; la información local queda como compatibilidad visual cuando no existe sesión.

## Despliegue

1. Aplicar `20260827225551_authoritative_learning_aggregates.sql` en Supabase.
2. Desplegar `certificate-service` actualizado.
3. Publicar frontend y páginas SEO generadas de v0.20.0.
4. Ejecutar smoke de cuenta, administración, evaluación, certificado y rutas públicas contra producción.

La migración es aditiva. Un rollback del frontend o de la función no exige borrar tablas ni eventos verificados.

## Verificación local

```powershell
npm run check
npm run test:unit
npm run test:content
$env:ACADEMIAQA_URL='http://127.0.0.1:8080/'
npm run test:integration
npm run test:seo
npm run test:pwa
npm run test:auth
npm run test:cloud
npm run test:audio
npm run test:admin
npm run test:certificates
npm run test:home-advantages
npm run test:e2e
```
