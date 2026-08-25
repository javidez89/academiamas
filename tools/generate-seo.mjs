import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const DOMAIN = 'https://academiaqaoficial.com';
const cleanDomain = DOMAIN.replace(/\/$/, '');
const rootPath = (...parts) => path.join(ROOT, ...parts);
const BRAND_LOGO = '/assets/img/academiaqa-logo-660.webp';
const SOCIAL_IMAGE = '/assets/img/academiaqa-social.jpg';
const GOOGLE_TAG_ID = 'G-F5VK3VZYR0';
const GOOGLE_TAG_SCRIPT = `  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GOOGLE_TAG_ID}');`;

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
  const candidate = text.slice(0, max - 3).trimEnd();
  const lastSpace = candidate.lastIndexOf(' ');
  const clipped = lastSpace >= Math.floor(max * 0.7) ? candidate.slice(0, lastSpace) : candidate;
  return `${clipped.replace(/[.,;:!?-]+$/u, '')}...`;
}

function urlFor(routePath) {
  return `${cleanDomain}${routePath}`;
}

function jsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

function organization() {
  return {
    '@type': 'EducationalOrganization',
    '@id': urlFor('/#organization'),
    name: 'AcademiaQA',
    url: urlFor('/'),
    logo: {
      '@type': 'ImageObject',
      url: urlFor(BRAND_LOGO),
      width: 660,
      height: 175
    }
  };
}

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: urlFor(item.path)
    }))
  };
}

function coursePath(key, view = 'panel') {
  const base = `/curso/${encodeURIComponent(key)}/`;
  if (view === 'simulacro') return `${base}simulacro/`;
  if (view === 'examen-final') return `${base}examen-final/`;
  return base;
}

function chapterPath(key, chapterId) {
  return `/curso/${encodeURIComponent(key)}/capitulo/${encodeURIComponent(chapterId)}/`;
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

async function loadCourseData(catalog) {
  const entries = await Promise.all(catalog.map(async (entry) => {
    const source = await fs.readFile(rootPath(...entry.src.split('/')), 'utf8');
    let registered = null;
    const sandbox = {
      AcademyRegistry: {
        register(key, data) {
          registered = { key, data };
        }
      }
    };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: entry.src });
    if (!registered || registered.key !== entry.key) {
      throw new Error(`No se pudo cargar el contenido de ${entry.key}.`);
    }
    return [entry.key, registered.data];
  }));

  return new Map(entries);
}

async function assetVersion() {
  const source = await fs.readFile(rootPath('assets', 'js', 'config.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'assets/js/config.js' });
  return sandbox.window.ACADEMY_CONFIG?.assetVersion || '2026-08-11-seo-analytics';
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

function seoCourseName(course) {
  const meta = metaOf(course);
  const shortName = meta.shortName || meta.name || course.key;
  return shortName.length <= 32 ? shortName : meta.code || shortName;
}

function seoCourseLabel(course) {
  if (course.key === 'ctfl') return 'CTFL 4.0';
  if (course.key === 'ctai') return 'CT-AI 2.0';
  return metaOf(course).code || seoCourseName(course);
}

function courseTitle(course) {
  const prefix = course.family === 'ISTQB' ? 'Curso ISTQB' : 'Curso';
  return clip(`${prefix} ${seoCourseLabel(course)} gratis y simulador | AcademiaQA`, 65);
}

function examTitle(course) {
  const prefix = course.family === 'ISTQB' ? 'Simulacro ISTQB' : 'Simulacro';
  return clip(`${prefix} ${seoCourseLabel(course)} gratis | AcademiaQA`, 65);
}

function chapterTitle(course, chapter) {
  const detailed = `C${chapter.id}: ${chapter.title} | ${seoCourseLabel(course)} - AcademiaQA`;
  return detailed.length <= 65
    ? detailed
    : `Capítulo ${chapter.id} ${seoCourseLabel(course)} | AcademiaQA`;
}

function courseSummary(course) {
  const counts = countsOf(course);
  const blueprint = blueprintOf(course);
  return [
    `${counts.chapters || 0} capítulos`,
    `${counts.objectives || 0} objetivos LO`,
    `${counts.questions || 0} preguntas`,
    `simulacro ${blueprint.totalQuestions || 0}`,
    `aprueba ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`,
    `${blueprint.minutes || 0} min`
  ];
}

function courseDescription(course) {
  const meta = metaOf(course);
  const counts = countsOf(course);
  const blueprint = blueprintOf(course);
  const name = seoCourseName(course);
  return `Estudia ${name} con ${counts.chapters || 0} capítulos, ${counts.objectives || 0} objetivos LO, práctica y simulacro de ${blueprint.totalQuestions || 0} preguntas en AcademiaQA.`;
}

function examDescription(course) {
  const meta = metaOf(course);
  const blueprint = blueprintOf(course);
  const name = seoCourseName(course);
  const points = blueprint.totalPoints || blueprint.totalQuestions || 0;
  return `Practica con el simulacro de ${name}: ${blueprint.totalQuestions || 0} preguntas, ${blueprint.minutes || 0} minutos y aprobación de ${blueprint.passingScore || 0}/${points}. Acceso gratis en AcademiaQA.`;
}

function courseEntity(course, courseData = {}) {
  const meta = metaOf(course);
  const tags = [...new Set([course.family, ...(course.areas || []), ...(course.tags || [])].filter(Boolean))];
  const routePath = coursePath(course.key);
  const source = courseSourceDetails(course, courseData);
  return {
    '@type': 'Course',
    '@id': `${urlFor(routePath)}#course`,
    name: meta.name || course.key,
    description: plain(meta.subtitle || courseDescription(course)),
    url: urlFor(routePath),
    inLanguage: 'es-CO',
    isAccessibleForFree: course.access === 'free',
    dateModified: source.updatedAt,
    version: source.version,
    provider: organization(),
    about: tags.map((name) => ({ '@type': 'Thing', name }))
  };
}

function courseList(catalog, courseDataByKey = new Map()) {
  return {
    '@type': 'ItemList',
    name: 'Cursos disponibles en AcademiaQA',
    numberOfItems: catalog.length,
    itemListElement: catalog.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: urlFor(coursePath(course.key)),
      item: courseEntity(course, courseDataByKey.get(course.key))
    }))
  };
}

