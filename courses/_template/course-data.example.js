'use strict';

/*
  1. Copia esta carpeta con un nombre corto, por ejemplo: courses/scrum-master/
  2. Renombra este archivo a course-data.js.
  3. Completa el objeto respetando el esquema.
  4. Agrega la ruta en courses/catalog.js.
  5. Declara el alcance y las referencias del curso en courses/source-documents.js.
*/

AcademyRegistry.register('curso-ejemplo', {
  meta: {
    key: 'curso-ejemplo',
    code: 'EJEMPLO',
    name: 'Nombre completo del curso',
    shortName: 'Curso ejemplo',
    subtitle: 'Descripción que se mostrará en el inicio y en el panel.',
    versionLabel: 'Versión del temario',
    storageKey: 'academy_curso_ejemplo_progress',
    sourceLanguage: 'ES',
    questionLanguage: 'ES',
    k3Description: 'Descripción opcional del laboratorio de aplicación.'
  },
  chapters: [
    {
      id: 1,
      title: 'Capítulo de ejemplo',
      minutes: 60,
      summary: 'Resumen del capítulo.',
      terms: ['término'],
      pitfalls: ['Trampa frecuente.'],
      examples: ['Ejemplo aplicado.'],
      theorySections: [
        { title: 'Tema principal', body: 'Explicación propia y resumida.', bullets: ['Punto clave.'] }
      ],
      completeSyllabusText: 'Texto autorizado o contenido propio del temario.',
      completeSyllabusPages: '1-10',
      syllabusSource: 'Fuente y versión'
    }
  ],
  objectives: [
    {
      lo: 'EJ-1.1.1',
      chapter: 1,
      k: 'K2',
      text: 'Explicar un concepto de ejemplo',
      theory: 'Teoría para estudiar el objetivo.',
      remember: 'Idea clave.',
      example: 'Ejemplo del objetivo.',
      trap: 'Error frecuente.'
    }
  ],
  questions: [
    {
      id: 'EJ-Q001',
      chapter: 1,
      k: 'K2',
      lo: 'EJ-1.1.1',
      objective: 'Explicar un concepto de ejemplo',
      topic: 'Concepto de ejemplo',
      stem: '¿Cuál opción representa mejor el concepto?',
      options: ['Opción correcta', 'Distractor 1', 'Distractor 2', 'Distractor 3'],
      correct: [0],
      explanation: 'Explicación de la respuesta.',
      multi: false,
      difficulty: 'normal',
      points: 1
    }
  ],
  flashcards: [
    {
      front: 'Término de ejemplo',
      back: 'Definición del término.',
      meaning: 'Definición del término.',
      chapter: 1,
      lo: 'EJ-1.1.1',
      kind: 'Término',
      hint: 'Pista opcional.'
    }
  ],
  blueprint: {
    totalQuestions: 1,
    totalPoints: 1,
    passingScore: 1,
    minutes: 5,
    extraTime25: 7,
    chapterDistribution: { 1: 1 },
    kDistribution: { K2: 1 },
    matrix: { 1: { K2: 1 } },
    version: 'Matriz de ejemplo'
  },
  generatedAt: new Date().toISOString(),
  qaValidation: null,
  syllabusCoverageNote: null
});
