import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const now = '2026-08-28T12:00:00.000Z';
const enrollment = (courseKey) => ({
  course_key: courseKey,
  status: 'active',
  started_at: now,
  last_activity_at: now,
  estimated_hours: 18,
  study_seconds: 0,
  simulator_attempts: 0,
  practice_answers: 0,
  best_simulator_score: 0,
  final_exam_attempts: 0,
  best_final_exam_score: 0,
  final_exam_passed: false
});
const historicalProgress = (courseKey, chapters) => ({
  course_key: courseKey,
  schema_version: 5,
  source_updated_at: now,
  captured_at: now,
  verified: false,
  label: 'Histórico no verificado',
  enrollment: enrollment(courseKey),
  progress: {
    _schema: 5,
    studySeconds: Object.keys(chapters).length * 100_000,
    attempts: [],
    marked: [],
    questionResults: {},
    chapterActivity: Object.fromEntries(Object.keys(chapters).map((chapterId) => [chapterId, {
      studySeconds: 100_000,
      visitedAt: now,
      lastStudiedAt: now
    }]))
  }
});

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION, [enrollment('ctfl'), enrollment('scrum-master')], {
    legacyProgress: [
      historicalProgress('ctfl', { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }),
      historicalProgress('scrum-master', { 1: true })
    ]
  });

  await page.goto(`${BASE_URL}/mi-cuenta/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Mis cursos' }).waitFor();

  const ctfl = page.locator('.accountCourseCard').filter({ hasText: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)' });
  await ctfl.getByText('Histórico no verificado', { exact: true }).waitFor();
  assert.match(await ctfl.innerText(), /Avance histórico 38%/i,
    'El avance previo superior al 10% debe permanecer visible como histórico.');
  assert.match(await ctfl.innerText(), /Avance oficial 0%/i,
    'El avance verificable debe mostrarse por separado.');
  assert.match(await ctfl.innerText(), /no habilita examen ni constancia/i,
    'La interfaz debe explicar que el histórico no concede elegibilidad.');
  assert.equal(await ctfl.getByRole('button', { name: /Certificado disponible al 100%/i }).isDisabled(), true,
    'El histórico no debe habilitar la constancia.');
  assert.match(await ctfl.locator('.accountFinalStatus').innerText(), /Bloqueado.*avance oficial 0%.*histórico conservado 38%/i,
    'El examen final debe depender solamente del avance oficial.');

  const scrum = page.locator('.accountCourseCard').filter({ hasText: 'Scrum Master' });
  assert.equal(await scrum.getByText('Histórico no verificado', { exact: true }).count(), 0,
    'Un histórico de 10% o menos no debe sustituir el avance verificable.');
  assert.match(await scrum.innerText(), /Avance verificado 0%/i,
    'El curso bajo el umbral debe conservar el indicador oficial.');

  await ctfl.getByRole('link', { name: /Continuar curso/i }).click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  const dashboard = page.locator('.card').filter({ hasText: 'Panel de estudio' }).first();
  assert.match(await dashboard.innerText(), /Avance verificado\s+0%/i,
    'El panel del curso debe presentar el avance verificado como métrica oficial.');
  assert.match(await dashboard.innerText(), /Histórico conservado\s+38%/i,
    'El panel del curso debe separar claramente el histórico conservado.');
  assert.match(await dashboard.innerText(), /no modifica el avance oficial/i,
    'El histórico debe explicar que no altera el avance oficial.');

  console.log('Legacy progress smoke OK: history >10% is preserved, labelled and never grants official eligibility.');
} finally {
  await browser.close();
}