function examEntity(course) {
  const meta = metaOf(course);
  const routePath = coursePath(course.key, 'simulacro');
  return {
    '@type': 'LearningResource',
    '@id': `${urlFor(routePath)}#simulacro`,
    name: `Simulacro ${meta.name || course.key}`,
    description: examDescription(course),
    url: urlFor(routePath),
    inLanguage: 'es-CO',
    isAccessibleForFree: course.access === 'free',
    learningResourceType: 'Simulacro de estudio',
    provider: organization(),
    isPartOf: {
      '@type': 'Course',
      '@id': `${urlFor(coursePath(course.key))}#course`,
      name: meta.name || course.key,
      url: urlFor(coursePath(course.key))
    }
  };
}

function chapterEntity(course, courseData, chapter) {
  const routePath = chapterPath(course.key, chapter.id);
  const source = courseSourceDetails(course, courseData);
  const objectives = (courseData.objectives || []).filter((item) => Number(item.chapter) === Number(chapter.id));
  return {
    '@type': 'LearningResource',
    '@id': `${urlFor(routePath)}#chapter`,
    name: `Capítulo ${chapter.id}: ${chapter.title}`,
    description: plain(chapter.summary),
    url: urlFor(routePath),
    inLanguage: 'es-CO',
    isAccessibleForFree: course.access === 'free',
    learningResourceType: 'Capítulo de curso',
    timeRequired: chapter.minutes ? `PT${chapter.minutes}M` : undefined,
    dateModified: source.updatedAt,
    provider: organization(),
    teaches: objectives.map((objective) => objective.text).filter(Boolean),
    about: (chapter.terms || []).slice(0, 20).map((name) => ({ '@type': 'Thing', name })),
    isPartOf: {
      '@type': 'Course',
      '@id': `${urlFor(coursePath(course.key))}#course`,
      name: metaOf(course).name || course.key,
      url: urlFor(coursePath(course.key))
    }
  };
}

function courseSourceDetails(course, courseData = {}) {
  const coverage = courseData.syllabusCoverageNote || {};
  const validation = courseData.qaValidation || {};
  const dataMeta = courseData.meta || {};
  return {
    version: dataMeta.versionLabel || metaOf(course).code || course.key,
    source: coverage.source || validation.sourceSyllabus || metaOf(course).subtitle || 'Contenido académico de AcademiaQA',
    updatedAt: String(coverage.updatedAt || validation.validatedAt || courseData.generatedAt || course.generatedAt || '').slice(0, 10),
    responsible: 'AcademiaQA'
  };
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
    `/courses/source-documents.js${suffix}`,
    `/assets/js/core/registry.js${suffix}`,
    `/assets/js/core/storage.js${suffix}`,
    `/assets/js/core/question-selection.js${suffix}`,
    `/assets/js/config.js${suffix}`,
    '/assets/vendor/supabase-2.112.3.js?v=2.112.3',
    `/assets/js/auth.js${suffix}`,
    `/assets/js/cloud.js${suffix}`,
    `/assets/js/pwa.js${suffix}`,
    `/courses/catalog.js${suffix}`,
    `/assets/js/app-loader.js${suffix}`
  ].map((src) => `  <script defer src="${h(src)}"></script>`).join('\n');
}

