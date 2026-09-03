import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [progressSql, messagesSql, cloud, app] = await Promise.all([
  readFile(new URL('../supabase/migrations/20260902122451_practice_achievement_progress.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260902122501_admin_direct_user_messages.sql', import.meta.url), 'utf8'),
  readFile(new URL('../assets/js/cloud.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/js/app.js', import.meta.url), 'utf8')
]);

assert.match(progressSql, /private\.verified_progress_checkpoints[\s\S]*progress_floor_percent/i,
  'La transición debe capturar un piso de avance por usuario y curso.');
assert.match(progressSql, /progress_floor_percent\s*=\s*greatest/i,
  'El piso de avance solo puede conservarse o aumentar.');
assert.match(progressSql, /create table if not exists private\.practice_question_achievements/i,
  'Cada respuesta correcta debe convertirse en un logro permanente del servidor.');
assert.match(progressSql, /on conflict \(user_id, course_key, question_id\) do nothing/i,
  'Reintentar una pregunta no debe duplicar ni borrar el logro ya alcanzado.');
assert.match(progressSql, /95\.0 \* count\(\*\) filter \(where practice_complete\) \/ count\(\*\)/i,
  'El 95% previo al examen debe depender de capítulos con práctica completa.');
assert.match(progressSql, /drop index if exists private\.verified_assessment_attempts_one_active_user_idx/i,
  'Las evaluaciones activas de pestañas independientes no deben invalidarse por una restricción global.');
assert.match(progressSql, /old\.activity_type = 'practice'[\s\S]*return null;/i,
  'Un intento de práctica reciente debe quedar protegido ante abandono automático.');
assert.doesNotMatch(progressSql, /(?:delete\s+from|truncate\s+(?:table\s+)?)(?:public\.)?(?:course_enrollments|course_progress|course_final_exam_attempts)/i,
  'La migración no debe borrar matrículas, historial ni exámenes existentes.');

assert.match(cloud, /rememberPendingVerifiedAnswer[\s\S]*client\.rpc\('submit_verified_answer'/i,
  'La respuesta debe guardarse localmente antes de enviarse al servidor.');
assert.match(cloud, /completeVerifiedAssessment[\s\S]*flushPendingVerifiedAnswers\(\)[\s\S]*pending\.remaining > 0/i,
  'No se debe cerrar una evaluación mientras haya respuestas sin sincronizar.');
assert.match(cloud, /pendingVerifiedAnswerFlush[\s\S]*performPendingVerifiedAnswerFlush\(\)[\s\S]*finally/i,
  'Los reintentos simultáneos deben compartir una única ejecución de la cola.');
assert.doesNotMatch(cloud, /items\.slice\(-500\)/i,
  'La cola no debe descartar silenciosamente respuestas antiguas por un límite local arbitrario.');
assert.match(app, /addEventListener\('online',\s*handleConnectionRestored\)/i,
  'La aplicación debe reintentar las respuestas pendientes al recuperar Internet.');
assert.match(app, /bootstrap[\s\S]*synchronizePendingVerifiedAnswers\(\{ announce: true \}\)/i,
  'La aplicación debe recuperar respuestas pendientes después de F5 o reapertura.');
assert.match(app, /ADMIN_DRAFTS_KEY[\s\S]*sessionStorage/i,
  'Los borradores administrativos deben sobrevivir a renderizados y recargas de la pestaña.');
assert.match(app, /data-admin-direct-message-form/i,
  'Administración debe ofrecer mensajería directa dentro de la plataforma.');

assert.match(messagesSql, /alter table private\.admin_user_messages enable row level security/i,
  'Los mensajes directos deben mantener RLS activa.');
assert.match(messagesSql, /perform private\.require_platform_admin\(\)/i,
  'Solo un administrador verificado puede enviar mensajes directos.');
assert.match(messagesSql, /recipient_user_id = v_user_id/i,
  'Cada estudiante solo debe consultar sus propios mensajes.');
assert.doesNotMatch(messagesSql, /grant\s+(?:select|insert|update|delete|all).*private\.admin_user_messages.*authenticated/i,
  'Los usuarios autenticados no deben tener acceso directo a la tabla privada.');

console.log('Progress reliability unit OK: logros no regresivos, cola de respuestas, borradores y mensajería protegida.');
