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
  await useMockedSupabase(page, MOCK_SESSION, [enrollment], { verifiedAnswerFailures: 1 });
  await page.goto(`${baseUrl}/curso/ctfl/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();

  const result = await page.evaluate(async () => {
    const question = window.AcademyRegistry.get('ctfl').questions.find((item) => Number(item.chapter) === 1);
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'practice', { chapterId: 1 });
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, [question.id]);
    let firstError = '';
    try {
      await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, question.id, question.correct);
    } catch (error) {
      firstError = error?.message || String(error);
    }
    const queueKey = Object.keys(localStorage).find((key) => key.startsWith('qavance_pending_verified_answers_v1_'));
    const queuedBefore = JSON.parse(localStorage.getItem(queueKey) || '[]').length;
    const flushed = await window.AcademyCloud.flushPendingVerifiedAnswers();
    const queuedAfter = JSON.parse(localStorage.getItem(queueKey) || '[]').length;
    const completed = await window.AcademyCloud.completeVerifiedAssessment(attempt.attemptId);
    return { firstError, queuedBefore, queuedAfter, flushed, completed };
  });

  assert.match(result.firstError, /Network request failed/i, 'La primera interrupción debe llegar al llamador.');
  assert.equal(result.queuedBefore, 1, 'La respuesta debe quedar en una cola durable antes de enviarse.');
  assert.deepEqual(result.flushed, { submitted: 1, rejected: 0, remaining: 0 }, 'La cola debe reenviar la respuesta al recuperar conexión.');
  assert.equal(result.queuedAfter, 0, 'La respuesta confirmada debe salir de la cola.');
  assert.equal(result.completed.answered_count, 1, 'El intento solo puede cerrarse después de sincronizar la respuesta.');

  console.log('Progress reliability smoke OK: respuesta recuperada tras fallo de red y cierre consistente.');
} finally {
  await browser.close();
}
