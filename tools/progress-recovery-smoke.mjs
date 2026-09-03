import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const baseUrl = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const now = new Date().toISOString();
const enrollment = {
  course_key: 'ctfl', status: 'active', started_at: now, last_activity_at: now,
  estimated_hours: 20, study_seconds: 0, verified_study_seconds: 0,
  simulator_attempts: 0, practice_answers: 0, best_simulator_score: 0,
  final_exam_attempts: 0, best_final_exam_score: 0, final_exam_passed: false
};

async function queueFailedAnswer(page, questionIndex) {
  return page.evaluate(async (index) => {
    const questions = window.AcademyRegistry.get('ctfl').questions.filter((item) => Number(item.chapter) === 1);
    const question = questions[index];
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'practice', { chapterId: 1 });
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, [question.id]);
    window.__supabaseMock.verifiedAnswerFailures = 1;
    let error = '';
    try {
      await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, question.id, question.correct);
    } catch (caught) {
      error = caught?.message || String(caught);
    }
    return {
      error,
      questionId: question.id,
      pending: window.AcademyCloud.getPendingVerifiedAnswerCount()
    };
  }, questionIndex);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION, [enrollment]);
  await page.goto(`${baseUrl}/curso/ctfl/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();

  const onlinePending = await queueFailedAnswer(page, 0);
  assert.match(onlinePending.error, /Network request failed/i);
  assert.equal(onlinePending.pending, 1, 'La interrupción debe conservar la respuesta localmente.');
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForFunction(() => window.AcademyCloud.getPendingVerifiedAnswerCount() === 0);
  await page.locator('#appNotice.success').filter({ hasText: /sincronizada correctamente/i }).waitFor();

  const onlineDashboard = await page.evaluate(() => window.AcademyCloud.getVerifiedLearningDashboard());
  const onlineChapter = onlineDashboard.courses.find((item) => item.course_key === 'ctfl').chapters
    .find((item) => Number(item.chapter_id) === 1);
  assert.equal(onlineChapter.unique_correct, 1, 'La reconexión debe actualizar el logro oficial una sola vez.');

  const reloadPending = await queueFailedAnswer(page, 1);
  assert.equal(reloadPending.pending, 1, 'La segunda respuesta debe quedar pendiente antes de F5.');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  await page.waitForFunction(() => window.AcademyCloud.getPendingVerifiedAnswerCount() === 0);
  await page.locator('#appNotice.success').filter({ hasText: /sincronizada correctamente/i }).waitFor();
  const reloadDashboard = await page.evaluate(() => window.AcademyCloud.getVerifiedLearningDashboard());
  const reloadChapter = reloadDashboard.courses.find((item) => item.course_key === 'ctfl').chapters
    .find((item) => Number(item.chapter_id) === 1);
  assert.equal(reloadChapter.unique_correct, 2, 'F5 debe recuperar la respuesta sin borrar el primer logro.');

  const concurrent = await page.evaluate(async () => {
    const question = window.AcademyRegistry.get('ctfl').questions.filter((item) => Number(item.chapter) === 1)[2];
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'practice', { chapterId: 1 });
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, [question.id]);
    window.__supabaseMock.verifiedAnswerFailures = 1;
    try {
      await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, question.id, question.correct);
    } catch {}
    const before = window.__supabaseMock.verifiedAssessmentCalls
      .filter((item) => item.name === 'submit_verified_answer').length;
    const results = await Promise.all([
      window.AcademyCloud.flushPendingVerifiedAnswers(),
      window.AcademyCloud.flushPendingVerifiedAnswers(),
      window.AcademyCloud.flushPendingVerifiedAnswers()
    ]);
    const after = window.__supabaseMock.verifiedAssessmentCalls
      .filter((item) => item.name === 'submit_verified_answer').length;
    return { before, after, results, pending: window.AcademyCloud.getPendingVerifiedAnswerCount() };
  });
  assert.equal(concurrent.after - concurrent.before, 1, 'Los reintentos simultáneos deben compartir una sola ejecución.');
  assert.equal(concurrent.pending, 0);
  concurrent.results.forEach((result) => assert.deepEqual(result, { submitted: 1, rejected: 0, remaining: 0 }));

  const terminalPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await useMockedSupabase(terminalPage, MOCK_SESSION, [enrollment], { verifiedAnswerTerminalFailures: 1 });
  await terminalPage.goto(`${baseUrl}/curso/ctfl/practica/`, { waitUntil: 'domcontentloaded' });
  await terminalPage.getByRole('heading', { name: 'Práctica personalizada' }).waitFor();
  await terminalPage.locator('#fChapter').selectOption('1');
  await terminalPage.getByRole('button', { name: 'Comenzar práctica con retroalimentación' }).click();
  await terminalPage.locator('.qtitle').waitFor();
  await terminalPage.evaluate(() => {
    const questionId = document.querySelector('.qhead .pill')?.textContent?.trim();
    const question = window.AcademyRegistry.get('ctfl').questions.find((item) => item.id === questionId);
    question.correct.forEach((index) => document.querySelector(`.opt[data-option-index="${index}"]`)?.click());
  });
  await terminalPage.getByRole('button', { name: 'Comprobar respuesta' }).click();
  await terminalPage.locator('#verifiedAnswerStatus.rejected').waitFor();
  assert.match(await terminalPage.locator('#verifiedAnswerStatus').textContent(), /intento ya no era válido/i);
  assert.equal(await terminalPage.evaluate(() => window.AcademyCloud.getPendingVerifiedAnswerCount()), 0,
    'Un rechazo definitivo no debe permanecer como pendiente falso.');

  console.log('Progress recovery smoke OK: reconexión, F5, concurrencia y rechazo terminal verificados.');
} finally {
  await browser.close();
}
