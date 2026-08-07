'use strict';

window.ACADEMY_CATALOG = Object.freeze([
  Object.freeze({
    key: 'ctfl',
    src: 'courses/ctfl/course-data.js',
    access: 'free',
    meta: Object.freeze({
      code: 'CTFL',
      name: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)',
      shortName: 'CTFL',
      subtitle: 'Programa offline para estudiar teoría del syllabus, practicar por objetivo de aprendizaje, entrenar técnicas K3 y hacer simulacros aleatorios alineados a la estructura oficial.',
      storageKey: 'istqb_ctfl_v2_progress'
    }),
    counts: Object.freeze({ chapters: 6, objectives: 64, questions: 400 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 26, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-08-06T00:00:00-05:00',
    family: 'ISTQB',
    areas: Object.freeze(['testing-istqb']),
    tags: Object.freeze(['Testing', 'ISTQB', 'Fundamentos'])
  }),
  Object.freeze({
    key: 'ctai',
    src: 'courses/ctai/course-data.js',
    access: 'free',
    meta: Object.freeze({
      code: 'CT-AI',
      name: 'ISTQB® Certificado en Pruebas de IA v2.0 (CT-AI)',
      shortName: 'Certificado en Pruebas de IA v2.0 (CT-AI)',
      subtitle: 'Programa offline en español con teoría ampliada por todos los capítulos del syllabus CT-AI v2.0, objetivos de aprendizaje, flashcards con significado, práctica K2/K3 y simulacro aleatorio alineado a la estructura oficial.',
      storageKey: 'istqb_ctai_v2_progress'
    }),
    counts: Object.freeze({ chapters: 7, objectives: 43, questions: 133 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 29, totalPoints: 44, minutes: 60 }),
    generatedAt: '2026-08-06T00:00:00-05:00',
    family: 'ISTQB',
    areas: Object.freeze(['testing-istqb', 'ai-automation']),
    tags: Object.freeze(['Testing', 'ISTQB', 'Inteligencia artificial'])
  }),
  Object.freeze({
    key: 'ct-genai',
    src: 'courses/ct-genai/course-data.js',
    access: 'free',
    featuredAt: '2026-08-05T00:00:00-05:00',
    meta: Object.freeze({
      code: 'CT-GenAI',
      name: 'ISTQB® Certified Tester - Testing with Generative AI (CT-GenAI)',
      shortName: 'CT-GenAI',
      subtitle: 'Curso gratuito alineado al syllabus ISTQB CT-GenAI v1.1: fundamentos de IA generativa, prompts para testing, riesgos, infraestructura LLM y adopción organizacional.',
      storageKey: 'istqb_ct_genai_progress'
    }),
    counts: Object.freeze({ chapters: 5, objectives: 37, questions: 148 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 30, totalPoints: 46, minutes: 60 }),
    generatedAt: '2026-08-06T00:00:00-05:00',
    family: 'ISTQB',
    areas: Object.freeze(['testing-istqb', 'ai-automation']),
    tags: Object.freeze(['Testing', 'ISTQB', 'IA generativa', 'LLM'])
  }),
  Object.freeze({
    key: 'scrum-master',
    src: 'courses/scrum-master/course-data.js',
    access: 'free',
    meta: Object.freeze({
      code: 'SM 2020',
      name: 'Scrum Master basado en la Scrum Guide 2020',
      shortName: 'Scrum Master',
      subtitle: 'Curso gratuito para estudiar Scrum, responsabilidades, eventos, artefactos y compromisos según la Scrum Guide 2020.',
      storageKey: 'academy_scrum_master_progress'
    }),
    counts: Object.freeze({ chapters: 6, objectives: 30, questions: 49 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 30, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-07-30T00:00:00-05:00',
    family: 'Scrum',
    areas: Object.freeze(['scrum-agility']),
    tags: Object.freeze(['Scrum', 'Scrum Master', 'Agilidad', 'Scrum Guide 2020'])
  }),
  Object.freeze({
    key: 'scrum-product-owner',
    src: 'courses/scrum-product-owner/course-data.js',
    access: 'free',
    meta: Object.freeze({
      code: 'SPOPC',
      name: 'Scrum Product Owner Professional Certification',
      shortName: 'Product Owner',
      subtitle: 'Curso gratuito para preparar el rol Product Owner profesional: Scrum, visión, discovery, backlog, priorización, releases, stakeholders, métricas e IA.',
      storageKey: 'academy_scrum_product_owner_progress'
    }),
    counts: Object.freeze({ chapters: 8, objectives: 32, questions: 64 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 30, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-07-30T00:00:00-05:00',
    family: 'Scrum',
    areas: Object.freeze(['scrum-agility']),
    tags: Object.freeze(['Scrum', 'Product Owner', 'SPOPC', 'Agilidad', 'Producto'])
  }),
  Object.freeze({
    key: 'project-management-essentials',
    src: 'courses/project-management-essentials/course-data.js',
    access: 'free',
    featuredAt: '2026-07-31T01:00:00-05:00',
    meta: Object.freeze({
      code: 'PME',
      name: 'Project Management Essentials',
      shortName: 'Project Management',
      subtitle: 'Curso gratuito alineado a los capítulos del PDF Project Management Essentials: PM2, gestión de proyectos, roles, fases, planificación, ejecución, cierre y control.',
      storageKey: 'academy_project_management_essentials_progress'
    }),
    counts: Object.freeze({ chapters: 9, objectives: 36, questions: 72 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 28, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-07-31T00:00:00-05:00',
    family: 'CertiProf',
    areas: Object.freeze(['project-management']),
    tags: Object.freeze(['Project Management', 'PM2', 'CertiProf', 'Gratis'])
  }),
  Object.freeze({
    key: 'scrum-fundamentals',
    src: 'courses/scrum-fundamentals/course-data.js',
    access: 'free',
    featuredAt: '2026-07-31T02:00:00-05:00',
    meta: Object.freeze({
      code: 'SF',
      name: 'Scrum Fundamentals',
      shortName: 'Scrum Fundamentals',
      subtitle: 'Curso gratuito alineado a las secciones del PDF Scrum Fundamentals: propósito, definición, teoría, valores, Scrum Team, eventos, artefactos y cambios Scrum 2020.',
      storageKey: 'academy_scrum_fundamentals_progress'
    }),
    counts: Object.freeze({ chapters: 8, objectives: 32, questions: 64 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 28, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-07-31T00:00:00-05:00',
    family: 'CertiProf',
    areas: Object.freeze(['scrum-agility']),
    tags: Object.freeze(['Scrum', 'Fundamentos', 'Scrum Guide 2020', 'CertiProf', 'Gratis'])
  }),
  Object.freeze({
    key: 'cybersecurity-awareness',
    src: 'courses/cybersecurity-awareness/course-data.js',
    access: 'free',
    featuredAt: '2026-07-31T03:00:00-05:00',
    meta: Object.freeze({
      code: 'CAPC',
      name: 'Cybersecurity Awareness',
      shortName: 'Cybersecurity',
      subtitle: 'Curso gratuito alineado a los 9 módulos del PDF Cybersecurity Awareness: fundamentos, principios, amenazas, vulnerabilidades, protección, incidentes, políticas y entorno empresarial.',
      storageKey: 'academy_cybersecurity_awareness_progress'
    }),
    counts: Object.freeze({ chapters: 9, objectives: 36, questions: 72 }),
    blueprint: Object.freeze({ totalQuestions: 40, passingScore: 28, totalPoints: 40, minutes: 60 }),
    generatedAt: '2026-07-31T00:00:00-05:00',
    family: 'CertiProf',
    areas: Object.freeze(['cybersecurity']),
    tags: Object.freeze(['Cybersecurity', 'Concientizacion', 'CAPC', 'CertiProf', 'Gratis'])
  })
]);
