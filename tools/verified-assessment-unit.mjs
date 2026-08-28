import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20260828190009_verified_assessment_events.sql', import.meta.url);
const registryUrl = new URL('../supabase/migrations/20260828190028_assessment_registry_v1.sql', import.meta.url);
const appUrl = new URL('../assets/js/app.js', import.meta.url);
const cloudUrl = new URL('../assets/js/cloud.js', import.meta.url);
const [sql, registrySql, app, cloud] = await Promise.all([
  readFile(migrationUrl, 'utf8'),
  readFile(registryUrl, 'utf8'),
  readFile(appUrl, 'utf8'),
  readFile(cloudUrl, 'utf8')
]);

assert.match(sql, /create table private\.assessment_question_registry/i,
  'Las respuestas canónicas deben permanecer en el esquema privado.');
assert.match(sql, /revoke all on table private\.assessment_question_registry from public, anon, authenticated/i,
  'El banco canónico no debe exponerse por la API de datos.');
assert.match(sql, /activity\.user_id = v_user_id[\s\S]*activity\.ended_at is null/i,
  'El intento debe pertenecer a una sesión activa del usuario autenticado.');
assert.match(sql, /enrollment\.user_id = v_user_id[\s\S]*enrollment\.course_key = v_session\.course_key/i,
  'El intento debe exigir una matrícula propia en el curso correcto.');
assert.match(sql, /v_question_count <> v_blueprint\.total_questions[\s\S]*v_total_points <> v_blueprint\.total_points/i,
  'Simulacro y examen deben respetar cantidad y puntos del blueprint.');
assert.match(sql, /Assessment distribution does not match the course blueprint/i,
  'La matriz por capítulo y nivel K debe validarse en el servidor.');
assert.match(sql, /v_is_correct := v_selected = private\.normalize_answer_indices\(v_question\.correct_indices\)/i,
  'La corrección debe comparar contra la respuesta canónica privada.');
assert.match(sql, /count\(distinct answer\.question_id\)/i,
  'Los reintentos no deben inflar la cobertura de práctica.');
assert.match(sql, /coalesce\(sum\(question\.points_earned\), 0\)[\s\S]*v_score :=/i,
  'El servidor debe sumar puntos y calcular el puntaje final.');
assert.match(sql, /verified,[\s\S]*assessment_attempt_id[\s\S]*true,[\s\S]*v_attempt\.id/i,
  'Todo resultado final nuevo debe quedar vinculado a un intento verificable.');
assert.match(sql, /revoke all on function public\.record_simulator_completion/i,
  'La RPC heredada del simulacro debe permanecer bloqueada.');
assert.match(sql, /revoke all on function public\.record_final_exam_completion/i,
  'La RPC heredada del examen final debe permanecer bloqueada.');

const syncBody = sql.match(/create or replace function private\.sync_course_activity\([\s\S]*?\n\$\$;/i)?.[0] || '';
assert.ok(syncBody, 'La migración debe reemplazar la sincronización compatible.');
assert.doesNotMatch(syncBody, /set[\s\S]*?(practice_answers|study_seconds|verified_study_seconds)\s*=/i,
  'El JSON del navegador no debe modificar métricas oficiales.');

assert.doesNotMatch(app, /Cloud\.recordSimulatorCompletion\(/,
  'El frontend no debe enviar puntajes calculados para simulacros.');
assert.doesNotMatch(app, /Cloud\.recordFinalExamCompletion\(/,
  'El frontend no debe enviar puntajes calculados para exámenes finales.');
assert.match(app, /Cloud\.submitVerifiedAnswer\(/,
  'El frontend debe enviar respuestas individuales al backend verificable.');
assert.match(app, /Cloud\.completeVerifiedAssessment\(/,
  'El frontend debe cerrar el intento mediante la RPC verificable.');
assert.doesNotMatch(cloud, /record_simulator_completion|record_final_exam_completion/i,
  'La API del navegador no debe conservar métodos capaces de enviar puntajes calculados localmente.');
assert.match(cloud, /p_practice_answers:\s*0[\s\S]*p_study_seconds:\s*0/i,
  'La sincronización compatible no debe reenviar métricas académicas del navegador.');

const registryRows = registrySql.match(/insert into private\.assessment_question_registry/gi) || [];
assert.ok(registryRows.length >= 8, 'El registro generado debe cubrir todos los cursos del catálogo.');
assert.doesNotMatch(registrySql, /github\.io|https?:\/\//i,
  'El registro canónico no debe incorporar rutas públicas ni dependencias externas.');

console.log('Verified assessment unit OK: respuestas, cobertura y resultados quedan bajo autoridad del servidor.');
