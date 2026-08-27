# Etapa 3: respuestas y resultados verificables

Fecha de cierre local: 27 de agosto de 2026.

## Alcance

Esta etapa elimina la autoridad del navegador sobre la cobertura de práctica, los intentos, los puntajes y la aprobación. Las respuestas se registran individualmente y PostgreSQL calcula el resultado usando un banco canónico privado. No cambia preguntas, textos académicos, selección aleatoria ni diseño visible.

## Modelo implementado

- `private.assessment_question_registry` conserva respuestas, puntos, capítulo, nivel K y revisión del banco.
- `private.assessment_blueprints` conserva cantidad, puntos, tiempo, aprobación y matriz de cada curso.
- `private.verified_assessment_attempts` vincula cada práctica, simulacro o examen con una sesión académica autenticada.
- `private.verified_assessment_questions` guarda la selección inmutable y las respuestas del usuario.
- `course_final_exam_attempts.verified` distingue resultados históricos de resultados calculados bajo este modelo.
- `assessment_attempt_id` permite auditar el intento que produjo cada resultado final nuevo.

## Reglas de integridad

- El intento exige usuario autenticado, matrícula válida y sesión abierta del mismo usuario y curso.
- Las preguntas desconocidas, inactivas, repetidas o ajenas al capítulo son rechazadas.
- Simulacro y examen final deben respetar cantidad, puntos y matriz por capítulo y nivel K.
- El navegador envía índices seleccionados, nunca puntajes, aciertos ni estados de aprobación.
- La respuesta se compara contra una copia canónica privada y normalizada.
- La práctica cuenta identificadores únicos; responder de nuevo la misma pregunta no aumenta cobertura.
- El puntaje, aprobación, duración e indicadores de matrícula se calculan en PostgreSQL.
- Las RPC heredadas que aceptaban resultados del cliente quedan revocadas y fueron retiradas de `AcademyCloud`.
- `sync_course_activity()` conserva compatibilidad de firma, pero ya no modifica tiempo ni cobertura.

## Registro generado

`tools/generate-assessment-registry.mjs` lee los ocho archivos de curso sin modificarlos y genera una migración reproducible. La versión actual contiene 1.002 preguntas. Cada fila incorpora una huella SHA-256 de su contenido y una revisión SHA-256 del banco completo del curso.

El pipeline ejecuta `npm run test:verified-assessment` y falla si el artefacto generado no coincide con los bancos versionados o si se debilita alguna garantía esencial.

## Pruebas ejecutadas

- Parser PostgreSQL sobre las dos migraciones nuevas.
- Sintaxis de 54 archivos JavaScript y versión `0.19.0`.
- Auditoría de las 21 migraciones ya aplicadas en producción.
- Registro reproducible de 8 cursos y 1.002 preguntas.
- Pruebas unitarias de autoridad del servidor, aislamiento y bloqueo de RPC heredadas.
- Persistencia, selección aleatoria, contenido, fuentes y realismo de simuladores.
- Playwright de matrícula, práctica verificada, reintento sin inflación, simulacro, examen final, cuenta y administración.
- Autenticación, certificados, SEO con 80 URLs, PWA, audio, home y capítulos en escritorio y móvil.

Todas las pruebas ejecutadas finalizaron correctamente. La primera ejecución SEO perdió temporalmente el servidor local durante pruebas paralelas; se repitió de forma aislada y validó las 80 URLs.

## Límites y siguiente etapa

- Las migraciones no se aplicaron a una base remota. Deben validarse primero en Supabase de staging antes de producción.
- Los archivos estáticos de curso todavía incluyen las respuestas correctas. El servidor impide falsificar el cálculo, pero no ofrece secreto de examen ni supervisión. Para ese nivel, la selección y entrega de preguntas debe migrar a una función backend.
- Mi cuenta y algunas vistas de dominio por capítulo aún combinan el caché local con datos de matrícula. La Etapa 4 debe construir agregados oficiales del servidor y hacer que Mi cuenta, administración y certificados consuman exclusivamente esos agregados.
- Los resultados históricos anteriores conservan `verified = false`; la política de migración y acreditación histórica debe definirse antes de habilitar constancias auditables.

Ningún dato remoto fue modificado y no se realizó despliegue durante esta etapa.
