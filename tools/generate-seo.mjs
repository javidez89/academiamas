import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const DOMAIN = 'https://academiaqaoficial.com';
const GENERATED_AT = new Date().toISOString().slice(0, 10);

const cleanDomain = DOMAIN.replace(/\/$/, '');
const rootPath = (...parts) => path.join(ROOT, ...parts);

function h(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function x(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function plain(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function clip(value, max = 155) {
  const text = plain(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}.`;
}

function urlFor(routePath) {
  return `${cleanDomain}${routePath}`;
}

function coursePath(key, view = 'panel') {
  const base = `/curso/${encodeURIComponent(key)}/`;
  return view === 'simulacro' ? `${base}simulacro/` : base;
}

async function loadCatalog() {
  const source = await fs.readFile(rootPath('courses', 'catalog.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'courses/catalog.js' });
  const catalog = sandbox.window.ACADEMY_CATALOG;
  if (!Array.isArray(catalog)) throw new Error('No se pudo leer window.ACADEMY_CATALOG.');
  return catalog;
}

async function assetVersion() {
  const html = await fs.readFile(rootPath('index.html'), 'utf8');
  return html.match(/assets\/js\/app\.js\?v=([^"]+)/)?.[1] || '2026-08-05-exam-focus';
}

function countsOf(course) {
  return course.counts || {};
}

function blueprintOf(course) {
  return course.blueprint || {};
}

function metaOf(course) {
  return course.meta || {};
}

function courseSummary(course) {
  const meta = metaOf(course);
  const counts = countsOf(course);
  const blueprint = blueprintOf(course);
  return [
    `${counts.chapters || 0} capitulos`,
    `${counts.objectives || 0} objetivos LO`,
    `${counts.questions || 0} preguntas`,
    `simulacro ${blueprint.totalQuestions || 0}`,
    `aprueba ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`,
    `${blueprint.minutes || 0} min`
  ];
}

function catalogTotals(catalog) {
  return catalog.reduce((totals, course) => {
    const counts = countsOf(course);
    totals.courses += 1;
    totals.chapters += Number(counts.chapters || 0);
    totals.objectives += Number(counts.objectives || 0);
    totals.questions += Number(counts.questions || 0);
    return totals;
  }, { courses: 0, chapters: 0, objectives: 0, questions: 0 });
}

function allTags(catalog) {
  return [...new Set(catalog.flatMap((course) => [
    course.family,
    ...(course.areas || []),
    ...(course.tags || [])
  ].filter(Boolean)))];
}

function scriptTags(version) {
  const suffix = `?v=${encodeURIComponent(version)}`;
  return [
    `/assets/js/core/security.js${suffix}`,
    `/assets/js/core/registry.js${suffix}`,
    `/assets/js/core/storage.js${suffix}`,
    `/assets/js/config.js${suffix}`,
    `/courses/catalog.js${suffix}`,
    `/assets/js/app.js${suffix}`
  ].map((src) => `  <script defer src="${h(src)}"></script>`).join('\n');
}

function head({ title, description, path: routePath }, version) {
  const canonical = urlFor(routePath);
  const cleanDescription = clip(description);
  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://www.datos.gov.co; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(), usb=()">
  <meta name="robots" content="index, follow">
  <meta name="description" content="${h(cleanDescription)}">
  <link rel="canonical" href="${h(canonical)}">
  <link rel="alternate" hreflang="es-CO" href="${h(canonical)}">
  <base href="/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CO">
  <meta property="og:site_name" content="AcademiaQA">
  <meta property="og:title" content="${h(title)}">
  <meta property="og:description" content="${h(cleanDescription)}">
  <meta property="og:url" content="${h(canonical)}">
  <meta property="og:image" content="${h(urlFor('/assets/img/academiaqa-logo.png'))}">
  <meta property="og:image:alt" content="AcademiaQA - QA &amp; Testing Academia">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${h(title)}">
  <meta name="twitter:description" content="${h(cleanDescription)}">
  <meta name="twitter:image" content="${h(urlFor('/assets/img/academiaqa-logo.png'))}">
  <meta name="twitter:image:alt" content="AcademiaQA - QA &amp; Testing Academia">
  <title>${h(title)}</title>
  <link rel="stylesheet" href="/assets/css/app.css?v=${h(version)}">
${scriptTags(version)}
</head>`;
}

function topBadgeTotals(catalog) {
  const totals = catalogTotals(catalog);
  return {
    chapters: `${totals.chapters} capitulos`,
    questions: totals.questions,
    courses: `${totals.courses} cursos gratis disponibles`
  };
}

function shell({ page, content, catalog }, version) {
  const totals = topBadgeTotals(catalog);
  return `${head(page, version)}
<body>
  <header id="inicio">
    <div class="wrap siteTopbar">
      <a class="brandMark" href="/" data-home-anchor="inicio" aria-label="Ir al inicio">
        <img class="brandLogo" src="/assets/img/academiaqa-logo.png" width="1640" height="435" alt="AcademiaQA - QA &amp; Testing Academia">
      </a>
      <button class="menuToggle" type="button" data-action="toggle-site-menu" aria-controls="siteMenu" aria-expanded="false">
        <span class="srOnly">Abrir menu principal</span>
        <span aria-hidden="true">☰</span>
      </button>
      <nav class="siteNav" id="siteMenu" aria-label="Menu principal">
        <a href="/" data-view="home" data-view-anchor="inicio">Inicio</a>
        <a href="/cursos/" data-view="courses" data-view-anchor="cursos-disponibles">Cursos</a>
        <a href="/ruta-aprendizaje/" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
        <a href="/contactanos/" data-view="contact" data-view-anchor="contactanos">Contactanos</a>
        <a href="/legal/" data-view="legal" data-view-anchor="legal">Informacion legal</a>
        <button class="coffeeLink" type="button">Invitame un cafe</button>
      </nav>
    </div>
    <div class="wrap hero">
      <div>
        <h1 id="heroTitle">${h(page.heroTitle || 'AcademiaQA')}</h1>
        <p class="subtitle" id="heroSubtitle">${h(page.heroSubtitle || page.description)}</p>
        <div class="topbadges">
          <span class="badge" id="topChapters">📘 ${h(totals.chapters)}</span>
          <span class="badge">🧠 Preguntas: <b id="topBank">${h(totals.questions)}</b></span>
          <span class="badge" id="topExam">🎓 ${h(totals.courses)}</span>
        </div>
      </div>
    </div>
  </header>

  <div id="appNotice" class="appNotice info" role="status" aria-live="polite" hidden></div>

  <div class="coffeeModal" id="coffeeModal" role="dialog" aria-modal="true" aria-labelledby="coffeeModalTitle" hidden>
    <div class="coffeeDialog">
      <button class="modalClose" type="button" data-action="close-coffee-modal" aria-label="Cerrar">X</button>
      <div class="coffeeDialogHead">
        <span class="coffeeIcon" aria-hidden="true">☕</span>
        <div>
          <h2 id="coffeeModalTitle">Invitame un cafe</h2>
          <p>Tu aporte ayuda a mantener cursos gratuitos, servidores y nuevas herramientas.</p>
        </div>
      </div>
      <div class="coffeeOptions" role="group" aria-label="Opciones de aporte">
        <button class="coffeeOption" type="button" data-action="select-coffee-tier" data-tier="USD 5" data-usd="5"><strong>USD 5</strong><span>Un cafe</span><em></em></button>
        <button class="coffeeOption active" type="button" data-action="select-coffee-tier" data-tier="USD 10" data-usd="10"><small>Elegido</small><strong>USD 10</strong><span>Dos cafes</span><em></em></button>
        <button class="coffeeOption" type="button" data-action="select-coffee-tier" data-tier="USD 15" data-usd="15"><strong>USD 15</strong><span>Gran apoyo</span><em></em></button>
      </div>
      <div class="coffeeSecure">
        <b>Cobro seguro mediante Wompi</b>
        <span id="coffeeCopHint" aria-live="polite">Wompi procesa en COP; antes de pagar confirma el valor final.</span>
      </div>
      <button class="btn coffeeCheckout" type="button" data-action="continue-wompi">Continuar con Wompi</button>
      <p class="coffeeFineprint">Aporte voluntario y unico. No compra ni desbloquea cursos. La confirmacion depende del proceso aprobado por Wompi.</p>
    </div>
  </div>

  <main class="wrap">
    <div class="layout" id="mainLayout">
      <aside class="sidebar" id="studySidebar" aria-label="Menu del curso">
        <button class="navbtn" type="button" data-view="home">🏠 Todos los cursos <small>inicio</small></button>
        <div class="sideDivider"></div>
        <div class="sideSectionTitle">Menu del curso</div>
        <button class="navbtn active" type="button" data-view="dashboard">📌 Panel del curso <small>avance</small></button>
        <button class="navbtn" type="button" data-view="study">📚 Estudiar syllabus <small id="navCaps">caps</small></button>
        <button class="navbtn" type="button" data-view="objectives">🎯 Objetivos LO <small>mapa</small></button>
        <button class="navbtn" type="button" data-view="practice">📝 Practicar <small>filtros</small></button>
        <button class="navbtn" type="button" data-view="exam">⏱️ Simulacro <small id="navExamCount">40</small></button>
        <button class="navbtn" type="button" data-view="k3lab">🧪 Laboratorio K3 <small>tecnicas</small></button>
        <button class="navbtn" type="button" data-view="flashcards">🃏 Flashcards <small>glosario</small></button>
        <button class="navbtn" type="button" data-view="analytics">📈 Estadisticas <small>errores</small></button>
        <div class="note small"><b>Nota:</b> cada certificacion conserva progreso independiente. Las preguntas de practica estan alineadas al temario y no duplican literalmente el examen oficial.</div>
        <div class="btnrow"><button class="btn secondary" type="button" id="resetProgress">Borrar avance</button></div>
      </aside>

      <section id="app" aria-label="Contenido del curso">
${content}
      </section>
    </div>
    <div class="footer" id="footerText"></div>
  </main>
</body>
</html>
`;
}

function badges(items) {
  return `<div class="certBadgeLine">${items.map((item) => `<span>${h(item)}</span>`).join('')}</div>`;
}

function courseCard(course) {
  const meta = metaOf(course);
  const counts = countsOf(course);
  const summary = courseSummary(course);
  const tags = [...new Set([course.family, ...(course.areas || []), ...(course.tags || [])].filter(Boolean))];
  return `<a class="availableCourseCard" href="${h(coursePath(course.key))}">
            <div class="courseCardTop"><span class="statusDot">${course.access === 'free' ? 'Gratis' : h(course.access || 'Disponible')}</span><strong>${h(meta.code || course.key)}</strong></div>
            <h3>${h(meta.name || course.key)}</h3>
            <p>${h(meta.subtitle || '')}</p>
            <div class="courseTaxonomy">${tags.map((tag) => `<span>${h(tag)}</span>`).join('')}</div>
            <div class="courseStatsLine">
              <span>${h(counts.chapters || 0)} capitulos</span>
              <span>${h(counts.objectives || 0)} LO</span>
              <span>${h(counts.questions || 0)} preguntas</span>
              <span>${h(summary[3])}</span>
            </div>
            <span class="courseEnter">Entrar al curso</span>
          </a>`;
}

function publicContent(kind, catalog) {
  const totals = catalogTotals(catalog);
  const tagList = allTags(catalog).slice(0, 18);
  const courseGrid = catalog.map(courseCard).join('\n');
  const intro = `${totals.courses} cursos, ${totals.chapters} capitulos, ${totals.objectives} objetivos LO y ${totals.questions} preguntas.`;

  if (kind === 'courses') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h2 id="coursesTitle">Cursos disponibles</h2>
          <p>${h(intro)}</p>
          <div class="availableCoursesGrid">${courseGrid}</div>
        </div>`;
  }

  if (kind === 'routes') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h2 id="routesTitle">Ruta de aprendizaje</h2>
          <p>${h(intro)}</p>
          ${badges(tagList)}
          <div class="availableCoursesGrid">${courseGrid}</div>
        </div>`;
  }

  if (kind === 'contact') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h2 id="contactTitle">Contactanos</h2>
          <p>${h(intro)}</p>
          ${badges(tagList)}
        </div>`;
  }

  return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h2 id="legalTitle">Politica de privacidad y terminos de uso</h2>
          <p>${h(intro)}</p>
          ${badges(tagList)}
        </div>`;
}

function courseContent(course, isExam = false) {
  const meta = metaOf(course);
  const counts = countsOf(course);
  const blueprint = blueprintOf(course);
  const tags = [...new Set([course.family, ...(course.areas || []), ...(course.tags || [])].filter(Boolean))];
  const title = isExam ? `Simulacro ${meta.name || course.key}` : meta.name || course.key;
  const stats = isExam
    ? [
      `${blueprint.totalQuestions || 0} preguntas`,
      `aprueba ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`,
      `${blueprint.minutes || 0} min`
    ]
    : courseSummary(course);

  return `        <div class="card">
          <span class="sectionKicker">${h(meta.code || course.key)}</span>
          <h2>${h(title)}</h2>
          <p>${h(meta.subtitle || '')}</p>
          ${badges(stats)}
          <div class="courseTaxonomy">${tags.map((tag) => `<span>${h(tag)}</span>`).join('')}</div>
          <div class="courseStatsLine">
            <span>${h(counts.chapters || 0)} capitulos</span>
            <span>${h(counts.objectives || 0)} objetivos LO</span>
            <span>${h(counts.questions || 0)} preguntas</span>
            <span>Simulacro ${h(blueprint.totalQuestions || 0)}</span>
          </div>
        </div>`;
}

function pageDefinitions(catalog) {
  const totals = catalogTotals(catalog);
  const baseDescription = `AcademiaQA reune ${totals.courses} cursos, ${totals.chapters} capitulos, ${totals.objectives} objetivos LO y ${totals.questions} preguntas.`;
  const publicPages = [
    {
      key: 'courses',
      path: '/cursos/',
      title: 'Cursos disponibles · AcademiaQA',
      heroTitle: 'Cursos',
      description: baseDescription,
      content: publicContent('courses', catalog)
    },
    {
      key: 'routes',
      path: '/ruta-aprendizaje/',
      title: 'Ruta de aprendizaje · AcademiaQA',
      heroTitle: 'Ruta de aprendizaje',
      description: baseDescription,
      content: publicContent('routes', catalog)
    },
    {
      key: 'contact',
      path: '/contactanos/',
      title: 'Contactanos · AcademiaQA',
      heroTitle: 'Contactanos',
      description: baseDescription,
      content: publicContent('contact', catalog)
    },
    {
      key: 'legal',
      path: '/legal/',
      title: 'Informacion legal · AcademiaQA',
      heroTitle: 'Informacion legal',
      description: baseDescription,
      content: publicContent('legal', catalog)
    }
  ];

  const coursePages = catalog.flatMap((course) => {
    const meta = metaOf(course);
    const description = `${meta.subtitle || meta.name || course.key} ${courseSummary(course).join(', ')}.`;
    return [
      {
        key: `${course.key}-course`,
        path: coursePath(course.key),
        title: `${meta.name || course.key} · AcademiaQA`,
        heroTitle: meta.name || course.key,
        description,
        content: courseContent(course)
      },
      {
        key: `${course.key}-exam`,
        path: coursePath(course.key, 'simulacro'),
        title: `Simulacro ${meta.name || course.key} · AcademiaQA`,
        heroTitle: meta.name || course.key,
        description,
        content: courseContent(course, true)
      }
    ];
  });

  return [...publicPages, ...coursePages];
}

function outputPath(routePath) {
  if (routePath === '/') return rootPath('index.html');
  return rootPath(...routePath.split('/').filter(Boolean), 'index.html');
}

async function writePage(page, catalog, version) {
  const file = outputPath(page.path);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, shell({ page, content: page.content, catalog }, version), 'utf8');
}

async function writeRobots() {
  const content = `User-agent: *
Allow: /

Sitemap: ${urlFor('/sitemap.xml')}
`;
  await fs.writeFile(rootPath('robots.txt'), content, 'utf8');
}

async function writeSitemap(pages) {
  const urls = pages.map((page) => {
    const loc = urlFor(page.path);
    if (loc.includes('#') || loc.includes('github.io')) throw new Error(`URL invalida en sitemap: ${loc}`);
    return `  <url>
    <loc>${x(loc)}</loc>
    <lastmod>${GENERATED_AT}</lastmod>
  </url>`;
  }).join('\n');

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  await fs.writeFile(rootPath('sitemap.xml'), content, 'utf8');
}

const catalog = await loadCatalog();
const version = await assetVersion();
const pages = pageDefinitions(catalog);

await writeRobots();
await writeSitemap(pages);
for (const page of pages) await writePage(page, catalog, version);

console.log(`SEO generado: ${pages.length} paginas, robots.txt y sitemap.xml.`);
