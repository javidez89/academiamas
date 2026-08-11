import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';
import { completeCourseStudy } from './helpers/learning-progress.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE_URL}/curso/ctfl/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  await page.waitForFunction(() => window.__supabaseMock?.enrollments?.some((item) => (
    item.course_key === 'ctfl' && item.status === 'active'
  )));

  const enrollment = await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')
  ));
  assert.ok(enrollment.estimated_hours > 0, 'La matrícula debe guardar horas estimadas.');
  assert.equal(await page.evaluate(() => Boolean(window.AcademyCloud)), true, 'La capa cloud debe estar disponible.');

  await page.evaluate(() => window.AcademyCloud.syncProgress('ctfl', {
    studySeconds: 3_900,
    chapterActivity: {
      1: {
        studySeconds: 3_900,
        visitedAt: '2026-08-11T10:00:00Z',
        lastStudiedAt: '2026-08-11T11:05:00Z'
      }
    },
    byLo: {
      'FL-1.1.1': { ok: 2, bad: 1, chapter: 1, k: 'K2', objective: 'Objetivo de prueba' }
    }
  }));
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.study_seconds
  )), 3_900, 'El tiempo de estudio debe sincronizarse en la matrícula.');

  await page.locator('[data-view="exam"]').first().click();
  await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).click();
  await page.locator('.questionBox').waitFor();
  await page.getByRole('button', { name: /Finalizar/i }).click();
  await page.waitForFunction(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.simulator_attempts === 1
  ));

  const lockedFinalExam = page.locator('[data-view="finalExam"]').first();
  assert.equal(await lockedFinalExam.isDisabled(), true, 'El examen final debe permanecer bloqueado antes del 95%.');
  await completeCourseStudy(page, 'ctfl');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (
    document.querySelector('.navbtn[data-view="finalExam"] small')?.textContent.trim() === 'habilitado'
  ));
  const enabledFinalExam = page.locator('[data-view="finalExam"]').first();
  assert.equal(await enabledFinalExam.isDisabled(), false, 'El examen final debe habilitarse al alcanzar el 95%.');
  await enabledFinalExam.click();
  await page.waitForURL('**/curso/ctfl/examen-final/');
  await page.getByRole('heading', { name: /^Examen final ·/i }).waitFor();
  await page.getByRole('button', { name: /Iniciar examen final/i }).click();
  await page.locator('.questionBox').waitFor();
  await page.getByRole('button', { name: /Finalizar/i }).click();
  await page.getByRole('heading', { name: /Resultado del examen final/i }).waitFor();
  assert.equal(await page.getByRole('columnheader', { name: /Respuesta correcta/i }).count(), 0, 'El examen final no debe revelar el banco en la revisión.');
  await page.waitForFunction(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.final_exam_attempts === 1
  ));

  await page.evaluate(() => window.AcademyCloud.recordFinalExamCompletion('ctfl', {
    score: 100,
    earnedPoints: 40,
    totalPoints: 40,
    passingPoints: 26,
    correctAnswers: 40,
    totalQuestions: 40,
    durationSeconds: 1_800
  }));

  await page.locator('#app').getByRole('link', { name: 'Ver mi cuenta' }).click();
  await page.getByRole('heading', { name: /Mis cursos/i }).waitFor();
  await page.getByText('ISTQB® Certified Tester Foundation Level 4.0 (CTFL)').waitFor();
  const courseCard = page.locator('.accountCourseCard').filter({ hasText: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)' });
  const studyTime = courseCard.locator('.accountCourseMetrics > div').filter({ hasText: 'Tiempo estudiado' }).locator('dd');
  await studyTime.waitFor();
  assert.match((await studyTime.textContent()) || '', /^\d+ h(?: \d+ min)?$/, 'Mi cuenta debe mostrar horas reales de estudio del curso.');
  await page.getByText('Avance por capítulo', { exact: true }).click();
  await page.getByText(/C1 · Fundamentos de la Prueba/i).waitFor();
  await page.getByText(/Aprobado · 100%/i).waitFor();
  await page.getByText('Completado', { exact: true }).waitFor();
  const certificateButton = page.getByRole('button', { name: 'Obtener certificado de curso' });
  await certificateButton.waitFor();
  assert.equal(await certificateButton.isEnabled(), true, 'El certificado debe habilitarse al completar el 100%.');
  await certificateButton.click();
  await page.getByRole('heading', { name: /Tu certificado de curso está en camino/i }).waitFor();
  await page.getByText('Próximamente', { exact: true }).waitFor();
  await page.locator('.certificateComingSoonMedia img').waitFor();
  await page.getByRole('button', { name: 'Entendido' }).click();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancelar curso' }).click();
  await page.getByText('Cancelado', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.status
  )), 'cancelled');

  await page.getByRole('button', { name: 'Reactivar curso' }).click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.status
  )), 'completed');

  await page.getByRole('link', { name: 'Ir al inicio' }).click();
  await page.getByText('1 cursos inscritos', { exact: true }).waitFor();

  assert.deepEqual(errors, [], `Errores de navegador:\n${errors.join('\n')}`);
  console.log('Cloud account smoke OK: matrícula, tiempo, capítulos, simulacro, examen final, cuenta y progreso por inscripción.');
} finally {
  await browser.close();
}
