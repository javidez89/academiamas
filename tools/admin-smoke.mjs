import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const baseUrl = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/$/, '');
const now = new Date().toISOString();
const privateEmail = 'estudiante.admin-test@example.com';
const adminUsers = [{
  id: '0b979504-232e-44c0-b73a-a91782586201',
  email: privateEmail,
  full_name: 'Estudiante de prueba',
  created_at: now,
  last_sign_in_at: now,
  last_seen_at: now,
  enrollments: [{
    course_key: 'ctfl',
    status: 'active',
    started_at: now,
    last_activity_at: now,
    estimated_hours: 20,
    study_seconds: 5400,
    simulator_attempts: 3,
    practice_answers: 60,
    best_simulator_score: 82,
    final_exam_attempts: 1,
    best_final_exam_score: 70,
    final_exam_passed: false,
    progress_percent: 40,
    mastery_percent: 35,
    chapter_average: 42,
    chapter_domain_average: 33,
    final_exam_eligible: false,
    verified: true,
    chapters: [],
    progress: { studySeconds: 999999, byLo: {}, chapterActivity: {}, attempts: [{ mode: 'final-exam', passed: true, scorePct: 100 }] }
  }]
}];

const browser = await chromium.launch({ headless: true });
try {
  const adminContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const adminPage = await adminContext.newPage();
  await useMockedSupabase(adminPage, MOCK_SESSION, [], {
    admin: true,
    adminUsers,
    adminSummary: {
      registered_users: 1,
      online_users: 1,
      active_users_30d: 1,
      new_users_30d: 1,
      enrolled_users: 1,
      active_enrollments: 1,
      completed_enrollments: 0,
      study_seconds: 5400,
      simulator_attempts: 3,
      final_exam_attempts: 1
    },
    adminAnalytics: {
      verified: true,
      timezone: 'America/Bogota',
      period: { from: '2026-08-03T05:00:00.000Z', to: now, course_key: null },
      summary: {
        active_learners: 1,
        new_enrollments: 1,
        cancellations: 0,
        study_seconds: 5400,
        learning_sessions: 4,
        average_study_minutes: 90,
        practice_attempts: 2,
        simulator_attempts: 3,
        final_exam_attempts: 1,
        final_exams_passed: 1,
        final_exam_pass_rate: 100,
        certificates_issued: 1,
        certificate_revenue_cop: 100000
      },
      courses: [{
        course_key: 'ctfl', enrolled_users: 1, new_enrollments: 1, active_learners: 1,
        learning_sessions: 4, study_seconds: 5400, practice_attempts: 2, simulator_attempts: 3,
        final_exam_attempts: 1, final_exams_passed: 1, final_exam_pass_rate: 100,
        average_final_score: 80, certificates_issued: 1, cancellations: 0
      }],
      daily: [
        { date: '2026-08-29', active_learners: 1, learning_sessions: 2, study_seconds: 1800, enrollments: 1, assessments: 1, final_exams_passed: 0 },
        { date: '2026-08-30', active_learners: 1, learning_sessions: 2, study_seconds: 3600, enrollments: 0, assessments: 2, final_exams_passed: 1 }
      ]
    }
  });
  await adminPage.goto(`${baseUrl}/admin/?admin-smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await adminPage.getByRole('heading', { name: 'Resumen gerencial de QAvance' }).waitFor();
  await adminPage.getByText(privateEmail).waitFor();
  await adminPage.getByText('En línea', { exact: true }).waitFor();
  await adminPage.getByText('Ver cursos y avance por capítulo', { exact: true }).click();
  await adminPage.getByText(/Certified Tester Foundation Level 4\.0/).waitFor();
  assert.match(await adminPage.locator('.adminEnrollmentRow').innerText(), /Avance verificado\s+40%/i,
    'Administración debe mostrar el agregado oficial e ignorar el JSON de progreso manipulable.');
  await adminPage.getByRole('button', { name: /Métricas/i }).click();
  await adminPage.getByRole('heading', { name: 'Métricas verificadas de aprendizaje' }).waitFor();
  assert.match(await adminPage.locator('.adminAnalyticsMetricGrid').innerText(), /Estudiantes activos\s+1/i,
    'El panel debe mostrar estudiantes agregados por el servidor.');
  assert.match(await adminPage.locator('.adminAnalyticsMetricGrid').innerText(), /Tiempo verificado\s+1 h 30 min/i,
    'El tiempo administrativo debe venir del agregado verificado.');
  assert.match(await adminPage.locator('.adminAnalyticsCourseTable').innerText(), /CTFL/i,
    'La tabla debe presentar métricas agrupadas por curso.');
  const analyticsCalls = await adminPage.evaluate(() => window.__supabaseMock.rpcCounts.admin_verified_learning_analytics || 0);
  await adminPage.getByRole('button', { name: '7 días' }).click();
  await adminPage.waitForFunction((calls) => (window.__supabaseMock.rpcCounts.admin_verified_learning_analytics || 0) > calls, analyticsCalls);
  assert.equal(await adminPage.locator('[data-auth-admin-link]').evaluate((element) => element.hidden), false, 'El enlace administrativo debe habilitarse solo al administrador.');
  assert.ok(await adminPage.evaluate(() => window.__supabaseMock.rpcCounts.is_platform_admin) <= 2, 'La autorización administrativa no debe entrar en un ciclo de consultas.');
  const overflow = await adminPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `El panel administrativo móvil tiene ${overflow}px de desbordamiento.`);
  await adminPage.setViewportSize({ width: 1440, height: 1000 });
  await adminPage.locator('.adminAnalyticsCourseHeader').waitFor();
  const desktopOverflow = await adminPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(desktopOverflow <= 1, `El panel administrativo de escritorio tiene ${desktopOverflow}px de desbordamiento.`);
  if (process.env.ADMIN_SCREENSHOT_PATH) {
    await adminPage.screenshot({ path: process.env.ADMIN_SCREENSHOT_PATH, fullPage: true });
  }
  await adminContext.close();

  const userContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const userPage = await userContext.newPage();
  await useMockedSupabase(userPage, MOCK_SESSION, [], { admin: false, adminUsers });
  await userPage.goto(`${baseUrl}/admin/?admin-smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await userPage.getByRole('heading', { name: /no tiene permisos administrativos/i }).waitFor();
  assert.equal(await userPage.getByText(privateEmail).count(), 0, 'Una cuenta normal no debe recibir datos administrativos.');
  assert.equal(await userPage.locator('[data-auth-admin-link]').evaluate((element) => element.hidden), true, 'Una cuenta normal no debe ver el enlace administrativo.');
  await userContext.close();

  console.log('Admin smoke OK');
} finally {
  await browser.close();
}
