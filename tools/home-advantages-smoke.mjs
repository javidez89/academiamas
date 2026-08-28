import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/';
const SCREENSHOT_DIR = process.env.ACADEMIAQA_SCREENSHOT_DIR || '';
const browser = await chromium.launch({ headless: true });

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 1000 }
];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await useMockedSupabase(page, null);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#authControl')?.dataset.authState === 'anonymous');

    const section = page.locator('.homeCourseAdvantages');
    await section.getByRole('heading', { name: 'Una ruta completa para avanzar' }).waitFor();
    assert.equal(await section.locator('.studyPathGrid article').count(), 4);
    assert.equal(await section.getByText('Lee o escucha los capítulos', { exact: true }).isVisible(), true);
    assert.equal(await section.getByText('Simula, aprueba y valida', { exact: true }).isVisible(), true);
    assert.equal(await section.locator('.homeAchievementFeature').count(), 1);
    assert.equal(await section.locator('.homeReferenceMedia img').count(), 1);
    assert.equal(await section.getByText('Practica con intención', { exact: true }).count(), 0);
    assert.equal(await section.getByText('Estudia sin costo', { exact: true }).count(), 0);
    assert.equal(await section.getByText('Comparte tu logro', { exact: true }).isVisible(), true);
    assert.equal(await section.getByText('Descárgala en formato PDF.', { exact: true }).isVisible(), true);
    assert.equal(await section.getByText('Compártela directamente en LinkedIn.', { exact: true }).isVisible(), true);
    assert.equal(await section.getByText('Envía su enlace público para verificarla.', { exact: true }).isVisible(), true);
    assert.equal(
      await section.getByText('Elige tu curso, lee o escucha cada capítulo, practica por objetivo y presenta el examen final. Cuando apruebes, podrás emitir opcionalmente una constancia digital verificable.', { exact: true }).isVisible(),
      true
    );

    const coursesLink = section.getByRole('link', { name: 'Explorar cursos', exact: true });
    assert.equal(await coursesLink.getAttribute('href'), '/cursos/');
    assert.equal(await coursesLink.getAttribute('data-view'), 'courses');
    assert.equal((await section.innerText()).includes('USD 25'), false);
    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.homeReferenceMedia img')].every((image) => image.complete && image.naturalWidth > 0));
    assert.equal(await section.locator('.homeReferenceMedia img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true);
    assert.equal(await page.evaluate(() => {
      const courses = document.querySelector('#home-cursos-disponibles');
      const journey = document.querySelector('.homeCourseAdvantages');
      return Boolean(courses && journey && (courses.compareDocumentPosition(journey) & Node.DOCUMENT_POSITION_FOLLOWING));
    }), true, 'La ruta completa debe aparecer después de Cursos disponibles.');

    const renderedColumns = await section.locator('.homeAchievementFeature').evaluate((element) => (
      getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length
    ));
    assert.equal(renderedColumns, viewport.name === 'mobile' ? 1 : 2, `El bloque de logro ${viewport.name} no tiene las columnas esperadas.`);

    const pageText = await page.locator('body').innerText();
    assert.equal(pageText.includes('PEDRO MENDEZ'), false);
    assert.equal(pageText.includes('106546565'), false);

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth
    }));
    assert.ok(overflow.document <= overflow.viewport + 1, `Hay desbordamiento horizontal en ${viewport.name}: ${JSON.stringify(overflow)}`);

    if (SCREENSHOT_DIR) {
      await section.screenshot({ path: `${SCREENSHOT_DIR}/home-advantages-${viewport.name}.png` });
    }

    await page.goto(new URL('curso/ctfl/', BASE_URL).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#authControl')?.dataset.authState === 'anonymous');
    await page.locator('.courseAuthGate').waitFor();
    const courseEntryText = await page.locator('body').innerText();
    assert.equal(await page.locator('.ctflConversion').count(), 0);
    for (const removedText of ['Preparación práctica', 'Entrena como presentarás el examen', 'Valida y comparte tu logro', '$25 USD']) {
      assert.equal(courseEntryText.includes(removedText), false, `La entrada CTFL conserva el texto retirado: ${removedText}`);
    }
    if (SCREENSHOT_DIR && viewport.name === 'desktop') {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/course-entry-clean.png`, fullPage: true });
    }

    assert.deepEqual(consoleErrors, [], `Errores de consola en ${viewport.name}: ${consoleErrors.join(' | ')}`);
    await page.close();
  }

  console.log('Home journey smoke OK: recorrido unificado, logro compartible, orden, privacidad y responsive.');
} finally {
  await browser.close();
}