function authControl() {
  return `<div class="authControl" id="authControl" data-auth-state="loading" aria-busy="true">
          <button class="authSignIn" type="button" data-auth-sign-in disabled>Cuenta</button>
          <div class="authUser" data-auth-user hidden>
            <button class="authUserButton" type="button" data-auth-menu-toggle aria-expanded="false" aria-controls="authMenu">
              <span class="authAvatar" data-auth-initial aria-hidden="true">A</span>
              <span data-auth-name>Mi cuenta</span>
            </button>
            <div class="authMenu" id="authMenu" data-auth-menu hidden>
              <strong data-auth-full-name>Mi cuenta</strong>
              <span data-auth-email></span>
              <a href="/mi-cuenta/" data-view="account">Ver mi cuenta</a>
              <a href="/admin/" data-view="admin" data-auth-admin-link hidden>Administración</a>
              <button type="button" data-auth-sign-out>Cerrar sesión</button>
            </div>
          </div>
          <span class="srOnly" data-auth-status role="status" aria-live="polite">Comprobando sesión.</span>
        </div>`;
}

function analyticsTags() {
  return `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}"></script>
  <script>
${GOOGLE_TAG_SCRIPT}
  </script>`;
}

function head({ title, description, path: routePath, schema, robots }, version) {
  const canonical = urlFor(routePath);
  const cleanDescription = clip(description);
  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
${analyticsTags()}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <meta name="theme-color" content="#0b315d">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self'; media-src 'self' blob:; connect-src 'self' https://sysdlcsdvvbaybhqfivj.supabase.co https://www.datos.gov.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(), usb=()">
  <meta name="robots" content="${h(robots || 'index, follow')}">
  <meta name="description" content="${h(cleanDescription)}">
  <link rel="canonical" href="${h(canonical)}">
  <link rel="alternate" hreflang="es-CO" href="${h(canonical)}">
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/img/favicon-48.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <base href="/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CO">
  <meta property="og:site_name" content="AcademiaQA">
  <meta property="og:title" content="${h(title)}">
  <meta property="og:description" content="${h(cleanDescription)}">
  <meta property="og:url" content="${h(canonical)}">
  <meta property="og:image" content="${h(urlFor(SOCIAL_IMAGE))}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="AcademiaQA - QA &amp; Testing Academia">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${h(title)}">
  <meta name="twitter:description" content="${h(cleanDescription)}">
  <meta name="twitter:image" content="${h(urlFor(SOCIAL_IMAGE))}">
  <meta name="twitter:image:alt" content="AcademiaQA - QA &amp; Testing Academia">
  <title>${h(title)}</title>
  <script type="application/ld+json">${jsonLd({
    '@context': 'https://schema.org',
    '@graph': schema
  })}</script>
  <link rel="stylesheet" href="/assets/css/app.css?v=${h(version)}">
${scriptTags(version)}
</head>`;
}

function topBadgeTotals(catalog) {
  const totals = catalogTotals(catalog);
  return {
    chapters: `${totals.chapters} capítulos`,
    questions: totals.questions,
    courses: `${totals.courses} cursos gratis disponibles`
  };
}

function courseHeroProperties(course) {
  const meta = metaOf(course);
  const counts = countsOf(course);
  const blueprint = blueprintOf(course);
  return {
    heroSubtitle: `Menú de estudio de ${meta.name || course.key}: teoría, objetivos, práctica, flashcards, simulacro y examen final.`,
    heroBadges: {
      chapters: `📘 ${counts.chapters || 0} capítulos`,
      questions: counts.questions || 0,
      exam: `⏱️ Simulacro ${blueprint.minutes || 0} min / aprueba ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`
    }
  };
}

function shell({ page, content, catalog }, version) {
  const totals = topBadgeTotals(catalog);
  const heroBadges = page.heroBadges || {
    chapters: `📘 ${totals.chapters}`,
    questions: totals.questions,
    exam: `🎓 ${totals.courses}`
  };
  const isPublicPage = ['/', '/cursos/', '/ruta-aprendizaje/', '/contactanos/', '/legal/', '/validar-certificado/', '/mi-cuenta/', '/admin/'].includes(page.path);
  return `${head(page, version)}
<body>
  <header id="inicio"${isPublicPage ? ' class="homeHeader"' : ''}>
    <div class="wrap siteTopbar">
      <a class="brandMark" href="/" data-home-anchor="inicio" aria-label="Ir al inicio">
        <picture><source type="image/webp" srcset="/assets/img/academiaqa-logo-660.webp"><img class="brandLogo" src="/assets/img/academiaqa-logo.png" width="660" height="175" alt="AcademiaQA - QA &amp; Testing Academia" decoding="async"></picture>
      </a>
      <button class="menuToggle" type="button" data-action="toggle-site-menu" aria-controls="siteMenu" aria-expanded="false">
        <span class="srOnly">Abrir menú principal</span>
        <span aria-hidden="true">☰</span>
      </button>
      <nav class="siteNav" id="siteMenu" aria-label="Menú principal">
        <a href="/" data-view="home" data-view-anchor="inicio">Inicio</a>
        <a href="/cursos/" data-view="courses" data-view-anchor="cursos-disponibles">Cursos</a>
        <a href="/ruta-aprendizaje/" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
        <a href="/contactanos/" data-view="contact" data-view-anchor="contactanos">Contáctanos</a>
        <a href="/legal/" data-view="legal" data-view-anchor="legal">Información legal</a>
        <a href="/validar-certificado/" data-view="verifyCertificate" data-view-anchor="validar-certificado">Validar certificado</a>
        <button class="coffeeLink" type="button">Invítame un café</button>
        <button class="pwaInstallButton" type="button" data-pwa-install hidden><span aria-hidden="true">&#8595;</span> Instalar app</button>
        ${authControl()}
      </nav>
    </div>
    <div class="wrap hero">
      <div>
        ${isPublicPage ? `<span class="heroTitleText" id="heroTitle">${h(page.heroTitle || 'AcademiaQA')}</span>` : `<h1 id="heroTitle">${h(page.heroTitle || 'AcademiaQA')}</h1>`}
        <p class="subtitle" id="heroSubtitle">${h(page.heroSubtitle || page.description)}</p>
        <div class="topbadges">
          <span class="badge" id="topChapters">${h(heroBadges.chapters)}</span>
          <span class="badge">🧠 Preguntas: <b id="topBank">${h(heroBadges.questions)}</b></span>
          <span class="badge" id="topExam">${h(heroBadges.exam)}</span>
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
          <h2 id="coffeeModalTitle">Invítame un café</h2>
          <p>Tu aporte ayuda a mantener cursos gratuitos, servidores y nuevas herramientas.</p>
        </div>
      </div>
      <div class="coffeeOptions" role="group" aria-label="Opciones de aporte">
        <button class="coffeeOption" type="button" data-action="select-coffee-tier" data-tier="USD 5" data-usd="5"><strong>USD 5</strong><span>Un café</span><em></em></button>
        <button class="coffeeOption active" type="button" data-action="select-coffee-tier" data-tier="USD 10" data-usd="10"><small>Elegido</small><strong>USD 10</strong><span>Dos cafés</span><em></em></button>
        <button class="coffeeOption" type="button" data-action="select-coffee-tier" data-tier="USD 15" data-usd="15"><strong>USD 15</strong><span>Gran apoyo</span><em></em></button>
      </div>
      <div class="coffeeSecure">
        <b>Cobro seguro mediante Wompi</b>
        <span id="coffeeCopHint" aria-live="polite">Wompi procesa en COP; antes de pagar confirma el valor final.</span>
      </div>
      <button class="btn coffeeCheckout" type="button" data-action="continue-wompi">Continuar con Wompi</button>
      <p class="coffeeFineprint">Aporte voluntario y único. No compra ni desbloquea cursos. La confirmación depende del proceso aprobado por Wompi.</p>
    </div>
  </div>

  <div class="certificateModal" id="certificateModal" role="dialog" aria-modal="true" aria-labelledby="certificateModalTitle" hidden>
    <div class="certificateDialog">
      <button class="modalClose" type="button" data-action="close-certificate-modal" aria-label="Cerrar">X</button>
      <div class="certificateModalBody" id="certificateModalBody">
        <div class="certificateModalLoading" role="status">
          <span class="sectionKicker">Certificados AcademiaQA</span>
          <h2 id="certificateModalTitle">Preparando información segura...</h2>
        </div>
      </div>
    </div>
  </div>

  <main class="wrap">
    <div class="layout${isPublicPage ? ' homeLayout' : ''}" id="mainLayout">
      <aside class="sidebar" id="studySidebar" aria-label="Menú del curso">
        <button class="navbtn" type="button" data-view="home">🏠 Todos los cursos <small>inicio</small></button>
        <div class="sideDivider"></div>
        <div class="sideSectionTitle">Menú del curso</div>
        <button class="navbtn active" type="button" data-view="dashboard">📌 Panel del curso <small>avance</small></button>
        <button class="navbtn" type="button" data-view="study">📚 Estudiar syllabus <small id="navCaps">caps</small></button>
        <button class="navbtn" type="button" data-view="objectives">🎯 Objetivos LO <small>mapa</small></button>
        <button class="navbtn" type="button" data-view="practice">📝 Practicar <small>filtros</small></button>
        <button class="navbtn" type="button" data-view="exam">⏱️ Simulacro <small id="navExamCount">40</small></button>
        <button class="navbtn" type="button" data-view="finalExam">🎓 Examen final <small>requiere 95%</small></button>
        <button class="navbtn" type="button" data-view="k3lab">🧪 Laboratorio K3 <small>técnicas</small></button>
        <button class="navbtn" type="button" data-view="flashcards">🃏 Flashcards <small>glosario</small></button>
        <button class="navbtn" type="button" data-view="analytics">📈 Estadísticas <small>errores</small></button>
        <div class="note small"><b>Nota:</b> cada certificación conserva progreso independiente. Las preguntas de práctica están alineadas al temario y no duplican literalmente el examen oficial.</div>
        <div class="btnrow"><button class="btn secondary" type="button" id="resetProgress">Borrar avance</button></div>
      </aside>

      <section id="app" aria-label="Contenido del curso">
${content}
      </section>
    </div>
    <div class="footer${page.path === '/' ? ' homeFooter' : ''}" id="footerText"${isPublicPage && page.path !== '/' ? ' hidden' : ''}>${page.path === '/' ? 'AcademiaQA' : ''}</div>
  </main>
  <button class="backToTop" id="backToTop" type="button" data-action="back-to-top" aria-label="Volver al inicio" title="Volver al inicio" hidden><span aria-hidden="true">↑</span></button>
</body>
</html>
`;
}

function badges(items) {
  return `<div class="certBadgeLine">${items.map((item) => `<span>${h(item)}</span>`).join('')}</div>`;
}

function sourcePanel(course, courseData) {
  const source = courseSourceDetails(course, courseData);
  return `<aside class="seoSourcePanel" aria-label="Trazabilidad académica">
            <h3>Información académica</h3>
            <dl>
              <div><dt>Versión</dt><dd>${h(source.version)}</dd></div>
              <div><dt>Fuente de referencia</dt><dd>${h(source.source)}</dd></div>
              <div><dt>Última actualización</dt><dd>${h(source.updatedAt || 'Fecha no disponible')}</dd></div>
              <div><dt>Responsable de publicación</dt><dd>${h(source.responsible)}</dd></div>
            </dl>
            <p>Plataforma educativa independiente. Consulta siempre las reglas y fuentes vigentes de la entidad certificadora.</p>
          </aside>`;
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
              <span>${h(counts.chapters || 0)} capítulos</span>
              <span>${h(counts.objectives || 0)} LO</span>
              <span>${h(counts.questions || 0)} preguntas</span>
              <span>${h(summary[3])}</span>
            </div>
            <span class="courseEnter">Entrar al curso</span>
          </a>`;
}

