import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sourceConfig = {
  ctfl: {
    file: process.env.CTFL_SYLLABUS_TEXT,
    fallback: path.join(process.env.TEMP || '', 'academiaqa-syllabus-audit', 'ctfl-es.txt'),
    language: 'es',
    source: 'ISTQB® Certified Tester Foundation Level Syllabus v4.0 · traducción oficial al español'
  },
  ctai: {
    file: process.env.CTAI_SYLLABUS_TEXT,
    fallback: path.join(process.env.TEMP || '', 'academiaqa-syllabus-audit', 'ctai-en.txt'),
    language: 'en',
    source: 'ISTQB® Certified Tester AI Testing Syllabus v2.0 · original en inglés'
  },
  'ct-genai': {
    file: process.env.CTGENAI_SYLLABUS_TEXT,
    fallback: path.join(process.env.TEMP || '', 'academiaqa-syllabus-audit', 'ct-genai-en.txt'),
    language: 'en',
    source: 'ISTQB® Certified Tester Testing with Generative AI Syllabus v1.1 · original en inglés'
  }
};

function loadCourse(key) {
  const file = path.join(root, 'courses', key, 'course-data.js');
  let course;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    AcademyRegistry: {
      register(registeredKey, data) {
        if (registeredKey !== key) throw new Error(`Clave inesperada en ${file}: ${registeredKey}`);
        course = data;
      }
    }
  });
  if (!course) throw new Error(`No se pudo leer ${file}`);
  return { file, course };
}

function saveCourse(key, file, course) {
  fs.writeFileSync(file, `'use strict';\nAcademyRegistry.register(${JSON.stringify(key)}, ${JSON.stringify(course)});\n`, 'utf8');
}

function cleanSourceLines(raw) {
  return raw.replace(/\r/g, '').split('\n').map((line) => line.trim()).filter((line) => {
    if (/^v\d+(?:\.\d+)?\b.*\b(?:Page|Página)\b/i.test(line)) return false;
    if (/^©\s*International Software Testing Qualifications Board/i.test(line)) return false;
    if (/^International Software Testing Qualifications Board$/i.test(line)) return false;
    if (/^Comité Internacional de Cualificación de Pruebas de$/i.test(line)) return false;
    if (/^Software\\nProbador$/i.test(line)) return false;
    if (/^Certified Tester$/i.test(line)) return false;
    if (/^Certified Tester.*Syllabus/i.test(line)) return false;
    if (/^(?:\d{2}\/\d{2}\/\d{4}\s+)?Testing with Generative AI \(CT-GenAI\)$/i.test(line)) return false;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(line)) return false;
    if (/^Certificado\.?$/i.test(line)) return false;
    if (/^Nivel básico$/i.test(line)) return false;
    if (/^\d{1,3}$/i.test(line)) return false;
    return true;
  });
}

function headingFor(line, index) {
  if (/\.{4,}|…{3,}/.test(line)) return null;
  const match = line.match(/^(\d+(?:\.\d+){1,2})\.?\s+(.+)$/);
  if (!match) return null;
  return { number: match[1], title: match[2], index, depth: match[1].split('.').length };
}

function sectionNumberForLo(lo) {
  return String(lo).replace(/^[^-]+-/, '');
}

function extractObjectiveStatement(lines, lo) {
  const start = lines.findIndex((line) => line.startsWith(`${lo} (`));
  if (start < 0) return '';
  const captured = [lines[start]];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[A-Za-z]+-\d+\.\d+\.\d+\s*\(/.test(line) || /^\d+(?:\.\d+){1,2}\.?\s+/.test(line)) break;
    if (!line) break;
    captured.push(line);
  }
  return captured.join(' ').replace(/\s+/g, ' ').trim();
}

