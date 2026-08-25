import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);

for (const file of [
  'assets/js/core/security.js',
  'courses/source-documents.js',
  'assets/js/core/registry.js',
  'courses/catalog.js'
]) {
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  vm.runInContext(source, sandbox, { filename: file });
}

const catalog = Array.from(sandbox.ACADEMY_CATALOG || []);
const activeKeys = new Set(catalog.map((entry) => String(entry.key)));
const documentOwners = new Map();
const expectedDriveDocuments = Object.freeze({
  ctfl: 25,
  ctai: 11,
  'ct-genai': 12,
  'project-management-essentials': 1,
  'scrum-fundamentals': 1,
  'cybersecurity-awareness': 1,
  pci: 2
});

function inventoryIds(scope) {
  return new Set([
    ...scope.documents.map((document) => document.id),
    ...scope.questionReferences.flatMap((reference) => [reference.questionsId, reference.answersId]),
    ...scope.excludedDocuments.map((document) => document.id)
  ]);
}

for (const entry of catalog) {
  const key = String(entry.key);
  const scope = sandbox.ACADEMY_COURSE_SOURCES?.[key];
  assert.ok(scope, `${key}: falta alcance en courses/source-documents.js.`);
  assert.equal(scope.courseKey, key, `${key}: clave documental inconsistente.`);
  assert.ok(scope.documents.length, `${key}: no tiene documentos de contenido.`);
  assert.ok(scope.questionReferences.length, `${key}: no tiene documentos de preguntas o diseño.`);
  if (expectedDriveDocuments[key]) {
    assert.equal(inventoryIds(scope).size, expectedDriveDocuments[key], `${key}: no están inventariados todos los documentos de Drive.`);
  }

  for (const reference of scope.questionReferences) {
    assert.ok(reference.id && reference.questionsId && reference.answersId, `${key}: referencia incompleta.`);
    for (const documentId of [reference.questionsId, reference.answersId]) {
      const owner = documentOwners.get(documentId);
      assert.ok(!owner || owner === key, `${key}: el documento ${documentId} también está asignado a ${owner}.`);
      documentOwners.set(documentId, key);
    }
  }
  const excludedIds = new Set(scope.excludedDocuments.map((document) => document.id));
  for (const reference of scope.questionReferences) {
    assert.ok(!excludedIds.has(reference.questionsId), `${key}: usa como preguntas un documento excluido.`);
    assert.ok(!excludedIds.has(reference.answersId), `${key}: usa como respuestas un documento excluido.`);
  }

  const courseSource = await fs.readFile(path.join(ROOT, entry.src), 'utf8');
  vm.runInContext(courseSource, sandbox, { filename: entry.src });
  const course = sandbox.AcademyRegistry.get(key);
  assert.ok(course, `${key}: no se registró.`);
  assert.equal(course.sourceScope.courseKey, key, `${key}: el banco perdió su alcance documental.`);
  assert.equal(course.questions.length, Number(entry.counts.questions), `${key}: el catálogo no coincide con el banco.`);

  const usedReferences = new Set();
  for (const question of course.questions) {
    assert.equal(question.courseKey, key, `${key}: ${question.id} quedó asociada a otro curso.`);
    assert.ok(scope.questionReferences.some((reference) => reference.id === question.designReferenceId), `${key}: ${question.id} usa una referencia ajena.`);
    usedReferences.add(question.designReferenceId);
  }
  assert.equal(
    JSON.stringify([...usedReferences].sort()),
    JSON.stringify(Array.from(scope.questionReferences, (reference) => String(reference.id)).sort()),
    `${key}: no todas las fuentes de preguntas participan en el banco.`
  );
  console.log(`${key}: ${course.questions.length} preguntas aisladas y ${usedReferences.size} referencias documentales cubiertas.`);
}

assert.ok(sandbox.ACADEMY_COURSE_SOURCES.pci, 'La plantilla documental debe anticipar el curso PCI futuro.');
for (const [key, scope] of Object.entries(sandbox.ACADEMY_COURSE_SOURCES)) {
  if (expectedDriveDocuments[key]) {
    assert.equal(inventoryIds(scope).size, expectedDriveDocuments[key], `${key}: inventario documental incompleto.`);
  }
  if (!activeKeys.has(key)) {
    assert.ok(scope.documents.length && scope.questionReferences.length, `${key}: el curso futuro no tiene fuentes completas.`);
  }
}

console.log('Question bank sources audit OK: catálogo dinámico, documentos y aislamiento por curso verificados.');
