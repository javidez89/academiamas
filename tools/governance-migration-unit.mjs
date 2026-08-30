import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationNames = [
  '20260829235833_user_inbox_admin_governance.sql',
  '20260830001454_expose_my_certificate_entitlements.sql',
  '20260830002445_block_admin_privileges.sql'
];
const sql = migrationNames
  .map((name) => fs.readFileSync(path.join(repoRoot, 'supabase', 'migrations', name), 'utf8'))
  .join('\n')
  .toLowerCase();

const protectedTables = [
  'public.course_progress',
  'private.legacy_course_progress',
  'private.learning_activity_sessions',
  'private.verified_assessment_attempts',
  'private.verified_assessment_questions'
];

for (const table of protectedTables) {
  assert.doesNotMatch(sql, new RegExp(`delete\\s+from\\s+${table.replace('.', '\\.')}`, 'i'), `No se puede borrar ${table}.`);
  assert.doesNotMatch(sql, new RegExp(`truncate(?:\\s+table)?\\s+${table.replace('.', '\\.')}`, 'i'), `No se puede truncar ${table}.`);
  assert.doesNotMatch(sql, new RegExp(`drop\\s+table(?:\\s+if\\s+exists)?\\s+${table.replace('.', '\\.')}`, 'i'), `No se puede eliminar ${table}.`);
}

assert.match(sql, /set\s+hidden_at\s*=\s*now\(\)/, 'Cancelar y quitar un curso debe usar ocultamiento reversible.');
assert.doesNotMatch(sql, /delete\s+from\s+public\.course_enrollments/, 'Una matrícula nunca debe borrarse al ocultarla.');
assert.match(sql, /deleted_at/, 'Mensajes y calificaciones deben usar borrado lógico.');
assert.match(sql, /archived_at/, 'Las constancias deben conservar un estado de archivo auditable.');
assert.match(sql, /blocked_at/, 'El bloqueo de usuarios debe quedar registrado.');
assert.match(sql, /not\s+exists[\s\S]*user_access_controls[\s\S]*blocked_at\s+is\s+not\s+null/, 'Una cuenta bloqueada no debe conservar privilegios administrativos.');

console.log('Governance migration unit OK: solo operaciones aditivas y estados reversibles; progreso protegido.');
