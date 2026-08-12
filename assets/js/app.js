'use strict';

(function initAcademyApp(global) {
  const Security = global.AcademySecurity;
  const Registry = global.AcademyRegistry;
  const Storage = global.AcademyStorage;
  const QuestionSelection = global.AcademyQuestionSelection;
  const Auth = global.AcademyAuth;
  const Cloud = global.AcademyCloud;
  const Config = global.ACADEMY_CONFIG || {};
  const ASSET_VERSION = String(Config.assetVersion || '2026-08-05-mobile-responsive-study');
  const APP_VERSION = String(Config.version || '0.0.0');
  const CANONICAL_ORIGIN = 'https://academiaqaoficial.com';
  const WOMPI_PAYMENT_URL = 'https://checkout.wompi.co/l/VPOS_52PXST';
  const TRM_API_URL = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde DESC';
  const COFFEE_COP_PER_USD_FALLBACK = 3206.18;
  const COFFEE_TRM_FALLBACK_DATE = '2026-07-30';
  const PAYMENT_POPUP_LOCK_MS = 1_500;
  const CONTACT_EMAIL = 'javidez89@gmail.com';
  const LINKEDIN_URL = 'https://www.linkedin.com/in/javierchilatra89/';
  const SESSION_CLOSED_KEY = 'academiaqa.auth.sessionClosed';
  const FINAL_EXAM_UNLOCK_PROGRESS = 95;
  const DEFAULT_PRACTICE_FILTER = Object.freeze({
    chapter: 'all',
    k: 'all',
    lo: 'all',
    count: 40,
    mode: 'study'
  });
  const LEARNING_ROUTES = Object.freeze([
    Object.freeze({
      key: 'testing-istqb',
      name: 'Testing e ISTQB',
      description: 'Fundamentos de testing, CTFL y especialidades ISTQB organizadas por nivel y enfoque.',
      steps: Object.freeze(['Fundamentos de testing', 'CTFL', 'Especialidades ISTQB'])
    }),
    Object.freeze({
      key: 'ai-automation',
      name: 'IA y automatización',
      description: 'Bases de inteligencia artificial, IA generativa y aplicaciones profesionales.',
      steps: Object.freeze(['Fundamentos de IA', 'CT-GenAI y LLM', 'Aplicaciones profesionales'])
    }),
    Object.freeze({
      key: 'scrum-agility',
      name: 'Scrum y agilidad',
      description: 'Aprendizaje progresivo para fundamentos, Scrum Master y Product Owner.',
      steps: Object.freeze(['Fundamentos Scrum', 'Scrum Master', 'Product Owner'])
    }),
    Object.freeze({
      key: 'project-management',
      name: 'Gestión de proyectos',
      description: 'Planificación, riesgos, enfoques ágiles e híbridos y evolución hacia PMO.',
      steps: Object.freeze(['Fundamentos', 'Gestión ágil e híbrida', 'Riesgos y PMO'])
    }),
    Object.freeze({
      key: 'cybersecurity',
      name: 'Ciberseguridad',
      description: 'Concientizacion, amenazas, controles, identidad, incidentes, politicas y cumplimiento.',
      steps: Object.freeze(['Awareness', 'Controles basicos', 'Incidentes y cumplimiento'])
    })
  ]);

  const CERTIPROF_FREE_EXAMS = Object.freeze([
    Object.freeze({
      courseKey: 'project-management-essentials',
      label: 'Project Management Essentials',
      examUrl: 'https://open.certiprof.com/project-management-essentials-exam-sp',
      area: 'Project Management',
      summary: 'Fundamentos PM2, roles, fases, riesgos, cambios, calidad y cierre.'
    }),
    Object.freeze({
      courseKey: 'scrum-fundamentals',
      label: 'Scrum Fundamentals',
      examUrl: 'https://open.certiprof.com/scrum-foundation-exam',
      area: 'Scrum',
      summary: 'Scrum Guide 2020, empirismo, equipo, eventos, artefactos y compromisos.'
    }),
    Object.freeze({
      courseKey: 'cybersecurity-awareness',
      label: 'Cybersecurity Awareness',
      examUrl: 'https://open.certiprof.com/cybersecurity-awareness-exam-sp',
      area: 'Cybersecurity',
      summary: 'CIA, amenazas, controles, IAM, respuesta a incidentes y cumplimiento.'
    })
  ]);
  const DEFAULT_ROUTE_TILE_IMAGE = Object.freeze({
    src: 'assets/img/academiaqa-support.png',
    webp: 'assets/img/academiaqa-support-640.webp 640w, assets/img/academiaqa-support-1200.webp 1200w, assets/img/academiaqa-support-1983.webp 1983w',
    avif: 'assets/img/academiaqa-support-640.avif 640w, assets/img/academiaqa-support-1200.avif 1200w, assets/img/academiaqa-support-1983.avif 1983w',
    width: 1983,
    height: 793
  });
  const ROUTE_TILE_IMAGES = Object.freeze({
    'testing-istqb': Object.freeze({
      src: 'assets/img/routes/testing-istqb.jpg',
      webp: 'assets/img/routes/testing-istqb-640.webp 640w, assets/img/routes/testing-istqb-1200.webp 1200w',
      avif: 'assets/img/routes/testing-istqb-640.avif 640w, assets/img/routes/testing-istqb-1200.avif 1200w',
      width: 1200,
      height: 894
    }),
    'ai-automation': Object.freeze({
      src: 'assets/img/routes/ai-automation.jpg',
      webp: 'assets/img/routes/ai-automation-640.webp 640w, assets/img/routes/ai-automation-1200.webp 1200w',
      avif: 'assets/img/routes/ai-automation-640.avif 640w, assets/img/routes/ai-automation-1200.avif 1200w',
      width: 1200,
      height: 851
    }),
    'scrum-agility': Object.freeze({
      src: 'assets/img/routes/scrum-agility.jpg',
      webp: 'assets/img/routes/scrum-agility-640.webp 640w, assets/img/routes/scrum-agility-1200.webp 1200w',
      avif: 'assets/img/routes/scrum-agility-640.avif 640w, assets/img/routes/scrum-agility-1200.avif 1200w',
      width: 1200,
      height: 859
    }),
    cybersecurity: Object.freeze({
      src: 'assets/img/routes/cybersecurity.jpg',
      webp: 'assets/img/routes/cybersecurity-640.webp 640w, assets/img/routes/cybersecurity-1200.webp 1200w',
      avif: 'assets/img/routes/cybersecurity-640.avif 640w, assets/img/routes/cybersecurity-1200.avif 1200w',
      width: 1200,
      height: 861
    }),
    'project-management': Object.freeze({
      src: 'assets/img/routes/project-management.jpg',
      webp: 'assets/img/routes/project-management-640.webp 640w, assets/img/routes/project-management-1200.webp 1200w',
      avif: 'assets/img/routes/project-management-640.avif 640w, assets/img/routes/project-management-1200.avif 1200w',
      width: 1200,
      height: 894
    })
  });
  const NEW_COURSES_IMAGE = Object.freeze({
    src: 'assets/img/home/new-course.jpg',
    webp: 'assets/img/home/new-course-640.webp 640w, assets/img/home/new-course-1200.webp 1200w',
    avif: 'assets/img/home/new-course-640.avif 640w, assets/img/home/new-course-1200.avif 1200w',
    width: 1200,
    height: 907,
    alt: 'Nuevo curso de capacitación profesional avanzada en AcademiaQA'
  });
  const PUBLIC_VIEWS = new Set(['home', 'courses', 'routes', 'contact', 'legal', 'account', 'admin']);
  const PUBLIC_VIEW_PATHS = Object.freeze({
    home: '/',
    courses: '/cursos/',
    routes: '/ruta-aprendizaje/',
    contact: '/contactanos/',
    legal: '/legal/',
    account: '/mi-cuenta/',
    admin: '/admin/'
  });
  const COURSE_VIEW_ALIASES = Object.freeze({
    panel: 'dashboard',
    dashboard: 'dashboard',
    curso: 'dashboard',
    syllabus: 'study',
    estudiar: 'study',
    study: 'study',
    objetivos: 'objectives',
    lo: 'objectives',
    objectives: 'objectives',
    practica: 'practice',
    practice: 'practice',
    simulacro: 'exam',
    examen: 'exam',
    exam: 'exam',
    'examen-final': 'finalExam',
    final: 'finalExam',
    finalexam: 'finalExam',
    k3: 'k3lab',
    k3lab: 'k3lab',
    flashcards: 'flashcards',
    estadisticas: 'analytics',
    analytics: 'analytics'
  });
  const COURSE_VIEW_SEGMENTS = Object.freeze({
    dashboard: 'panel',
    study: 'syllabus',
    objectives: 'objetivos',
    practice: 'practica',
    exam: 'simulacro',
    finalExam: 'examen-final',
    k3lab: 'k3',
    flashcards: 'flashcards',
    analytics: 'estadisticas'
  });

  const VIEW_RENDERERS = Object.freeze({
    home: renderHome,
    courses: renderCoursesPage,
    routes: renderRoutesPage,
    contact: renderContactPage,
    legal: renderLegalPage,
    account: renderAccountPage,
    admin: renderAdminPage,
    authGate: renderCourseAuthGate,
    dashboard: renderDashboard,
    study: renderStudy,
    objectives: renderObjectives,
    practice: renderPractice,
    exam: renderExam,
    finalExam: renderFinalExam,
    k3lab: renderK3Lab,
    flashcards: renderFlashcards,
    analytics: renderAnalytics
  });

  const dom = {};
  let activeCourseKey = '';
  let course = null;
  let questions = [];
  let progressStorageKey = '';
  let state = createState('home');
  let paymentPopupLocked = false;
  let coffeeCopPerUsd = COFFEE_COP_PER_USD_FALLBACK;
  let coffeeTrmDate = COFFEE_TRM_FALLBACK_DATE;
  let coffeeTrmSource = 'fallback';
  let coffeeTrmRequest = null;
  let homeSliderTimer = null;
  let authGateRequest = null;
  let learningSnapshot = {
    profile: null,
    enrollments: [],
    progressByCourse: new Map(),
    coursesByKey: new Map()
  };
  let studyTimer = null;
  let lastStudyTickAt = Date.now();
  let lastUserActivityAt = Date.now();
  const loadingCourseScripts = new Map();

  function createState(view = 'home') {
    return {
      view,
      session: [],
      current: 0,
      answers: {},
      orders: {},
      mode: 'study',
      startTime: null,
      timer: null,
      pendingAdvance: null,
      examFocus: false,
      questionLocked: false,
      flashIndex: 0,
      flashShow: false,
      flashFilter: 'all',
      catalogFilter: 'all',
      homePanel: 'overview',
      homeSlide: 0,
      studyChapter: null,
      accountLoading: false,
      accountError: '',
      accountProfile: null,
      enrollments: [],
      adminLoading: false,
      adminError: '',
      adminSummary: {},
      adminUsers: [],
      adminTotal: 0,
      adminSearch: '',
      adminCoursesByKey: new Map(),
      practiceFilter: { ...DEFAULT_PRACTICE_FILTER }
    };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function polishText(value) {
    const replacements = {
      preparacion: 'preparación',
      adopcion: 'adopción',
      capitulos: 'capítulos',
      proteccion: 'protección',
      politicas: 'políticas'
    };

    return String(value ?? '').replace(/\b(preparacion|adopcion|capitulos|proteccion|politicas)\b/gi, (match) => {
      const replacement = replacements[match.toLowerCase()] || match;
      return match[0] === match[0]?.toUpperCase()
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement;
    });
  }

  function h(value) {
    return Security.escapeHtml(polishText(value));
  }

  function number(value, fallback = 0) {
    return Security.toFiniteNumber(value, fallback);
  }

  function setTextIfChanged(element, value) {
    const text = String(value ?? '');
    if (element && element.textContent !== text) element.textContent = text;
  }

  function notify(message, type = 'info', timeout = 5_000) {
    if (!dom.notice) return;
    dom.notice.textContent = String(message || '');
    dom.notice.className = `appNotice ${type}`;
    dom.notice.hidden = false;
    if (timeout > 0) {
      global.setTimeout(() => {
        if (dom.notice.textContent === String(message || '')) dom.notice.hidden = true;
      }, timeout);
    }
  }

  function showFatalError(error) {
    console.error(error);
    if (!dom.app) return;
    dom.app.innerHTML = `<div class="card"><h2>No fue posible iniciar la academia</h2><div class="badbox">${h(error?.message || error || 'Error desconocido.')}</div><p class="small">Revisa que se conserve la estructura completa de carpetas y que los archivos de cursos estén registrados en <span class="kbd">courses/catalog.js</span>.</p></div>`;
  }

  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = versionedAsset(rootRelativeAsset(src));
      script.async = false;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}.`)), { once: true });
      document.head.appendChild(script);
    });
  }

  function versionedAsset(src) {
    if (!ASSET_VERSION || /[?&]v=/.test(src)) return src;
    return `${src}${src.includes('?') ? '&' : '?'}v=${encodeURIComponent(ASSET_VERSION)}`;
  }

  function rootRelativeAsset(src) {
    const value = String(src || '');
    if (!value || /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('/') || value.startsWith('data:')) return value;
    return `/${value.replace(/^\.?\//, '')}`;
  }

  function rootRelativeSrcset(srcset) {
    return String(srcset || '')
      .split(',')
      .map((part) => {
        const [url, ...descriptor] = part.trim().split(/\s+/);
        return [rootRelativeAsset(url), ...descriptor].join(' ').trim();
      })
      .join(', ');
  }

  async function loadCourses() {
    const catalog = Array.isArray(global.ACADEMY_CATALOG) ? global.ACADEMY_CATALOG : [];
    if (!catalog.length) throw new Error('El catálogo de cursos está vacío.');

    for (const item of catalog) {
      if (!item || typeof item.src !== 'string') throw new Error('El catálogo contiene una entrada inválida.');
    }

  }

  async function ensureCourseLoaded(key) {
    const normalizedKey = String(key || '').trim().toLowerCase();
    if (Registry.has(normalizedKey)) return Registry.get(normalizedKey);

    const entry = catalogEntry(normalizedKey);
    if (!entry?.src) throw new Error(`El curso "${normalizedKey}" no está registrado en el catálogo.`);

    if (!loadingCourseScripts.has(normalizedKey)) {
      loadingCourseScripts.set(normalizedKey, loadScript(entry.src).finally(() => loadingCourseScripts.delete(normalizedKey)));
    }

    await loadingCourseScripts.get(normalizedKey);
    if (!Registry.has(normalizedKey)) throw new Error(`No se pudo registrar el curso "${normalizedKey}".`);
    return Registry.get(normalizedKey);
  }

  function bindDom() {
    dom.siteMenu = $('siteMenu');
    dom.siteMenuToggle = document.querySelector('[data-action="toggle-site-menu"]');
    dom.siteHeader = $('inicio');
    dom.app = $('app');
    dom.notice = $('appNotice');
    dom.coffeeModal = $('coffeeModal');
    dom.coffeeCopHint = $('coffeeCopHint');
    dom.certificateModal = $('certificateModal');
    dom.certificateCourseName = $('certificateCourseName');
    dom.mainLayout = $('mainLayout');
    dom.heroTitle = $('heroTitle');
    dom.heroSubtitle = $('heroSubtitle');
    dom.topChapters = $('topChapters');
    dom.topBank = $('topBank');
    dom.topExam = $('topExam');
    dom.navCaps = $('navCaps');
    dom.navExamCount = $('navExamCount');
    dom.footerText = $('footerText');
    dom.resetProgress = $('resetProgress');
  }

  function bindEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('keydown', handleKeyboardActivation);
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, noteUserActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleStudyVisibilityChange);
    global.addEventListener('pagehide', persistStudyTime);
    global.addEventListener('hashchange', handleLocationRoute);
    global.addEventListener('popstate', handleLocationRoute);
    global.addEventListener('academiaqa:auth-change', handleAuthStateChange);
    global.addEventListener('academiaqa:admin-change', handleAdminAccessChange);

    dom.resetProgress.addEventListener('click', async () => {
      if (!course) return;
      if (!global.confirm('¿Borrar estadísticas, intentos y preguntas marcadas para repaso?')) return;
      const ok = Storage.removeProgress(progressStorageKey);
      if (ok && Auth?.isAuthenticated?.()) {
        try {
          await Cloud.syncProgress(activeCourseKey, Storage.getProgress(progressStorageKey));
        } catch (error) {
          console.error(error);
          notify('El avance local se borró, pero no fue posible actualizar la nube.', 'warning');
          render();
          return;
        }
      }
      notify(ok ? 'El avance del curso fue eliminado en este dispositivo y en la nube.' : 'No fue posible borrar el avance.', ok ? 'success' : 'error');
      render();
    });
  }

  async function handleAuthStateChange(event) {
    const authenticated = Boolean(event.detail?.authenticated);
    if (!authenticated) {
      persistStudyTime();
      stopStudyTimer();
      learningSnapshot = { profile: null, enrollments: [], progressByCourse: new Map(), coursesByKey: new Map() };
      if (course && !PUBLIC_VIEWS.has(state.view)) {
        const requestedView = state.view;
        showCourseAuthGate(activeCourseKey, { view: requestedView, updateHash: false });
      } else {
        render();
      }
      return;
    }
    if (state.view === 'account') {
      if (authenticated) await refreshAccount();
      else render();
      return;
    }
    if (state.view === 'admin') {
      if (authenticated) {
        await Auth?.refreshAdminAccess?.();
        if (Auth?.isAdmin?.()) await refreshAdmin();
        else render();
      } else render();
      return;
    }
    if (authenticated && state.view === 'authGate' && authGateRequest) {
      await setCourse(authGateRequest.key, authGateRequest.options);
      return;
    }
    if (authenticated) {
      try {
        await refreshLearningSnapshot();
        if (PUBLIC_VIEWS.has(state.view)) render();
      } catch (error) {
        console.error('No fue posible actualizar el resumen de aprendizaje.', error);
      }
    }
  }

  function handleAdminAccessChange() {
    if (state.view !== 'admin') return;
    render();
  }

  async function handleSubmit(event) {
    const form = event.target.closest('[data-admin-search-form]');
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    state.adminSearch = String(data.get('search') || '').trim().slice(0, 120);
    await refreshAdmin();
  }

  function handleKeyboardActivation(event) {
    if (event.key === 'Escape') {
      closeCoffeeModal();
      closeCertificateModal();
      closeSiteMenu();
      return;
    }

    if (!['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest('[role="button"][data-action], [role="button"][data-view]');
    if (!target) return;
    event.preventDefault();
    target.click();
  }

  async function handleClick(event) {
    const paymentTrigger = event.target.closest('.coffeeLink, .coffeeCta');
    if (paymentTrigger) {
      event.preventDefault();
      openCoffeeModal();
      return;
    }

    if (event.target === dom.coffeeModal) {
      closeCoffeeModal();
      return;
    }

    if (event.target === dom.certificateModal) {
      closeCertificateModal();
      return;
    }

    const homeAnchor = event.target.closest('[data-home-anchor]');
    if (homeAnchor) {
      event.preventDefault();
      if (homeAnchor.dataset.homePanel) {
        state.homePanel = homeAnchor.dataset.homePanel;
        if (state.view === 'home') render();
      } else if ((homeAnchor.dataset.homeAnchor || 'inicio') === 'inicio') {
        state.homePanel = 'overview';
        if (state.view === 'home') render();
      }
      goToHomeAnchor(homeAnchor.dataset.homeAnchor || 'inicio');
      return;
    }

    const viewButton = event.target.closest('[data-view]');
    if (viewButton) {
      event.preventDefault();
      closeSiteMenu();
      const anchor = viewButton.dataset.viewAnchor;
      await showView(viewButton.dataset.view);
      if (anchor) scrollToAnchor(anchor);
      return;
    }

    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    if (isInternalHref(actionTarget.getAttribute('href'))) event.preventDefault();

    const action = actionTarget.dataset.action;
    switch (action) {
      case 'select-course':
        await setCourse(actionTarget.dataset.course);
        break;
      case 'sign-in-google':
        await Auth?.signInWithGoogle?.();
        break;
      case 'retry-course':
        await setCourse(actionTarget.dataset.course, {
          view: actionTarget.dataset.courseView || 'dashboard',
          updateHash: false
        });
        break;
      case 'cancel-enrollment':
        await cancelEnrollment(actionTarget.dataset.course);
        break;
      case 'delete-enrollment':
        await deleteEnrollment(actionTarget.dataset.course);
        break;
      case 'reactivate-enrollment':
        await setCourse(actionTarget.dataset.course);
        break;
      case 'filter-courses':
        state.catalogFilter = learningRoute(actionTarget.dataset.filter)
          ? actionTarget.dataset.filter
          : 'all';
        if (actionTarget.dataset.filterScope === 'home' && state.view === 'home') {
          render();
          global.setTimeout(() => $('home-cursos-disponibles')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
        } else {
          if (state.view !== 'courses') await showView('courses');
          else render();
          global.setTimeout(() => $('cursos-disponibles')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
        }
        break;
      case 'home-slide-prev':
        shiftHomeSlide(-1);
        break;
      case 'home-slide-next':
        shiftHomeSlide(1);
        break;
      case 'home-slide-go':
        setHomeSlide(actionTarget.dataset.slide);
        break;
      case 'send-contact-message':
        sendContactMessage();
        break;
      case 'select-coffee-tier':
        selectCoffeeTier(actionTarget);
        break;
      case 'continue-wompi':
        closeCoffeeModal();
        openPaymentPopup();
        break;
      case 'close-coffee-modal':
        closeCoffeeModal();
        break;
      case 'open-certificate-coming-soon':
        openCertificateModal(actionTarget.dataset.course);
        break;
      case 'close-certificate-modal':
        closeCertificateModal();
        break;
      case 'toggle-site-menu':
        toggleSiteMenu();
        break;
      case 'close-site-menu':
        closeSiteMenu();
        break;
      case 'open-chapter':
        openChapter(Number(actionTarget.dataset.chapter));
        break;
      case 'practice':
        startPractice({
          chapter: actionTarget.dataset.chapter || 'all',
          lo: actionTarget.dataset.lo || 'all',
          k: actionTarget.dataset.k || 'all',
          count: Number(actionTarget.dataset.count || 10),
          mode: actionTarget.dataset.mode || 'study'
        });
        break;
      case 'practice-filters':
        startPracticeFromFilters(actionTarget.dataset.mode || 'study');
        break;
      case 'select-option':
        selectOption(Number(actionTarget.dataset.optionIndex));
        break;
      case 'previous-question':
        previousQuestion();
        break;
      case 'check-or-next':
        checkOrNext();
        break;
      case 'toggle-marked':
        toggleMarked();
        break;
      case 'finish-session':
        finishSession();
        break;
      case 'start-official-exam':
        startOfficialExam();
        break;
      case 'start-final-exam':
        startFinalExam();
        break;
      case 'flash-toggle':
        state.flashShow = !state.flashShow;
        render();
        break;
      case 'flash-previous':
        state.flashIndex -= 1;
        state.flashShow = false;
        render();
        break;
      case 'flash-next':
        state.flashIndex += 1;
        state.flashShow = false;
        render();
        break;
      case 'flash-random': {
        const list = flashList();
        state.flashIndex = list.length ? randomInt(list.length) : 0;
        state.flashShow = false;
        render();
        break;
      }
      default:
        console.warn(`Acción no reconocida: ${action}`);
    }
  }

  function toggleSiteMenu(forceOpen) {
    if (!dom.siteMenu || !dom.siteMenuToggle) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !dom.siteMenu.classList.contains('open');
    dom.siteMenu.classList.toggle('open', shouldOpen);
    dom.siteMenuToggle.setAttribute('aria-expanded', String(shouldOpen));
  }

  function closeSiteMenu() {
    toggleSiteMenu(false);
  }

  function firstCatalogKey() {
    return catalogEntries()[0]?.key || '';
  }

  function normalizeCourseView(view) {
    return COURSE_VIEW_ALIASES[String(view || '').trim().toLowerCase()] || 'dashboard';
  }

  function courseHash(key, view = 'dashboard') {
    const segment = COURSE_VIEW_SEGMENTS[view] || 'panel';
    return `#curso/${encodeURIComponent(key)}/${segment}`;
  }

  function publicPath(view = 'home') {
    return PUBLIC_VIEW_PATHS[view] || PUBLIC_VIEW_PATHS.home;
  }

  function coursePath(key, view = 'dashboard') {
    const segment = COURSE_VIEW_SEGMENTS[view] || 'panel';
    const base = `/curso/${encodeURIComponent(key)}/`;
    return view === 'dashboard' ? base : `${base}${segment}/`;
  }

  function chapterPath(key, chapterId) {
    return `/curso/${encodeURIComponent(key)}/capitulo/${encodeURIComponent(chapterId)}/`;
  }

  function routePathForView(view = state.view) {
    if (PUBLIC_VIEWS.has(view)) return publicPath(view);
    if (view === 'study' && state.studyChapter) return chapterPath(activeCourseKey, state.studyChapter);
    return course ? coursePath(activeCourseKey, view) : publicPath('home');
  }

  function isInternalHref(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return false;
    try {
      const url = new URL(href, global.location.href);
      return url.origin === global.location.origin;
    } catch {
      return false;
    }
  }

  function pushRoute(path) {
    if (!path || !global.history?.pushState) return;
    const next = new URL(path, global.location.href);
    const current = `${global.location.pathname}${global.location.search}${global.location.hash}`;
    const target = `${next.pathname}${next.search}${next.hash}`;
    if (target !== current) global.history.pushState(null, '', target);
  }

  function routeFromHash(hash = global.location.hash) {
    const anchor = String(hash || '').replace(/^#/, '') || 'inicio';
    const [root, courseKey, view, chapterId] = anchor.split('/');
    if (root === 'curso' && courseKey) {
      return {
        view: view === 'capitulo' ? 'study' : normalizeCourseView(view),
        anchor: '',
        course: decodeURIComponent(courseKey).trim().toLowerCase(),
        chapter: view === 'capitulo' ? Number(chapterId) || null : null
      };
    }

    if (['cursos', 'cursos-disponibles'].includes(anchor)) return { view: 'courses', anchor: 'cursos-disponibles' };
    if (anchor === 'ruta-aprendizaje') return { view: 'routes', anchor: 'ruta-aprendizaje' };
    if (['contactanos', 'redes'].includes(anchor)) return { view: 'contact', anchor: 'contactanos' };
    if (['legal', 'privacidad', 'terminos'].includes(anchor)) return { view: 'legal', anchor };
    if (['mi-cuenta', 'cuenta'].includes(anchor)) return { view: 'account', anchor: 'mi-cuenta' };
    if (['admin', 'administracion'].includes(anchor)) return { view: 'admin', anchor: 'admin' };
    if (['como-estudiar'].includes(anchor)) return { view: 'home', anchor };
    return { view: 'home', anchor: 'inicio' };
  }

  function routeFromPath(pathname = global.location.pathname) {
    const normalized = decodeURIComponent(String(pathname || '/'))
      .replace(/\/index\.html$/i, '/')
      .replace(/\/+$/, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (!parts.length) return { view: 'home', anchor: 'inicio' };

    if (parts.length === 1) {
      if (parts[0] === 'cursos') return { view: 'courses', anchor: 'cursos-disponibles' };
      if (parts[0] === 'ruta-aprendizaje') return { view: 'routes', anchor: 'ruta-aprendizaje' };
      if (parts[0] === 'contactanos') return { view: 'contact', anchor: 'contactanos' };
      if (parts[0] === 'legal') return { view: 'legal', anchor: 'legal' };
      if (parts[0] === 'mi-cuenta') return { view: 'account', anchor: 'mi-cuenta' };
      if (parts[0] === 'admin') return { view: 'admin', anchor: 'admin' };
    }

    if (parts[0] === 'curso' && parts[1]) {
      return {
        view: parts[2] === 'capitulo' ? 'study' : normalizeCourseView(parts[2] || 'panel'),
        anchor: '',
        course: parts[1].trim().toLowerCase(),
        chapter: parts[2] === 'capitulo' ? Number(parts[3]) || null : null
      };
    }

    return { view: 'home', anchor: 'inicio' };
  }

  function routeFromLocation() {
    const hash = String(global.location.hash || '');
    return hash && hash !== '#' ? routeFromHash(hash) : routeFromPath();
  }

  function scrollToAnchor(anchor) {
    global.setTimeout(() => {
      const target = $(anchor) || (anchor === 'inicio' ? document.querySelector('header') : null);
      target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function goToHomeAnchor(anchorId) {
    closeSiteMenu();
    if (state.view !== 'home') setView('home');
    scrollToAnchor(anchorId);
  }

  async function handleLocationRoute() {
    const route = routeFromLocation();
    if (route.course) {
      await setCourse(route.course, { view: route.view, chapter: route.chapter, updateHash: false });
      return;
    }

    if (state.view !== route.view) await showView(route.view, { updateHash: false });
    scrollToAnchor(route.anchor);
  }

  function openCoffeeModal() {
    closeSiteMenu();
    if (!dom.coffeeModal) {
      openPaymentPopup();
      return;
    }
    dom.coffeeModal.hidden = false;
    document.body.classList.add('modalOpen');
    updateCoffeeAmount();
    loadCurrentTrm().then(updateCoffeeAmount).catch(() => updateCoffeeAmount());
    global.setTimeout(() => dom.coffeeModal.querySelector('.coffeeOption.active, .coffeeCheckout')?.focus(), 0);
  }

  function closeCoffeeModal() {
    if (!dom.coffeeModal || dom.coffeeModal.hidden) return;
    dom.coffeeModal.hidden = true;
    if (!dom.certificateModal || dom.certificateModal.hidden) document.body.classList.remove('modalOpen');
  }

  function openCertificateModal(courseKey) {
    if (!dom.certificateModal) return;
    closeCoffeeModal();
    const entry = catalogEntry(courseKey);
    setTextIfChanged(dom.certificateCourseName, entry?.meta?.name || courseKey || 'este curso');
    dom.certificateModal.hidden = false;
    document.body.classList.add('modalOpen');
    global.setTimeout(() => dom.certificateModal.querySelector('[data-action="close-certificate-modal"]')?.focus(), 0);
  }

  function closeCertificateModal() {
    if (!dom.certificateModal || dom.certificateModal.hidden) return;
    dom.certificateModal.hidden = true;
    if (!dom.coffeeModal || dom.coffeeModal.hidden) document.body.classList.remove('modalOpen');
  }

  function selectCoffeeTier(target) {
    if (!dom.coffeeModal || !target) return;
    dom.coffeeModal.querySelectorAll('.coffeeOption').forEach((button) => {
      const active = button === target;
      button.classList.toggle('active', active);
      const label = button.querySelector('small');
      if (active && !label) button.insertAdjacentHTML('afterbegin', '<small>Elegido</small>');
      if (!active) label?.remove();
    });
    updateCoffeeAmount();
  }

  function selectedCoffeeOption() {
    return dom.coffeeModal?.querySelector('.coffeeOption.active') || null;
  }

  function selectedCoffeeUsd() {
    return number(selectedCoffeeOption()?.dataset.usd, 10);
  }

  function coffeeCopAmount(usd = selectedCoffeeUsd()) {
    return Math.round(number(usd, 10) * coffeeCopPerUsd);
  }

  function formatCopAmount(value) {
    return `COP $${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(number(value, 0))}`;
  }

  function formatTrmDate(value) {
    const [date] = String(value || '').split('T');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'fecha no disponible';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  function trmSourceLabel() {
    const date = formatTrmDate(coffeeTrmDate);
    return coffeeTrmSource === 'datos.gov.co'
      ? `TRM vigente ${date}`
      : `TRM referencial ${date}`;
  }

  async function loadCurrentTrm() {
    if (coffeeTrmSource === 'datos.gov.co') return coffeeCopPerUsd;
    if (coffeeTrmRequest) return coffeeTrmRequest;
    if (typeof global.fetch !== 'function') return coffeeCopPerUsd;

    coffeeTrmRequest = global.fetch(TRM_API_URL, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`TRM HTTP ${response.status}`);
        return response.json();
      })
      .then((records) => {
        const record = Array.isArray(records) ? records[0] : null;
        const value = number(record?.valor, 0);
        if (value <= 0) throw new Error('TRM inválida');
        coffeeCopPerUsd = value;
        coffeeTrmDate = record?.vigenciadesde || record?.vigenciahasta || coffeeTrmDate;
        coffeeTrmSource = 'datos.gov.co';
        return coffeeCopPerUsd;
      })
      .catch((error) => {
        console.warn('No fue posible actualizar la TRM; se usa valor referencial.', error);
        coffeeTrmRequest = null;
        return coffeeCopPerUsd;
      });

    return coffeeTrmRequest;
  }

  function updateCoffeeAmount() {
    if (!dom.coffeeModal) return;
    dom.coffeeModal.querySelectorAll('.coffeeOption').forEach((button) => {
      const amount = coffeeCopAmount(button.dataset.usd);
      const label = button.querySelector('em');
      if (label) label.textContent = formatCopAmount(amount);
    });

    const usd = selectedCoffeeUsd();
    const cop = formatCopAmount(coffeeCopAmount(usd));
    if (dom.coffeeCopHint) {
      dom.coffeeCopHint.textContent = `Seleccionaste USD ${usd}. Valor referencial: ${cop} (${trmSourceLabel()}). En Wompi confirma el valor final en COP.`;
    }

    const checkout = dom.coffeeModal.querySelector('.coffeeCheckout');
    if (checkout) checkout.textContent = `Continuar con Wompi · ${cop}`;
  }

  function openPaymentPopup() {
    if (paymentPopupLocked) return;
    paymentPopupLocked = true;
    global.setTimeout(() => {
      paymentPopupLocked = false;
    }, PAYMENT_POPUP_LOCK_MS);

    closeSiteMenu();
    const width = 520;
    const height = 720;
    const left = Math.max(0, Math.round((global.screen.width - width) / 2));
    const top = Math.max(0, Math.round((global.screen.height - height) / 2));
    const popup = global.open(
      WOMPI_PAYMENT_URL,
      'academiaqaWompi',
      `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener`
    );
    if (!popup) global.location.href = WOMPI_PAYMENT_URL;
  }

  function handleChange(event) {
    if (event.target.id === 'flashFilter') {
      state.flashFilter = event.target.value;
      state.flashIndex = 0;
      state.flashShow = false;
      render();
    }
  }

  function clearRuntimeTimers() {
    clearHomeSlider();
    if (state.timer) global.clearInterval(state.timer);
    if (state.pendingAdvance) global.clearTimeout(state.pendingAdvance);
    state.timer = null;
    state.pendingAdvance = null;
    setExamFocus(false);
  }

  function noteUserActivity() {
    lastUserActivityAt = Date.now();
  }

  function accumulateStudyTime(now = Date.now(), allowHidden = false) {
    const elapsedSeconds = Math.min(60, Math.max(0, Math.floor((now - lastStudyTickAt) / 1_000)));
    lastStudyTickAt = now;
    if (!elapsedSeconds || !course || !progressStorageKey || !Auth?.isAuthenticated?.()) return;
    if (!allowHidden && document.visibilityState !== 'visible') return;
    if (now - lastUserActivityAt > 120_000) return;
    if (PUBLIC_VIEWS.has(state.view) || state.view === 'authGate') return;

    const progress = getProgress();
    progress.studySeconds = Math.min(315360000, number(progress.studySeconds) + elapsedSeconds);
    if (state.view === 'study' && state.studyChapter) {
      const chapterId = String(state.studyChapter);
      const current = progress.chapterActivity?.[chapterId] || {};
      progress.chapterActivity = progress.chapterActivity || {};
      progress.chapterActivity[chapterId] = {
        studySeconds: Math.min(315360000, number(current.studySeconds) + elapsedSeconds),
        visitedAt: current.visitedAt || new Date(now).toISOString(),
        lastStudiedAt: new Date(now).toISOString()
      };
    }
    saveProgress(progress);
  }

  function startStudyTimer() {
    if (studyTimer) global.clearInterval(studyTimer);
    lastStudyTickAt = Date.now();
    lastUserActivityAt = Date.now();
    studyTimer = global.setInterval(() => accumulateStudyTime(), 15_000);
  }

  function stopStudyTimer() {
    if (studyTimer) global.clearInterval(studyTimer);
    studyTimer = null;
    lastStudyTickAt = Date.now();
  }

  function persistStudyTime() {
    accumulateStudyTime(Date.now(), true);
    if (activeCourseKey && Auth?.isAuthenticated?.()) {
      Promise.resolve(Cloud.flushProgress(activeCourseKey)).catch(() => {});
    }
  }

  function handleStudyVisibilityChange() {
    if (document.visibilityState === 'hidden') persistStudyTime();
    else {
      lastStudyTickAt = Date.now();
      lastUserActivityAt = Date.now();
    }
  }

  function setExamFocus(active) {
    state.examFocus = Boolean(active);
    document.body.classList.toggle('examFocusMode', state.examFocus);
  }

  function estimatedCourseHours(courseData) {
    const theoryMinutes = (courseData?.chapters || []).reduce((sum, chapter) => (
      sum + Math.max(0, number(chapter.minutes))
    ), 0);
    const practiceMinutes = Math.min(200, courseData?.questions?.length || 0) * 2;
    const simulatorMinutes = Math.max(0, number(courseData?.blueprint?.minutes)) * 3;
    return Math.max(1, Math.min(500, Math.ceil((theoryMinutes + practiceMinutes + simulatorMinutes) / 60)));
  }

  function showCourseAuthGate(key, options = {}, error = '') {
    clearRuntimeTimers();
    stopStudyTimer();
    activeCourseKey = String(key || '').trim().toLowerCase();
    course = null;
    questions = [];
    progressStorageKey = '';
    authGateRequest = {
      key: activeCourseKey,
      options: {
        view: options.view || 'dashboard',
        chapter: Number(options.chapter) || null,
        updateHash: false
      }
    };
    state = createState('authGate');
    state.authGateError = String(error || '');
    render();
    if (options.updateHash !== false) {
      pushRoute(coursePath(activeCourseKey, options.view || 'dashboard'));
    }
  }

  async function setCourse(key, options = {}) {
    const normalizedKey = String(key || '').trim().toLowerCase();
    if (!catalogEntry(normalizedKey)?.src) {
      notify('La certificación seleccionada no existe en el catálogo.', 'error');
      return false;
    }

    await Auth?.whenReady?.();
    if (!Auth?.isAuthenticated?.()) {
      showCourseAuthGate(normalizedKey, options);
      return false;
    }

    persistStudyTime();
    stopStudyTimer();
    clearRuntimeTimers();
    let loadedCourse;
    try {
      loadedCourse = await ensureCourseLoaded(normalizedKey);
      const nextStorageKey = loadedCourse.meta?.storageKey || `academy_${normalizedKey}_progress`;
      const enrollment = await Cloud.enroll(normalizedKey, estimatedCourseHours(loadedCourse));
      const localProgress = Storage.getProgress(nextStorageKey);
      const cloudProgress = await Cloud.loadProgress(normalizedKey);
      const mergedProgress = Cloud.mergeProgress(localProgress, cloudProgress);
      const localSave = Storage.saveProgress(nextStorageKey, mergedProgress);
      if (!localSave.ok) throw new Error('No fue posible preparar el progreso local.');
      await Cloud.syncProgress(normalizedKey, mergedProgress);
      updateLearningSnapshot(normalizedKey, loadedCourse, mergedProgress, enrollment);
    } catch (error) {
      console.error(error);
      showCourseAuthGate(normalizedKey, options, 'No fue posible conectar la matrícula y el progreso con la nube. Intenta nuevamente.');
      return false;
    }

    course = loadedCourse;
    activeCourseKey = normalizedKey;
    questions = [...course.questions];
    progressStorageKey = course.meta?.storageKey || `academy_${normalizedKey}_progress`;
    state = createState(options.view || 'dashboard');
    state.studyChapter = Number(options.chapter) || null;
    authGateRequest = null;
    Storage.setActiveCourse(normalizedKey);
    updateCourseUi();
    startStudyTimer();
    render();
    if (options.updateHash !== false && !PUBLIC_VIEWS.has(state.view)) {
      pushRoute(coursePath(normalizedKey, state.view));
    }
    return true;
  }

  async function showView(view, options = {}) {
    if (!VIEW_RENDERERS[view]) return;
    if (view === 'account') {
      setView('account', options);
      await Auth?.whenReady?.();
      if (Auth?.isAuthenticated?.()) await refreshAccount();
      return;
    }
    if (view === 'admin') {
      setView('admin', options);
      await Auth?.whenReady?.();
      if (Auth?.isAuthenticated?.()) await Auth?.refreshAdminAccess?.();
      if (Auth?.isAdmin?.()) await refreshAdmin();
      else render();
      return;
    }
    if (!PUBLIC_VIEWS.has(view) && !course) {
      await setCourse(activeCourseKey || Storage.getActiveCourse() || firstCatalogKey(), { view, updateHash: options.updateHash });
      return;
    }

    setView(view, options);
  }

  function setView(view, options = {}) {
    if (!VIEW_RENDERERS[view]) return;
    if (!PUBLIC_VIEWS.has(view) && view !== 'authGate' && !course) return;
    if (view !== state.view) {
      accumulateStudyTime();
      clearRuntimeTimers();
    }
    state.view = view;
    if (view === 'home') state.homePanel = 'overview';
    state.session = ['practice', 'exam', 'finalExam'].includes(view) ? state.session : [];
    syncNavigationState();
    render();
    if (options.updateHash !== false) {
      pushRoute(routePathForView(view));
    }
  }

  function syncNavigationState() {
    const finalExamDetails = course ? courseProgressDetails(activeCourseKey, course) : null;
    document.querySelectorAll('.navbtn[data-view], .siteNav [data-view]').forEach((item) => {
      const active = item.dataset.view === state.view;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    document.querySelectorAll('.navbtn[data-view="finalExam"]').forEach((item) => {
      const locked = !finalExamDetails?.finalExamEligible;
      item.disabled = locked;
      item.classList.toggle('locked', locked);
      item.setAttribute('aria-disabled', String(locked));
      item.title = locked
        ? `Completa el ${FINAL_EXAM_UNLOCK_PROGRESS}% del curso para habilitar el examen final.`
        : 'Presentar examen final';
      setTextIfChanged(item.querySelector('small'), finalExamDetails?.finalExamPassed
        ? 'aprobado'
        : locked ? `${finalExamDetails?.progressPercent || 0}% / ${FINAL_EXAM_UNLOCK_PROGRESS}%` : 'habilitado');
    });
  }

  function getProgress() {
    return Storage.getProgress(progressStorageKey);
  }

  function saveProgress(progress) {
    const result = Storage.saveProgress(progressStorageKey, progress);
    if (!result.ok) notify('No fue posible guardar el progreso en este navegador.', 'warning');
    if (result.ok && activeCourseKey && Auth?.isAuthenticated?.()) {
      const normalized = Storage.normalizeProgress(progress);
      learningSnapshot.progressByCourse.set(activeCourseKey, normalized);
      const enrollment = learningSnapshot.enrollments.find((item) => item.course_key === activeCourseKey);
      if (enrollment) enrollment.study_seconds = Math.max(number(enrollment.study_seconds), number(normalized.studySeconds));
      Cloud.queueProgressSync(activeCourseKey, progress);
    }
  }

  function updateEnrollmentSnapshot(value) {
    if (!value?.course_key) return;
    const index = learningSnapshot.enrollments.findIndex((item) => item.course_key === value.course_key);
    if (index >= 0) learningSnapshot.enrollments[index] = { ...learningSnapshot.enrollments[index], ...value };
    else learningSnapshot.enrollments.push(value);
  }

  function updateLearningSnapshot(key, courseData, progress, enrollment = null) {
    const courseKey = String(key || '').trim().toLowerCase();
    if (!courseKey) return;
    if (courseData) learningSnapshot.coursesByKey.set(courseKey, courseData);
    if (progress) learningSnapshot.progressByCourse.set(courseKey, Storage.normalizeProgress(progress));
    if (enrollment) updateEnrollmentSnapshot(enrollment);
  }

  async function refreshLearningSnapshot({ includeProfile = false } = {}) {
    if (!Auth?.isAuthenticated?.()) {
      learningSnapshot = { profile: null, enrollments: [], progressByCourse: new Map(), coursesByKey: new Map() };
      return learningSnapshot;
    }

    const profileRequest = includeProfile ? Cloud.getProfile() : Promise.resolve(learningSnapshot.profile);
    const [profile, enrollments] = await Promise.all([profileRequest, Cloud.listEnrollments()]);
    const progressByCourse = new Map();
    const coursesByKey = new Map();
    await Promise.all(enrollments.map(async (enrollment) => {
      const key = enrollment.course_key;
      if (!catalogEntry(key)?.src) return;
      const [loadedCourse, progress] = await Promise.all([
        ensureCourseLoaded(key),
        Cloud.loadProgress(key)
      ]);
      coursesByKey.set(key, loadedCourse);
      progressByCourse.set(key, progress);
      const storageKey = loadedCourse.meta?.storageKey || `academy_${key}_progress`;
      const merged = Cloud.mergeProgress(Storage.getProgress(storageKey), progress);
      Storage.saveProgress(storageKey, merged);
      progressByCourse.set(key, merged);
    }));

    learningSnapshot = {
      profile: profile || null,
      enrollments,
      progressByCourse,
      coursesByKey
    };
    return learningSnapshot;
  }

  function compactText(value, max = 155) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    return `${text.slice(0, max - 3).replace(/\s+\S*$/, '').replace(/[.,;:!?-]+$/, '')}...`;
  }

  function seoCourseLabel() {
    if (activeCourseKey === 'ctfl') return 'CTFL 4.0';
    if (activeCourseKey === 'ctai') return 'CT-AI 2.0';
    return course?.meta?.code || course?.meta?.shortName || activeCourseKey.toUpperCase();
  }

  function currentSeoMetadata() {
    const publicMetadata = {
      home: ['Cursos QA gratis y simulacros ISTQB | AcademiaQA', Config.description],
      courses: ['Cursos gratis de QA, Testing, IA y Scrum | AcademiaQA', 'Explora cursos gratis de QA, testing, IA, Scrum, gestión de proyectos y ciberseguridad con syllabus, práctica y simulacros.'],
      routes: ['Rutas para aprender QA, Testing, IA y Scrum | AcademiaQA', 'Elige una ruta gratuita en QA, testing, IA, Scrum, gestión de proyectos o ciberseguridad y avanza hasta el simulacro.'],
      contact: ['Contáctanos | AcademiaQA', 'Contacta a AcademiaQA para reportar un problema, sugerir una mejora académica o proponer una colaboración para la comunidad QA.'],
      legal: ['Información legal y privacidad | AcademiaQA', 'Consulta la política de privacidad, los términos de uso y el aviso de plataforma educativa independiente de AcademiaQA.'],
      account: ['Mi cuenta | AcademiaQA', 'Consulta tus matrículas, avance y actividad de aprendizaje en AcademiaQA.'],
      admin: ['Administración | AcademiaQA', 'Panel privado de usuarios y aprendizaje de AcademiaQA.']
    };
    if (PUBLIC_VIEWS.has(state.view)) {
      const [title, description] = publicMetadata[state.view] || publicMetadata.home;
      return { title, description: compactText(description), path: publicPath(state.view) };
    }

    const label = seoCourseLabel();
    if (state.view === 'exam') {
      const blueprint = course?.blueprint || {};
      return {
        title: `Simulacro ${catalogEntry(activeCourseKey).family === 'ISTQB' ? 'ISTQB ' : ''}${label} gratis | AcademiaQA`,
        description: compactText(`Practica con el simulacro de ${label}: ${blueprint.totalQuestions || 0} preguntas, ${blueprint.minutes || 0} minutos y aprobación de ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}. Acceso gratis en AcademiaQA.`),
        path: coursePath(activeCourseKey, 'exam')
      };
    }

    if (state.view === 'finalExam') {
      const blueprint = course?.blueprint || {};
      return {
        title: `Examen final ${label} | AcademiaQA`,
        description: compactText(`Examen final interno de ${label}: ${blueprint.totalQuestions || 0} preguntas, ${blueprint.minutes || 0} minutos y aprobación de ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}.`),
        path: coursePath(activeCourseKey, 'finalExam')
      };
    }

    if (state.view === 'study' && state.studyChapter) {
      const chapter = course?.chapters?.find((item) => Number(item.id) === Number(state.studyChapter));
      if (chapter) {
        const detailedTitle = `C${chapter.id}: ${chapter.title} | ${label} - AcademiaQA`;
        return {
          title: detailedTitle.length <= 65 ? detailedTitle : `Capítulo ${chapter.id} ${label} | AcademiaQA`,
          description: compactText(`Capítulo ${chapter.id} de ${label}: ${chapter.summary} Estudia objetivos LO, términos y ejemplos en AcademiaQA.`),
          path: chapterPath(activeCourseKey, chapter.id)
        };
      }
    }

    return {
      title: `Curso ${catalogEntry(activeCourseKey).family === 'ISTQB' ? 'ISTQB ' : ''}${label} gratis y simulador | AcademiaQA`,
      description: compactText(course?.meta?.subtitle || `Estudia ${label} gratis con syllabus, práctica y simulacro en AcademiaQA.`),
      path: coursePath(activeCourseKey)
    };
  }

  function updateDocumentMetadata() {
    const metadata = currentSeoMetadata();
    const canonicalUrl = new URL(metadata.path, CANONICAL_ORIGIN).href;
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('link[rel="alternate"][hreflang="es-CO"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', ['account', 'admin', 'finalExam'].includes(state.view) ? 'noindex, nofollow' : 'index, follow');
  }

  function updateCourseUi() {
    const isAuthGate = state.view === 'authGate';
    const isPublicView = PUBLIC_VIEWS.has(state.view) || isAuthGate;
    const gateEntry = catalogEntry(activeCourseKey);
    const allCourses = publicCourseEntries();
    const totalBank = allCourses.reduce((sum, [, item]) => sum + courseQuestionCount(item), 0);
    const freeCourses = allCourses.filter(([key]) => catalogEntry(key)?.access === 'free').length;
    const blueprint = course?.blueprint || {};
    const publicTitles = {
      home: Config.title || 'QA & Testing Academia',
      courses: 'Cursos',
      routes: 'Ruta de aprendizaje',
      contact: 'Contáctanos',
      legal: 'Información legal',
      account: 'Mi cuenta',
      admin: 'Administración',
      authGate: gateEntry?.meta?.name || 'Acceso al curso'
    };
    const publicSubtitles = {
      home: Config.description || 'Selecciona una certificación para iniciar.',
      courses: 'Explora todos los cursos disponibles y entra a la ruta que quieres estudiar.',
      routes: 'Rutas sugeridas para avanzar por testing, IA, Scrum, gestión y ciberseguridad.',
      contact: 'Cuéntanos una idea, problema, error académico o propuesta de colaboración.',
      legal: 'Política de privacidad, términos y condiciones de uso de AcademiaQA.',
      account: 'Tu información, matrículas y actividad de aprendizaje guardadas en la nube.',
      admin: 'Consulta protegida de usuarios, matrículas, progreso y actividad académica.',
      authGate: 'Inicia sesión con Google para inscribirte y guardar tu progreso.'
    };

    dom.siteHeader?.classList.toggle('homeHeader', isPublicView);
    dom.mainLayout.classList.toggle('homeLayout', isPublicView);
    setTextIfChanged(dom.heroTitle, isPublicView ? publicTitles[state.view] : courseLabel());
    setTextIfChanged(dom.heroSubtitle, isPublicView
      ? publicSubtitles[state.view]
      : `Menú de estudio de ${courseLabel()}: teoría, objetivos, práctica, flashcards, simulacro y examen final.`);
    setTextIfChanged(dom.topChapters, isPublicView
      ? `🧭 ${LEARNING_ROUTES.length} rutas de aprendizaje`
      : `📘 ${course.chapters.length} capítulos`);
    setTextIfChanged(dom.topBank, String(isPublicView ? totalBank : questions.length));
    setTextIfChanged(dom.topExam, isPublicView
      ? `🎓 ${freeCourses} cursos gratis disponibles`
      : `⏱️ Simulacro ${blueprint.minutes} min / aprueba ${blueprint.passingScore}/${blueprint.totalPoints || blueprint.totalQuestions}`);
    setTextIfChanged(dom.navCaps, `${course?.chapters?.length || 0} caps`);
    setTextIfChanged(dom.navExamCount, String(blueprint.totalQuestions || 0));
    const isHomeView = state.view === 'home';
    dom.footerText.classList.toggle('homeFooter', isHomeView);
    setTextIfChanged(dom.footerText, isPublicView
      ? (isHomeView ? `AcademiaQA · v${APP_VERSION}` : '')
      : `Hecho para estudio personal · ${courseLabel()} · progreso independiente por certificación.`);
    dom.footerText.hidden = isPublicView && !isHomeView;

    const hasK3 = course ? questions.some((question) => question.k === 'K3') : false;
    const hasFlashcards = course ? Array.isArray(course.flashcards) && course.flashcards.length > 0 : false;
    const hasObjectives = course ? Array.isArray(course.objectives) && course.objectives.length > 0 : false;

    document.querySelector('[data-view="k3lab"]')?.toggleAttribute('hidden', !hasK3);
    document.querySelector('[data-view="flashcards"]')?.toggleAttribute('hidden', !hasFlashcards);
    document.querySelector('[data-view="objectives"]')?.toggleAttribute('hidden', !hasObjectives);
    syncNavigationState();
    updateDocumentMetadata();
  }

  function render() {
    if (!course && !PUBLIC_VIEWS.has(state.view) && state.view !== 'authGate') return;
    updateCourseUi();
    const renderer = VIEW_RENDERERS[state.view] || VIEW_RENDERERS.home;

    try {
      const renderedHtml = renderer();
      const staticHome = state.view === 'home' ? dom.app.querySelector('[data-static-home]') : null;
      const currentHomeTitle = state.view === 'home' ? $('homeMainTitle') : null;
      if (staticHome) {
        const template = document.createElement('template');
        template.innerHTML = renderedHtml;
        const nextHome = template.content.querySelector('.publicHome');
        const currentHero = staticHome.querySelector('.landingHero');
        const nextHero = nextHome?.querySelector('.landingHero');
        const nextActions = nextHero?.querySelector('.landingActions');
        if (nextActions) currentHero?.querySelector('.landingActions')?.replaceWith(nextActions);
        const progressPanel = nextHero?.querySelector('.heroProgressPanel');
        if (progressPanel) currentHero?.append(progressPanel);
        [...staticHome.children].filter((child) => child !== currentHero).forEach((child) => child.remove());
        [...(nextHome?.children || [])].filter((child) => child !== nextHero).forEach((child) => staticHome.append(child));
        staticHome.removeAttribute('data-static-home');
      } else if (currentHomeTitle) {
        const template = document.createElement('template');
        template.innerHTML = renderedHtml;
        const nextHomeTitle = template.content.querySelector('#homeMainTitle');
        if (nextHomeTitle) {
          currentHomeTitle.textContent = nextHomeTitle.textContent;
          nextHomeTitle.replaceWith(currentHomeTitle);
        }
        dom.app.replaceChildren(...template.content.childNodes);
      } else {
        dom.app.innerHTML = renderedHtml;
      }
      if (state.view === 'study' && state.studyChapter) {
        openChapter(state.studyChapter, { updateRoute: false, scroll: false });
      }
      if (state.view === 'home') startHomeSlider();
      else clearHomeSlider();
    } catch (error) {
      showFatalError(error);
    }
  }

  function courseLabel() {
    return course?.meta?.name || course?.meta?.shortName || catalogEntry(activeCourseKey)?.meta?.name || activeCourseKey.toUpperCase();
  }

  function courseAcronym(key, item) {
    return item.meta?.code || item.meta?.shortName || String(key).toUpperCase();
  }

  function progressForCourse(key, item) {
    const cloudProgress = learningSnapshot.progressByCourse.get(key);
    if (cloudProgress) return cloudProgress;
    const keyForStorage = courseMeta(item).storageKey || `academy_${key}_progress`;
    return Storage.getProgress(keyForStorage);
  }

  function enrollmentForCourse(key) {
    return learningSnapshot.enrollments.find((item) => item.course_key === key) || null;
  }

  function chapterProgressForCourse(courseData, progressValue, chapterId) {
    const progress = Storage.normalizeProgress(progressValue);
    const objectives = (courseData?.objectives || []).filter((objective) => Number(objective.chapter) === Number(chapterId));
    const chapterStats = objectives.reduce((summary, objective) => {
      const item = progress.byLo?.[objective.lo] || {};
      const ok = number(item.ok);
      const bad = number(item.bad);
      summary.ok += ok;
      summary.bad += bad;
      summary.answered += ok + bad;
      if (ok + bad > 0) summary.touched += 1;
      return summary;
    }, { ok: 0, bad: 0, answered: 0, touched: 0 });
    const chapter = (courseData?.chapters || []).find((item) => Number(item.id) === Number(chapterId)) || {};
    const activity = progress.chapterActivity?.[String(chapterId)] || {};
    const studySeconds = number(activity.studySeconds);
    const suggestedSeconds = Math.max(60, number(chapter.minutes) * 60);
    const suggestedMinutes = Math.max(1, Math.round(suggestedSeconds / 60));
    const readingProgress = Math.min(100, pct(studySeconds, suggestedSeconds));
    const objectiveProgressPct = objectives.length ? pct(chapterStats.touched, objectives.length) : readingProgress;
    const coverage = Math.min(100, Math.round((readingProgress * 0.4) + (objectiveProgressPct * 0.6)));
    const accuracy = pct(chapterStats.ok, chapterStats.answered);
    const domain = Math.min(100, Math.round((accuracy * objectiveProgressPct) / 100));

    return {
      ...chapterStats,
      chapterId: Number(chapterId),
      title: chapter.title || `Capítulo ${chapterId}`,
      objectiveCount: objectives.length,
      accuracy,
      domain,
      objectiveProgress: objectiveProgressPct,
      readingProgress,
      coverage,
      studySeconds,
      studyMinutes: studyMinutes(studySeconds),
      suggestedMinutes,
      visitedAt: activity.visitedAt || ''
    };
  }

  function courseProgressDetailsFrom(key, item, progressValue, enrollmentValue = null) {
    const progress = Storage.normalizeProgress(progressValue || {});
    const attempts = progress.attempts || [];
    const simulatorAttempts = attempts.filter((attempt) => attempt.mode === 'exam');
    const best = simulatorAttempts.length ? Math.max(...simulatorAttempts.map((attempt) => number(attempt.scorePct, 0))) : 0;
    const answered = Object.values(progress.byLo || {}).reduce((sum, item) => sum + number(item.ok) + number(item.bad), 0);
    const marked = Array.isArray(progress.marked) ? progress.marked.length : 0;
    const courseData = learningSnapshot.coursesByKey.get(key) || Registry.get(key) || (Array.isArray(item?.chapters) ? item : null);
    const chapters = (courseData?.chapters || []).map((chapter) => chapterProgressForCourse(courseData, progress, chapter.id));
    const chapterAverage = chapters.length
      ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.coverage, 0) / chapters.length)
      : 0;
    const enrollment = enrollmentValue;
    const objectiveTotal = chapters.reduce((sum, chapter) => sum + number(chapter.objectiveCount), 0);
    const chapterDomainAverage = objectiveTotal
      ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.domain * chapter.objectiveCount), 0) / objectiveTotal)
      : chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.domain, 0) / chapters.length) : 0;
    const localFinalExamScores = attempts
      .filter((attempt) => attempt.mode === 'final-exam')
      .map((attempt) => number(attempt.scorePct));
    const finalExamScore = Math.max(number(enrollment?.best_final_exam_score), ...localFinalExamScores, 0);
    const masteryPercent = Math.min(100, Math.round((
      (chapterDomainAverage * FINAL_EXAM_UNLOCK_PROGRESS)
      + (finalExamScore * (100 - FINAL_EXAM_UNLOCK_PROGRESS))
    ) / 100));
    const finalExamPassed = Boolean(enrollment?.final_exam_passed || attempts.some((attempt) => attempt.mode === 'final-exam' && attempt.passed));
    const progressPercent = finalExamPassed
      ? 100
      : Math.min(FINAL_EXAM_UNLOCK_PROGRESS, Math.round(chapterAverage * (FINAL_EXAM_UNLOCK_PROGRESS / 100)));
    const finalExamEligible = finalExamPassed || progressPercent >= FINAL_EXAM_UNLOCK_PROGRESS;
    const started = attempts.length > 0 || answered > 0 || marked > 0 || number(progress.studySeconds) > 0;
    return {
      attempts,
      best,
      last: attempts.at(-1) || null,
      answered,
      marked,
      started,
      chapters,
      chapterAverage,
      chapterDomainAverage,
      finalExamScore,
      masteryPercent,
      progressPercent,
      studySeconds: Math.max(number(progress.studySeconds), number(enrollment?.study_seconds)),
      enrollment,
      finalExamPassed,
      finalExamEligible,
      isEnrolled: Boolean(enrollment && enrollment.status !== 'cancelled')
    };
  }

  function courseProgressDetails(key, item) {
    return courseProgressDetailsFrom(key, item, progressForCourse(key, item), enrollmentForCourse(key));
  }

  function courseRouteKey(key) {
    const areas = catalogEntry(key).areas || [];
    return areas.includes('ai-automation') ? 'ai-automation' : areas[0] || 'testing-istqb';
  }

  function courseAreaNames(key) {
    return (catalogEntry(key).areas || [])
      .map((areaKey) => learningRoute(areaKey)?.name)
      .filter(Boolean);
  }

  function routeTileImage(routeKey) {
    return ROUTE_TILE_IMAGES[routeKey] || DEFAULT_ROUTE_TILE_IMAGE;
  }

  function renderResponsiveImage(image, alt = '', sizes = '100vw', options = {}) {
    const sourceTags = [
      image.avif ? `<source type="image/avif" srcset="${h(rootRelativeSrcset(image.avif))}" sizes="${h(sizes)}">` : '',
      image.webp ? `<source type="image/webp" srcset="${h(rootRelativeSrcset(image.webp))}" sizes="${h(sizes)}">` : ''
    ].join('');
    const loading = options.loading === 'eager' ? 'eager' : 'lazy';
    const fetchPriority = ['high', 'low'].includes(options.fetchPriority) ? ` fetchpriority="${options.fetchPriority}"` : '';

    return `<picture>${sourceTags}<img src="${h(rootRelativeAsset(image.src))}" width="${number(image.width)}" height="${number(image.height)}" alt="${h(alt)}" loading="${loading}" decoding="async"${fetchPriority}></picture>`;
  }

  function courseFeaturedTime(key, item, index = 0) {
    const catalog = catalogEntry(key);
    const featured = Date.parse(catalog.featuredAt || item.generatedAt || courseMeta(item).updatedAt || '');
    return Number.isFinite(featured) ? featured : index;
  }

  function latestCourseEntries(limit = 3) {
    return publicCourseEntries()
      .map(([key, item], index) => ({ key, item, index, time: courseFeaturedTime(key, item, index) }))
      .sort((left, right) => right.time - left.time || right.index - left.index)
      .slice(0, limit);
  }

  function setHomeSlide(value) {
    const slides = latestCourseEntries(3);
    if (!slides.length) return;
    state.homeSlide = Math.max(0, Math.min(slides.length - 1, Math.trunc(number(value, 0))));
    render();
  }

  function shiftHomeSlide(delta) {
    const slides = latestCourseEntries(3);
    if (!slides.length) return;
    state.homeSlide = (state.homeSlide + number(delta, 0) + slides.length) % slides.length;
    render();
  }

  function clearHomeSlider() {
    if (!homeSliderTimer) return;
    global.clearInterval(homeSliderTimer);
    homeSliderTimer = null;
  }

  function startHomeSlider() {
    const slides = latestCourseEntries(3);
    clearHomeSlider();
    if (slides.length < 2) return;
    homeSliderTimer = global.setInterval(() => {
      if (state.view !== 'home') {
        clearHomeSlider();
        return;
      }
      state.homeSlide = (state.homeSlide + 1) % slides.length;
      render();
    }, 7_000);
  }

  function heroProgressCourse() {
    return heroProgressSummary().resumeEntry;
  }

  function heroProgressSummary() {
    if (!Auth?.isAuthenticated?.()) {
      return { courses: [], totalCourses: 0, startedCourses: 0, totalAnswered: 0, totalStudySeconds: 0, averageProgress: 0, resumeEntry: null };
    }
    const active = Storage.getActiveCourse();
    const courses = learningSnapshot.enrollments
      .filter((enrollment) => enrollment.status !== 'cancelled')
      .map((enrollment) => {
        const key = enrollment.course_key;
        const item = learningSnapshot.coursesByKey.get(key) || Registry.get(key) || catalogCourseSummary(catalogEntry(key));
        return { key, item, details: courseProgressDetails(key, item) };
      })
      .filter((entry) => entry.item);
    const totalCourses = courses.length;
    const startedCourses = courses.filter((entry) => entry.details.started).length;
    const totalAnswered = courses.reduce((sum, entry) => sum + number(entry.details.answered), 0);
    const totalStudySeconds = courses.reduce((sum, entry) => sum + number(entry.details.studySeconds), 0);
    const averageProgress = totalCourses
      ? Math.round(courses.reduce((sum, entry) => sum + number(entry.details.progressPercent), 0) / totalCourses)
      : 0;
    const lastEntry = courses
      .filter((entry) => entry.details.last)
      .sort((left, right) => {
        const rightTime = new Date(right.details.last.date).getTime() || 0;
        const leftTime = new Date(left.details.last.date).getTime() || 0;
        return rightTime - leftTime;
      })[0] || null;
    const activeEntry = courses.find((entry) => entry.key === active) || null;
    const resumeEntry = lastEntry || activeEntry || courses[0] || null;

    return {
      courses,
      totalCourses,
      startedCourses,
      totalAnswered,
      totalStudySeconds,
      averageProgress,
      lastEntry,
      resumeEntry
    };
  }

  function renderHeroProgressCard() {
    if (!Auth?.isAuthenticated?.()) {
      return `<aside class="heroProgressPanel" aria-label="Acceso al progreso">
        <span>Tu progreso general</span>
        <div class="heroProgressTop"><strong>AcademiaQA</strong></div>
        <p>Inicia sesión para guardar tus cursos, tiempo de estudio y resultados en la nube.</p>
        <button class="btn heroResume" type="button" data-action="sign-in-google">Iniciar sesión</button>
      </aside>`;
    }

    const summary = heroProgressSummary();
    const entry = summary.resumeEntry;
    if (!entry) {
      return `<aside class="heroProgressPanel" aria-label="Resumen de progreso">
        <span>Tu progreso general</span>
        <div class="heroProgressTop"><strong>Sin cursos inscritos</strong><b>0%</b></div>
        <p>El progreso empezará cuando ingreses a tu primer curso.</p>
        <a class="btn heroResume" href="${h(publicPath('courses'))}" data-view="courses">Explorar cursos</a>
      </aside>`;
    }

    const pctValue = Math.max(0, Math.min(100, number(summary.averageProgress, 0)));
    const studyText = `Tiempo estudiado: ${formatStudyDuration(summary.totalStudySeconds)}`;
    const lastText = summary.lastEntry?.details.last
      ? `Último intento: ${coursePublicVersion(summary.lastEntry.key, summary.lastEntry.item)} · ${formatDate(summary.lastEntry.details.last.date)} · ${number(summary.lastEntry.details.last.scorePct)}%`
      : 'Tu avance se calcula únicamente con los cursos en los que te inscribiste.';
    const actionText = summary.startedCourses ? 'Retomar curso' : 'Comenzar curso';

    return `<aside class="heroProgressPanel" aria-label="Resumen de progreso">
      <span>Tu progreso general</span>
      <div class="heroProgressTop"><strong>AcademiaQA</strong><b>${pctValue}%</b></div>
      <div class="progressbar heroProgressBar" aria-hidden="true"><div style="width:${pctValue}%"></div></div>
      <div class="heroProgressStats" aria-label="Detalle de progreso general">
        <span>${number(summary.totalCourses)} cursos inscritos</span>
        <span>${number(summary.totalAnswered)} respuestas</span>
        <span>${h(studyText)}</span>
      </div>
      <p>${h(lastText)}</p>
      <button class="btn heroResume" type="button" data-action="select-course" data-course="${h(entry.key)}">${h(actionText)}</button>
    </aside>`;
  }

  function pct(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
  }

  function arraysEqual(left, right) {
    const a = [...left].map(Number).sort((x, y) => x - y);
    const b = [...right].map(Number).sort((x, y) => x - y);
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function randomInt(max) {
    if (!Number.isInteger(max) || max <= 0) return 0;
    if (!global.crypto?.getRandomValues) return Math.floor(Math.random() * max);

    const range = 0x1_0000_0000;
    const limit = range - (range % max);
    const values = new Uint32Array(1);
    do global.crypto.getRandomValues(values); while (values[0] >= limit);
    return values[0] % max;
  }

  function shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function coursePublicVersion(key, item) {
    if (key === 'ctfl') return 'CTFL 4.0';
    if (key === 'ctai') return 'CT-AI 2.0';
    return courseMeta(item).code || String(key).toUpperCase();
  }

  function catalogEntries() {
    return Array.isArray(global.ACADEMY_CATALOG) ? global.ACADEMY_CATALOG : [];
  }

  function catalogEntry(key) {
    return catalogEntries().find((item) => item?.key === key) || {};
  }

  function catalogCourseSummary(entry = {}) {
    return {
      meta: entry.meta || {},
      blueprint: entry.blueprint || {},
      counts: entry.counts || {},
      generatedAt: entry.generatedAt || entry.featuredAt || ''
    };
  }

  function publicCourseEntries() {
    return catalogEntries().map((entry) => [entry.key, Registry.get(entry.key) || catalogCourseSummary(entry)]);
  }

  function courseMeta(item = {}) {
    return item.meta || {};
  }

  function courseBlueprint(item = {}) {
    return item.blueprint || {};
  }

  function courseChapterCount(item = {}) {
    return Array.isArray(item.chapters) ? item.chapters.length : number(item.counts?.chapters, 0);
  }

  function courseObjectiveCount(item = {}) {
    return Array.isArray(item.objectives) ? item.objectives.length : number(item.counts?.objectives, 0);
  }

  function courseQuestionCount(item = {}) {
    return Array.isArray(item.questions) ? item.questions.length : number(item.counts?.questions, 0);
  }

  function learningRoute(routeKey) {
    return LEARNING_ROUTES.find((route) => route.key === routeKey);
  }

  function courseMatchesFilter(key, filter) {
    if (filter === 'all') return true;
    const areas = catalogEntry(key).areas;
    return Array.isArray(areas) && areas.includes(filter);
  }

  function availableCourseCount(routeKey) {
    return catalogEntries().filter((entry) => courseMatchesFilter(entry.key, routeKey)).length;
  }

  function renderCatalogFilters(scope = 'courses') {
    const controls = scope === 'home' ? 'homeCourseCatalog' : 'courseCatalog';
    const filters = [{ key: 'all', name: 'Todos', count: catalogEntries().length }]
      .concat(LEARNING_ROUTES.map((route) => ({
        key: route.key,
        name: route.name,
        count: availableCourseCount(route.key)
      })));

    return `<div class="catalogFilters" role="group" aria-label="Filtrar cursos por área">${filters.map((filter) => {
      const active = state.catalogFilter === filter.key;
      return `<button class="catalogFilter${active ? ' active' : ''}" type="button" data-action="filter-courses" data-filter="${h(filter.key)}" data-filter-scope="${h(scope)}" aria-controls="${h(controls)}" aria-pressed="${active}"${active ? ' aria-current="true"' : ''}>
        ${h(filter.name)} <span>${filter.count}</span>
      </button>`;
    }).join('')}</div>`;
  }

  function renderHomeCards() {
    const matchingCourses = publicCourseEntries().filter(([key]) => courseMatchesFilter(key, state.catalogFilter));
    if (!matchingCourses.length) {
      const route = learningRoute(state.catalogFilter);
      return `<div class="catalogEmpty">
        <span aria-hidden="true">+</span>
        <h3>${h(route?.name || 'Nuevos cursos')}</h3>
        <p>Aún no hay cursos publicados en esta ruta. La categoría ya está preparada para incorporar contenido sin afectar los cursos actuales.</p>
      </div>`;
    }

    return matchingCourses.map(([key, item]) => {
      const meta = courseMeta(item);
      const blueprint = courseBlueprint(item);
      const pass = `${blueprint.passingScore}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`;
      const publicVersion = coursePublicVersion(key, item);
      const catalog = catalogEntry(key);
      const areaNames = courseAreaNames(key);
      const routeKey = courseRouteKey(key);
      const progress = courseProgressDetails(key, item);
      const best = Math.max(0, Math.min(100, number(progress.best, 0)));

      return `<a class="availableCourseCard route-${h(routeKey)}" href="${h(coursePath(key))}" role="button" tabindex="0" data-action="select-course" data-course="${h(key)}" aria-label="Entrar al curso ${h(meta.name || key)}">
        <div class="courseCardTop">
          <span class="statusDot">${catalog.access === 'free' ? 'Gratis' : 'Premium'}</span>
          <strong>${h(publicVersion)}</strong>
        </div>
        <h3>${h(meta.name || key)}</h3>
        <p>${h(meta.subtitle || 'Curso disponible para estudio independiente.')}</p>
        <div class="courseTaxonomy">
          ${areaNames.map((areaName) => `<span>${h(areaName)}</span>`).join('')}
          ${catalog.family ? `<span>${h(catalog.family)}</span>` : ''}
        </div>
        <div class="courseCardProgress">
          <div class="progressbar" aria-hidden="true"><div style="width:${best}%"></div></div>
          <span>${best}%</span>
        </div>
        <div class="courseStatsLine">
          <span>${courseChapterCount(item)} capítulos</span>
          <span>${courseObjectiveCount(item)} LO</span>
          <span>${courseQuestionCount(item)} preguntas</span>
          <span>Simulacro ${blueprint.totalQuestions || 0}</span>
          <span>Aprueba ${h(pass)}</span>
          <span>Mejor ${best}%</span>
        </div>
        <span class="courseEnter">Entrar al curso</span>
      </a>`;
    }).join('');
  }

  function renderUpcomingCards() {
    return LEARNING_ROUTES.map((route) => {
      const available = availableCourseCount(route.key);
      return `<article class="upcomingCard route-${h(route.key)}">
      <span>${available ? `${available} ${available === 1 ? 'curso disponible' : 'cursos disponibles'}` : 'Próximamente'}</span>
      <h3>${h(route.name)}</h3>
      <p>${h(route.description)}</p>
      <ol class="routeSteps">${route.steps.map((step) => `<li>${h(step)}</li>`).join('')}</ol>
      ${available ? `<a class="routeExplore" href="${h(publicPath('courses'))}" data-action="filter-courses" data-filter="${h(route.key)}" aria-controls="courseCatalog">Ver cursos de esta ruta</a>` : '<b class="routeSoon">Ruta preparada para crecer</b>'}
    </article>`;
    }).join('');
  }

  function renderFreeCertCards() {
    return CERTIPROF_FREE_EXAMS.map((exam) => `<article class="freeCertExamCard">
      <span>${h(exam.area)}</span>
      <h3>${h(exam.label)}</h3>
      <p>${h(exam.summary)}</p>
      <div class="freeCertExamMeta">
        <b>Curso gratis</b>
        <b>Examen CertiProf</b>
      </div>
      <div class="freeCertExamActions">
        <a class="btn secondary" href="${h(coursePath(exam.courseKey))}" data-action="select-course" data-course="${h(exam.courseKey)}">Entrar al curso</a>
        <a class="btn freeCertLink" href="${h(exam.examUrl)}" target="_blank" rel="noopener noreferrer">Ir al examen</a>
      </div>
    </article>`).join('');
  }

  function renderFreeCertBand() {
    return `<section class="freeCertBand" aria-labelledby="freeCertTitle">
      <div class="freeCertCopy">
        <span class="freeCertKicker">CertiProf Open</span>
        <h2 id="freeCertTitle">Cursos gratis con examen gratuito</h2>
        <p>Estas tres rutas quedan destacadas como preparacion gratuita en AcademiaQA, con acceso directo al examen abierto de CertiProf. La disponibilidad y emision del certificado se confirman en CertiProf.</p>
      </div>
      <div class="freeCertCards">${renderFreeCertCards()}</div>
    </section>`;
  }

  function renderNewCoursesSlider() {
    const slides = latestCourseEntries(3);
    if (!slides.length) return '';
    state.homeSlide = ((state.homeSlide % slides.length) + slides.length) % slides.length;

    return `<section class="newCoursesSlider" aria-labelledby="newCoursesTitle">
      <div class="sliderHead">
        <span class="sectionKicker">Nuevos cursos</span>
        <div class="sliderControls" aria-label="Cambiar curso destacado">
          <button type="button" data-action="home-slide-prev" aria-label="Curso anterior">‹</button>
          <button type="button" data-action="home-slide-next" aria-label="Curso siguiente">›</button>
        </div>
      </div>
      <div class="courseSlides">
        ${slides.map(({ key, item }, index) => {
          const active = index === state.homeSlide;
          const routeKey = courseRouteKey(key);
          const areas = courseAreaNames(key);
          const meta = courseMeta(item);
          const slideId = `newCourseSlide-${h(key)}`;
          return `<article class="courseSlide route-${h(routeKey)}${active ? ' active' : ''}" id="${slideId}" role="tabpanel" ${active ? '' : 'hidden'} aria-hidden="${active ? 'false' : 'true'}">
            <div class="courseSlideMedia">
              ${renderResponsiveImage(NEW_COURSES_IMAGE, NEW_COURSES_IMAGE.alt, '(max-width: 760px) 100vw, 560px', { fetchPriority: active ? 'auto' : 'low' })}
            </div>
            <div class="courseSlideCopy">
              <span>${h(coursePublicVersion(key, item))}</span>
              <h2${active ? ' id="newCoursesTitle"' : ''}>${h(meta.name || key)}</h2>
              <p>${h(meta.subtitle || 'Curso gratis disponible para estudiar, practicar y simular.')}</p>
              <div class="courseSlideMeta">
                ${areas.map((areaName) => `<b>${h(areaName)}</b>`).join('')}
                <b>${courseChapterCount(item)} capítulos</b>
                <b>${courseObjectiveCount(item)} LO</b>
              </div>
              <a class="btn" href="${h(coursePath(key))}" data-action="select-course" data-course="${h(key)}" aria-label="Entrar al curso ${h(meta.name || key)}">Entrar al curso</a>
            </div>
          </article>`;
        }).join('')}
      </div>
      <div class="sliderDots" role="tablist" aria-label="Cursos nuevos destacados">
        ${slides.map(({ key, item }, index) => `<button type="button" role="tab" data-action="home-slide-go" data-slide="${index}" class="${index === state.homeSlide ? 'active' : ''}" aria-label="Mostrar curso destacado: ${h(coursePublicVersion(key, item))}" aria-controls="newCourseSlide-${h(key)}" aria-selected="${index === state.homeSlide}"${index === state.homeSlide ? ' aria-current="true"' : ''}></button>`).join('')}
      </div>
    </section>`;
  }

  function renderHomeAvailableCoursesSection() {
    const routeKeys = ['testing-istqb', 'ai-automation', 'scrum-agility', 'project-management', 'cybersecurity'];
    const routeTiles = routeKeys.map((routeKey) => {
      const route = learningRoute(routeKey);
      if (!route) return '';
      const image = routeTileImage(route.key);
      return `<a class="homeRouteTile route-${h(route.key)}" href="${h(publicPath('courses'))}" data-action="filter-courses" data-filter="${h(route.key)}" aria-label="Ver cursos de ${h(route.name)}">
        ${renderResponsiveImage(image, '', '(max-width: 760px) 100vw, 260px')}
        <div class="homeRouteTileCopy">
          <h3>${h(route.name)}</h3>
          <span>Ver cursos</span>
        </div>
      </a>`;
    }).join('');

    return `<section class="homeSection homeAvailableCourses" id="home-cursos-disponibles" aria-labelledby="homeCoursesTitle">
      <div class="sectionIntro">
        <span class="sectionKicker">Cursos disponibles</span>
        <h2 id="homeCoursesTitle">Elige tu ruta de aprendizaje.</h2>
      </div>
      <div class="homeRouteTiles" id="homeCourseCatalog" aria-live="polite">${routeTiles}</div>
    </section>`;
  }

  function renderCoffeeButton() {
    return '<button class="btn coffeeCta" type="button">Invítame un café</button>';
  }

  function renderDonationSpotlight() {
    return `<section class="donationSpotlight" aria-labelledby="donationTitle">
      <div class="donationImagePanel">
        ${renderResponsiveImage(DEFAULT_ROUTE_TILE_IMAGE, 'Comunidad QA aprendiendo y apoyando el proyecto AcademiaQA', '(max-width: 900px) 100vw, 680px')}
      </div>
      <div class="donationCopy">
        <span class="sectionKicker">Apoya el proyecto</span>
        <h2 id="donationTitle">Ayuda a mantener AcademiaQA gratis.</h2>
        <p>Cada aporte impulsa nuevos cursos, simulacros, mejoras móviles y material abierto para la comunidad QA.</p>
        <div class="donationActions">
          ${renderCoffeeButton()}
          <a class="btn secondary" href="${h(publicPath('routes'))}" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
        </div>
      </div>
    </section>`;
  }

  function renderStudyPathSection() {
    return `<section class="homeSection studyStepsSection" id="como-estudiar" aria-labelledby="studyTitle">
      <div class="sectionIntro">
        <h2 id="studyTitle">Ruta simple para avanzar</h2>
      </div>
      <div class="studyPathGrid">
        <article><strong>1</strong><h3>Elige una ruta</h3><p>Explora el área profesional y selecciona el curso que necesitas.</p></article>
        <article><strong>2</strong><h3>Lee por capítulos</h3><p>Repasa teoría, objetivos LO y puntos clave antes de practicar.</p></article>
        <article><strong>3</strong><h3>Practica por foco</h3><p>Filtra por capítulo, nivel K u objetivo de aprendizaje.</p></article>
        <article><strong>4</strong><h3>Simula y refuerza</h3><p>Usa el simulacro aleatorio y revisa tus estadísticas.</p></article>
      </div>
    </section>`;
  }

  function renderCoursesPage() {
    return `<div class="publicHome publicPage">
      <section class="homeSection" id="cursos-disponibles" aria-labelledby="coursesTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="coursesTitle">Cursos disponibles</h1>
          <p>CTFL 4.0, CT-AI 2.0, CT-GenAI, Scrum Master, Product Owner, Project Management Essentials, Scrum Fundamentals y Cybersecurity Awareness continúan habilitados sin costo para estudiar, practicar y simular.</p>
        </div>
        ${renderCatalogFilters()}
        <div class="availableCoursesGrid" id="courseCatalog" aria-live="polite">${renderHomeCards()}</div>
      </section>
    </div>`;
  }

  function renderRoutesPage() {
    return `<div class="publicHome publicPage routePage" id="ruta-aprendizaje">
      <section class="homeSection" aria-labelledby="routesTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">AcademiaQA</span>
          <h1 id="routesTitle">Ruta de aprendizaje</h1>
          <p>Estas secuencias son recomendaciones flexibles para avanzar por áreas. Cada ruta puede crecer con nuevos cursos gratuitos o Premium sin afectar tu progreso actual.</p>
        </div>
        <div class="upcomingGrid">${renderUpcomingCards()}</div>
      </section>
    </div>`;
  }

  function renderContactPage() {
    const courseOptions = publicCourseEntries()
      .map(([key, item]) => `<option value="${h(item.meta?.name || key)}">${h(coursePublicVersion(key, item))} · ${h(item.meta?.name || key)}</option>`)
      .join('');

    return `<div class="publicHome publicPage contactPage">
      <section class="contactHero" id="contactanos" aria-labelledby="contactTitle">
        <div>
          <span class="sectionKicker">Contacto</span>
          <h1 id="contactTitle">Contáctanos</h1>
          <p>Cuéntanos una idea, problema, error académico o propuesta de colaboración.</p>
        </div>
      </section>

      <section class="contactFormShell" aria-label="Formulario de contacto">
        <div class="contactFormGrid">
          <form class="contactForm" id="contactForm">
            <label for="contactCategory">Categoría</label>
            <select id="contactCategory">
              <option>Bug o problema técnico</option>
              <option>Error académico o contenido</option>
              <option>Propuesta de nuevo curso</option>
              <option>Colaboración</option>
              <option>Otro</option>
            </select>

            <label for="contactCourse">Curso relacionado</label>
            <select id="contactCourse">
              <option>General AcademiaQA</option>
              ${courseOptions}
            </select>

            <label for="contactSubject">Asunto</label>
            <input id="contactSubject" type="text" maxlength="140" placeholder="Ej. No se conserva el filtro de práctica">

            <label for="contactMessage">Mensaje</label>
            <textarea id="contactMessage" maxlength="1800" placeholder="Describe el contexto, pasos para reproducirlo o propuesta..."></textarea>

            <div class="contactSubmitRow">
              <button class="btn contactSubmit" type="button" data-action="send-contact-message">Enviar mensaje</button>
              <span>Se abrirá tu correo con el mensaje listo para enviar a ${CONTACT_EMAIL}.</span>
            </div>
          </form>

          <aside class="contactSide" aria-labelledby="socialTitle">
            <h3 id="socialTitle">Canal oficial</h3>
            <p>Para contacto directo, LinkedIn queda como canal principal.</p>
            <div class="socialLogoLinks">
              <a class="socialLogoLink linkedin" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer" aria-label="Abrir LinkedIn de Javier Chilatra">${brandIcon('linkedin')}<span>LinkedIn</span></a>
            </div>
          </aside>
        </div>
      </section>
    </div>`;
  }

  function authUserName() {
    const user = Auth?.getUser?.();
    const metadata = user?.user_metadata || {};
    return String(metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'Usuario de AcademiaQA');
  }

  function renderCourseAuthGate() {
    const entry = catalogEntry(activeCourseKey) || {};
    const meta = entry.meta || {};
    const counts = entry.counts || {};
    const blueprint = entry.blueprint || {};
    const authenticated = Auth?.isAuthenticated?.();
    const error = state.authGateError;

    return `<div class="publicHome publicPage courseAuthPage">
      <section class="courseAuthGate" aria-labelledby="courseAuthTitle">
        <div class="courseAuthSummary">
          <span class="sectionKicker">${h(meta.code || activeCourseKey.toUpperCase())}</span>
          <h2 id="courseAuthTitle">${h(meta.name || 'Curso AcademiaQA')}</h2>
          <p>${h(meta.subtitle || 'Ruta de aprendizaje disponible en AcademiaQA.')}</p>
          <div class="certBadgeLine">
            <span>${number(counts.chapters)} capítulos</span>
            <span>${number(counts.objectives)} objetivos</span>
            <span>${number(counts.questions)} preguntas</span>
            <span>Simulacro ${number(blueprint.totalQuestions)} preguntas</span>
          </div>
        </div>
        <div class="courseAuthAction">
          <span class="authLock" aria-hidden="true">G</span>
          <h3>${authenticated ? 'Conecta tu matrícula' : 'Inicia sesión para entrar'}</h3>
          <p>${authenticated
            ? 'Necesitamos conectar este curso con tu cuenta antes de abrir el contenido.'
            : 'El acceso al curso requiere una cuenta de Google. Tu matrícula, avance y simulacros quedarán guardados en la nube.'}</p>
          ${error ? `<div class="badbox">${h(error)}</div>` : ''}
          <div class="btnrow">
            ${authenticated
              ? `<button class="btn" type="button" data-action="retry-course" data-course="${h(activeCourseKey)}" data-course-view="${h(authGateRequest?.options?.view || 'dashboard')}">Intentar nuevamente</button>`
              : '<button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>'}
            <a class="btn secondary" href="${h(publicPath('courses'))}" data-view="courses">Volver a cursos</a>
          </div>
          <small>AcademiaQA no recibe ni almacena tu contraseña de Google.</small>
        </div>
      </section>
    </div>`;
  }

  async function refreshAccount() {
    if (state.view !== 'account' || !Auth?.isAuthenticated?.()) return;
    state.accountLoading = true;
    state.accountError = '';
    render();
    try {
      await refreshLearningSnapshot({ includeProfile: true });
      state.accountProfile = learningSnapshot.profile;
      state.enrollments = learningSnapshot.enrollments;
    } catch (error) {
      console.error(error);
      state.accountError = 'No fue posible consultar tu información en la nube.';
    } finally {
      state.accountLoading = false;
      if (state.view === 'account') render();
    }
  }

  async function cancelEnrollment(key) {
    const courseKey = String(key || '').trim().toLowerCase();
    const entry = catalogEntry(courseKey);
    if (!entry || !global.confirm(`¿Cancelar tu matrícula en ${entry.meta?.name || courseKey}? Tu historial se conservará para métricas y podrás reactivarla después.`)) return;
    try {
      await Cloud.cancelEnrollment(courseKey);
      notify('La matrícula fue cancelada. Tu historial permanece protegido en la nube.', 'success');
      await refreshAccount();
    } catch (error) {
      console.error(error);
      notify('No fue posible cancelar la matrícula.', 'error');
    }
  }

  async function deleteEnrollment(key) {
    const courseKey = String(key || '').trim().toLowerCase();
    const entry = catalogEntry(courseKey);
    const enrollment = state.enrollments.find((item) => item.course_key === courseKey);
    if (!entry || enrollment?.status !== 'cancelled') {
      notify('Primero debes cancelar el curso antes de eliminarlo.', 'warning');
      return;
    }
    const courseName = entry.meta?.name || courseKey;
    const confirmed = global.confirm(`\u00bfEliminar ${courseName} de tu cuenta? Se borrar\u00e1n permanentemente tu matr\u00edcula, avance, tiempo de estudio e intentos. Esta acci\u00f3n no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await Cloud.deleteEnrollment(courseKey);
      const storageKey = entry.meta?.storageKey || `academy_${courseKey}_progress`;
      const localProgressRemoved = Storage.removeProgress(storageKey);
      learningSnapshot.progressByCourse.delete(courseKey);
      learningSnapshot.coursesByKey.delete(courseKey);
      learningSnapshot.enrollments = learningSnapshot.enrollments.filter((item) => item.course_key !== courseKey);
      state.enrollments = state.enrollments.filter((item) => item.course_key !== courseKey);
      if (Storage.getActiveCourse() === courseKey) Storage.setActiveCourse('');
      notify(localProgressRemoved
        ? 'El curso y todos sus datos fueron eliminados de tu cuenta.'
        : 'El curso se elimin\u00f3 de la nube, pero no fue posible limpiar el progreso de este dispositivo.', localProgressRemoved ? 'success' : 'warning');
      await refreshAccount();
    } catch (error) {
      console.error(error);
      notify('No fue posible eliminar el curso. Verifica que est\u00e9 cancelado e intenta nuevamente.', 'error');
    }
  }

  function renderAccountPage() {
    if (!Auth?.isAuthenticated?.()) {
      return `<div class="publicHome publicPage accountPage" id="mi-cuenta">
        <section class="accountSignIn" aria-labelledby="accountTitle">
          <span class="sectionKicker">Mi cuenta</span>
          <h1 id="accountTitle">Tu aprendizaje, en un solo lugar</h1>
          <p>Inicia sesión con Google para consultar tus matrículas, avance por capítulo, tiempo de estudio, simulacros y exámenes finales.</p>
          <button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>
        </section>
      </div>`;
    }

    const user = Auth.getUser();
    const profile = state.accountProfile || {};
    const enrollments = Array.isArray(state.enrollments) ? state.enrollments : [];
    const enrolled = enrollments.filter((item) => item.status !== 'cancelled');
    const active = enrolled.length;
    const simulatorTotal = enrollments.reduce((sum, item) => sum + number(item.simulator_attempts), 0);
    const finalExamTotal = enrollments.reduce((sum, item) => sum + number(item.final_exam_attempts), 0);
    const hoursTotal = enrollments
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + number(item.estimated_hours), 0);
    const studySecondsTotal = enrolled.reduce((sum, item) => {
      const progress = learningSnapshot.progressByCourse.get(item.course_key);
      return sum + Math.max(number(item.study_seconds), number(progress?.studySeconds));
    }, 0);
    const overallProgress = enrolled.length
      ? Math.round(enrolled.reduce((sum, item) => {
        const entry = learningSnapshot.coursesByKey.get(item.course_key) || catalogCourseSummary(catalogEntry(item.course_key));
        return sum + courseProgressDetails(item.course_key, entry).progressPercent;
      }, 0) / enrolled.length)
      : 0;

    const enrollmentCards = enrollments.map((item) => {
      const entry = catalogEntry(item.course_key) || {};
      const meta = entry.meta || {};
      const isEnrolled = item.status !== 'cancelled';
      const courseData = learningSnapshot.coursesByKey.get(item.course_key) || Registry.get(item.course_key);
      const details = courseProgressDetails(item.course_key, courseData || catalogCourseSummary(entry));
      const isCompleted = details.finalExamPassed && details.progressPercent === 100;
      const certificateAvailable = isCompleted;
      const chapterRows = details.chapters.map((chapter) => `<li>
        <div><b>C${number(chapter.chapterId)} · ${h(chapter.title)}</b><span>${chapter.touched}/${chapter.objectiveCount} LO · ${chapter.answered} respuestas</span></div>
        <div><strong>Avance ${chapter.coverage}%</strong><span>Dominio del capítulo ${chapter.domain}% · ${chapter.studyMinutes}/${chapter.suggestedMinutes} min</span></div>
        <div class="accountChapterProgressBars">
          <div><span>Avance</span><div class="progressbar" aria-label="Avance del capítulo ${number(chapter.chapterId)}: ${chapter.coverage}%"><div style="width:${chapter.coverage}%"></div></div></div>
          <div><span>Dominio del capítulo</span><div class="progressbar masteryProgress" aria-label="Dominio del capítulo ${number(chapter.chapterId)}: ${chapter.domain}%"><div style="width:${chapter.domain}%"></div></div></div>
        </div>
      </li>`).join('');
      return `<article class="accountCourseCard">
        <div class="accountCourseHead">
          <div>
            <span class="accountStatus ${h(item.status)}">${item.status === 'active' ? 'Activo' : item.status === 'cancelled' ? 'Cancelado' : 'Completado'}</span>
            <h3>${h(meta.name || item.course_key)}</h3>
          </div>
          <div class="accountCourseScores">
            <strong>Avance ${details.progressPercent}%</strong>
            <span>Dominio real ${details.masteryPercent}%</span>
            <small>Capítulos ${details.chapterDomainAverage}% · examen final ${details.finalExamScore}%</small>
          </div>
        </div>
        <div class="progressbar accountCourseProgress" aria-label="Avance del curso"><div style="width:${details.progressPercent}%"></div></div>
        <dl class="accountCourseMetrics">
          <div><dt>Fecha de inicio</dt><dd>${h(formatDate(item.started_at))}</dd></div>
          <div><dt>Última actividad</dt><dd>${h(formatDate(item.last_activity_at))}</dd></div>
          <div><dt>Tiempo estudiado</dt><dd>${h(formatStudyDuration(details.studySeconds))}</dd></div>
          <div><dt>Duración estimada</dt><dd>${number(item.estimated_hours)} h</dd></div>
          <div><dt>Simulacros</dt><dd>${number(item.simulator_attempts)}</dd></div>
          <div><dt>Mejor simulacro</dt><dd>${number(item.best_simulator_score)}%</dd></div>
          <div><dt>Exámenes finales</dt><dd>${number(item.final_exam_attempts)}</dd></div>
          <div><dt>Mejor examen final</dt><dd>${number(item.best_final_exam_score)}%</dd></div>
          <div><dt>Respuestas registradas</dt><dd>${number(item.practice_answers)}</dd></div>
        </dl>
        <div class="${isCompleted ? 'okbox' : 'note'} accountFinalStatus"><b>Examen final:</b> ${isCompleted
          ? `Aprobado · ${number(item.best_final_exam_score)}% · curso al 100%`
          : details.finalExamEligible ? 'Habilitado · ya alcanzaste el 95%' : `Bloqueado hasta el 95% · avance actual ${details.progressPercent}%`}</div>
        <details class="accountChapterDetails">
          <summary>Avance por capítulo</summary>
          ${chapterRows ? `<ol>${chapterRows}</ol>` : '<p class="small">Aún no hay capítulos con actividad registrada.</p>'}
        </details>
        <div class="btnrow">
          ${certificateAvailable
            ? `<button class="btn good certificateAction" type="button" data-action="open-certificate-coming-soon" data-course="${h(item.course_key)}">Obtener certificado de curso</button>`
            : '<button class="btn secondary certificateAction" type="button" disabled aria-disabled="true">Certificado disponible al 100%</button>'}
          ${isEnrolled
            ? `<a class="btn" href="${h(coursePath(item.course_key))}" data-action="select-course" data-course="${h(item.course_key)}">Continuar curso</a>
               <button class="btn secondary dangerAction" type="button" data-action="cancel-enrollment" data-course="${h(item.course_key)}">Cancelar curso</button>`
            : `<button class="btn" type="button" data-action="reactivate-enrollment" data-course="${h(item.course_key)}">Reactivar curso</button>
               <button class="btn bad" type="button" data-action="delete-enrollment" data-course="${h(item.course_key)}">Eliminar curso</button>`}
        </div>
      </article>`;
    }).join('');

    return `<div class="publicHome publicPage accountPage" id="mi-cuenta">
      <section class="accountHeader" aria-labelledby="accountTitle">
        <span class="sectionKicker">Mi cuenta</span>
        <h1 id="accountTitle">Hola, ${h(authUserName())}</h1>
        <p>${h(profile.email || user?.email || '')}</p>
        <div class="grid3 accountTotals">
          <div class="metric"><span>Cursos inscritos</span><strong>${active}</strong></div>
          <div class="metric"><span>Progreso general</span><strong>${overallProgress}%</strong></div>
          <div class="metric"><span>Tiempo estudiado</span><strong>${h(formatStudyDuration(studySecondsTotal))}</strong></div>
          <div class="metric"><span>Horas estimadas</span><strong>${hoursTotal}</strong></div>
          <div class="metric"><span>Simulacros realizados</span><strong>${simulatorTotal}</strong></div>
          <div class="metric"><span>Exámenes finales</span><strong>${finalExamTotal}</strong></div>
        </div>
      </section>
      ${state.accountLoading ? '<div class="card accountLoading" role="status">Consultando tu información en la nube...</div>' : ''}
      ${state.accountError ? `<div class="badbox">${h(state.accountError)}</div>` : ''}
      <section class="accountCourses" aria-labelledby="accountCoursesTitle">
        <div class="sectionIntro">
          <h2 id="accountCoursesTitle">Mis cursos</h2>
          <p>Las horas son una estimación de estudio y práctica; pueden variar según tu experiencia.</p>
        </div>
        ${enrollmentCards || (!state.accountLoading ? '<div class="card"><p>Aún no te has inscrito en un curso.</p><a class="btn" href="/cursos/" data-view="courses">Explorar cursos</a></div>' : '')}
      </section>
    </div>`;
  }

  async function refreshAdmin() {
    if (state.view !== 'admin' || !Auth?.isAuthenticated?.() || !Auth?.isAdmin?.()) return;
    state.adminLoading = true;
    state.adminError = '';
    render();
    try {
      const [summary, result] = await Promise.all([
        Cloud.getAdminDashboardSummary(),
        Cloud.listAdminUsers({ search: state.adminSearch, limit: 50, offset: 0 })
      ]);
      const users = Array.isArray(result?.users) ? result.users : [];
      const courseKeys = [...new Set(users.flatMap((user) => (
        Array.isArray(user.enrollments) ? user.enrollments.map((item) => item.course_key) : []
      )).filter(Boolean))];
      const loadedCourses = await Promise.all(courseKeys.map(async (key) => {
        try {
          return [key, await ensureCourseLoaded(key)];
        } catch (error) {
          console.warn(`No fue posible cargar el detalle del curso ${key} para administraciÃ³n.`, error);
          return [key, null];
        }
      }));
      state.adminSummary = summary || {};
      state.adminUsers = users;
      state.adminTotal = number(result?.total);
      state.adminCoursesByKey = new Map(loadedCourses.filter(([, value]) => value));
    } catch (error) {
      console.error(error);
      state.adminError = 'No fue posible consultar las mÃ©tricas administrativas. Intenta nuevamente.';
    } finally {
      state.adminLoading = false;
      if (state.view === 'admin') render();
    }
  }

  function adminEnrollmentView(item) {
    const entry = catalogEntry(item.course_key) || {};
    const courseData = state.adminCoursesByKey.get(item.course_key)
      || Registry.get(item.course_key)
      || catalogCourseSummary(entry);
    const details = courseProgressDetailsFrom(item.course_key, courseData, item.progress, item);
    const statusLabel = item.status === 'active' ? 'Activo' : item.status === 'completed' ? 'Completado' : 'Cancelado';
    const chapterRows = details.chapters.map((chapter) => `<li>
      <span><b>C${number(chapter.chapterId)} Â· ${h(chapter.title)}</b><small>${chapter.touched}/${chapter.objectiveCount} LO Â· ${chapter.studyMinutes} min</small></span>
      <span><b>${chapter.coverage}% avance</b><small>${chapter.domain}% dominio</small></span>
    </li>`).join('');
    return `<div class="adminEnrollmentRow">
      <div class="adminEnrollmentTitle">
        <span class="accountStatus ${h(item.status)}">${statusLabel}</span>
        <b>${h(entry.meta?.name || item.course_key)}</b>
        <small>Inicio ${h(formatDate(item.started_at))} Â· Ãºltima actividad ${h(formatDate(item.last_activity_at))}</small>
      </div>
      <dl class="adminEnrollmentMetrics">
        <div><dt>Avance</dt><dd>${details.progressPercent}%</dd></div>
        <div><dt>Dominio real</dt><dd>${details.masteryPercent}%</dd></div>
        <div><dt>Tiempo</dt><dd>${h(formatStudyDuration(details.studySeconds))}</dd></div>
        <div><dt>Simulacros</dt><dd>${number(item.simulator_attempts)}</dd></div>
        <div><dt>Mejor simulacro</dt><dd>${number(item.best_simulator_score)}%</dd></div>
        <div><dt>Examen final</dt><dd>${number(item.final_exam_attempts)} Â· ${number(item.best_final_exam_score)}%</dd></div>
      </dl>
      <div class="progressbar accountCourseProgress" aria-label="Avance de ${h(entry.meta?.name || item.course_key)}: ${details.progressPercent}%"><div style="width:${details.progressPercent}%"></div></div>
      <details class="adminChapterDetails">
        <summary>Avance por capÃ­tulo</summary>
        ${chapterRows ? `<ol>${chapterRows}</ol>` : '<p class="small">Sin actividad registrada por capÃ­tulo.</p>'}
      </details>
    </div>`;
  }

  function renderAdminPage() {
    if (!Auth?.isAuthenticated?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle">
          <span class="sectionKicker">Acceso restringido</span>
          <h1 id="adminTitle">Panel de administraciÃ³n</h1>
          <p>Inicia sesiÃ³n con una cuenta administradora para consultar usuarios y mÃ©tricas de aprendizaje.</p>
          <button class="btn" type="button" data-action="sign-in-google">Iniciar sesiÃ³n</button>
        </section>
      </div>`;
    }

    if (!Auth?.isAdmin?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle">
          <span class="sectionKicker">Acceso restringido</span>
          <h1 id="adminTitle">Esta cuenta no tiene permisos administrativos</h1>
          <p>Tu sesiÃ³n continÃºa activa y puedes regresar a tu cuenta de aprendizaje.</p>
          <a class="btn" href="${h(publicPath('account'))}" data-view="account">Ir a Mi cuenta</a>
        </section>
      </div>`;
    }

    const summary = state.adminSummary || {};
    const users = Array.isArray(state.adminUsers) ? state.adminUsers : [];
    const userRows = users.map((user) => {
      const enrollments = Array.isArray(user.enrollments) ? user.enrollments : [];
      return `<article class="adminUserRecord">
        <header class="adminUserHeader">
          <div>
            <h3>${h(user.full_name || 'Usuario')}</h3>
            <a href="mailto:${encodeURIComponent(user.email || '')}">${h(user.email || 'Sin correo')}</a>
          </div>
          <div class="adminUserDates">
            <span>Registro: ${h(formatDate(user.created_at))}</span>
            <span>Ãšltimo acceso: ${h(formatDate(user.last_sign_in_at))}</span>
          </div>
        </header>
        <div class="adminEnrollments">
          ${enrollments.map(adminEnrollmentView).join('') || '<p class="adminEmpty">Este usuario aÃºn no tiene cursos inscritos.</p>'}
        </div>
      </article>`;
    }).join('');

    return `<div class="publicHome publicPage adminPage" id="admin">
      <section class="adminHeader" aria-labelledby="adminTitle">
        <span class="sectionKicker">AdministraciÃ³n</span>
        <h1 id="adminTitle">Usuarios y aprendizaje</h1>
        <p>Consulta consolidada de registros, matrÃ­culas y actividad guardada en Supabase.</p>
        <div class="grid3 adminTotals">
          <div class="metric"><span>Usuarios registrados</span><strong>${number(summary.registered_users)}</strong></div>
          <div class="metric"><span>Usuarios con cursos</span><strong>${number(summary.enrolled_users)}</strong></div>
          <div class="metric"><span>MatrÃ­culas activas</span><strong>${number(summary.active_enrollments)}</strong></div>
          <div class="metric"><span>Cursos completados</span><strong>${number(summary.completed_enrollments)}</strong></div>
          <div class="metric"><span>Tiempo estudiado</span><strong>${h(formatStudyDuration(summary.study_seconds))}</strong></div>
          <div class="metric"><span>Simulacros / finales</span><strong>${number(summary.simulator_attempts)} / ${number(summary.final_exam_attempts)}</strong></div>
        </div>
      </section>
      <section class="adminDirectory" aria-labelledby="adminUsersTitle">
        <div class="adminDirectoryHead">
          <div><h2 id="adminUsersTitle">Usuarios</h2><p>${state.adminTotal} registro${state.adminTotal === 1 ? '' : 's'} encontrado${state.adminTotal === 1 ? '' : 's'}.</p></div>
          <form class="adminSearchForm" data-admin-search-form role="search">
            <label for="adminSearch">Buscar por nombre o correo</label>
            <div><input id="adminSearch" name="search" type="search" maxlength="120" value="${h(state.adminSearch)}" autocomplete="off"><button class="btn" type="submit">Buscar</button></div>
          </form>
        </div>
        ${state.adminLoading ? '<div class="adminLoading" role="status">Consultando informaciÃ³n protegida...</div>' : ''}
        ${state.adminError ? `<div class="badbox">${h(state.adminError)}</div>` : ''}
        <div class="adminUserList">${userRows || (!state.adminLoading ? '<p class="adminEmpty">No se encontraron usuarios para esta bÃºsqueda.</p>' : '')}</div>
      </section>
    </div>`;
  }

  function renderLegalPage() {
    return `<div class="publicHome publicPage legalPage" id="legal">
      <section class="homeSection" aria-labelledby="legalTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">Información legal</span>
          <h1 id="legalTitle">Política de privacidad y términos de uso</h1>
          <p>AcademiaQA es una plataforma independiente de preparación y aprendizaje. Esta información resume cómo funciona el sitio estático y qué responsabilidades aplican al usarlo.</p>
        </div>
        <div class="legalGrid">
          <article class="legalCard" id="privacidad">
            <h3>Política de privacidad</h3>
            <p>AcademiaQA utiliza inicio de sesión con Google mediante Supabase Auth para acceder a los cursos. Al ingresar se procesan el identificador de cuenta, nombre y correo proporcionados por Google para mantener la sesión y asociar tus matrículas. AcademiaQA no recibe tu contraseña de Google.</p>
            <p>Las matrículas, fechas de inicio, avance por capítulo, tiempo activo de estudio, respuestas acumuladas y resultados de simulacros o exámenes finales se guardan en Supabase para recuperar el aprendizaje entre dispositivos y generar métricas de uso. El navegador conserva una copia local para dar continuidad a la experiencia.</p>
            <p>Cancelar un curso detiene su estado activo, pero conserva el historial para que puedas reactivarlo. Después de cancelarlo, puedes usar <b>Eliminar curso</b> en Mi cuenta para borrar permanentemente su matrícula, avance, tiempo e intentos; para solicitar la eliminación completa de la cuenta o de otros datos personales usa el formulario de contacto.</p>
            <p>AcademiaQA utiliza Google Analytics para conocer de forma agregada qué páginas y cursos se visitan. Google puede usar cookies o identificadores técnicos conforme a sus propias políticas de privacidad.</p>
            <p>El botón de aportes abre Wompi como servicio externo. Los enlaces a exámenes y canales externos abren sitios de terceros con sus propias políticas.</p>
          </article>
          <article class="legalCard" id="terminos">
            <h3>Términos y condiciones</h3>
            <p>El contenido se ofrece para estudio personal. No garantiza aprobación de certificaciones, no emite certificados y no sustituye materiales, reglas o exámenes oficiales.</p>
            <p>Los cursos, preguntas, simulacros y exámenes finales internos son herramientas educativas. Aprobar un curso en AcademiaQA no equivale a aprobar una certificación oficial. Los exámenes externos, certificados, insignias y condiciones dependen de cada entidad certificadora.</p>
          </article>
          <article class="legalCard">
            <h3>Aviso independiente</h3>
            <p>AcademiaQA no representa a ISTQB, CertiProf, Scrum.org, Scrum Inc., la Comisión Europea ni otras entidades mencionadas. Las marcas pertenecen a sus titulares.</p>
          </article>
        </div>
      </section>
    </div>`;
  }

  function brandIcon(name) {
    const icons = {
      linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.44-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.76 24h20.47c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z"/></svg>'
    };
    return `<span class="brandSocialIcon">${icons[name] || ''}</span>`;
  }

  function contactMessageText() {
    const category = $('contactCategory')?.value || 'General';
    const relatedCourse = $('contactCourse')?.value || 'General AcademiaQA';
    const subject = ($('contactSubject')?.value || '').trim() || 'Mensaje AcademiaQA';
    const message = ($('contactMessage')?.value || '').trim() || 'Hola, quiero contactar sobre AcademiaQA.';
    return [
      `Categoría: ${category}`,
      `Curso relacionado: ${relatedCourse}`,
      `Asunto: ${subject}`,
      '',
      message,
      '',
      `Página: ${global.location.href}`,
      `Navegador: ${global.navigator?.userAgent || 'N/D'}`
    ].join('\n');
  }

  function sendContactMessage() {
    const text = contactMessageText();
    const subject = ($('contactSubject')?.value || '').trim() || 'Mensaje AcademiaQA';
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

    notify(`Se abrirá tu correo para enviar el mensaje a ${CONTACT_EMAIL}.`, 'info');
    global.location.href = mailto;
  }

  function renderHome() {
    const continueCourse = heroProgressCourse()?.key || activeCourseKey || 'ctfl';
    const freeCourseCount = publicCourseEntries().filter(([key]) => catalogEntry(key)?.access === 'free').length;

    return `<div class="publicHome">
      <section class="landingHero" aria-labelledby="homeMainTitle">
        <div class="landingCopy">
          <span class="landingEyebrow">QA &amp; Testing Academia · ${freeCourseCount} cursos gratis</span>
          <h1 id="homeMainTitle">Prepárate para tu próxima certificación profesional.</h1>
          <p>Aprende la teoría, practica por objetivo y realiza simulacros con seguimiento de progreso. Explora rutas en testing, IA, Scrum y gestión de proyectos.</p>
          <div class="landingActions">
            <a class="btn" href="${h(publicPath('routes'))}" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
            <a class="btn secondary" href="${h(coursePath(continueCourse))}" data-action="select-course" data-course="${h(continueCourse)}">Continuar estudiando</a>
            ${renderCoffeeButton()}
          </div>
        </div>
        ${renderHeroProgressCard()}
      </section>

      ${renderNewCoursesSlider()}

      ${renderHomeAvailableCoursesSection()}

      ${renderStudyPathSection()}

      ${renderDonationSpotlight()}

      ${renderFreeCertBand()}

      <section class="legalNotice" aria-label="Aviso legal">
        <b>Aviso legal:</b> AcademiaQA es una plataforma independiente de preparación y aprendizaje. No emite certificaciones ni sustituye syllabus, glosarios, reglas, materiales o exámenes oficiales de las entidades certificadoras.
        <div class="legalQuickLinks">
          <a class="btn secondary" href="${h(publicPath('legal'))}" data-view="legal" data-view-anchor="privacidad">Política de privacidad</a>
          <a class="btn secondary" href="${h(publicPath('legal'))}" data-view="legal" data-view-anchor="terminos">Términos y condiciones</a>
          <a class="btn" href="${h(publicPath('contact'))}" data-view="contact" data-view-anchor="contactanos">Contáctanos</a>
        </div>
      </section>
    </div>`;
  }

  function renderAcademicTraceability() {
    const coverage = course?.syllabusCoverageNote || {};
    const validation = course?.qaValidation || {};
    const updatedAt = String(coverage.updatedAt || validation.validatedAt || course?.generatedAt || '').slice(0, 10);
    const source = coverage.source || validation.sourceSyllabus || course?.meta?.subtitle || 'Contenido académico de AcademiaQA';
    const version = course?.meta?.versionLabel || course?.meta?.code || activeCourseKey.toUpperCase();
    return `<aside class="courseAcademicTrace" aria-label="Información académica del curso">
      <span><b>Versión:</b> ${h(version)}</span>
      <span><b>Fuente de referencia:</b> ${h(source)}</span>
      <span><b>Actualizado:</b> ${h(updatedAt || 'Fecha no disponible')}</span>
      <span><b>Publicación:</b> AcademiaQA</span>
    </aside>`;
  }

  function renderCourseIntro() {
    const blueprint = course.blueprint || {};
    const details = courseProgressDetails(activeCourseKey, course);
    const finalExamAction = details.finalExamEligible
      ? `<a class="courseAction courseFinalExamAction" href="${h(coursePath(activeCourseKey, 'finalExam'))}" role="button" tabindex="0" data-view="finalExam"><b>🎓 Examen final</b><span class="small">${details.finalExamPassed ? 'Curso aprobado' : 'Habilitado al 95%'}</span></a>`
      : `<button class="courseAction courseFinalExamAction locked" type="button" disabled aria-disabled="true"><b>🎓 Examen final</b><span class="small">Se habilita al 95% · actual ${details.progressPercent}%</span></button>`;
    return `<div class="courseHero">
      <span class="pill">${h(course.meta?.code || activeCourseKey.toUpperCase())}</span>
      <h2>${h(courseLabel())}</h2>
      <p>${h(course.meta?.subtitle || 'Curso disponible para estudio.')}</p>
      <div class="certBadgeLine">
        <span>${course.chapters.length} capítulos</span>
        <span>${course.objectives.length} objetivos LO</span>
        <span>${questions.length} preguntas</span>
        <span>Simulacro ${blueprint.totalQuestions || 0} preguntas</span>
        <span>Aprueba ${blueprint.passingScore}/${blueprint.totalPoints || blueprint.totalQuestions || 0}</span>
      </div>
      <div class="courseActions">
        <a class="courseAction" href="${h(coursePath(activeCourseKey, 'study'))}" role="button" tabindex="0" data-view="study"><b>📚 Estudiar syllabus</b><span class="small">Capítulos y teoría</span></a>
        <a class="courseAction" href="${h(coursePath(activeCourseKey, 'objectives'))}" role="button" tabindex="0" data-view="objectives"><b>🎯 Objetivos LO</b><span class="small">Mapa de aprendizaje</span></a>
        <a class="courseAction" href="${h(coursePath(activeCourseKey, 'practice'))}" role="button" tabindex="0" data-view="practice"><b>📝 Practicar</b><span class="small">Por capítulo, LO y nivel</span></a>
        <a class="courseAction" href="${h(coursePath(activeCourseKey, 'exam'))}" role="button" tabindex="0" data-view="exam"><b>⏱️ Simulacro</b><span class="small">Modo examen</span></a>
        ${finalExamAction}
        ${course.meta?.examUrl ? `<a class="courseAction courseExternalExam" href="${h(course.meta.examUrl)}" target="_blank" rel="noopener noreferrer"><b>CertiProf Open</b><span class="small">${h(course.meta.certificationNote || 'Examen externo disponible.')}</span></a>` : ''}
      </div>
      ${renderAcademicTraceability()}
    </div>`;
  }

  function renderDashboard() {
    const progress = getProgress();
    const attempts = progress.attempts || [];
    const best = attempts.length ? Math.max(...attempts.map((attempt) => number(attempt.scorePct))) : 0;
    const last = attempts.at(-1);
    const details = courseProgressDetails(activeCourseKey, course);
    const weak = Object.entries(progress.byLo || {})
      .filter(([, item]) => number(item.bad) > 0)
      .sort((left, right) => number(right[1].bad) - number(left[1].bad))
      .slice(0, 6);

    return `${renderCourseIntro()}<div class="card">
      <h2>Panel de estudio · ${h(courseLabel())}</h2>
      <div class="grid3">
        <div class="metric"><span>Avance del curso</span><strong>${details.progressPercent}%</strong></div>
        <div class="metric"><span>Dominio real</span><strong>${details.masteryPercent}%</strong><small>Capítulos ${details.chapterDomainAverage}% · examen final ${details.finalExamScore}%</small></div>
        <div class="metric"><span>Tiempo estudiado</span><strong>${h(formatStudyDuration(details.studySeconds))}</strong></div>
        <div class="metric"><span>Mejor simulacro</span><strong>${best}%</strong></div>
        <div class="metric"><span>Examen final</span><strong>${details.finalExamPassed ? 'Aprobado' : details.finalExamEligible ? 'Habilitado' : `Bloqueado · ${FINAL_EXAM_UNLOCK_PROGRESS}%`}</strong></div>
      </div>
      <div class="progressbar accountCourseProgress" aria-label="Avance del curso"><div style="width:${details.progressPercent}%"></div></div>
      <div class="okbox"><b>Ruta recomendada:</b> 1) estudia cada capítulo → 2) practica por LO → 3) refuerza errores → 4) realiza simulacros → 5) presenta el examen final.</div>
      ${last ? `<p><b>Último intento:</b> ${number(last.correct)}/${number(last.total)} (${number(last.scorePct)}%) · ${h(formatDate(last.date))}</p>` : ''}
      <div class="grid2">
        <div><h3>Distribución del simulacro</h3>${renderBlueprintTable()}</div>
        <div><h3>Temas débiles</h3>${weak.length ? `<ul>${weak.map(([lo, item]) => `<li><b>${h(lo)}</b> · errores: ${number(item.bad)} · ${h(item.objective)}</li>`).join('')}</ul>` : '<p class="small">Aún no hay errores registrados.</p>'}</div>
      </div>
      <div class="btnrow">
        <a class="btn" href="${h(coursePath(activeCourseKey, 'study'))}" data-view="study">Empezar a estudiar</a>
        <a class="btn secondary" href="${h(coursePath(activeCourseKey, 'practice'))}" data-view="practice">Practicar por tema</a>
        <a class="btn good" href="${h(coursePath(activeCourseKey, 'exam'))}" data-view="exam">Simulacro</a>
        ${details.finalExamEligible
          ? `<a class="btn warn" href="${h(coursePath(activeCourseKey, 'finalExam'))}" data-view="finalExam">Examen final</a>`
          : `<button class="btn warn" type="button" disabled aria-disabled="true">Examen final · requiere ${FINAL_EXAM_UNLOCK_PROGRESS}%</button>`}
      </div>
    </div>`;
  }

  function renderBlueprintTable() {
    const blueprint = course.blueprint;
    const totalPoints = blueprint.totalPoints || blueprint.totalQuestions;
    const kDistribution = Object.entries(blueprint.kDistribution || {}).map(([key, value]) => `${key}:${value}`).join(' · ');
    const chapterDistribution = Object.entries(blueprint.chapterDistribution || {}).map(([key, value]) => `C${key}:${value}`).join(' · ');

    return `<table class="table responsiveTable blueprintTable">
      <tr><th>Elemento</th><th>Valor</th></tr>
      <tr><td data-label="Elemento">Preguntas</td><td data-label="Valor">${number(blueprint.totalQuestions)}</td></tr>
      <tr><td data-label="Elemento">Puntos</td><td data-label="Valor">${number(totalPoints)}</td></tr>
      <tr><td data-label="Elemento">Aprobación</td><td data-label="Valor">${number(blueprint.passingScore)}/${number(totalPoints)}</td></tr>
      <tr><td data-label="Elemento">Tiempo</td><td data-label="Valor">${number(blueprint.minutes)} min · +25%: ${number(blueprint.extraTime25, Math.ceil(number(blueprint.minutes) * 1.25))} min</td></tr>
      <tr><td data-label="Elemento">Distribución K</td><td data-label="Valor">${h(kDistribution)}</td></tr>
      <tr><td data-label="Elemento">Capítulos</td><td data-label="Valor">${h(chapterDistribution)}</td></tr>
    </table>`;
  }

  function officialMatrix() {
    return course.blueprint.matrix || {};
  }

  function buildOfficialSelection() {
    const result = QuestionSelection.buildMatrixSelection(
      questions,
      { ...course.blueprint, matrix: officialMatrix() },
      getProgress().questionHistory,
      randomInt
    );
    if (result.warnings.length) notify(`Las preguntas no cubren toda la matriz. Se completó con preguntas disponibles. ${result.warnings.join(' ')}`, 'warning', 10_000);
    return result.questions;
  }

  function rememberSessionQuestions(session, mode) {
    if (!session.length) return;
    const progress = getProgress();
    const seenAt = new Date().toISOString();
    progress.questionHistory.push(...session.map((question) => ({ id: question.id, mode, seenAt })));
    progress.questionHistory = progress.questionHistory.slice(-5_000);
    saveProgress(progress);
  }

  function objectiveProgress(lo) {
    const item = getProgress().byLo?.[lo] || {};
    const ok = number(item.ok, 0);
    const bad = number(item.bad, 0);
    const total = ok + bad;
    return {
      ok,
      bad,
      total,
      accuracy: pct(ok, total)
    };
  }

  function chapterProgressDetails(chapterId) {
    const questionCount = questions.filter((question) => Number(question.chapter) === Number(chapterId)).length;
    return {
      questionCount,
      ...chapterProgressForCourse(course, getProgress(), chapterId)
    };
  }

  function renderStudy() {
    const courseDetails = courseProgressDetails(activeCourseKey, course);
    const cards = course.chapters.map((chapter) => {
      const objectiveCount = course.objectives.filter((objective) => Number(objective.chapter) === Number(chapter.id)).length;
      const questionCount = questions.filter((question) => Number(question.chapter) === Number(chapter.id)).length;
      const chapterProgress = chapterProgressDetails(chapter.id);

      return `<a class="chapterCard" href="${h(chapterPath(activeCourseKey, chapter.id))}" data-action="open-chapter" data-chapter="${number(chapter.id)}">
        <h3>Capítulo ${number(chapter.id)} · ${h(chapter.title)}</h3>
        <p class="small">Tiempo sugerido: ${number(chapter.minutes)} min · LO: ${objectiveCount} · Preguntas: ${questionCount} · Págs. syllabus: ${h(chapter.completeSyllabusPages || 'N/D')}</p>
        <div class="chapterProgressCompare">
          <div><span>Avance</span><strong>${chapterProgress.coverage}%</strong><small>${chapterProgress.touched}/${chapterProgress.objectiveCount} LO recorridos</small></div>
          <div><span>Dominio del capítulo</span><strong>${chapterProgress.domain}%</strong><small>${chapterProgress.ok}/${chapterProgress.answered} correctas · precisión ${chapterProgress.accuracy}%</small></div>
          <div><span>Tiempo</span><strong>${chapterProgress.studyMinutes}/${chapterProgress.suggestedMinutes} min</strong><small>estudiados / sugeridos</small></div>
        </div>
        <div class="chapterProgressBars">
          <div><span>Avance</span><div class="progressbar" aria-label="Avance del capítulo: ${chapterProgress.coverage}%"><div style="width:${chapterProgress.coverage}%"></div></div></div>
          <div><span>Dominio del capítulo</span><div class="progressbar masteryProgress" aria-label="Dominio del capítulo: ${chapterProgress.domain}%"><div style="width:${chapterProgress.domain}%"></div></div></div>
        </div>
        <p>${h(chapter.summary)}</p>
      </a>`;
    }).join('');

    const finalExamCard = courseDetails.finalExamEligible
      ? `<a class="chapterCard finalExamMilestone ready" href="${h(coursePath(activeCourseKey, 'finalExam'))}" data-view="finalExam">
          <span class="sectionKicker">Paso final</span>
          <h3>Examen final del curso</h3>
          <p>${courseDetails.finalExamPassed ? 'Curso aprobado. Puedes volver a presentar el examen para reforzar tus conocimientos.' : `Ya alcanzaste el ${FINAL_EXAM_UNLOCK_PROGRESS}% requerido. Presenta el examen final para completar el curso.`}</p>
          <span class="finalExamMilestoneAction">${courseDetails.finalExamPassed ? 'Repasar examen final' : 'Ingresar al examen final'}</span>
        </a>`
      : `<div class="chapterCard finalExamMilestone locked" aria-disabled="true">
          <span class="sectionKicker">Paso final</span>
          <h3>Examen final del curso</h3>
          <p>Se habilita cuando alcances el ${FINAL_EXAM_UNLOCK_PROGRESS}% de avance. Tu progreso actual es ${courseDetails.progressPercent}%.</p>
          <div class="progressbar" aria-label="Progreso para habilitar el examen final"><div style="width:${courseDetails.progressPercent}%"></div></div>
          <span class="finalExamMilestoneAction">Bloqueado hasta ${FINAL_EXAM_UNLOCK_PROGRESS}%</span>
        </div>`;

    return `<div class="card"><h2>Estudiar syllabus por capítulo</h2><p>Selecciona un capítulo. Cada bloque incluye teoría resumida y el texto evaluable cargado para ese capítulo.</p>
      <div class="studyMasterySummary">
        <div><span>Dominio real del curso</span><strong>${courseDetails.masteryPercent}%</strong><small>Todos los capítulos ${courseDetails.chapterDomainAverage}% · mejor examen final ${courseDetails.finalExamScore}%</small></div>
        <div class="progressbar masteryProgress" aria-label="Dominio real del curso: ${courseDetails.masteryPercent}%"><div style="width:${courseDetails.masteryPercent}%"></div></div>
      </div>
      <div class="grid2">${cards}${finalExamCard}</div></div><div id="chapterDetail"></div>`;
  }

  function renderTheorySection(section) {
    const bullets = Array.isArray(section.bullets) ? `<ul>${section.bullets.map((item) => `<li>${h(item)}</li>`).join('')}</ul>` : '';
    return `<div class="okbox"><h3>${h(section.title)}</h3><p>${h(section.body)}</p>${bullets}</div>`;
  }

  function renderObjectiveTheory(objective) {
    return `<details class="contentDetails"><summary><b>${h(objective.lo)}</b> · ${h(objective.k)} · ${h(objective.text)}</summary>
      <p>${h(objective.theory || 'Teoría específica integrada en el capítulo.')}</p>
      ${objective.remember ? `<p><b>Recuerda:</b> ${h(objective.remember)}</p>` : ''}
      ${objective.trap ? `<p><b>Trampa típica:</b> ${h(objective.trap)}</p>` : ''}
      ${objective.example ? `<p><b>Ejemplo:</b> ${h(objective.example)}</p>` : ''}
      ${objective.syllabusExtract ? `<details><summary>Extracto del syllabus para este LO</summary><div class="prebox small">${h(objective.syllabusExtract)}</div></details>` : ''}
    </details>`;
  }

  function openChapter(id, options = {}) {
    const chapter = course.chapters.find((item) => Number(item.id) === Number(id));
    const host = $('chapterDetail');
    if (!chapter || !host) return;
    accumulateStudyTime();
    state.studyChapter = Number(id);

    const chapterActivityProgress = getProgress();
    const chapterKey = String(id);
    if (!chapterActivityProgress.chapterActivity?.[chapterKey]?.visitedAt) {
      chapterActivityProgress.chapterActivity = chapterActivityProgress.chapterActivity || {};
      chapterActivityProgress.chapterActivity[chapterKey] = {
        studySeconds: number(chapterActivityProgress.chapterActivity[chapterKey]?.studySeconds),
        visitedAt: new Date().toISOString(),
        lastStudiedAt: chapterActivityProgress.chapterActivity[chapterKey]?.lastStudiedAt || ''
      };
      saveProgress(chapterActivityProgress);
    }

    const objectives = course.objectives.filter((objective) => Number(objective.chapter) === Number(id));
    const progress = chapterProgressDetails(id);
    const rows = objectives.map((objective) => {
      const loProgress = objectiveProgress(objective.lo);
      return `<tr>
      <td data-label="LO"><b>${h(objective.lo)}</b></td><td data-label="K">${h(objective.k)}</td><td data-label="Objetivo">${h(objective.text)}</td>
      <td data-label="Preguntas">${questions.filter((question) => question.lo === objective.lo).length}</td>
      <td data-label="Avance">${loProgress.total ? `${loProgress.total} resp. · ${loProgress.accuracy}%` : 'Sin práctica'}</td>
      <td data-label="Acción"><button class="btn secondary" type="button" data-action="practice" data-chapter="${number(id)}" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`;
    }).join('');

    if (options.updateRoute !== false) {
      pushRoute(chapterPath(activeCourseKey, id));
      updateDocumentMetadata();
    }

    host.innerHTML = `<div class="card">
      <h2>Capítulo ${number(id)} · ${h(chapter.title)}</h2><p>${h(chapter.summary)}</p>
      <div class="grid3 chapterProgressGrid">
        <div class="metric"><span>Avance</span><strong>${progress.coverage}%</strong><small>${progress.touched}/${progress.objectiveCount} LO recorridos</small></div>
        <div class="metric"><span>Dominio del capítulo</span><strong>${progress.domain}%</strong><small>${progress.ok}/${progress.answered} correctas · precisión ${progress.accuracy}%</small></div>
        <div class="metric"><span>Tiempo estudiado</span><strong>${progress.studyMinutes}/${progress.suggestedMinutes} min</strong><small>estudiados / sugeridos</small></div>
      </div>
      <h3>Teoría del syllabus resumida</h3>${(chapter.theorySections || []).map(renderTheorySection).join('')}
      <details open class="contentDetails"><summary>Texto completo evaluable · páginas ${h(chapter.completeSyllabusPages || 'N/D')}</summary><div class="prebox small">${h(chapter.completeSyllabusText || 'No hay texto ampliado cargado para este capítulo.')}</div></details>
      <h3>Términos clave</h3><div>${(chapter.terms || []).map((term) => `<span class="pill">${h(term)}</span>`).join('')}</div>
      <h3>Objetivos de aprendizaje con teoría</h3>${objectives.map(renderObjectiveTheory).join('')}
      <h3>Mapa LO y práctica</h3><table class="table responsiveTable loPracticeTable"><tr><th>LO</th><th>K</th><th>Objetivo</th><th>Preguntas</th><th>Avance</th><th>Acción</th></tr>${rows}</table>
      <h3>Trampas frecuentes</h3><ul>${(chapter.pitfalls || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
      <h3>Ejemplos aplicados</h3><ul>${(chapter.examples || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
      <div class="btnrow"><button class="btn" type="button" data-action="practice" data-chapter="${number(id)}" data-count="20" data-mode="study">Practicar capítulo</button><button class="btn secondary" type="button" data-view="objectives">Ver mapa LO</button></div>
    </div>`;
    if (options.scroll !== false) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderObjectives() {
    const rows = course.objectives.map((objective) => `<tr>
      <td data-label="LO"><b>${h(objective.lo)}</b></td><td data-label="Capítulo">C${number(objective.chapter)}</td><td data-label="K">${h(objective.k)}</td>
      <td data-label="Teoría"><b>${h(objective.text)}</b><br><span class="small">${h(objective.theory || '')}</span>
        ${objective.remember ? `<br><span class="small"><b>Recuerda:</b> ${h(objective.remember)}</span>` : ''}
        ${objective.trap ? `<br><span class="small"><b>Trampa:</b> ${h(objective.trap)}</span>` : ''}
        ${objective.syllabusExtract ? `<details><summary class="small"><b>Extracto del syllabus</b></summary><div class="prebox small">${h(objective.syllabusExtract)}</div></details>` : ''}
      </td>
      <td data-label="Preguntas">${questions.filter((question) => question.lo === objective.lo).length}</td>
      <td data-label="Acción"><button class="btn secondary" type="button" data-action="practice" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`).join('');

    return `<div class="card"><h2>Mapa completo de objetivos de aprendizaje</h2><p>Esta vista combina teoría, extracto del temario y práctica por objetivo.</p><table class="table responsiveTable objectivesTable"><tr><th>LO</th><th>Cap.</th><th>K</th><th>Teoría del objetivo</th><th>Preguntas</th><th></th></tr>${rows}</table></div>`;
  }

  function selectedAttr(value, current) {
    return String(value) === String(current) ? ' selected' : '';
  }

  function normalizePracticeFilter(config = {}) {
    const input = { ...DEFAULT_PRACTICE_FILTER, ...(config || {}) };
    const objective = course.objectives.find((item) => item.lo === input.lo);
    const count = Math.max(1, Math.trunc(number(input.count, DEFAULT_PRACTICE_FILTER.count)));

    return {
      chapter: objective ? String(objective.chapter) : String(input.chapter || 'all'),
      k: String(input.k || 'all'),
      lo: objective ? objective.lo : String(input.lo || 'all'),
      count,
      mode: input.mode || 'study'
    };
  }

  function practiceFilterSummary(filter, available) {
    const parts = [];
    if (filter.chapter && filter.chapter !== 'all') parts.push(`Capítulo ${filter.chapter}`);
    if (filter.k && filter.k !== 'all') parts.push(filter.k);
    if (filter.lo && filter.lo !== 'all') parts.push(filter.lo);
    const label = parts.length ? parts.join(' · ') : 'Todos los capítulos y objetivos';
    return `<div class="practiceContext">
      <b>Filtro activo:</b> ${h(label)}
      <span>${number(available)} preguntas disponibles · se cargarán hasta ${number(filter.count)}.</span>
    </div>`;
  }

  function renderPractice() {
    const filter = normalizePracticeFilter(state.practiceFilter || DEFAULT_PRACTICE_FILTER);
    const available = filterQuestions(filter).length;
    const kLevels = Object.keys(course.blueprint.kDistribution || {}).filter((key) => questions.some((question) => question.k === key));
    const countOptions = [...new Set([10, 20, 40, 60, filter.count])].sort((left, right) => left - right);
    const chapterOptions = course.chapters.map((chapter) => `<option value="${number(chapter.id)}"${selectedAttr(chapter.id, filter.chapter)}>C${number(chapter.id)} · ${h(chapter.title)}</option>`).join('');
    const kOptions = kLevels.map((key) => `<option value="${h(key)}"${selectedAttr(key, filter.k)}>${h(key)}</option>`).join('');
    const countSelectOptions = countOptions.map((count) => `<option value="${number(count)}"${selectedAttr(count, filter.count)}>${number(count)}</option>`).join('');
    const objectiveOptions = course.objectives.map((objective) => `<option value="${h(objective.lo)}"${selectedAttr(objective.lo, filter.lo)}>${h(objective.lo)} · ${h(objective.k)} · ${h(objective.text)}</option>`).join('');

    return `<div class="card"><h2>Práctica personalizada</h2>
      ${practiceFilterSummary(filter, available)}
      <div class="grid3 practiceFormGrid">
        <div><label for="fChapter">Capítulo</label><select id="fChapter"><option value="all"${selectedAttr('all', filter.chapter)}>Todos</option>${chapterOptions}</select></div>
        <div><label for="fK">Nivel K</label><select id="fK"><option value="all"${selectedAttr('all', filter.k)}>Todos</option>${kOptions}</select></div>
        <div><label for="fCount">Cantidad</label><select id="fCount">${countSelectOptions}</select></div>
      </div>
      <div class="practiceLoControl"><label for="fLo">Objetivo de aprendizaje</label><select id="fLo"><option value="all"${selectedAttr('all', filter.lo)}>Todos los LO</option>${objectiveOptions}</select></div>
      <div class="btnrow practiceActionRow"><button class="btn" type="button" data-action="practice-filters" data-mode="study">Modo estudio</button><button class="btn secondary" type="button" data-action="practice-filters" data-mode="exam">Modo quiz al final</button></div>
    </div><div id="sessionHost"></div>`;
  }

  function filterQuestions(config) {
    return questions.filter((question) => (
      (!config.chapter || config.chapter === 'all' || String(question.chapter) === String(config.chapter))
      && (!config.k || config.k === 'all' || question.k === config.k)
      && (!config.lo || config.lo === 'all' || question.lo === config.lo)
    ));
  }

  function startPracticeFromFilters(mode) {
    startPractice({
      chapter: $('fChapter')?.value || 'all',
      k: $('fK')?.value || 'all',
      lo: $('fLo')?.value || 'all',
      count: Number($('fCount')?.value || 10),
      mode
    });
  }

  function startPractice(config) {
    const filter = normalizePracticeFilter(config);
    const pool = filterQuestions(filter);
    if (!pool.length) {
      notify('No hay preguntas con esos filtros.', 'warning');
      return;
    }

    clearRuntimeTimers();
    state.practiceFilter = filter;
    state.session = QuestionSelection.selectLeastSeen(
      pool,
      Math.min(number(filter.count, 10), pool.length),
      getProgress().questionHistory,
      randomInt
    );
    rememberSessionQuestions(state.session, filter.mode === 'exam' ? 'practice-quiz' : 'practice-study');
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = filter.mode || 'study';
    state.startTime = Date.now();
    state.questionLocked = false;
    state.view = 'practice';
    document.querySelectorAll('.navbtn[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === 'practice'));
    dom.app.innerHTML = renderPractice();
    renderSession();
  }

  function renderSession() {
    const host = $('sessionHost') || dom.app;
    if (!state.session.length) return;

    const question = state.session[state.current];
    const answered = state.answers[question.id] || [];
    if (!state.orders[question.id]) {
      state.orders[question.id] = shuffle(question.options.map((text, originalIndex) => ({ text, originalIndex })));
    }

    const marked = getProgress().marked.includes(question.id);
    const options = state.orders[question.id].map((option, displayIndex) => `<div class="opt ${answered.includes(option.originalIndex) ? 'selected' : ''}" role="button" tabindex="0" data-action="select-option" data-option-index="${option.originalIndex}"><b>${String.fromCharCode(65 + displayIndex)}.</b><span>${h(option.text)}</span></div>`).join('');
    const sessionCardClass = `card sessionCard${state.examFocus ? ' examQuestionCard' : ''}`;

    host.innerHTML = `<div class="${sessionCardClass}">
      <div class="qhead"><div><span class="pill">${h(question.id)}</span><span class="pill">C${number(question.chapter)}</span><span class="pill">${h(question.k)}</span><span class="pill">${h(question.lo)}</span><span class="pill">${number(question.points, 1)} pts</span></div><div><b>${state.current + 1}/${state.session.length}</b></div></div>
      <div class="progressbar"><div style="width:${pct(state.current, state.session.length)}%"></div></div>
      <div class="questionBox">
        <div class="qtitle">${h(question.stem)}</div>
        <p class="small">Tema: ${h(question.topic)} · ${question.multi ? 'Puede tener varias respuestas.' : 'Una respuesta correcta.'}${question.source ? ` · Fuente: ${h(question.source)}` : ''}</p>
        <div id="options">${options}</div><div id="feedback" aria-live="polite"></div>
      </div>
      <div class="btnrow sessionActionRow">
        <button class="btn secondary" type="button" data-action="previous-question">Anterior</button>
        <button class="btn" type="button" data-action="check-or-next">${state.mode === 'study' ? 'Comprobar / siguiente' : 'Guardar / siguiente'}</button>
        <button class="btn secondary" type="button" data-action="toggle-marked">${marked ? 'Quitar repaso' : 'Marcar repaso'}</button>
        <button class="btn warn" type="button" data-action="finish-session">Finalizar</button>
      </div>
    </div>`;
  }

  function selectOption(index) {
    if (state.questionLocked || !state.session.length) return;
    const question = state.session[state.current];
    let answers = state.answers[question.id] || [];
    answers = question.multi
      ? (answers.includes(index) ? answers.filter((item) => item !== index) : [...answers, index])
      : [index];
    state.answers[question.id] = answers;
    renderSession();
  }

  function previousQuestion() {
    if (state.questionLocked || state.current <= 0) return;
    state.current -= 1;
    renderSession();
  }

  function recordAnswer(question, isCorrect) {
    const progress = getProgress();
    const key = question.lo;
    progress.byLo[key] = progress.byLo[key] || {
      ok: 0,
      bad: 0,
      chapter: question.chapter,
      k: question.k,
      objective: question.objective || course.objectives.find((objective) => objective.lo === question.lo)?.text || ''
    };
    if (isCorrect) progress.byLo[key].ok += 1;
    else progress.byLo[key].bad += 1;
    saveProgress(progress);
  }

  function checkOrNext() {
    if (state.questionLocked || !state.session.length) return;
    const question = state.session[state.current];
    const answer = state.answers[question.id] || [];
    if (!answer.length) {
      notify('Selecciona una respuesta.', 'warning');
      return;
    }

    if (state.mode === 'study') {
      const isCorrect = arraysEqual(answer, question.correct);
      state.questionLocked = true;
      document.querySelectorAll('.opt[data-option-index]').forEach((element) => {
        const index = Number(element.dataset.optionIndex);
        if (question.correct.includes(index)) element.classList.add('correct');
        else if (answer.includes(index)) element.classList.add('wrong');
        element.setAttribute('aria-disabled', 'true');
      });
      const feedback = $('feedback');
      feedback.innerHTML = `<div class="${isCorrect ? 'okbox' : 'badbox'}"><b>${isCorrect ? 'Correcto' : 'Incorrecto'}</b><br>${h(question.explanation)}</div>`;
      recordAnswer(question, isCorrect);
      state.pendingAdvance = global.setTimeout(() => advanceOrFinish(), isCorrect ? 900 : 1_800);
      return;
    }

    advanceOrFinish();
  }

  function advanceOrFinish() {
    state.pendingAdvance = null;
    state.questionLocked = false;
    if (state.current < state.session.length - 1) {
      state.current += 1;
      renderSession();
    } else {
      finishSession();
    }
  }

  function toggleMarked() {
    if (!state.session.length) return;
    const question = state.session[state.current];
    const progress = getProgress();
    progress.marked = progress.marked.includes(question.id)
      ? progress.marked.filter((id) => id !== question.id)
      : [...progress.marked, question.id];
    saveProgress(progress);
    renderSession();
  }

  function finishSession() {
    if (!state.session.length) return;
    const durationSeconds = Math.max(0, Math.floor((Date.now() - number(state.startTime, Date.now())) / 1_000));
    clearRuntimeTimers();

    let correct = 0;
    let earned = 0;
    const totalPoints = state.session.reduce((sum, question) => sum + number(question.points, 1), 0);
    const detail = state.session.map((question) => {
      const answer = state.answers[question.id] || [];
      const isCorrect = arraysEqual(answer, question.correct);
      if (isCorrect) {
        correct += 1;
        earned += number(question.points, 1);
      }
      if (state.mode !== 'study') recordAnswer(question, isCorrect);
      return { question, answer, isCorrect };
    });

    const scorePct = pct(earned, totalPoints);
    const passingScore = number(course.blueprint.passingScore, Math.ceil(totalPoints * 0.65));
    const passed = earned >= passingScore;
    const completedFullExam = state.session.length === number(course.blueprint.totalQuestions);
    const progress = getProgress();
    progress.attempts.push({
      date: new Date().toISOString(),
      total: state.session.length,
      totalPoints,
      earned,
      correct,
      scorePct,
      mode: state.mode,
      cert: activeCourseKey,
      durationSeconds,
      passed: completedFullExam && passed
    });
    progress.attempts = progress.attempts.slice(-30);
    saveProgress(progress);
    const completedSimulator = state.mode === 'exam'
      && completedFullExam;
    if (completedSimulator && Auth?.isAuthenticated?.()) {
      Promise.resolve(Cloud.flushProgress(activeCourseKey))
        .then(() => Cloud.recordSimulatorCompletion(activeCourseKey, scorePct))
        .then((enrollment) => updateEnrollmentSnapshot(enrollment))
        .catch((error) => {
          console.error(error);
          notify('El resultado se guardó localmente, pero la métrica del simulacro no llegó a la nube.', 'warning');
        });
    }

    const completedFinalExam = state.mode === 'final-exam' && completedFullExam;
    if (completedFinalExam && Auth?.isAuthenticated?.()) {
      Promise.resolve(Cloud.flushProgress(activeCourseKey))
        .then(() => Cloud.recordFinalExamCompletion(activeCourseKey, {
          score: scorePct,
          earnedPoints: earned,
          totalPoints,
          passingPoints: passingScore,
          correctAnswers: correct,
          totalQuestions: state.session.length,
          durationSeconds
        }))
        .then((enrollment) => updateEnrollmentSnapshot(enrollment))
        .catch((error) => {
          console.error(error);
          notify('El resultado se guardó localmente, pero el examen final no llegó a la nube.', 'warning');
        });
    }

    const resultLabel = completedFullExam
      ? (passed ? 'Aprobado' : 'No aprobado')
      : (scorePct >= 65 ? 'Bien' : 'Refuerzo');

    const rows = detail.map((item, index) => `<tr>
      <td>${index + 1}</td>
      <td><b>${h(item.question.lo)}</b><br><span class="small">${h(item.question.topic)}</span><br><span class="sourceTag">${number(item.question.points, 1)} punto(s)</span></td>
      <td>${item.isCorrect ? '✅' : '❌'}</td>
      <td>${item.question.correct.map((correctIndex) => {
        const order = state.orders[item.question.id] || [];
        const displayIndex = order.findIndex((option) => option.originalIndex === correctIndex);
        return `${String.fromCharCode(65 + Math.max(0, displayIndex))}. ${h(item.question.options[correctIndex])}`;
      }).join('<br>')}</td>
      <td>${h(item.question.explanation)}</td>
    </tr>`).join('');

    const review = state.mode === 'final-exam'
      ? `<div class="${passed ? 'okbox' : 'badbox'}"><b>${passed ? 'Curso aprobado' : 'Aún no alcanzas la aprobación'}</b><br>${passed ? 'El resultado quedó registrado en tu cuenta.' : 'Revisa las estadísticas por capítulo, refuerza tus temas débiles y vuelve a intentarlo.'}</div>`
      : `<h3>Revisión</h3><table class="table"><tr><th>#</th><th>LO</th><th>Resultado</th><th>Respuesta correcta</th><th>Explicación</th></tr>${rows}</table>`;
    const resultActions = state.mode === 'final-exam'
      ? `<a class="btn" href="${h(publicPath('account'))}" data-view="account">Ver mi cuenta</a><button class="btn secondary" type="button" data-view="analytics">Revisar estadísticas</button><button class="btn warn" type="button" data-view="finalExam">Volver al examen final</button>`
      : '<button class="btn" type="button" data-view="practice">Nueva práctica</button><button class="btn secondary" type="button" data-view="analytics">Ver estadísticas</button>';

    dom.app.innerHTML = `<div class="card"><h2>${state.mode === 'final-exam' ? 'Resultado del examen final' : 'Resultado'}</h2>
      <div class="grid3"><div class="metric"><span>Correctas</span><strong>${correct}/${state.session.length}</strong></div><div class="metric"><span>Puntos</span><strong>${earned}/${totalPoints}</strong></div><div class="metric"><span>Estado</span><strong>${h(resultLabel)}</strong></div></div>
      ${review}
      <div class="btnrow">${resultActions}</div>
    </div>`;
    state.session = [];
  }

  function renderExam() {
    const blueprint = course.blueprint;
    const kText = Object.entries(blueprint.kDistribution || {}).filter(([, value]) => number(value) > 0).map(([key, value]) => `${key}=${value}`).join(', ');
    if (state.examFocus && state.session.length) {
      return `<div class="examFocusShell" role="region" aria-label="Simulacro en curso"><div id="sessionHost"></div></div>`;
    }

    return `<div class="card"><h2>Simulacro ${h(courseLabel())}</h2>
      <p>Genera ${number(blueprint.totalQuestions)} preguntas aleatorias desde las preguntas activas, respetando la matriz por capítulo y nivel K cuando hay suficientes preguntas.</p>
      ${renderBlueprintTable()}
      <div class="grid3 examMetricsGrid"><div class="metric"><span>Preguntas disponibles</span><strong>${questions.length}</strong></div><div class="metric"><span>Preguntas</span><strong>${number(blueprint.totalQuestions)}</strong></div><div class="metric"><span>Selección</span><strong>Aleatoria</strong></div></div>
      <div class="note"><b>Preguntas activas:</b> ${questions.length}. <b>Regla:</b> se seleccionan ${number(blueprint.totalQuestions)} aleatorias (${h(kText)}). La aprobación usa puntos: ${number(blueprint.passingScore)}/${number(blueprint.totalPoints || blueprint.totalQuestions)}.</div>
      <div class="btnrow examActionRow"><button class="btn good" type="button" data-action="start-official-exam">Iniciar simulacro aleatorio</button><button class="btn secondary" type="button" data-action="practice" data-count="${number(blueprint.totalQuestions)}" data-mode="exam">Simulacro aleatorio libre</button></div>
    </div><div id="sessionHost"></div>`;
  }

  function renderFinalExam() {
    const blueprint = course.blueprint;
    const enrollment = enrollmentForCourse(activeCourseKey) || {};
    const details = courseProgressDetails(activeCourseKey, course);
    const attempts = getProgress().attempts.filter((attempt) => attempt.mode === 'final-exam');
    const bestLocal = attempts.length ? Math.max(...attempts.map((attempt) => number(attempt.scorePct))) : 0;
    const best = Math.max(bestLocal, number(enrollment.best_final_exam_score));
    const passed = Boolean(enrollment.final_exam_passed || attempts.some((attempt) => attempt.passed));

    if (state.examFocus && state.session.length) {
      return `<div class="examFocusShell" role="region" aria-label="Examen final en curso"><div id="sessionHost"></div></div>`;
    }

    if (!details.finalExamEligible) {
      return `<div class="card finalExamIntro finalExamLocked"><span class="sectionKicker">Examen final bloqueado</span>
        <h2>Completa primero el ${FINAL_EXAM_UNLOCK_PROGRESS}% del curso</h2>
        <p>Tu avance actual es ${details.progressPercent}%. Estudia todos los capítulos, cumple el tiempo sugerido y practica sus objetivos de aprendizaje para habilitar el examen final.</p>
        <div class="progressbar accountCourseProgress" aria-label="Progreso para habilitar el examen final"><div style="width:${details.progressPercent}%"></div></div>
        <div class="note"><b>Requisito:</b> alcanza el ${FINAL_EXAM_UNLOCK_PROGRESS}% de avance antes de presentar el examen final.</div>
        <div class="btnrow"><a class="btn" href="${h(coursePath(activeCourseKey, 'study'))}" data-view="study">Continuar capítulos</a><a class="btn secondary" href="${h(coursePath(activeCourseKey, 'practice'))}" data-view="practice">Practicar objetivos LO</a></div>
      </div>`;
    }

    return `<div class="card finalExamIntro"><span class="sectionKicker">Aprobación del curso</span>
      <h2>Examen final · ${h(courseLabel())}</h2>
      <p>Este examen interno usa el banco de preguntas del curso y genera una selección aleatoria alineada con su matriz. No sustituye un examen oficial de certificación.</p>
      ${renderBlueprintTable()}
      <div class="grid3 examMetricsGrid">
        <div class="metric"><span>Intentos realizados</span><strong>${Math.max(number(enrollment.final_exam_attempts), attempts.length)}</strong></div>
        <div class="metric"><span>Mejor resultado</span><strong>${best}%</strong></div>
        <div class="metric"><span>Estado</span><strong>${passed ? 'Aprobado' : 'Pendiente'}</strong></div>
      </div>
      <div class="${passed ? 'okbox' : 'note'}"><b>${passed ? 'Curso aprobado al 100%.' : 'Condición de aprobación:'}</b> ${passed ? 'El certificado del curso ya está habilitado en Mi cuenta.' : `alcanza ${number(blueprint.passingScore)}/${number(blueprint.totalPoints || blueprint.totalQuestions)} puntos.`}</div>
      <div class="btnrow examActionRow"><button class="btn warn" type="button" data-action="start-final-exam">Iniciar examen final</button><a class="btn secondary" href="${h(coursePath(activeCourseKey, 'analytics'))}" data-view="analytics">Revisar estadísticas</a></div>
    </div><div id="sessionHost"></div>`;
  }

  function startOfficialExam() {
    clearRuntimeTimers();
    state.session = buildOfficialSelection();
    if (!state.session.length) {
      notify('No fue posible construir el simulacro.', 'error');
      return;
    }
    rememberSessionQuestions(state.session, 'simulator');
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = 'exam';
    state.startTime = Date.now();
    state.questionLocked = false;
    state.view = 'exam';
    setExamFocus(true);
    dom.app.innerHTML = renderExam();
    global.scrollTo({ top: 0, behavior: 'smooth' });
    renderSession();
    startCountdown(number(course.blueprint.minutes) * 60);
  }

  function startFinalExam() {
    const details = courseProgressDetails(activeCourseKey, course);
    if (!details.finalExamEligible) {
      notify(`El examen final se habilita cuando alcances el ${FINAL_EXAM_UNLOCK_PROGRESS}% del curso. Tu avance actual es ${details.progressPercent}%.`, 'warning', 8_000);
      render();
      return;
    }
    clearRuntimeTimers();
    state.session = buildOfficialSelection();
    if (!state.session.length) {
      notify('No fue posible construir el examen final.', 'error');
      return;
    }
    rememberSessionQuestions(state.session, 'final-exam');
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = 'final-exam';
    state.startTime = Date.now();
    state.questionLocked = false;
    state.view = 'finalExam';
    setExamFocus(true);
    dom.app.innerHTML = renderFinalExam();
    global.scrollTo({ top: 0, behavior: 'smooth' });
    renderSession();
    startCountdown(number(course.blueprint.minutes) * 60);
  }

  function startCountdown(seconds) {
    const box = document.createElement('div');
    box.id = 'timerBox';
    box.className = 'card examTimer';
    box.setAttribute('role', 'timer');
    box.setAttribute('aria-live', 'polite');
    dom.app.prepend(box);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1_000);
      const left = Math.max(0, seconds - elapsed);
      const minutes = Math.floor(left / 60);
      const remainingSeconds = left % 60;
      const label = `Tiempo restante: ${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
      box.setAttribute('aria-label', `${courseLabel()}. ${label}`);
      box.innerHTML = `<span>${h(courseLabel())}</span><strong>${label}</strong>`;
      if (left <= 0) finishSession();
    };

    tick();
    state.timer = global.setInterval(tick, 1_000);
  }

  function renderK3Lab() {
    const k3Questions = questions.filter((question) => question.k === 'K3');
    const topics = [...new Set(k3Questions.map((question) => question.topic))].map((topic) => `<span class="pill">${h(topic)}</span>`).join('');
    const description = course.meta?.k3Description || 'Entrena las preguntas de aplicación K3 de la certificación activa.';
    return `<div class="card"><h2>Laboratorio K3 · Aplicación</h2><p>${h(description)}</p>
      <div class="btnrow"><button class="btn" type="button" data-action="practice" data-k="K3" data-count="20" data-mode="study">Entrenar K3 modo estudio</button><button class="btn secondary" type="button" data-action="practice" data-k="K3" data-count="20" data-mode="exam">Quiz K3</button></div>
      <h3>Temas K3 disponibles</h3><div>${topics}</div>
    </div><div id="sessionHost"></div>`;
  }

  function flashList() {
    return course.flashcards.filter((flashcard) => !state.flashFilter || state.flashFilter === 'all' || String(flashcard.chapter) === String(state.flashFilter));
  }

  function renderFlashcards() {
    let list = flashList();
    if (!list.length) {
      state.flashFilter = 'all';
      list = flashList();
    }
    if (!list.length) return '<div class="card"><h2>Flashcards</h2><p>No hay tarjetas disponibles para este curso.</p></div>';

    state.flashIndex = ((state.flashIndex % list.length) + list.length) % list.length;
    const flashcard = list[state.flashIndex];
    const chapterOptions = course.chapters.map((chapter) => `<option value="${number(chapter.id)}" ${String(state.flashFilter) === String(chapter.id) ? 'selected' : ''}>C${number(chapter.id)} · ${h(chapter.title)}</option>`).join('');

    return `<div class="card"><h2>Flashcards de glosario, fórmulas y trampas</h2><p>Tarjetas: ${course.flashcards.length}. Filtra por capítulo o repasa de forma aleatoria.</p>
      <div class="grid3"><div><label for="flashFilter">Filtrar capítulo</label><select id="flashFilter"><option value="all" ${state.flashFilter === 'all' ? 'selected' : ''}>Todos</option>${chapterOptions}</select></div><div class="metric"><span>Tarjetas visibles</span><strong>${list.length}</strong></div><div class="metric"><span>Actual</span><strong>${state.flashIndex + 1}/${list.length}</strong></div></div>
      <div class="flash" role="button" tabindex="0" data-action="flash-toggle"><div class="front">${h(flashcard.front)}</div><div>${flashcard.kind ? `<span class="pill">${h(flashcard.kind)}</span>` : ''}<span class="pill">C${number(flashcard.chapter)}</span>${flashcard.lo ? `<span class="pill">${h(flashcard.lo)}</span>` : ''}</div>
        ${state.flashShow ? `<div class="back"><b>Significado / explicación:</b><br>${h(flashcard.meaning || flashcard.back)}${flashcard.back && flashcard.meaning && flashcard.back !== flashcard.meaning ? `<br><br>${h(flashcard.back)}` : ''}${flashcard.hint ? `<br><br><b>Pista:</b> ${h(flashcard.hint)}` : ''}</div>` : '<p class="small">Clic para ver significado y explicación</p>'}
      </div>
      <div class="btnrow"><button class="btn secondary" type="button" data-action="flash-previous">Anterior</button><button class="btn" type="button" data-action="flash-next">Siguiente</button><button class="btn secondary" type="button" data-action="flash-random">Aleatoria</button></div>
    </div>`;
  }

  function renderAnalytics() {
    const progress = getProgress();
    const rows = Object.entries(progress.byLo || {})
      .sort((left, right) => weakness(right[1]) - weakness(left[1]))
      .map(([lo, item]) => `<tr><td><b>${h(lo)}</b><br><span class="small">${h(item.objective)}</span></td><td>C${number(item.chapter)}</td><td>${h(item.k)}</td><td>${number(item.ok)}</td><td>${number(item.bad)}</td><td>${pct(number(item.ok), number(item.ok) + number(item.bad))}%</td><td><button class="btn secondary" type="button" data-action="practice" data-lo="${h(lo)}" data-count="10" data-mode="study">Reforzar</button></td></tr>`)
      .join('');
    const attempts = [...(progress.attempts || [])].reverse();

    return `<div class="card"><h2>Estadísticas y temas débiles</h2>${rows ? `<table class="table"><tr><th>LO</th><th>Cap.</th><th>K</th><th>Ok</th><th>Error</th><th>%</th><th></th></tr>${rows}</table>` : '<p class="small">Aún no hay datos. Responde preguntas para generar estadísticas.</p>'}</div>
      <div class="card"><h2>Intentos recientes</h2>${attempts.length ? `<table class="table"><tr><th>Fecha</th><th>Modo</th><th>Resultado</th><th>%</th></tr>${attempts.map((attempt) => `<tr><td>${h(formatDate(attempt.date))}</td><td>${h(attempt.mode)}</td><td>${number(attempt.correct)}/${number(attempt.total)}</td><td>${number(attempt.scorePct)}%</td></tr>`).join('')}</table>` : '<p class="small">Sin intentos todavía.</p>'}</div>`;
  }

  function weakness(item) {
    const total = number(item.ok) + number(item.bad);
    return total ? number(item.bad) / total : 0;
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-CO');
  }

  function formatStudyDuration(value) {
    const totalSeconds = Math.max(0, Math.trunc(number(value)));
    if (totalSeconds <= 0) return '0 min';
    if (totalSeconds < 60) return '<1 min';
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes} min`;
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  function studyMinutes(value) {
    const totalSeconds = Math.max(0, Math.trunc(number(value)));
    return totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : 0;
  }

  async function bootstrap() {
    bindDom();
    bindEvents();

    try {
      await Auth?.whenReady?.();
      await loadCourses();
      if (Auth?.isAuthenticated?.()) await refreshLearningSnapshot();
      const initialRoute = routeFromLocation();
      const requestedKey = initialRoute.course || Storage.getActiveCourse();
      const initialKey = catalogEntry(requestedKey)?.src ? requestedKey : firstCatalogKey();
      activeCourseKey = initialKey;

      if (initialRoute.course || !PUBLIC_VIEWS.has(initialRoute.view)) {
        await setCourse(initialKey, { view: initialRoute.view, chapter: initialRoute.chapter, updateHash: false });
      } else {
        state = createState(initialRoute.view);
        render();
        if (initialRoute.view === 'account' && Auth?.isAuthenticated?.()) await refreshAccount();
        if (initialRoute.view === 'admin' && Auth?.isAuthenticated?.() && Auth?.isAdmin?.()) await refreshAdmin();
      }

      scrollToAnchor(initialRoute.anchor);
      try {
        if (global.sessionStorage?.getItem(SESSION_CLOSED_KEY) === '1') {
          global.sessionStorage.removeItem(SESSION_CLOSED_KEY);
          notify('Sesión cerrada correctamente.', 'success', 6_000);
        }
      } catch (error) {
        console.warn('No fue posible mostrar la confirmación de cierre de sesión.', error);
      }
      if (!Storage.available()) notify('El navegador no permite guardar progreso local. La academia seguirá funcionando sin persistencia.', 'warning', 10_000);
    } catch (error) {
      showFatalError(error);
    }
  }

  function startBootstrap() {
    bootstrap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startBootstrap, { once: true });
  } else {
    startBootstrap();
  }
}(window));
