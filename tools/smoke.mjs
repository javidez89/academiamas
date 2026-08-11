import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/';
const version = process.env.ACADEMIAQA_VERSION || '2026-08-11-seo-analytics';
const url = `${baseUrl.replace(/\/$/, '')}/?v=${encodeURIComponent(version)}&smoke=${Date.now()}#inicio`;

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Prepárate para tu próxima certificación profesional/i }).waitFor();
  await page.locator('.newCoursesSlider picture').first().waitFor({ state: 'attached' });
  await page.locator('.newCoursesSlider picture source[type="image/avif"]').first().waitFor({ state: 'attached' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Abrir menú principal/i }).click();
  await page.getByRole('navigation', { name: /Menú principal/i }).locator('a', { hasText: 'Cursos' }).click();
  await page.getByRole('heading', { name: /^Cursos disponibles$/i }).waitFor();

  await page.getByRole('button', { name: /Entrar al curso/i }).first().click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();

  await page.getByRole('button', { name: /Practicar/i }).first().click();
  await page.getByRole('button', { name: /Modo estudio/i }).click();
  await page.locator('.questionBox').waitFor();

  await page.getByRole('button', { name: /Simulacro/i }).first().click();
  await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).click();
  await page.locator('.questionBox').waitFor();

  const optionLabels = await page.locator('.questionBox .opt b').allTextContents();
  assert.deepEqual(optionLabels, ['A.', 'B.', 'C.', 'D.'], 'Las letras deben seguir el orden visual de las opciones barajadas.');
  const firstExamIds = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('istqb_ctfl_v2_progress') || '{}');
    return (progress.questionHistory || [])
      .filter((entry) => entry.mode === 'official-exam')
      .slice(-40)
      .map((entry) => entry.id);
  });
  assert.equal(firstExamIds.length, 40, 'El primer simulacro debe registrar 40 preguntas.');

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(mobileOverflow <= 1, `La vista movil tiene ${mobileOverflow}px de desbordamiento horizontal.`);

  await page.goto(`${baseUrl.replace(/\/$/, '')}/curso/ctfl/simulacro/?v=${encodeURIComponent(version)}&smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).click();
  await page.locator('.questionBox').waitFor();
  const secondExamIds = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('istqb_ctfl_v2_progress') || '{}');
    return (progress.questionHistory || [])
      .filter((entry) => entry.mode === 'official-exam')
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
