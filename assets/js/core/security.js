'use strict';

(function initAcademySecurity(global) {
  const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
  const MAX_IMPORT_CHARS = 2_000_000;
  const MAX_IMPORTED_QUESTIONS = 500;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char]));
  }

  function toFiniteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function cleanText(value, maxLength = 20_000) {
    return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, maxLength);
  }

  function safeJsonParse(text, maxChars = MAX_IMPORT_CHARS) {
    if (typeof text !== 'string') {
      throw new TypeError('El contenido JSON debe ser texto.');
    }
    if (text.length > maxChars) {
      throw new RangeError(`El JSON supera el límite de ${maxChars.toLocaleString('es-CO')} caracteres.`);
    }
    return JSON.parse(text);
  }

  function uniqueStrings(values) {
    return [...new Set(values.map((value) => String(value)))];
  }

  function validateQuestion(raw, context = {}) {
    const errors = [];
    const chapterIds = context.chapterIds || null;
    const learningObjectives = context.learningObjectives || null;

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { valid: false, errors: ['La pregunta debe ser un objeto JSON.'] };
    }

    const id = cleanText(raw.id, 128);
    const lo = cleanText(raw.lo, 128);
    const k = cleanText(raw.k, 16).toUpperCase();
    const chapter = toFiniteNumber(raw.chapter, NaN);
    const options = Array.isArray(raw.options) ? raw.options.map((item) => cleanText(item, 4_000)) : [];
    const correctRaw = Array.isArray(raw.correct) ? raw.correct : [raw.correct];
    const correct = uniqueStrings(correctRaw)
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item));

    if (!id) errors.push('Falta id.');
    if (!Number.isInteger(chapter) || chapter < 1) errors.push('chapter debe ser un entero positivo.');
    if (!k) errors.push('Falta k.');
    if (!lo) errors.push('Falta lo.');
    if (!cleanText(raw.stem, 20_000)) errors.push('Falta stem.');
    if (options.length < 2 || options.length > 10) errors.push('options debe contener entre 2 y 10 opciones.');
    if (options.some((option) => !option)) errors.push('Las opciones no pueden estar vacías.');
    if (!correct.length) errors.push('correct debe incluir al menos un índice.');
    if (correct.some((index) => index < 0 || index >= options.length)) errors.push('correct contiene índices fuera de rango.');
    if (chapterIds && !chapterIds.has(String(chapter))) errors.push(`El capítulo ${chapter} no existe en el curso.`);
    if (learningObjectives && !learningObjectives.has(lo)) errors.push(`El objetivo ${lo} no existe en el curso.`);

    if (errors.length) return { valid: false, errors };

    return {
      valid: true,
      errors: [],
      value: {
        id,
        chapter,
        k,
        lo,
        objective: cleanText(raw.objective, 10_000),
        topic: cleanText(raw.topic || lo || 'Importada', 10_000),
        stem: cleanText(raw.stem, 20_000),
        options,
        correct: [...new Set(correct)].sort((a, b) => a - b),
        explanation: cleanText(raw.explanation, 20_000),
        multi: Boolean(raw.multi ?? correct.length > 1),
        difficulty: cleanText(raw.difficulty || 'importada', 128),
        points: Math.max(1, Math.trunc(toFiniteNumber(raw.points, 1))),
        source: cleanText(raw.source || 'Importación local', 512)
      }
    };
  }

  function validateCourse(key, course) {
    const errors = [];

    if (!KEY_PATTERN.test(String(key))) errors.push('La clave del curso tiene un formato inválido.');
    if (!course || typeof course !== 'object' || Array.isArray(course)) {
      return { valid: false, errors: ['El curso debe ser un objeto.'] };
    }

    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    const objectives = Array.isArray(course.objectives) ? course.objectives : [];
    const questions = Array.isArray(course.questions) ? course.questions : [];
    const flashcards = Array.isArray(course.flashcards) ? course.flashcards : [];
    const blueprint = course.blueprint && typeof course.blueprint === 'object' ? course.blueprint : null;

    if (!course.meta || typeof course.meta !== 'object') errors.push('Falta meta.');
    if (!cleanText(course.meta?.name, 500)) errors.push('Falta meta.name.');
    if (!chapters.length) errors.push('El curso debe incluir capítulos.');
    if (!objectives.length) errors.push('El curso debe incluir objetivos de aprendizaje.');
    if (!questions.length) errors.push('El curso debe incluir preguntas.');
    if (!blueprint) errors.push('Falta blueprint.');

    const chapterIds = new Set();
    chapters.forEach((chapter, index) => {
      const id = Number(chapter?.id);
      if (!Number.isInteger(id) || id < 1) errors.push(`chapters[${index}].id es inválido.`);
      if (chapterIds.has(String(id))) errors.push(`Capítulo duplicado: ${id}.`);
      chapterIds.add(String(id));
      if (!cleanText(chapter?.title, 500)) errors.push(`chapters[${index}].title está vacío.`);
    });

    const learningObjectives = new Set();
    objectives.forEach((objective, index) => {
      const lo = cleanText(objective?.lo, 128);
      if (!lo) errors.push(`objectives[${index}].lo está vacío.`);
      if (learningObjectives.has(lo)) errors.push(`Objetivo duplicado: ${lo}.`);
      learningObjectives.add(lo);
      if (!chapterIds.has(String(objective?.chapter))) errors.push(`El objetivo ${lo || index} usa un capítulo inexistente.`);
    });

    const questionIds = new Set();
    questions.forEach((question, index) => {
      const result = validateQuestion(question, { chapterIds, learningObjectives });
      if (!result.valid) errors.push(`questions[${index}]: ${result.errors.join(' ')}`);
      const id = cleanText(question?.id, 128);
      if (questionIds.has(id)) errors.push(`Pregunta duplicada: ${id}.`);
      questionIds.add(id);
    });

    if (blueprint) {
      const totalQuestions = toFiniteNumber(blueprint.totalQuestions, 0);
      const totalPoints = toFiniteNumber(blueprint.totalPoints ?? totalQuestions, 0);
      const passingScore = toFiniteNumber(blueprint.passingScore, 0);
      const minutes = toFiniteNumber(blueprint.minutes, 0);
      if (!Number.isInteger(totalQuestions) || totalQuestions < 1) errors.push('blueprint.totalQuestions es inválido.');
      if (totalPoints < totalQuestions) errors.push('blueprint.totalPoints no puede ser menor que totalQuestions.');
      if (passingScore < 1 || passingScore > totalPoints) errors.push('blueprint.passingScore es inválido.');
      if (minutes < 1) errors.push('blueprint.minutes es inválido.');
    }

    if (!Array.isArray(flashcards)) errors.push('flashcards debe ser un array.');

    return { valid: errors.length === 0, errors };
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (!value || typeof value !== 'object' || seen.has(value)) return value;
    seen.add(value);
    Object.freeze(value);
    Object.values(value).forEach((child) => deepFreeze(child, seen));
    return value;
  }

  function sanitizeFilename(value, fallback = 'archivo.json') {
    const cleaned = cleanText(value, 180)
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return cleaned || fallback;
  }

  global.AcademySecurity = Object.freeze({
    MAX_IMPORT_CHARS,
    MAX_IMPORTED_QUESTIONS,
    escapeHtml,
    cleanText,
    safeJsonParse,
    validateQuestion,
    validateCourse,
    deepFreeze,
    sanitizeFilename,
    toFiniteNumber
  });
}(window));
