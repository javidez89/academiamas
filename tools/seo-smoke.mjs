import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PROD_BASE = 'https://academiaqaoficial.com';
const LOCAL_BASE = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');

function decodeXml(value = '') {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function parseAttributes(tag = '') {
  const attributes = {};
  const pattern = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  for (const match of tag.matchAll(pattern)) attributes[match[1].toLowerCase()] = match[3];
  return attributes;
}

function findTag(html, tagName, expectedAttributes) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [];
  for (const tag of tags) {
    const attributes = parseAttributes(tag);
    const matches = Object.entries(expectedAttributes).every(([name, value]) => (
      attributes[name.toLowerCase()]?.toLowerCase() === value.toLowerCase()
    ));
    if (matches) return attributes;
  }
  return null;
}

function titleOf(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
}

function expectedPaths(catalog) {
  const publicPaths = ['/cursos/', '/ruta-aprendizaje/', '/contactanos/', '/legal/'];
  const coursePaths = catalog.flatMap(({ key }) => [
    `/curso/${encodeURIComponent(key)}/`,
    `/curso/${encodeURIComponent(key)}/simulacro/`
  ]);
  return [...publicPaths, ...coursePaths];
}

async function loadCatalog() {
  const source = await fs.readFile(`${ROOT}/courses/catalog.js`, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'courses/catalog.js' });
  const catalog = sandbox.window.ACADEMY_CATALOG;
  assert.ok(Array.isArray(catalog) && catalog.length > 0, 'El catálogo no contiene cursos.');
  return catalog;
}

function validatePageMetadata(html, path) {
  const expectedCanonical = `${PROD_BASE}${path}`;
  const canonical = findTag(html, 'link', { rel: 'canonical' })?.href;
  const description = findTag(html, 'meta', { name: 'description' })?.content;
  const ogUrl = findTag(html, 'meta', { property: 'og:url' })?.content;
  const title = titleOf(html);

  assert.equal(canonical, expectedCanonical, `Canonical incorrecto en ${path}.`);
  assert.equal(ogUrl, expectedCanonical, `og:url incorrecto en ${path}.`);
  assert.ok(title.length > 0, `Falta title en ${path}.`);
  assert.ok(description?.trim(), `Falta meta description en ${path}.`);
  assert.ok(!html.includes('github.io'), `Referencia github.io encontrada en ${path}.`);
}

async function validateStaticSeo(catalog) {
  const sitemap = await fs.readFile(`${ROOT}/sitemap.xml`, 'utf8');
  const robots = await fs.readFile(`${ROOT}/robots.txt`, 'utf8');
  const paths = expectedPaths(catalog);
  const expectedUrls = paths.map((path) => `${PROD_BASE}${path}`);
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1].trim()));

  assert.ok(!sitemap.includes('#'), 'El sitemap contiene URLs con hash.');
  assert.ok(!/github\.io/i.test(sitemap), 'El sitemap contiene referencias a github.io.');
  assert.deepEqual([...sitemapUrls].sort(), [...expectedUrls].sort(), 'El sitemap no coincide con las rutas esperadas del catálogo.');

  assert.match(robots, /^User-agent:\s*\*/mi, 'robots.txt no declara User-agent: *.');
  assert.match(robots, /^Allow:\s*\/$/mi, 'robots.txt no permite el rastreo del sitio.');
  assert.match(robots, new RegExp(`^Sitemap:\\s*${PROD_BASE.replaceAll('.', '\\.')}\\/sitemap\\.xml$`, 'mi'), 'robots.txt no apunta al sitemap canónico.');
  assert.ok(!/github\.io/i.test(robots), 'robots.txt contiene referencias a github.io.');
  assert.ok(!/^Disallow:\s*\/$/mi.test(robots), 'robots.txt bloquea todo el sitio.');

  const pages = ['/', ...paths];
  for (const path of pages) {
    const response = await fetch(`${LOCAL_BASE}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `${path} respondió HTTP ${response.status}.`);
    const html = await response.text();
    validatePageMetadata(html, path);
  }

  for (const course of catalog) {
    const coursePath = `/curso/${encodeURIComponent(course.key)}/`;
    const examPath = `${coursePath}simulacro/`;
    assert.ok(sitemapUrls.includes(`${PROD_BASE}${coursePath}`), `Falta página SEO para ${course.key}.`);
    assert.ok(sitemapUrls.includes(`${PROD_BASE}${examPath}`), `Falta página SEO de simulacro para ${course.key}.`);
  }

  return paths.length;
}

async function validateBrowserRoutes(catalog) {
  const course = catalog[0];
  const key = encodeURIComponent(course.key);
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

    await page.goto(`${LOCAL_BASE}/curso/${key}/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
    assert.equal(new URL(page.url()).pathname, `/curso/${key}/`, 'La ruta limpia del curso cambió inesperadamente.');

    await page.goto(`${LOCAL_BASE}/curso/${key}/simulacro/`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).waitFor();
    assert.equal(new URL(page.url()).pathname, `/curso/${key}/simulacro/`, 'La ruta limpia del simulacro cambió inesperadamente.');

    await page.goto(`${LOCAL_BASE}/#curso/${key}/panel`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
    assert.equal(new URL(page.url()).hash, `#curso/${key}/panel`, 'El hash antiguo del curso dejó de preservarse.');

    await page.goto(`${LOCAL_BASE}/#curso/${key}/simulacro`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Iniciar simulacro aleatorio/i }).waitFor();
    assert.equal(new URL(page.url()).hash, `#curso/${key}/simulacro`, 'El hash antiguo del simulacro dejó de preservarse.');

    assert.deepEqual(errors, [], `Errores de navegador:\n${errors.join('\n')}`);
  } finally {
    await browser.close();
  }
}

const catalog = await loadCatalog();
const pageCount = await validateStaticSeo(catalog);
await validateBrowserRoutes(catalog);

console.log(`SEO smoke OK: ${pageCount} URLs del sitemap, ${catalog.length} cursos y rutas limpias/hash verificadas.`);
