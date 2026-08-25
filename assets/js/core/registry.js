'use strict';

(function initAcademyRegistry(global) {
  const courses = new Map();

  function prepareQuestionBank(courseKey, course) {
    const sourceScope = global.ACADEMY_COURSE_SOURCES?.[courseKey];
    if (!sourceScope) {
      throw new Error(`Curso "${courseKey}" sin alcance documental en courses/source-documents.js.`);
    }
    const referenceIds = new Set(sourceScope.questionReferences.map((reference) => reference.id));
    if (!referenceIds.size) {
      throw new Error(`Curso "${courseKey}" sin documentos de referencia para prácticas y exámenes.`);
    }
    (course.questions || []).forEach((question, index) => {
      const declaredCourseKey = String(question.courseKey || courseKey).trim().toLowerCase();
      if (declaredCourseKey !== courseKey) {
        throw new Error(`La pregunta "${question.id || index}" pertenece a "${declaredCourseKey}" y no puede registrarse en "${courseKey}".`);
      }
      const fallbackReference = sourceScope.questionReferences[index % sourceScope.questionReferences.length].id;
      const designReferenceId = String(question.designReferenceId || fallbackReference);
      if (!referenceIds.has(designReferenceId)) {
        throw new Error(`La pregunta "${question.id || index}" usa una referencia documental ajena a "${courseKey}".`);
      }
      question.courseKey = courseKey;
      question.designReferenceId = designReferenceId;
    });
    course.sourceScope = {
      courseKey,
      documentIds: sourceScope.documents.map((document) => document.id),
      questionReferenceIds: [...referenceIds]
    };
  }

  function register(key, course) {
    const normalizedKey = String(key || '').trim().toLowerCase();
    if (courses.has(normalizedKey)) {
      throw new Error(`El curso "${normalizedKey}" ya está registrado.`);
    }

    prepareQuestionBank(normalizedKey, course);

    const validation = global.AcademySecurity.validateCourse(normalizedKey, course);
    if (!validation.valid) {
      throw new Error(`Curso "${normalizedKey}" inválido:\n- ${validation.errors.join('\n- ')}`);
    }

    global.AcademySecurity.deepFreeze(course);
    courses.set(normalizedKey, course);
  }

  function get(key) {
    return courses.get(String(key || '').trim().toLowerCase()) || null;
  }

  function has(key) {
    return courses.has(String(key || '').trim().toLowerCase());
  }

  function keys() {
    return [...courses.keys()];
  }

  function entries() {
    return [...courses.entries()];
  }

  global.AcademyRegistry = Object.freeze({ register, get, has, keys, entries });
}(window));
