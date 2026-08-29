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
const budgetMigration = await fs.readFile(path.join(root, 'supabase', 'migrations', '20260828200525_free_course_audio_budget.sql'), 'utf8');
assert.ok(Object.keys(manifest.ctai || {}).some((contentId) => /^chapter-reference-\d+-part-1$/.test(contentId)), 'Los extractos largos deben dividirse en partes autorizadas.');
assert.match(edgeSource, /azure-speech-f0/, 'La función debe identificar el proveedor gratuito aprobado.');
assert.match(edgeSource, /es-CO-SalomeNeural/, 'La función debe usar la voz colombiana femenina aprobada.');
assert.match(edgeSource, /audio-24khz-48kbitrate-mono-mp3/, 'La función debe generar MP3 eficiente para almacenamiento permanente.');
assert.match(edgeSource, /FREE_MONTHLY_CHARACTER_LIMIT\s*=\s*500_000/, 'El límite mensual no debe superar los 500.000 caracteres gratuitos.');
assert.match(edgeSource, /body\.action\s*!==\s*'prefetch'/, 'Los estudiantes no deben provocar generaciones nuevas.');
assert.match(edgeSource, /reserve_course_audio_generation/, 'Cada generación debe reservar presupuesto global en el servidor.');
assert.match(edgeSource, /AZURE_SPEECH_KEY/, 'La llave de Azure debe obtenerse exclusivamente desde secretos del servidor.');
assert.match(edgeSource, /v2\//, 'Los audios naturales deben usar una ruta de caché versionada.');
assert.match(budgetMigration, /check \(limit_characters between 1 and 500000\)/, 'La base debe impedir configurar un límite superior al nivel gratuito.');
assert.match(budgetMigration, /reserved_characters \+ p_character_count > least/, 'La reserva debe bloquear el segmento que exceda el presupuesto mensual.');
assert.match(budgetMigration, /revoke all on function public\.reserve_course_audio_generation[^\n]+from public, anon, authenticated/, 'La reserva administrativa no debe ser invocable por estudiantes.');
assert.match(budgetMigration, /grant execute on function public\.reserve_course_audio_generation[^\n]+to service_role/, 'Solo el servicio administrativo puede reservar generaciones.');
assert.match(edgeSource, /allowedCourseAudioHash/, 'La función debe validar el contenido contra el catálogo.');
assert.match(edgeSource, /reference-/, 'La función debe aceptar narraciones de contenido de referencia.');
assert.match(edgeSource, /-part-/, 'La función debe aceptar partes consecutivas de narraciones largas.');
assert.match(appSource, /data-narration-seek/, 'Cada reproductor debe incluir una barra de avance.');
assert.match(appSource, /function seekNarration/, 'La barra debe permitir navegar a un punto concreto.');
assert.match(appSource, /narrationPositionAt/, 'La navegación debe abarcar todas las partes de una narración larga.');
assert.match(appSource, /Voz del dispositivo · avance sincronizado/, 'La voz local debe ofrecer una línea de tiempo sincronizada.');
assert.match(appSource, /narrationSeekActive/, 'La reproducción no debe sobrescribir la barra mientras el usuario la arrastra.');
assert.match(appSource, /DEVICE_NARRATION_CHUNK_LIMIT/, 'La voz local debe dividir el contenido con un límite estable para permitir avance y retroceso.');
assert.match(appSource, /utterance\.onboundary/, 'La voz local debe sincronizar el avance con los límites informados por el navegador.');
assert.match(appSource, /remaining < duration/, 'Los límites exactos deben avanzar al segmento siguiente sin repetir la última palabra.');

for (const file of ['index.html', 'assets/js/app.js', 'assets/js/cloud.js', 'assets/js/config.js']) {
  const source = await fs.readFile(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /OPENAI_API_KEY|AZURE_SPEECH_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-(?:proj-)?[A-Za-z0-9_-]{12,}/, `${file}: nunca debe exponer llaves privadas de audio o Supabase.`);
}

console.log(`Audio manifest unit OK: ${Object.keys(manifest).length} cursos protegidos.`);
