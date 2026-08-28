import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20260828190048_authoritative_learning_aggregates.sql', import.meta.url);
const appUrl = new URL('../assets/js/app.js', import.meta.url);
const cloudUrl = new URL('../assets/js/cloud.js', import.meta.url);
const certificateUrl = new URL('../supabase/functions/certificate-service/index.ts', import.meta.url);

const [sql, app, cloud, certificate] = await Promise.all([
  readFile(migrationUrl, 'utf8'),
  readFile(appUrl, 'utf8'),
  readFile(cloudUrl, 'utf8'),
  readFile(certificateUrl, 'utf8')
]);

assert.match(sql, /create table private\.course_chapter_requirements/i,
  'Los requisitos académicos deben permanecer en el esquema privado.');
assert.match(sql, /alter table private\.course_chapter_requirements enable row level security/i,
  'Los requisitos académicos deben tener RLS habilitado.');
assert.match(sql, /revoke all on table private\.course_chapter_requirements from public, anon, authenticated/i,
  'El catálogo de requisitos no debe exponerse directamente al navegador.');
assert.match(sql, /from private\.learning_activity_sessions/i,
  'El tiempo oficial debe derivarse de sesiones verificadas.');
assert.match(sql, /select distinct on \(attempt\.course_key, question\.question_id\)/i,
  'La cobertura debe contar cada pregunta una sola vez aunque haya reintentos.');
assert.match(sql, /chapter\.reading_progress \* 0\.4[\s\S]*chapter\.practice_coverage \* 0\.6/i,
  'El avance de capítulo debe conservar la ponderación aprobada de lectura y práctica.');
assert.match(sql, /when course\.final_exam_passed then 100[\s\S]*else least\(95,/i,
  'El curso solo puede llegar al 100% con examen final verificado y aprobado.');
assert.match(sql, /create or replace function public\.get_verified_learning_dashboard\(\)/i,
  'Debe existir una RPC autenticada para consultar el agregado oficial.');

const adminBody = sql.match(/create or replace function private\.admin_list_users\([\s\S]*?\n\$\$;/i)?.[0] || '';
assert.ok(adminBody, 'La migración debe actualizar el listado administrativo.');
assert.match(adminBody, /private\.authoritative_learning_dashboard\(page_users\.id\)/i,
  'Administración debe consultar el mismo agregado oficial de cada usuario.');
assert.doesNotMatch(adminBody, /public\.course_progress|progress\.progress/i,
  'Administración no debe presentar el JSON heredado como progreso oficial.');

assert.match(cloud, /getVerifiedLearningDashboard[\s\S]*rpc\('get_verified_learning_dashboard'\)/i,
  'El cliente debe obtener métricas oficiales mediante la RPC dedicada.');
assert.match(cloud, /p_practice_answers:\s*0[\s\S]*p_study_seconds:\s*0/i,
  'La sincronización compatible no debe reenviar métricas académicas calculadas por el navegador.');

const officialBranch = app.match(/function courseProgressDetailsFrom\([\s\S]*?\n  \}\n\n  function verifiedProgressPercent/)?.[0] || '';
assert.ok(officialBranch, 'La interfaz debe tener una rama explícita para datos oficiales.');
assert.match(officialBranch, /verifiedProgressPercent\s*=\s*number\(official\.progress_percent\)/i,
  'La interfaz debe conservar el progreso oficial por separado.');
assert.match(officialBranch, /finalExamPassed:\s*official\.final_exam_passed === true/i,
  'La aprobación del examen debe proceder del servidor.');
assert.match(officialBranch, /historicalProgressPercent > 10[\s\S]*progressPercent:\s*hasUnverifiedHistory \? historicalProgressPercent : verifiedProgressPercent/i,
  'El historial mayor al 10% debe conservarse sin reemplazar la métrica oficial.');
assert.match(officialBranch, /finalExamEligible:\s*official\.final_exam_eligible === true/i,
  'El historial no debe habilitar el examen final.');
assert.match(app, /learningSnapshot\.verifiedByCourse\.get\(key\) \|\| enrollmentForCourse\(key\)/i,
  'Las vistas de curso deben preferir el agregado oficial sobre la compatibilidad local.');

assert.match(certificate, /user\.rpc\('get_verified_learning_dashboard'\)/i,
  'La emisión de constancias debe consultar el agregado oficial con la sesión del usuario.');
assert.match(certificate, /verifiedCourse\?\.final_exam_passed !== true[\s\S]*progress_percent \|\| 0\) !== 100/i,
  'La constancia debe exigir examen aprobado y progreso oficial del 100%.');

console.log('Authoritative progress unit OK: cuenta, administración y constancias usan métricas verificadas.');
