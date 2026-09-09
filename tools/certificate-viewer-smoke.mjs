import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { useMockedSupabase } from './helpers/mock-supabase.mjs';

const base = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
const certificate = {
  certificate_code: 'ACQA-123456789ABC', full_name: 'Nombre del estudiante',
  course_key: 'ctfl', course_name: 'Curso de Preparación para ISTQB® CTFL 4.0',
  status: 'VALID', public_pdf: true, estimated_hours: 40,
  started_at: '2026-08-01T15:00:00Z', completed_at: '2026-08-25T15:00:00Z', issued_at: '2026-08-25T15:00:00Z',
  preview_url: `${base}/certificate-preview-test.pdf`, download_url: `${base}/certificate-download-test.pdf`
};
const bytes = await fs.readFile(new URL('../output/pdf/Constancia-QAvance-Muestra.pdf', import.meta.url));
await fs.mkdir('tmp/certificate-viewer', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error' || message.type() === 'warning') console.log(message.text()); });
    await useMockedSupabase(page, null, [], { certificates: [certificate] });
    await page.route('**/certificate-*-test.pdf', (route) => route.fulfill({
      contentType: 'application/pdf', body: bytes,
      headers: route.request().url().includes('download') ? { 'content-disposition': 'attachment; filename="certificate.pdf"' } : {}
    }));
    await page.goto(`${base}/validar-certificado/?codigo=${certificate.certificate_code}`);
    await page.getByRole('heading', { name: certificate.full_name, exact: true }).waitFor();
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.credentialCanvasArea canvas');
      return canvas && !canvas.hidden && document.querySelector('[data-preview-status]').hidden;
    }).catch(async (error) => { console.log(await page.locator('[data-public-certificate]').innerText()); throw error; });
    const pixelCheck = await page.locator('canvas').evaluate((canvas) => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let dark = 0; for (let i = 0; i < pixels.length; i += 16) if (pixels[i] < 180 && pixels[i + 3]) dark++;
      return dark;
    });
    assert.ok(pixelCheck > 100, 'El certificado debe tener contenido visible.');
    await page.locator('[data-public-certificate]').screenshot({ path: `tmp/certificate-viewer/desktop-${width}.png` });
    await page.getByRole('tab', { name: 'Contenido académico' }).click();
    await page.waitForFunction(() => document.querySelector('[data-page-label]')?.textContent === '2 / 2');
    assert.equal(await page.getByRole('tab', { name: 'Contenido académico' }).getAttribute('aria-selected'), 'true');
    await page.getByRole('button', { name: 'Aumentar zoom' }).click();
    assert.equal(await page.locator('[data-zoom-label]').textContent(), '125%');
    await page.getByRole('button', { name: 'Copiar enlace', exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), `https://academiaqaoficial.com/validar-certificado/?codigo=${certificate.certificate_code}`);
    const linkedin = new URL(await page.getByRole('link', { name: 'Añadir a mi perfil de LinkedIn' }).getAttribute('href'));
    assert.equal(linkedin.searchParams.get('certId'), certificate.certificate_code);
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PDF', exact: true }).click();
    const download = await downloadEvent;
    assert.equal(await download.failure(), null);
    assert.ok((await fs.stat(await download.path())).size > 10000);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Sin desbordamiento horizontal.');
    assert.deepEqual(errors, []);
    await context.close();
  }
  const invalid = await browser.newPage();
  await useMockedSupabase(invalid, null, [], { certificates: [{ ...certificate, status: 'REVOKED' }] });
  await invalid.goto(`${base}/validar-certificado/?codigo=${certificate.certificate_code}`);
  await invalid.getByRole('heading', { name: 'Certificado no válido o no encontrado' }).waitFor();
  assert.equal(await invalid.locator('canvas, [data-tool="download"]').count(), 0);
  console.log('Certificate viewer OK: PDF real, móvil, escritorio, páginas, zoom, compartir, descarga y revocación.');
} finally { await browser.close(); }