function homeContent(catalog) {
  const freeCourses = catalog.filter((course) => course.access === 'free').length;
  return `        <div class="publicHome" data-static-home="true">
          <section class="landingHero" aria-labelledby="homeMainTitle">
            <div class="landingCopy">
              <span class="landingEyebrow">QA &amp; Testing Academia · ${h(freeCourses)} cursos gratis</span>
              <h1 id="homeMainTitle">Prepárate para tu próxima certificación profesional.</h1>
              <p>Aprende la teoría, practica por objetivo y realiza simulacros con seguimiento de progreso. Explora rutas en testing, IA, Scrum y gestión de proyectos.</p>
              <div class="landingActions">
                <a class="btn" href="/ruta-aprendizaje/">Ruta de aprendizaje</a>
                <a class="btn secondary" href="/cursos/">Ver cursos gratis</a>
              </div>
            </div>
          </section>
          <section class="communityActivity" aria-labelledby="communityActivityTitle" aria-live="polite">
            <div class="communityActivityCopy">
              <span class="sectionKicker">Comunidad AcademiaQA</span>
              <h2 id="communityActivityTitle">Aprendemos en comunidad.</h2>
              <p>Actualizando actividad... No se muestran identidades ni datos personales.</p>
            </div>
            <div class="communityMetric"><strong data-community-registered>—</strong><span>Personas registradas</span></div>
            <div class="communityMetric communityMetricOnline"><strong data-community-online>—</strong><span>En línea ahora</span></div>
          </section>
          <section class="homeSection" aria-labelledby="homeFallbackCoursesTitle">
            <span class="sectionKicker">Cursos disponibles</span>
            <h2 id="homeFallbackCoursesTitle">Aprende QA, testing, IA, Scrum y gestión de proyectos.</h2>
            <div class="availableCoursesGrid">${catalog.map(courseCard).join('\n')}</div>
          </section>
        </div>`;
}

