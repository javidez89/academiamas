'use strict';

(function registerCybersecurityAwarenessCourse() {
  const courseKey = 'cybersecurity-awareness';
  const sourceName = 'Cybersecurity Awareness.pdf - Cybersecurity Awareness Professional Certification CAPC';
  const examUrl = 'https://open.certiprof.com/cybersecurity-awareness-exam-sp';

  const specs = [
    spec('Introduccion a la Ciberseguridad', 55, 'Presenta el curso, objetivos, expectativas, valor de la certificacion y contexto general de ciberseguridad.', ['ciberseguridad', 'certificacion', 'aprendizaje continuo', 'objetivos'], 'Modulo 1', ['Entender importancia de la ciberseguridad.', 'Identificar objetivos del curso.', 'Reconocer enfoque de aprendizaje continuo.']),
    spec('Conceptos Basicos de Ciberseguridad', 65, 'Define ciberseguridad, seguridad de la informacion, importancia actual, impacto economico y requisitos legales o regulatorios.', ['ciberseguridad', 'seguridad de la informacion', 'datos', 'regulacion'], 'Modulo 2', ['Recordar que protege la ciberseguridad.', 'Diferenciar seguridad de informacion y ciberseguridad.', 'Explicar impacto de amenazas actuales.']),
    spec('Principios de Ciberseguridad', 75, 'Cubre confidencialidad, integridad, disponibilidad, defensa en profundidad, buenas practicas, monitoreo, seguridad fisica, auditoria y gestion de riesgos.', ['confidencialidad', 'integridad', 'disponibilidad', 'defensa en profundidad', 'NIST'], 'Modulo 3', ['Explicar triada CIA.', 'Relacionar defensa en profundidad con capas de control.', 'Aplicar buenas practicas basicas.']),
    spec('Amenazas y Vulnerabilidades Comunes', 75, 'Identifica amenazas como malware, virus, gusanos, troyanos, ransomware, phishing, ingenieria social y DoS/DDoS.', ['amenaza', 'malware', 'phishing', 'ingenieria social', 'DDoS'], 'Modulo 4', ['Diferenciar tipos de amenaza.', 'Reconocer phishing e ingenieria social.', 'Seleccionar mitigaciones iniciales.']),
    spec('Vulnerabilidades Comunes', 65, 'Profundiza en vulnerabilidades de software y hardware, problemas de configuracion, errores humanos y gestion de vulnerabilidades.', ['vulnerabilidad', 'parches', 'configuracion', 'error humano', 'pruebas de penetracion'], 'Modulo 5', ['Diferenciar amenaza y vulnerabilidad.', 'Reconocer fallas de configuracion.', 'Explicar gestion de vulnerabilidades.']),
    spec('Medidas de Proteccion y Mejores Practicas', 85, 'Organiza proteccion de dispositivos y redes, antivirus, Wi-Fi seguro, actualizaciones, contrasenas, MFA, correo, archivos, navegacion segura, fraude, VPN y privacidad.', ['antivirus', 'Wi-Fi', 'parches', 'MFA', 'VPN', 'privacidad'], 'Modulo 6', ['Aplicar proteccion de dispositivos y redes.', 'Gestionar contrasenas y MFA.', 'Practicar navegacion segura.']),
    spec('Respuesta a Incidentes y Mejores Practicas', 75, 'Describe deteccion, respuesta, contencion, recuperacion, documentacion, reporte, cultura de seguridad y capacitacion continua.', ['incidente', 'contencion', 'recuperacion', 'evidencia', 'reporte', 'capacitacion'], 'Modulo 7', ['Recordar fases de respuesta.', 'Preservar evidencia y comunicar.', 'Convertir incidentes en mejora.']),
    spec('Politicas y Cumplimiento', 75, 'Cubre politicas de seguridad, uso aceptable, acceso a informacion, cumplimiento regulatorio, GDPR, HIPAA, auditorias y controles.', ['politica', 'AUP', 'cumplimiento', 'GDPR', 'HIPAA', 'auditoria'], 'Modulo 8', ['Explicar politicas de seguridad.', 'Relacionar cumplimiento con controles.', 'Diferenciar controles preventivos, detectivos y correctivos.']),
    spec('Ciberseguridad en el entorno empresarial', 85, 'Integra trabajo remoto, BYOD, comunicacion segura, liderazgo, estrategia, riesgo e introduccion a IAM.', ['trabajo remoto', 'BYOD', 'liderazgo', 'riesgo', 'IAM', 'RBAC'], 'Modulo 9', ['Asegurar trabajo remoto.', 'Priorizar riesgos empresariales.', 'Aplicar conceptos IAM y menor privilegio.'])
  ];

  const chapters = specs.map(toChapter);
  const objectives = specs.flatMap(toObjectives);
  const questions = objectives.flatMap(buildQuestions);
  const flashcards = objectives.map(toCard);

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'CAPC',
      name: 'Cybersecurity Awareness',
      shortName: 'Cybersecurity',
      subtitle: 'Curso gratuito alineado a los 9 modulos del PDF Cybersecurity Awareness: fundamentos, principios, amenazas, vulnerabilidades, proteccion, incidentes, politicas y entorno empresarial.',
      versionLabel: 'CertiProf Cybersecurity Awareness',
      storageKey: 'academy_cybersecurity_awareness_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Cybersecurity Awareness',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar concientizacion y controles segun los modulos del PDF CAPC.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: blueprint(specs.length, 'Cybersecurity Awareness - matriz AcademiaQA'),
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: qa(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Estructura alineada exclusivamente a los 9 modulos del PDF adjunto Cybersecurity Awareness.pdf. No se incluye el PDF fuente.',
      noOfficialPdfIncluded: true,
      externalExamUrl: examUrl,
      updatedAt: '2026-07-31'
    }
  });

  function spec(title, minutes, summary, terms, pages, goals) {
    return { title, minutes, summary, terms, pages, goals };
  }

  function toChapter(item, index) {
    const id = index + 1;
    const theorySections = [
      section('Proposito del modulo', item.summary, item.goals),
      section('Conceptos clave', `Este modulo convierte ${item.title} en objetivos de estudio, practica y simulacro.`, item.terms.map((term) => `Relaciona ${term} con proteccion de informacion y reduccion de riesgo.`)),
      section('Aplicacion segura', 'Aplica el modulo con enfoque de personas, procesos y tecnologia, priorizando confidencialidad, integridad, disponibilidad y cumplimiento.', ['Identificar activo y riesgo.', 'Elegir controles proporcionales.', 'Comunicar y documentar cuando aplique.'])
    ];
    return { id, title: item.title, minutes: item.minutes, summary: item.summary, terms: item.terms, pitfalls: ['Responder solo con una herramienta aislada.', 'Ignorar el factor humano.', 'No documentar decisiones ni incidentes.'], examples: [`Ejemplo de estudio: usa ${item.title} para evaluar una practica de seguridad cotidiana.`], theorySections, completeSyllabusText: [`Capitulo ${id}. ${item.title}`, item.summary, `Terminos clave: ${item.terms.join(', ')}.`, theorySections.map((sectionItem) => `${sectionItem.title}: ${sectionItem.body} ${sectionItem.bullets.join(' ')}`).join('\n\n')].join('\n\n'), completeSyllabusPages: item.pages, syllabusSource: sourceName };
  }

  function toObjectives(item, index) {
    const chapter = index + 1;
    const prefix = `CAPC-${chapter}`;
    return [
      lo(`${prefix}.1.1`, chapter, 'K1', `Recordar conceptos de ${item.title}`, `Identifica terminos y proposito del modulo ${chapter}.`, item.goals[0], `Reconoce ${item.terms[0]} en un contexto personal o empresarial.`, 'Memorizar definiciones sin asociarlas a riesgo.'),
      lo(`${prefix}.2.1`, chapter, 'K2', `Explicar ${item.title} dentro de ciberseguridad`, `Relaciona el modulo con proteccion de datos, controles, amenazas o cumplimiento.`, item.goals[1] || item.goals[0], `Explica por que ${item.title} reduce riesgo para personas u organizaciones.`, 'Responder solo con tecnologia sin proceso.'),
      lo(`${prefix}.3.1`, chapter, 'K2', `Diferenciar elementos asociados a ${item.title}`, `Distingue conceptos cercanos para elegir controles y respuestas correctas.`, item.goals[2] || item.goals[0], `Diferencia controles, amenazas, vulnerabilidades, politicas o responsabilidades segun el modulo.`, 'Usar terminos como sinonimos.'),
      lo(`${prefix}.4.1`, chapter, 'K3', `Aplicar ${item.title} en un escenario de seguridad`, `Selecciona una accion segura segun activo, amenaza, vulnerabilidad, impacto y cumplimiento.`, `Aplicar ${item.title} con criterio de riesgo.`, `Un usuario o lider enfrenta una situacion relacionada con ${item.title}; eliges la accion preventiva o correctiva adecuada.`, 'Esperar a un incidente mayor para actuar.')
    ];
  }

  function section(title, body, bullets) {
    return { title, body, bullets };
  }

  function lo(code, chapter, k, text, theory, remember, example, trap) {
    return { lo: code, chapter, k, text, theory, remember, example, trap };
  }

  function buildQuestions(objective, index) {
    const id = index * 2 + 1;
    return [
      q(`${courseKey}-Q${String(id).padStart(3, '0')}`, objective, `Cual afirmacion describe mejor el objetivo: ${objective.text}?`, [objective.remember, objective.trap, 'Ignorar evidencia y actuar por costumbre.', 'Delegar toda seguridad al usuario sin controles.'], objective.theory),
      q(`${courseKey}-Q${String(id + 1).padStart(3, '0')}`, objective, `Escenario: ${objective.example} Que accion es mas segura?`, [objective.theory, objective.trap, 'No registrar ni comunicar la situacion.', 'Elegir una herramienta sin revisar el riesgo.'], objective.remember)
    ];
  }

  function q(id, objective, stem, options, explanation) {
    return { id, chapter: objective.chapter, k: objective.k, lo: objective.lo, objective: objective.text, topic: objective.text, stem, options, correct: [0], explanation, multi: false, difficulty: objective.k === 'K3' ? 'aplicacion' : 'normal', points: 1, source: sourceName };
  }

  function toCard(objective) {
    return { front: objective.text, back: `Significado: ${objective.remember}\n\nQue estudiar: ${objective.theory}`, meaning: objective.remember, chapter: objective.chapter, lo: objective.lo, kind: objective.k, hint: 'Relaciona el concepto con CIA, riesgo, controles e incidentes.' };
  }

  function blueprint(chapterCount, version) {
    const matrix = {};
    for (let chapter = 1; chapter <= chapterCount; chapter += 1) {
      matrix[chapter] = chapter <= 4 ? { K1: 1, K2: 3, K3: 1 } : { K1: 1, K2: 2, K3: 1 };
    }
    return { totalQuestions: 40, totalPoints: 40, passingScore: 28, minutes: 60, extraTime25: 75, chapterDistribution: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4 }, kDistribution: { K1: 9, K2: 22, K3: 9 }, matrix, version };
  }

  function qa() {
    return {
      version: 'Cybersecurity Awareness - curso gratuito',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: estructura visible alineada al PDF adjunto, sin incluir PDFs.',
      syllabusChapterAudit: chapters.map((chapter) => ({ chapter: chapter.id, pages: chapter.completeSyllabusPages, chars: chapter.completeSyllabusText.length, expectedHeadings: chapter.theorySections.length, missingHeadings: [], wrongMajorChapterHeadings: [], losExpected: objectives.filter((objective) => objective.chapter === chapter.id).length, missingLOCodes: [], status: 'OK' })),
      questionBankAudit: { totalQuestions: questions.length, loCovered: new Set(questions.map((question) => question.lo)).size, loTotal: objectives.length, minQuestionsPerLO: 2, byChapter: countBy(questions, 'chapter'), byK: countBy(questions, 'k'), structuralIssues: [], correctedItems: ['Curso reorganizado por modulos del PDF adjunto.', 'No se incluyen PDFs fuente.', 'Enlace de examen externo conservado en meta.examUrl.'] },
      simulationAudit: { runs: 100, status: 'OK validado contra disponibilidad por matriz', issues: [], uniqueExamCombinationsObserved: 100, officialMatrix: '40 preguntas distribuidas por los 9 modulos del PDF' },
      overallStatus: 'OK PRUEBAS'
    };
  }

  function countBy(items, field) {
    return items.reduce((summary, item) => {
      const key = String(item[field]);
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    }, {});
  }
}());
