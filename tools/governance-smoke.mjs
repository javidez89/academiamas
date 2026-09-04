import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, MOCK_USER, useMockedSupabase } from './helpers/mock-supabase.mjs';

const baseUrl = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/$/, '');
const now = new Date().toISOString();
const studentId = '0b979504-232e-44c0-b73a-a91782586201';
const enrollment = {
  course_key: 'ctfl', status: 'cancelled', started_at: now, cancelled_at: now, hidden_at: null,
  last_activity_at: now, estimated_hours: 20, study_seconds: 3600, verified_study_seconds: 900,
  simulator_attempts: 2, practice_answers: 12, best_simulator_score: 70,
  final_exam_attempts: 1, best_final_exam_score: 55, final_exam_passed: false,
  progress_percent: 18, mastery_percent: 12, chapters: []
};
const inboxMessage = {
  id: '5ef92598-72a0-433a-b404-883088383b21', user_id: MOCK_USER.id, full_name: 'Javier QAvance',
  email: MOCK_USER.email, subject: 'Seguimiento del curso', message: 'Necesito revisar mi avance.',
  status: 'responded', admin_reply: 'Tu avance permanece guardado y disponible.',
  replied_at: now, created_at: now, updated_at: now
};
const adminMessage = {
  ...inboxMessage, id: '8774c3f5-e398-49b1-94fa-1638eea5fb87', user_id: studentId,
  email: 'estudiante@example.com', full_name: 'Estudiante Uno', status: 'new', admin_reply: null
};
const review = {
  id: '0bab1638-6acc-4d8b-8462-49853f1fc3ef', user_id: studentId, course_key: 'ctfl',
  rating: 4, comment: 'Comentario pendiente de gobierno.', status: 'pending',
  full_name: 'Estudiante Uno', email: 'estudiante@example.com', created_at: now
};
const certificate = {
  id: '118ee985-493d-423b-81b6-f8066af3d70d', certificate_code: 'QAV-GOVERNANCE01',
  user_id: studentId, email: 'estudiante@example.com', full_name: 'Estudiante Uno',
  document: 'CC ••••1234', course_key: 'ctfl', course_name: 'ISTQB CTFL 4.0',
  estimated_hours: 20, issued_at: now, status: 'VALID', archived_at: null
};
const adminUsers = [{
  id: studentId, email: 'estudiante@example.com', full_name: 'Estudiante Uno',
  created_at: now, last_sign_in_at: now, last_seen_at: now,
  enrollments: [{ ...enrollment, status: 'active', cancelled_at: null }]
}];

const browser = await chromium.launch({ headless: true });
try {
  const account = await browser.newPage({ viewport: { width: 390, height: 844 } });
  account.on('dialog', (dialog) => dialog.accept());
  await useMockedSupabase(account, MOCK_SESSION, [enrollment], {
    contactMessages: [inboxMessage],
    legacyProgress: [{ course_key: 'ctfl', progress: { studySeconds: 3600 }, imported_progress_percent: 18 }]
  });
  await account.goto(`${baseUrl}/mi-cuenta/?governance=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await account.getByRole('heading', { name: 'Mis mensajes' }).waitFor();
  await account.getByText(inboxMessage.admin_reply).waitFor();
  await account.getByRole('button', { name: 'Quitar de mi cuenta' }).click();
  await account.getByText(/historial de aprendizaje permanece protegido/i).waitFor();
  assert.equal(await account.locator('.accountCourseCard').count(), 0, 'El curso ocultado no debe reaparecer al refrescar la cuenta.');
  const preserved = await account.evaluate(() => ({
    enrollment: window.__supabaseMock.enrollments[0],
    legacy: window.__supabaseMock.legacyProgress[0]
  }));
  assert.equal(preserved.enrollment.status, 'cancelled');
  assert.ok(preserved.enrollment.hidden_at, 'La matrícula debe conservarse con hidden_at.');
  assert.equal(preserved.enrollment.study_seconds, 3600, 'El tiempo histórico no debe alterarse.');
  assert.equal(preserved.legacy.imported_progress_percent, 18, 'El histórico no verificado debe conservarse.');
  await account.close();

  const admin = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  admin.on('dialog', (dialog) => dialog.type() === 'prompt' ? dialog.accept('Validación administrativa') : dialog.accept());
  await useMockedSupabase(admin, MOCK_SESSION, [], {
    admin: true,
    accessStatus: { blocked: false, admin_role: 'superadmin', certificate_entitlements: [] },
    adminUsers,
    adminSummary: { registered_users: 1, online_users: 1, active_users_30d: 1, enrolled_users: 1 },
    adminGovernance: [{ user_id: studentId, blocked: false, admin_role: null, certificate_entitlements: [] }],
    adminCertificates: [certificate],
    contactMessages: [adminMessage],
    courseReviews: [review]
  });
  await admin.goto(`${baseUrl}/admin/?governance=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await admin.getByText('estudiante@example.com').first().waitFor();
  await admin.getByText('Detalle del estudiante').click();
  await admin.getByRole('button', { name: 'Habilitar constancia' }).click();
  await admin.getByText(/Constancia habilitada para el usuario/i).waitFor();
  await admin.getByText('Detalle del estudiante').click();
  await admin.getByRole('button', { name: 'Bloquear cuenta' }).click();
  await admin.getByText('Bloqueado', { exact: true }).waitFor();

  await admin.getByRole('button', { name: /Mensajes/ }).click();
  await admin.getByRole('button', { name: 'Archivar' }).click();
  assert.equal((await admin.evaluate(() => window.__supabaseMock.contactMessages[0].deleted_at))?.length > 0, true);

  await admin.getByRole('button', { name: /Calificaciones/ }).click();
  await admin.getByRole('button', { name: 'Archivar' }).click();
  assert.equal((await admin.evaluate(() => window.__supabaseMock.courseReviews[0].deleted_at))?.length > 0, true);

  await admin.getByRole('button', { name: /Certificados/ }).click();
  await admin.getByRole('button', { name: 'Revocar' }).click();
  await admin.getByText('Revocado', { exact: true }).waitFor();
  await admin.getByRole('button', { name: 'Archivar' }).click();
  await admin.locator('.adminCertificates .accountStatus', { hasText: 'Archivado' }).waitFor();

  const governance = await admin.evaluate(() => ({
    access: window.__supabaseMock.adminGovernance[0],
    certificate: window.__supabaseMock.adminCertificates[0]
  }));
  assert.equal(governance.access.blocked, true);
  assert.equal(governance.access.certificate_entitlements[0].enabled, true);
  assert.equal(governance.certificate.status, 'REVOKED');
  assert.ok(governance.certificate.archived_at);
  await admin.close();

  console.log('Governance smoke OK: bandeja, ocultamiento sin pérdida, bloqueo, habilitación y archivo reversible.');
} finally {
  await browser.close();
}