function publicContent(kind, catalog) {
  const totals = catalogTotals(catalog);
  const tagList = allTags(catalog).slice(0, 18);
  const courseGrid = catalog.map(courseCard).join('\n');
  const intro = `${totals.courses} cursos, ${totals.chapters} capítulos, ${totals.objectives} objetivos LO y ${totals.questions} preguntas.`;

  if (kind === 'courses') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="coursesTitle">Cursos disponibles</h1>
          <p>${h(intro)}</p>
          <div class="availableCoursesGrid">${courseGrid}</div>
        </div>`;
  }

  if (kind === 'routes') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="routesTitle">Ruta de aprendizaje</h1>
          <p>${h(intro)}</p>
          ${badges(tagList)}
          <div class="availableCoursesGrid">${courseGrid}</div>
        </div>`;
  }

  if (kind === 'contact') {
    return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="contactTitle">Contáctanos</h1>
          <p>${h(intro)}</p>
          ${badges(tagList)}
        </div>`;
  }

  return `        <div class="card">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="legalTitle">Politica de privacidad y terminos de uso</h1>
          <p>${h(intro)}</p>
          <p>AcademiaQA requiere inicio de sesión con Google mediante Supabase Auth para entrar a los cursos. AcademiaQA no recibe la contraseña de Google. Las matrículas, el avance por capítulo, el tiempo activo de estudio y los resultados se sincronizan con Supabase y conservan una copia local en el navegador.</p>
          <p>Cancelar un curso conserva su historial para permitir la reactivación. El usuario puede eliminar definitivamente un curso cancelado desde Mi cuenta, lo que borra su matrícula, avance, tiempo e intentos asociados.</p>
          <p>AcademiaQA utiliza Google Analytics para conocer de forma agregada qué páginas y cursos se visitan. Google puede usar cookies o identificadores técnicos conforme a sus propias políticas de privacidad.</p>
          ${badges(tagList)}
        </div>`;
}

function courseContent(course, courseData, isExam = false) {
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

  const chapters = (courseData.chapters || []).map((chapter) => `<li><a href="${h(chapterPath(course.key, chapter.id))}"><b>Capítulo ${h(chapter.id)}:</b> ${h(chapter.title)}</a><span>${h(chapter.summary || '')}</span></li>`).join('');
  const description = isExam ? examDescription(course) : meta.subtitle || courseDescription(course);

  return `        <div class="card seoCourseFallback">
          <span class="sectionKicker">${h(meta.code || course.key)}</span>
          <h2>${h(title)}</h2>
          <p>${h(description)}</p>
          ${badges(stats)}
          <div class="courseTaxonomy">${tags.map((tag) => `<span>${h(tag)}</span>`).join('')}</div>
          <div class="courseStatsLine">
            <span>${h(counts.chapters || 0)} capítulos</span>
            <span>${h(counts.objectives || 0)} objetivos LO</span>
            <span>${h(counts.questions || 0)} preguntas</span>
            <span>Simulacro ${h(blueprint.totalQuestions || 0)}</span>
          </div>
          ${isExam ? `<div class="seoExamSummary"><h3>Condiciones del simulacro</h3><p>Entrenamiento aleatorio con ${h(blueprint.totalQuestions || 0)} preguntas, ${h(blueprint.minutes || 0)} minutos y puntuación mínima de ${h(blueprint.passingScore || 0)}/${h(blueprint.totalPoints || blueprint.totalQuestions || 0)}.</p><a class="btn good" href="${h(coursePath(course.key, 'simulacro'))}">Abrir simulacro</a></div>` : `<h3>Temario por capítulos</h3><ol class="seoChapterList">${chapters}</ol>`}
          ${sourcePanel(course, courseData)}
        </div>`;
}

function chapterContent(course, courseData, chapter) {
  const objectives = (courseData.objectives || []).filter((item) => Number(item.chapter) === Number(chapter.id));
  const sections = (chapter.theorySections || []).map((section) => `<section class="seoTheorySection"><h3>${h(section.title)}</h3><p>${h(section.body || '')}</p>${Array.isArray(section.bullets) ? `<ul>${section.bullets.map((item) => `<li>${h(item)}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const terms = (chapter.terms || []).map((term) => `<span class="pill">${h(term)}</span>`).join('');
  const objectiveItems = objectives.map((objective) => `<li><b>${h(objective.lo)} · ${h(objective.k)}</b><span>${h(objective.text)}</span>${objective.theory ? `<p>${h(objective.theory)}</p>` : ''}</li>`).join('');
  const pitfalls = (chapter.pitfalls || []).map((item) => `<li>${h(item)}</li>`).join('');
  const examples = (chapter.examples || []).map((item) => `<li>${h(item)}</li>`).join('');

  return `        <article class="card seoChapterFallback">
          <span class="sectionKicker">${h(seoCourseLabel(course))} · Capítulo ${h(chapter.id)}</span>
          <h2>${h(chapter.title)}</h2>
          <p class="seoChapterLead">${h(chapter.summary || '')}</p>
          ${badges([`${objectives.length} objetivos LO`, `${chapter.minutes || 0} min`, `${(chapter.terms || []).length} términos clave`])}
          ${sections}
          <section><h3>Términos clave</h3><div>${terms}</div></section>
          <section><h3>Objetivos de aprendizaje</h3><ol class="seoObjectiveList">${objectiveItems}</ol></section>
          ${pitfalls ? `<section><h3>Errores frecuentes</h3><ul>${pitfalls}</ul></section>` : ''}
          ${examples ? `<section><h3>Ejemplos aplicados</h3><ul>${examples}</ul></section>` : ''}
          <div class="btnrow"><a class="btn" href="${h(coursePath(course.key))}">Entrar al curso</a><a class="btn secondary" href="${h(coursePath(course.key, 'simulacro'))}">Ver simulacro</a></div>
          ${sourcePanel(course, courseData)}
        </article>`;
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': urlFor('/#website'),
    url: urlFor('/'),
    name: 'AcademiaQA',
    inLanguage: 'es-CO',
    publisher: { '@id': urlFor('/#organization') }
  };
}

