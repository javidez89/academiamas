import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20260827174137_verified_study_sessions_v2.sql', import.meta.url);
const sql = await readFile(migrationUrl, 'utf8');

assert.match(sql, /add column verified_study_seconds bigint not null default 0/i,
  'La matrícula debe tener un contador de tiempo verificado independiente.');
assert.match(sql, /primary key \(session_id\)/i,
  'El historial debe conservar cada sesión por su identificador.');
assert.match(sql, /create unique index learning_activity_sessions_one_active_user_idx[\s\S]*where ended_at is null/i,
  'Solo puede existir una sesión activa por usuario.');
assert.match(sql, /activity_type in \('reading', 'practice', 'simulator', 'final_exam'\)/i,
  'Las cuatro actividades académicas deben estar cubiertas.');
assert.match(sql, /activity_type = 'reading' and chapter_id between 1 and 999/i,
  'Toda sesión de lectura debe quedar vinculada a un capítulo.');
assert.match(sql, /p_now - p_last_seen_at > interval '90 seconds' then 0/i,
  'Un latido tardío no debe contabilizar tiempo de inactividad.');
assert.match(sql, /else least\(\s*45,/i,
  'Cada latido debe tener un máximo de 45 segundos.');
assert.match(sql, /pg_catalog\.pg_advisory_xact_lock/i,
  'El inicio de sesión debe serializarse por usuario.');
assert.match(sql, /touch_learning_activity[\s\S]*?enrollment\.status in \('active', 'completed'\)[\s\S]*?return false/i,
  'Una matrícula cancelada debe invalidar sus latidos pendientes.');
assert.match(sql, /create or replace function public\.get_verified_study_time/i,
  'Debe existir una consulta autenticada de tiempo verificado.');

const syncBody = sql.match(/create or replace function private\.sync_course_activity\([\s\S]*?\n\$\$;/i)?.[0] || '';
assert.ok(syncBody, 'La migración debe reemplazar sync_course_activity.');
assert.doesNotMatch(syncBody, /set[\s\S]*?study_seconds\s*=/i,
  'El cliente no debe poder actualizar study_seconds ni verified_study_seconds mediante sync_course_activity.');
assert.match(syncBody, /practice_answers\s*=\s*v_practice_answers/i,
  'La sincronización compatible debe conservar el conteo de preguntas únicas.');

const threeArgumentFunctions = sql.match(/begin_learning_activity\([\s\S]*?p_chapter_id integer[^)]*\)/gi) || [];
assert.ok(threeArgumentFunctions.length >= 2, 'Deben existir las funciones privada y pública con capítulo.');
assert.equal(threeArgumentFunctions.some((signature) => /default\s+null/i.test(signature)), false,
  'La sobrecarga de tres argumentos no debe tener un valor por defecto ambiguo.');

console.log('Verified study sessions unit OK: tiempo y sesiones quedan bajo autoridad del servidor.');
