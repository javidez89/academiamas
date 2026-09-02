import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migration = await fs.readFile(path.join(root, 'supabase', 'migrations', '20260902042140_admin_verified_learning_analytics.sql'), 'utf8');
const cloud = await fs.readFile(path.join(root, 'assets', 'js', 'cloud.js'), 'utf8');
const app = await fs.readFile(path.join(root, 'assets', 'js', 'app.js'), 'utf8');

assert.match(migration, /create or replace function private\.admin_verified_learning_analytics[\s\S]+security definer[\s\S]+set search_path = ''/i,
  'La agregación privilegiada debe permanecer en el esquema privado con un search_path fijo.');
assert.match(migration, /perform private\.require_platform_admin\(\)/i,
  'La consulta debe verificar el rol administrativo dentro de la base de datos.');
assert.match(migration, /revoke all on function public\.admin_verified_learning_analytics[\s\S]+from public, anon, authenticated/i,
  'La función pública debe revocar permisos implícitos antes de conceder acceso.');
assert.match(migration, /grant execute on function public\.admin_verified_learning_analytics[\s\S]+to authenticated/i,
  'Solo sesiones autenticadas pueden intentar invocar la función protegida.');
assert.match(migration, /private\.learning_activity_sessions/i,
  'El tiempo debe agregarse desde sesiones verificadas.');
assert.match(migration, /private\.verified_assessment_attempts/i,
  'Los resultados deben agregarse desde intentos evaluados por el servidor.');
assert.doesNotMatch(migration, /public\.course_progress|legacy_learning_progress|legacy_progress_snapshot/i,
  'Las métricas oficiales no deben leer progreso administrado por el navegador ni histórico no verificado.');
assert.doesNotMatch(migration, /\b(?:insert\s+into|update|delete\s+from|truncate)\b/i,
  'La migración analítica debe ser de solo lectura y no alterar el avance.');
assert.match(cloud, /admin_verified_learning_analytics[\s\S]+p_from[\s\S]+p_to[\s\S]+p_course_key/i,
  'El cliente debe enviar filtros de periodo y curso al servidor.');
assert.match(app, /Métricas verificadas de aprendizaje/i,
  'El panel debe identificar claramente la nueva sección gerencial.');
assert.match(app, /El histórico no verificado no se suma/i,
  'El panel debe distinguir las métricas verificadas del histórico conservado.');

console.log('Admin analytics unit OK');
