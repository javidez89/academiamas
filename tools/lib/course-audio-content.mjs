import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function normalizeNarrationText(value) {
  return String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function splitNarrationText(value, limit = 3_900) {
  const text = normalizeNarrationText(value);
  if (!text) return [];
  const chunks = [];
  let remaining = text;
  while (remaining.length > limit) {
    const window = remaining.slice(0, limit + 1);
    const sentenceBoundary = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '), window.lastIndexOf('; '));
    const wordBoundary = window.lastIndexOf(' ');
    const boundary = sentenceBoundary >= Math.floor(limit * 0.55)
      ? sentenceBoundary + 1
      : wordBoundary >= Math.floor(limit * 0.55) ? wordBoundary : limit;
    chunks.push(remaining.slice(0, boundary).trim());
    remaining = remaining.slice(boundary).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export function chapterNarration(chapter) {
  const sections = (chapter.theorySections || []).flatMap((section) => [
    section.title,
    section.body,
    ...(section.bullets || [])
  ]);
  const caseStudy = chapter.caseStudy ? [
    `Caso práctico: ${chapter.caseStudy.title || ''}`,
    chapter.caseStudy.context,
    chapter.caseStudy.challenge,
    chapter.caseStudy.approach,
    chapter.caseStudy.evidence
  ] : [];
  return normalizeNarrationText([
    `Capítulo ${chapter.id}. ${chapter.title}.`,
    chapter.summary,
    ...sections,
    ...caseStudy,
    ...(chapter.examples || [])
  ].filter(Boolean).join(' '));
}

export function objectiveNarration(objective) {
  return normalizeNarrationText([
    `Objetivo de aprendizaje ${objective.lo}, nivel ${objective.k}.`,
    objective.text,
    objective.theory,
    objective.remember ? `Recuerda: ${objective.remember}` : '',
    objective.example ? `Escenario práctico: ${objective.example}` : '',
    objective.trap ? `Evita esta confusión: ${objective.trap}` : ''
  ].filter(Boolean).join(' '));
}

export function chapterReferenceNarration(chapter) {
  return normalizeNarrationText([
    `Material de estudio ampliado del capítulo ${chapter.id}. ${chapter.title}.`,
    chapter.completeSyllabusText
  ].filter(Boolean).join(' '));
}

export function objectiveReferenceNarration(objective) {
  return normalizeNarrationText([
    `Contenido de referencia del objetivo de aprendizaje ${objective.lo}.`,
    objective.sourceText,
    objective.syllabusExtract
  ].filter(Boolean).join(' '));
}

export function loadCourse(root, key) {
  let course;
  const source = fs.readFileSync(path.join(root, 'courses', key, 'course-data.js'), 'utf8');
  vm.runInNewContext(source, {
    AcademyRegistry: { register: (_key, data) => { course = data; } }
  });
  if (!course) throw new Error(`No fue posible cargar el curso ${key}.`);
  return course;
}

export function loadCatalogKeys(root) {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(root, 'courses', 'catalog.js'), 'utf8');
  vm.runInNewContext(source, context);
  return Array.from(context.window.ACADEMY_CATALOG || [], (entry) => String(entry.key)).sort();
}

export function courseNarrationSegments(courseKey, course) {
  const segments = [];
  const add = (contentId, text) => {
    const chunks = splitNarrationText(text);
    chunks.forEach((chunk, index) => {
      segments.push({
        courseKey,
        contentId: chunks.length > 1 ? `${contentId}-part-${index + 1}` : contentId,
        text: chunk
      });
    });
  };

  for (const chapter of course.chapters || []) {
    add(`chapter-${chapter.id}`, chapterNarration(chapter));
    if (chapter.completeSyllabusText) add(`chapter-reference-${chapter.id}`, chapterReferenceNarration(chapter));
  }
  for (const objective of course.objectives || []) {
    add(`lo-${String(objective.lo).toLowerCase()}`, objectiveNarration(objective));
    if (objective.syllabusExtract) {
      add(`lo-reference-${String(objective.lo).toLowerCase()}`, objectiveReferenceNarration(objective));
    }
  }
  return segments;
}

export function buildCourseAudioInventory(root) {
  return loadCatalogKeys(root).flatMap((courseKey) => (
    courseNarrationSegments(courseKey, loadCourse(root, courseKey))
  ));
}
