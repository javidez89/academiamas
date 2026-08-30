import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION);

  await page.goto(`${BASE_URL}/curso/ctfl/capitulo/1/`, { waitUntil: 'domcontentloaded' });
  await page.locator('.chapterReading h2').filter({ hasText: /^Capítulo 1/i }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.chapterReading h2').filter({ hasText: /^Capítulo 1/i }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/curso/ctfl/capitulo/1/',
    'Recargar un capítulo debe conservar la ruta actual.');

  await page.getByRole('button', { name: /^Practicar capítulo$/i }).click();
  await page.locator('.questionBox').waitFor();
  assert.equal(new URL(page.url()).pathname, '/curso/ctfl/practica/',
    'Iniciar una práctica desde el capítulo debe actualizar la URL rastreable.');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /^Práctica personalizada$/i }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/curso/ctfl/practica/',
    'Recargar durante una práctica debe volver a la sección de práctica.');

  await page.goto(`${BASE_URL}/curso/ctfl/simulacro/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Iniciar simulacro$/i }).click();
  await page.locator('.questionBox').waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Iniciar simulacro$/i }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/curso/ctfl/simulacro/',
    'Recargar el simulacro debe conservar su sección.');

  console.log('Route refresh smoke OK: chapter, practice and simulator paths survive reloads.');
} finally {
  await browser.close();
}
