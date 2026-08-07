import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const COURSE_KEYS = Object.freeze(['ctfl', 'ctai', 'ct-genai']);
const ENGLISH_OPENING = /^(which|what|when|where|who|why|how|select|choose|given|consider|according to)\b/i;
const CONTEXTUAL_STEM = /\b(escenario|caso|equipo|proyecto|sistema|modelo|situaci[oó]n|contexto)\b/i;

async function loadSelection() {
  const source = await fs.readFile(path.join(ROOT, 'assets/js/core/question-selection.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'assets/js/core/question-selection.js' });
  return sandbox.window.AcademyQuestionSelection;
}

async function loadCourse(key) {
  const source = await fs.readFile(path.join(ROOT, 'courses', key, 'course-data.js'), 'utf8');
  const sandbox = {
    window: {},
    AcademyRegistry: { register: (_key, course) => { sandbox.course = course; } }
  };
  sandbox.window.AcademyRegistry = sandbox.AcademyRegistry;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: `courses/${key}/course-data.js` });
  return sandbox.course;
}

function seededRandom(seed = 20260806) {
  let state = seed;
  return (max) => {
    state = (state * 48_271) % 2_147_483_647;
    return max > 0 ? state % max : 0;
  };
}

function requiredCells(blueprint) {
  return Object.entries(blueprint.matrix || {}).flatMap(([chapter, levels]) => (
    Object.entries(levels)
      .filter(([, required]) => Number(required) > 0)
      .map(([k, required]) => ({ chapter, k, required: Number(required) }))
  ));
}

function noRepeatCapacity(course) {
  return Math.min(...requiredCells(course.blueprint).map(({ chapter, k, required }) => {
    const available = course.questions.filter((question) => (
      String(question.chapter) === String(chapter) && question.k === k
    )).length;
    return Math.floor(available / required);
  }));
}

function assertExam(course, exam, runNumber) {
  const { blueprint } = course;
  assert.equal(exam.length, blueprint.totalQuestions, `${course.meta.code}: cantidad incorrecta en simulacro ${runNumber}.`);
  assert.equal(new Set(exam.map((question) => question.id)).size, exam.length, `${course.meta.code}: preguntas repetidas dentro del simulacro ${runNumber}.`);

  for (const { chapter, k, required } of requiredCells(blueprint)) {
    const actual = exam.filter((question) => String(question.chapter) === String(chapter) && question.k === k).length;
    assert.equal(actual, required, `${course.meta.code}: matriz incorrecta C${chapter}/${k} en simulacro ${runNumber}.`);
  }

  const points = exam.reduce((total, question) => total + Number(question.points || 1), 0);
  assert.equal(points, blueprint.totalPoints, `${course.meta.code}: puntuacion incorrecta en simulacro ${runNumber}.`);
  assert.ok(new Set(exam.map((question) => question.lo)).size >= 12, `${course.meta.code}: poca diversidad de objetivos en simulacro ${runNumber}.`);
}

function assertItemQuality(course) {
  const correctLengths = [];
  const distractorLengths = [];
  let contextual = 0;

  for (const question of course.questions) {
    if (CONTEXTUAL_STEM.test(question.stem)) contextual += 1;
    question.options.forEach((option, index) => {
      const target = question.correct.includes(index) ? correctLengths : distractorLengths;
      target.push(String(option).trim().length);
    });
  }

  const average = (values) => values.reduce((total, value) => total + value, 0) / values.length;
  const lengthRatio = average(correctLengths) / average(distractorLengths);
  assert.ok(lengthRatio >= 0.75 && lengthRatio <= 1.25, `${course.meta.code}: la longitud de las opciones puede revelar la respuesta (${lengthRatio.toFixed(2)}).`);
  assert.ok(contextual / course.questions.length >= 0.25, `${course.meta.code}: menos del 25% de las preguntas usa contexto o escenario.`);
  return { contextualShare: Math.round((contextual / course.questions.length) * 100), lengthRatio };
}

const Selection = await loadSelection();

for (const [courseIndex, key] of COURSE_KEYS.entries()) {
  const course = await loadCourse(key);
  const capacity = noRepeatCapacity(course);
  const history = [];
  const usedAcrossRuns = new Set();
  const randomInt = seededRandom(20260806 + courseIndex);
  const itemQuality = assertItemQuality(course);

  assert.ok(capacity >= 3, `${course.meta.code}: se requieren al menos tres simulacros completos sin repetir preguntas.`);
  for (const question of course.questions) {
    assert.doesNotMatch(String(question.stem || '').trim(), ENGLISH_OPENING, `${course.meta.code}: enunciado no localizado al espanol en ${question.id}.`);
  }

  for (let run = 1; run <= capacity; run += 1) {
    const result = Selection.buildMatrixSelection(course.questions, course.blueprint, history, randomInt);
    assert.equal(result.warnings.length, 0, `${course.meta.code}: capacidad insuficiente en la matriz.`);
    assertExam(course, result.questions, run);

    for (const question of result.questions) {
      assert.ok(!usedAcrossRuns.has(question.id), `${course.meta.code}: ${question.id} se repitio antes de agotar la capacidad de su celda.`);
      usedAcrossRuns.add(question.id);
      history.push({ id: question.id, mode: 'official-exam', seenAt: `run-${run}` });
    }
  }

  const availableLos = new Set(course.questions.map((question) => question.lo)).size;
  console.log(`${course.meta.code}: ${capacity} simulacros completos sin repeticion, ${usedAcrossRuns.size} selecciones unicas, ${availableLos} LO, ${course.blueprint.totalPoints} puntos, ${itemQuality.contextualShare}% contextual y ratio de longitud ${itemQuality.lengthRatio.toFixed(2)}.`);
}

console.log('Simulator realism audit OK: matriz, puntos, idioma, diversidad y anti-repeticion verificados.');