function sourceIndex(lines) {
  const headings = lines.map(headingFor).filter(Boolean);
  const firstObjective = lines.findIndex((line) => /^[A-Za-z]+-1\.\d+\.\d+\s*\(/.test(line));
  const bodyStart = headings.find((heading) => heading.depth === 3 && heading.index > firstObjective)?.index ?? 0;
  const contentEnd = lines.findIndex((line, index) => index > bodyStart
    && /^\d+\.?\s+(?:References|Referencias|List of Abbreviations|Appendix|Apéndice)\b/i.test(line));
  const safeEnd = contentEnd > bodyStart ? contentEnd : lines.length;
  return {
    headings: headings.filter((heading) => heading.index >= bodyStart && heading.index < safeEnd),
    contentEnd: safeEnd
  };
}

function extractSection(lines, headings, contentEnd, requestedNumber) {
  const candidates = [requestedNumber];
  if (requestedNumber.endsWith('.1')) candidates.push(requestedNumber.slice(0, -2));
  const chapterNumber = Number(requestedNumber.split('.')[0]);
  const chapterEnd = headings.find((heading) => Number(heading.number.split('.')[0]) > chapterNumber)?.index ?? contentEnd;
  let startHeading;
  for (const number of candidates) {
    startHeading = headings.filter((heading) => heading.number === number && heading.index < chapterEnd).at(-1);
    if (startHeading) break;
  }
  if (!startHeading) return '';
  const nextHeading = headings.find((heading) => heading.index > startHeading.index && heading.depth <= startHeading.depth);
  const end = Math.min(nextHeading?.index ?? contentEnd, contentEnd);
  return lines.slice(startHeading.index, end).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function buildCaseStudy(chapter, courseName) {
  const examples = Array.isArray(chapter.examples) ? chapter.examples.filter(Boolean) : [];
  const pitfalls = Array.isArray(chapter.pitfalls) ? chapter.pitfalls.filter(Boolean) : [];
  const bullets = (chapter.theorySections || []).flatMap((section) => section.bullets || []).filter(Boolean);
  return {
    title: `${chapter.title} en un proyecto real`,
    context: examples[0] || `Un equipo debe aplicar ${chapter.title.toLowerCase()} durante la entrega de un producto digital.`,
    challenge: examples[1] || pitfalls[0] || `El equipo necesita tomar una decisión verificable sin perder de vista el riesgo y el objetivo del ${courseName}.`,
    approach: bullets[0] || chapter.summary || `Analiza el contexto, identifica la evidencia necesaria y aplica los conceptos del capítulo antes de decidir.`,
    evidence: bullets[1] || pitfalls[1] || 'La decisión debe quedar respaldada por resultados observables, trazabilidad y una explicación clara del riesgo residual.',
    attribution: 'Escenario didáctico elaborado por AcademiaQA.'
  };
}

function enrichTeachingContent(key, course) {
  const courseName = course.meta?.name || course.meta?.shortName || key;
  for (const chapter of course.chapters || []) {
    chapter.caseStudy = buildCaseStudy(chapter, courseName);
  }
  for (const objective of course.objectives || []) {
    if (!objective.example) {
      const chapter = course.chapters.find((item) => Number(item.id) === Number(objective.chapter));
      objective.example = `En un equipo real, aplica “${objective.text}” al escenario de ${String(chapter?.title || courseName).toLowerCase()} y documenta la evidencia que sustenta la decisión.`;
    }
    objective.exampleAttribution = 'Ejemplo didáctico elaborado por AcademiaQA.';
  }
}

function enrichOfficialSyllabus(key, course, config) {
  const sourceFile = config.file || config.fallback;
  if (!sourceFile || !fs.existsSync(sourceFile)) {
    throw new Error(`Falta el texto fuente para ${key}. Define la variable correspondiente o prepara ${config.fallback}.`);
  }
  const lines = cleanSourceLines(fs.readFileSync(sourceFile, 'utf8'));
  const source = sourceIndex(lines);
  const objectiveSections = new Map();

  for (const objective of course.objectives || []) {
    const sectionNumber = sectionNumberForLo(objective.lo);
    const sourceText = extractObjectiveStatement(lines, objective.lo);
    const syllabusExtract = extractSection(lines, source.headings, source.contentEnd, sectionNumber);
    if (!sourceText) throw new Error(`${key}: no se encontró el enunciado oficial ${objective.lo}`);
    if (syllabusExtract.length < 80) throw new Error(`${key}: extracto insuficiente para ${objective.lo}`);
    objective.sourceText = sourceText;
    objective.syllabusExtract = syllabusExtract;
    objective.syllabusSource = config.source;
    objective.syllabusLanguage = config.language;
    objectiveSections.set(objective.lo, syllabusExtract);
  }

  for (const chapter of course.chapters || []) {
    const chapterObjectives = (course.objectives || []).filter((objective) => Number(objective.chapter) === Number(chapter.id));
    const uniqueSections = [...new Set(chapterObjectives.map((objective) => objectiveSections.get(objective.lo)).filter(Boolean))];
    chapter.completeSyllabusText = uniqueSections.join('\n\n');
    chapter.syllabusSource = config.source;
    chapter.syllabusLanguage = config.language;
    chapter.sourceIntegrity = 'Extracto literal del syllabus indicado; solo se retiraron encabezados y pies de página repetidos.';
  }
}

const requestedKeys = new Set(String(process.env.SYLLABUS_COURSES || '').split(',').map((key) => key.trim()).filter(Boolean));
const courseKeys = fs.readdirSync(path.join(root, 'courses'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, 'courses', entry.name, 'course-data.js')))
  .map((entry) => entry.name)
  .filter((key) => !requestedKeys.size || requestedKeys.has(key));

const result = [];
for (const key of courseKeys) {
  const { file, course } = loadCourse(key);
  enrichTeachingContent(key, course);
  if (sourceConfig[key]) enrichOfficialSyllabus(key, course, sourceConfig[key]);
  saveCourse(key, file, course);
  result.push({
    key,
    chapters: course.chapters?.length || 0,
    objectives: course.objectives?.length || 0,
    exactSyllabus: Boolean(sourceConfig[key])
  });
}

console.log(JSON.stringify(result, null, 2));
