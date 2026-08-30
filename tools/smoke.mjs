import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';
import { completeCourseStudy, seedVerifiedCourseStudy } from './helpers/learning-progress.mjs';

const baseUrl = process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/';
const version = process.env.ACADEMIAQA_VERSION || '2026-08-25-community-metrics-only';
const url = `${baseUrl.replace(/\/$/, '')}/?v=${encodeURIComponent(version)}&smoke=${Date.now()}#inicio`;

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION);
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Prepárate para tu próxima certificación profesional/i }).waitFor();
  await page.locator('.newCoursesSlider picture').first().waitFor({ state: 'attached' });
  await page.locator('.newCoursesSlider picture source[type="image/avif"]').first().waitFor({ state: 'attached' });
  const backToTop = page.getByRole('button', { name: /Volver al inicio/i });
  assert.equal(await backToTop.isHidden(), true, 'Volver arriba debe permanecer oculto al inicio.');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await backToTop.waitFor({ state: 'visible' });
  await backToTop.click();
  await page.waitForFunction(() => window.scrollY < 5);
  assert.equal(await backToTop.isHidden(), true, 'Volver arriba debe ocultarse después de regresar al inicio.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Abrir menú principal/i }).click();
  await page.getByRole('navigation', { name: /Menú principal/i }).locator('a', { hasText: 'Cursos' }).click();
  await page.getByRole('heading', { name: /^Cursos disponibles$/i }).waitFor();

  await page.getByRole('button', { name: /Entrar al curso/i }).first().click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();

  await page.getByRole('button', { name: /Practicar/i }).first().click();
  assert.equal(await page.locator('.questionBox').count(), 0, 'La práctica no debe iniciar antes de elegir su configuración.');
  await page.getByRole('button', { name: /Comenzar práctica con retroalimentación/i }).click();
  await page.locator('.questionBox').waitFor();

  await page.getByRole('button', { name: /Simulacro/i }).first().click();
  assert.equal(await page.getByText(/Simulacro aleatorio libre/i).count(), 0, 'No debe existir un segundo modo de simulacro.');
  await page.getByRole('button', { name: /^Iniciar simulacro$/i }).click();
  await page.locator('.questionBox').waitFor();

  const optionLabels = await page.locator('.questionBox .opt b').allTextContents();
  assert.deepEqual(optionLabels, ['A.', 'B.', 'C.', 'D.'], 'Las letras deben seguir el orden visual de las opciones barajadas.');
  const firstExamIds = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('istqb_ctfl_v2_progress') || '{}');
    return (progress.questionHistory || [])
      .filter((entry) => entry.mode === 'simulator')
      .slice(-40)
      .map((entry) => entry.id);
  });
  assert.equal(firstExamIds.length, 40, 'El primer simulacro debe registrar 40 preguntas.');

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileOverflow <= 1, `La vista movil tiene ${mobileOverflow}px de desbordamiento horizontal.`);

  await page.goto(`${baseUrl.replace(/\/$/, '')}/curso/ctfl/examen-final/?v=${encodeURIComponent(version)}&smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Completa primero el 95% del curso/i }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Iniciar examen final/i }).count(), 0, 'El examen final no debe iniciar antes del 95%.');
  await completeCourseStudy(page, 'ctfl');
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.getByRole('button', { name: /Iniciar examen final/i }).count(), 0,
    'El avance local manipulado no debe desbloquear el examen final.');
  await seedVerifiedCourseStudy(page, 'ctfl');
  await page.getByRole('button', { name: /Iniciar examen final/i }).click();
  await page.locator('.questionBox').waitFor();
  const finalExamOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(finalExamOverflow <= 1, `El examen final móvil tiene ${finalExamOverflow}px de desbordamiento horizontal.`);

  await page.goto(`${baseUrl.replace(/\/$/, '')}/curso/ctfl/simulacro/?v=${encodeURIComponent(version)}&smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Iniciar simulacro$/i }).click();
  await page.locator('.questionBox').waitFor();
  const secondExamIds = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('istqb_ctfl_v2_progress') || '{}');
    return (progress.questionHistory || [])
      .filter((entry) => entry.mode === 'simulator')
      .slice(-40)
      .map((entry) => entry.id);
  });
  assert.equal(secondExamIds.length, 40, 'El segundo simulacro debe registrar 40 preguntas.');
  assert.equal(firstExamIds.filter((id) => secondExamIds.includes(id)).length, 0, 'Dos simulacros CTFL consecutivos no deben repetir preguntas.');

  if (errors.length) {
    throw new Error(`Consola con errores:\n${errors.join('\n')}`);
  }

  console.log('Smoke OK:', url);
} finally {
  await browser.close();
}
