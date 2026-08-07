'use strict';

(function initAcademyStorage(global) {
  const ACTIVE_KEY = 'academy_active_course';
  const LEGACY_ACTIVE_KEY = 'istqb_active_cert';
  const SCHEMA_VERSION = 3;

  function available() {
    try {
      const testKey = '__academy_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function readJson(key, fallback = {}) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`No fue posible leer ${key}.`, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (error) {
      console.warn(`No fue posible guardar ${key}.`, error);
      return { ok: false, error };
    }
  }

  function normalizeProgress(raw) {
    const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const byLo = input.byLo && typeof input.byLo === 'object' && !Array.isArray(input.byLo) ? input.byLo : {};
    const safeByLo = {};

    Object.entries(byLo).slice(0, 2_000).forEach(([lo, item]) => {
      if (!item || typeof item !== 'object') return;
      safeByLo[String(lo).slice(0, 128)] = {
        ok: Math.max(0, Math.trunc(Number(item.ok) || 0)),
        bad: Math.max(0, Math.trunc(Number(item.bad) || 0)),
        chapter: Math.max(0, Math.trunc(Number(item.chapter) || 0)),
        k: String(item.k || '').slice(0, 16),
        objective: String(item.objective || '').slice(0, 10_000)
      };
    });

    const attempts = Array.isArray(input.attempts) ? input.attempts.slice(-30).map((attempt) => ({
      date: String(attempt?.date || new Date(0).toISOString()).slice(0, 64),
      total: Math.max(0, Math.trunc(Number(attempt?.total) || 0)),
      totalPoints: Math.max(0, Number(attempt?.totalPoints) || 0),
      earned: Math.max(0, Number(attempt?.earned) || 0),
      correct: Math.max(0, Math.trunc(Number(attempt?.correct) || 0)),
      scorePct: Math.min(100, Math.max(0, Math.trunc(Number(attempt?.scorePct) || 0))),
      mode: String(attempt?.mode || '').slice(0, 32),
      cert: String(attempt?.cert || '').slice(0, 64)
    })) : [];

    const marked = Array.isArray(input.marked)
      ? [...new Set(input.marked.map((id) => String(id).slice(0, 128)))].slice(0, 5_000)
      : [];

    const questionHistory = Array.isArray(input.questionHistory)
      ? input.questionHistory.slice(-5_000).map((entry) => ({
        id: String(entry?.id || '').slice(0, 128),
        mode: String(entry?.mode || '').slice(0, 32),
        seenAt: String(entry?.seenAt || new Date(0).toISOString()).slice(0, 64)
      })).filter((entry) => entry.id)
      : [];

    return { _schema: SCHEMA_VERSION, attempts, byLo: safeByLo, marked, questionHistory };
  }

  function getActiveCourse() {
    try {
      return localStorage.getItem(ACTIVE_KEY) || localStorage.getItem(LEGACY_ACTIVE_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function setActiveCourse(key) {
    try {
      localStorage.setItem(ACTIVE_KEY, key);
      localStorage.setItem(LEGACY_ACTIVE_KEY, key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getProgress(storageKey) {
    return normalizeProgress(readJson(storageKey, {}));
  }

  function saveProgress(storageKey, progress) {
    return writeJson(storageKey, normalizeProgress(progress));
  }

  function removeProgress(storageKey) {
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  global.AcademyStorage = Object.freeze({
    SCHEMA_VERSION,
    available,
    getActiveCourse,
    setActiveCourse,
    getProgress,
    saveProgress,
    removeProgress
  });
}(window));
