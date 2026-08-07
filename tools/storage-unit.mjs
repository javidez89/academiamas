import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(String(key)) ? this.values.get(String(key)) : null;
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  removeItem(key) {
    this.values.delete(String(key));
  }
}

async function loadStorage(localStorage) {
  const source = await fs.readFile(`${process.cwd()}/assets/js/core/storage.js`, 'utf8');
  const sandbox = { window: {}, localStorage, console };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'assets/js/core/storage.js' });
  return sandbox.window.AcademyStorage;
}

const localStorage = new MemoryStorage();
const storage = await loadStorage(localStorage);

assert.equal(storage.available(), true, 'localStorage debe estar disponible.');
assert.equal(storage.SCHEMA_VERSION, 3, 'La versión del esquema de progreso cambió.');

const attempts = Array.from({ length: 35 }, (_, index) => ({
  date: `2026-08-${String((index % 28) + 1).padStart(2, '0')}T00:00:00Z`,
  total: 40,
  totalPoints: 40,
  earned: index,
  correct: index,
  scorePct: index,
  mode: 'exam',
  cert: 'ctfl'
}));

assert.equal(storage.saveProgress('course-a', {
  attempts,
  byLo: {
    'FL-1.1.1': { ok: 3, bad: 2, chapter: 1, k: 'K2', objective: 'Objetivo de prueba' },
    unsafe: { ok: -5, bad: '4', chapter: -2, k: 'K3', objective: 'Normalización' }
  },
  marked: ['Q-1', 'Q-1', 'Q-2'],
  questionHistory: [
    { id: 'Q-1', mode: 'practice-study', seenAt: '2026-08-06T10:00:00Z' },
    { id: 'Q-2', mode: 'official-exam', seenAt: '2026-08-06T11:00:00Z' }
  ]
}).ok, true, 'No fue posible guardar el progreso.');

const courseA = storage.getProgress('course-a');
assert.equal(courseA._schema, 3);
assert.equal(courseA.attempts.length, 30, 'El historial debe conservar solo 30 intentos.');
assert.deepEqual([...courseA.marked], ['Q-1', 'Q-2'], 'Las preguntas marcadas deben ser únicas.');
assert.equal(courseA.byLo['FL-1.1.1'].ok, 3);
assert.equal(courseA.byLo.unsafe.ok, 0, 'Los contadores negativos deben normalizarse.');
assert.equal(courseA.byLo.unsafe.bad, 4);
assert.deepEqual([...courseA.questionHistory].map((entry) => entry.id), ['Q-1', 'Q-2'], 'El historial de selección debe conservarse.');

const courseB = storage.getProgress('course-b');
assert.equal(courseB.attempts.length, 0, 'El progreso debe estar aislado por curso.');
assert.deepEqual(Object.keys(courseB.byLo), [], 'Un curso nuevo no debe heredar estadísticas.');

const reloadedStorage = await loadStorage(localStorage);
assert.equal(reloadedStorage.getProgress('course-a').byLo['FL-1.1.1'].bad, 2, 'El progreso debe persistir tras recargar.');
assert.equal(reloadedStorage.setActiveCourse('ctfl'), true);
assert.equal(reloadedStorage.getActiveCourse(), 'ctfl');
assert.equal(reloadedStorage.removeProgress('course-a'), true);
assert.equal(reloadedStorage.getProgress('course-a').attempts.length, 0, 'Borrar avance debe eliminar los intentos.');

console.log('Storage unit OK: persistencia, aislamiento, normalización y límites verificados.');
