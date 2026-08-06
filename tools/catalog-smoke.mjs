import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');

async function loadCatalog() {
  const source = await fs.readFile(`${ROOT}/courses/catalog.js`, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'courses/catalog.js' });
  return sandbox.window.ACADEMY_CATALOG;
}

const catalog = await loadCatalog();
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${page.url()} console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${page.url()} pageerror: ${error.message}`));

  for (const entry of catalog) {
    const key = encodeURIComponent(entry.key);
    await page.goto(`${BASE_URL}/curso/${key}/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();

    const loaded = await page.evaluate((courseKey) => {
      const course = window.AcademyRegistry?.get(courseKey);
      return course ? {
        chapters: course.chapters?.length || 0,
        objectives: course.objectives?.length || 0,
        questions: course.questions?.length || 0
      } : null;
    }, entry.key);

    assert.ok(loaded, `El curso ${entry.key} no se registró.`);
    assert.equal(loaded.chapters, entry.counts.chapters, `Capítulos inconsistentes en ${entry.key}.`);
    assert.equal(loaded.objectives, entry.counts.objectives, `Objetivos inconsistentes en ${entry.key}.`);
    assert.equal(loaded.questions, entry.counts.questions, `Preguntas inconsistentes en ${entry.key}.`);

    await page.goto(`${BASE_URL}/curso/${key}/simulacro/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).waitFor();
  }

  assert.deepEqual(errors, [], `Errores de navegador:\n${errors.join('\n')}`);
} finally {
  await browser.close();
}

console.log(`Catalog smoke OK: ${catalog.length} cursos y simulacros validados.`);
