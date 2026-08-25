import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const REQUIREMENTS = Object.freeze({
  ctfl: { minPerLO: 6, minFlashcardsPerLO: 1, syllabus: /4\.0\.1/, sourceLanguage: 'es' },
  ctai: { minPerLO: 3, minFlashcardsPerLO: 2, syllabus: /v2\.0/i, sourceLanguage: 'es' },
  'ct-genai': { minPerLO: 4, minFlashcardsPerLO: 3, syllabus: /v1\.1/i, sourceLanguage: 'es' }
});

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function assertSpanishReading(value, label) {
  const englishWords = ['the', 'and', 'of', 'to', 'is', 'are', 'for', 'with', 'that', 'from', 'this', 'these', 'when', 'which', 'using', 'used', 'should', 'summarize', 'recall', 'apply', 'practice', 'generate'];
  const spanishWords = ['de', 'la', 'el', 'los', 'las', 'y', 'en', 'que', 'para', 'con', 'del', 'un', 'una', 'se', 'por', 'como', 'puede', 'son', 'al', 'su', 'resumir', 'recordar', 'aplicar', 'practicar', 'generar'];
  const scores = (textValue) => {
    const text = ` ${normalize(textValue)} `;
    const count = (words) => words.reduce((total, word) => total + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0), 0);
    return [count(englishWords), count(spanishWords)];
  };
  const [englishSignals, spanishSignals] = scores(value);
  assert.ok(spanishSignals > englishSignals, `${label}: el contenido parece continuar principalmente en inglés (${englishSignals}/${spanishSignals}).`);
  const suspectSegment = String(value).split(/\n+/).find((segment) => {
    const [english, spanish] = scores(segment);
    return english >= 3 && english > spanish * 1.5;
  });
  assert.ok(!suspectSegment, `${label}: conserva un segmento en inglés: "${String(suspectSegment || '').slice(0, 160)}".`);
  assert.doesNotMatch(String(value), /[\uD800-\uDFFF\uFFFD]/, `${label}: contiene caracteres dañados.`);
}

async function loadCourse(key) {
  const source = await fs.readFile(path.join(ROOT, 'courses', key, 'course-data.js'), 'utf8');
  const sandbox = {
    window: {},
    AcademyRegistry: { register: (_key, course) => { sandbox.course = course; } }
  };
  sandbox.window.AcademyRegistry = sandbox.AcademyRegistry;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: key });
  return sandbox.course;
}

