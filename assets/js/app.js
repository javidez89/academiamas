'use strict';

(function initAcademyApp(global) {
  const Security = global.AcademySecurity;
  const Registry = global.AcademyRegistry;
  const Storage = global.AcademyStorage;
  const Config = global.ACADEMY_CONFIG || {};
  const ASSET_VERSION = String(Config.assetVersion || '2026-07-31-ct-genai');
  const WOMPI_PAYMENT_URL = 'https://checkout.wompi.co/l/VPOS_52PXST';
  const TRM_API_URL = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde DESC';
  const COFFEE_COP_PER_USD_FALLBACK = 3206.18;
  const COFFEE_TRM_FALLBACK_DATE = '2026-07-30';
  const PAYMENT_POPUP_LOCK_MS = 1_500;
  const CONTACT_EMAIL = 'javidez89@gmail.com';
  const LINKEDIN_URL = 'https://www.linkedin.com/in/javierchilatra89/';
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

  const VIEW_RENDERERS = Object.freeze({
    home: renderHome,
    courses: renderCoursesPage,
    routes: renderRoutesPage,
    contact: renderContactPage,
    legal: renderLegalPage,
    dashboard: renderDashboard,
    study: renderStudy,
    objectives: renderObjectives,
    practice: renderPractice,
    exam: renderExam,
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
      questionLocked: false,
      flashIndex: 0,
      flashShow: false,
      flashFilter: 'all',
      catalogFilter: 'all',
      homePanel: 'overview'
    };
  }

  function $(id) {
    return document.getElementById(id);
  }

  function h(value) {
    return Security.escapeHtml(value);
  }

  function number(value, fallback = 0) {
    return Security.toFiniteNumber(value, fallback);
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
      script.src = versionedAsset(src);
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

  async function loadCourses() {
    const catalog = Array.isArray(global.ACADEMY_CATALOG) ? global.ACADEMY_CATALOG : [];
    if (!catalog.length) throw new Error('El catálogo de cursos está vacío.');

    for (const item of catalog) {
      if (!item || typeof item.src !== 'string') throw new Error('El catálogo contiene una entrada inválida.');
      await loadScript(item.src);
    }

    if (!Registry.keys().length) throw new Error('No se registró ningún curso válido.');
  }

  function bindDom() {
    dom.siteMenu = $('siteMenu');
    dom.siteMenuToggle = document.querySelector('[data-action="toggle-site-menu"]');
    dom.siteHeader = $('inicio');
    dom.app = $('app');
    dom.notice = $('appNotice');
    dom.coffeeModal = $('coffeeModal');
    dom.coffeeCopHint = $('coffeeCopHint');
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
    document.addEventListener('keydown', handleKeyboardActivation);
    global.addEventListener('hashchange', handleHashRoute);

    dom.resetProgress.addEventListener('click', () => {
      if (!course) return;
      if (!global.confirm('¿Borrar estadísticas, intentos y preguntas marcadas para repaso?')) return;
      const ok = Storage.removeProgress(progressStorageKey);
      notify(ok ? 'El avance del curso fue eliminado.' : 'No fue posible borrar el avance.', ok ? 'success' : 'error');
      render();
    });
  }

  function handleKeyboardActivation(event) {
    if (event.key === 'Escape') {
      closeCoffeeModal();
      closeSiteMenu();
      return;
    }

    if (!['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest('[role="button"][data-action], [role="button"][data-view]');
    if (!target) return;
    event.preventDefault();
    target.click();
  }

  function handleClick(event) {
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
      setView(viewButton.dataset.view);
      const href = viewButton.getAttribute('href');
      if (href?.startsWith('#')) global.history?.pushState?.(null, '', href);
      if (anchor) scrollToAnchor(anchor);
      return;
    }

    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    switch (action) {
      case 'select-course':
        setCourse(actionTarget.dataset.course);
        break;
      case 'filter-courses':
        state.catalogFilter = learningRoute(actionTarget.dataset.filter)
          ? actionTarget.dataset.filter
          : 'all';
        if (state.view !== 'courses') setView('courses');
        else render();
        global.setTimeout(() => $('cursos-disponibles')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
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

  function routeFromHash(hash = global.location.hash) {
    const anchor = String(hash || '').replace(/^#/, '') || 'inicio';
    if (['cursos', 'cursos-disponibles'].includes(anchor)) return { view: 'courses', anchor: 'cursos-disponibles' };
    if (anchor === 'ruta-aprendizaje') return { view: 'routes', anchor: 'ruta-aprendizaje' };
    if (['contactanos', 'redes'].includes(anchor)) return { view: 'contact', anchor: 'contactanos' };
    if (['legal', 'privacidad', 'terminos'].includes(anchor)) return { view: 'legal', anchor };
    if (['como-estudiar'].includes(anchor)) return { view: 'home', anchor };
    return { view: 'home', anchor: 'inicio' };
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

  function handleHashRoute() {
    const route = routeFromHash();
    if (state.view !== route.view) setView(route.view);
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
    document.body.classList.remove('modalOpen');
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
    if (state.timer) global.clearInterval(state.timer);
    if (state.pendingAdvance) global.clearTimeout(state.pendingAdvance);
    state.timer = null;
    state.pendingAdvance = null;
  }

  function setCourse(key, options = {}) {
    const normalizedKey = String(key || '').trim().toLowerCase();
    if (!Registry.has(normalizedKey)) {
      notify('La certificación seleccionada no existe o no pasó la validación.', 'error');
      return;
    }

    clearRuntimeTimers();
    activeCourseKey = normalizedKey;
    course = Registry.get(normalizedKey);
    questions = [...course.questions];
    progressStorageKey = course.meta?.storageKey || `academy_${normalizedKey}_progress`;
    state = createState(options.view || 'dashboard');
    Storage.setActiveCourse(normalizedKey);
    updateCourseUi();
    render();
  }

  function setView(view) {
    if (!VIEW_RENDERERS[view]) return;
    if (view !== state.view) clearRuntimeTimers();
    state.view = view;
    if (view === 'home') state.homePanel = 'overview';
    state.session = ['practice', 'exam'].includes(view) ? state.session : [];
    document.querySelectorAll('.navbtn[data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === view);
    });
    render();
  }

  function getProgress() {
    return Storage.getProgress(progressStorageKey);
  }

  function saveProgress(progress) {
    const result = Storage.saveProgress(progressStorageKey, progress);
    if (!result.ok) notify('No fue posible guardar el progreso en este navegador.', 'warning');
  }

  function updateCourseUi() {
    const isPublicView = ['home', 'courses', 'routes', 'contact', 'legal'].includes(state.view);
    const allCourses = Registry.entries();
    const totalBank = allCourses.reduce((sum, [, item]) => sum + (item.questions?.length || 0), 0);
    const freeCourses = allCourses.filter(([key]) => catalogEntry(key)?.access === 'free').length;
    const blueprint = course?.blueprint || {};
    const publicTitles = {
      home: Config.title || 'QA & Testing Academia',
      courses: 'Cursos',
      routes: 'Ruta de aprendizaje',
      contact: 'Contáctanos',
      legal: 'Información legal'
    };
    const publicSubtitles = {
      home: Config.description || 'Selecciona una certificación para iniciar.',
      courses: 'Explora todos los cursos disponibles y entra a la ruta que quieres estudiar.',
      routes: 'Rutas sugeridas para avanzar por testing, IA, Scrum, gestión y ciberseguridad.',
      contact: 'Cuéntanos una idea, problema, error académico o propuesta de colaboración.',
      legal: 'Política de privacidad, términos y condiciones de uso de AcademiaQA.'
    };

    dom.siteHeader?.classList.toggle('homeHeader', isPublicView);
    dom.mainLayout.classList.toggle('homeLayout', isPublicView);
    dom.heroTitle.textContent = isPublicView ? publicTitles[state.view] : courseLabel();
    dom.heroSubtitle.textContent = isPublicView
      ? publicSubtitles[state.view]
      : `Menú de estudio de ${courseLabel()}: teoría, objetivos, práctica, flashcards, estadísticas y simulacro.`;
    dom.topChapters.textContent = isPublicView
      ? `🧭 ${LEARNING_ROUTES.length} rutas de aprendizaje`
      : `📘 ${course.chapters.length} capítulos`;
    dom.topBank.textContent = String(isPublicView ? totalBank : questions.length);
    dom.topExam.textContent = isPublicView
      ? `🎓 ${freeCourses} cursos gratis disponibles`
      : `⏱️ Simulacro ${blueprint.minutes} min / aprueba ${blueprint.passingScore}/${blueprint.totalPoints || blueprint.totalQuestions}`;
    dom.navCaps.textContent = `${course?.chapters?.length || 0} caps`;
    dom.navExamCount.textContent = String(blueprint.totalQuestions || 0);
    dom.footerText.textContent = isPublicView
      ? ''
      : `Hecho para estudio personal · ${courseLabel()} · progreso independiente por certificación.`;
    dom.footerText.hidden = isPublicView;

    const hasK3 = questions.some((question) => question.k === 'K3');
    const hasFlashcards = Array.isArray(course.flashcards) && course.flashcards.length > 0;
    const hasObjectives = Array.isArray(course.objectives) && course.objectives.length > 0;

    document.querySelector('[data-view="k3lab"]').hidden = !hasK3;
    document.querySelector('[data-view="flashcards"]').hidden = !hasFlashcards;
    document.querySelector('[data-view="objectives"]').hidden = !hasObjectives;
  }

  function render() {
    if (!course) return;
    updateCourseUi();
    const renderer = VIEW_RENDERERS[state.view] || VIEW_RENDERERS.home;

    try {
      dom.app.innerHTML = renderer();
    } catch (error) {
      showFatalError(error);
    }
  }

  function courseLabel() {
    return course.meta?.name || course.meta?.shortName || activeCourseKey.toUpperCase();
  }

  function courseAcronym(key, item) {
    return item.meta?.code || item.meta?.shortName || String(key).toUpperCase();
  }

  function courseProgressDetails(key, item) {
    const keyForStorage = item.meta?.storageKey || `academy_${key}_progress`;
    const progress = Storage.getProgress(keyForStorage);
    const attempts = progress.attempts || [];
    const best = attempts.length ? Math.max(...attempts.map((attempt) => number(attempt.scorePct, 0))) : 0;
    const answered = Object.values(progress.byLo || {}).reduce((sum, item) => sum + number(item.ok) + number(item.bad), 0);
    const marked = Array.isArray(progress.marked) ? progress.marked.length : 0;
    const started = attempts.length > 0 || answered > 0 || marked > 0;
    return { attempts, best, last: attempts.at(-1) || null, answered, marked, started };
  }

  function heroProgressCourse() {
    return heroProgressSummary().resumeEntry;
  }

  function heroProgressSummary() {
    const entries = Registry.entries();
    const active = Storage.getActiveCourse();
    const courses = entries.map(([key, item]) => ({ key, item, details: courseProgressDetails(key, item) }));
    const totalCourses = courses.length;
    const startedCourses = courses.filter((entry) => entry.details.started).length;
    const totalAnswered = courses.reduce((sum, entry) => sum + number(entry.details.answered), 0);
    const averageBest = totalCourses
      ? Math.round(courses.reduce((sum, entry) => sum + number(entry.details.best), 0) / totalCourses)
      : 0;
    const bestEntry = [...courses].sort((left, right) => right.details.best - left.details.best)[0] || null;
    const lastEntry = courses
      .filter((entry) => entry.details.last)
      .sort((left, right) => {
        const rightTime = new Date(right.details.last.date).getTime() || 0;
        const leftTime = new Date(left.details.last.date).getTime() || 0;
        return rightTime - leftTime;
      })[0] || null;
    const activeEntry = courses.find((entry) => entry.key === active) || null;
    const resumeEntry = lastEntry || activeEntry || bestEntry || courses[0] || null;

    return {
      courses,
      totalCourses,
      startedCourses,
      totalAnswered,
      averageBest,
      bestEntry,
      lastEntry,
      resumeEntry
    };
  }

  function renderHeroProgressCard() {
    const summary = heroProgressSummary();
    const entry = summary.resumeEntry;
    if (!entry) return '';

    const pctValue = Math.max(0, Math.min(100, number(summary.averageBest, 0)));
    const bestText = summary.bestEntry && summary.bestEntry.details.best > 0
      ? `Mejor: ${coursePublicVersion(summary.bestEntry.key, summary.bestEntry.item)} ${number(summary.bestEntry.details.best)}%`
      : 'Sin simulacros registrados';
    const lastText = summary.lastEntry?.details.last
      ? `Último intento: ${coursePublicVersion(summary.lastEntry.key, summary.lastEntry.item)} · ${formatDate(summary.lastEntry.details.last.date)} · ${number(summary.lastEntry.details.last.scorePct)}%`
      : 'Empieza gratis y guarda tu progreso en este navegador.';
    const actionText = summary.startedCourses ? 'Retomar sesión' : 'Comenzar curso';

    return `<aside class="heroProgressPanel" aria-label="Resumen de progreso">
      <span>Tu progreso general</span>
      <div class="heroProgressTop"><strong>AcademiaQA</strong><b>${pctValue}%</b></div>
      <div class="progressbar heroProgressBar" aria-hidden="true"><div style="width:${pctValue}%"></div></div>
      <div class="heroProgressStats" aria-label="Detalle de progreso general">
        <span>${number(summary.startedCourses)}/${number(summary.totalCourses)} cursos con avance</span>
        <span>${number(summary.totalAnswered)} respuestas</span>
        <span>${h(bestText)}</span>
      </div>
      <p>${h(lastText)}</p>
      <button class="btn heroResume" type="button" data-action="select-course" data-course="${h(entry.key)}">${h(actionText)}</button>
    </aside>`;
  }

  function chapterTitle(id) {
    return course.chapters.find((chapter) => String(chapter.id) === String(id))?.title || `Capítulo ${id}`;
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
    return item.meta?.code || String(key).toUpperCase();
  }

  function catalogEntry(key) {
    const catalog = Array.isArray(global.ACADEMY_CATALOG) ? global.ACADEMY_CATALOG : [];
    return catalog.find((item) => item?.key === key) || {};
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
    return Registry.entries().filter(([key]) => courseMatchesFilter(key, routeKey)).length;
  }

  function renderCatalogFilters() {
    const filters = [{ key: 'all', name: 'Todos', count: Registry.entries().length }]
      .concat(LEARNING_ROUTES.map((route) => ({
        key: route.key,
        name: route.name,
        count: availableCourseCount(route.key)
      })));

    return `<div class="catalogFilters" role="group" aria-label="Filtrar cursos por área">${filters.map((filter) => {
      const active = state.catalogFilter === filter.key;
      return `<button class="catalogFilter${active ? ' active' : ''}" type="button" data-action="filter-courses" data-filter="${h(filter.key)}" aria-controls="courseCatalog" aria-pressed="${active}">
        ${h(filter.name)} <span>${filter.count}</span>
      </button>`;
    }).join('')}</div>`;
  }

  function renderHomeCards() {
    const matchingCourses = Registry.entries().filter(([key]) => courseMatchesFilter(key, state.catalogFilter));
    if (!matchingCourses.length) {
      const route = learningRoute(state.catalogFilter);
      return `<div class="catalogEmpty">
        <span aria-hidden="true">+</span>
        <h3>${h(route?.name || 'Nuevos cursos')}</h3>
        <p>Aún no hay cursos publicados en esta ruta. La categoría ya está preparada para incorporar contenido sin afectar los cursos actuales.</p>
      </div>`;
    }

    return matchingCourses.map(([key, item]) => {
      const blueprint = item.blueprint || {};
      const pass = `${blueprint.passingScore}/${blueprint.totalPoints || blueprint.totalQuestions || 0}`;
      const publicVersion = coursePublicVersion(key, item);
      const catalog = catalogEntry(key);
      const areaNames = (catalog.areas || [])
        .map((areaKey) => learningRoute(areaKey)?.name)
        .filter(Boolean);

      const routeKey = catalog.areas?.includes('ai-automation') ? 'ai-automation' : (catalog.areas || [])[0] || 'testing-istqb';
      const progress = courseProgressDetails(key, item);
      const best = Math.max(0, Math.min(100, number(progress.best, 0)));

      return `<article class="availableCourseCard route-${h(routeKey)}" role="button" tabindex="0" data-action="select-course" data-course="${h(key)}">
        <div class="courseCardTop">
          <span class="statusDot">${catalog.access === 'free' ? 'Gratis' : 'Premium'}</span>
          <strong>${h(publicVersion)}</strong>
        </div>
        <h3>${h(item.meta?.name || key)}</h3>
        <p>${h(item.meta?.subtitle || 'Curso disponible para estudio independiente.')}</p>
        <div class="courseTaxonomy">
          ${areaNames.map((areaName) => `<span>${h(areaName)}</span>`).join('')}
          ${catalog.family ? `<span>${h(catalog.family)}</span>` : ''}
        </div>
        <div class="courseCardProgress">
          <div class="progressbar" aria-hidden="true"><div style="width:${best}%"></div></div>
          <span>${best}%</span>
        </div>
        <div class="courseStatsLine">
          <span>${item.chapters.length} capítulos</span>
          <span>${item.objectives?.length || 0} LO</span>
          <span>${item.questions?.length || 0} preguntas</span>
          <span>Simulacro ${blueprint.totalQuestions || 0}</span>
          <span>Aprueba ${h(pass)}</span>
          <span>Mejor ${best}%</span>
        </div>
        <span class="courseEnter">Entrar al curso</span>
      </article>`;
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
      ${available ? `<button class="routeExplore" type="button" data-action="filter-courses" data-filter="${h(route.key)}" aria-controls="courseCatalog">Ver cursos de esta ruta</button>` : '<b class="routeSoon">Ruta preparada para crecer</b>'}
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
        <button class="btn secondary" type="button" data-action="select-course" data-course="${h(exam.courseKey)}">Entrar al curso</button>
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

  function renderCoffeeButton() {
    return '<button class="btn coffeeCta" type="button">Invítame un café</button>';
  }

  function renderDonationSpotlight() {
    return `<section class="donationSpotlight" aria-labelledby="donationTitle">
      <div class="donationImagePanel">
        <img src="assets/img/academiaqa-support.png" width="1983" height="793" alt="Comunidad QA aprendiendo y apoyando el proyecto AcademiaQA">
      </div>
      <div class="donationCopy">
        <span class="sectionKicker">Apoya el proyecto</span>
        <h2 id="donationTitle">Ayuda a mantener AcademiaQA gratis.</h2>
        <p>Cada aporte impulsa nuevos cursos, simulacros, mejoras móviles y material abierto para la comunidad QA.</p>
        <div class="donationActions">
          ${renderCoffeeButton()}
          <button class="btn secondary" type="button" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</button>
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
          <h2 id="coursesTitle">Cursos disponibles</h2>
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
          <h2 id="routesTitle">Ruta de aprendizaje</h2>
          <p>Estas secuencias son recomendaciones flexibles para avanzar por áreas. Cada ruta puede crecer con nuevos cursos gratuitos o Premium sin afectar tu progreso actual.</p>
        </div>
        <div class="upcomingGrid">${renderUpcomingCards()}</div>
      </section>
    </div>`;
  }

  function renderContactPage() {
    const courseOptions = Registry.entries()
      .map(([key, item]) => `<option value="${h(item.meta?.name || key)}">${h(coursePublicVersion(key, item))} · ${h(item.meta?.name || key)}</option>`)
      .join('');

    return `<div class="publicHome publicPage contactPage">
      <section class="contactHero" id="contactanos" aria-labelledby="contactTitle">
        <div>
          <span class="sectionKicker">Contacto</span>
          <h2 id="contactTitle">Contáctanos</h2>
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

  function renderLegalPage() {
    return `<div class="publicHome publicPage legalPage" id="legal">
      <section class="homeSection" aria-labelledby="legalTitle">
        <div class="sectionIntro">
          <span class="sectionKicker">Información legal</span>
          <h2 id="legalTitle">Política de privacidad y términos de uso</h2>
          <p>AcademiaQA es una plataforma independiente de preparación y aprendizaje. Esta información resume cómo funciona el sitio estático y qué responsabilidades aplican al usarlo.</p>
        </div>
        <div class="legalGrid">
          <article class="legalCard" id="privacidad">
            <h3>Política de privacidad</h3>
            <p>AcademiaQA no solicita cuentas, contraseñas ni datos de tarjeta. El progreso se guarda localmente en tu navegador mediante almacenamiento local y puede borrarse desde las opciones del curso.</p>
            <p>El botón de aportes abre Wompi como servicio externo. Los enlaces a exámenes y canales externos abren sitios de terceros con sus propias políticas.</p>
          </article>
          <article class="legalCard" id="terminos">
            <h3>Términos y condiciones</h3>
            <p>El contenido se ofrece para estudio personal. No garantiza aprobación de certificaciones, no emite certificados y no sustituye materiales, reglas o exámenes oficiales.</p>
            <p>Los cursos, preguntas y simulacros son herramientas educativas. Los exámenes externos, certificados, insignias y condiciones dependen de cada entidad certificadora.</p>
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
    const freeCourseCount = Registry.entries().filter(([key]) => catalogEntry(key)?.access === 'free').length;

    return `<div class="publicHome">
      <section class="landingHero" aria-labelledby="homeMainTitle">
        <div class="landingCopy">
          <span class="landingEyebrow">QA &amp; Testing Academia · ${freeCourseCount} cursos gratis</span>
          <h2 id="homeMainTitle">Prepárate para tu próxima certificación profesional.</h2>
          <p>Aprende la teoría, practica por objetivo y realiza simulacros con seguimiento de progreso. Explora rutas en testing, IA, Scrum y gestión de proyectos.</p>
          <div class="landingActions">
            <a class="btn" href="#ruta-aprendizaje" data-view="routes" data-view-anchor="ruta-aprendizaje">Ruta de aprendizaje</a>
            <button class="btn secondary" type="button" data-action="select-course" data-course="${h(continueCourse)}">Continuar estudiando</button>
            ${renderCoffeeButton()}
          </div>
        </div>
        ${renderHeroProgressCard()}
      </section>

      ${renderStudyPathSection()}

      ${renderDonationSpotlight()}

      ${renderFreeCertBand()}

      <section class="legalNotice" aria-label="Aviso legal">
        <b>Aviso legal:</b> AcademiaQA es una plataforma independiente de preparación y aprendizaje. No emite certificaciones ni sustituye syllabus, glosarios, reglas, materiales o exámenes oficiales de las entidades certificadoras.
        <div class="legalQuickLinks">
          <button class="btn secondary" type="button" data-view="legal" data-view-anchor="privacidad">Política de privacidad</button>
          <button class="btn secondary" type="button" data-view="legal" data-view-anchor="terminos">Términos y condiciones</button>
          <button class="btn" type="button" data-view="contact" data-view-anchor="contactanos">Contáctanos</button>
        </div>
      </section>
    </div>`;
  }

  function renderCourseIntro() {
    const blueprint = course.blueprint || {};
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
        <div class="courseAction" role="button" tabindex="0" data-view="study"><b>📚 Estudiar syllabus</b><span class="small">Capítulos y teoría</span></div>
        <div class="courseAction" role="button" tabindex="0" data-view="objectives"><b>🎯 Objetivos LO</b><span class="small">Mapa de aprendizaje</span></div>
        <div class="courseAction" role="button" tabindex="0" data-view="practice"><b>📝 Practicar</b><span class="small">Por capítulo, LO y nivel</span></div>
        <div class="courseAction" role="button" tabindex="0" data-view="exam"><b>⏱️ Simulacro</b><span class="small">Modo examen</span></div>
        ${course.meta?.examUrl ? `<a class="courseAction courseExternalExam" href="${h(course.meta.examUrl)}" target="_blank" rel="noopener noreferrer"><b>CertiProf Open</b><span class="small">${h(course.meta.certificationNote || 'Examen externo disponible.')}</span></a>` : ''}
      </div>
    </div>`;
  }

  function renderDashboard() {
    const progress = getProgress();
    const attempts = progress.attempts || [];
    const best = attempts.length ? Math.max(...attempts.map((attempt) => number(attempt.scorePct))) : 0;
    const last = attempts.at(-1);
    const totalDone = Object.values(progress.byLo || {}).reduce((sum, item) => sum + number(item.ok) + number(item.bad), 0);
    const weak = Object.entries(progress.byLo || {})
      .filter(([, item]) => number(item.bad) > 0)
      .sort((left, right) => number(right[1].bad) - number(left[1].bad))
      .slice(0, 6);

    return `${renderCourseIntro()}<div class="card">
      <h2>Panel de estudio · ${h(courseLabel())}</h2>
      <div class="grid3">
        <div class="metric"><span>Preguntas activas</span><strong>${questions.length}</strong></div>
        <div class="metric"><span>Mejor simulacro</span><strong>${best}%</strong></div>
        <div class="metric"><span>Preguntas respondidas</span><strong>${totalDone}</strong></div>
      </div>
      <div class="okbox"><b>Ruta recomendada:</b> 1) selecciona certificación → 2) lee capítulo → 3) practica por LO → 4) entrena aplicación → 5) simulacro → 6) refuerza errores.</div>
      ${last ? `<p><b>Último intento:</b> ${number(last.correct)}/${number(last.total)} (${number(last.scorePct)}%) · ${h(formatDate(last.date))}</p>` : ''}
      <div class="grid2">
        <div><h3>Distribución del simulacro</h3>${renderBlueprintTable()}</div>
        <div><h3>Temas débiles</h3>${weak.length ? `<ul>${weak.map(([lo, item]) => `<li><b>${h(lo)}</b> · errores: ${number(item.bad)} · ${h(item.objective)}</li>`).join('')}</ul>` : '<p class="small">Aún no hay errores registrados.</p>'}</div>
      </div>
      <div class="btnrow">
        <button class="btn" type="button" data-view="study">Empezar a estudiar</button>
        <button class="btn secondary" type="button" data-view="practice">Practicar por tema</button>
        <button class="btn good" type="button" data-view="exam">Simulacro</button>
      </div>
    </div>`;
  }

  function renderBlueprintTable() {
    const blueprint = course.blueprint;
    const totalPoints = blueprint.totalPoints || blueprint.totalQuestions;
    const kDistribution = Object.entries(blueprint.kDistribution || {}).map(([key, value]) => `${key}:${value}`).join(' · ');
    const chapterDistribution = Object.entries(blueprint.chapterDistribution || {}).map(([key, value]) => `C${key}:${value}`).join(' · ');

    return `<table class="table">
      <tr><th>Elemento</th><th>Valor</th></tr>
      <tr><td>Preguntas</td><td>${number(blueprint.totalQuestions)}</td></tr>
      <tr><td>Puntos</td><td>${number(totalPoints)}</td></tr>
      <tr><td>Aprobación</td><td>${number(blueprint.passingScore)}/${number(totalPoints)}</td></tr>
      <tr><td>Tiempo</td><td>${number(blueprint.minutes)} min · +25%: ${number(blueprint.extraTime25, Math.ceil(number(blueprint.minutes) * 1.25))} min</td></tr>
      <tr><td>Distribución K</td><td>${h(kDistribution)}</td></tr>
      <tr><td>Capítulos</td><td>${h(chapterDistribution)}</td></tr>
    </table>`;
  }

  function officialMatrix() {
    return course.blueprint.matrix || {};
  }

  function countByChapterAndK(chapter, kLevel) {
    return questions.filter((question) => String(question.chapter) === String(chapter) && question.k === kLevel).length;
  }

  function renderExamBankStats() {
    const matrix = officialMatrix();
    const rows = [];
    let totalRequired = 0;
    const kLevels = Object.keys(course.blueprint.kDistribution || {});

    Object.entries(matrix).forEach(([chapter, distribution]) => {
      kLevels.forEach((kLevel) => {
        const required = number(distribution[kLevel], 0);
        if (!required) return;
        totalRequired += required;
        const available = countByChapterAndK(chapter, kLevel);
        rows.push(`<tr><td>C${h(chapter)} · ${h(chapterTitle(chapter))}</td><td>${h(kLevel)}</td><td>${required}</td><td>${available}</td><td>${available >= required ? '✅' : `⚠️ Faltan ${required - available}`}</td></tr>`);
      });
    });

    if (!rows.length) {
      return `<div class="grid3"><div class="metric"><span>Preguntas disponibles</span><strong>${questions.length}</strong></div><div class="metric"><span>Preguntas</span><strong>${number(course.blueprint.totalQuestions)}</strong></div><div class="metric"><span>Selección</span><strong>Aleatoria</strong></div></div>`;
    }

    return `<div class="grid3">
      <div class="metric"><span>Preguntas disponibles</span><strong>${questions.length}</strong></div>
      <div class="metric"><span>Preguntas del simulacro</span><strong>${totalRequired}</strong></div>
      <div class="metric"><span>Selección</span><strong>Aleatoria</strong></div>
    </div>
    <h3>Disponibilidad por matriz del simulacro</h3>
    <table class="table"><tr><th>Capítulo</th><th>K</th><th>Requiere</th><th>Disponibles</th><th>Estado</th></tr>${rows.join('')}</table>`;
  }

  function buildOfficialSelection() {
    const matrix = officialMatrix();
    const selected = [];
    const used = new Set();
    const warnings = [];
    const kLevels = Object.keys(course.blueprint.kDistribution || {});

    Object.entries(matrix).forEach(([chapter, distribution]) => {
      kLevels.forEach((kLevel) => {
        const needed = number(distribution[kLevel], 0);
        if (!needed) return;
        const pool = shuffle(questions.filter((question) => String(question.chapter) === String(chapter) && question.k === kLevel && !used.has(question.id)));
        const picked = pool.slice(0, needed);
        picked.forEach((question) => {
          selected.push(question);
          used.add(question.id);
        });
        if (picked.length < needed) warnings.push(`C${chapter} ${kLevel}: requiere ${needed}, disponibles ${picked.length}.`);
      });
    });

    const totalQuestions = number(course.blueprint.totalQuestions, 40);
    if (selected.length < totalQuestions) {
      const fill = shuffle(questions.filter((question) => !used.has(question.id))).slice(0, totalQuestions - selected.length);
      selected.push(...fill);
    }

    if (warnings.length) notify(`Las preguntas no cubren toda la matriz. Se completó con preguntas disponibles. ${warnings.join(' ')}`, 'warning', 10_000);
    return shuffle(selected).slice(0, totalQuestions);
  }

  function renderStudy() {
    const cards = course.chapters.map((chapter) => {
      const objectiveCount = course.objectives.filter((objective) => Number(objective.chapter) === Number(chapter.id)).length;
      const questionCount = questions.filter((question) => Number(question.chapter) === Number(chapter.id)).length;
      const progressWidth = Math.min(100, Math.round(number(chapter.minutes) / 390 * 100));

      return `<div class="chapterCard" role="button" tabindex="0" data-action="open-chapter" data-chapter="${number(chapter.id)}">
        <h3>Capítulo ${number(chapter.id)} · ${h(chapter.title)}</h3>
        <p class="small">Tiempo sugerido: ${number(chapter.minutes)} min · LO: ${objectiveCount} · Preguntas: ${questionCount} · Págs. syllabus: ${h(chapter.completeSyllabusPages || 'N/D')}</p>
        <div class="progressbar"><div style="width:${progressWidth}%"></div></div>
        <p>${h(chapter.summary)}</p>
      </div>`;
    }).join('');

    return `<div class="card"><h2>Estudiar syllabus por capítulo</h2><p>Selecciona un capítulo. Cada bloque incluye teoría resumida y el texto evaluable cargado para ese capítulo.</p><div class="grid2">${cards}</div></div><div id="chapterDetail"></div>`;
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

  function openChapter(id) {
    const chapter = course.chapters.find((item) => Number(item.id) === Number(id));
    const host = $('chapterDetail');
    if (!chapter || !host) return;

    const objectives = course.objectives.filter((objective) => Number(objective.chapter) === Number(id));
    const rows = objectives.map((objective) => `<tr>
      <td><b>${h(objective.lo)}</b></td><td>${h(objective.k)}</td><td>${h(objective.text)}</td>
      <td>${questions.filter((question) => question.lo === objective.lo).length}</td>
      <td><button class="btn secondary" type="button" data-action="practice" data-chapter="${number(id)}" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`).join('');

    host.innerHTML = `<div class="card">
      <h2>Capítulo ${number(id)} · ${h(chapter.title)}</h2><p>${h(chapter.summary)}</p>
      <h3>Teoría del syllabus resumida</h3>${(chapter.theorySections || []).map(renderTheorySection).join('')}
      <details open class="contentDetails"><summary>Texto completo evaluable · páginas ${h(chapter.completeSyllabusPages || 'N/D')}</summary><div class="prebox small">${h(chapter.completeSyllabusText || 'No hay texto ampliado cargado para este capítulo.')}</div></details>
      <h3>Términos clave</h3><div>${(chapter.terms || []).map((term) => `<span class="pill">${h(term)}</span>`).join('')}</div>
      <h3>Objetivos de aprendizaje con teoría</h3>${objectives.map(renderObjectiveTheory).join('')}
      <h3>Mapa LO y práctica</h3><table class="table"><tr><th>LO</th><th>K</th><th>Objetivo</th><th>Preguntas</th><th>Acción</th></tr>${rows}</table>
      <h3>Trampas frecuentes</h3><ul>${(chapter.pitfalls || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
      <h3>Ejemplos aplicados</h3><ul>${(chapter.examples || []).map((item) => `<li>${h(item)}</li>`).join('')}</ul>
      <div class="btnrow"><button class="btn" type="button" data-action="practice" data-chapter="${number(id)}" data-count="20" data-mode="study">Practicar capítulo</button><button class="btn secondary" type="button" data-view="objectives">Ver mapa LO</button></div>
    </div>`;
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderObjectives() {
    const rows = course.objectives.map((objective) => `<tr>
      <td><b>${h(objective.lo)}</b></td><td>C${number(objective.chapter)}</td><td>${h(objective.k)}</td>
      <td><b>${h(objective.text)}</b><br><span class="small">${h(objective.theory || '')}</span>
        ${objective.remember ? `<br><span class="small"><b>Recuerda:</b> ${h(objective.remember)}</span>` : ''}
        ${objective.trap ? `<br><span class="small"><b>Trampa:</b> ${h(objective.trap)}</span>` : ''}
        ${objective.syllabusExtract ? `<details><summary class="small"><b>Extracto del syllabus</b></summary><div class="prebox small">${h(objective.syllabusExtract)}</div></details>` : ''}
      </td>
      <td>${questions.filter((question) => question.lo === objective.lo).length}</td>
      <td><button class="btn secondary" type="button" data-action="practice" data-lo="${h(objective.lo)}" data-count="10" data-mode="study">Practicar</button></td>
    </tr>`).join('');

    return `<div class="card"><h2>Mapa completo de objetivos de aprendizaje</h2><p>Esta vista combina teoría, extracto del temario y práctica por objetivo.</p><table class="table"><tr><th>LO</th><th>Cap.</th><th>K</th><th>Teoría del objetivo</th><th>Preguntas</th><th></th></tr>${rows}</table></div>`;
  }

  function renderPractice() {
    const kLevels = Object.keys(course.blueprint.kDistribution || {}).filter((key) => questions.some((question) => question.k === key));
    const chapterOptions = course.chapters.map((chapter) => `<option value="${number(chapter.id)}">C${number(chapter.id)} · ${h(chapter.title)}</option>`).join('');
    const kOptions = kLevels.map((key) => `<option value="${h(key)}">${h(key)}</option>`).join('');
    const objectiveOptions = course.objectives.map((objective) => `<option value="${h(objective.lo)}">${h(objective.lo)} · ${h(objective.k)} · ${h(objective.text)}</option>`).join('');

    return `<div class="card"><h2>Práctica personalizada</h2>
      <div class="grid3">
        <div><label for="fChapter">Capítulo</label><select id="fChapter"><option value="all">Todos</option>${chapterOptions}</select></div>
        <div><label for="fK">Nivel K</label><select id="fK"><option value="all">Todos</option>${kOptions}</select></div>
        <div><label for="fCount">Cantidad</label><select id="fCount"><option>10</option><option>20</option><option selected>40</option><option>60</option></select></div>
      </div>
      <label for="fLo">Objetivo de aprendizaje</label><select id="fLo"><option value="all">Todos los LO</option>${objectiveOptions}</select>
      <div class="btnrow"><button class="btn" type="button" data-action="practice-filters" data-mode="study">Modo estudio</button><button class="btn secondary" type="button" data-action="practice-filters" data-mode="exam">Modo quiz al final</button></div>
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
    const pool = filterQuestions(config);
    if (!pool.length) {
      notify('No hay preguntas con esos filtros.', 'warning');
      return;
    }

    clearRuntimeTimers();
    state.session = shuffle(pool).slice(0, Math.min(number(config.count, 10), pool.length));
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = config.mode || 'study';
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
    const options = state.orders[question.id].map((option) => `<div class="opt ${answered.includes(option.originalIndex) ? 'selected' : ''}" role="button" tabindex="0" data-action="select-option" data-option-index="${option.originalIndex}"><b>${String.fromCharCode(65 + option.originalIndex)}.</b><span>${h(option.text)}</span></div>`).join('');

    host.innerHTML = `<div class="card">
      <div class="qhead"><div><span class="pill">${h(question.id)}</span><span class="pill">C${number(question.chapter)}</span><span class="pill">${h(question.k)}</span><span class="pill">${h(question.lo)}</span><span class="pill">${number(question.points, 1)} pts</span></div><div><b>${state.current + 1}/${state.session.length}</b></div></div>
      <div class="progressbar"><div style="width:${pct(state.current, state.session.length)}%"></div></div>
      <div class="questionBox">
        <div class="qtitle">${h(question.stem)}</div>
        <p class="small">Tema: ${h(question.topic)} · ${question.multi ? 'Puede tener varias respuestas.' : 'Una respuesta correcta.'}${question.source ? ` · Fuente: ${h(question.source)}` : ''}</p>
        <div id="options">${options}</div><div id="feedback" aria-live="polite"></div>
      </div>
      <div class="btnrow">
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
    const progress = getProgress();
    progress.attempts.push({
      date: new Date().toISOString(),
      total: state.session.length,
      totalPoints,
      earned,
      correct,
      scorePct,
      mode: state.mode,
      cert: activeCourseKey
    });
    progress.attempts = progress.attempts.slice(-30);
    saveProgress(progress);

    const passingScore = number(course.blueprint.passingScore, Math.ceil(totalPoints * 0.65));
    const passed = earned >= passingScore;
    const resultLabel = state.session.length === number(course.blueprint.totalQuestions)
      ? (passed ? 'Aprobado' : 'No aprobado')
      : (scorePct >= 65 ? 'Bien' : 'Refuerzo');

    const rows = detail.map((item, index) => `<tr>
      <td>${index + 1}</td>
      <td><b>${h(item.question.lo)}</b><br><span class="small">${h(item.question.topic)}</span><br><span class="sourceTag">${number(item.question.points, 1)} punto(s)</span></td>
      <td>${item.isCorrect ? '✅' : '❌'}</td>
      <td>${item.question.correct.map((correctIndex) => `${String.fromCharCode(65 + correctIndex)}. ${h(item.question.options[correctIndex])}`).join('<br>')}</td>
      <td>${h(item.question.explanation)}</td>
    </tr>`).join('');

    dom.app.innerHTML = `<div class="card"><h2>Resultado</h2>
      <div class="grid3"><div class="metric"><span>Correctas</span><strong>${correct}/${state.session.length}</strong></div><div class="metric"><span>Puntos</span><strong>${earned}/${totalPoints}</strong></div><div class="metric"><span>Estado</span><strong>${h(resultLabel)}</strong></div></div>
      <h3>Revisión</h3><table class="table"><tr><th>#</th><th>LO</th><th>Resultado</th><th>Respuesta correcta</th><th>Explicación</th></tr>${rows}</table>
      <div class="btnrow"><button class="btn" type="button" data-view="practice">Nueva práctica</button><button class="btn secondary" type="button" data-view="analytics">Ver estadísticas</button></div>
    </div>`;
    state.session = [];
  }

  function renderExam() {
    const blueprint = course.blueprint;
    const kText = Object.entries(blueprint.kDistribution || {}).filter(([, value]) => number(value) > 0).map(([key, value]) => `${key}=${value}`).join(', ');
    return `<div class="card"><h2>Simulacro ${h(courseLabel())}</h2>
      <p>Genera ${number(blueprint.totalQuestions)} preguntas aleatorias desde las preguntas activas, respetando la matriz por capítulo y nivel K cuando hay suficientes preguntas.</p>
      ${renderBlueprintTable()}${renderExamBankStats()}
      <div class="note"><b>Preguntas activas:</b> ${questions.length}. <b>Regla:</b> se seleccionan ${number(blueprint.totalQuestions)} aleatorias (${h(kText)}). La aprobación usa puntos: ${number(blueprint.passingScore)}/${number(blueprint.totalPoints || blueprint.totalQuestions)}.</div>
      <div class="btnrow"><button class="btn good" type="button" data-action="start-official-exam">Iniciar simulacro aleatorio</button><button class="btn secondary" type="button" data-action="practice" data-count="${number(blueprint.totalQuestions)}" data-mode="exam">Simulacro aleatorio libre</button></div>
    </div><div id="sessionHost"></div>`;
  }

  function startOfficialExam() {
    clearRuntimeTimers();
    state.session = buildOfficialSelection();
    if (!state.session.length) {
      notify('No fue posible construir el simulacro.', 'error');
      return;
    }
    state.current = 0;
    state.answers = {};
    state.orders = {};
    state.mode = 'exam';
    state.startTime = Date.now();
    state.questionLocked = false;
    state.view = 'exam';
    dom.app.innerHTML = renderExam();
    renderSession();
    startCountdown(number(course.blueprint.minutes) * 60);
  }

  function startCountdown(seconds) {
    const box = document.createElement('div');
    box.id = 'timerBox';
    box.className = 'card';
    dom.app.prepend(box);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1_000);
      const left = Math.max(0, seconds - elapsed);
      const minutes = Math.floor(left / 60);
      const remainingSeconds = left % 60;
      box.textContent = `⏱️ Tiempo restante: ${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
      box.style.fontWeight = '850';
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
      <div class="btnrow"><button class="btn secondary" type="button" data-action="flash-previous">Anterior</button><button class="btn" type="button" data-action="flash-next">Siguiente</button><button class="btn secondary" type="button" data-action="flash-random">Aleatoria</button><button class="btn secondary" type="button" data-action="practice" data-chapter="${number(flashcard.chapter)}" data-lo="${h(flashcard.lo || 'all')}" data-count="10" data-mode="study">Practicar este LO</button></div>
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

  async function bootstrap() {
    bindDom();
    bindEvents();

    try {
      await loadCourses();
      const requestedKey = Storage.getActiveCourse();
      const initialKey = Registry.has(requestedKey) ? requestedKey : Registry.keys()[0];
      const initialRoute = routeFromHash();
      setCourse(initialKey, { view: initialRoute.view });
      scrollToAnchor(initialRoute.anchor);
      if (!Storage.available()) notify('El navegador no permite guardar progreso local. La academia seguirá funcionando sin persistencia.', 'warning', 10_000);
    } catch (error) {
      showFatalError(error);
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
}(window));
