import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const catalogContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.resolve('courses/catalog.js'), 'utf8'), catalogContext);
const catalog = Array.from(catalogContext.window.ACADEMY_CATALOG || []);
const COURSES = catalog.map((entry) => String(entry.key));
const ISTQB_COURSES = new Set(catalog.filter((entry) => entry.family === 'ISTQB').map((entry) => String(entry.key)));
assert.ok(COURSES.length > 0, 'El catálogo debe incluir al menos un curso para la validación visual.');
const browser = await chromium.launch({ headless: true });
const screenshots = [];

async function openFirstChapter(viewport, label, takeScreenshot = false) {
  const page = await browser.newPage({ viewport });
  await useMockedSupabase(page, MOCK_SESSION);
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  for (const courseKey of COURSES) {
    await page.goto(`${BASE_URL}/curso/${courseKey}/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Inscribirme al curso/i }).click();
    await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
    await page.locator('[data-view="study"]').first().click();
    await page.locator('.chapterCard').first().click();
    await page.locator('#chapterDetail .narrationControls').first().waitFor();

    const layout = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const overflow = [...document.querySelectorAll('#chapterDetail *')]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > viewportWidth + 1);
        })
        .slice(0, 5)
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          className: element.className,
          text: (element.textContent || '').trim().slice(0, 80)
        }));
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth,
        overflow,
        narrationControls: document.querySelectorAll('#chapterDetail .narrationControls').length,
        narrationTimelines: document.querySelectorAll('#chapterDetail [data-narration-seek]').length,
        referenceAudioControls: document.querySelectorAll('#chapterDetail [data-narration-controls*="-reference-"]').length,
        readingControls: document.querySelectorAll('#chapterDetail .readingSizeControls').length,
        caseStudies: document.querySelectorAll('#chapterDetail .courseCaseStudy').length,
        sourceBlocks: document.querySelectorAll('#chapterDetail .sourceStatement').length,
        referenceWhiteSpace: getComputedStyle(document.querySelector('#chapterDetail .referenceReading')).whiteSpace
      };
    });

    assert.ok(layout.narrationControls >= 2, `${label}/${courseKey}: faltan controles de voz de capítulo o LO.`);
    assert.equal(layout.narrationTimelines, layout.narrationControls, `${label}/${courseKey}: cada narración debe incluir su barra de avance.`);
    assert.ok(layout.referenceAudioControls >= 1, `${label}/${courseKey}: el material ampliado no incluye narración.`);
    assert.equal(layout.readingControls, 1, `${label}/${courseKey}: falta el control accesible de tamaño de texto.`);
    assert.equal(layout.referenceWhiteSpace, 'normal', `${label}/${courseKey}: el contenido de referencia no aprovecha el ancho disponible.`);
    assert.ok(layout.caseStudies >= 1, `${label}/${courseKey}: falta el escenario práctico.`);
    if (ISTQB_COURSES.has(courseKey)) {
      assert.ok(layout.sourceBlocks >= 1, `${label}/${courseKey}: falta el extracto literal del syllabus.`);
    }
    assert.ok(layout.documentWidth <= layout.viewportWidth + 1, `${label}/${courseKey}: la página tiene desbordamiento horizontal.`);
    assert.deepEqual(layout.overflow, [], `${label}/${courseKey}: hay elementos fuera del viewport.`);

    if (takeScreenshot && courseKey === 'ctfl') {
      const file = path.join(os.tmpdir(), `academiaqa-capitulo-${label}.png`);
      await page.locator('#chapterDetail').scrollIntoViewIfNeeded();
      await page.screenshot({ path: file, fullPage: false });
      screenshots.push(file);

      const reference = page.locator('#chapterDetail details.contentDetails').filter({ hasText: 'Material de estudio ampliado' });
      await reference.locator('summary').click();
      await reference.scrollIntoViewIfNeeded();
      const referenceFile = path.join(os.tmpdir(), `academiaqa-referencia-${label}.png`);
      await reference.screenshot({ path: referenceFile });
      screenshots.push(referenceFile);
    }
  }

  assert.deepEqual(errors, [], `${label}: hubo errores en consola.`);
  await page.close();
}

try {
  await openFirstChapter({ width: 1440, height: 1000 }, 'desktop', true);
  await openFirstChapter({ width: 390, height: 844 }, 'mobile', true);
  console.log(`Visual de capítulos OK: ${COURSES.length} cursos en escritorio y móvil.`);
  for (const file of screenshots) console.log(`Captura: ${file}`);
} finally {
  await browser.close();
}
