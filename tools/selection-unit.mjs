import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(`${process.cwd()}/assets/js/core/question-selection.js`, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'assets/js/core/question-selection.js' });
const Selection = sandbox.window.AcademyQuestionSelection;

let seed = 17;
const randomInt = (max) => {
  seed = (seed * 48_271) % 2_147_483_647;
  return max > 0 ? seed % max : 0;
};

const questions = [];
for (let index = 1; index <= 8; index += 1) questions.push({ id: `C1-K1-${index}`, chapter: 1, k: 'K1', lo: `K1-LO-${Math.ceil(index / 2)}` });
for (let index = 1; index <= 12; index += 1) questions.push({ id: `C1-K2-${index}`, chapter: 1, k: 'K2', lo: `K2-LO-${Math.ceil(index / 2)}` });
const blueprint = {
  totalQuestions: 5,
  kDistribution: { K1: 2, K2: 3 },
  matrix: { 1: { K1: 2, K2: 3 } }
};

const first = Selection.buildMatrixSelection(questions, blueprint, [], randomInt).questions;
const history = first.map((question) => ({ id: question.id }));
const second = Selection.buildMatrixSelection(questions, blueprint, history, randomInt).questions;

assert.equal(first.length, 5);
assert.equal(new Set(first.map((question) => question.id)).size, 5, 'Un simulacro no debe repetir preguntas.');
assert.equal(first.filter((question) => question.k === 'K1').length, 2, 'Debe respetar K1.');
assert.equal(first.filter((question) => question.k === 'K2').length, 3, 'Debe respetar K2.');
assert.equal(new Set(first.map((question) => question.lo)).size, 5, 'Debe diversificar los LO dentro de cada celda de la matriz.');
assert.equal(first.filter((question) => second.some((candidate) => candidate.id === question.id)).length, 0, 'Dos simulacros consecutivos no deben solaparse mientras exista capacidad.');

const practicePool = questions.filter((question) => question.k === 'K2');
const practiceFirst = Selection.selectLeastSeen(practicePool, 4, [], randomInt);
const practiceSecond = Selection.selectLeastSeen(practicePool, 4, practiceFirst.map((question) => question.id), randomInt);
assert.equal(practiceFirst.filter((question) => practiceSecond.some((candidate) => candidate.id === question.id)).length, 0, 'La práctica debe priorizar preguntas no vistas.');

const mixedQuestions = [
  ...questions.map((question, index) => ({ ...question, courseKey: 'curso-a', designReferenceId: `fuente-${index % 2}` })),
  ...questions.map((question, index) => ({ ...question, id: `B-${question.id}`, courseKey: 'curso-b', designReferenceId: `otra-${index % 2}` }))
];
const isolated = Selection.buildMatrixSelection(mixedQuestions, blueprint, [], randomInt, 'curso-a').questions;
assert.equal(isolated.length, 5, 'El curso activo debe conservar la capacidad de su matriz.');
assert.ok(isolated.every((question) => question.courseKey === 'curso-a'), 'Un simulacro nunca debe mezclar preguntas de otro curso.');
const isolatedPractice = Selection.selectLeastSeen(mixedQuestions, 6, [], randomInt, 'curso-b');
assert.ok(isolatedPractice.every((question) => question.courseKey === 'curso-b'), 'La práctica nunca debe mezclar preguntas de otro curso.');
assert.ok(new Set(isolated.map((question) => question.designReferenceId)).size >= 2, 'La selección debe diversificar las referencias documentales disponibles.');

console.log('Selection unit OK: matriz, aleatoriedad, referencias documentales, aislamiento y protección contra repeticiones verificados.');