for (const [key, requirement] of Object.entries(REQUIREMENTS)) {
  const course = await loadCourse(key);
  const ids = new Set();
  const stems = new Set();
  const perLo = new Map(course.objectives.map((objective) => [objective.lo, 0]));
  const flashcardsPerLo = new Map(course.objectives.map((objective) => [objective.lo, 0]));
  const answerPositions = [0, 0, 0, 0];
  const chapterIds = new Set(course.chapters.map((chapter) => String(chapter.id)));

  assert.match(course.meta.versionLabel, requirement.syllabus, `${key}: versión de syllabus desactualizada.`);
  for (const chapter of course.chapters) {
    assert.ok(String(chapter.completeSyllabusText || '').length >= 500, `${key}: capítulo ${chapter.id} sin contenido fuente completo.`);
    assert.ok(chapter.syllabusSource, `${key}: capítulo ${chapter.id} sin fuente de syllabus.`);
    assert.equal(chapter.syllabusLanguage, requirement.sourceLanguage, `${key}: capítulo ${chapter.id} debe ofrecer su contenido de referencia en español.`);
    assertSpanishReading(chapter.completeSyllabusText, `${key}: capítulo ${chapter.id}`);
    assert.ok(chapter.caseStudy?.context && chapter.caseStudy?.challenge && chapter.caseStudy?.evidence, `${key}: capítulo ${chapter.id} sin caso práctico completo.`);
    assert.doesNotMatch(chapter.completeSyllabusText, /\n\d+\.?\s+(?:Appendix|Apéndice)\b/i, `${key}: capítulo ${chapter.id} arrastra un apéndice.`);
  }
  for (const objective of course.objectives) {
    assert.ok(String(objective.sourceText || '').startsWith(objective.lo), `${key}: ${objective.lo} no conserva el enunciado oficial.`);
    assert.ok(String(objective.syllabusExtract || '').length >= 80, `${key}: ${objective.lo} no tiene extracto literal suficiente.`);
    assert.ok(objective.syllabusSource, `${key}: ${objective.lo} no declara su fuente.`);
    assert.equal(objective.syllabusLanguage, requirement.sourceLanguage, `${key}: ${objective.lo} debe ofrecer su contenido de referencia en español.`);
    assertSpanishReading(objective.sourceText, `${key}: enunciado ${objective.lo}`);
    assertSpanishReading(objective.syllabusExtract, `${key}: contenido de referencia ${objective.lo}`);
    assert.doesNotMatch(objective.sourceText, /\b(?:Page|Página)\b|\d{2}\/\d{2}\/\d{4}/i, `${key}: ${objective.lo} contiene metadatos de página.`);
    assert.doesNotMatch(objective.syllabusExtract, /\n\d+\.?\s+(?:Appendix|Apéndice)\b/i, `${key}: ${objective.lo} arrastra un apéndice.`);
  }
  for (const question of course.questions) {
    assert.ok(!ids.has(question.id), `${key}: ID duplicado ${question.id}.`);
    ids.add(question.id);
    const stem = normalize(question.stem);
    assert.ok(!stems.has(stem), `${key}: enunciado duplicado ${question.id}.`);
    stems.add(stem);
    assert.ok(perLo.has(question.lo), `${key}: LO desconocido ${question.lo}.`);
    perLo.set(question.lo, perLo.get(question.lo) + 1);
    assert.equal(new Set(question.options.map(normalize)).size, question.options.length, `${key}: opciones duplicadas en ${question.id}.`);
    assert.ok(question.correct.length >= 1, `${key}: sin respuesta en ${question.id}.`);
    question.correct.forEach((index) => {
      assert.ok(index >= 0 && index < question.options.length, `${key}: índice inválido en ${question.id}.`);
      if (index < answerPositions.length) answerPositions[index] += 1;
    });
    assert.ok(String(question.explanation || '').trim().length >= 40, `${key}: explicación breve en ${question.id}.`);
    assert.doesNotMatch(String(question.source || ''), /examen de muestra oficial.*traducid/i, `${key}: contiene una traducción del examen oficial en ${question.id}.`);
  }

  const minimum = Math.min(...perLo.values());
  assert.ok(minimum >= requirement.minPerLO, `${key}: cobertura mínima ${minimum}; se requieren ${requirement.minPerLO} preguntas por LO.`);
  const answered = answerPositions.reduce((sum, value) => sum + value, 0);
  const dominantShare = Math.max(...answerPositions) / answered;
  assert.ok(dominantShare <= 0.7, `${key}: distribución sesgada de respuestas (${Math.round(dominantShare * 100)}% en una posición).`);
  if (course.questions.length >= 100) {
    answerPositions.forEach((count, index) => {
      assert.ok(count / answered >= 0.1, `${key}: la posición ${index + 1} casi no se usa como respuesta correcta.`);
    });
  }

  for (const [chapter, levels] of Object.entries(course.blueprint.matrix || {})) {
    for (const [level, required] of Object.entries(levels)) {
      const available = course.questions.filter((question) => String(question.chapter) === chapter && question.k === level).length;
      assert.ok(available >= required, `${key}: matriz sin capacidad C${chapter}/${level}: ${available}/${required}.`);
    }
  }

  const flashcardFronts = new Set();
  for (const [index, flashcard] of course.flashcards.entries()) {
    const front = normalize(flashcard.front);
    const back = `${String(flashcard.meaning || '').trim()} ${String(flashcard.back || '').trim()}`.trim();
    assert.ok(front, `${key}: flashcard ${index + 1} sin frente.`);
    assert.ok(back.length >= 20, `${key}: flashcard ${index + 1} sin explicacion suficiente.`);
    assert.ok(!flashcardFronts.has(front), `${key}: flashcard duplicada "${flashcard.front}".`);
    flashcardFronts.add(front);
    assert.ok(chapterIds.has(String(flashcard.chapter)), `${key}: flashcard ${index + 1} usa un capitulo inexistente.`);
    if (flashcard.lo) {
      assert.ok(flashcardsPerLo.has(flashcard.lo), `${key}: flashcard ${index + 1} usa un LO desconocido.`);
      flashcardsPerLo.set(flashcard.lo, flashcardsPerLo.get(flashcard.lo) + 1);
    }
  }
  const minimumFlashcards = Math.min(...flashcardsPerLo.values());
  assert.ok(
    minimumFlashcards >= requirement.minFlashcardsPerLO,
    `${key}: cobertura minima de flashcards ${minimumFlashcards}; se requieren ${requirement.minFlashcardsPerLO} por LO.`
  );

  console.log(`${key}: ${course.questions.length} preguntas, ${course.flashcards.length} flashcards, ${course.objectives.length} LO, minimo ${minimum} preguntas/LO y ${minimumFlashcards} flashcards/LO, respuestas ${answerPositions.join('/')}.`);
}

const courseDirectories = await fs.readdir(path.join(ROOT, 'courses'), { withFileTypes: true });
for (const directory of courseDirectories.filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))) {
  const file = path.join(ROOT, 'courses', directory.name, 'course-data.js');
  try {
    await fs.access(file);
  } catch {
    continue;
  }
  const course = await loadCourse(directory.name);
  for (const chapter of course.chapters || []) {
    assert.ok(chapter.caseStudy?.context, `${directory.name}: capítulo ${chapter.id} sin escenario aplicado.`);
    assert.ok(chapter.caseStudy?.attribution, `${directory.name}: capítulo ${chapter.id} sin atribución didáctica.`);
    assertSpanishReading(chapter.completeSyllabusText, `${directory.name}: material ampliado del capítulo ${chapter.id}`);
  }
  for (const objective of course.objectives || []) {
    assert.ok(objective.example, `${directory.name}: ${objective.lo} sin ejemplo práctico.`);
    assert.ok(objective.exampleAttribution, `${directory.name}: ${objective.lo} sin atribución del ejemplo.`);
  }
}

console.log('Course content audit OK.');
