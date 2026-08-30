import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../supabase/migrations/20260829014614_contact_messages_course_reviews.sql', import.meta.url), 'utf8');
const governanceMigration = await readFile(new URL('../supabase/migrations/20260830230325_admin_inbox_social_settings.sql', import.meta.url), 'utf8');
const cloud = await readFile(new URL('../assets/js/cloud.js', import.meta.url), 'utf8');

for (const table of ['private.contact_messages', 'private.course_reviews']) {
  assert.match(migration, new RegExp(`alter table ${table.replace('.', '\\.')} enable row level security`, 'i'));
  assert.match(migration, new RegExp(`revoke all on table ${table.replace('.', '\\.')} from public, anon, authenticated`, 'i'));
}
assert.match(migration, /set search_path = ''/i, 'Las funciones security definer deben fijar un search_path vacío.');
assert.match(migration, /Debes estar inscrito en el curso para calificarlo/i);
assert.match(migration, /cm\.created_at > now\(\) - interval '10 minutes'/i, 'El contacto debe limitar envíos repetidos.');
assert.match(migration, /where cr\.status = 'approved'/i, 'La consulta pública debe filtrar únicamente reseñas aprobadas.');
assert.doesNotMatch(migration, /grant execute on function public\.admin_[^(]+\([^;]+\) to anon/i, 'Las funciones administrativas no pueden concederse a anónimos.');
assert.match(cloud, /submitContactMessage/);
assert.match(cloud, /moderateAdminCourseReview/);
assert.match(governanceMigration, /create table if not exists private\.platform_social_settings/i);
assert.match(governanceMigration, /alter table private\.platform_social_settings enable row level security/i);
assert.match(governanceMigration, /perform private\.require_platform_admin\(\)/i);
assert.match(governanceMigration, /grant execute on function public\.get_public_social_settings\(\) to anon, authenticated/i);
assert.doesNotMatch(governanceMigration, /grant .* on table private\.platform_social_settings to anon/i);
assert.match(governanceMigration, /'archived'/i, 'La consulta administrativa debe conservar acceso al archivo auditable.');
assert.match(cloud, /updateAdminSocialSettings/);

console.log('Contact and reviews security unit OK.');
