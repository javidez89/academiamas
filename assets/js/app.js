'use strict';

(function initAcademyApp(global) {
  const Security = global.AcademySecurity;
  const Registry = global.AcademyRegistry;
  const Storage = global.AcademyStorage;
  const QuestionSelection = global.AcademyQuestionSelection;
  const Auth = global.AcademyAuth;
  const Cloud = global.AcademyCloud;
  const Config = global.ACADEMY_CONFIG || {};
  const ASSET_VERSION = String(Config.assetVersion || '2026-08-25-community-metrics-only');
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
  const READING_SCALE_KEY = 'academiaqa.accessibility.readingScale';
  const ADMIN_SECTION_KEY = 'academiaqa.admin.section';
  const FINAL_EXAM_UNLOCK_PROGRESS = 95;
  const DEVICE_NARRATION_CHUNK_LIMIT = 260;
  const COMMUNITY_ACTIVITY_REFRESH_MS = 15_000;
  const LEARNING_ACTIVITY_HEARTBEAT_MS = 30_000;
  const DEFAULT_PRACTICE_FILTER = Object.freeze({
    chapter: 'all',
    k: 'all',
    lo: 'all',
    count: 20,
    mode: 'study',
    configured: false
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
      description: 'Concientización, amenazas, controles, identidad, incidentes, políticas y cumplimiento.',
      steps: Object.freeze(['Awareness', 'Controles básicos', 'Incidentes y cumplimiento'])
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
    alt: 'Nuevo curso de capacitación profesional avanzada en QAvance'
  });
  const PUBLIC_VIEWS = new Set(['home', 'courses', 'routes', 'contact', 'legal', 'verifyCertificate', 'account', 'admin']);
  const PUBLIC_VIEW_PATHS = Object.freeze({
    home: '/',
    courses: '/cursos/',
    routes: '/ruta-aprendizaje/',
    contact: '/contactanos/',
    legal: '/legal/',
    verifyCertificate: '/validar-certificado/',
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
    verifyCertificate: renderCertificateValidationPage,
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
    coursesByKey: new Map(),
    verifiedByCourse: new Map(),
    verifiedSummary: {},
    legacyByCourse: new Map(),
    legacyTransition: {}
  };
  let communityActivity = {
    registeredStudents: 0,
    activeCourses: 0,
    onlineStudents: 0,
    measuredAt: '',
    loading: true,
    error: false
  };
  let communityActivityRequest = null;
  let socialSettings = {
    linkedin_url: LINKEDIN_URL,
    facebook_url: '',
    tiktok_url: '',
    youtube_url: '',
    whatsapp_url: ''
  };
  let socialSettingsRequest = null;
  let learningActivitySession = null;
  let learningActivityHeartbeatTimer = null;
  let learningActivityGeneration = 0;
  let verifiedAssessmentStartPromise = null;
  let verifiedAssessmentAnswerChain = Promise.resolve();
  let studyTimer = null;
  let lastStudyTickAt = Date.now();
  let lastUserActivityAt = Date.now();
  let certificatePaymentReturnHandled = false;
  const narrationAudio = new Audio();
  let narrationObjectUrl = '';
  let narrationLoadToken = 0;
  let narrationSeekActive = false;
  let narrationDeviceTimer = null;
  let narrationState = {
    contentId: '',
    text: '',
    chunks: [],
    chunkDurations: [],
    chunkIndex: 0,
    deviceSegments: [],
    deviceDurations: [],
    deviceIndex: 0,
    deviceElapsed: 0,
    deviceStartedAt: 0,
    deviceCharIndex: 0,
    deviceUtteranceOffset: 0,
    status: 'idle',
    speed: 1,
    source: '',
    utterance: null
  };
  let readingScale = loadReadingScale();
  const loadingCourseScripts = new Map();

  function loadAdminSection() {
    try {
      const value = global.sessionStorage?.getItem(ADMIN_SECTION_KEY) || '';
      return ['metrics', 'users', 'messages', 'reviews', 'certificates', 'socials'].includes(value) ? value : 'users';
    } catch {
      return 'users';
    }
  }

  function saveAdminSection(value) {
    try {
      global.sessionStorage?.setItem(ADMIN_SECTION_KEY, value);
    } catch {
      // La ruta administrativa sigue siendo la fuente principal si el almacenamiento no está disponible.
    }
  }

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
      homeReviewSlide: 0,
      homeReviewPaused: false,
      studyChapter: null,
      accountLoading: false,
      accountError: '',
      accountProfile: null,
      accountMessages: [],
      accountAccess: { blocked: false, admin_role: null },
      enrollments: [],
      certificates: [],
      certificateOrders: [],
      certificateModal: null,
      certificateValidationLoading: false,
      certificateValidationError: '',
      certificateValidationCode: '',
      certificateValidationResult: null,
      contactSubmitting: false,
      contactResult: '',
      contactError: '',
      publicReviewsLoading: false,
      publicReviews: [],
      publicReviewAverage: 0,
      publicReviewTotal: 0,
      publicReviewDistribution: {},
      courseReviewLoading: false,
      courseReviewSubmitting: false,
      courseReview: null,
      courseReviews: [],
      courseReviewAverage: 0,
      courseReviewTotal: 0,
      courseReviewDistribution: {},
      adminLoading: false,
      adminError: '',
      adminSection: view === 'admin' ? loadAdminSection() : 'users',
      adminSummary: {},
      adminAnalytics: {},
      adminAnalyticsLoading: false,
      adminAnalyticsError: '',
      adminAnalyticsRange: 30,
      adminAnalyticsCourse: 'all',
      adminUsers: [],
      adminTotal: 0,
      adminCertificates: [],
      adminCertificateTotal: 0,
      adminMessages: [],
      adminMessageTotal: 0,
      adminReviews: [],
      adminReviewTotal: 0,
      adminMessageFilter: 'all',
      adminReviewFilter: 'all',
      adminSocialSettings: {},
      adminSocialSaving: false,
      adminSearch: '',
      adminFilter: 'all',
      adminCoursesByKey: new Map(),
      adminGovernanceByUser: new Map(),
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

  function safeHttpsUrl(value, allowedHosts = []) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.protocol !== 'https:') return '';
      if (allowedHosts.length && !allowedHosts.includes(url.hostname.toLowerCase())) return '';
      return url.href;
    } catch {
      return '';
    }
  }

  function normalizeWhatsappUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (/^\+?[0-9\s()-]{7,20}$/.test(raw) && digits.length >= 7 && digits.length <= 15) {
      return `https://wa.me/${digits}`;
    }
    const candidate = /^https:\/\//i.test(raw) ? raw : `https://${raw}`;
    return safeHttpsUrl(candidate, ['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com']);
  }

  function normalizedSocialSettings(value = {}) {
    return {
      linkedin_url: safeHttpsUrl(value.linkedin_url),
      facebook_url: safeHttpsUrl(value.facebook_url),
      tiktok_url: safeHttpsUrl(value.tiktok_url),
      youtube_url: safeHttpsUrl(value.youtube_url),
      whatsapp_url: normalizeWhatsappUrl(value.whatsapp_url)
    };
  }

  function syncFloatingWhatsapp() {
    let link = document.getElementById('whatsappCommunityLink');
    if (!link) {
      link = document.createElement('a');
      link.id = 'whatsappCommunityLink';
      link.className = 'whatsappCommunityLink';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Abrir la comunidad de QAvance en WhatsApp');
      link.innerHTML = `${brandIcon('whatsapp')}<span>Comunidad</span>`;
      document.body.appendChild(link);
    }
    const url = normalizeWhatsappUrl(socialSettings.whatsapp_url);
    link.hidden = !url;
    if (url) link.href = url;
    else link.removeAttribute('href');
  }

  async function refreshSocialSettings({ force = false } = {}) {
    if (socialSettingsRequest && !force) return socialSettingsRequest;
    socialSettingsRequest = (async () => {
      try {
        const value = await Cloud.getPublicSocialSettings();
        socialSettings = { ...socialSettings, ...normalizedSocialSettings(value) };
      } catch (error) {
        console.warn('No fue posible cargar los canales oficiales.', error);
      }
      syncFloatingWhatsapp();
      return socialSettings;
    })();
    try {
      return await socialSettingsRequest;
    } finally {
      socialSettingsRequest = null;
    }
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
    dom.certificateModalBody = $('certificateModalBody');
    dom.messageModal = $('messageModal');
    dom.mainLayout = $('mainLayout');
    dom.heroTitle = $('heroTitle');
    dom.heroSubtitle = $('heroSubtitle');
    dom.topChapters = $('topChapters');
    dom.topBank = $('topBank');
    dom.topExam = $('topExam');
    dom.navCaps = $('navCaps');
    dom.navExamCount = $('navExamCount');
    dom.footerText = $('footerText');
    dom.backToTop = $('backToTop');
    dom.resetProgress = $('resetProgress');
  }

  function bindEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('pointerdown', handleNarrationSeekStart);
    document.addEventListener('pointerup', handleNarrationSeekEnd);
    document.addEventListener('pointercancel', handleNarrationSeekEnd);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('keydown', handleKeyboardActivation);
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((eventName) => {
      document.addEventListener(eventName, noteUserActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleStudyVisibilityChange);
    global.addEventListener('pagehide', handlePageHide);
    global.addEventListener('hashchange', handleLocationRoute);
    global.addEventListener('popstate', handleLocationRoute);
    global.addEventListener('scroll', syncBackToTop, { passive: true });
    global.addEventListener('resize', syncBackToTop, { passive: true });
    global.addEventListener('academiaqa:auth-change', handleAuthStateChange);
    global.addEventListener('academiaqa:admin-change', handleAdminAccessChange);
    global.setInterval(() => {
      if (state.view === 'admin' && document.visibilityState === 'visible' && Auth?.isAdmin?.()) {
        refreshAdmin({ silent: true });
      }
    }, 60_000);
    global.setInterval(() => {
      if (state.view === 'home' && document.visibilityState === 'visible') {
        refreshCommunityActivity({ silent: true });
      }
    }, COMMUNITY_ACTIVITY_REFRESH_MS);

    dom.resetProgress?.addEventListener('click', async () => {
      if (!course) return;
      if (!global.confirm('¿Limpiar la caché local, los intentos de práctica y las preguntas marcadas en este dispositivo? El avance verificado de tu cuenta no se borrará.')) return;
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
      notify(ok ? 'Los datos locales se limpiaron. El avance verificado de tu cuenta se conserva.' : 'No fue posible limpiar los datos locales.', ok ? 'success' : 'error');
      render();
    });
  }

  async function handleAuthStateChange(event) {
    const authenticated = Boolean(event.detail?.authenticated);
    if (!authenticated) {
      persistStudyTime();
      stopStudyTimer();
      learningSnapshot = { profile: null, enrollments: [], progressByCourse: new Map(), coursesByKey: new Map(), verifiedByCourse: new Map(), verifiedSummary: {}, legacyByCourse: new Map(), legacyTransition: {} };
      if (course && !PUBLIC_VIEWS.has(state.view)) {
        const requestedView = state.view;
        showCourseAuthGate(activeCourseKey, { view: requestedView, updateHash: false });
      } else {
        render();
      }
      return;
    }
    if (state.view === 'account') {
      if (authenticated) {
        await refreshAccount();
        await handleCertificatePaymentReturn();
      }
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
      await refreshLearningSnapshot();
      await setCourse(authGateRequest.key, authGateRequest.options);
      return;
    }
    if (authenticated) {
      try {
        await refreshLearningSnapshot();
        if (PUBLIC_VIEWS.has(state.view)) render();
        else syncNavigationState();
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
    const socialSettingsForm = event.target.closest('[data-admin-social-form]');
    if (socialSettingsForm) {
      event.preventDefault();
      await saveAdminSocialSettings(socialSettingsForm);
      return;
    }

    const contactForm = event.target.closest('[data-contact-form]');
    if (contactForm) {
      event.preventDefault();
      await submitContactForm(contactForm);
      return;
    }

    const courseReviewForm = event.target.closest('[data-course-review-form]');
    if (courseReviewForm) {
      event.preventDefault();
      await submitCourseReviewForm(courseReviewForm);
      return;
    }

    const certificateIdentityForm = event.target.closest('[data-certificate-identity-form]');
    if (certificateIdentityForm) {
      event.preventDefault();
      await submitCertificateIdentity(certificateIdentityForm);
      return;
    }

    const certificateValidationForm = event.target.closest('[data-certificate-validation-form]');
    if (certificateValidationForm) {
      event.preventDefault();
      const data = new FormData(certificateValidationForm);
      await openCertificateValidation(data.get('certificateCode'));
      return;
    }

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
      closeMessageModal();
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

    if (event.target === dom.messageModal) {
      closeMessageModal();
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
      closeMessageModal();
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
        await setCourse(actionTarget.dataset.course, actionTarget.dataset.chapter
          ? { view: 'study', chapter: Number(actionTarget.dataset.chapter) }
          : {});
        break;
      case 'sign-in-google':
        await Auth?.signInWithGoogle?.();
        break;
      case 'admin-filter':
        state.adminFilter = ['all', 'online', 'active', 'enrolled', 'unenrolled'].includes(actionTarget.dataset.filter)
          ? actionTarget.dataset.filter
          : 'all';
        render();
        break;
      case 'admin-section':
        state.adminSection = ['metrics', 'users', 'messages', 'reviews', 'certificates', 'socials'].includes(actionTarget.dataset.section)
          ? actionTarget.dataset.section
          : 'users';
        saveAdminSection(state.adminSection);
        render();
        break;
      case 'admin-analytics-range':
        state.adminAnalyticsRange = [7, 30, 90].includes(Number(actionTarget.dataset.days))
          ? Number(actionTarget.dataset.days)
          : 30;
        await refreshAdminAnalytics();
        break;
      case 'admin-analytics-refresh':
        await refreshAdminAnalytics();
        break;
      case 'admin-message-filter':
        state.adminMessageFilter = ['all', 'new', 'in_progress', 'responded', 'closed', 'archived'].includes(actionTarget.dataset.filter)
          ? actionTarget.dataset.filter
          : 'all';
        render();
        break;
      case 'admin-review-filter':
        state.adminReviewFilter = ['all', 'pending', 'approved', 'rejected', 'archived'].includes(actionTarget.dataset.filter)
          ? actionTarget.dataset.filter
          : 'all';
        render();
        break;
      case 'admin-message-status':
        await updateAdminMessage(actionTarget);
        break;
      case 'admin-review-status':
        await moderateAdminReview(actionTarget);
        break;
      case 'admin-user-block':
        await updateAdminUserBlock(actionTarget);
        break;
      case 'admin-user-role':
        await updateAdminUserRole(actionTarget);
        break;
      case 'admin-certificate-eligibility':
        await updateAdminCertificateEligibility(actionTarget);
        break;
      case 'admin-message-delete':
        await softDeleteAdminMessage(actionTarget);
        break;
      case 'admin-review-delete':
        await softDeleteAdminReview(actionTarget);
        break;
      case 'admin-certificate-status':
        await updateAdminCertificateStatus(actionTarget);
        break;
      case 'admin-refresh':
        await refreshAdmin();
        break;
      case 'admin-refresh-access':
        await Auth?.refreshAdminAccess?.();
        if (Auth?.isAdmin?.()) await refreshAdmin();
        else render();
        break;
      case 'retry-course':
        await setCourse(actionTarget.dataset.course, {
          view: actionTarget.dataset.courseView || 'dashboard',
          updateHash: false
        });
        break;
      case 'enroll-course':
        await setCourse(actionTarget.dataset.course, {
          view: actionTarget.dataset.courseView || 'dashboard',
          chapter: Number(actionTarget.dataset.courseChapter) || null,
          enroll: true,
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
        await setCourse(actionTarget.dataset.course, { enroll: true });
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
      case 'home-review-prev':
        shiftHomeReviewSlide(-1);
        break;
      case 'home-review-next':
        shiftHomeReviewSlide(1);
        break;
      case 'home-review-go':
        setHomeReviewSlide(actionTarget.dataset.slide);
        break;
      case 'home-review-toggle':
        state.homeReviewPaused = !state.homeReviewPaused;
        render();
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
      case 'start-certificate-flow':
        await startCertificateFlow(actionTarget.dataset.course);
        break;
      case 'continue-certificate-wompi':
        continueCertificateWompi();
        break;
      case 'retry-certificate-payment':
        await confirmCertificatePayment(actionTarget.dataset.transaction);
        break;
      case 'download-certificate':
        await downloadCertificate(actionTarget.dataset.code);
        break;
      case 'share-certificate-linkedin':
        shareCertificateOnLinkedIn(actionTarget.dataset.code);
        break;
      case 'copy-certificate-url':
        await copyCertificateUrl(actionTarget.dataset.code);
        break;
      case 'view-certificate':
        closeCertificateModal();
        await openCertificateValidation(actionTarget.dataset.code);
        break;
      case 'close-certificate-modal':
        closeCertificateModal();
        break;
      case 'close-message-modal':
        closeMessageModal();
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
      case 'toggle-narration':
        await toggleNarration(actionTarget.dataset.narrationId);
        break;
      case 'repeat-narration':
        repeatNarration();
        break;
      case 'narration-speed':
        setNarrationSpeed(Number(actionTarget.dataset.speed));
        break;
      case 'reading-size':
        setReadingScale(Number(actionTarget.dataset.delta));
        break;
      case 'back-to-top':
        scrollBackToTop();
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
    if (['validar-certificado', 'certificado'].includes(anchor)) return { view: 'verifyCertificate', anchor: 'validar-certificado' };
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
      if (parts[0] === 'validar-certificado') return { view: 'verifyCertificate', anchor: 'validar-certificado' };
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

  function certificateValidationUrl(code, canonical = true) {
    const base = canonical ? `${CANONICAL_ORIGIN}${publicPath('verifyCertificate')}` : publicPath('verifyCertificate');
    return `${base}?codigo=${encodeURIComponent(String(code || '').trim().toUpperCase())}`;
  }

  function syncBackToTop() {
    if (!dom.backToTop) return;
    const root = document.documentElement;
    const scrollTop = Math.max(0, global.scrollY || root.scrollTop || 0);
    const viewportHeight = Math.max(1, global.innerHeight || root.clientHeight || 1);
    const documentHeight = Math.max(root.scrollHeight, document.body?.scrollHeight || 0);
    const nearBottom = scrollTop + viewportHeight >= documentHeight - Math.max(220, viewportHeight * 0.25);
    dom.backToTop.hidden = !(scrollTop > viewportHeight * 0.75 && nearBottom);
  }

  function scrollBackToTop() {
    global.scrollTo({ top: 0, behavior: 'smooth' });
    dom.backToTop?.setAttribute('hidden', '');
  }

  function formatCertificateCop(amountInCents) {
    return formatCopAmount(Math.round(number(amountInCents) / 100));
  }

  function renderCertificateModal() {
    if (!dom.certificateModalBody || !state.certificateModal) return;
    const model = state.certificateModal;
    const entry = catalogEntry(model.courseKey) || {};
    const courseName = model.courseName || entry.meta?.name || model.courseKey || 'Curso QAvance';

    if (model.phase === 'loading') {
      dom.certificateModalBody.innerHTML = `<div class="certificateModalLoading" role="status">
        <span class="sectionKicker">Certificados QAvance</span>
        <h2 id="certificateModalTitle">Preparando tu solicitud...</h2>
        <p>Validamos la finalización del curso y consultamos el valor seguro en Wompi.</p>
      </div>`;
      return;
    }

    if (model.phase === 'error') {
      dom.certificateModalBody.innerHTML = `<div class="certificateModalCopy">
        <span class="sectionKicker">Certificados QAvance</span>
        <h2 id="certificateModalTitle">No fue posible continuar</h2>
        <div class="badbox">${h(model.message || 'Intenta nuevamente más tarde.')}</div>
        <div class="btnrow">${model.transactionId ? `<button class="btn" type="button" data-action="retry-certificate-payment" data-transaction="${h(model.transactionId)}">Reintentar confirmación</button>` : ''}<button class="btn secondary" type="button" data-action="close-certificate-modal">Cerrar</button></div>
      </div>`;
      return;
    }

    if (model.phase === 'offer') {
      dom.certificateModalBody.innerHTML = `<div class="certificateModalCopy">
        <span class="sectionKicker">Emisión verificable</span>
        <h2 id="certificateModalTitle">Obtén tu certificado de finalización</h2>
        <p class="certificateCourseLead">${h(courseName)}</p>
        <div class="certificatePrice"><strong>USD ${number(model.priceUsd, 25)}</strong><span>${h(formatCertificateCop(model.amountInCents))}</span><small>Conversión con TRM consultada al crear la orden.</small></div>
        <ul class="certificateBenefits">
          <li>PDF descargable con código único y QR.</li>
          <li>URL pública de validación para compartir.</li>
          <li>Acceso permanente desde Mi cuenta mientras el certificado esté vigente.</li>
        </ul>
        <div class="note"><b>Importante:</b> es un certificado de finalización emitido por QAvance. No equivale a una certificación oficial de ISTQB, CertiProf ni de otra entidad certificadora.</div>
        <div class="btnrow"><button class="btn good" type="button" data-action="continue-certificate-wompi">Pagar de forma segura con Wompi</button><button class="btn secondary" type="button" data-action="close-certificate-modal">Ahora no</button></div>
      </div>`;
      return;
    }

    if (model.phase === 'payment-pending') {
      dom.certificateModalBody.innerHTML = `<div class="certificateModalCopy">
        <span class="sectionKicker">Confirmación de pago</span>
        <h2 id="certificateModalTitle">Wompi está procesando la transacción</h2>
        <p>No emitiremos el certificado hasta confirmar el pago directamente con Wompi.</p>
        <div class="note"><b>Estado:</b> ${h(model.paymentStatus || 'PENDING')}</div>
        <div class="btnrow"><button class="btn" type="button" data-action="retry-certificate-payment" data-transaction="${h(model.transactionId || '')}">Actualizar estado</button><button class="btn secondary" type="button" data-action="close-certificate-modal">Cerrar</button></div>
      </div>`;
      return;
    }

    if (model.phase === 'identity') {
      const suggestedName = model.fullName || state.accountProfile?.full_name || authUserName();
      const selectedDocumentType = model.documentType || 'CC';
      const documentOptions = [
        ['CC', 'Cédula de ciudadanía'], ['CE', 'Cédula de extranjería'], ['PP', 'Pasaporte'],
        ['TI', 'Tarjeta de identidad'], ['DNI', 'DNI'], ['NIT', 'NIT'], ['RG', 'RG'], ['OTHER', 'Otro']
      ].map(([value, label]) => `<option value="${value}" ${selectedDocumentType === value ? 'selected' : ''}>${label}</option>`).join('');
      dom.certificateModalBody.innerHTML = `<div class="certificateModalCopy">
        <span class="sectionKicker">Datos del certificado</span>
        <h2 id="certificateModalTitle">Confirma la información que aparecerá en el PDF</h2>
        <p class="certificateCourseLead">${h(courseName)}</p>
        <form class="certificateIdentityForm" data-certificate-identity-form>
          <label for="certificateFullName">Nombre completo</label>
          <input id="certificateFullName" name="fullName" type="text" minlength="3" maxlength="120" autocomplete="name" value="${h(suggestedName)}" required>
          <div class="certificateIdentityGrid">
            <div><label for="certificateDocumentType">Tipo de documento</label><select id="certificateDocumentType" name="documentType" required>${documentOptions}</select></div>
            <div><label for="certificateDocumentNumber">Número de documento</label><input id="certificateDocumentNumber" name="documentNumber" type="text" minlength="4" maxlength="30" autocomplete="off" value="${h(model.documentNumber || '')}" required></div>
          </div>
          <label class="certificateConsent"><input name="publicConsent" type="checkbox" value="yes" ${model.publicConsent ? 'checked' : ''} required><span>Autorizo que mi nombre, curso, fechas y documento enmascarado se consulten mediante el código público de validación. El número completo solo aparecerá en mi PDF privado.</span></label>
          ${model.formError ? `<div class="badbox">${h(model.formError)}</div>` : ''}
          <div class="btnrow"><button class="btn good" type="submit" ${model.submitting ? 'disabled' : ''}>${model.submitting ? 'Generando certificado...' : 'Emitir certificado'}</button><button class="btn secondary" type="button" data-action="close-certificate-modal">Cancelar</button></div>
        </form>
      </div>`;
      return;
    }

    if (model.phase === 'issued') {
      const certificate = model.certificate || {};
      dom.certificateModalBody.innerHTML = `<div class="certificateModalCopy certificateIssued">
        <span class="certificateSuccessIcon" aria-hidden="true">✓</span>
        <span class="sectionKicker">Certificado emitido</span>
        <h2 id="certificateModalTitle">Tu certificado ya está disponible</h2>
        <p>${h(certificate.course_name || courseName)}</p>
        <div class="certificateCode"><span>Código único</span><strong>${h(certificate.certificate_code)}</strong></div>
        <div class="btnrow"><button class="btn good" type="button" data-action="download-certificate" data-code="${h(certificate.certificate_code)}">Descargar PDF</button><button class="btn linkedinButton" type="button" data-action="share-certificate-linkedin" data-code="${h(certificate.certificate_code)}">Compartir en LinkedIn</button><button class="btn secondary" type="button" data-action="view-certificate" data-code="${h(certificate.certificate_code)}">Ver validación</button></div>
      </div>`;
    }
  }

  function openCertificateModal(model) {
    if (!dom.certificateModal) return;
    closeCoffeeModal();
    state.certificateModal = model;
    renderCertificateModal();
    dom.certificateModal.hidden = false;
    document.body.classList.add('modalOpen');
    global.setTimeout(() => dom.certificateModal.querySelector('button:not([disabled]), input:not([disabled])')?.focus(), 0);
  }

  async function startCertificateFlow(courseKey) {
    const key = String(courseKey || '').trim().toLowerCase();
    openCertificateModal({ phase: 'loading', courseKey: key });
    try {
      const result = await Cloud.createCertificateCheckout(key);
      if (result.status === 'ISSUED' && result.certificate) {
        state.certificateModal = { phase: 'issued', courseKey: key, certificate: result.certificate };
      } else if (result.status === 'APPROVED' && result.order) {
        state.certificateModal = { phase: 'identity', courseKey: key, courseName: result.course?.name, orderId: result.order.id };
      } else {
        state.certificateModal = {
          phase: 'offer',
          courseKey: key,
          courseName: result.course?.name,
          orderId: result.order?.id,
          priceUsd: result.checkout?.priceUsd || result.order?.price_usd || 25,
          amountInCents: result.checkout?.amountInCents || result.order?.amount_in_cents,
          checkoutUrl: result.checkout?.checkoutUrl
        };
      }
      renderCertificateModal();
    } catch (error) {
      console.error(error);
      state.certificateModal = { phase: 'error', courseKey: key, message: error?.message || 'No fue posible preparar el certificado.' };
      renderCertificateModal();
    }
  }

  function closeCertificateModal() {
    if (!dom.certificateModal || dom.certificateModal.hidden) return;
    dom.certificateModal.hidden = true;
    state.certificateModal = null;
    if (!dom.coffeeModal || dom.coffeeModal.hidden) document.body.classList.remove('modalOpen');
  }

  function continueCertificateWompi() {
    const checkoutUrl = state.certificateModal?.checkoutUrl;
    if (!checkoutUrl || !/^https:\/\/checkout\.wompi\.co\/p\//.test(checkoutUrl)) {
      notify('No fue posible abrir el pago seguro.', 'error');
      return;
    }
    global.location.assign(checkoutUrl);
  }

  async function confirmCertificatePayment(transactionId) {
    const id = String(transactionId || '').trim();
    openCertificateModal({ phase: 'loading' });
    try {
      const result = await Cloud.confirmCertificatePayment(id);
      if (result.status === 'APPROVED') {
        state.certificateModal = {
          phase: 'identity',
          courseKey: result.order?.course_key,
          courseName: result.course?.name,
          orderId: result.order?.id,
          transactionId: id
        };
      } else {
        state.certificateModal = {
          phase: 'payment-pending',
          courseKey: result.order?.course_key,
          transactionId: id,
          paymentStatus: result.status
        };
      }
      renderCertificateModal();
      await refreshAccount();
    } catch (error) {
      console.error(error);
      state.certificateModal = { phase: 'error', transactionId: id, message: error?.message || 'No fue posible confirmar el pago.' };
      renderCertificateModal();
    }
  }

  async function handleCertificatePaymentReturn() {
    const parameters = new URLSearchParams(global.location.search || '');
    if (parameters.get('certificado') !== 'pago') return false;
    if (!Auth?.isAuthenticated?.()) {
      notify('Inicia sesión con la misma cuenta para confirmar el pago del certificado.', 'info', 10_000);
      return false;
    }
    if (certificatePaymentReturnHandled) return true;

    const transactionId = String(parameters.get('id') || '').trim();
    certificatePaymentReturnHandled = true;
    if (!transactionId) {
      openCertificateModal({
        phase: 'error',
        message: 'Wompi no devolvió un identificador de transacción. La orden seguirá disponible en Mi cuenta.'
      });
      return true;
    }

    await confirmCertificatePayment(transactionId);
    const cleanUrl = publicPath('account');
    global.history?.replaceState?.(null, '', cleanUrl);
    return true;
  }

  async function downloadCertificate(code) {
    const popup = global.open('about:blank', '_blank', 'noopener');
    try {
      const result = await Cloud.getCertificateDownload(code);
      if (!result.downloadUrl) throw new Error('No se recibió el archivo del certificado.');
      if (popup) popup.location.replace(result.downloadUrl);
      else global.location.assign(result.downloadUrl);
    } catch (error) {
      popup?.close?.();
      console.error(error);
      notify(error?.message || 'No fue posible descargar el certificado.', 'error');
    }
  }

  function shareCertificateOnLinkedIn(code) {
    const validationUrl = certificateValidationUrl(code);
    global.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(validationUrl)}`, '_blank', 'noopener,noreferrer');
  }

  async function copyCertificateUrl(code) {
    const validationUrl = certificateValidationUrl(code);
    try {
      await navigator.clipboard.writeText(validationUrl);
      notify('URL del certificado copiada.', 'success');
    } catch {
      global.prompt('Copia la URL pública del certificado:', validationUrl);
    }
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

  function handleInput(event) {
    const seek = event.target.closest('[data-narration-seek]');
    if (!seek || seek.disabled) return;
    narrationSeekActive = true;
    previewNarrationSeek(seek);
  }

  async function handleChange(event) {
    const seek = event.target.closest('[data-narration-seek]');
    if (seek && !seek.disabled) {
      try {
        await seekNarration(Number(seek.value));
      } finally {
        narrationSeekActive = false;
        updateNarrationTimeline();
      }
      return;
    }
    if (event.target.id === 'flashFilter') {
      state.flashFilter = event.target.value;
      state.flashIndex = 0;
      state.flashShow = false;
      render();
      return;
    }
    if (event.target.id === 'adminAnalyticsCourse') {
      state.adminAnalyticsCourse = catalogEntry(event.target.value)?.key || 'all';
      await refreshAdminAnalytics();
    }
  }

  function handleNarrationSeekStart(event) {
    const seek = event.target.closest('[data-narration-seek]');
    if (seek && !seek.disabled) narrationSeekActive = true;
  }

  function handleNarrationSeekEnd(event) {
    if (!narrationSeekActive) return;
    global.setTimeout(() => {
      narrationSeekActive = false;
      updateNarrationTimeline();
    }, 0);
  }

  function clearRuntimeTimers({ endLearningActivity = true } = {}) {
    clearHomeSlider();
    if (state.timer) global.clearInterval(state.timer);
    if (state.pendingAdvance) global.clearTimeout(state.pendingAdvance);
    state.timer = null;
    state.pendingAdvance = null;
    if (endLearningActivity) endVerifiedLearningActivity();
    else clearLearningActivityHeartbeat();
    setExamFocus(false);
    stopNarration();
  }

  function clearLearningActivityHeartbeat() {
    if (learningActivityHeartbeatTimer) global.clearInterval(learningActivityHeartbeatTimer);
    learningActivityHeartbeatTimer = null;
  }

  function endVerifiedLearningActivity() {
    learningActivityGeneration += 1;
    clearLearningActivityHeartbeat();
    const current = learningActivitySession;
    learningActivitySession = null;
    if (!current?.sessionId) return Promise.resolve(false);
    return Promise.resolve(Cloud.endLearningActivity(current.sessionId))
      .then(async (ended) => {
        if (ended && Auth?.isAuthenticated?.()) {
          try {
            await refreshVerifiedLearningDashboard();
            syncNavigationState();
          } catch (error) {
            console.error('No fue posible refrescar el avance verificado.', error);
          }
        }
        if (state.view === 'home') refreshCommunityActivity({ silent: true });
        return ended;
      })
      .catch(() => false);
  }

  async function touchVerifiedLearningActivity() {
    const current = learningActivitySession;
    if (!current?.sessionId || document.visibilityState !== 'visible') return false;
    if (Date.now() - lastUserActivityAt > 120_000) return false;
    try {
      const touched = await Cloud.touchLearningActivity(current.sessionId);
      if (!touched && learningActivitySession?.sessionId === current.sessionId) {
        learningActivitySession = null;
        clearLearningActivityHeartbeat();
      }
      return touched;
    } catch {
      return false;
    }
  }

  function startVerifiedLearningActivity(activityType, context = {}) {
    const chapterId = Number.isInteger(Number(context.chapterId)) && Number(context.chapterId) > 0
      ? Number(context.chapterId)
      : null;
    const hasQuestionSession = state.session.length > 0;
    const isReading = activityType === 'reading';
    const isRelevant = () => isReading
      ? state.view === 'study' && state.studyChapter === chapterId
      : state.session.length > 0;
    if (!Auth?.isAuthenticated?.() || !activeCourseKey || (!isReading && !hasQuestionSession)) return Promise.resolve(null);
    if (
      learningActivitySession?.courseKey === activeCourseKey
      && learningActivitySession.activityType === activityType
      && learningActivitySession.chapterId === chapterId
    ) {
      touchVerifiedLearningActivity();
      return Promise.resolve(learningActivitySession);
    }
    const generation = ++learningActivityGeneration;
    clearLearningActivityHeartbeat();
    const previous = learningActivitySession;
    learningActivitySession = null;
    if (previous?.sessionId) Promise.resolve(Cloud.endLearningActivity(previous.sessionId)).catch(() => {});

    return Promise.resolve(Cloud.beginLearningActivity(activeCourseKey, activityType, { chapterId }))
      .then((session) => {
        if (generation !== learningActivityGeneration || !isRelevant()) {
          return Promise.resolve(Cloud.endLearningActivity(session.sessionId)).catch(() => false);
        }
        learningActivitySession = session;
        learningActivityHeartbeatTimer = global.setInterval(() => {
          touchVerifiedLearningActivity();
        }, LEARNING_ACTIVITY_HEARTBEAT_MS);
        if (state.view === 'home') refreshCommunityActivity({ silent: true });
        return session;
      })
      .catch((error) => {
        if (generation === learningActivityGeneration) {
          learningActivitySession = null;
          clearLearningActivityHeartbeat();
        }
        console.error(error);
        return null;
      });
  }

  function startVerifiedAssessment(activityType, context = {}) {
    verifiedAssessmentAnswerChain = Promise.resolve();
    verifiedAssessmentStartPromise = startVerifiedLearningActivity(activityType, context)
      .then((activity) => {
        if (!activity?.sessionId || !state.session.length) return null;
        return Cloud.startVerifiedAssessment(
          activity.sessionId,
          state.session.map((question) => question.id)
        );
      })
      .catch((error) => {
        console.error(error);
        notify('La evaluación continuará localmente, pero no podrá acreditarse hasta recuperar la conexión segura.', 'warning', 8_000);
        return null;
      });
    return verifiedAssessmentStartPromise;
  }

  function queueVerifiedAnswer(question, selectedIndices) {
    if (!Auth?.isAuthenticated?.() || !verifiedAssessmentStartPromise || !question?.id || !selectedIndices?.length) {
      return Promise.resolve(null);
    }
    verifiedAssessmentAnswerChain = verifiedAssessmentAnswerChain
      .catch(() => null)
      .then(() => verifiedAssessmentStartPromise)
      .then((attempt) => attempt
        ? Cloud.submitVerifiedAnswer(attempt.attemptId, question.id, selectedIndices)
        : null);
    return verifiedAssessmentAnswerChain;
  }

  function completeCurrentVerifiedAssessment() {
    if (!Auth?.isAuthenticated?.() || !verifiedAssessmentStartPromise) return Promise.resolve(null);
    for (const question of state.session) {
      const answer = state.answers[question.id] || [];
      if (answer.length) queueVerifiedAnswer(question, answer);
    }
    return verifiedAssessmentAnswerChain
      .catch(() => null)
      .then(() => verifiedAssessmentStartPromise)
      .then((attempt) => attempt ? Cloud.completeVerifiedAssessment(attempt.attemptId) : null);
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
      touchVerifiedLearningActivity();
    }
  }

  function handlePageHide() {
    persistStudyTime();
    endVerifiedLearningActivity();
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
    await Auth?.refreshAccessStatus?.();
    if (Auth?.isBlocked?.()) {
      showCourseAuthGate(normalizedKey, options, Auth?.getAccessStatus?.()?.reason || 'Esta cuenta está bloqueada. Contacta al equipo de QAvance.');
      return false;
    }

    const currentEnrollment = enrollmentForCourse(normalizedKey);
    const hasActiveEnrollment = Boolean(currentEnrollment && currentEnrollment.status !== 'cancelled');
    if (!hasActiveEnrollment && options.enroll !== true) {
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
      const enrollment = hasActiveEnrollment
        ? currentEnrollment
        : await Cloud.enroll(normalizedKey, estimatedCourseHours(loadedCourse));
      const localProgress = Storage.getProgress(nextStorageKey);
      const cloudProgress = await Cloud.loadProgress(normalizedKey);
      const mergedProgress = Cloud.mergeProgress(localProgress, cloudProgress);
      const localSave = Storage.saveProgress(nextStorageKey, mergedProgress);
      if (!localSave.ok) throw new Error('No fue posible preparar el progreso local.');
      await Cloud.syncProgress(normalizedKey, mergedProgress);
      updateLearningSnapshot(normalizedKey, loadedCourse, mergedProgress, enrollment);
      await refreshVerifiedLearningDashboard();
    } catch (error) {
      console.error(error);
      showCourseAuthGate(normalizedKey, options, 'No fue posible conectar la matrícula y el progreso con la nube. Intenta nuevamente.');
      return false;
    }

    course = loadedCourse;
    activeCourseKey = normalizedKey;
    questions = QuestionSelection.questionsForCourse(course.questions, normalizedKey);
    if (questions.length !== course.questions.length) {
      throw new Error(`El banco de ${normalizedKey} contiene preguntas de otro curso.`);
    }
    progressStorageKey = course.meta?.storageKey || `academy_${normalizedKey}_progress`;
    state = createState(options.view || 'dashboard');
    state.studyChapter = Number(options.chapter) || null;
    authGateRequest = null;
    Storage.setActiveCourse(normalizedKey);
    updateCourseUi();
    startStudyTimer();
    render();
    await refreshCourseReviews();
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
    if (view === 'home') await refreshPublicReviews();
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

  function activateCourseView(view) {
    state.view = view;
    syncNavigationState();
    updateDocumentMetadata();
    pushRoute(routePathForView(view));
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
        : locked ? `${verifiedProgressPercent(finalExamDetails)}% / ${FINAL_EXAM_UNLOCK_PROGRESS}% verificable` : 'habilitado');
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
      Cloud.queueProgressSync(activeCourseKey, progress);
    }
  }

  function updateEnrollmentSnapshot(value) {
    if (!value?.course_key) return;
    const index = learningSnapshot.enrollments.findIndex((item) => item.course_key === value.course_key);
    const verified = learningSnapshot.verifiedByCourse.get(value.course_key) || {};
    const legacyProgress = learningSnapshot.legacyByCourse.get(value.course_key) || null;
    if (index >= 0) learningSnapshot.enrollments[index] = { ...learningSnapshot.enrollments[index], ...value, ...verified, legacy_progress: legacyProgress };
    else learningSnapshot.enrollments.push({ ...value, legacy_progress: legacyProgress });
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
      learningSnapshot = { profile: null, enrollments: [], progressByCourse: new Map(), coursesByKey: new Map(), verifiedByCourse: new Map(), verifiedSummary: {}, legacyByCourse: new Map(), legacyTransition: {} };
      return learningSnapshot;
    }

    const profileRequest = includeProfile ? Cloud.getProfile() : Promise.resolve(learningSnapshot.profile);
    const [profile, enrollmentRows] = await Promise.all([
      profileRequest,
      Cloud.listEnrollments()
    ]);
    const progressByCourse = new Map();
    const coursesByKey = new Map();
    await Promise.all(enrollmentRows.map(async (enrollment) => {
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
    const verifiedDashboard = await Cloud.getVerifiedLearningDashboard();
    const verifiedCourses = verifiedDashboard.verified ? verifiedDashboard.courses : [];
    const verifiedByCourse = new Map(verifiedCourses.map((item) => [item.course_key, item]));
    const legacyByCourse = new Map(verifiedDashboard.legacyProgress.map((item) => [item.course_key, item]));
    const enrollments = enrollmentRows.map((item) => ({
      ...item,
      ...(verifiedByCourse.get(item.course_key) || {}),
      legacy_progress: legacyByCourse.get(item.course_key) || null
    }));

    learningSnapshot = {
      profile: profile || null,
      enrollments,
      progressByCourse,
      coursesByKey,
      verifiedByCourse,
      verifiedSummary: verifiedDashboard.summary || {},
      legacyByCourse,
      legacyTransition: verifiedDashboard.legacyTransition || {}
    };
    return learningSnapshot;
  }

  async function refreshVerifiedLearningDashboard() {
    if (!Auth?.isAuthenticated?.()) return null;
    const dashboard = await Cloud.getVerifiedLearningDashboard();
    if (!dashboard.verified) throw new Error('El resumen de aprendizaje no está verificado.');
    const verifiedByCourse = new Map(dashboard.courses.map((item) => [item.course_key, item]));
    const legacyByCourse = new Map(dashboard.legacyProgress.map((item) => [item.course_key, item]));
    learningSnapshot.verifiedByCourse = verifiedByCourse;
    learningSnapshot.verifiedSummary = dashboard.summary || {};
    learningSnapshot.legacyByCourse = legacyByCourse;
    learningSnapshot.legacyTransition = dashboard.legacyTransition || {};
    learningSnapshot.enrollments = learningSnapshot.enrollments.map((item) => ({
      ...item,
      ...(verifiedByCourse.get(item.course_key) || {}),
      legacy_progress: legacyByCourse.get(item.course_key) || null
    }));
    return dashboard;
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
      home: ['Cursos QA gratis y simulacros ISTQB | QAvance', Config.description],
      courses: ['Cursos gratis de QA, Testing, IA y Scrum | QAvance', 'Explora cursos gratis de QA, testing, IA, Scrum, gestión de proyectos y ciberseguridad con syllabus, práctica y simulacros.'],
      routes: ['Rutas para aprender QA, Testing, IA y Scrum | QAvance', 'Elige una ruta gratuita en QA, testing, IA, Scrum, gestión de proyectos o ciberseguridad y avanza hasta el simulacro.'],
      contact: ['Contáctanos | QAvance', 'Contacta a QAvance para reportar un problema, sugerir una mejora académica o proponer una colaboración para la comunidad QA.'],
      legal: ['Información legal y privacidad | QAvance', 'Consulta la política de privacidad, los términos de uso y el aviso de plataforma educativa independiente de QAvance.'],
      verifyCertificate: ['Validar certificado QAvance | Consulta pública', 'Consulta un certificado de finalización de QAvance mediante su código único y verifica su estado, curso y fecha de emisión.'],
      account: ['Mi cuenta | QAvance', 'Consulta tus matrículas, avance y actividad de aprendizaje en QAvance.'],
      admin: ['Administración | QAvance', 'Panel privado de usuarios y aprendizaje de QAvance.']
    };
    if (PUBLIC_VIEWS.has(state.view)) {
      const [title, description] = publicMetadata[state.view] || publicMetadata.home;
      return { title, description: compactText(description), path: publicPath(state.view) };
    }

    const label = seoCourseLabel();
    if (state.view === 'exam') {
      const blueprint = course?.blueprint || {};
      return {
        title: `Simulacro ${catalogEntry(activeCourseKey).family === 'ISTQB' ? 'ISTQB ' : ''}${label} gratis | QAvance`,
        description: compactText(`Practica con el simulacro de ${label}: ${blueprint.totalQuestions || 0} preguntas, ${blueprint.minutes || 0} minutos y aprobación de ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}. Acceso gratis en QAvance.`),
        path: coursePath(activeCourseKey, 'exam')
      };
    }

    if (state.view === 'finalExam') {
      const blueprint = course?.blueprint || {};
      return {
        title: `Examen final ${label} | QAvance`,
        description: compactText(`Examen final interno de ${label}: ${blueprint.totalQuestions || 0} preguntas, ${blueprint.minutes || 0} minutos y aprobación de ${blueprint.passingScore || 0}/${blueprint.totalPoints || blueprint.totalQuestions || 0}.`),
        path: coursePath(activeCourseKey, 'finalExam')
      };
    }

    if (state.view === 'study' && state.studyChapter) {
      const chapter = course?.chapters?.find((item) => Number(item.id) === Number(state.studyChapter));
      if (chapter) {
        const detailedTitle = `C${chapter.id}: ${chapter.title} | ${label} - QAvance`;
        return {
          title: detailedTitle.length <= 65 ? detailedTitle : `Capítulo ${chapter.id} ${label} | QAvance`,
          description: compactText(`Capítulo ${chapter.id} de ${label}: ${chapter.summary} Estudia objetivos LO, términos y ejemplos en QAvance.`),
          path: chapterPath(activeCourseKey, chapter.id)
        };
      }
    }

    return {
      title: `Curso ${catalogEntry(activeCourseKey).family === 'ISTQB' ? 'ISTQB ' : ''}${label} gratis y simulador | QAvance`,
      description: compactText(course?.meta?.subtitle || `Estudia ${label} gratis con syllabus, práctica y simulacro en QAvance.`),
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
      verifyCertificate: 'Validar certificado',
      account: 'Mi cuenta',
      admin: 'Administración',
      authGate: gateEntry?.meta?.name || 'Acceso al curso'
    };
    const publicSubtitles = {
      home: Config.description || 'Selecciona una certificación para iniciar.',
      courses: 'Explora todos los cursos disponibles y entra a la ruta que quieres estudiar.',
      routes: 'Rutas sugeridas para avanzar por testing, IA, Scrum, gestión y ciberseguridad.',
      contact: 'Cuéntanos una idea, problema, error académico o propuesta de colaboración.',
      legal: 'Política de privacidad, términos y condiciones de uso de QAvance.',
      verifyCertificate: 'Consulta el código único de un certificado de finalización emitido por QAvance.',
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
    const isHomeView = state.view === 'home';
    dom.footerText.classList.toggle('homeFooter', isHomeView);
    setTextIfChanged(dom.footerText, isHomeView ? `QAvance · v${APP_VERSION}` : '');
    dom.footerText.hidden = !isHomeView;

    const hasK3 = course ? questions.some((question) => question.k === 'K3') : false;
    const hasFlashcards = course ? Array.isArray(course.flashcards) && course.flashcards.length > 0 : false;
    const hasObjectives = course ? Array.isArray(course.objectives) && course.objectives.length > 0 : false;

    document.querySelector('[data-view="k3lab"]')?.toggleAttribute('hidden', !hasK3);
    document.querySelector('[data-view="flashcards"]')?.toggleAttribute('hidden', !hasFlashcards);
    document.querySelector('[data-view="objectives"]')?.toggleAttribute('hidden', !hasObjectives);
    syncNavigationState();
    updateDocumentMetadata();
  }

  function renderCoursePageHeading() {
    const labels = {
      study: 'Syllabus y capítulos',
      objectives: 'Objetivos de aprendizaje',
      practice: 'Práctica personalizada',
      exam: 'Simulacro',
      finalExam: 'Examen final',
      k3lab: 'Laboratorio K3',
      flashcards: 'Flashcards',
      analytics: 'Estadísticas y refuerzo'
    };
    let label = labels[state.view] || 'Curso';
    if (state.view === 'study' && state.studyChapter) {
      const chapter = course?.chapters?.find((item) => Number(item.id) === Number(state.studyChapter));
      label = chapter ? `Capítulo ${chapter.id}: ${chapter.title}` : label;
    }
    return `<header class="coursePageHeading">
      <span class="sectionKicker">${h(course?.meta?.code || activeCourseKey.toUpperCase())}</span>
      <h1>${h(label)}</h1>
      <p>${h(courseLabel())}</p>
    </header>`;
  }

  function render() {
    if (!course && !PUBLIC_VIEWS.has(state.view) && state.view !== 'authGate') return;
    updateCourseUi();
    const renderer = VIEW_RENDERERS[state.view] || VIEW_RENDERERS.home;

    try {
      let renderedHtml = renderer();
      if (!PUBLIC_VIEWS.has(state.view) && !['authGate', 'dashboard'].includes(state.view)) {
        renderedHtml = `${renderCoursePageHeading()}${renderedHtml}`;
      }
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
    global.requestAnimationFrame(syncBackToTop);
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

  function practiceEvidenceIds(courseData, progressValue, predicate = () => true) {
    const questionIds = new Set((courseData?.questions || []).filter(predicate).map((question) => String(question.id)));
    const evidence = new Set();
    Object.keys(progressValue?.questionResults || {}).forEach((questionId) => {
      if (questionIds.has(questionId)) evidence.add(questionId);
    });
    return evidence;
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
    const chapterQuestions = (courseData?.questions || []).filter((question) => Number(question.chapter) === Number(chapterId));
    const evidenceIds = practiceEvidenceIds(courseData, progress, (question) => Number(question.chapter) === Number(chapterId));
    const exactResults = Object.entries(progress.questionResults || {})
      .filter(([questionId]) => chapterQuestions.some((question) => String(question.id) === questionId))
      .map(([, result]) => result);
    const exactCorrect = exactResults.filter((result) => result.correct).length;
    const chapter = (courseData?.chapters || []).find((item) => Number(item.id) === Number(chapterId)) || {};
    const activity = progress.chapterActivity?.[String(chapterId)] || {};
    const studySeconds = number(activity.studySeconds);
    const suggestedSeconds = Math.max(60, number(chapter.minutes) * 60);
    const suggestedMinutes = Math.max(1, Math.round(suggestedSeconds / 60));
    const readingProgress = Math.min(100, pct(studySeconds, suggestedSeconds));
    const touchedLos = new Set(exactResults.map((result) => result.lo).filter(Boolean));
    const objectiveProgressPct = objectives.length
      ? pct(touchedLos.size || chapterStats.touched, objectives.length)
      : readingProgress;
    const practiceCoverage = chapterQuestions.length ? pct(evidenceIds.size, chapterQuestions.length) : objectiveProgressPct;
    const coverage = Math.min(100, Math.round((readingProgress * 0.4) + (practiceCoverage * 0.6)));
    const accuracy = exactResults.length ? pct(exactCorrect, exactResults.length) : pct(chapterStats.ok, chapterStats.answered);
    const domain = chapterQuestions.length ? pct(exactCorrect, chapterQuestions.length) : Math.min(100, Math.round((accuracy * objectiveProgressPct) / 100));

    return {
      ...chapterStats,
      chapterId: Number(chapterId),
      title: chapter.title || `Capítulo ${chapterId}`,
      objectiveCount: objectives.length,
      questionCount: chapterQuestions.length,
      uniqueAnswered: evidenceIds.size,
      uniqueCorrect: exactCorrect,
      practiceCoverage,
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

  function legacyCourseProgressDetailsFrom(key, item, progressValue, enrollmentValue = null) {
    const progress = Storage.normalizeProgress(progressValue || {});
    const attempts = progress.attempts || [];
    const simulatorAttempts = attempts.filter((attempt) => attempt.mode === 'exam');
    const best = simulatorAttempts.length ? Math.max(...simulatorAttempts.map((attempt) => number(attempt.scorePct, 0))) : 0;
    const marked = Array.isArray(progress.marked) ? progress.marked.length : 0;
    const courseData = learningSnapshot.coursesByKey.get(key) || Registry.get(key) || (Array.isArray(item?.chapters) ? item : null);
    const answered = practiceEvidenceIds(courseData, progress).size;
    const chapters = (courseData?.chapters || []).map((chapter) => chapterProgressForCourse(courseData, progress, chapter.id));
    const chapterAverage = chapters.length
      ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.coverage, 0) / chapters.length)
      : 0;
    const enrollment = enrollmentValue;
    const questionTotal = chapters.reduce((sum, chapter) => sum + number(chapter.questionCount), 0);
    const chapterDomainAverage = questionTotal
      ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.domain * chapter.questionCount), 0) / questionTotal)
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
      isEnrolled: Boolean(enrollment && enrollment.status !== 'cancelled'),
      verified: false
    };
  }

  function courseProgressDetailsFrom(key, item, progressValue, enrollmentValue = null) {
    const official = enrollmentValue?.verified === true
      ? enrollmentValue
      : learningSnapshot.verifiedByCourse.get(key);
    if (official?.verified !== true) {
      return legacyCourseProgressDetailsFrom(key, item, progressValue, enrollmentValue);
    }

    const progress = Storage.normalizeProgress(progressValue || {});
    const attempts = progress.attempts || [];
    const officialChapters = (Array.isArray(official.chapters) ? official.chapters : []).map((chapter) => ({
      chapterId: number(chapter.chapter_id),
      title: chapter.title || `Capítulo ${number(chapter.chapter_id)}`,
      objectiveCount: number(chapter.objective_count),
      questionCount: number(chapter.question_count),
      uniqueAnswered: number(chapter.unique_answered),
      uniqueCorrect: number(chapter.unique_correct),
      touched: number(chapter.touched_objectives),
      practiceCoverage: number(chapter.practice_coverage),
      accuracy: pct(number(chapter.unique_correct), number(chapter.unique_answered)),
      domain: number(chapter.domain),
      objectiveProgress: pct(number(chapter.touched_objectives), number(chapter.objective_count)),
      readingProgress: number(chapter.reading_progress),
      coverage: number(chapter.coverage),
      studySeconds: number(chapter.study_seconds),
      studyMinutes: number(chapter.study_minutes),
      suggestedMinutes: number(chapter.suggested_minutes),
      visitedAt: chapter.visited_at || '',
      lastStudiedAt: chapter.last_studied_at || '',
      verifiedCoverage: number(chapter.coverage),
      verifiedDomain: number(chapter.domain)
    }));
    const legacyRecord = enrollmentValue?.legacy_progress || learningSnapshot.legacyByCourse.get(key) || null;
    const legacyDetails = legacyRecord?.progress
      ? legacyCourseProgressDetailsFrom(key, item, legacyRecord.progress, legacyRecord.enrollment || null)
      : null;
    const verifiedProgressPercent = number(official.progress_percent);
    const historicalProgressPercent = number(legacyDetails?.progressPercent);
    const hasUnverifiedHistory = historicalProgressPercent > 10 && historicalProgressPercent > verifiedProgressPercent;
    const historicalChapterById = new Map((legacyDetails?.chapters || []).map((chapter) => [number(chapter.chapterId), chapter]));
    const chapters = officialChapters.map((chapter) => {
      const historical = hasUnverifiedHistory ? historicalChapterById.get(chapter.chapterId) : null;
      if (!historical || number(historical.coverage) <= chapter.coverage) return chapter;
      return {
        ...chapter,
        coverage: number(historical.coverage),
        domain: Math.max(chapter.domain, number(historical.domain)),
        readingProgress: Math.max(chapter.readingProgress, number(historical.readingProgress)),
        practiceCoverage: Math.max(chapter.practiceCoverage, number(historical.practiceCoverage)),
        studyMinutes: Math.max(chapter.studyMinutes, number(historical.studyMinutes)),
        historicalCoverage: number(historical.coverage),
        historicalDomain: number(historical.domain),
        historicalStudySeconds: number(historical.studySeconds),
        hasUnverifiedHistory: true
      };
    });

    return {
      attempts,
      best: number(official.best_simulator_score),
      last: attempts.at(-1) || null,
      answered: number(official.practice_answers),
      marked: Array.isArray(progress.marked) ? progress.marked.length : 0,
      started: number(official.study_seconds) > 0 || number(official.practice_answers) > 0 || number(official.simulator_attempts) > 0 || number(official.final_exam_attempts) > 0 || hasUnverifiedHistory,
      chapters,
      chapterAverage: hasUnverifiedHistory ? Math.max(number(official.chapter_average), number(legacyDetails?.chapterAverage)) : number(official.chapter_average),
      chapterDomainAverage: number(official.chapter_domain_average),
      finalExamScore: number(official.best_final_exam_score),
      masteryPercent: number(official.mastery_percent),
      progressPercent: hasUnverifiedHistory ? historicalProgressPercent : verifiedProgressPercent,
      verifiedProgressPercent,
      historicalProgressPercent: hasUnverifiedHistory ? historicalProgressPercent : 0,
      studySeconds: number(official.study_seconds),
      historicalStudySeconds: hasUnverifiedHistory ? number(legacyDetails?.studySeconds) : 0,
      enrollment: official,
      finalExamPassed: official.final_exam_passed === true,
      finalExamEligible: official.final_exam_eligible === true,
      isEnrolled: official.status !== 'cancelled',
      verified: true,
      hasUnverifiedHistory,
      progressLabel: hasUnverifiedHistory ? 'Histórico no verificado' : 'Avance verificado'
    };
  }

  function verifiedProgressPercent(details) {
    return details?.verified === true
      ? number(details.verifiedProgressPercent, details.progressPercent)
      : number(details?.progressPercent);
  }

  function courseProgressDetails(key, item) {
    return courseProgressDetailsFrom(
      key,
      item,
      progressForCourse(key, item),
      learningSnapshot.verifiedByCourse.get(key) || enrollmentForCourse(key)
    );
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

  function homeReviewSlides() {
    return (Array.isArray(state.publicReviews) ? state.publicReviews : []).slice(0, 10);
  }

  function setHomeReviewSlide(value) {
    const reviews = homeReviewSlides();
    if (!reviews.length) return;
    state.homeReviewSlide = Math.max(0, Math.min(reviews.length - 1, Math.trunc(number(value, 0))));
    render();
  }

  function shiftHomeReviewSlide(delta) {
    const reviews = homeReviewSlides();
    if (!reviews.length) return;
    state.homeReviewSlide = (state.homeReviewSlide + number(delta, 0) + reviews.length) % reviews.length;
    render();
  }

  function clearHomeSlider() {
    if (!homeSliderTimer) return;
    global.clearInterval(homeSliderTimer);
    homeSliderTimer = null;
  }

  async function refreshCommunityActivity({ silent = false } = {}) {
    if (communityActivityRequest) return communityActivityRequest;
    if (!silent) communityActivity = { ...communityActivity, loading: true, error: false };
    communityActivityRequest = Cloud.getPublicLearningActivity()
      .then((value) => {
        communityActivity = { ...value, loading: false, error: false };
        if (state.view === 'home') render();
        return communityActivity;
      })
      .catch((error) => {
        console.warn('No fue posible actualizar la actividad pública de QAvance.', error);
        communityActivity = { ...communityActivity, loading: false, error: true };
        if (state.view === 'home') render();
        return communityActivity;
      })
      .finally(() => {
        communityActivityRequest = null;
      });
    return communityActivityRequest;
  }

  function renderCommunityActivity() {
    const registered = communityActivity.loading || communityActivity.error
      ? '—'
      : communityActivity.registeredStudents.toLocaleString('es-CO');
    const activeCourses = communityActivity.loading || communityActivity.error
      ? '—'
      : communityActivity.activeCourses.toLocaleString('es-CO');
    const onlineStudents = communityActivity.loading || communityActivity.error
      ? '—'
      : communityActivity.onlineStudents.toLocaleString('es-CO');
    return `<section class="communityActivity" aria-labelledby="communityActivityTitle" aria-live="polite">
      <div class="communityActivityCopy">
        <span class="sectionKicker">Comunidad QAvance</span>
        <h2 id="communityActivityTitle">Aprendemos en comunidad.</h2>
      </div>
      <div class="communityMetric">
        <strong data-community-registered>${h(registered)}</strong>
        <span>Personas registradas</span>
      </div>
      <div class="communityMetric">
        <strong data-community-courses>${h(activeCourses)}</strong>
        <span>Cursos activos</span>
      </div>
      <div class="communityMetric communityMetricOnline">
        <strong data-community-online>${h(onlineStudents)}</strong>
        <span>En línea ahora</span>
      </div>
    </section>`;
  }

  function renderHomeCourseAdvantages() {
    return `<section class="homeCourseAdvantages" id="como-estudiar" aria-labelledby="homeCourseAdvantagesTitle">
      <div class="homeCourseAdvantagesHead">
        <div>
          <span class="sectionKicker">Una ruta completa</span>
          <h2 id="homeCourseAdvantagesTitle">Una ruta completa para avanzar</h2>
          <p>Elige tu curso, lee o escucha cada capítulo, practica por objetivo y presenta el examen final. Cuando apruebes, podrás emitir opcionalmente una constancia digital verificable.</p>
        </div>
        <div class="homeCourseAdvantagesAction">
          <span><b>Audio de estudio</b> Voz en español</span>
          <span><b>Meta del curso</b> Examen final</span>
          <a class="btn" href="${h(publicPath('courses'))}" data-view="courses">Explorar cursos</a>
        </div>
      </div>

      <div class="studyPathGrid" aria-label="Pasos de la ruta de aprendizaje">
        <article><strong>1</strong><h3>Elige una ruta</h3><p>Explora el área profesional y selecciona el curso que necesitas.</p></article>
        <article><strong>2</strong><h3>Lee o escucha los capítulos</h3><p>Repasa el syllabus, los objetivos LO y el material ampliado en texto o audio.</p></article>
        <article><strong>3</strong><h3>Practica por foco</h3><p>Filtra las preguntas por capítulo, nivel K u objetivo de aprendizaje.</p></article>
        <article><strong>4</strong><h3>Simula, aprueba y valida</h3><p>Refuerza con simulacros y presenta el examen final. Al aprobar, podrás emitir tu constancia.</p></article>
      </div>

      <article class="homeAudioFeature" aria-labelledby="homeAudioFeatureTitle">
        <div class="homeAudioPreview" aria-hidden="true">
          <div class="homeAudioPreviewHead">
            <span class="homeAudioSpeaker">◖)))</span>
            <div><small>CAPÍTULO EN REPRODUCCIÓN</small><strong>Fundamentos de la prueba</strong></div>
          </div>
          <div class="homeAudioWave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="homeAudioTimeline"><span></span></div>
          <div class="homeAudioControls"><b>0:00</b><span>0.75x</span><span class="active">1x</span><span>1.25x</span><b>8:24</b></div>
        </div>
        <div class="homeAudioCopy">
          <span class="sectionKicker">Texto y audio en el mismo lugar</span>
          <h3 id="homeAudioFeatureTitle">Lee cada idea. Escúchala a tu ritmo.</h3>
          <p>Los capítulos, objetivos de aprendizaje y materiales ampliados se pueden estudiar en pantalla o escuchar en español, sin perder el punto de lectura.</p>
          <ul class="homeAudioBenefits">
            <li>Voz femenina en español colombiano y respaldo de voz del dispositivo.</li>
            <li>Pausa, repite y muévete por la barra de avance.</li>
            <li>Ajusta la velocidad a 0.75x, 1x o 1.25x.</li>
          </ul>
          <a class="btn secondary" href="${h(publicPath('courses'))}" data-view="courses">Explorar cursos con audio</a>
        </div>
      </article>

      <article class="homeAchievementFeature">
        <a class="homeAchievementVisual homeReferenceMedia homeReferenceCertificate" href="${h(publicPath('verifyCertificate'))}" data-view="verifyCertificate" aria-label="Ir a la validación pública de constancias">
            <picture>
              <source media="(max-width:640px)" srcset="/assets/img/home/advantages/certificate-640.webp">
              <img src="/assets/img/home/advantages/certificate-1200.webp" srcset="/assets/img/home/advantages/certificate-640.webp 640w, /assets/img/home/advantages/certificate-1200.webp 1200w" sizes="(max-width:760px) 100vw, 48vw" width="1200" height="854" loading="lazy" decoding="async" alt="Constancia de participación y aprobación de muestra, anonimizada y con validación QR">
            </picture>
            <span class="homeReferenceHint">Validar constancia</span>
        </a>
        <div class="homeAchievementCopy">
          <span class="sectionKicker">Después de aprobar</span>
          <h3>Comparte tu logro</h3>
          <p>Al aprobar el examen final podrás emitir una constancia digital con código QR y validación pública.</p>
          <ul class="homeAchievementList">
            <li>Descárgala en formato PDF.</li>
            <li>Compártela directamente en LinkedIn.</li>
            <li>Envía su enlace público para verificarla.</li>
          </ul>
          <a class="btn secondary" href="${h(publicPath('verifyCertificate'))}" data-view="verifyCertificate">Validar una constancia</a>
        </div>
      </article>

    </section>`;
  }

  function startHomeSlider() {
    const slides = latestCourseEntries(3);
    const reviewSlides = homeReviewSlides();
    clearHomeSlider();
    if (slides.length < 2 && (reviewSlides.length < 2 || state.homeReviewPaused)) return;
    homeSliderTimer = global.setInterval(() => {
      if (state.view !== 'home') {
        clearHomeSlider();
        return;
      }
      if (slides.length > 1) state.homeSlide = (state.homeSlide + 1) % slides.length;
      if (reviewSlides.length > 1 && !state.homeReviewPaused) {
        state.homeReviewSlide = (state.homeReviewSlide + 1) % reviewSlides.length;
      }
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
        <div class="heroProgressTop"><strong>QAvance</strong></div>
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
      <div class="heroProgressTop"><strong>QAvance</strong><b>${pctValue}%</b></div>
      <div class="progressbar heroProgressBar" aria-hidden="true"><div style="width:${pctValue}%"></div></div>
      <div class="heroProgressStats" aria-label="Detalle de progreso general">
        <span>${number(summary.totalCourses)} cursos inscritos</span>
        <span>${number(summary.totalAnswered)} respuestas</span>
        <span>${h(studyText)}</span>
      </div>
      <p>${h(lastText)}</p>
      <a class="btn heroResume" href="${h(resumePathForEntry(entry))}" data-action="select-course" data-course="${h(entry.key)}" data-chapter="${number(lastStudiedChapter(entry.details)) || ''}">${h(actionText)}</a>
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

  function openMessageModal() {
    if (!dom.messageModal) return;
    dom.messageModal.hidden = false;
    document.body.classList.add('modalOpen');
    dom.messageModal.querySelector('[data-action="close-message-modal"]')?.focus();
  }

  function closeMessageModal() {
    if (!dom.messageModal || dom.messageModal.hidden) return;
    dom.messageModal.hidden = true;
    if (dom.coffeeModal?.hidden && dom.certificateModal?.hidden) document.body.classList.remove('modalOpen');
  }

  function lastStudiedChapter(details = {}) {
    const chapters = Array.isArray(details.chapters) ? details.chapters : [];
    return chapters
      .filter((chapter) => chapter.lastStudiedAt)
      .sort((left, right) => String(right.lastStudiedAt).localeCompare(String(left.lastStudiedAt)))[0]?.chapterId || null;
  }

  function resumePathForEntry(entry = {}) {
    const chapterId = lastStudiedChapter(entry.details);
    return chapterId ? chapterPath(entry.key, chapterId) : coursePath(entry.key);
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

      return `<a class="availableCourseCard route-${h(routeKey)}" href="${h(coursePath(key))}" role="button" tabindex="0" data-action="select-course" data-course="${h(key)}" aria-label="Ver el curso ${h(meta.name || key)}">
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
        <span class="courseEnter">Ver curso</span>
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
        <a class="btn secondary" href="${h(coursePath(exam.courseKey))}" data-action="select-course" data-course="${h(exam.courseKey)}">Ver curso</a>
        <a class="btn freeCertLink" href="${h(exam.examUrl)}" target="_blank" rel="noopener noreferrer">Ir al examen</a>
      </div>
    </article>`).join('');
  }

  function renderFreeCertBand() {
    return `<section class="freeCertBand" aria-labelledby="freeCertTitle">
      <div class="freeCertCopy">
        <span class="freeCertKicker">CertiProf Open</span>
        <h2 id="freeCertTitle">Cursos gratis con examen gratuito</h2>
        <p>Estas tres rutas quedan destacadas como preparación gratuita en QAvance, con acceso directo al examen abierto de CertiProf. La disponibilidad y emisión del certificado se confirman en CertiProf.</p>
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
              <a class="btn" href="${h(coursePath(key))}" data-action="select-course" data-course="${h(key)}" aria-label="Ver el curso ${h(meta.name || key)}">Ver curso</a>
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
        ${renderResponsiveImage(DEFAULT_ROUTE_TILE_IMAGE, 'Comunidad QA aprendiendo y apoyando el proyecto QAvance', '(max-width: 900px) 100vw, 680px')}
      </div>
      <div class="donationCopy">
        <span class="sectionKicker">Apoya el proyecto</span>
        <h2 id="donationTitle">Ayuda a mantener QAvance gratis.</h2>
        <p>Cada aporte impulsa nuevos cursos, simulacros, mejoras móviles y material abierto para la comunidad QA.</p>
        <div class="donationActions">
          ${renderCoffeeButton()}
          <a class="btn secondary" href="${h(publicPath('routes'))}" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
        </div>
      </div>
    </section>`;
  }

  function renderCoursesPage() {
    return `<div class="publicHome publicPage">
      <section class="homeSection" id="cursos-disponibles" aria-labelledby="coursesTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">QAvance</span>
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
          <span class="sectionKicker">QAvance</span>
          <h1 id="routesTitle">Ruta de aprendizaje</h1>
          <p>Estas secuencias son recomendaciones flexibles para avanzar por áreas. Cada ruta puede crecer con nuevos cursos gratuitos o Premium sin afectar tu progreso actual.</p>
        </div>
        <div class="upcomingGrid">${renderUpcomingCards()}</div>
      </section>
    </div>`;
  }

  function renderContactPage() {
    const user = Auth?.getUser?.();
    const metadata = user?.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || '';
    const email = user?.email || '';

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
          <form class="contactForm" id="contactForm" data-contact-form>
            <label for="contactFullName">Nombre completo</label>
            <input id="contactFullName" name="fullName" type="text" minlength="2" maxlength="120" autocomplete="name" required value="${h(fullName)}" placeholder="Tu nombre y apellido">

            <label for="contactEmail">Correo electrónico</label>
            <input id="contactEmail" name="email" type="email" maxlength="254" autocomplete="email" required value="${h(email)}" placeholder="nombre@correo.com">

            <label for="contactSubject">Asunto</label>
            <input id="contactSubject" name="subject" type="text" minlength="3" maxlength="160" required placeholder="¿En qué podemos ayudarte?">

            <label for="contactMessage">Mensaje</label>
            <textarea id="contactMessage" name="message" minlength="10" maxlength="5000" required placeholder="Cuéntanos el contexto con el mayor detalle posible."></textarea>

            <div class="contactHoneypot" aria-hidden="true"><label for="contactWebsite">Sitio web</label><input id="contactWebsite" name="website" type="text" tabindex="-1" autocomplete="off"></div>

            <div class="contactSubmitRow">
              <button class="btn contactSubmit" type="submit" ${state.contactSubmitting ? 'disabled' : ''}>${state.contactSubmitting ? 'Enviando...' : 'Enviar mensaje'}</button>
              <span>${user ? 'La respuesta aparecerá en Mis mensajes dentro de tu cuenta.' : 'Inicia sesión antes de enviar si deseas recibir la respuesta dentro de Mi cuenta.'}</span>
            </div>
            <p class="contactFormStatus ${state.contactError ? 'error' : state.contactResult ? 'success' : ''}" role="status" aria-live="polite">${h(state.contactError || state.contactResult)}</p>
          </form>

          <aside class="contactSide" aria-labelledby="socialTitle">
            <h3 id="socialTitle">Canales oficiales</h3>
            <p>Sigue a QAvance y accede a la comunidad desde nuestros canales configurados.</p>
            ${renderSocialLinks()}
          </aside>
        </div>
      </section>
    </div>`;
  }

  function authUserName() {
    const user = Auth?.getUser?.();
    const metadata = user?.user_metadata || {};
    return String(metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'Usuario de QAvance');
  }

  function renderCourseAuthGate() {
    const entry = catalogEntry(activeCourseKey) || {};
    const meta = entry.meta || {};
    const counts = entry.counts || {};
    const blueprint = entry.blueprint || {};
    const authenticated = Auth?.isAuthenticated?.();
    const error = state.authGateError;
    const previousEnrollment = enrollmentForCourse(activeCourseKey);
    const isReactivation = previousEnrollment?.status === 'cancelled';
    const requestedView = authGateRequest?.options?.view || 'dashboard';
    const requestedChapter = authGateRequest?.options?.chapter || '';

    return `<div class="publicHome publicPage courseAuthPage">
      <section class="courseAuthGate" aria-labelledby="courseAuthTitle">
        <div class="courseAuthSummary">
          <span class="sectionKicker">${h(meta.code || activeCourseKey.toUpperCase())}</span>
          <h1 id="courseAuthTitle">${h(meta.name || 'Curso QAvance')}</h1>
          <p>${h(meta.subtitle || 'Ruta de aprendizaje disponible en QAvance.')}</p>
          <div class="certBadgeLine">
            <span>${number(counts.chapters)} capítulos</span>
            <span>${number(counts.objectives)} objetivos</span>
            <span>${number(counts.questions)} preguntas</span>
            <span>Simulacro ${number(blueprint.totalQuestions)} preguntas</span>
          </div>
        </div>
        <div class="courseAuthAction">
          <span class="authLock" aria-hidden="true">G</span>
          <h2>${authenticated ? (isReactivation ? 'Reactiva este curso' : 'Inscríbete para comenzar') : 'Inicia sesión para entrar'}</h2>
          <p>${authenticated
            ? (isReactivation
              ? 'Tu avance anterior se conserva. Al reactivar el curso podrás continuar desde tu cuenta.'
              : 'Revisa la información del curso y confirma tu inscripción. Solo entonces se agregará a Mi cuenta y comenzará a registrar avance.')
            : 'El acceso al curso requiere una cuenta de Google. Tu matrícula, avance y simulacros quedarán guardados en la nube.'}</p>
          ${error ? `<div class="badbox">${h(error)}</div>` : ''}
          <div class="btnrow">
            ${authenticated
              ? error
                ? `<button class="btn" type="button" data-action="retry-course" data-course="${h(activeCourseKey)}" data-course-view="${h(requestedView)}">Intentar nuevamente</button>`
                : `<button class="btn" type="button" data-action="enroll-course" data-course="${h(activeCourseKey)}" data-course-view="${h(requestedView)}" data-course-chapter="${h(requestedChapter)}">${isReactivation ? 'Reactivar curso' : 'Inscribirme al curso'}</button>`
              : '<button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>'}
            <a class="btn secondary" href="${h(publicPath('courses'))}" data-view="courses">Volver a cursos</a>
          </div>
          <small>QAvance no recibe ni almacena tu contraseña de Google.</small>
        </div>
      </section>
    </div>`;
  }

  function normalizeCertificateCode(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  async function openCertificateValidation(value) {
    const code = normalizeCertificateCode(value);
    if (state.view !== 'verifyCertificate') await showView('verifyCertificate');
    state.certificateValidationCode = code;
    state.certificateValidationResult = null;
    state.certificateValidationError = '';
    if (!/^ACQA-[A-Z0-9]{12}$/.test(code)) {
      state.certificateValidationError = code ? 'Ingresa un código con formato ACQA-XXXXXXXXXXXX.' : '';
      render();
      return;
    }

    state.certificateValidationLoading = true;
    pushRoute(`${publicPath('verifyCertificate')}?codigo=${encodeURIComponent(code)}`);
    render();
    try {
      state.certificateValidationResult = await Cloud.validateCertificate(code);
    } catch (error) {
      console.error(error);
      state.certificateValidationError = 'No fue posible consultar el registro. Intenta nuevamente.';
    } finally {
      state.certificateValidationLoading = false;
      if (state.view === 'verifyCertificate') render();
    }
  }

  function renderCertificateValidationPage() {
    const result = state.certificateValidationResult;
    const hasLookup = Boolean(state.certificateValidationCode);
    const statusPanel = state.certificateValidationLoading
      ? '<div class="certificateValidationStatus" role="status">Consultando el registro seguro...</div>'
      : state.certificateValidationError
        ? `<div class="badbox">${h(state.certificateValidationError)}</div>`
        : result?.valid
          ? `<article class="certificateValidationResult valid" aria-labelledby="certificateResultTitle">
              <div class="certificateValidationMark" aria-hidden="true">✓</div>
              <div><span class="sectionKicker">Certificado válido</span><h2 id="certificateResultTitle">${h(result.course_name)}</h2><p>Este certificado de finalización coincide con el registro de QAvance.</p></div>
              <dl class="certificateValidationDetails">
                <div><dt>Estudiante</dt><dd>${h(result.full_name)}</dd></div>
                <div><dt>Identificación</dt><dd>${h(result.document)}</dd></div>
                <div><dt>Código</dt><dd>${h(result.code)}</dd></div>
                <div><dt>Intensidad estimada</dt><dd>${number(result.estimated_hours)} h</dd></div>
                <div><dt>Curso finalizado</dt><dd>${h(formatDate(result.completed_at))}</dd></div>
                <div><dt>Fecha de emisión</dt><dd>${h(formatDate(result.issued_at))}</dd></div>
              </dl>
              <div class="btnrow"><button class="btn linkedinButton" type="button" data-action="share-certificate-linkedin" data-code="${h(result.code)}">Compartir en LinkedIn</button><button class="btn secondary" type="button" data-action="copy-certificate-url" data-code="${h(result.code)}">Copiar URL</button></div>
            </article>`
          : hasLookup
            ? `<article class="certificateValidationResult invalid"><span class="sectionKicker">Sin coincidencia</span><h2>Certificado no válido o no encontrado</h2><p>Revisa cada carácter del código. Si el certificado fue revocado, tampoco aparecerá como válido.</p></article>`
            : '';

    return `<div class="publicHome publicPage certificateValidationPage" id="validar-certificado">
      <section class="certificateValidationHero" aria-labelledby="certificateValidationTitle">
        <span class="sectionKicker">Validación pública</span>
        <h1 id="certificateValidationTitle">Comprueba una constancia QAvance</h1>
        <p>Ingresa el código único del documento para consultar su registro público, vigencia y datos de emisión.</p>
        <form class="certificateValidationForm" data-certificate-validation-form>
          <label for="certificateCodeInput">Código del certificado</label>
          <div><input id="certificateCodeInput" name="certificateCode" type="text" maxlength="17" placeholder="ACQA-XXXXXXXXXXXX" value="${h(state.certificateValidationCode)}" autocomplete="off" required><button class="btn" type="submit">Validar</button></div>
        </form>
      </section>
      ${statusPanel}
    </div>`;
  }

  async function submitCertificateIdentity(form) {
    const model = state.certificateModal;
    if (!model?.orderId || model.phase !== 'identity') return;
    const data = new FormData(form);
    const input = {
      orderId: model.orderId,
      fullName: String(data.get('fullName') || '').trim(),
      documentType: String(data.get('documentType') || '').trim(),
      documentNumber: String(data.get('documentNumber') || '').trim(),
      publicConsent: data.get('publicConsent') === 'yes'
    };
    state.certificateModal = { ...model, ...input, submitting: true, formError: '' };
    renderCertificateModal();
    try {
      const result = await Cloud.issueCertificate(input);
      state.certificateModal = {
        phase: 'issued',
        courseKey: result.certificate?.course_key || model.courseKey,
        certificate: result.certificate,
        downloadUrl: result.downloadUrl
      };
      await refreshAccount();
      renderCertificateModal();
    } catch (error) {
      console.error(error);
      state.certificateModal = {
        ...model,
        ...input,
        phase: 'identity',
        submitting: false,
        formError: error?.message || 'No fue posible emitir el certificado.'
      };
      renderCertificateModal();
    }
  }

  async function refreshAccount() {
    if (state.view !== 'account' || !Auth?.isAuthenticated?.()) return;
    state.accountLoading = true;
    state.accountError = '';
    render();
    try {
      const [, certificates, certificateOrders, messages, access] = await Promise.all([
        refreshLearningSnapshot({ includeProfile: true }),
        Cloud.listCertificates(),
        Cloud.listCertificateOrders(),
        Cloud.listMyContactMessages(),
        Cloud.getMyAccessStatus()
      ]);
      state.accountProfile = learningSnapshot.profile;
      state.enrollments = learningSnapshot.enrollments.filter((item) => !item.hidden_at);
      state.certificates = certificates;
      state.certificateOrders = certificateOrders;
      state.accountMessages = messages;
      state.accountAccess = access;
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
    const confirmed = global.confirm(`¿Quitar ${courseName} de tu cuenta? El curso dejará de aparecer, pero QAvance conservará tu avance, tiempo e intentos para que no se pierdan.`);
    if (!confirmed) return;

    try {
      await Cloud.deleteEnrollment(courseKey);
      learningSnapshot.enrollments = learningSnapshot.enrollments.filter((item) => item.course_key !== courseKey);
      state.enrollments = state.enrollments.filter((item) => item.course_key !== courseKey);
      if (Storage.getActiveCourse() === courseKey) Storage.setActiveCourse('');
      notify('El curso se quitó de tu cuenta. Tu historial de aprendizaje permanece protegido.', 'success');
      await refreshAccount();
    } catch (error) {
      console.error(error);
      notify('No fue posible quitar el curso. Verifica que esté cancelado e intenta nuevamente.', 'error');
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

    if (Auth?.isBlocked?.()) {
      const access = Auth?.getAccessStatus?.() || {};
      return `<div class="publicHome publicPage accountPage" id="mi-cuenta"><section class="accountSignIn" aria-labelledby="accountTitle"><span class="sectionKicker">Acceso restringido</span><h1 id="accountTitle">Tu cuenta está bloqueada</h1><p>${h(access.reason || 'Contacta al equipo de QAvance para revisar el estado de tu cuenta.')}</p><a class="btn secondary" href="/contactanos/" data-view="contact">Contactar soporte</a></section></div>`;
    }

    const user = Auth.getUser();
    const profile = state.accountProfile || {};
    const enrollments = Array.isArray(state.enrollments) ? state.enrollments : [];
    const certificates = Array.isArray(state.certificates) ? state.certificates : [];
    const certificateOrders = Array.isArray(state.certificateOrders) ? state.certificateOrders : [];
    const accountMessages = Array.isArray(state.accountMessages) ? state.accountMessages : [];
    const certificateEntitlements = Array.isArray(state.accountAccess?.certificate_entitlements)
      ? state.accountAccess.certificate_entitlements
      : [];
    const enrolled = enrollments.filter((item) => item.status !== 'cancelled');
    const active = enrolled.length;
    const simulatorTotal = enrolled.reduce((sum, item) => sum + number(item.simulator_attempts), 0);
    const finalExamTotal = enrolled.reduce((sum, item) => sum + number(item.final_exam_attempts), 0);
    const hoursTotal = enrollments
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + number(item.estimated_hours), 0);
    const studySecondsTotal = number(learningSnapshot.verifiedSummary.study_seconds);
    const enrolledProgressDetails = enrolled.map((item) => {
      const entry = catalogEntry(item.course_key) || {};
      const courseData = learningSnapshot.coursesByKey.get(item.course_key) || Registry.get(item.course_key);
      return courseProgressDetails(item.course_key, courseData || catalogCourseSummary(entry));
    });
    const overallProgress = enrolledProgressDetails.length
      ? Math.round(enrolledProgressDetails.reduce((sum, details) => sum + number(details.progressPercent), 0) / enrolledProgressDetails.length)
      : 0;
    const hasHistoricalProgress = enrolledProgressDetails.some((details) => details.hasUnverifiedHistory);

    const enrollmentCards = enrollments.map((item) => {
      const entry = catalogEntry(item.course_key) || {};
      const meta = entry.meta || {};
      const isEnrolled = item.status !== 'cancelled';
      const courseData = learningSnapshot.coursesByKey.get(item.course_key) || Registry.get(item.course_key);
      const details = courseProgressDetails(item.course_key, courseData || catalogCourseSummary(entry));
      const isCompleted = details.finalExamPassed && details.progressPercent === 100;
      const administrativeEntitlement = certificateEntitlements.some((entitlement) => (
        entitlement.course_key === item.course_key && entitlement.enabled === true
      ));
      const certificateAvailable = isCompleted || administrativeEntitlement;
      const issuedCertificate = certificates.find((certificate) => certificate.course_key === item.course_key);
      const currentCertificateOrder = certificateOrders.find((order) => (
        order.course_key === item.course_key
        && !order.consumed_at
        && ['PENDING', 'APPROVED'].includes(order.status)
      ));
      const chapterRows = details.chapters.map((chapter) => `<li>
        <div><b>C${number(chapter.chapterId)} · ${h(chapter.title)}</b><span>${chapter.uniqueAnswered}/${chapter.questionCount} preguntas únicas · ${chapter.practiceCoverage}% cubierto</span></div>
        <div><strong>${chapter.hasUnverifiedHistory ? 'Avance histórico' : 'Avance verificado'} ${chapter.coverage}%</strong><span>Dominio verificado ${chapter.verifiedDomain ?? chapter.domain}% · ${chapter.studyMinutes}/${chapter.suggestedMinutes} min</span>${chapter.hasUnverifiedHistory ? `<small class="historicalProgressNote">Histórico no verificado · avance oficial ${chapter.verifiedCoverage}%</small>` : ''}</div>
        <div class="accountChapterProgressBars">
          <div><span>Avance</span><div class="progressbar" aria-label="Avance del capítulo ${number(chapter.chapterId)}: ${chapter.coverage}%"><div style="width:${chapter.coverage}%"></div></div></div>
          <div><span>Dominio del capítulo</span><div class="progressbar masteryProgress" aria-label="Dominio del capítulo ${number(chapter.chapterId)}: ${chapter.domain}%"><div style="width:${chapter.domain}%"></div></div></div>
        </div>
      </li>`).join('');
      return `<article class="accountCourseCard">
        <div class="accountCourseHead">
          <div>
            <span class="accountStatus ${h(item.status)}">${item.status === 'active' ? 'Activo' : item.status === 'cancelled' ? 'Cancelado' : 'Completado'}</span>
            ${details.hasUnverifiedHistory ? '<span class="accountStatus historical">Histórico no verificado</span>' : ''}
            <h3>${h(meta.name || item.course_key)}</h3>
          </div>
          <div class="accountCourseScores">
            <strong>${details.hasUnverifiedHistory ? 'Avance histórico' : 'Avance verificado'} ${details.progressPercent}%</strong>
            <span>Dominio verificado ${details.masteryPercent}%</span>
            ${details.hasUnverifiedHistory ? `<small>Avance oficial ${details.verifiedProgressPercent}% · no habilita examen ni constancia</small>` : ''}
            <small>Capítulos ${details.chapterDomainAverage}% · examen final ${details.finalExamScore}%</small>
          </div>
        </div>
        <div class="progressbar accountCourseProgress" aria-label="Avance del curso"><div style="width:${details.progressPercent}%"></div></div>
        <dl class="accountCourseMetrics">
          <div><dt>Fecha de inicio</dt><dd>${h(formatDate(item.started_at))}</dd></div>
          <div><dt>Última actividad</dt><dd>${h(formatDate(item.last_activity_at))}</dd></div>
          <div><dt>Tiempo verificado</dt><dd>${h(formatStudyDuration(details.studySeconds))}</dd></div>
          ${details.hasUnverifiedHistory ? `<div><dt>Tiempo histórico</dt><dd>${h(formatStudyDuration(details.historicalStudySeconds))}</dd></div>` : ''}
          <div><dt>Duración estimada</dt><dd>${number(item.estimated_hours)} h</dd></div>
          <div><dt>Simulacros</dt><dd>${number(item.simulator_attempts)}</dd></div>
          <div><dt>Mejor simulacro</dt><dd>${number(item.best_simulator_score)}%</dd></div>
          <div><dt>Exámenes finales</dt><dd>${number(item.final_exam_attempts)}</dd></div>
          <div><dt>Mejor examen final</dt><dd>${number(item.best_final_exam_score)}%</dd></div>
          <div><dt>Preguntas únicas respondidas</dt><dd>${number(item.practice_answers)}</dd></div>
        </dl>
        <div class="${isCompleted ? 'okbox' : 'note'} accountFinalStatus"><b>Examen final:</b> ${isCompleted
          ? `Aprobado · ${number(item.best_final_exam_score)}% · curso al 100%`
           : details.finalExamEligible ? 'Habilitado · ya alcanzaste el 95% verificable' : `Bloqueado hasta el 95% verificable · avance oficial ${verifiedProgressPercent(details)}%${details.hasUnverifiedHistory ? ` · histórico conservado ${details.progressPercent}%` : ''}`}</div>
        ${administrativeEntitlement && !isCompleted ? '<div class="okbox"><b>Constancia habilitada por administración.</b> Este permiso permite solicitarla sin modificar tu avance ni tus métricas académicas.</div>' : ''}
        <details class="accountChapterDetails">
          <summary>Avance por capítulo</summary>
          ${chapterRows ? `<ol>${chapterRows}</ol>` : '<p class="small">Aún no hay capítulos con actividad registrada.</p>'}
        </details>
        <div class="btnrow">
          ${issuedCertificate
            ? `<button class="btn good certificateAction" type="button" data-action="download-certificate" data-code="${h(issuedCertificate.certificate_code)}">Descargar certificado</button><button class="btn secondary certificateAction" type="button" data-action="view-certificate" data-code="${h(issuedCertificate.certificate_code)}">Ver certificado</button>`
            : certificateAvailable
              ? `<button class="btn good certificateAction" type="button" data-action="start-certificate-flow" data-course="${h(item.course_key)}">${currentCertificateOrder?.status === 'APPROVED' ? 'Completar emisión del certificado' : 'Obtener certificado · USD 25'}</button>`
            : '<button class="btn secondary certificateAction" type="button" disabled aria-disabled="true">Certificado disponible al 100%</button>'}
          ${isEnrolled
            ? `<a class="btn" href="${h(coursePath(item.course_key))}" data-action="select-course" data-course="${h(item.course_key)}">Continuar curso</a>
               <button class="btn secondary dangerAction" type="button" data-action="cancel-enrollment" data-course="${h(item.course_key)}">Cancelar curso</button>`
            : `<button class="btn" type="button" data-action="reactivate-enrollment" data-course="${h(item.course_key)}">Reactivar curso</button>
               <button class="btn bad" type="button" data-action="delete-enrollment" data-course="${h(item.course_key)}">Quitar de mi cuenta</button>`}
        </div>
      </article>`;
    }).join('');

    const certificateCards = certificates.map((certificate) => `<article class="accountCertificateCard">
      <div class="accountCertificateSeal" aria-hidden="true">✓</div>
      <div class="accountCertificateMain">
        <span class="accountStatus completed">${certificate.status === 'VALID' ? 'Válido' : 'Revocado'}</span>
        <h3>${h(certificate.course_name)}</h3>
        <p>${h(certificate.full_name)} · ${h(certificate.document_type)} ••••${h(certificate.document_last4)}</p>
        <div class="accountCertificateMeta"><span>Emitido ${h(formatDate(certificate.issued_at))}</span><strong>${h(certificate.certificate_code)}</strong></div>
      </div>
      <div class="accountCertificateActions"><button class="btn good" type="button" data-action="download-certificate" data-code="${h(certificate.certificate_code)}">Descargar PDF</button><button class="btn linkedinButton" type="button" data-action="share-certificate-linkedin" data-code="${h(certificate.certificate_code)}">LinkedIn</button><button class="btn secondary" type="button" data-action="view-certificate" data-code="${h(certificate.certificate_code)}">Ver</button><button class="btn secondary" type="button" data-action="copy-certificate-url" data-code="${h(certificate.certificate_code)}">Copiar URL</button></div>
    </article>`).join('');

    const accountMessageCards = accountMessages.map((message) => `<article class="accountMessageCard">
      <header><div><span class="reviewStatus ${h(message.status)}">${h(accountMessageStatusLabel(message.status))}</span><h3>${h(message.subject)}</h3></div><time datetime="${h(message.created_at)}">${h(formatDate(message.created_at))}</time></header>
      <p>${h(message.message)}</p>
      ${message.admin_reply ? `<div class="accountMessageReply"><b>Respuesta de QAvance</b><p>${h(message.admin_reply)}</p><small>${h(formatDate(message.replied_at || message.updated_at))}</small></div>` : '<small>Te avisaremos aquí cuando el equipo registre una respuesta.</small>'}
    </article>`).join('');

    return `<div class="publicHome publicPage accountPage" id="mi-cuenta">
      <section class="accountHeader" aria-labelledby="accountTitle">
        <span class="sectionKicker">Mi cuenta</span>
        <h1 id="accountTitle">Hola, ${h(authUserName())}</h1>
        <p>${h(profile.email || user?.email || '')}</p>
        <div class="grid3 accountTotals">
          <div class="metric"><span>Cursos inscritos</span><strong>${active}</strong></div>
          <div class="metric"><span>Progreso general${hasHistoricalProgress ? ' · histórico' : ''}</span><strong>${overallProgress}%</strong></div>
          <div class="metric"><span>Tiempo verificado</span><strong>${h(formatStudyDuration(studySecondsTotal))}</strong></div>
          <div class="metric"><span>Horas estimadas</span><strong>${hoursTotal}</strong></div>
          <div class="metric"><span>Simulacros realizados</span><strong>${simulatorTotal}</strong></div>
          <div class="metric"><span>Exámenes finales</span><strong>${finalExamTotal}</strong></div>
        </div>
      </section>
      ${state.accountLoading ? '<div class="card accountLoading" role="status">Consultando tu información en la nube...</div>' : ''}
      ${state.accountError ? `<div class="badbox">${h(state.accountError)}</div>` : ''}
      <section class="accountCertificates" aria-labelledby="accountCertificatesTitle">
        <div class="sectionIntro"><span class="sectionKicker">Credenciales</span><h2 id="accountCertificatesTitle">Certificados emitidos</h2><p>Descarga, valida o comparte tus certificados de finalización.</p></div>
        ${certificateCards || (!state.accountLoading ? '<div class="card accountCertificateEmpty"><p>Aún no tienes certificados emitidos. Completa un curso y aprueba su examen final para habilitar la solicitud.</p></div>' : '')}
      </section>
      <section class="accountCourses" aria-labelledby="accountCoursesTitle">
        <div class="sectionIntro">
          <h2 id="accountCoursesTitle">Mis cursos</h2>
          <p>Las horas son una estimación de estudio y práctica; pueden variar según tu experiencia.</p>
        </div>
        ${enrollmentCards || (!state.accountLoading ? '<div class="card"><p>Aún no te has inscrito en un curso.</p><a class="btn" href="/cursos/" data-view="courses">Explorar cursos</a></div>' : '')}
      </section>
      <section class="accountMessages" aria-labelledby="accountMessagesTitle">
        <div class="sectionIntro accountMessagesHead"><div><span class="sectionKicker">Soporte</span><h2 id="accountMessagesTitle">Mis mensajes</h2><p>Consulta tus solicitudes, su estado y las respuestas del equipo.</p></div><a class="btn" href="/contactanos/" data-view="contact">Enviar mensaje a soporte</a></div>
        <div class="accountMessageGrid">${accountMessageCards || (!state.accountLoading ? '<div class="card"><p>Aún no tienes mensajes vinculados a esta cuenta.</p></div>' : '')}</div>
      </section>
    </div>`;
  }

  function adminAnalyticsRequest() {
    const days = [7, 30, 90].includes(number(state.adminAnalyticsRange))
      ? number(state.adminAnalyticsRange)
      : 30;
    const now = new Date();
    const bogotaDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const from = new Date(`${bogotaDate}T05:00:00.000Z`);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    return {
      from: from.toISOString(),
      to: now.toISOString(),
      courseKey: state.adminAnalyticsCourse === 'all' ? '' : state.adminAnalyticsCourse
    };
  }

  async function refreshAdminAnalytics() {
    if (state.view !== 'admin' || !Auth?.isAuthenticated?.() || !Auth?.isAdmin?.()) return;
    state.adminAnalyticsLoading = true;
    state.adminAnalyticsError = '';
    render();
    try {
      state.adminAnalytics = await Cloud.getAdminLearningAnalytics(adminAnalyticsRequest());
    } catch (error) {
      console.error(error);
      state.adminAnalyticsError = 'No fue posible actualizar las métricas verificadas. Intenta nuevamente.';
    } finally {
      state.adminAnalyticsLoading = false;
      if (state.view === 'admin') render();
    }
  }

  async function refreshAdmin({ silent = false } = {}) {
    if (state.view !== 'admin' || !Auth?.isAuthenticated?.() || !Auth?.isAdmin?.()) return;
    state.adminLoading = !silent;
    state.adminError = '';
    if (!silent) render();
    try {
      const [summary, analytics, result, certificateResult, messageResult, archivedMessageResult, reviewResult, archivedReviewResult, adminSocialSettings] = await Promise.all([
        Cloud.getAdminDashboardSummary(),
        Cloud.getAdminLearningAnalytics(adminAnalyticsRequest()),
        Cloud.listAdminUsers({ search: state.adminSearch, limit: 50, offset: 0 }),
        Cloud.listAdminCertificates({ search: state.adminSearch, limit: 100, offset: 0 }),
        Cloud.listAdminContactMessages({ search: state.adminSearch, limit: 100, offset: 0 }),
        Cloud.listAdminContactMessages({ status: 'archived', search: state.adminSearch, limit: 100, offset: 0 }),
        Cloud.listAdminCourseReviews({ search: state.adminSearch, limit: 100, offset: 0 }),
        Cloud.listAdminCourseReviews({ status: 'archived', search: state.adminSearch, limit: 100, offset: 0 }),
        Cloud.getPublicSocialSettings()
      ]);
      const users = Array.isArray(result?.users) ? result.users : [];
      const governance = await Cloud.listAdminUserGovernance(users.map((user) => user.id));
      const courseKeys = [...new Set(users.flatMap((user) => (
        Array.isArray(user.enrollments) ? user.enrollments.map((item) => item.course_key) : []
      )).filter(Boolean))];
      const loadedCourses = await Promise.all(courseKeys.map(async (key) => {
        const existing = state.adminCoursesByKey.get(key);
        if (existing) return [key, existing];
        try {
          return [key, await ensureCourseLoaded(key)];
        } catch (error) {
          console.warn(`No fue posible cargar el detalle del curso ${key} para administración.`, error);
          return [key, null];
        }
      }));
      state.adminSummary = summary || {};
      state.adminAnalytics = analytics || {};
      state.adminUsers = users;
      state.adminGovernanceByUser = new Map(governance.map((item) => [item.user_id, item]));
      state.adminTotal = number(result?.total);
      state.adminCertificates = Array.isArray(certificateResult?.certificates) ? certificateResult.certificates : [];
      state.adminCertificateTotal = number(certificateResult?.total);
      state.adminMessages = [
        ...(Array.isArray(messageResult?.messages) ? messageResult.messages : []),
        ...(Array.isArray(archivedMessageResult?.messages) ? archivedMessageResult.messages.map((item) => ({ ...item, archived: true })) : [])
      ];
      state.adminMessageTotal = number(messageResult?.total) + number(archivedMessageResult?.total);
      state.adminReviews = [
        ...(Array.isArray(reviewResult?.reviews) ? reviewResult.reviews : []),
        ...(Array.isArray(archivedReviewResult?.reviews) ? archivedReviewResult.reviews.map((item) => ({ ...item, archived: true })) : [])
      ];
      state.adminReviewTotal = number(reviewResult?.total) + number(archivedReviewResult?.total);
      state.adminSocialSettings = normalizedSocialSettings(adminSocialSettings);
      socialSettings = { ...socialSettings, ...state.adminSocialSettings };
      syncFloatingWhatsapp();
      state.adminCoursesByKey = new Map(loadedCourses.filter(([, value]) => value));
    } catch (error) {
      console.error(error);
      state.adminError = 'No fue posible consultar las métricas administrativas. Intenta nuevamente.';
    } finally {
      state.adminLoading = false;
      if (state.view === 'admin') render();
    }
  }

  function adminEnrollmentView(item, userId, governance, canManageEligibility) {
    const entry = catalogEntry(item.course_key) || {};
    const courseData = state.adminCoursesByKey.get(item.course_key)
      || Registry.get(item.course_key)
      || catalogCourseSummary(entry);
    const details = courseProgressDetailsFrom(item.course_key, courseData, {}, item);
    const statusLabel = item.status === 'active' ? 'Activo' : item.status === 'completed' ? 'Completado' : 'Cancelado';
    const entitlement = (Array.isArray(governance?.certificate_entitlements) ? governance.certificate_entitlements : [])
      .find((entry) => entry.course_key === item.course_key);
    const chapterRows = details.chapters.map((chapter) => `<li>
      <span><b>C${number(chapter.chapterId)} · ${h(chapter.title)}</b><small>${chapter.touched}/${chapter.objectiveCount} LO · ${chapter.studyMinutes} min</small></span>
      <span><b>${chapter.coverage}% avance</b><small>${chapter.domain}% dominio</small></span>
    </li>`).join('');
    return `<div class="adminEnrollmentRow">
      <div class="adminEnrollmentTitle">
        <span class="accountStatus ${h(item.status)}">${statusLabel}</span>
        ${details.hasUnverifiedHistory ? '<span class="accountStatus historical">Histórico no verificado</span>' : ''}
        <b>${h(entry.meta?.name || item.course_key)}</b>
        <small>Inicio ${h(formatDate(item.started_at))} · última actividad ${h(formatDate(item.last_activity_at))}</small>
      </div>
      <dl class="adminEnrollmentMetrics">
        <div><dt>${details.hasUnverifiedHistory ? 'Avance histórico' : 'Avance verificado'}</dt><dd>${details.progressPercent}%</dd></div>
        <div><dt>Avance oficial</dt><dd>${verifiedProgressPercent(details)}%</dd></div>
        <div><dt>Dominio verificado</dt><dd>${details.masteryPercent}%</dd></div>
        <div><dt>Tiempo verificado</dt><dd>${h(formatStudyDuration(details.studySeconds))}</dd></div>
        ${details.hasUnverifiedHistory ? `<div><dt>Tiempo histórico</dt><dd>${h(formatStudyDuration(details.historicalStudySeconds))}</dd></div>` : ''}
        <div><dt>Simulacros</dt><dd>${number(item.simulator_attempts)}</dd></div>
        <div><dt>Mejor simulacro</dt><dd>${number(item.best_simulator_score)}%</dd></div>
        <div><dt>Examen final</dt><dd>${number(item.final_exam_attempts)} · ${number(item.best_final_exam_score)}%</dd></div>
      </dl>
      <div class="progressbar accountCourseProgress" aria-label="Avance de ${h(entry.meta?.name || item.course_key)}: ${details.progressPercent}%"><div style="width:${details.progressPercent}%"></div></div>
      <details class="adminChapterDetails">
        <summary>Avance por capítulo</summary>
        ${chapterRows ? `<ol>${chapterRows}</ol>` : '<p class="small">Sin actividad registrada por capítulo.</p>'}
      </details>
      ${canManageEligibility ? `<div class="adminGovernanceActions"><button class="btn secondary" type="button" data-action="admin-certificate-eligibility" data-user-id="${h(userId)}" data-course="${h(item.course_key)}" data-enabled="${entitlement?.enabled ? 'false' : 'true'}">${entitlement?.enabled ? 'Retirar habilitación de constancia' : 'Habilitar constancia'}</button>${entitlement?.reason ? `<small>Motivo: ${h(entitlement.reason)}</small>` : ''}</div>` : ''}
    </div>`;
  }

  function adminIsOnline(value) {
    const seenAt = new Date(value).getTime();
    return Number.isFinite(seenAt) && Date.now() - seenAt <= 150_000;
  }

  function formatAdminActivity(value) {
    const seenAt = new Date(value).getTime();
    if (!Number.isFinite(seenAt)) return 'Sin actividad registrada';
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - seenAt) / 60_000));
    if (elapsedMinutes <= 2) return 'En línea ahora';
    if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `Hace ${elapsedHours} h`;
    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays <= 30) return `Hace ${elapsedDays} día${elapsedDays === 1 ? '' : 's'}`;
    return formatDate(value);
  }

  function adminUserSnapshot(user) {
    const enrollments = Array.isArray(user.enrollments) ? user.enrollments : [];
    const legacyByCourse = new Map((Array.isArray(user.legacy_progress) ? user.legacy_progress : [])
      .map((item) => [item.course_key, item]));
    const enrollmentsWithHistory = enrollments.map((item) => ({
      ...item,
      legacy_progress: legacyByCourse.get(item.course_key) || null
    }));
    const learningEnrollments = enrollmentsWithHistory.filter((item) => item.status !== 'cancelled');
    const details = learningEnrollments.map((item) => {
      const entry = catalogEntry(item.course_key) || {};
      const courseData = state.adminCoursesByKey.get(item.course_key)
        || Registry.get(item.course_key)
        || catalogCourseSummary(entry);
      return courseProgressDetailsFrom(item.course_key, courseData, {}, item);
    });
    const lastSeenAt = user.last_seen_at || user.last_sign_in_at || user.created_at;
    const progressPercent = details.length
      ? Math.round(details.reduce((sum, item) => sum + number(item.progressPercent), 0) / details.length)
      : 0;
    const masteryPercent = details.length
      ? Math.round(details.reduce((sum, item) => sum + number(item.masteryPercent), 0) / details.length)
      : 0;
    return {
      enrollments: enrollmentsWithHistory,
      learningEnrollments,
      online: adminIsOnline(user.last_seen_at),
      lastSeenAt,
      progressPercent,
      masteryPercent,
      hasUnverifiedHistory: details.some((item) => item.hasUnverifiedHistory),
      studySeconds: details.reduce((sum, item) => sum + number(item.studySeconds), 0),
      activeCourses: learningEnrollments.filter((item) => item.status === 'active').length,
      completedCourses: learningEnrollments.filter((item) => item.status === 'completed').length
    };
  }

  function adminUserMatchesFilter(snapshot) {
    if (state.adminFilter === 'online') return snapshot.online;
    if (state.adminFilter === 'active') {
      return Date.now() - new Date(snapshot.lastSeenAt).getTime() <= 30 * 24 * 60 * 60 * 1000;
    }
    if (state.adminFilter === 'enrolled') return snapshot.learningEnrollments.length > 0;
    if (state.adminFilter === 'unenrolled') return snapshot.learningEnrollments.length === 0;
    return true;
  }

  function adminMessageStatusLabel(status) {
    return ({ new: 'Sin revisar', in_progress: 'En gestión', responded: 'Completado', closed: 'Cerrado', archived: 'Archivado' })[status] || 'Sin revisar';
  }

  function accountMessageStatusLabel(status) {
    return ({ new: 'Enviado', in_progress: 'En gestión', responded: 'Completado', closed: 'Completado' })[status] || 'Enviado';
  }

  async function updateAdminMessage(target) {
    const messageId = String(target.dataset.messageId || '');
    const status = String(target.dataset.status || 'in_progress');
    const reply = document.querySelector(`[data-admin-message-reply="${messageId}"]`)?.value?.trim() || '';
    try {
      await Cloud.updateAdminContactMessage(messageId, status, reply);
      notify(status === 'responded' ? 'Respuesta enviada dentro de QAvance.' : 'Estado del mensaje actualizado.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible actualizar el mensaje.', 'error');
    }
  }

  async function moderateAdminReview(target) {
    try {
      await Cloud.moderateAdminCourseReview(target.dataset.reviewId, target.dataset.status);
      notify(target.dataset.status === 'approved' ? 'Calificación aprobada y publicada.' : 'Calificación no publicada.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible moderar la calificación.', 'error');
    }
  }

  async function updateAdminUserBlock(target) {
    const blocked = target.dataset.blocked === 'true';
    const reason = blocked ? (global.prompt('Motivo del bloqueo (quedará en la auditoría):', '') || '').trim() : '';
    if (blocked && !reason) return;
    if (!global.confirm(blocked ? '¿Bloquear esta cuenta y detener nuevas actividades?' : '¿Restaurar el acceso de esta cuenta?')) return;
    try {
      await Cloud.setAdminUserBlocked(target.dataset.userId, blocked, reason);
      notify(blocked ? 'Cuenta bloqueada.' : 'Acceso restaurado.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible actualizar el acceso.', 'error');
    }
  }

  async function updateAdminUserRole(target) {
    const role = String(target.dataset.role || 'none');
    const label = role === 'superadmin' ? 'superadministrador' : role === 'admin' ? 'administrador' : 'usuario';
    if (!global.confirm(`¿Cambiar esta cuenta al rol ${label}?`)) return;
    try {
      await Cloud.setAdminUserRole(target.dataset.userId, role);
      notify('Rol administrativo actualizado.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible actualizar el rol.', 'error');
    }
  }

  async function updateAdminCertificateEligibility(target) {
    const enabled = target.dataset.enabled === 'true';
    const reason = enabled ? (global.prompt('Motivo de la habilitación excepcional:', '') || '').trim() : '';
    if (enabled && !reason) return;
    if (!global.confirm(enabled ? '¿Habilitar la solicitud de constancia para este curso?' : '¿Retirar la habilitación excepcional?')) return;
    try {
      await Cloud.setAdminCertificateEligibility(target.dataset.userId, target.dataset.course, enabled, reason);
      notify(enabled ? 'Constancia habilitada para el usuario.' : 'Habilitación retirada.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible actualizar la habilitación.', 'error');
    }
  }

  async function softDeleteAdminMessage(target) {
    if (!global.confirm('¿Quitar este mensaje de la bandeja? El registro se conservará para auditoría.')) return;
    try {
      await Cloud.softDeleteAdminContactMessage(target.dataset.messageId);
      notify('Mensaje archivado.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible archivar el mensaje.', 'error');
    }
  }

  async function softDeleteAdminReview(target) {
    if (!global.confirm('¿Quitar esta calificación? Dejará de publicarse y se conservará para auditoría.')) return;
    try {
      await Cloud.softDeleteAdminCourseReview(target.dataset.reviewId);
      notify('Calificación archivada.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible archivar la calificación.', 'error');
    }
  }

  async function updateAdminCertificateStatus(target) {
    const action = String(target.dataset.statusAction || 'archive');
    const reason = action === 'revoke' ? (global.prompt('Motivo de la revocación:', '') || '').trim() : '';
    if (action === 'revoke' && !reason) return;
    if (!global.confirm('¿Confirmas esta acción sobre la constancia?')) return;
    try {
      await Cloud.updateAdminCertificateStatus(target.dataset.certificateId, action, reason);
      notify('Estado de la constancia actualizado.', 'success');
      await refreshAdmin({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible actualizar la constancia.', 'error');
    }
  }

  function adminAnalyticsCourseName(courseKey) {
    const entry = catalogEntry(courseKey) || {};
    return entry.meta?.shortName || entry.meta?.name || String(courseKey || '').toUpperCase();
  }

  function formatAnalyticsDay(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return String(value || '');
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
      .format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`));
  }

  function renderAdminAnalytics() {
    const analytics = state.adminAnalytics && typeof state.adminAnalytics === 'object'
      ? state.adminAnalytics
      : {};
    const summary = analytics.summary && typeof analytics.summary === 'object' ? analytics.summary : {};
    const courses = Array.isArray(analytics.courses) ? analytics.courses : [];
    const daily = Array.isArray(analytics.daily) ? analytics.daily : [];
    const chartDays = daily.slice(-30);
    const maxStudySeconds = Math.max(1, ...chartDays.map((day) => number(day.study_seconds)));
    const chartStep = Math.max(1, Math.ceil(chartDays.length / 6));
    const chart = chartDays.map((day, index) => {
      const seconds = number(day.study_seconds);
      const height = seconds > 0 ? Math.max(8, Math.round((seconds / maxStudySeconds) * 100)) : 3;
      const dateLabel = formatAnalyticsDay(day.date);
      const accessibleLabel = `${dateLabel}: ${formatStudyDuration(seconds)}, ${number(day.active_learners)} estudiantes activos`;
      return `<span class="adminTrendDay" aria-label="${h(accessibleLabel)}" title="${h(accessibleLabel)}"><i style="height:${height}%"></i><small>${index % chartStep === 0 || index === chartDays.length - 1 ? h(dateLabel) : ''}</small></span>`;
    }).join('');
    const courseRows = courses.map((course) => `<div class="adminAnalyticsCourseRow" role="row">
      <div role="cell"><strong>${h(adminAnalyticsCourseName(course.course_key))}</strong><small>${h(course.course_key)}</small></div>
      <div role="cell" data-label="Inscritos"><strong>${number(course.enrolled_users)}</strong><small>+${number(course.new_enrollments)} en el periodo</small></div>
      <div role="cell" data-label="Estudiantes activos"><strong>${number(course.active_learners)}</strong><small>${number(course.learning_sessions)} sesiones</small></div>
      <div role="cell" data-label="Tiempo verificado"><strong>${h(formatStudyDuration(course.study_seconds))}</strong><small>registrado por servidor</small></div>
      <div role="cell" data-label="Evaluaciones"><strong>${number(course.simulator_attempts)} / ${number(course.final_exam_attempts)}</strong><small>simulacros / finales</small></div>
      <div role="cell" data-label="Aprobación"><strong>${number(course.final_exam_pass_rate)}%</strong><small>nota media ${number(course.average_final_score)}%</small></div>
      <div role="cell" data-label="Constancias"><strong>${number(course.certificates_issued)}</strong><small>${number(course.cancellations)} cancelaciones</small></div>
    </div>`).join('');
    const courseOptions = catalogEntries().map((entry) => `<option value="${h(entry.key)}" ${state.adminAnalyticsCourse === entry.key ? 'selected' : ''}>${h(adminAnalyticsCourseName(entry.key))}</option>`).join('');
    const range = [7, 30, 90].includes(number(state.adminAnalyticsRange)) ? number(state.adminAnalyticsRange) : 30;

    return `<section class="adminAnalytics" aria-labelledby="adminAnalyticsTitle" ${state.adminSection === 'metrics' ? '' : 'hidden'}>
      <div class="adminDirectoryHead adminAnalyticsHead">
        <div><span class="sectionKicker">Fuente oficial</span><h2 id="adminAnalyticsTitle">Métricas verificadas de aprendizaje</h2><p>Indicadores calculados en Supabase a partir de sesiones, respuestas y resultados confirmados por el servidor.</p></div>
        <button class="btn secondary adminRefresh" type="button" data-action="admin-analytics-refresh" ${state.adminAnalyticsLoading ? 'disabled' : ''}>Actualizar métricas</button>
      </div>
      <div class="adminAnalyticsControls">
        <div class="adminAnalyticsRanges" role="group" aria-label="Periodo de métricas">
          ${[7, 30, 90].map((days) => `<button type="button" data-action="admin-analytics-range" data-days="${days}" aria-pressed="${range === days}" class="${range === days ? 'active' : ''}">${days} días</button>`).join('')}
        </div>
        <label for="adminAnalyticsCourse"><span>Curso</span><select id="adminAnalyticsCourse"><option value="all" ${state.adminAnalyticsCourse === 'all' ? 'selected' : ''}>Todos los cursos</option>${courseOptions}</select></label>
      </div>
      ${state.adminAnalyticsLoading ? '<div class="adminLoading" role="status">Calculando métricas verificadas...</div>' : ''}
      ${state.adminAnalyticsError ? `<div class="badbox">${h(state.adminAnalyticsError)}</div>` : ''}
      <p class="adminVerifiedMetricNote"><strong>${analytics.verified ? 'Datos verificados por servidor' : 'Esperando verificación'}</strong><span>Periodo de ${range} días · zona horaria de Bogotá. El histórico no verificado no se suma en estos indicadores.</span></p>
      <div class="adminAnalyticsMetricGrid">
        <div class="metric"><span>Estudiantes activos</span><strong>${number(summary.active_learners)}</strong><small>con actividad verificada</small></div>
        <div class="metric"><span>Nuevas inscripciones</span><strong>${number(summary.new_enrollments)}</strong><small>${number(summary.cancellations)} canceladas</small></div>
        <div class="metric"><span>Tiempo verificado</span><strong>${h(formatStudyDuration(summary.study_seconds))}</strong><small>${number(summary.learning_sessions)} sesiones</small></div>
        <div class="metric"><span>Promedio por estudiante</span><strong>${number(summary.average_study_minutes)} min</strong><small>durante el periodo</small></div>
        <div class="metric"><span>Prácticas / simulacros</span><strong>${number(summary.practice_attempts)} / ${number(summary.simulator_attempts)}</strong><small>intentos completados</small></div>
        <div class="metric"><span>Exámenes finales</span><strong>${number(summary.final_exam_attempts)}</strong><small>${number(summary.final_exams_passed)} aprobados</small></div>
        <div class="metric"><span>Tasa de aprobación</span><strong>${number(summary.final_exam_pass_rate)}%</strong><small>sobre finales completados</small></div>
        <div class="metric"><span>Constancias emitidas</span><strong>${number(summary.certificates_issued)}</strong><small>${h(formatCopAmount(summary.certificate_revenue_cop))}</small></div>
      </div>
      <div class="adminAnalyticsPanels">
        <article class="adminTrendPanel">
          <div><h3>Tiempo de estudio diario</h3><p>${chartDays.length < daily.length ? 'Últimos 30 días del periodo seleccionado.' : 'Periodo seleccionado completo.'}</p></div>
          <div class="adminTrendChart" role="img" aria-label="Tiempo verificado de estudio por día">${chart || '<p class="adminEmpty">Aún no hay actividad verificada en este periodo.</p>'}</div>
        </article>
        <article class="adminAssessmentPanel">
          <div><h3>Actividad académica</h3><p>Solo intentos completados y evaluados en el servidor.</p></div>
          <dl>
            <div><dt>Prácticas</dt><dd>${number(summary.practice_attempts)}</dd></div>
            <div><dt>Simulacros</dt><dd>${number(summary.simulator_attempts)}</dd></div>
            <div><dt>Exámenes finales</dt><dd>${number(summary.final_exam_attempts)}</dd></div>
            <div><dt>Finales aprobados</dt><dd>${number(summary.final_exams_passed)}</dd></div>
          </dl>
        </article>
      </div>
      <div class="adminAnalyticsCourseTable" role="table" aria-label="Métricas verificadas por curso">
        <div class="adminAnalyticsCourseHeader" role="row"><span>Curso</span><span>Inscritos</span><span>Activos</span><span>Tiempo</span><span>Simulacros / finales</span><span>Aprobación</span><span>Constancias</span></div>
        ${courseRows || (!state.adminAnalyticsLoading ? '<p class="adminEmpty">No hay métricas para este filtro.</p>' : '')}
      </div>
    </section>`;
  }

  function renderAdminPage() {
    if (!Auth?.isAuthenticated?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle">
          <span class="sectionKicker">Acceso restringido</span>
          <h1 id="adminTitle">Panel de administración</h1>
          <p>Inicia sesión con una cuenta administradora para consultar usuarios y métricas de aprendizaje.</p>
          <button class="btn" type="button" data-action="sign-in-google">Iniciar sesión</button>
        </section>
      </div>`;
    }

    if (!Auth?.isReady?.() || !Auth?.isAdminResolved?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle" aria-busy="true">
          <span class="sectionKicker">Administración</span>
          <h1 id="adminTitle">Verificando permisos seguros...</h1>
          <p>Estamos restaurando tu sesión y tu rol administrativo. Permanecerás en esta página.</p>
        </section>
      </div>`;
    }

    if (Auth?.didAdminCheckFail?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle">
          <span class="sectionKicker">Administración</span>
          <h1 id="adminTitle">No fue posible verificar tus permisos</h1>
          <p>Tu sesión continúa activa. Intenta nuevamente sin salir de esta página.</p>
          <button class="btn" type="button" data-action="admin-refresh-access">Reintentar verificación</button>
        </section>
      </div>`;
    }

    if (!Auth?.isAdmin?.()) {
      return `<div class="publicHome publicPage adminPage" id="admin">
        <section class="accountSignIn" aria-labelledby="adminTitle">
          <span class="sectionKicker">Acceso restringido</span>
          <h1 id="adminTitle">Esta cuenta no tiene permisos administrativos</h1>
          <p>Tu sesión continúa activa y puedes regresar a tu cuenta de aprendizaje.</p>
          <a class="btn" href="${h(publicPath('account'))}" data-view="account">Ir a Mi cuenta</a>
        </section>
      </div>`;
    }

    const summary = state.adminSummary || {};
    const users = Array.isArray(state.adminUsers) ? state.adminUsers : [];
    const rows = users.map((user) => ({ user, snapshot: adminUserSnapshot(user) }));
    const visibleRows = rows.filter(({ snapshot }) => adminUserMatchesFilter(snapshot));
    const onlineCount = rows.filter(({ snapshot }) => snapshot.online).length;
    const activeCount = rows.filter(({ snapshot }) => (
      Date.now() - new Date(snapshot.lastSeenAt).getTime() <= 30 * 24 * 60 * 60 * 1000
    )).length;
    const enrolledCount = rows.filter(({ snapshot }) => snapshot.learningEnrollments.length > 0).length;
    const currentAdminRole = Auth?.getAccessStatus?.()?.admin_role || 'admin';
    const isSuperadmin = currentAdminRole === 'superadmin';
    const adminCertificates = Array.isArray(state.adminCertificates) ? state.adminCertificates : [];
    const userRows = visibleRows.map(({ user, snapshot }) => {
      const name = user.full_name || user.email?.split('@')[0] || 'Usuario';
      const governance = state.adminGovernanceByUser.get(user.id) || {};
      return `<article class="adminManagerRow">
        <div class="adminManagerMain">
          <div class="adminManagerIdentity" data-label="Usuario">
            <span class="adminUserInitial" aria-hidden="true">${h(name.charAt(0).toUpperCase())}</span>
            <span><strong>${h(name)}</strong><a href="mailto:${h(user.email || '')}">${h(user.email || 'Sin correo')}</a><small>${governance.admin_role ? `Rol: ${h(governance.admin_role === 'superadmin' ? 'Superadministrador' : 'Administrador')}` : 'Rol: Estudiante'}</small></span>
          </div>
          <div class="adminManagerCell" data-label="Estado">
            <span class="adminPresence ${snapshot.online ? 'online' : 'offline'}"><i aria-hidden="true"></i>${governance.blocked ? 'Bloqueado' : snapshot.online ? 'En línea' : 'Desconectado'}</span>
          </div>
          <div class="adminManagerCell" data-label="Cursos"><strong>${snapshot.learningEnrollments.length}</strong><small>${snapshot.activeCourses} activos · ${snapshot.completedCourses} completados</small></div>
          <div class="adminManagerCell adminProgressCell" data-label="Avance"><strong>${snapshot.progressPercent}%</strong><small>${snapshot.hasUnverifiedHistory ? 'Incluye histórico no verificado' : `Dominio verificado ${snapshot.masteryPercent}%`}</small><span class="adminMiniProgress"><i style="width:${snapshot.progressPercent}%"></i></span></div>
          <div class="adminManagerCell" data-label="Tiempo"><strong>${h(formatStudyDuration(snapshot.studySeconds))}</strong><small>estudio acumulado</small></div>
          <div class="adminManagerCell" data-label="Última actividad"><strong>${h(formatAdminActivity(snapshot.lastSeenAt))}</strong><small>${h(formatDate(snapshot.lastSeenAt))}</small></div>
        </div>
        <details class="adminUserDetails">
          <summary>Ver cursos y avance por capítulo</summary>
          <div class="adminUserRegistration"><span>Registro: ${h(formatDate(user.created_at))}</span><span>Último inicio de sesión: ${h(formatDate(user.last_sign_in_at))}</span>${governance.block_reason ? `<span>Motivo de bloqueo: ${h(governance.block_reason)}</span>` : ''}</div>
          <div class="adminGovernanceActions">
            <button class="btn ${governance.blocked ? 'good' : 'bad'}" type="button" data-action="admin-user-block" data-user-id="${h(user.id)}" data-blocked="${governance.blocked ? 'false' : 'true'}">${governance.blocked ? 'Desbloquear cuenta' : 'Bloquear cuenta'}</button>
            ${isSuperadmin ? `<button class="btn secondary" type="button" data-action="admin-user-role" data-user-id="${h(user.id)}" data-role="${governance.admin_role ? 'none' : 'admin'}">${governance.admin_role ? 'Retirar rol administrativo' : 'Convertir en administrador'}</button>${governance.admin_role === 'admin' ? `<button class="btn secondary" type="button" data-action="admin-user-role" data-user-id="${h(user.id)}" data-role="superadmin">Convertir en superadministrador</button>` : ''}` : ''}
          </div>
          <div class="adminEnrollments">
            ${snapshot.enrollments.map((item) => adminEnrollmentView(item, user.id, governance, isSuperadmin)).join('') || '<p class="adminEmpty">Este usuario aún no tiene cursos inscritos.</p>'}
          </div>
        </details>
      </article>`;
    }).join('');

    const filters = [
      ['all', 'Todos', state.adminTotal],
      ['online', 'En línea', onlineCount],
      ['active', 'Activos 30 días', activeCount],
      ['enrolled', 'Con cursos', enrolledCount],
      ['unenrolled', 'Sin cursos', Math.max(0, users.length - enrolledCount)]
    ];
    const certificateRows = adminCertificates.map((certificate) => `<article class="adminCertificateRow ${certificate.archived_at ? 'archived' : ''}">
      <div><span class="accountStatus ${certificate.status === 'VALID' ? 'completed' : 'cancelled'}">${certificate.status === 'VALID' ? 'Válido' : 'Revocado'}</span>${certificate.archived_at ? '<span class="accountStatus historical">Archivado</span>' : ''}<strong>${h(certificate.certificate_code)}</strong></div>
      <div><strong>${h(certificate.full_name)}</strong><a href="mailto:${h(certificate.email || '')}">${h(certificate.email || 'Sin correo')}</a></div>
      <div><strong>${h(certificate.course_name)}</strong><small>${h(certificate.document)}</small></div>
      <div><strong>${h(formatDate(certificate.issued_at))}</strong><small>${number(certificate.estimated_hours)} h estimadas</small></div>
      <div class="adminCertificateActions"><button class="btn secondary" type="button" data-action="view-certificate" data-code="${h(certificate.certificate_code)}">Validar</button><button class="btn" type="button" data-action="download-certificate" data-code="${h(certificate.certificate_code)}">Ver PDF</button><button class="btn secondary" type="button" data-action="admin-certificate-status" data-certificate-id="${h(certificate.id)}" data-status-action="${certificate.archived_at ? 'unarchive' : 'archive'}">${certificate.archived_at ? 'Restaurar' : 'Archivar'}</button><button class="btn ${certificate.status === 'VALID' ? 'bad' : 'good'}" type="button" data-action="admin-certificate-status" data-certificate-id="${h(certificate.id)}" data-status-action="${certificate.status === 'VALID' ? 'revoke' : 'restore'}">${certificate.status === 'VALID' ? 'Revocar' : 'Restaurar validez'}</button></div>
    </article>`).join('');
    const allAdminMessages = Array.isArray(state.adminMessages) ? state.adminMessages : [];
    const messageStatus = (message) => message.archived ? 'archived' : message.status;
    const messageFilters = [
      ['all', 'Todos', allAdminMessages.length],
      ['new', 'Sin revisar', allAdminMessages.filter((item) => messageStatus(item) === 'new').length],
      ['in_progress', 'En gestión', allAdminMessages.filter((item) => messageStatus(item) === 'in_progress').length],
      ['responded', 'Completados', allAdminMessages.filter((item) => messageStatus(item) === 'responded').length],
      ['closed', 'Cerrados', allAdminMessages.filter((item) => messageStatus(item) === 'closed').length],
      ['archived', 'Archivados', allAdminMessages.filter((item) => messageStatus(item) === 'archived').length]
    ];
    const visibleAdminMessages = state.adminMessageFilter === 'all'
      ? allAdminMessages
      : allAdminMessages.filter((item) => messageStatus(item) === state.adminMessageFilter);
    const messageRows = visibleAdminMessages.map((message) => `<article class="adminInboxCard ${message.archived ? 'archived' : ''}">
      <div class="adminCardHead"><div><span class="reviewStatus ${h(messageStatus(message))}">${h(adminMessageStatusLabel(messageStatus(message)))}</span><h3>${h(message.subject)}</h3></div><time datetime="${h(message.created_at)}">${h(formatDate(message.created_at))}</time></div>
      <div class="adminInboxIdentity"><strong>${h(message.full_name)}</strong><span>${h(message.email)}</span></div>
      <p class="adminInboxMessage">${h(message.message)}</p>
      ${message.archived ? `${message.admin_reply ? `<div class="adminRecordedReply"><b>Respuesta registrada</b><p>${h(message.admin_reply)}</p></div>` : ''}<p class="small">Archivado para auditoría. No se muestra en la bandeja activa.</p>` : `<label for="adminReply${h(message.id)}">Respuesta dentro de QAvance</label>
      <textarea id="adminReply${h(message.id)}" data-admin-message-reply="${h(message.id)}" maxlength="5000" placeholder="El usuario verá esta respuesta en Mi cuenta...">${h(message.admin_reply || '')}</textarea>
      <div class="adminInboxActions">
        <button class="btn secondary" type="button" data-action="admin-message-status" data-message-id="${h(message.id)}" data-status="in_progress">Marcar en gestión</button>
        <button class="btn" type="button" data-action="admin-message-status" data-message-id="${h(message.id)}" data-status="responded">Responder en QAvance</button>
        <button class="btn secondary" type="button" data-action="admin-message-status" data-message-id="${h(message.id)}" data-status="closed">Cerrar</button>
        <button class="btn bad" type="button" data-action="admin-message-delete" data-message-id="${h(message.id)}">Archivar</button>
      </div>`}
    </article>`).join('');
    const allAdminReviews = Array.isArray(state.adminReviews) ? state.adminReviews : [];
    const reviewStatus = (review) => review.archived ? 'archived' : review.status;
    const reviewFilters = [
      ['all', 'Todas', allAdminReviews.length],
      ['pending', 'En revisión', allAdminReviews.filter((item) => reviewStatus(item) === 'pending').length],
      ['approved', 'Publicadas', allAdminReviews.filter((item) => reviewStatus(item) === 'approved').length],
      ['rejected', 'Declinadas', allAdminReviews.filter((item) => reviewStatus(item) === 'rejected').length],
      ['archived', 'Archivadas', allAdminReviews.filter((item) => reviewStatus(item) === 'archived').length]
    ];
    const visibleAdminReviews = state.adminReviewFilter === 'all'
      ? allAdminReviews
      : allAdminReviews.filter((item) => reviewStatus(item) === state.adminReviewFilter);
    const reviewRows = visibleAdminReviews.map((review) => {
      const entry = catalogEntry(review.course_key) || {};
      return `<article class="adminReviewCard ${review.archived ? 'archived' : ''}">
        <div class="adminCardHead"><div><span class="reviewStatus ${h(reviewStatus(review))}">${h(reviewStatusLabel(reviewStatus(review)))}</span><div class="studentReviewStars" aria-label="${number(review.rating)} de 5 estrellas">${starText(review.rating)}</div></div><time datetime="${h(review.created_at)}">${h(formatDate(review.created_at))}</time></div>
        <h3>${h(entry.meta?.name || review.course_key)}</h3>
        <p>${h(review.comment || 'Calificación sin comentario.')}</p>
        <div class="adminInboxIdentity"><strong>${h(review.full_name || 'Usuario')}</strong><span>${h(review.email || 'Sin correo')}</span></div>
        ${review.archived ? '<p class="small">Archivada para auditoría y fuera de publicación.</p>' : `<div class="adminInboxActions"><button class="btn good" type="button" data-action="admin-review-status" data-review-id="${h(review.id)}" data-status="approved">Aprobar</button><button class="btn secondary" type="button" data-action="admin-review-status" data-review-id="${h(review.id)}" data-status="rejected">Declinar</button><button class="btn bad" type="button" data-action="admin-review-delete" data-review-id="${h(review.id)}">Archivar</button></div>`}
      </article>`;
    }).join('');
    const adminTabs = [
      ['metrics', 'Métricas', 'Ver'],
      ['users', 'Usuarios', state.adminTotal],
      ['messages', 'Mensajes', state.adminMessageTotal],
      ['reviews', 'Calificaciones', state.adminReviewTotal],
      ['certificates', 'Certificados', state.adminCertificateTotal],
      ['socials', 'Redes sociales', 'Configurar']
    ];

    return `<div class="publicHome publicPage adminPage" id="admin">
      <section class="adminHeader" aria-labelledby="adminTitle">
        <span class="sectionKicker">Administración</span>
        <h1 id="adminTitle">Resumen gerencial de QAvance</h1>
        <p>Usuarios, matrículas y aprendizaje sincronizados con la información verificada en Supabase.</p>
        <div class="adminSummaryGrid">
          <div class="metric"><span>Usuarios registrados</span><strong>${number(summary.registered_users)}</strong></div>
          <div class="metric adminOnlineMetric"><span>Usuarios en línea</span><strong>${number(summary.online_users)}</strong></div>
          <div class="metric"><span>Activos últimos 30 días</span><strong>${number(summary.active_users_30d)}</strong></div>
          <div class="metric"><span>Nuevos últimos 30 días</span><strong>${number(summary.new_users_30d)}</strong></div>
          <div class="metric"><span>Usuarios con cursos</span><strong>${number(summary.enrolled_users)}</strong></div>
          <div class="metric"><span>Matrículas activas</span><strong>${number(summary.active_enrollments)}</strong></div>
          <div class="metric"><span>Tiempo estudiado</span><strong>${h(formatStudyDuration(summary.study_seconds))}</strong></div>
          <div class="metric"><span>Simulacros / finales</span><strong>${number(summary.simulator_attempts)} / ${number(summary.final_exam_attempts)}</strong></div>
          <div class="metric"><span>Certificados emitidos</span><strong>${number(summary.issued_certificates)}</strong></div>
        </div>
      </section>
      <nav class="adminSectionTabs" aria-label="Secciones de administración">${adminTabs.map(([key, label, count]) => `<button type="button" data-action="admin-section" data-section="${key}" aria-pressed="${state.adminSection === key}" class="${state.adminSection === key ? 'active' : ''}">${label}<span>${count}</span></button>`).join('')}</nav>
      ${renderAdminAnalytics()}
      <section class="adminDirectory" aria-labelledby="adminUsersTitle" ${state.adminSection === 'users' ? '' : 'hidden'}>
        <div class="adminDirectoryHead">
          <div><h2 id="adminUsersTitle">Usuarios y correos activos</h2><p>${state.adminTotal} registro${state.adminTotal === 1 ? '' : 's'} en el directorio.</p></div>
          <form class="adminSearchForm" data-admin-search-form role="search">
            <label for="adminSearch">Buscar por nombre o correo</label>
            <div><input id="adminSearch" name="search" type="search" maxlength="120" value="${h(state.adminSearch)}" autocomplete="off"><button class="btn" type="submit">Buscar</button><button class="btn secondary adminRefresh" type="button" data-action="admin-refresh" aria-label="Actualizar información">Actualizar</button></div>
          </form>
        </div>
        <div class="adminFilters" aria-label="Filtrar usuarios">
          ${filters.map(([key, label, count]) => `<button type="button" data-action="admin-filter" data-filter="${key}" aria-pressed="${state.adminFilter === key}" class="${state.adminFilter === key ? 'active' : ''}">${label}<span>${count}</span></button>`).join('')}
        </div>
        <p class="adminPresenceNote">Se considera en línea una sesión con actividad durante los últimos 2 minutos y 30 segundos.</p>
        ${state.adminLoading ? '<div class="adminLoading" role="status">Consultando información protegida...</div>' : ''}
        ${state.adminError ? `<div class="badbox">${h(state.adminError)}</div>` : ''}
        <div class="adminManagerTable" role="table" aria-label="Directorio gerencial de usuarios">
          <div class="adminManagerHeader" role="row"><span>Usuario</span><span>Estado</span><span>Cursos</span><span>Avance real</span><span>Tiempo</span><span>Última actividad</span></div>
          <div class="adminUserList">${userRows || (!state.adminLoading ? '<p class="adminEmpty">No se encontraron usuarios para este filtro.</p>' : '')}</div>
        </div>
      </section>
      <section class="adminInbox" aria-labelledby="adminMessagesTitle" ${state.adminSection === 'messages' ? '' : 'hidden'}>
        <div class="adminDirectoryHead"><div><h2 id="adminMessagesTitle">Mensajes de contacto</h2><p>${state.adminMessageTotal} mensaje${state.adminMessageTotal === 1 ? '' : 's'} almacenado${state.adminMessageTotal === 1 ? '' : 's'}.</p></div></div>
        <div class="adminStateFilters" aria-label="Filtrar mensajes por estado">${messageFilters.map(([key, label, count]) => `<button type="button" data-action="admin-message-filter" data-filter="${key}" aria-pressed="${state.adminMessageFilter === key}" class="${state.adminMessageFilter === key ? 'active' : ''}"><span>${label}</span><strong>${count}</strong></button>`).join('')}</div>
        <div class="adminInboxGrid">${messageRows || (!state.adminLoading ? '<p class="adminEmpty">No se encontraron mensajes.</p>' : '')}</div>
      </section>
      <section class="adminReviews" aria-labelledby="adminReviewsTitle" ${state.adminSection === 'reviews' ? '' : 'hidden'}>
        <div class="adminDirectoryHead"><div><h2 id="adminReviewsTitle">Calificaciones de cursos</h2><p>Aprueba o declina cada experiencia antes de publicarla.</p></div></div>
        <div class="adminStateFilters" aria-label="Filtrar calificaciones por estado">${reviewFilters.map(([key, label, count]) => `<button type="button" data-action="admin-review-filter" data-filter="${key}" aria-pressed="${state.adminReviewFilter === key}" class="${state.adminReviewFilter === key ? 'active' : ''}"><span>${label}</span><strong>${count}</strong></button>`).join('')}</div>
        <div class="adminReviewGrid">${reviewRows || (!state.adminLoading ? '<p class="adminEmpty">No se encontraron calificaciones.</p>' : '')}</div>
      </section>
      <section class="adminCertificates" aria-labelledby="adminCertificatesTitle" ${state.adminSection === 'certificates' ? '' : 'hidden'}>
        <div class="adminDirectoryHead"><div><h2 id="adminCertificatesTitle">Certificados obtenidos</h2><p>${state.adminCertificateTotal} certificado${state.adminCertificateTotal === 1 ? '' : 's'} registrado${state.adminCertificateTotal === 1 ? '' : 's'}.</p></div></div>
        <div class="adminCertificateTable"><div class="adminCertificateHeader"><span>Certificado</span><span>Usuario</span><span>Curso</span><span>Emisión</span><span>Acciones</span></div>${certificateRows || (!state.adminLoading ? '<p class="adminEmpty">No se encontraron certificados para este filtro.</p>' : '')}</div>
      </section>
      <section class="adminSocials" aria-labelledby="adminSocialsTitle" ${state.adminSection === 'socials' ? '' : 'hidden'}>
        <div class="adminDirectoryHead"><div><h2 id="adminSocialsTitle">Canales oficiales</h2><p>Configura los enlaces que aparecen en Contáctanos y el acceso flotante a la comunidad de WhatsApp.</p></div></div>
        <form class="adminSocialForm" data-admin-social-form>
          <label for="adminLinkedinUrl">LinkedIn</label><input id="adminLinkedinUrl" name="linkedinUrl" type="url" inputmode="url" maxlength="500" placeholder="https://www.linkedin.com/..." value="${h(state.adminSocialSettings.linkedin_url || '')}">
          <label for="adminFacebookUrl">Facebook</label><input id="adminFacebookUrl" name="facebookUrl" type="url" inputmode="url" maxlength="500" placeholder="https://www.facebook.com/..." value="${h(state.adminSocialSettings.facebook_url || '')}">
          <label for="adminTiktokUrl">TikTok</label><input id="adminTiktokUrl" name="tiktokUrl" type="url" inputmode="url" maxlength="500" placeholder="https://www.tiktok.com/@..." value="${h(state.adminSocialSettings.tiktok_url || '')}">
          <label for="adminYoutubeUrl">YouTube</label><input id="adminYoutubeUrl" name="youtubeUrl" type="url" inputmode="url" maxlength="500" placeholder="https://www.youtube.com/@..." value="${h(state.adminSocialSettings.youtube_url || '')}">
          <label for="adminWhatsappUrl">WhatsApp o comunidad</label><input id="adminWhatsappUrl" name="whatsappUrl" type="text" inputmode="url" maxlength="500" placeholder="+57... o https://chat.whatsapp.com/..." value="${h(state.adminSocialSettings.whatsapp_url || '')}">
          <p class="small">Deja un campo vacío para ocultar ese canal. El acceso de WhatsApp aparecerá en todo el sitio únicamente cuando esté configurado.</p>
          <button class="btn" type="submit" ${state.adminSocialSaving ? 'disabled' : ''}>${state.adminSocialSaving ? 'Guardando...' : 'Guardar canales oficiales'}</button>
        </form>
      </section>
    </div>`;
  }

  function renderLegalPage() {
    return `<div class="publicHome publicPage legalPage" id="legal">
      <section class="homeSection" aria-labelledby="legalTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">Información legal</span>
          <h1 id="legalTitle">Política de privacidad y términos de uso</h1>
          <p>QAvance es una plataforma independiente de preparación y aprendizaje. Esta información resume cómo funciona el sitio estático y qué responsabilidades aplican al usarlo.</p>
        </div>
        <div class="legalGrid">
          <article class="legalCard" id="privacidad">
            <h3>Política de privacidad</h3>
            <p>QAvance utiliza inicio de sesión con Google mediante Supabase Auth para acceder a los cursos. Al ingresar se procesan el identificador de cuenta, nombre y correo proporcionados por Google para mantener la sesión y asociar tus matrículas. QAvance no recibe tu contraseña de Google.</p>
            <p>Las matrículas, fechas de inicio, avance por capítulo, tiempo activo de estudio, respuestas acumuladas y resultados de simulacros o exámenes finales se guardan en Supabase para recuperar el aprendizaje entre dispositivos y generar métricas de uso. El navegador conserva una copia local para dar continuidad a la experiencia.</p>
            <p>Los mensajes enviados con una sesión activa se almacenan para gestionarlos y responderlos dentro de Mi cuenta. Las calificaciones de cursos se asocian a la cuenta inscrita; solo el nombre abreviado, las estrellas y el comentario aparecen públicamente después de moderación administrativa.</p>
            <p>Cancelar un curso detiene su estado activo, pero conserva el historial para que puedas reactivarlo. Después de cancelarlo, puedes usar <b>Quitar de mi cuenta</b> para ocultarlo sin perder matrícula, avance, tiempo ni intentos. Para solicitar la eliminación completa de datos personales usa el formulario de contacto.</p>
            <p>QAvance utiliza Google Analytics para conocer de forma agregada qué páginas y cursos se visitan. Google puede usar cookies o identificadores técnicos conforme a sus propias políticas de privacidad.</p>
            <p>Wompi procesa los pagos de certificados y aportes. QAvance conserva la referencia, el estado y el valor de la transacción, pero no recibe ni almacena números de tarjeta ni credenciales bancarias.</p>
            <p>Para emitir un certificado se solicita nombre completo, tipo y número de documento. El número completo aparece únicamente en el PDF privado; la validación pública muestra solo los últimos caracteres enmascarados. El usuario autoriza expresamente esa consulta pública antes de la emisión.</p>
          </article>
          <article class="legalCard" id="terminos">
            <h3>Términos y condiciones</h3>
            <p>El contenido se ofrece para estudio personal y no garantiza la aprobación de certificaciones oficiales ni sustituye materiales, reglas o exámenes de las entidades certificadoras.</p>
            <p>QAvance puede emitir certificados internos de finalización después de completar el curso, aprobar su examen final y confirmar el pago. Estos documentos acreditan únicamente la finalización dentro de QAvance y no equivalen a una certificación oficial de ISTQB, CertiProf ni de otra entidad.</p>
            <p>El valor se presenta en USD 25 como referencia y se cobra en pesos colombianos usando la TRM consultada al crear la orden. El importe exacto en COP se informa antes de abrir Wompi.</p>
          </article>
          <article class="legalCard">
            <h3>Aviso independiente</h3>
            <p>QAvance no representa a ISTQB, CertiProf, Scrum.org, Scrum Inc., la Comisión Europea ni otras entidades mencionadas. Las marcas pertenecen a sus titulares.</p>
          </article>
        </div>
      </section>
    </div>`;
  }

  function brandIcon(name) {
    const icons = {
      linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.44-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.54V9H7.1v11.45ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.76 24h20.47c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v9h4v-9h3.2l.8-4h-4V9c0-.7.3-1 1-1Z"/></svg>',
      tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 3c.5 2.7 2 4.3 5 4.5v4c-1.9-.1-3.5-.7-5-1.8V16a6 6 0 1 1-6-6c.4 0 .7 0 1 .1v4.1a2 2 0 1 0 1 1.8V3h4Z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12c0 1.6.1 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.7 15.2V8.8L15.5 12l-5.8 3.2Z"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.3.2-.4.6-1 .1-.2.1-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.5 3.9 1.7.7 2.4.8 3.3.7 1-.2 1.4-.9 1.6-1.7.2-.8.2-1.4.1-1.5-.2-.2-.4-.3-.6-.4Z"/></svg>'
    };
    return `<span class="brandSocialIcon">${icons[name] || ''}</span>`;
  }

  async function saveAdminSocialSettings(form) {
    if (state.adminSocialSaving || !form.reportValidity()) return;
    const data = new FormData(form);
    const whatsappUrl = normalizeWhatsappUrl(data.get('whatsappUrl'));
    if (String(data.get('whatsappUrl') || '').trim() && !whatsappUrl) {
      notify('Ingresa un número internacional o una URL válida de WhatsApp.', 'warning');
      return;
    }
    state.adminSocialSaving = true;
    render();
    try {
      const value = await Cloud.updateAdminSocialSettings({
        linkedinUrl: data.get('linkedinUrl'),
        facebookUrl: data.get('facebookUrl'),
        tiktokUrl: data.get('tiktokUrl'),
        youtubeUrl: data.get('youtubeUrl'),
        whatsappUrl
      });
      state.adminSocialSettings = normalizedSocialSettings(value);
      socialSettings = { ...socialSettings, ...state.adminSocialSettings };
      syncFloatingWhatsapp();
      notify('Canales oficiales actualizados.', 'success');
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible guardar los canales oficiales.', 'error');
    } finally {
      state.adminSocialSaving = false;
      if (state.view === 'admin') render();
    }
  }

  function renderSocialLinks() {
    const channels = [
      ['linkedin', 'LinkedIn', safeHttpsUrl(socialSettings.linkedin_url)],
      ['facebook', 'Facebook', safeHttpsUrl(socialSettings.facebook_url)],
      ['tiktok', 'TikTok', safeHttpsUrl(socialSettings.tiktok_url)],
      ['youtube', 'YouTube', safeHttpsUrl(socialSettings.youtube_url)],
      ['whatsapp', 'WhatsApp', normalizeWhatsappUrl(socialSettings.whatsapp_url)]
    ].filter(([, , url]) => Boolean(url));
    return channels.length
      ? `<div class="socialLogoLinks">${channels.map(([key, label, url]) => `<a class="socialLogoLink ${key}" href="${h(url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${h(label)} de QAvance">${brandIcon(key)}<span>${h(label)}</span></a>`).join('')}</div>`
      : '<p class="contactSocialEmpty">Los canales estarán disponibles próximamente.</p>';
  }

  async function submitContactForm(form) {
    if (state.contactSubmitting || !form.reportValidity()) return;
    const data = new FormData(form);
    state.contactSubmitting = true;
    state.contactResult = '';
    state.contactError = '';
    const submitButton = form.querySelector('[type="submit"]');
    const status = form.querySelector('.contactFormStatus');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }
    if (status) status.textContent = '';
    try {
      await Cloud.submitContactMessage({
        fullName: data.get('fullName'),
        email: data.get('email'),
        subject: data.get('subject'),
        message: data.get('message'),
        website: data.get('website'),
        sourcePath: `${global.location.pathname}${global.location.search}${global.location.hash}`
      });
      state.contactResult = Auth?.isAuthenticated?.()
        ? 'Mensaje enviado. Consulta el estado y la respuesta desde Mi cuenta.'
        : 'Mensaje enviado. Para futuras solicitudes, inicia sesión primero si deseas consultar la respuesta en Mi cuenta.';
      notify('Mensaje enviado correctamente.', 'success');
      form.reset();
      openMessageModal();
    } catch (error) {
      console.error(error);
      state.contactError = error?.message || 'No fue posible enviar el mensaje. Intenta nuevamente.';
    } finally {
      state.contactSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar mensaje';
      }
      if (status) {
        status.textContent = state.contactError || state.contactResult;
        status.className = `contactFormStatus ${state.contactError ? 'error' : 'success'}`;
      }
    }
  }

  function starText(rating) {
    const value = Math.max(0, Math.min(5, Math.trunc(number(rating))));
    return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
  }

  function reviewStatusLabel(status) {
    return status === 'approved' ? 'Publicada' : status === 'rejected' ? 'No publicada' : status === 'archived' ? 'Archivada' : 'Pendiente de revisión';
  }

  function normalizedReviewDistribution(value = {}, reviews = []) {
    const result = {};
    for (let rating = 1; rating <= 5; rating += 1) {
      const reported = Math.max(0, Math.trunc(number(value?.[rating] ?? value?.[String(rating)])));
      result[rating] = reported || (Array.isArray(reviews) ? reviews.filter((review) => number(review.rating) === rating).length : 0);
    }
    return result;
  }

  function renderReviewSummary(average, total, distribution, reviews = []) {
    const safeTotal = Math.max(0, Math.trunc(number(total)));
    const safeAverage = Math.max(0, Math.min(5, number(average)));
    const counts = normalizedReviewDistribution(distribution, reviews);
    return `<div class="reviewSummaryPanel" aria-label="Resumen de opiniones: ${safeAverage.toFixed(1)} de 5, ${safeTotal} ${safeTotal === 1 ? 'opinión' : 'opiniones'}">
      <div class="reviewDistribution" aria-label="Distribución por calificación">
        ${[5, 4, 3, 2, 1].map((rating) => {
          const count = counts[rating];
          const percentage = safeTotal ? Math.round((count * 100) / safeTotal) : 0;
          return `<div class="reviewDistributionRow">
            <span aria-hidden="true">${rating}</span>
            <progress max="${Math.max(1, safeTotal)}" value="${count}" aria-label="${rating} estrellas: ${count} ${count === 1 ? 'opinión' : 'opiniones'}, ${percentage}%"></progress>
            <small aria-hidden="true">${percentage}%</small>
          </div>`;
        }).join('')}
      </div>
      <div class="reviewAverage">
        <strong>${safeAverage.toFixed(1)}</strong>
        <span class="reviewAverageStars" style="--rating:${safeAverage}" aria-hidden="true">★★★★★</span>
        <small>${safeTotal} ${safeTotal === 1 ? 'opinión' : 'opiniones'}</small>
      </div>
    </div>`;
  }

  function reviewInitial(value) {
    return String(value || 'E').trim().charAt(0).toUpperCase() || 'E';
  }

  function formatReviewDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  function renderReviewCards(reviews, { showCourse = false } = {}) {
    return (Array.isArray(reviews) ? reviews : []).map((review) => {
      const entry = catalogEntry(review.course_key) || {};
      const displayName = review.display_name || 'Estudiante';
      const avatarUrl = safeHttpsUrl(review.avatar_url);
      return `<article class="studentReviewCard">
        <header class="studentReviewAuthor">
          <span class="studentReviewAvatar" aria-hidden="true"><b>${h(reviewInitial(displayName))}</b>${avatarUrl ? `<img src="${h(avatarUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}</span>
          <div><strong>${h(displayName)}</strong><time datetime="${h(review.created_at)}">${h(formatReviewDate(review.created_at))}</time></div>
        </header>
        <div class="studentReviewStars" aria-label="${number(review.rating)} de 5 estrellas">${starText(review.rating)}</div>
        ${review.comment ? `<blockquote>${h(review.comment)}</blockquote>` : ''}
        ${showCourse ? `<footer><span>${h(entry.meta?.name || review.course_key)}</span></footer>` : ''}
      </article>`;
    }).join('');
  }

  function renderStudentTestimonials() {
    const reviews = homeReviewSlides();
    if (reviews.length) state.homeReviewSlide = ((state.homeReviewSlide % reviews.length) + reviews.length) % reviews.length;
    const activeReview = reviews[state.homeReviewSlide];
    return `<section class="homeSection studentVoices" aria-labelledby="studentVoicesTitle">
      <div class="studentVoicesHead">
        <h2 id="studentVoicesTitle">Qué piensan nuestros estudiantes</h2>
        ${reviews.length > 1 ? `<div class="studentReviewControls" aria-label="Cambiar opinión">
          <button type="button" data-action="home-review-prev" aria-label="Opinión anterior" title="Opinión anterior">‹</button>
          <button type="button" data-action="home-review-toggle" aria-label="${state.homeReviewPaused ? 'Reanudar carrusel de opiniones' : 'Pausar carrusel de opiniones'}" title="${state.homeReviewPaused ? 'Reanudar' : 'Pausar'}">${state.homeReviewPaused ? '▶' : 'Ⅱ'}</button>
          <button type="button" data-action="home-review-next" aria-label="Opinión siguiente" title="Opinión siguiente">›</button>
        </div>` : ''}
      </div>
      ${state.publicReviewsLoading ? '<p class="reviewEmpty" role="status">Cargando experiencias...</p>' : state.publicReviewTotal ? `${renderReviewSummary(state.publicReviewAverage, state.publicReviewTotal, state.publicReviewDistribution, reviews)}${activeReview ? `<div class="studentReviewCarousel" role="region" aria-roledescription="carrusel" aria-label="Opiniones de estudiantes"><div id="studentReviewSlide" class="studentReviewGrid" aria-live="polite">${renderReviewCards([activeReview], { showCourse: true })}</div>${reviews.length > 1 ? `<div class="studentReviewDots" role="tablist" aria-label="Opiniones disponibles">${reviews.map((review, index) => `<button type="button" role="tab" data-action="home-review-go" data-slide="${index}" aria-label="Mostrar opinión ${index + 1} de ${reviews.length}" aria-controls="studentReviewSlide" aria-selected="${index === state.homeReviewSlide}"${index === state.homeReviewSlide ? ' class="active" aria-current="true"' : ''}></button>`).join('')}</div>` : ''}</div>` : ''}` : '<p class="reviewEmpty">Todavía no hay comentarios publicados.</p>'}
    </section>`;
  }

  async function refreshPublicReviews({ silent = false } = {}) {
    if (!silent) state.publicReviewsLoading = true;
    try {
      const result = await Cloud.listApprovedCourseReviews('', 10);
      state.publicReviews = Array.isArray(result?.reviews) ? result.reviews : [];
      state.publicReviewAverage = number(result?.average_rating);
      state.publicReviewTotal = number(result?.total);
      state.publicReviewDistribution = normalizedReviewDistribution(result?.rating_distribution, state.publicReviews);
    } catch (error) {
      console.warn('No fue posible cargar las calificaciones públicas.', error);
    } finally {
      state.publicReviewsLoading = false;
      if (state.view === 'home') render();
    }
  }

  async function refreshCourseReviews({ silent = false } = {}) {
    if (!activeCourseKey) return;
    if (!silent) state.courseReviewLoading = true;
    try {
      const [mine, result] = await Promise.all([
        Auth?.isAuthenticated?.() ? Cloud.getMyCourseReview(activeCourseKey) : Promise.resolve(null),
        Cloud.listApprovedCourseReviews(activeCourseKey, 12)
      ]);
      state.courseReview = mine;
      state.courseReviews = Array.isArray(result?.reviews) ? result.reviews : [];
      state.courseReviewAverage = number(result?.average_rating);
      state.courseReviewTotal = number(result?.total);
      state.courseReviewDistribution = normalizedReviewDistribution(result?.rating_distribution, state.courseReviews);
    } catch (error) {
      console.warn('No fue posible cargar las calificaciones del curso.', error);
    } finally {
      state.courseReviewLoading = false;
      if (state.view === 'dashboard') render();
    }
  }

  async function submitCourseReviewForm(form) {
    if (state.courseReviewSubmitting || !form.reportValidity()) return;
    const data = new FormData(form);
    const rating = Math.trunc(Number(data.get('rating')));
    if (rating < 1 || rating > 5) {
      notify('Selecciona una calificación de 1 a 5 estrellas.', 'warning');
      return;
    }
    state.courseReviewSubmitting = true;
    render();
    try {
      state.courseReview = await Cloud.submitCourseReview(activeCourseKey, rating, data.get('comment'));
      notify('Calificación enviada. Se publicará cuando sea aprobada.', 'success');
      await refreshCourseReviews({ silent: true });
    } catch (error) {
      console.error(error);
      notify(error?.message || 'No fue posible enviar la calificación.', 'error');
    } finally {
      state.courseReviewSubmitting = false;
      if (state.view === 'dashboard') render();
    }
  }

  function renderCourseReviewSection() {
    const mine = state.courseReview || {};
    const rating = number(mine.rating);
    const reviews = Array.isArray(state.courseReviews) ? state.courseReviews : [];
    return `<section class="courseReviewSection card" aria-labelledby="courseReviewTitle">
      <div class="courseReviewHeader">
        <div><span class="sectionKicker">Tu experiencia</span><h2 id="courseReviewTitle">Califica este curso</h2></div>
      </div>
      <form class="courseReviewForm" data-course-review-form>
        <fieldset><legend>Calificación</legend><div class="starRating">
          ${[5, 4, 3, 2, 1].map((value) => `<input id="courseRating${value}" name="rating" type="radio" value="${value}" ${rating === value ? 'checked' : ''} required><label for="courseRating${value}" title="${value} estrella${value === 1 ? '' : 's'}"><span aria-hidden="true">★</span><span class="srOnly">${value} estrella${value === 1 ? '' : 's'}</span></label>`).join('')}
        </div></fieldset>
        <label for="courseReviewComment">Comentario <span>(opcional)</span></label>
        <textarea id="courseReviewComment" name="comment" maxlength="1000" placeholder="¿Qué te ayudó más de este curso?">${h(mine.comment || '')}</textarea>
        <div class="courseReviewActions"><button class="btn" type="submit" ${state.courseReviewSubmitting ? 'disabled' : ''}>${state.courseReviewSubmitting ? 'Enviando...' : rating ? 'Actualizar calificación' : 'Enviar calificación'}</button>${mine.status ? `<span class="reviewStatus ${h(mine.status)}">${h(reviewStatusLabel(mine.status))}</span>` : ''}</div>
      </form>
      <div class="coursePublishedReviews"><h3>Resumen de opiniones</h3>${state.courseReviewLoading ? '<p class="reviewEmpty">Cargando...</p>' : state.courseReviewTotal ? `${renderReviewSummary(state.courseReviewAverage, state.courseReviewTotal, state.courseReviewDistribution, reviews)}<div class="studentReviewGrid">${renderReviewCards(reviews)}</div>` : '<p class="reviewEmpty">Este curso todavía no tiene comentarios publicados.</p>'}</div>
    </section>`;
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

      ${renderCommunityActivity()}

      ${renderNewCoursesSlider()}

      ${renderHomeAvailableCoursesSection()}

      ${renderHomeCourseAdvantages()}

      ${renderStudentTestimonials()}

      ${renderDonationSpotlight()}

      ${renderFreeCertBand()}

      <section class="legalNotice" aria-label="Aviso legal">
        <b>Aviso legal:</b> QAvance es una plataforma independiente de preparación y aprendizaje. Sus certificados internos de finalización no son certificaciones oficiales ni sustituyen syllabus, glosarios, reglas, materiales o exámenes de las entidades certificadoras.
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
    const source = coverage.source || validation.sourceSyllabus || course?.meta?.subtitle || 'Contenido académico de QAvance';
    const version = course?.meta?.versionLabel || course?.meta?.code || activeCourseKey.toUpperCase();
    return `<aside class="courseAcademicTrace" aria-label="Información académica del curso">
      <span><b>Versión:</b> ${h(version)}</span>
      <span><b>Fuente de referencia:</b> ${h(source)}</span>
      <span><b>Actualizado:</b> ${h(updatedAt || 'Fecha no disponible')}</span>
      <span><b>Publicación:</b> QAvance</span>
    </aside>`;
  }

  function renderCourseIntro() {
    const blueprint = course.blueprint || {};
    const details = courseProgressDetails(activeCourseKey, course);
    const finalExamAction = details.finalExamEligible
      ? `<a class="courseAction courseFinalExamAction" href="${h(coursePath(activeCourseKey, 'finalExam'))}" role="button" tabindex="0" data-view="finalExam"><b>🎓 Examen final</b><span class="small">${details.finalExamPassed ? 'Curso aprobado' : 'Habilitado al 95%'}</span></a>`
      : `<button class="courseAction courseFinalExamAction locked" type="button" disabled aria-disabled="true"><b>🎓 Examen final</b><span class="small">Se habilita al 95% verificable · actual ${verifiedProgressPercent(details)}%</span></button>`;
    return `<div class="courseHero">
      <span class="pill">${h(course.meta?.code || activeCourseKey.toUpperCase())}</span>
      <h1>${h(courseLabel())}</h1>
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
    const officialProgress = verifiedProgressPercent(details);
    const weak = Object.entries(progress.byLo || {})
      .filter(([, item]) => number(item.bad) > 0)
      .sort((left, right) => number(right[1].bad) - number(left[1].bad))
      .slice(0, 6);

    return `${renderCourseIntro()}<div class="card">
      <h2>Panel de estudio · ${h(courseLabel())}</h2>
      <div class="grid3">
        <div class="metric"><span>Avance verificado</span><strong>${officialProgress}%</strong><small>Actividad confirmada por QAvance</small></div>
        ${details.hasUnverifiedHistory ? `<div class="metric historicalMetric"><span>Histórico conservado</span><strong>${details.progressPercent}%</strong><small>Referencia anterior · no modifica el avance oficial</small></div>` : ''}
        <div class="metric"><span>Dominio verificado</span><strong>${details.masteryPercent}%</strong><small>Capítulos ${details.chapterDomainAverage}% · examen final ${details.finalExamScore}%</small></div>
        <div class="metric"><span>Tiempo estudiado</span><strong>${h(formatStudyDuration(details.studySeconds))}</strong></div>
        <div class="metric"><span>Mejor simulacro</span><strong>${best}%</strong></div>
        <div class="metric"><span>Examen final</span><strong>${details.finalExamPassed ? 'Aprobado' : details.finalExamEligible ? 'Habilitado' : `Bloqueado · ${FINAL_EXAM_UNLOCK_PROGRESS}%`}</strong></div>
      </div>
      <div class="courseProgressStatus">
        <div><span>Avance oficial</span><strong>${officialProgress}%</strong></div>
        <div class="progressbar accountCourseProgress" aria-label="Avance oficial verificado: ${officialProgress}%"><div style="width:${officialProgress}%"></div></div>
        ${details.hasUnverifiedHistory ? `<p class="historicalProgressNote">Tu histórico de ${details.progressPercent}% permanece protegido y visible, pero no se presenta como avance oficial.</p>` : ''}
      </div>
      <div class="okbox"><b>Ruta recomendada:</b> 1) estudia cada capítulo → 2) practica por LO → 3) refuerza errores → 4) realiza simulacros → 5) presenta el examen final.</div>
      ${last ? `<p><b>Último intento:</b> ${number(last.correct)}/${number(last.total)} (${number(last.scorePct)}%) · ${h(formatDate(last.date))}</p>` : ''}
      <section class="weakTopicsPanel" aria-labelledby="weakTopicsTitle">
        <div class="weakTopicsHead"><div><span class="sectionKicker">Refuerzo personalizado</span><h3 id="weakTopicsTitle">Temas para fortalecer</h3></div><a class="btn" href="${h(coursePath(activeCourseKey, 'practice'))}" data-view="practice">Ir a practicar</a></div>
        ${weak.length ? `<div class="weakTopicsGrid">${weak.map(([lo, item], index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><b>${h(lo)} · ${h(item.objective)}</b><small>${number(item.bad)} respuesta${number(item.bad) === 1 ? '' : 's'} por reforzar</small></div></article>`).join('')}</div>` : '<div class="weakTopicsEmpty"><b>Sin temas débiles registrados</b><p>Cuando practiques, aquí verás recomendaciones directas según tus respuestas verificadas.</p></div>'}
      </section>
      <div class="btnrow">
        <a class="btn" href="${h(coursePath(activeCourseKey, 'study'))}" data-view="study">Empezar a estudiar</a>
        <a class="btn secondary" href="${h(coursePath(activeCourseKey, 'practice'))}" data-view="practice">Practicar por tema</a>
        <a class="btn good" href="${h(coursePath(activeCourseKey, 'exam'))}" data-view="exam">Simulacro</a>
        ${details.finalExamEligible
          ? `<a class="btn warn" href="${h(coursePath(activeCourseKey, 'finalExam'))}" data-view="finalExam">Examen final</a>`
          : `<button class="btn warn" type="button" disabled aria-disabled="true">Examen final · requiere ${FINAL_EXAM_UNLOCK_PROGRESS}%</button>`}
      </div>
    </div>${renderCourseReviewSection()}`;
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
      randomInt,
      activeCourseKey
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
    const progress = getProgress();
    const item = getProgress().byLo?.[lo] || {};
    const ok = number(item.ok, 0);
    const bad = number(item.bad, 0);
    const total = ok + bad;
    const loQuestions = questions.filter((question) => question.lo === lo);
    const evidence = practiceEvidenceIds(course, progress, (question) => question.lo === lo);
    const results = loQuestions
      .map((question) => progress.questionResults?.[question.id])
      .filter(Boolean);
    const uniqueCorrect = results.filter((result) => result.correct).length;
    return {
      ok,
      bad,
      total,
      uniqueAnswered: evidence.size,
      uniqueCorrect,
      questionCount: loQuestions.length,
      coverage: pct(evidence.size, loQuestions.length),
      accuracy: results.length ? pct(uniqueCorrect, results.length) : pct(ok, total)
    };
  }

  function chapterProgressDetails(chapterId) {
    const courseDetails = courseProgressDetails(activeCourseKey, course);
    const authoritativeChapter = courseDetails.chapters.find((chapter) => number(chapter.chapterId) === number(chapterId));
    if (authoritativeChapter) return authoritativeChapter;
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
          <div><span>${chapterProgress.hasUnverifiedHistory ? 'Avance histórico' : 'Avance verificado'}</span><strong>${chapterProgress.coverage}%</strong><small>${chapterProgress.hasUnverifiedHistory ? `Oficial ${chapterProgress.verifiedCoverage}% · ` : ''}${chapterProgress.touched}/${chapterProgress.objectiveCount} LO recorridos</small></div>
          <div><span>Dominio verificado</span><strong>${chapterProgress.verifiedDomain ?? chapterProgress.domain}%</strong><small>${chapterProgress.uniqueCorrect}/${chapterProgress.questionCount} dominadas · ${chapterProgress.uniqueAnswered} únicas respondidas</small></div>
          <div><span>Tiempo</span><strong>${chapterProgress.studyMinutes}/${chapterProgress.suggestedMinutes} min</strong><small>estudiados / sugeridos</small></div>
        </div>
        <div class="chapterProgressBars">
          <div><span>Avance</span><div class="progressbar" aria-label="Avance del capítulo: ${chapterProgress.coverage}%"><div style="width:${chapterProgress.coverage}%"></div></div></div>
          <div><span>Dominio del capítulo</span><div class="progressbar masteryProgress" aria-label="Dominio del capítulo: ${chapterProgress.domain}%"><div style="width:${chapterProgress.domain}%"></div></div></div>
        </div>
        <p>${h(chapter.summary)}</p><span class="chapterOpenAction">Abrir capítulo</span>
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
          <p>Se habilita cuando alcances el ${FINAL_EXAM_UNLOCK_PROGRESS}% de avance verificable. Tu progreso oficial actual es ${verifiedProgressPercent(courseDetails)}%${courseDetails.hasUnverifiedHistory ? ` y conservas ${courseDetails.progressPercent}% como histórico no verificado` : ''}.</p>
          <div class="progressbar" aria-label="Progreso verificable para habilitar el examen final"><div style="width:${verifiedProgressPercent(courseDetails)}%"></div></div>
          <span class="finalExamMilestoneAction">Bloqueado hasta ${FINAL_EXAM_UNLOCK_PROGRESS}%</span>
        </div>`;

    return `<div class="card"><h2>Estudiar syllabus por capítulo</h2><p>Cada capítulo abre en su propia ruta e integra lectura, audio, objetivos y práctica.</p>
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

  function normalizeNarrationText(parts) {
    return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  function splitNarrationText(value, limit = 3_900) {
    const text = String(value || '').trim();
    if (!text) return [];
    const chunks = [];
    let remaining = text;
    while (remaining.length > limit) {
      const window = remaining.slice(0, limit + 1);
      const sentenceBoundary = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '), window.lastIndexOf('; '));
      const wordBoundary = window.lastIndexOf(' ');
      const boundary = sentenceBoundary >= Math.floor(limit * 0.55) ? sentenceBoundary + 1 : wordBoundary >= Math.floor(limit * 0.55) ? wordBoundary : limit;
      chunks.push(remaining.slice(0, boundary).trim());
      remaining = remaining.slice(boundary).trim();
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  }

  function narrationSegmentId(contentId, index, total) {
    return total > 1 ? `${contentId}-part-${index + 1}` : contentId;
  }

  function narrationTextFor(contentId) {
    if (!course) return '';
    if (contentId.startsWith('chapter-reference-')) {
      const chapterId = Number(contentId.slice('chapter-reference-'.length));
      const chapter = course.chapters.find((item) => Number(item.id) === chapterId);
      if (!chapter) return '';
      return normalizeNarrationText([
        `Material de estudio ampliado del capítulo ${chapter.id}. ${chapter.title}.`,
        chapter.completeSyllabusText
      ]);
    }

    if (contentId.startsWith('lo-reference-')) {
      const lo = contentId.slice('lo-reference-'.length);
      const objective = course.objectives.find((item) => String(item.lo).toLowerCase() === lo);
      if (!objective) return '';
      return normalizeNarrationText([
        `Contenido de referencia del objetivo de aprendizaje ${objective.lo}.`,
        objective.sourceText,
        objective.syllabusExtract
      ]);
    }

    if (contentId.startsWith('chapter-')) {
      const chapterId = Number(contentId.slice('chapter-'.length));
      const chapter = course.chapters.find((item) => Number(item.id) === chapterId);
      if (!chapter) return '';
      const sections = (chapter.theorySections || []).flatMap((section) => [
        section.title,
        section.body,
        ...(section.bullets || [])
      ]);
      const caseStudy = chapter.caseStudy ? [
        `Caso práctico: ${chapter.caseStudy.title || ''}`,
        chapter.caseStudy.context,
        chapter.caseStudy.challenge,
        chapter.caseStudy.approach,
        chapter.caseStudy.evidence
      ] : [];
      return normalizeNarrationText([`Capítulo ${chapter.id}. ${chapter.title}.`, chapter.summary, ...sections, ...caseStudy, ...(chapter.examples || [])]);
    }

    if (contentId.startsWith('lo-')) {
      const lo = contentId.slice('lo-'.length);
      const objective = course.objectives.find((item) => String(item.lo).toLowerCase() === lo);
      if (!objective) return '';
      return normalizeNarrationText([
        `Objetivo de aprendizaje ${objective.lo}, nivel ${objective.k}.`,
        objective.text,
        objective.theory,
        objective.remember ? `Recuerda: ${objective.remember}` : '',
        objective.example ? `Escenario práctico: ${objective.example}` : '',
        objective.trap ? `Evita esta confusión: ${objective.trap}` : ''
      ]);
    }
    return '';
  }

  function narrationControls(contentId, label) {
    const active = narrationState.contentId === contentId;
    const status = active ? narrationState.status : 'idle';
    const primaryLabel = status === 'playing' ? 'Pausar' : status === 'paused' ? 'Continuar' : status === 'loading' ? 'Preparando' : 'Escuchar';
    const icon = status === 'playing' ? 'Ⅱ' : '🔊';
    const segmentStatus = active && narrationState.chunks?.length > 1 ? ` · parte ${narrationState.chunkIndex + 1} de ${narrationState.chunks.length}` : '';
    const timeline = narrationTimelineSnapshot(contentId);
    const positionLabel = String(label || 'la narración')
      .replace(/^el\s+/i, 'del ')
      .replace(/^la\s+/i, 'de la ')
      .replace(/^los\s+/i, 'de los ')
      .replace(/^las\s+/i, 'de las ');
    return `<div class="narrationControls" data-narration-controls="${h(contentId)}">
      <button class="narrationPrimary" type="button" data-action="toggle-narration" data-narration-id="${h(contentId)}" data-narration-label="${h(label)}" aria-label="${h(primaryLabel)} ${h(label)}" ${status === 'loading' ? 'disabled' : ''}><span class="narrationIcon" aria-hidden="true">${icon}</span><span class="narrationButtonText">${h(primaryLabel)}</span></button>
      <button class="narrationIconButton" type="button" data-action="repeat-narration" aria-label="Repetir narración" title="Repetir" ${active && narrationState.text ? '' : 'disabled'}>↻</button>
      <div class="narrationSpeed" role="group" aria-label="Velocidad de narración">${[0.75, 1, 1.25].map((speed) => `<button type="button" data-action="narration-speed" data-speed="${speed}" aria-pressed="${narrationState.speed === speed}">${speed}x</button>`).join('')}</div>
      <span class="narrationStatus" aria-live="polite">${status === 'loading' ? `Preparando audio${segmentStatus}...` : active && narrationState.source === 'device' ? 'Voz del dispositivo' : active && narrationState.source === 'cloud' ? `Voz natural QAvance${segmentStatus}` : 'Disponible en texto y audio'}</span>
      <div class="narrationTimeline">
        <input type="range" min="0" max="${timeline.total || 1}" step="0.1" value="${timeline.current}" data-narration-seek="${h(contentId)}" aria-label="Posición ${h(positionLabel)}" aria-valuetext="${h(formatNarrationTime(timeline.current))} de ${h(formatNarrationTime(timeline.total))}" ${timeline.enabled ? '' : 'disabled'}>
        <div class="narrationTimes" aria-hidden="true"><span data-narration-current>${h(formatNarrationTime(timeline.current))}</span><span data-narration-duration>${h(formatNarrationTime(timeline.total))}</span></div>
      </div>
    </div>`;
  }

  function estimatedNarrationDuration(text) {
    const value = String(text || '').trim();
    const words = value.split(/\s+/).filter(Boolean).length;
    const punctuationPauses = (value.match(/[,.!?;:]/g) || []).length;
    return Math.max(1, (words / 2.05) + (punctuationPauses * 0.08));
  }

  function narrationDurations() {
    const segments = narrationState.source === 'device'
      ? narrationState.deviceSegments || []
      : narrationState.chunks || [];
    const knownDurations = narrationState.source === 'device'
      ? narrationState.deviceDurations || []
      : narrationState.chunkDurations || [];
    return segments.map((chunk, index) => {
      const duration = Number(knownDurations[index]);
      return Number.isFinite(duration) && duration > 0 ? duration : estimatedNarrationDuration(chunk);
    });
  }

  function deviceNarrationLocalTime() {
    const durations = narrationDurations();
    const duration = Number(durations[narrationState.deviceIndex]) || 0;
    const running = narrationState.status === 'playing' && narrationState.deviceStartedAt > 0
      ? ((Date.now() - narrationState.deviceStartedAt) / 1_000) * narrationState.speed
      : 0;
    const current = Math.max(0, Number(narrationState.deviceElapsed) || 0) + running;
    if (narrationState.status === 'playing' && current >= duration) {
      narrationState.deviceDurations[narrationState.deviceIndex] = current + 0.75;
      return current;
    }
    return Math.min(duration, current);
  }

  function narrationTimelineSnapshot(contentId = narrationState.contentId) {
    if (!contentId || narrationState.contentId !== contentId || !narrationState.chunks?.length) {
      return { current: 0, total: 0, enabled: false };
    }
    const durations = narrationDurations();
    const activeIndex = narrationState.source === 'device' ? narrationState.deviceIndex : narrationState.chunkIndex;
    const offset = durations.slice(0, activeIndex).reduce((total, duration) => total + duration, 0);
    const localTime = narrationState.source === 'cloud'
      ? (Number.isFinite(narrationAudio.currentTime) ? narrationAudio.currentTime : 0)
      : narrationState.source === 'device' ? deviceNarrationLocalTime() : 0;
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    return {
      current: Math.min(total, Math.max(0, offset + localTime)),
      total,
      enabled: ['cloud', 'device'].includes(narrationState.source) && narrationState.status !== 'loading'
    };
  }

  function formatNarrationTime(value) {
    const totalSeconds = Math.max(0, Math.round(Number(value) || 0));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function narrationPositionAt(globalTime) {
    const durations = narrationDurations();
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    let remaining = Math.min(total, Math.max(0, Number(globalTime) || 0));
    for (let index = 0; index < durations.length; index += 1) {
      const duration = durations[index];
      if (remaining < duration || index === durations.length - 1) {
        return { index, localTime: Math.min(duration, remaining) };
      }
      remaining -= duration;
    }
    return { index: 0, localTime: 0 };
  }

  function updateNarrationTimeline() {
    const timeline = narrationTimelineSnapshot();
    document.querySelectorAll('[data-narration-controls]').forEach((control) => {
      const active = control.dataset.narrationControls === narrationState.contentId;
      const seek = control.querySelector('[data-narration-seek]');
      if (!seek) return;
      const current = active ? timeline.current : 0;
      const total = active ? timeline.total : 0;
      seek.max = String(total || 1);
      seek.disabled = !(active && timeline.enabled);
      if (!(active && narrationSeekActive)) {
        seek.value = String(current);
        seek.setAttribute('aria-valuetext', `${formatNarrationTime(current)} de ${formatNarrationTime(total)}`);
        setTextIfChanged(control.querySelector('[data-narration-current]'), formatNarrationTime(current));
      }
      setTextIfChanged(control.querySelector('[data-narration-duration]'), formatNarrationTime(total));
    });
  }

  function previewNarrationSeek(seek) {
    const control = seek.closest('[data-narration-controls]');
    if (!control || control.dataset.narrationControls !== narrationState.contentId) return;
    const current = Number(seek.value) || 0;
    const total = Number(seek.max) || 0;
    seek.setAttribute('aria-valuetext', `${formatNarrationTime(current)} de ${formatNarrationTime(total)}`);
    setTextIfChanged(control.querySelector('[data-narration-current]'), formatNarrationTime(current));
  }

  function updateNarrationControls() {
    document.querySelectorAll('[data-narration-controls]').forEach((control) => {
      const contentId = control.dataset.narrationControls;
      const active = narrationState.contentId === contentId;
      const status = active ? narrationState.status : 'idle';
      const button = control.querySelector('[data-action="toggle-narration"]');
      const repeat = control.querySelector('[data-action="repeat-narration"]');
      const label = status === 'playing' ? 'Pausar' : status === 'paused' ? 'Continuar' : status === 'loading' ? 'Preparando' : 'Escuchar';
      if (button) {
        button.disabled = status === 'loading';
        setTextIfChanged(button.querySelector('.narrationIcon'), status === 'playing' ? 'Ⅱ' : '🔊');
        setTextIfChanged(button.querySelector('.narrationButtonText'), label);
        const contextLabel = button.dataset.narrationLabel || 'este contenido';
        button.setAttribute('aria-label', `${label} ${contextLabel}`);
      }
      if (repeat) repeat.disabled = !(active && narrationState.text);
      control.querySelectorAll('[data-action="narration-speed"]').forEach((speedButton) => {
        speedButton.setAttribute('aria-pressed', String(Number(speedButton.dataset.speed) === narrationState.speed));
      });
      const statusElement = control.querySelector('.narrationStatus');
      const segmentStatus = active && narrationState.chunks?.length > 1 ? ` · parte ${narrationState.chunkIndex + 1} de ${narrationState.chunks.length}` : '';
      setTextIfChanged(statusElement, status === 'loading'
        ? `Preparando audio${segmentStatus}...`
        : active && narrationState.source === 'device'
          ? 'Voz del dispositivo · avance sincronizado'
          : active && narrationState.source === 'cloud' ? `Voz natural QAvance${segmentStatus}` : 'Disponible en texto y audio');
    });
    updateNarrationTimeline();
  }

  function releaseNarrationAudio() {
    narrationAudio.onended = null;
    narrationAudio.ontimeupdate = null;
    narrationAudio.onloadedmetadata = null;
    narrationAudio.onerror = null;
    narrationAudio.pause();
    narrationAudio.removeAttribute('src');
    narrationAudio.load();
    if (narrationObjectUrl) URL.revokeObjectURL(narrationObjectUrl);
    narrationObjectUrl = '';
  }

  function clearDeviceNarrationTimer() {
    if (narrationDeviceTimer) global.clearInterval(narrationDeviceTimer);
    narrationDeviceTimer = null;
  }

  function startDeviceNarrationTimer() {
    clearDeviceNarrationTimer();
    narrationDeviceTimer = global.setInterval(() => {
      if (narrationState.source !== 'device' || narrationState.status !== 'playing') return;
      updateNarrationTimeline();
    }, 200);
  }

  function freezeDeviceNarrationPosition() {
    if (narrationState.source !== 'device') return;
    narrationState.deviceElapsed = deviceNarrationLocalTime();
    narrationState.deviceStartedAt = 0;
    clearDeviceNarrationTimer();
  }

  function stopNarration() {
    narrationLoadToken += 1;
    releaseNarrationAudio();
    clearDeviceNarrationTimer();
    global.speechSynthesis?.cancel?.();
    narrationSeekActive = false;
    narrationState = {
      ...narrationState,
      contentId: '',
      text: '',
      chunks: [],
      chunkDurations: [],
      chunkIndex: 0,
      deviceSegments: [],
      deviceDurations: [],
      deviceIndex: 0,
      deviceElapsed: 0,
      deviceStartedAt: 0,
      deviceCharIndex: 0,
      deviceUtteranceOffset: 0,
      status: 'idle',
      source: '',
      utterance: null
    };
    updateNarrationControls();
  }

  function spanishDeviceVoice() {
    const voices = (global.speechSynthesis?.getVoices?.() || []).filter((voice) => /^es(?:-|_)/i.test(voice.lang));
    const score = (voice) => {
      const lang = String(voice.lang || '').replace('_', '-').toLowerCase();
      const name = String(voice.name || '');
      let value = 0;
      if (lang === 'es-co') value += 50;
      else if (['es-mx', 'es-us', 'es-419'].includes(lang)) value += 40;
      else if (lang.startsWith('es-')) value += 25;
      if (/natural|neural/i.test(name)) value += 35;
      if (/online|google|microsoft/i.test(name)) value += 20;
      if (voice.localService === false) value += 10;
      return value;
    };
    return voices.sort((left, right) => score(right) - score(left))[0] || null;
  }

  function deviceSegmentSlice(segment, localTime, duration) {
    const source = String(segment || '').trim();
    const words = [...source.matchAll(/\S+/g)];
    if (!words.length || localTime <= 0 || duration <= 0) return { text: source, charOffset: 0 };
    const ratio = Math.min(1, Math.max(0, localTime / duration));
    const wordIndex = Math.min(words.length, Math.ceil(ratio * words.length));
    const charOffset = wordIndex < words.length ? Number(words[wordIndex].index) || 0 : source.length;
    const remainder = source.slice(charOffset);
    const leading = remainder.match(/^[\s,.;:!?¿¡)\]}-]+/)?.[0]?.length || 0;
    return {
      text: remainder.slice(leading).trim(),
      charOffset: Math.min(source.length, charOffset + leading)
    };
  }

  function playWithDeviceVoice({ globalTime = 0, autoplay = true } = {}) {
    if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) throw new Error('Este navegador no ofrece narración local.');
    const deviceSegments = narrationState.deviceSegments?.length
      ? narrationState.deviceSegments
      : splitNarrationText(narrationState.text, DEVICE_NARRATION_CHUNK_LIMIT);
    const deviceDurations = deviceSegments.map((segment, index) => (
      Number(narrationState.deviceDurations?.[index]) || estimatedNarrationDuration(segment)
    ));
    narrationState = { ...narrationState, source: 'device', deviceSegments, deviceDurations };
    const position = narrationPositionAt(globalTime);
    const segment = deviceSegments[position.index];
    if (!segment) return;
    const segmentDuration = deviceDurations[position.index];
    const segmentSlice = deviceSegmentSlice(segment, position.localTime, segmentDuration);
    if (!segmentSlice.text) {
      narrationState = {
        ...narrationState,
        status: 'idle',
        deviceIndex: position.index,
        deviceElapsed: segmentDuration,
        deviceStartedAt: 0,
        deviceCharIndex: segment.length,
        deviceUtteranceOffset: segment.length,
        utterance: null
      };
      updateNarrationControls();
      return;
    }
    const token = ++narrationLoadToken;
    global.speechSynthesis.cancel();
    clearDeviceNarrationTimer();
    const utterance = new global.SpeechSynthesisUtterance(segmentSlice.text);
    utterance.lang = 'es-CO';
    utterance.rate = narrationState.speed;
    const voice = spanishDeviceVoice();
    if (voice) utterance.voice = voice;
    utterance.onboundary = (event) => {
      if (token !== narrationLoadToken || !Number.isFinite(Number(event?.charIndex))) return;
      const absoluteCharIndex = Math.min(segment.length, segmentSlice.charOffset + Number(event.charIndex));
      const currentDuration = Number(narrationState.deviceDurations[position.index]) || segmentDuration;
      narrationState.deviceCharIndex = absoluteCharIndex;
      narrationState.deviceElapsed = currentDuration * (absoluteCharIndex / Math.max(1, segment.length));
      narrationState.deviceStartedAt = Date.now();
      updateNarrationTimeline();
    };
    utterance.onend = () => {
      if (token !== narrationLoadToken) return;
      const completedDuration = Math.max(0.5, deviceNarrationLocalTime());
      narrationState.deviceDurations[position.index] = completedDuration;
      narrationState.deviceElapsed = completedDuration;
      narrationState.deviceStartedAt = 0;
      narrationState.deviceCharIndex = segment.length;
      clearDeviceNarrationTimer();
      if (position.index + 1 < deviceSegments.length) {
        const nextTime = narrationState.deviceDurations.slice(0, position.index + 1).reduce((sum, duration) => sum + duration, 0);
        playWithDeviceVoice({ globalTime: nextTime, autoplay: true });
        return;
      }
      narrationState = {
        ...narrationState,
        status: 'idle',
        deviceIndex: deviceSegments.length - 1,
        deviceElapsed: completedDuration,
        deviceStartedAt: 0,
        utterance: null
      };
      updateNarrationControls();
    };
    utterance.onerror = (event) => {
      if (token !== narrationLoadToken || ['canceled', 'interrupted'].includes(String(event?.error || ''))) return;
      clearDeviceNarrationTimer();
      narrationState = { ...narrationState, status: 'idle', deviceStartedAt: 0, utterance: null };
      updateNarrationControls();
    };
    narrationState = {
      ...narrationState,
      status: autoplay ? 'playing' : 'paused',
      source: 'device',
      utterance: autoplay ? utterance : null,
      deviceIndex: position.index,
      deviceElapsed: position.localTime,
      deviceStartedAt: autoplay ? Date.now() : 0,
      deviceCharIndex: segmentSlice.charOffset,
      deviceUtteranceOffset: segmentSlice.charOffset
    };
    if (autoplay) {
      global.speechSynthesis.speak(utterance);
      startDeviceNarrationTimer();
    }
    updateNarrationControls();
  }

  async function toggleNarration(contentId) {
    if (!contentId) return;
    if (narrationState.contentId === contentId && narrationState.status === 'playing') {
      if (narrationState.source === 'device') {
        freezeDeviceNarrationPosition();
        narrationLoadToken += 1;
        global.speechSynthesis.cancel();
      } else narrationAudio.pause();
      narrationState.status = 'paused';
      updateNarrationControls();
      return;
    }
    if (narrationState.contentId === contentId && narrationState.status === 'paused') {
      if (narrationState.source === 'device') {
        playWithDeviceVoice({ globalTime: narrationTimelineSnapshot().current, autoplay: true });
      } else {
        await narrationAudio.play();
        narrationState.status = 'playing';
        updateNarrationControls();
      }
      return;
    }

    const text = narrationTextFor(contentId);
    if (!text) return;
    const chunks = splitNarrationText(text);
    const deviceSegments = splitNarrationText(text, DEVICE_NARRATION_CHUNK_LIMIT);
    stopNarration();
    narrationState = {
      ...narrationState,
      contentId,
      text,
      chunks,
      chunkDurations: chunks.map(estimatedNarrationDuration),
      chunkIndex: 0,
      deviceSegments,
      deviceDurations: deviceSegments.map(estimatedNarrationDuration),
      deviceIndex: 0,
      deviceElapsed: 0,
      deviceStartedAt: 0,
      deviceCharIndex: 0,
      deviceUtteranceOffset: 0,
      status: 'loading',
      source: '',
      utterance: null
    };
    updateNarrationControls();
    try {
      await playCloudNarrationChunk(0);
    } catch (error) {
      console.warn('Narración natural en caché no disponible; se usará la voz del dispositivo.', error);
      try {
        playWithDeviceVoice();
        notify('La voz en la nube no está disponible; se está usando la voz en español del dispositivo.', 'info', 6_000);
      } catch (fallbackError) {
        narrationState.status = 'idle';
        updateNarrationControls();
        notify(fallbackError?.message || 'No fue posible reproducir la narración.', 'error');
      }
    }
  }

  async function playCloudNarrationChunk(index, { seekTime = 0, autoplay = true } = {}) {
    const chunks = narrationState.chunks || [];
    const chunk = chunks[index];
    if (!chunk) return;
    const loadToken = ++narrationLoadToken;
    releaseNarrationAudio();
    narrationState = { ...narrationState, chunkIndex: index, status: 'loading', source: 'cloud', utterance: null };
    updateNarrationControls();
    const segmentId = narrationSegmentId(narrationState.contentId, index, chunks.length);
    const blob = await Cloud.getCourseAudio(activeCourseKey, segmentId, chunk);
    if (loadToken !== narrationLoadToken) return;
    narrationObjectUrl = URL.createObjectURL(blob);
    narrationAudio.src = narrationObjectUrl;
    narrationAudio.playbackRate = narrationState.speed;
    await new Promise((resolve, reject) => {
      narrationAudio.onloadedmetadata = () => {
        if (loadToken !== narrationLoadToken) return resolve();
        const duration = Number(narrationAudio.duration);
        if (Number.isFinite(duration) && duration > 0) narrationState.chunkDurations[index] = duration;
        narrationAudio.currentTime = Math.min(
          Math.max(0, Number(seekTime) || 0),
          Math.max(0, (Number.isFinite(duration) ? duration : 0) - 0.05)
        );
        updateNarrationTimeline();
        resolve();
      };
      narrationAudio.onerror = () => reject(new Error('No fue posible cargar el audio generado.'));
      narrationAudio.load();
    });
    if (loadToken !== narrationLoadToken) return;
    narrationAudio.ontimeupdate = updateNarrationTimeline;
    narrationAudio.onended = () => {
      if (index + 1 < chunks.length) {
        playCloudNarrationChunk(index + 1).catch((error) => {
          console.warn('No fue posible continuar la narración.', error);
          narrationState.status = 'idle';
          updateNarrationControls();
          notify('La narración se detuvo antes de completar el contenido.', 'error');
        });
        return;
      }
      narrationState.status = 'idle';
      updateNarrationControls();
    };
    narrationState = { ...narrationState, status: autoplay ? 'playing' : 'paused', source: 'cloud' };
    if (autoplay) await narrationAudio.play();
    updateNarrationControls();
  }

  async function seekNarration(globalTime) {
    if (!['cloud', 'device'].includes(narrationState.source)) return;
    if (narrationState.source === 'device') {
      const shouldPlay = narrationState.status === 'playing';
      freezeDeviceNarrationPosition();
      narrationLoadToken += 1;
      global.speechSynthesis?.cancel?.();
      playWithDeviceVoice({ globalTime, autoplay: shouldPlay });
      return;
    }
    if (!narrationState.chunks?.length) return;
    const position = narrationPositionAt(globalTime);
    const shouldPlay = narrationState.status === 'playing';
    if (position.index === narrationState.chunkIndex && narrationAudio.readyState >= 1) {
      narrationAudio.currentTime = Math.min(
        position.localTime,
        Math.max(0, (Number(narrationAudio.duration) || position.localTime) - 0.05)
      );
      if (narrationState.status === 'idle') narrationState.status = 'paused';
      updateNarrationControls();
      return;
    }
    try {
      await playCloudNarrationChunk(position.index, { seekTime: position.localTime, autoplay: shouldPlay });
    } catch (error) {
      console.warn('No fue posible cambiar la posición de la narración.', error);
      notify('No fue posible ir a ese punto de la narración.', 'error');
    }
  }

  function repeatNarration() {
    if (!narrationState.text) return;
    if (narrationState.source === 'device') {
      playWithDeviceVoice({ globalTime: 0, autoplay: true });
      return;
    }
    playCloudNarrationChunk(0).catch(() => notify('No fue posible repetir la narración.', 'error'));
  }

  function setNarrationSpeed(speed) {
    if (![0.75, 1, 1.25].includes(speed)) return;
    const devicePosition = narrationState.source === 'device' ? narrationTimelineSnapshot().current : 0;
    const deviceWasPlaying = narrationState.source === 'device' && narrationState.status === 'playing';
    narrationState.speed = speed;
    narrationAudio.playbackRate = speed;
    if (narrationState.source === 'device' && narrationState.text && ['playing', 'paused'].includes(narrationState.status)) {
      freezeDeviceNarrationPosition();
      narrationLoadToken += 1;
      global.speechSynthesis?.cancel?.();
      playWithDeviceVoice({ globalTime: devicePosition, autoplay: deviceWasPlaying });
    }
    updateNarrationControls();
  }

  function loadReadingScale() {
    try {
      const saved = Number(global.localStorage?.getItem(READING_SCALE_KEY));
      if (Number.isFinite(saved) && saved >= 0.85 && saved <= 1.4) return saved;
    } catch (_) {
      // La preferencia es opcional; la lectura funciona aunque el navegador bloquee el almacenamiento.
    }
    return 1;
  }

  function readingSizeControls() {
    const percent = Math.round(readingScale * 100);
    return `<div class="readingSizeControls" role="group" aria-label="Tamaño del texto de estudio">
      <button type="button" data-action="reading-size" data-delta="-0.1" aria-label="Disminuir tamaño del texto" title="Disminuir texto" ${readingScale <= 0.85 ? 'disabled' : ''}>A−</button>
      <output aria-live="polite" aria-label="Tamaño actual del texto">${percent}%</output>
      <button type="button" data-action="reading-size" data-delta="0.1" aria-label="Aumentar tamaño del texto" title="Aumentar texto" ${readingScale >= 1.4 ? 'disabled' : ''}>A+</button>
    </div>`;
  }

  function updateReadingScaleControls() {
    const chapterReading = document.querySelector('#chapterDetail .chapterReading');
    if (!chapterReading) return;
    chapterReading.style.setProperty('--reading-scale', String(readingScale));
    const output = chapterReading.querySelector('.readingSizeControls output');
    setTextIfChanged(output, `${Math.round(readingScale * 100)}%`);
    chapterReading.querySelectorAll('[data-action="reading-size"]').forEach((button) => {
      const delta = Number(button.dataset.delta);
      button.disabled = delta < 0 ? readingScale <= 0.85 : readingScale >= 1.4;
    });
  }

  function setReadingScale(delta) {
    if (![-0.1, 0.1].includes(delta)) return;
    readingScale = Math.max(0.85, Math.min(1.4, Math.round((readingScale + delta) * 10) / 10));
    try {
      global.localStorage?.setItem(READING_SCALE_KEY, String(readingScale));
    } catch (_) {
      // Mantiene la preferencia durante la sesión aunque no se pueda persistir.
    }
    updateReadingScaleControls();
  }

  function renderCaseStudy(caseStudy) {
    if (!caseStudy) return '';
    return `<section class="courseCaseStudy"><span class="sectionKicker">Caso de trabajo</span><h3>${h(caseStudy.title || 'Escenario de la vida real')}</h3>
      ${caseStudy.context ? `<p><b>Contexto:</b> ${h(caseStudy.context)}</p>` : ''}
      ${caseStudy.challenge ? `<p><b>Reto:</b> ${h(caseStudy.challenge)}</p>` : ''}
      ${caseStudy.approach ? `<p><b>Cómo actuar:</b> ${h(caseStudy.approach)}</p>` : ''}
      ${caseStudy.evidence ? `<p><b>Evidencia esperada:</b> ${h(caseStudy.evidence)}</p>` : ''}
      ${caseStudy.attribution ? `<small>${h(caseStudy.attribution)}</small>` : ''}
    </section>`;
  }

  function renderObjectiveTheory(objective) {
    return `<details class="contentDetails"><summary><b>${h(objective.lo)}</b> · ${h(objective.k)} · ${h(objective.text)}</summary>
      ${narrationControls(`lo-${String(objective.lo).toLowerCase()}`, `el objetivo ${objective.lo}`)}
      <p>${h(objective.theory || 'Teoría específica integrada en el capítulo.')}</p>
      ${objective.remember ? `<p><b>Recuerda:</b> ${h(objective.remember)}</p>` : ''}
      ${objective.trap ? `<p><b>Trampa típica:</b> ${h(objective.trap)}</p>` : ''}
      ${objective.example ? `<p><b>Ejemplo práctico:</b> ${h(objective.example)}</p>${objective.exampleAttribution ? `<small>${h(objective.exampleAttribution)}</small>` : ''}` : ''}
      ${objective.sourceText ? `<div class="sourceStatement"><b>Objetivo de aprendizaje:</b><span>${h(objective.sourceText)}</span></div>` : ''}
      ${objective.syllabusExtract ? `<details><summary>Contenido de referencia</summary>${narrationControls(`lo-reference-${String(objective.lo).toLowerCase()}`, `el contenido de referencia del objetivo ${objective.lo}`)}<div class="prebox small referenceReading">${h(objective.syllabusExtract)}</div>${objective.syllabusSource ? `<div class="sourceMeta sourceReference"><b>Referencia académica:</b> ${h(objective.syllabusSource)}</div>` : ''}</details>` : ''}
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
      <td data-label="Avance">${loProgress.uniqueAnswered ? `${loProgress.uniqueAnswered}/${loProgress.questionCount} preguntas únicas · ${loProgress.accuracy}% precisión` : 'Sin práctica'}</td>
      <td data-label="Acción"><button class="btn secondary" type="button" data-action="practice" data-chapter="${number(id)}" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`;
    }).join('');

    if (options.updateRoute !== false) {
      pushRoute(chapterPath(activeCourseKey, id));
      updateDocumentMetadata();
    }

    host.innerHTML = `<div class="card chapterReading" style="--reading-scale:${readingScale}">
      <a class="chapterBackLink" href="${h(coursePath(activeCourseKey, 'study'))}" data-view="study">Volver al listado de capítulos</a>
      <div class="chapterHeadingRow"><h2>Capítulo ${number(id)} · ${h(chapter.title)}</h2>${readingSizeControls()}</div>${narrationControls(`chapter-${number(id)}`, `el capítulo ${number(id)}`)}<p class="chapterLead">${h(chapter.summary)}</p>
      <div class="grid3 chapterProgressGrid">
        <div class="metric"><span>Avance</span><strong>${progress.coverage}%</strong><small>${progress.touched}/${progress.objectiveCount} LO recorridos</small></div>
        <div class="metric"><span>Dominio del capítulo</span><strong>${progress.domain}%</strong><small>${progress.uniqueCorrect}/${progress.questionCount} dominadas · ${progress.uniqueAnswered} únicas respondidas</small></div>
        <div class="metric"><span>Tiempo estudiado</span><strong>${progress.studyMinutes}/${progress.suggestedMinutes} min</strong><small>estudiados / sugeridos</small></div>
      </div>
      <div class="chapterLearningContent">
        <h3>Aprende este capítulo</h3>${(chapter.theorySections || []).map(renderTheorySection).join('')}
        ${renderCaseStudy(chapter.caseStudy)}
        <details class="contentDetails"><summary>Material de estudio ampliado</summary>${narrationControls(`chapter-reference-${number(id)}`, `el material ampliado del capítulo ${number(id)}`)}<div class="prebox small referenceReading">${h(chapter.completeSyllabusText || 'No hay texto ampliado cargado para este capítulo.')}</div>${chapter.syllabusSource ? `<div class="sourceMeta sourceReference"><b>Referencia académica:</b> ${h(chapter.syllabusSource)}</div>` : ''}</details>
        <h3>Términos clave</h3><div>${(chapter.terms || []).map((term) => `<span class="pill">${h(term)}</span>`).join('')}</div>
        <h3>Objetivos de aprendizaje</h3>${objectives.map(renderObjectiveTheory).join('')}
        <h3>Mapa LO y práctica</h3><table class="table responsiveTable loPracticeTable"><tr><th>LO</th><th>K</th><th>Objetivo</th><th>Preguntas</th><th>Avance</th><th>Acción</th></tr>${rows}</table>
        <h3>Trampas frecuentes</h3><ul>${(chapter.pitfalls || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
        <h3>Ejemplos aplicados</h3><ul>${(chapter.examples || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
        <div class="btnrow"><button class="btn" type="button" data-action="practice" data-chapter="${number(id)}" data-count="20" data-mode="study">Practicar capítulo</button><button class="btn secondary" type="button" data-view="objectives">Ver mapa LO</button></div>
      </div>
    </div>`;
    updateReadingScaleControls();
    startVerifiedLearningActivity('reading', { chapterId: Number(id) });
    if (options.scroll !== false) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderObjectives() {
    const rows = course.objectives.map((objective) => `<tr>
      <td data-label="LO"><b>${h(objective.lo)}</b></td><td data-label="Capítulo">C${number(objective.chapter)}</td><td data-label="K">${h(objective.k)}</td>
      <td data-label="Teoría"><b>${h(objective.text)}</b><br><span class="small">${h(objective.theory || '')}</span>
        ${objective.remember ? `<br><span class="small"><b>Recuerda:</b> ${h(objective.remember)}</span>` : ''}
        ${objective.trap ? `<br><span class="small"><b>Trampa:</b> ${h(objective.trap)}</span>` : ''}
        ${narrationControls(`lo-${String(objective.lo).toLowerCase()}`, `el objetivo ${objective.lo}`)}
        ${objective.sourceText ? `<div class="sourceStatement small"><b>Objetivo de aprendizaje:</b><span>${h(objective.sourceText)}</span></div>` : ''}
        ${objective.syllabusExtract ? `<details><summary class="small"><b>Contenido de referencia</b></summary>${narrationControls(`lo-reference-${String(objective.lo).toLowerCase()}`, `el contenido de referencia del objetivo ${objective.lo}`)}<div class="prebox small referenceReading">${h(objective.syllabusExtract)}</div>${objective.syllabusSource ? `<div class="sourceMeta sourceReference"><b>Referencia académica:</b> ${h(objective.syllabusSource)}</div>` : ''}</details>` : ''}
      </td>
      <td data-label="Preguntas">${questions.filter((question) => question.lo === objective.lo).length}</td>
      <td data-label="Acción"><button class="btn secondary" type="button" data-action="practice" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`).join('');

    return `<div class="card objectivesMap"><h2>Mapa completo de objetivos de aprendizaje</h2><p>Consulta cada objetivo con su capítulo, nivel cognitivo, contenido y acceso directo a práctica.</p><table class="table responsiveTable objectivesTable"><colgroup><col class="loColumn"><col class="chapterColumn"><col class="kColumn"><col class="theoryColumn"><col class="questionColumn"><col class="actionColumn"></colgroup><tr><th>LO</th><th>Cap.</th><th>K</th><th>Teoría del objetivo</th><th>Preguntas</th><th>Acción</th></tr>${rows}</table></div>`;
  }

  function selectedAttr(value, current) {
    return String(value) === String(current) ? ' selected' : '';
  }

  function normalizePracticeFilter(config = {}) {
    const input = { ...DEFAULT_PRACTICE_FILTER, ...(config || {}) };
    const objective = course.objectives.find((item) => item.lo === input.lo);
    const count = Math.max(1, Math.trunc(number(input.count, DEFAULT_PRACTICE_FILTER.count)));

    return {
      chapter: objective ? String(objective.chapter) : String(input.chapter ?? ''),
      k: String(input.k ?? ''),
      lo: objective ? objective.lo : String(input.lo ?? ''),
      count,
      mode: 'study',
      configured: input.configured === true
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

    const emptyState = !filter.configured ? `<div class="practiceEmptyState">
      <picture><source srcset="/assets/img/home/advantages/simulator-640.webp" media="(max-width:720px)"><img src="/assets/img/home/advantages/simulator-1136.webp" width="1136" height="514" alt="Vista del simulador interactivo de QAvance" loading="lazy" decoding="async"></picture>
      <div><span class="sectionKicker">Configura tu sesión</span><h3>Elige qué quieres reforzar</h3><p>Selecciona un capítulo, nivel K u objetivo de aprendizaje. La explicación de cada respuesta permanecerá visible hasta que decidas continuar.</p></div>
    </div>` : practiceFilterSummary(filter, available);
    return `<div class="card"><h2>Práctica personalizada</h2>
      ${emptyState}
      <div class="grid3 practiceFormGrid">
        <div><label for="fChapter">Capítulo</label><select id="fChapter"><option value="all"${selectedAttr('all', filter.chapter)}>Todos los capítulos</option>${chapterOptions}</select></div>
        <div><label for="fK">Nivel K</label><select id="fK"><option value="all"${selectedAttr('all', filter.k)}>Todos los niveles</option>${kOptions}</select></div>
        <div><label for="fCount">Cantidad</label><select id="fCount">${countSelectOptions}</select></div>
      </div>
      <div class="practiceLoControl"><label for="fLo">Objetivo de aprendizaje</label><select id="fLo"><option value="all"${selectedAttr('all', filter.lo)}>Todos los objetivos</option>${objectiveOptions}</select></div>
      <div class="btnrow practiceActionRow"><button class="btn" type="button" data-action="practice-filters" data-mode="study">Comenzar práctica con retroalimentación</button></div>
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
    const filter = normalizePracticeFilter({ ...config, configured: true });
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
      randomInt,
      activeCourseKey
    );
    rememberSessionQuestions(state.session, filter.mode === 'exam' ? 'practice-quiz' : 'practice-study');
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = filter.mode || 'study';
    state.startTime = Date.now();
    state.questionLocked = false;
    activateCourseView('practice');
    dom.app.innerHTML = renderPractice();
    renderSession();
    startVerifiedAssessment('practice', {
      chapterId: filter.chapter === 'all' ? null : Number(filter.chapter)
    });
  }

  function renderSession() {
    const host = $('sessionHost') || dom.app;
    if (!state.session.length) return;

    const question = state.session[state.current];
    const answered = state.answers[question.id] || [];
    if (!state.orders[question.id]) {
      state.orders[question.id] = shuffle(question.options.map((text, originalIndex) => ({ text, originalIndex })));
    }

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
        <button class="btn" type="button" data-action="check-or-next">${state.mode === 'study' ? 'Comprobar respuesta' : 'Guardar / siguiente'}</button>
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
    progress.questionResults = progress.questionResults || {};
    progress.questionResults[question.id] = {
      correct: isCorrect,
      lo: question.lo,
      chapter: question.chapter,
      answeredAt: new Date().toISOString()
    };
    saveProgress(progress);
  }

  function checkOrNext() {
    if (!state.session.length) return;
    if (state.questionLocked) {
      advanceOrFinish();
      return;
    }

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
      const continueButton = document.querySelector('[data-action="check-or-next"]');
      if (continueButton) continueButton.textContent = state.current < state.session.length - 1 ? 'Siguiente pregunta' : 'Ver resultado';
      recordAnswer(question, isCorrect);
      queueVerifiedAnswer(question, answer).catch((error) => console.error(error));
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
    const verifiedCompletion = completeCurrentVerifiedAssessment();
    clearRuntimeTimers({ endLearningActivity: false });

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
    if (Auth?.isAuthenticated?.()) {
      Promise.all([Cloud.flushProgress(activeCourseKey), verifiedCompletion])
        .then(async ([, result]) => {
          if (!result) {
            notify('El resultado quedó guardado en este dispositivo, pero aún no está acreditado en la nube.', 'warning', 8_000);
            return;
          }
          updateEnrollmentSnapshot(result.enrollment);
          await refreshVerifiedLearningDashboard();
          const differsFromLocal = number(result.correct_answers) !== correct
            || number(result.earned_points) !== earned
            || number(result.total_points) !== totalPoints;
          if (differsFromLocal) {
            notify('El servidor corrigió el resultado usando el banco oficial del curso.', 'warning', 8_000);
          }
        })
        .catch((error) => {
          console.error(error);
          notify('El resultado quedó guardado en este dispositivo, pero aún no está acreditado en la nube.', 'warning', 8_000);
        })
        .finally(() => endVerifiedLearningActivity());
    } else {
      endVerifiedLearningActivity();
    }

    const resultLabel = completedFullExam
      ? (passed ? 'Aprobado' : 'No aprobado')
      : (scorePct >= 65 ? 'Bien' : 'Refuerzo');

    const rows = detail.map((item, index) => `<tr>
      <td data-label="#">${index + 1}</td>
      <td data-label="Objetivo"><b>${h(item.question.lo)}</b><br><span class="small">${h(item.question.topic)}</span><br><span class="sourceTag">${number(item.question.points, 1)} punto(s)</span></td>
      <td data-label="Resultado"><span class="answerResult ${item.isCorrect ? 'correct' : 'incorrect'}">${item.isCorrect ? 'Correcta' : 'Incorrecta'}</span></td>
      <td data-label="Respuesta correcta">${item.question.correct.map((correctIndex) => {
        const order = state.orders[item.question.id] || [];
        const displayIndex = order.findIndex((option) => option.originalIndex === correctIndex);
        return `${String.fromCharCode(65 + Math.max(0, displayIndex))}. ${h(item.question.options[correctIndex])}`;
      }).join('<br>')}</td>
      <td data-label="Explicación">${h(item.question.explanation)}</td>
    </tr>`).join('');

    const review = state.mode === 'final-exam'
      ? `<div class="${passed ? 'okbox' : 'badbox'}"><b>${passed ? 'Curso aprobado' : 'Aún no alcanzas la aprobación'}</b><br>${passed ? 'El resultado quedó registrado en tu cuenta.' : 'Revisa las estadísticas por capítulo, refuerza tus temas débiles y vuelve a intentarlo.'}</div>`
      : `<h3>Revisión de respuestas</h3><table class="table responsiveTable resultReviewTable"><tr><th>#</th><th>Objetivo</th><th>Resultado</th><th>Respuesta correcta</th><th>Explicación</th></tr>${rows}</table>`;
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
    if (state.examFocus && state.session.length) {
      return `<div class="examFocusShell" role="region" aria-label="Simulacro en curso"><div id="sessionHost"></div></div>`;
    }

    return `<div class="card examIntro"><span class="sectionKicker">Entrenamiento cronometrado</span><h2>Simulacro ${h(courseLabel())}</h2>
      <p>Responde ${number(blueprint.totalQuestions)} preguntas en ${number(blueprint.minutes)} minutos. Cada intento genera una selección aleatoria alineada con la estructura del curso.</p>
      <ol class="examInstructions"><li>Busca un lugar sin interrupciones.</li><li>Lee cada opción antes de continuar.</li><li>Al finalizar, revisa tus fortalezas y temas por reforzar.</li></ol>
      <div class="examStartSummary"><span><b>${number(blueprint.totalQuestions)}</b> preguntas</span><span><b>${number(blueprint.minutes)}</b> minutos</span><span><b>${number(blueprint.passingScore)}/${number(blueprint.totalPoints || blueprint.totalQuestions)}</b> para aprobar</span></div>
      <div class="btnrow examActionRow"><button class="btn good" type="button" data-action="start-official-exam">Iniciar simulacro</button></div>
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
        <p>Tu avance verificable actual es ${verifiedProgressPercent(details)}%${details.hasUnverifiedHistory ? ` y tu histórico no verificado se conserva en ${details.progressPercent}%` : ''}. Estudia todos los capítulos, cumple el tiempo sugerido y practica sus objetivos de aprendizaje para habilitar el examen final.</p>
        <div class="progressbar accountCourseProgress" aria-label="Progreso verificable para habilitar el examen final"><div style="width:${verifiedProgressPercent(details)}%"></div></div>
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
    activateCourseView('exam');
    setExamFocus(true);
    dom.app.innerHTML = renderExam();
    global.scrollTo({ top: 0, behavior: 'smooth' });
    renderSession();
    startVerifiedAssessment('simulator');
    startCountdown(number(course.blueprint.minutes) * 60);
  }

  function startFinalExam() {
    const details = courseProgressDetails(activeCourseKey, course);
    if (!details.finalExamEligible) {
      notify(`El examen final se habilita cuando alcances el ${FINAL_EXAM_UNLOCK_PROGRESS}% verificable del curso. Tu avance oficial actual es ${verifiedProgressPercent(details)}%.`, 'warning', 8_000);
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
    activateCourseView('finalExam');
    setExamFocus(true);
    dom.app.innerHTML = renderFinalExam();
    global.scrollTo({ top: 0, behavior: 'smooth' });
    renderSession();
    startVerifiedAssessment('final_exam');
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

    return `<div class="card"><h2>Flashcards de glosario, fórmulas y trampas</h2>
      <div class="grid3"><div><label for="flashFilter">Filtrar capítulo</label><select id="flashFilter"><option value="all" ${state.flashFilter === 'all' ? 'selected' : ''}>Todos</option>${chapterOptions}</select></div><div class="metric"><span>Tarjetas visibles</span><strong>${list.length}</strong></div><div class="metric"><span>Actual</span><strong>${state.flashIndex + 1}/${list.length}</strong></div></div>
      <div class="flash" role="button" tabindex="0" data-action="flash-toggle"><div class="front">${h(flashcard.front)}</div><div>${flashcard.kind ? `<span class="pill">${h(flashcard.kind)}</span>` : ''}<span class="pill">C${number(flashcard.chapter)}</span>${flashcard.lo ? `<span class="pill">${h(flashcard.lo)}</span>` : ''}</div>
        ${state.flashShow ? `<div class="back"><b>Significado / explicación:</b><br>${h(flashcard.meaning || flashcard.back)}${flashcard.back && flashcard.meaning && flashcard.back !== flashcard.meaning ? `<br><br>${h(flashcard.back)}` : ''}${flashcard.hint ? `<br><br><b>Pista:</b> ${h(flashcard.hint)}` : ''}</div>` : '<p class="small">Mostrar respuesta para ver el significado y la explicación</p>'}
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
      await refreshSocialSettings();
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
        if (initialRoute.view === 'home') await refreshPublicReviews();
        if (initialRoute.view === 'account' && Auth?.isAuthenticated?.()) await refreshAccount();
        if (initialRoute.view === 'admin' && Auth?.isAuthenticated?.() && Auth?.isAdmin?.()) await refreshAdmin();
        if (initialRoute.view === 'verifyCertificate') {
          const certificateCode = new URLSearchParams(global.location.search || '').get('codigo');
          if (certificateCode) await openCertificateValidation(certificateCode);
        }
      }

      if (initialRoute.view === 'account') await handleCertificatePaymentReturn();

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
      refreshCommunityActivity({ silent: true });
      syncBackToTop();
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
