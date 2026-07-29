'use strict';

(function initAcademyRegistry(global) {
  const courses = new Map();

  function register(key, course) {
    const normalizedKey = String(key || '').trim().toLowerCase();
    if (courses.has(normalizedKey)) {
      throw new Error(`El curso "${normalizedKey}" ya está registrado.`);
    }

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
