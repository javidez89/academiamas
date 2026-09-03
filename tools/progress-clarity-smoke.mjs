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

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION, [enrollment]);
  await page.goto(`${baseUrl}/curso/ctfl/practica/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Práctica personalizada' }).waitFor();

  await page.locator('#fChapter').selectOption('1');
  await page.getByRole('button', { name: 'Comenzar práctica con retroalimentación' }).click();
  await page.locator('.qtitle').waitFor();

  const answeredQuestion = await page.evaluate(() => {
    const questionId = document.querySelector('.qhead .pill')?.textContent?.trim();
    const question = window.AcademyRegistry.get('ctfl').questions.find((item) => item.id === questionId);
    if (!question) throw new Error('No se encontró la pregunta activa.');
    question.correct.forEach((index) => {
      document.querySelector(`.opt[data-option-index="${index}"]`)?.click();
    });
    return { id: question.id, correct: question.correct, chapter: Number(question.chapter) };
  });

  await page.getByRole('button', { name: 'Comprobar respuesta' }).click();
  const confirmation = page.locator('#verifiedAnswerStatus');
  await confirmation.waitFor({ state: 'visible' });
  await confirmation.filter({ hasText: /guardada|confirmado/i }).waitFor();
  assert.match(await confirmation.textContent(), /1\/.+preguntas dominadas/i, 'La confirmación debe mostrar el logro oficial actualizado.');

  const firstDashboard = await page.evaluate(() => window.AcademyCloud.getVerifiedLearningDashboard());
  const firstChapter = firstDashboard.courses
    .find((item) => item.course_key === 'ctfl')
    .chapters.find((item) => Number(item.chapter_id) === 1);
  assert.equal(firstChapter.unique_answered, 1, 'La respuesta confirmada debe aparecer en el resumen oficial.');
  assert.equal(firstChapter.unique_correct, 1, 'El acierto debe crear un único logro verificable.');
  assert.equal(firstChapter.practice_complete, false, 'Una sola pregunta no debe completar el capítulo.');

  const repeatedDashboard = await page.evaluate(async ({ questionId, selectedIndices, chapterId }) => {
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'practice', { chapterId });
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, [questionId]);
    await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, questionId, selectedIndices);
    return window.AcademyCloud.getVerifiedLearningDashboard();
  }, {
    questionId: answeredQuestion.id,
    selectedIndices: answeredQuestion.correct,
    chapterId: answeredQuestion.chapter
  });
  const repeatedChapter = repeatedDashboard.courses
    .find((item) => item.course_key === 'ctfl')
    .chapters.find((item) => Number(item.chapter_id) === 1);
  assert.equal(repeatedChapter.unique_answered, 1, 'Repetir una pregunta no debe ampliar la cobertura única.');
  assert.equal(repeatedChapter.unique_correct, 1, 'Repetir un acierto no debe duplicar el logro.');

  await page.locator('[data-view="study"]').first().click();
  await page.getByRole('heading', { name: 'Estudiar syllabus por capítulo' }).waitFor();
  const chapterCard = page.locator('.chapterCard').filter({ hasText: 'Capítulo 1' }).first();
  await chapterCard.getByText('En progreso', { exact: true }).waitFor();
  await chapterCard.getByText(`1/${firstChapter.question_count}`, { exact: true }).first().waitFor();
  await page.getByText(`0/${firstDashboard.courses.find((item) => item.course_key === 'ctfl').chapter_count}`, { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileOverflow <= 1, `El resumen móvil no debe generar desbordamiento horizontal (${mobileOverflow}px).`);

  const offlinePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await useMockedSupabase(offlinePage, MOCK_SESSION, [enrollment], { verifiedAnswerFailures: 1 });
  await offlinePage.goto(`${baseUrl}/curso/ctfl/practica/`, { waitUntil: 'domcontentloaded' });
  await offlinePage.getByRole('heading', { name: 'Práctica personalizada' }).waitFor();
  await offlinePage.locator('#fChapter').selectOption('1');
  await offlinePage.getByRole('button', { name: 'Comenzar práctica con retroalimentación' }).click();
  await offlinePage.locator('.qtitle').waitFor();
  await offlinePage.evaluate(() => {
    const questionId = document.querySelector('.qhead .pill')?.textContent?.trim();
    const question = window.AcademyRegistry.get('ctfl').questions.find((item) => item.id === questionId);
    question.correct.forEach((index) => document.querySelector(`.opt[data-option-index="${index}"]`)?.click());
  });
  await offlinePage.getByRole('button', { name: 'Comprobar respuesta' }).click();
  await offlinePage.locator('#verifiedAnswerStatus.pending').waitFor();
  assert.match(await offlinePage.locator('#verifiedAnswerStatus').textContent(), /pendiente de sincronización/i,
    'Una interrupción debe informar que la respuesta sigue pendiente.');

  console.log('Progress clarity smoke OK: confirmación visible, resumen inmediato, estado pendiente y logros sin duplicados.');
} finally {
  await browser.close();
}
