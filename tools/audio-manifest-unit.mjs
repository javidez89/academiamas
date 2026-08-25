import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();

function normalizeText(value) {
  return String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function splitNarrationText(value, limit = 3_900) {
  const text = normalizeText(value);
  if (!text) return [];
  const chunks = [];
  let remaining = text;
  while (remaining.length > limit) {
    const window = remaining.slice(0, limit + 1);
    const sentenceBoundary = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '), window.lastIndexOf('; '));
    const wordBoundary = window.lastIndexOf(' ');
    const boundary = sentenceBoundary >= Math.floor(limit * 0.55) ? sentenceBoundary + 1 : wordBoundary >= Math.floor(limit * 0.55) ? wordBoundary : limit;
    chunks.push(remaining.slice(0, boundary).trim());
    remaining = remaining.slice(boundary).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function chapterNarration(chapter) {
  const sections = (chapter.theorySections || []).flatMap((section) => [section.title, section.body, ...(section.bullets || [])]);
  const caseStudy = chapter.caseStudy ? [
    `Caso práctico: ${chapter.caseStudy.title || ''}`,
    chapter.caseStudy.context,
    chapter.caseStudy.challenge,
    chapter.caseStudy.approach,
    chapter.caseStudy.evidence
  ] : [];
  return normalizeText([`Capítulo ${chapter.id}. ${chapter.title}.`, chapter.summary, ...sections, ...caseStudy, ...(chapter.examples || [])].filter(Boolean).join(' '));
}

function objectiveNarration(objective) {
  return normalizeText([
    `Objetivo de aprendizaje ${objective.lo}, nivel ${objective.k}.`,
    objective.text,
    objective.theory,
    objective.remember ? `Recuerda: ${objective.remember}` : '',
    objective.example ? `Escenario práctico: ${objective.example}` : '',
    objective.trap ? `Evita esta confusión: ${objective.trap}` : ''
  ].filter(Boolean).join(' '));
}

function chapterReferenceNarration(chapter) {
  return normalizeText([
    `Material de estudio ampliado del capítulo ${chapter.id}. ${chapter.title}.`,
    chapter.completeSyllabusText
  ].filter(Boolean).join(' '));
}

function objectiveReferenceNarration(objective) {
  return normalizeText([
    `Contenido de referencia del objetivo de aprendizaje ${objective.lo}.`,
    objective.sourceText,
    objective.syllabusExtract
  ].filter(Boolean).join(' '));
}

function expectedSegments(contentId, text) {
  const chunks = splitNarrationText(text);
  return chunks.map((chunk, index) => ({
    id: chunks.length > 1 ? `${contentId}-part-${index + 1}` : contentId,
    hash: digest(chunk)
  }));
}

function assertNarration(content, contentId, text, label) {
  const segments = expectedSegments(contentId, text);
  for (const segment of segments) {
    assert.equal(content[segment.id], segment.hash, `${label}: narración desactualizada en ${segment.id}.`);
  }
  return segments.length;
}

async function loadCourse(key) {
  let course;
  const source = await fs.readFile(path.join(root, 'courses', key, 'course-data.js'), 'utf8');
  vm.runInNewContext(source, { AcademyRegistry: { register: (_key, data) => { course = data; } } });
  return course;
}

async function loadCatalogKeys() {
  const context = { window: {} };
  const source = await fs.readFile(path.join(root, 'courses', 'catalog.js'), 'utf8');
  vm.runInNewContext(source, context);
  return Array.from(context.window.ACADEMY_CATALOG || [], (entry) => String(entry.key)).sort();
}

const manifestSource = await fs.readFile(path.join(root, 'supabase', 'functions', '_shared', 'course-audio-manifest.ts'), 'utf8');
const manifestMatch = manifestSource.match(/Object\.freeze\((\{[\s\S]+\})\);/);
assert.ok(manifestMatch, 'No fue posible leer el manifiesto de audio.');
const manifest = JSON.parse(manifestMatch[1]);
assert.deepEqual(
  Object.keys(manifest).sort(),
  await loadCatalogKeys(),
  'Todos los cursos presentes y futuros del catálogo deben quedar incluidos en el manifiesto de narración.'
);

for (const [courseKey, content] of Object.entries(manifest)) {
  const course = await loadCourse(courseKey);
  let expectedEntries = 0;
  for (const chapter of course.chapters || []) {
    expectedEntries += assertNarration(content, `chapter-${chapter.id}`, chapterNarration(chapter), `${courseKey}: capítulo ${chapter.id}`);
    if (chapter.completeSyllabusText) {
      expectedEntries += assertNarration(content, `chapter-reference-${chapter.id}`, chapterReferenceNarration(chapter), `${courseKey}: material ampliado del capítulo ${chapter.id}`);
    }
  }
  for (const objective of course.objectives || []) {
    expectedEntries += assertNarration(content, `lo-${String(objective.lo).toLowerCase()}`, objectiveNarration(objective), `${courseKey}: ${objective.lo}`);
    if (objective.syllabusExtract) {
      expectedEntries += assertNarration(content, `lo-reference-${String(objective.lo).toLowerCase()}`, objectiveReferenceNarration(objective), `${courseKey}: contenido de referencia de ${objective.lo}`);
    }
  }
  assert.equal(
    Object.keys(content).length,
    expectedEntries,
    `${courseKey}: el manifiesto contiene entradas inesperadas.`
  );
}

const edgeSource = await fs.readFile(path.join(root, 'supabase', 'functions', 'course-audio', 'index.ts'), 'utf8');
const appSource = await fs.readFile(path.join(root, 'assets', 'js', 'app.js'), 'utf8');
assert.ok(Object.keys(manifest.ctai || {}).some((contentId) => /^chapter-reference-\d+-part-1$/.test(contentId)), 'Los extractos largos deben dividirse en partes autorizadas.');
assert.match(edgeSource, /gpt-4o-mini-tts/, 'La función debe usar el modelo de voz aprobado.');
assert.match(edgeSource, /voice:\s*'marin'/, 'La función debe usar la voz natural Marin.');
assert.match(edgeSource, /voz cálida, conversacional y humana/, 'La narración debe conservar la dirección docente natural.');
assert.match(edgeSource, /allowedCourseAudioHash/, 'La función debe validar el contenido contra el catálogo.');
assert.match(edgeSource, /reference-/, 'La función debe aceptar narraciones de contenido de referencia.');
assert.match(edgeSource, /-part-/, 'La función debe aceptar partes consecutivas de narraciones largas.');
assert.match(appSource, /data-narration-seek/, 'Cada reproductor debe incluir una barra de avance.');
assert.match(appSource, /function seekNarration/, 'La barra debe permitir navegar a un punto concreto.');
assert.match(appSource, /narrationPositionAt/, 'La navegación debe abarcar todas las partes de una narración larga.');
assert.match(appSource, /Voz del dispositivo · avance estimado/, 'La voz local debe ofrecer una línea de tiempo estimada.');
assert.match(appSource, /narrationSeekActive/, 'La reproducción no debe sobrescribir la barra mientras el usuario la arrastra.');
assert.match(appSource, /splitNarrationText\(narrationState\.text, 320\)/, 'La voz local debe dividir el contenido para permitir avance y retroceso.');

for (const file of ['index.html', 'assets/js/app.js', 'assets/js/cloud.js', 'assets/js/config.js']) {
  const source = await fs.readFile(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /OPENAI_API_KEY|sk-(?:proj-)?[A-Za-z0-9_-]{12,}/, `${file}: nunca debe exponer una llave de OpenAI.`);
}

console.log(`Audio manifest unit OK: ${Object.keys(manifest).length} cursos protegidos.`);
