# Etapa 2: sesiones y tiempo verificados

Fecha de cierre local: 27 de agosto de 2026.

## Alcance

Esta etapa reemplaza la autoridad del tiempo enviado por el navegador con sesiones autenticadas cuyo tiempo se calcula usando el reloj de PostgreSQL. Cubre lectura por capítulo, práctica, simulacro y examen final. No cambia el cálculo visual de avance, las preguntas, los resultados de exámenes ni la emisión de constancias.

## Modelo implementado

- `private.learning_activity_sessions` conserva historial por `session_id` en lugar de sobrescribir una sola fila por usuario.
- Solo puede existir una sesión abierta por usuario.
- Cada sesión registra curso, tipo de actividad, capítulo cuando aplica, duración calculada y número de latidos.
- `course_enrollments.verified_study_seconds` acumula únicamente segundos aceptados por funciones del servidor.
- `study_verification_started_at` identifica desde qué momento la métrica cumple el modelo verificable.
- `get_verified_study_time()` entrega al usuario sus totales por curso, capítulo y actividad.

## Reglas de integridad

- El navegador no puede incrementar `study_seconds` ni `verified_study_seconds` mediante `sync_course_activity()`.
- Cada latido contabiliza como máximo 45 segundos.
- Si transcurren más de 90 segundos entre latidos, ese intervalo cuenta como inactividad y suma cero.
- El frontend no envía latidos cuando la pestaña está oculta o supera dos minutos sin interacción.
- Una matrícula cancelada invalida la sesión pendiente y no acumula más tiempo.
- Cambiar de actividad cierra la sesión anterior y acredita únicamente el intervalo válido pendiente.
- Las sesiones requieren usuario autenticado y matrícula activa o completada.

## Compatibilidad

- Se conserva el RPC anterior de dos argumentos para clientes desplegados durante una actualización gradual.
- El nuevo RPC recibe `p_chapter_id`; las sesiones de lectura exigen un capítulo válido.
- El tiempo local permanece temporalmente en `course_progress` como caché de interfaz. Mi cuenta, administración y constancias migrarán al agregado verificado en una etapa posterior.

## Pruebas ejecutadas

- Sintaxis de 52 archivos JavaScript.
- Auditoría de las 21 migraciones ya aplicadas en producción.
- Prueba unitaria de invariantes del tiempo verificado.
- Persistencia, selección aleatoria, manifiesto de audio y aislamiento por curso.
- Auditoría de contenido y realismo de simuladores.
- Catálogo completo de 8 cursos.
- Flujo Playwright de matrícula, lectura, capítulo, práctica, simulacro, examen final y cuenta.
- Smoke funcional general.

Todas las pruebas ejecutadas finalizaron correctamente.

## Límite de validación

La migración no se aplicó a producción. Este equipo no tiene PostgreSQL ni Docker local, por lo que la ejecución SQL real debe validarse en una rama de Supabase o en una base de staging antes de aprobar producción. Ningún dato remoto fue modificado durante esta etapa.

## Siguiente etapa propuesta

La Etapa 3 registrará respuestas e intentos como eventos del servidor y recalculará allí puntuaciones, cobertura única y aprobación. No debe iniciarse hasta aprobar esta etapa.