function pageDefinitions(catalog, courseDataByKey) {
  const totals = catalogTotals(catalog);
  const catalogSchema = courseList(catalog, courseDataByKey);
  const publicPages = [
    {
      key: 'home',
      path: '/',
      title: 'Cursos QA gratis y simulacros ISTQB | AcademiaQA',
      heroTitle: 'AcademiaQA',
      description: 'Aprende QA y testing con cursos gratis, syllabus, práctica, flashcards y simulacros para ISTQB, IA, Scrum y gestión de proyectos.',
      schema: [organization(), website()],
      content: homeContent(catalog)
    },
    {
      key: 'courses',
      path: '/cursos/',
      title: 'Cursos gratis de QA, Testing, IA y Scrum | AcademiaQA',
      heroTitle: 'Cursos',
      description: `Explora ${totals.courses} cursos gratis de QA, testing, IA, Scrum, gestión de proyectos y ciberseguridad con syllabus, práctica y simulacros.`,
      schema: [
        catalogSchema,
        breadcrumb([{ name: 'Inicio', path: '/' }, { name: 'Cursos', path: '/cursos/' }])
      ],
      content: publicContent('courses', catalog)
    },
    {
      key: 'routes',
      path: '/ruta-aprendizaje/',
      title: 'Rutas para aprender QA, Testing, IA y Scrum | AcademiaQA',
      heroTitle: 'Ruta de aprendizaje',
      description: 'Elige una ruta de aprendizaje gratuita en QA, testing, IA, Scrum, gestión de proyectos o ciberseguridad y avanza hasta el simulacro.',
      schema: [
        catalogSchema,
        breadcrumb([{ name: 'Inicio', path: '/' }, { name: 'Ruta de aprendizaje', path: '/ruta-aprendizaje/' }])
      ],
      content: publicContent('routes', catalog)
    },
    {
      key: 'contact',
      path: '/contactanos/',
      title: 'Contáctanos | AcademiaQA',
      heroTitle: 'Contáctanos',
      description: 'Contacta a AcademiaQA para reportar un problema, sugerir una mejora académica o proponer una colaboración para la comunidad QA.',
      schema: [breadcrumb([{ name: 'Inicio', path: '/' }, { name: 'Contáctanos', path: '/contactanos/' }])],
      content: publicContent('contact', catalog)
    },
    {
      key: 'legal',
      path: '/legal/',
      title: 'Información legal y privacidad | AcademiaQA',
      heroTitle: 'Información legal',
      description: 'Consulta la política de privacidad, los términos de uso y el aviso de plataforma educativa independiente de AcademiaQA.',
      schema: [breadcrumb([{ name: 'Inicio', path: '/' }, { name: 'Información legal', path: '/legal/' }])],
      content: publicContent('legal', catalog)
    },
    {
      key: 'verify-certificate',
      path: '/validar-certificado/',
      title: 'Validar certificado AcademiaQA | Consulta pública',
      heroTitle: 'Validar certificado',
      description: 'Consulta un certificado de finalización de AcademiaQA mediante su código único y verifica su estado, curso y fecha de emisión.',
      schema: [breadcrumb([{ name: 'Inicio', path: '/' }, { name: 'Validar certificado', path: '/validar-certificado/' }])],
      content: `        <div class="publicHome publicPage certificateValidationPage" id="validar-certificado">
          <section class="certificateValidationHero" aria-labelledby="certificateValidationTitle">
            <span class="sectionKicker">Validación pública</span>
            <h1 id="certificateValidationTitle">Valida un certificado AcademiaQA</h1>
            <p>Consulta el código único impreso en el PDF o abre la URL incluida en su código QR.</p>
            <form class="certificateValidationForm" data-certificate-validation-form>
              <label for="certificateCodeInput">Código del certificado</label>
              <div><input id="certificateCodeInput" name="certificateCode" type="text" maxlength="17" placeholder="ACQA-XXXXXXXXXXXX" autocomplete="off" required><button class="btn" type="submit">Validar</button></div>
            </form>
          </section>
          <div class="note certificateValidationDisclaimer"><b>Alcance:</b> AcademiaQA valida la finalización de sus cursos internos. Este registro no reemplaza ni representa una certificación oficial de ISTQB, CertiProf u otra entidad certificadora.</div>
        </div>`
    }
  ];

  const coursePages = catalog.flatMap((course) => {
    const meta = metaOf(course);
    const courseData = courseDataByKey.get(course.key) || {};
    const courseRoute = coursePath(course.key);
    const examRoute = coursePath(course.key, 'simulacro');
    const primaryPages = [
      {
        key: `${course.key}-course`,
        path: courseRoute,
        ...courseHeroProperties(course),
        title: courseTitle(course),
        heroTitle: meta.name || course.key,
        description: courseDescription(course),
        schema: [
          courseEntity(course, courseData),
          breadcrumb([
            { name: 'Inicio', path: '/' },
            { name: 'Cursos', path: '/cursos/' },
            { name: meta.shortName || meta.name || course.key, path: courseRoute }
          ])
        ],
        content: courseContent(course, courseData)
      },
      {
        key: `${course.key}-exam`,
        path: examRoute,
        ...courseHeroProperties(course),
        title: examTitle(course),
        heroTitle: meta.name || course.key,
        description: examDescription(course),
        schema: [
          examEntity(course),
          breadcrumb([
            { name: 'Inicio', path: '/' },
            { name: 'Cursos', path: '/cursos/' },
            { name: meta.shortName || meta.name || course.key, path: courseRoute },
            { name: 'Simulacro', path: examRoute }
          ])
        ],
        content: courseContent(course, courseData, true)
      }
    ];

    const chapterPages = (courseData.chapters || []).map((chapter) => {
      const routePath = chapterPath(course.key, chapter.id);
      return {
        key: `${course.key}-chapter-${chapter.id}`,
        path: routePath,
        ...courseHeroProperties(course),
        title: chapterTitle(course, chapter),
        heroTitle: meta.name || course.key,
        description: `Capítulo ${chapter.id} de ${seoCourseLabel(course)}: ${plain(chapter.summary || chapter.title)} Estudia objetivos LO, términos y ejemplos en AcademiaQA.`,
        schema: [
          chapterEntity(course, courseData, chapter),
          breadcrumb([
            { name: 'Inicio', path: '/' },
            { name: 'Cursos', path: '/cursos/' },
            { name: meta.shortName || meta.name || course.key, path: courseRoute },
            { name: `Capítulo ${chapter.id}`, path: routePath }
          ])
        ],
        content: chapterContent(course, courseData, chapter)
      };
    });

    return [...primaryPages, ...chapterPages];
  });

  return [...publicPages, ...coursePages];
}

