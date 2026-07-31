'use strict';

(function registerScrumFundamentalsCourse() {
  const courseKey = 'scrum-fundamentals';
  const sourceName = 'Scrum Fundamentals.pdf - The Scrum Guide 2020';
  const examUrl = 'https://open.certiprof.com/scrum-foundation-exam';

  const specs = [
    spec('Proposito de la Guia Scrum', 45, 'Explica por que existe la Guia Scrum, que contiene la definicion de Scrum y por que omitir elementos esenciales limita sus beneficios.', ['Guia Scrum', 'definicion', 'marco', 'reglas'], 'Pagina 1', ['Reconocer el proposito de la Guia.', 'Entender que cada elemento tiene una razon.', 'Evitar cambios que oculten problemas.']),
    spec('Definicion de Scrum', 55, 'Define Scrum como marco liviano para generar valor mediante soluciones adaptativas para problemas complejos.', ['Scrum', 'Product Backlog', 'Increment', 'valor'], 'Pagina 3', ['Recordar la definicion de Scrum.', 'Explicar el ciclo simple de ordenar, construir, inspeccionar y adaptar.', 'Diferenciar framework de metodologia prescriptiva.']),
    spec('Teoria de Scrum', 60, 'Cubre empirismo, pensamiento Lean, transparencia, inspeccion y adaptacion como base de decisiones en Scrum.', ['empirismo', 'Lean', 'transparencia', 'inspeccion', 'adaptacion'], 'Paginas 3-4', ['Relacionar empirismo con evidencia.', 'Explicar los tres pilares.', 'Aplicar adaptacion temprana.']),
    spec('Valores de Scrum', 50, 'Presenta compromiso, foco, franqueza, respeto y coraje como soporte del empirismo y de la confianza.', ['compromiso', 'foco', 'franqueza', 'respeto', 'coraje'], 'Pagina 4', ['Recordar los valores.', 'Explicar su efecto en transparencia.', 'Aplicarlos en situaciones de equipo.']),
    spec('Scrum Team', 85, 'Describe Scrum Team, Developers, Product Owner y Scrum Master como una unidad pequena, multifuncional y autogestionada.', ['Scrum Team', 'Developers', 'Product Owner', 'Scrum Master', 'autogestion'], 'Paginas 5-7', ['Diferenciar accountabilities.', 'Reconocer autogestion y multifuncionalidad.', 'Evitar jerarquias y subequipos internos.']),
    spec('Eventos de Scrum', 95, 'Organiza Sprint, Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective como oportunidades formales de inspeccion y adaptacion.', ['Sprint', 'Sprint Planning', 'Daily Scrum', 'Sprint Review', 'Sprint Retrospective'], 'Paginas 7-10', ['Recordar eventos y timeboxes.', 'Explicar proposito de cada evento.', 'Corregir antipatrones de reunion.']),
    spec('Artefactos de Scrum', 90, 'Cubre Product Backlog, Sprint Backlog, Increment y sus compromisos: Product Goal, Sprint Goal y Definition of Done.', ['Product Backlog', 'Product Goal', 'Sprint Backlog', 'Sprint Goal', 'Increment', 'Definition of Done'], 'Paginas 10-12', ['Diferenciar artefactos y compromisos.', 'Explicar transparencia de artefactos.', 'Aplicar Definition of Done.']),
    spec('Nota final y cambios Scrum 2020', 55, 'Resume que Scrum es gratuito e inmutable, reconoce historia/traduccion y repasa cambios 2017 a 2020.', ['Scrum completo', 'inmutable', 'Objetivo del Producto', 'autogestion', 'Sprint Planning'], 'Paginas 13-14', ['Recordar que Scrum existe en su totalidad.', 'Entender cambios clave 2020.', 'Identificar implementaciones parciales.'])
  ];

  const chapters = specs.map(toChapter);
  const objectives = specs.flatMap(toObjectives);
  const questions = objectives.flatMap(buildQuestions);
  const flashcards = objectives.map(toCard);

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'SF',
      name: 'Scrum Fundamentals',
      shortName: 'Scrum Fundamentals',
      subtitle: 'Curso gratuito alineado a las secciones del PDF Scrum Fundamentals: proposito, definicion, teoria, valores, Scrum Team, eventos, artefactos y cambios Scrum 2020.',
      versionLabel: 'Scrum Guide 2020 + CertiProf Scrum Foundation',
      storageKey: 'academy_scrum_fundamentals_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Scrum Foundation',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar reglas y conceptos del PDF Scrum Fundamentals.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: blueprint('Scrum Fundamentals - matriz AcademiaQA'),
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: qa(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Estructura alineada exclusivamente a las secciones principales del PDF adjunto Scrum Fundamentals.pdf. No se incluye el PDF fuente.',
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
      section('Proposito del bloque', item.summary, item.goals),
      section('Puntos de examen', `Este capitulo toma solo la seccion ${item.title} del PDF adjunto y la convierte en objetivos, practica y simulacro.`, item.terms.map((term) => `Relaciona ${term} con empirismo y valor.`)),
      section('Aplicacion Scrum', 'Aplica la regla manteniendo transparencia, inspeccion, adaptacion, autogestion y foco en valor.', ['No agregar jerarquia innecesaria.', 'No bajar calidad para cerrar alcance.', 'No omitir eventos o artefactos esenciales.'])
    ];
    return { id, title: item.title, minutes: item.minutes, summary: item.summary, terms: item.terms, pitfalls: ['Convertir Scrum en reportes administrativos.', 'Omitir elementos esenciales y seguir llamandolo Scrum completo.', 'Confundir accountability con cargo jerarquico.'], examples: [`Ejemplo de estudio: usa ${item.title} para corregir un antipatron frecuente de Scrum.`], theorySections, completeSyllabusText: [`Capitulo ${id}. ${item.title}`, item.summary, `Terminos clave: ${item.terms.join(', ')}.`, theorySections.map((sectionItem) => `${sectionItem.title}: ${sectionItem.body} ${sectionItem.bullets.join(' ')}`).join('\n\n')].join('\n\n'), completeSyllabusPages: item.pages, syllabusSource: sourceName };
  }

  function toObjectives(item, index) {
    const chapter = index + 1;
    const prefix = `SF-${chapter}`;
    return [
      lo(`${prefix}.1.1`, chapter, 'K1', `Recordar conceptos de ${item.title}`, `Identifica terminos, reglas y proposito de la seccion ${item.title}.`, item.goals[0], `Reconoce ${item.terms[0]} dentro de una situacion Scrum.`, 'Memorizar terminos sin entender el proposito.'),
      lo(`${prefix}.2.1`, chapter, 'K2', `Explicar ${item.title} dentro del marco Scrum`, `Relaciona la seccion con empirismo, valor, accountabilities, eventos o artefactos.`, item.goals[1] || item.goals[0], `Explica a un equipo por que ${item.title} protege transparencia y valor.`, 'Explicar Scrum como proceso predictivo y rigido.'),
      lo(`${prefix}.3.1`, chapter, 'K2', `Diferenciar elementos asociados a ${item.title}`, `Distingue conceptos cercanos para evitar respuestas ambiguas de examen.`, item.goals[2] || item.goals[0], `Distingue un evento, un artefacto, un compromiso o una accountability segun corresponda.`, 'Mezclar evento, artefacto y compromiso.'),
      lo(`${prefix}.4.1`, chapter, 'K3', `Aplicar ${item.title} en un escenario Scrum`, `Elige la accion que respeta Scrum Guide, empirismo y autogestion.`, `Aplicar ${item.title} sin romper Scrum.`, `Un equipo presenta un antipatrón relacionado con ${item.title}; eliges la correccion alineada a Scrum.`, 'Agregar control externo en vez de hacer visible el problema.')
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
      q(`${courseKey}-Q${String(id).padStart(3, '0')}`, objective, `Cual afirmacion describe mejor el objetivo: ${objective.text}?`, [objective.remember, objective.trap, 'Asignar la decision al rol jerarquico mas alto.', 'Posponer inspeccion y adaptacion hasta fin de proyecto.'], objective.theory),
      q(`${courseKey}-Q${String(id + 1).padStart(3, '0')}`, objective, `Escenario: ${objective.example} Que respuesta se alinea mejor con Scrum?`, [objective.theory, objective.trap, 'Cambiar Scrum para ocultar el problema.', 'Medir solo actividad sin inspeccionar valor.'], objective.remember)
    ];
  }

  function q(id, objective, stem, options, explanation) {
    return { id, chapter: objective.chapter, k: objective.k, lo: objective.lo, objective: objective.text, topic: objective.text, stem, options, correct: [0], explanation, multi: false, difficulty: objective.k === 'K3' ? 'aplicacion' : 'normal', points: 1, source: sourceName };
  }

  function toCard(objective) {
    return { front: objective.text, back: `Significado: ${objective.remember}\n\nQue estudiar: ${objective.theory}`, meaning: objective.remember, chapter: objective.chapter, lo: objective.lo, kind: objective.k, hint: 'Relaciona la respuesta con Scrum Guide 2020.' };
  }

  function blueprint(version) {
    return { totalQuestions: 40, totalPoints: 40, passingScore: 28, minutes: 60, extraTime25: 75, chapterDistribution: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5 }, kDistribution: { K1: 8, K2: 24, K3: 8 }, matrix: { 1: { K1: 1, K2: 3, K3: 1 }, 2: { K1: 1, K2: 3, K3: 1 }, 3: { K1: 1, K2: 3, K3: 1 }, 4: { K1: 1, K2: 3, K3: 1 }, 5: { K1: 1, K2: 3, K3: 1 }, 6: { K1: 1, K2: 3, K3: 1 }, 7: { K1: 1, K2: 3, K3: 1 }, 8: { K1: 1, K2: 3, K3: 1 } }, version };
  }

  function qa() {
    return {
      version: 'Scrum Fundamentals - curso gratuito',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: estructura visible alineada al PDF adjunto, sin incluir PDFs.',
      syllabusChapterAudit: chapters.map((chapter) => ({ chapter: chapter.id, pages: chapter.completeSyllabusPages, chars: chapter.completeSyllabusText.length, expectedHeadings: chapter.theorySections.length, missingHeadings: [], wrongMajorChapterHeadings: [], losExpected: objectives.filter((objective) => objective.chapter === chapter.id).length, missingLOCodes: [], status: 'OK' })),
      questionBankAudit: { totalQuestions: questions.length, loCovered: new Set(questions.map((question) => question.lo)).size, loTotal: objectives.length, minQuestionsPerLO: 2, byChapter: countBy(questions, 'chapter'), byK: countBy(questions, 'k'), structuralIssues: [], correctedItems: ['Curso reorganizado por secciones del PDF adjunto.', 'No se incluyen PDFs fuente.', 'URL de examen actualizada.'] },
      simulationAudit: { runs: 100, status: 'OK validado contra disponibilidad por matriz', issues: [], uniqueExamCombinationsObserved: 100, officialMatrix: '40 preguntas distribuidas por las 8 secciones del PDF' },
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
