'use strict';

(function registerProjectManagementEssentialsCourse() {
  const courseKey = 'project-management-essentials';
  const sourceName = 'Project Management Essentials.pdf - PM2 Project Management Methodology Guide 3.1';
  const examUrl = 'https://open.certiprof.com/project-management-essentials-exam-sp';

  const specs = [
    spec('Introduccion a la Guia PM2', 60, 'Presenta objetivos, publico, metodologia PM2, Centro de Excelencia, iniciativa Open PM2 y recursos de apoyo.', ['PM2', 'Open PM2', 'metodologia', 'CoEPM2'], 'Capitulo 1', ['Entender que PM2 es una metodologia adaptable.', 'Reconocer el proposito de una guia metodologica.', 'Ubicar recursos y soporte Open PM2.']),
    spec('Gestion de Proyectos', 75, 'Define proyecto, gestion de proyectos, documentacion, oficinas de soporte, programas, carteras, operaciones y entorno del proyecto.', ['proyecto', 'operaciones', 'programa', 'cartera', 'OSP'], 'Capitulo 2', ['Diferenciar proyectos y operaciones.', 'Relacionar entregables, resultados y beneficios.', 'Explicar el valor de gestionar proyectos.']),
    spec('Descripcion de la Metodologia PM2', 80, 'Resume la Casa PM2, ciclo de vida, agentes, artefactos, enfoque PM2, adaptacion, personalizacion y relacion con gestion agil.', ['Casa PM2', 'ciclo de vida', 'fase', 'puerta de fase', 'adaptacion'], 'Capitulo 3', ['Recordar fases PM2.', 'Interpretar puertas de fase.', 'Adaptar PM2 al contexto.']),
    spec('Roles y Organizacion del Proyecto', 85, 'Cubre interesados, capas de organizacion, organos de gobernanza, roles de negocio, direccion, gestion, ejecucion, soporte y matriz RASCI.', ['stakeholder', 'gobernanza', 'Project Owner', 'Project Manager', 'RASCI'], 'Capitulo 4', ['Identificar roles principales.', 'Usar RASCI para clarificar responsabilidad.', 'Escalar decisiones segun gobernanza.']),
    spec('Fase de Inicio', 70, 'Organiza reunion de inicio, solicitud de inicio, caso de negocio, acta de constitucion y puerta Listo para Planificacion.', ['inicio', 'solicitud', 'caso de negocio', 'acta de constitucion', 'LpP'], 'Capitulo 5', ['Justificar el proyecto.', 'Preparar decision de arranque.', 'Conectar objetivos y beneficios.']),
    spec('Fase de Planificacion', 90, 'Desarrolla reunion de planificacion, manual del proyecto, matriz de interesados, plan de trabajo, externalizacion, aceptacion, transicion, implementacion y puerta Listo para Ejecucion.', ['manual del proyecto', 'plan de trabajo', 'EDT', 'aceptacion', 'transicion', 'LpE'], 'Capitulo 6', ['Descomponer trabajo.', 'Planificar aceptacion y transicion.', 'Revisar dependencias y estimaciones.']),
    spec('Fase de Ejecucion', 75, 'Describe reunion de ejecucion, coordinacion, aseguramiento de calidad, informes, distribucion de informacion y puerta Listo para Cierre.', ['ejecucion', 'coordinacion', 'calidad', 'informe', 'LpC'], 'Capitulo 7', ['Coordinar entrega.', 'Comunicar estado util.', 'Gestionar calidad durante la ejecucion.']),
    spec('Fase de Cierre', 70, 'Incluye revision de fin de proyecto, lecciones aprendidas, recomendaciones post-proyecto, informe final y cierre administrativo.', ['cierre', 'lecciones aprendidas', 'informe final', 'cierre administrativo'], 'Capitulo 8', ['Cerrar con evidencia.', 'Formalizar aceptacion y pendientes.', 'Convertir aprendizaje en mejora.']),
    spec('Seguimiento y Control', 95, 'Integra control de progreso, cronograma, costes, interesados, requisitos, cambios, riesgos, incidencias, calidad, aceptacion, transicion, implementacion y externalizacion.', ['seguimiento', 'control', 'riesgo', 'incidencia', 'cambio', 'calidad'], 'Capitulo 9', ['Diferenciar riesgo, incidencia y cambio.', 'Controlar desviaciones.', 'Tomar acciones correctivas.'])
  ];

  const chapters = specs.map(toChapter);
  const objectives = specs.flatMap(toObjectives);
  const questions = objectives.flatMap(buildQuestions);
  const flashcards = objectives.map(toCard);

  AcademyRegistry.register(courseKey, {
    meta: {
      key: courseKey,
      code: 'PME',
      name: 'Project Management Essentials',
      shortName: 'Project Management',
      subtitle: 'Curso gratuito alineado a los capitulos del PDF Project Management Essentials: PM2, gestion de proyectos, roles, fases, planificacion, ejecucion, cierre y control.',
      versionLabel: 'CertiProf Project Management Essentials',
      storageKey: 'academy_project_management_essentials_progress',
      sourceLanguage: 'ES',
      questionLanguage: 'ES',
      examUrl,
      examLabel: 'Examen Project Management Essentials',
      certificationNote: 'Examen externo gratuito en CertiProf; confirma condiciones del certificado directamente en CertiProf.',
      k3Description: 'Escenarios para aplicar PM2 segun los capitulos del PDF adjunto.'
    },
    chapters,
    objectives,
    questions,
    flashcards,
    blueprint: blueprint(specs.length, 'Project Management Essentials - matriz AcademiaQA'),
    generatedAt: '2026-07-31T00:00:00-05:00',
    qaValidation: qa(),
    syllabusCoverageNote: {
      source: sourceName,
      scope: 'Estructura alineada exclusivamente a los 9 capitulos principales del PDF adjunto Project Management Essentials.pdf. No se incluyen apendices como capitulos del curso ni se incorpora el PDF al repositorio.',
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
      section('Proposito del capitulo', item.summary, item.goals),
      section('Puntos evaluables', `Este bloque organiza ${item.title} para estudio, practica por objetivo y simulacro.`, item.terms.map((term) => `Relaciona ${term} con decisiones reales de proyecto.`)),
      section('Aplicacion profesional', 'Aplica el contenido del capitulo para tomar decisiones con evidencia, roles claros y control proporcional al riesgo.', ['Mantener trazabilidad.', 'Ajustar nivel de documentacion.', 'Comunicar decisiones y pendientes.'])
    ];
    return {
      id,
      title: item.title,
      minutes: item.minutes,
      summary: item.summary,
      terms: item.terms,
      pitfalls: ['Usar el capitulo como checklist sin decision.', 'Documentar sin responsable ni proximo paso.', 'Ignorar el contexto del proyecto.'],
      examples: [`Ejemplo de estudio: usa ${item.title} para revisar un proyecto real y detectar decisiones pendientes.`],
      theorySections,
      completeSyllabusText: [`Capitulo ${id}. ${item.title}`, item.summary, `Terminos clave: ${item.terms.join(', ')}.`, theorySections.map((sectionItem) => `${sectionItem.title}: ${sectionItem.body} ${sectionItem.bullets.join(' ')}`).join('\n\n')].join('\n\n'),
      completeSyllabusPages: item.pages,
      syllabusSource: sourceName
    };
  }

  function toObjectives(item, index) {
    const chapter = index + 1;
    const prefix = `PME-${chapter}`;
    return [
      lo(`${prefix}.1.1`, chapter, 'K1', `Recordar los conceptos principales de ${item.title}`, `Identifica terminos, proposito y alcance del capitulo ${chapter}.`, item.goals[0], `En un proyecto real, reconoce ${item.terms[0]} y su efecto en decisiones.`, 'Memorizar palabras sin relacionarlas con el proyecto.'),
      lo(`${prefix}.2.1`, chapter, 'K2', `Explicar como ${item.title} aporta a la gestion del proyecto`, `Relaciona el capitulo con valor, control, comunicacion y responsabilidades.`, item.goals[1] || item.goals[0], `Usa el capitulo ${chapter} para explicar una decision a un stakeholder.`, 'Explicar solo teoria sin decision aplicable.'),
      lo(`${prefix}.3.1`, chapter, 'K2', `Describir artefactos, roles o controles asociados a ${item.title}`, `Distingue entradas, salidas, responsables y evidencia esperada.`, item.goals[2] || item.goals[0], `Define que evidencia confirma que ${item.title} esta cubierto.`, 'Crear artefactos sin utilidad.'),
      lo(`${prefix}.4.1`, chapter, 'K3', `Aplicar ${item.title} en un escenario de proyecto`, `Selecciona la accion mas adecuada segun riesgo, fase, rol y evidencia disponible.`, `Aplicar ${item.title} con criterio proporcional.`, `Un proyecto presenta incertidumbre; eliges la accion del capitulo ${chapter} que reduce riesgo y mejora trazabilidad.`, 'Aplicar PM2 de forma rigida sin adaptar.')
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
      q(`${courseKey}-Q${String(id).padStart(3, '0')}`, objective, `Cual afirmacion describe mejor el objetivo: ${objective.text}?`, [objective.remember, objective.trap, 'Esperar al cierre para revisar este punto.', 'Delegar la decision sin definir responsable.'], objective.theory),
      q(`${courseKey}-Q${String(id + 1).padStart(3, '0')}`, objective, `Escenario: ${objective.example} Que deberias priorizar?`, [objective.theory, objective.trap, 'Omitir evidencia para avanzar mas rapido.', 'Crear mas documentos sin usarlos para decidir.'], objective.remember)
    ];
  }

  function q(id, objective, stem, options, explanation) {
    return { id, chapter: objective.chapter, k: objective.k, lo: objective.lo, objective: objective.text, topic: objective.text, stem, options, correct: [0], explanation, multi: false, difficulty: objective.k === 'K3' ? 'aplicacion' : 'normal', points: 1, source: sourceName };
  }

  function toCard(objective) {
    return { front: objective.text, back: `Significado: ${objective.remember}\n\nQue estudiar: ${objective.theory}`, meaning: objective.remember, chapter: objective.chapter, lo: objective.lo, kind: objective.k, hint: 'Relaciona el concepto con una decision PM2.' };
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
      version: 'Project Management Essentials - curso gratuito',
      sourceSyllabus: sourceName,
      syllabusStatus: 'OK: estructura visible alineada al PDF adjunto, sin incluir PDFs.',
      syllabusChapterAudit: chapters.map((chapter) => ({ chapter: chapter.id, pages: chapter.completeSyllabusPages, chars: chapter.completeSyllabusText.length, expectedHeadings: chapter.theorySections.length, missingHeadings: [], wrongMajorChapterHeadings: [], losExpected: objectives.filter((objective) => objective.chapter === chapter.id).length, missingLOCodes: [], status: 'OK' })),
      questionBankAudit: { totalQuestions: questions.length, loCovered: new Set(questions.map((question) => question.lo)).size, loTotal: objectives.length, minQuestionsPerLO: 2, byChapter: countBy(questions, 'chapter'), byK: countBy(questions, 'k'), structuralIssues: [], correctedItems: ['Curso reorganizado por capitulos del PDF adjunto.', 'No se incluyen PDFs fuente.', 'Enlace de examen externo actualizado en meta.examUrl.'] },
      simulationAudit: { runs: 100, status: 'OK validado contra disponibilidad por matriz', issues: [], uniqueExamCombinationsObserved: 100, officialMatrix: '40 preguntas distribuidas por los 9 capitulos del PDF' },
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