function privatePageDefinitions(catalog) {
  const account = {
    key: 'account',
    path: '/mi-cuenta/',
    title: 'Mi cuenta | AcademiaQA',
    heroTitle: 'Mi cuenta',
    description: 'Consulta tus matrículas, avance y actividad de aprendizaje en AcademiaQA.',
    robots: 'noindex, nofollow',
    schema: [],
    content: `        <div class="publicHome publicPage accountPage" id="mi-cuenta">
          <section class="accountSignIn" aria-labelledby="accountTitle">
            <span class="sectionKicker">Mi cuenta</span>
            <h1 id="accountTitle">Tu aprendizaje, en un solo lugar</h1>
            <p>Inicia sesión con Google para consultar tus matrículas, avance por capítulo, tiempo de estudio, simulacros y exámenes finales.</p>
            <button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>
          </section>
        </div>`
  };
  const admin = {
    key: 'admin',
    path: '/admin/',
    title: 'Administración | AcademiaQA',
    heroTitle: 'Administración',
    description: 'Panel privado de usuarios y aprendizaje de AcademiaQA.',
    robots: 'noindex, nofollow',
    schema: [],
    content: `        <div class="publicHome publicPage adminPage" id="admin">
          <section class="accountSignIn" aria-labelledby="adminTitle">
            <span class="sectionKicker">Acceso restringido</span>
            <h1 id="adminTitle">Panel de administración</h1>
            <p>Inicia sesión con una cuenta administradora para consultar usuarios y métricas de aprendizaje.</p>
            <button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>
          </section>
        </div>`
  };

  const finalExams = catalog.map((course) => {
    const meta = metaOf(course);
    const blueprint = blueprintOf(course);
    return {
      key: `${course.key}-final-exam`,
      path: coursePath(course.key, 'examen-final'),
      ...courseHeroProperties(course),
      title: `Examen final ${meta.name || course.key} | AcademiaQA`,
      heroTitle: meta.name || course.key,
      description: `Examen final interno de ${meta.name || course.key} con ${blueprint.totalQuestions || 0} preguntas y aprobación de ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}.`,
      robots: 'noindex, nofollow',
      schema: [],
      content: `        <div class="card finalExamIntro">
          <span class="sectionKicker">Aprobación del curso</span>
          <h2>Examen final · ${h(meta.name || course.key)}</h2>
          <p>Inicia sesión con Google para presentar el examen final y guardar el resultado en tu cuenta.</p>
          ${badges([`${blueprint.totalQuestions || 0} preguntas`, `${blueprint.minutes || 0} min`, `aprueba ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`])}
          <button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>
        </div>`
    };
  });

  return [account, admin, ...finalExams];
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
const courseDataByKey = await loadCourseData(catalog);
const version = await assetVersion();
const pages = pageDefinitions(catalog, courseDataByKey);
const privatePages = privatePageDefinitions(catalog);

await writeRobots();
await writeSitemap(pages);
for (const page of [...pages, ...privatePages]) await writePage(page, catalog, version);

console.log(`SEO generado: ${pages.length} paginas indexables, ${privatePages.length} privadas, robots.txt y sitemap.xml.`);
