import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE_URL = process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/';
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));

assert.equal(manifest.id, '/');
assert.equal(manifest.start_url, '/');
assert.equal(manifest.scope, '/');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.lang, 'es-CO');
assert.match(manifest.name, /QAvance/);
assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any'));
assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable'));

for (const icon of manifest.icons) {
  const iconPath = path.join(ROOT, icon.src.replace(/^\//, ''));
  assert.ok((await fs.stat(iconPath)).size > 0, `No existe el icono ${icon.src}.`);
}

const generatedPages = [
  'index.html',
  'cursos/index.html',
  'ruta-aprendizaje/index.html',
  'contactanos/index.html',
  'legal/index.html',
  'mi-cuenta/index.html',
  'curso/ctfl/index.html'
];

for (const relativePath of generatedPages) {
  const html = await fs.readFile(path.join(ROOT, relativePath), 'utf8');
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest">/);
  assert.match(html, /<meta name="theme-color" content="#0b315d">/);
  assert.match(html, /<script defer src="\/assets\/js\/pwa\.js\?v=/);
  assert.match(html, /data-pwa-install hidden/);
}

const workerSource = await fs.readFile(path.join(ROOT, 'sw.js'), 'utf8');
assert.match(workerSource, /addEventListener\('install'/);
assert.match(workerSource, /addEventListener\('activate'/);
assert.match(workerSource, /addEventListener\('fetch'/);
assert.doesNotMatch(workerSource, /supabase/i, 'El service worker no debe cachear Supabase.');

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE_URL, { waitUntil: 'load' });
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    return { scope: ready.scope, active: Boolean(ready.active) };
  });
  assert.equal(registration.scope, new URL('/', BASE_URL).href);
  assert.equal(registration.active, true);
  assert.equal(await page.locator('[data-pwa-install]').count(), 1);
  assert.equal(await page.locator('[data-pwa-install]').isHidden(), true);

  await page.locator('[data-action="toggle-site-menu"]').click();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    Object.defineProperties(event, {
      prompt: { value: async () => {} },
      userChoice: { value: Promise.resolve({ outcome: 'dismissed' }) }
    });
    window.dispatchEvent(event);
  });
  const installButton = page.locator('[data-pwa-install]');
  await installButton.waitFor({ state: 'visible' });
  assert.match((await installButton.textContent()) || '', /Instalar app/);
  await installButton.click();
  await installButton.waitFor({ state: 'hidden' });

  const manifestResponse = await page.request.get(new URL('/manifest.webmanifest', BASE_URL).href);
  assert.equal(manifestResponse.status(), 200);
  const workerResponse = await page.request.get(new URL('/sw.js', BASE_URL).href);
  assert.equal(workerResponse.status(), 200);
} finally {
  await browser.close();
}

console.log('PWA smoke OK: manifiesto, iconos, instalaciÃ³n y service worker.');
