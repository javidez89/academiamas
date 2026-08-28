import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const helper = path.join(root, 'tools', 'marian-translate-jsonl.py');
const cacheFile = path.join(os.tmpdir(), 'academiaqa-syllabus-es-cache-v3.json');
const python = process.env.TRANSLATION_PYTHON || process.env.ARGOS_PYTHON || 'python';
const sourceTextCorrections = Object.freeze({
  'AI-3.1.4': 'AI-3.1.4 (K2) Resumir el uso de modelos preentrenados, ajuste fino y generación aumentada por recuperación',
  'AI-4.3.1': 'AI-4.3.1 (K2) Resumir los niveles de prueba utilizados para desarrollar sistemas de aprendizaje automático',
  'AI-5.1.3': 'AI-5.1.3 (K2) Resumir las distintas formas de prueba de canalizaciones de datos',
  'GenAI-3.1.3': 'GenAI-3.1.3 (K2) Resumir las técnicas de mitigación de alucinaciones, errores de razonamiento y sesgos de la IA generativa en tareas de prueba de software',
  'GenAI-3.1.4': 'GenAI-3.1.4 (K1) Recordar técnicas para mitigar el comportamiento no determinista de los LLM',
  'GenAI-3.2.3': 'GenAI-3.2.3 (K2) Resumir estrategias de mitigación para proteger la privacidad de los datos y reforzar la seguridad de la IA generativa en las pruebas de software',
  'GenAI-5.1.3': 'GenAI-5.1.3 (K2) Resumir criterios clave para seleccionar LLM o SLM para tareas de prueba de software en un contexto dado'
});

function polishSpanish(value) {
  const text = String(value || '');
  const code = text.match(/^([A-Za-z]+-\d+(?:\.\d+)+\s+\(K\d\)\s+)/)?.[1] || '';
  const body = code ? text.slice(code.length) : text;
  const polished = body
    .replace(/\bGenerative AI\b/gi, 'IA generativa')
    .replace(/\bAI\b/g, 'IA')
    .replace(/\bidiomas imperativos\b/gi, 'lenguajes imperativos')
    .replace(/\baprendizaje cl[aá]sico de (?:la )?m[aá]quina\b/gi, 'aprendizaje automático clásico')
    .replace(/\baprendizaje de (?:la )?m[aá]quina\b/gi, 'aprendizaje automático');
  return `${code}${polished}`;
}

function loadCourse(key) {
  const file = path.join(root, 'courses', key, 'course-data.js');
  let course;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    AcademyRegistry: { register: (_key, data) => { course = data; } }
  });
  if (!course) throw new Error(`No se pudo cargar ${key}.`);
  return { file, course };
}

function saveCourse(key, file, course) {
  fs.writeFileSync(file, `'use strict';\nAcademyRegistry.register(${JSON.stringify(key)}, ${JSON.stringify(course)});\n`, 'utf8');
}

function sourceInSpanish(value) {
  if (/traducci[oó]n al espa[nñ]ol de QAvance/i.test(String(value || ''))) return String(value);
  const source = String(value || '').replace(/\s*·\s*original en ingl[eé]s\s*$/i, '');
  return `${source} · traducción al español de QAvance basada en el original en inglés`;
}

function cacheKey(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
const worker = spawn(python, [helper], { stdio: ['pipe', 'pipe', 'inherit'] });
const output = readline.createInterface({ input: worker.stdout });
const pending = new Map();
output.on('line', (line) => {
  const response = JSON.parse(line);
  const request = pending.get(response.id);
  if (!request) return;
  pending.delete(response.id);
  if (response.error) request.reject(new Error(response.error));
  else request.resolve(response.text);
});

let sequence = 0;
async function translate(text) {
  const original = String(text || '').trim();
  if (!original) return '';
  const key = cacheKey(original);
  if (cache[key]) return cache[key];
  sequence += 1;
  const id = String(sequence);
  const translated = await new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.stdin.write(`${JSON.stringify({ id, text: original })}\n`);
  });
  if (!String(translated || '').trim()) throw new Error(`La traducción ${id} quedó vacía.`);
  cache[key] = translated;
  fs.writeFileSync(cacheFile, JSON.stringify(cache), 'utf8');
  process.stdout.write(`Traducidos ${sequence} bloques\r`);
  return translated;
}

async function translateObjectiveSource(objective) {
  const source = String(objective.sourceText || '');
  const level = source.match(/\((K\d)\)/i)?.[1]?.toUpperCase() || String(objective.k || '').toUpperCase();
  const body = source
    .replace(new RegExp(`^${String(objective.lo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '')
    .replace(/^\(K\d\)\s*/i, '')
    .trim();
  return `${objective.lo}${level ? ` (${level})` : ''} ${await translate(body)}`.trim();
}

const courseKeys = ['ctai', 'ct-genai'];
try {
  for (const key of courseKeys) {
    const { file, course } = loadCourse(key);
    const objectives = course.objectives || [];
    const extractTranslations = new Map();

    for (const objective of objectives) {
      if (objective.syllabusLanguage !== 'en') continue;
      objective.sourceText = await translateObjectiveSource(objective);
      const originalExtract = objective.syllabusExtract;
      if (!extractTranslations.has(originalExtract)) {
        extractTranslations.set(originalExtract, await translate(originalExtract));
      }
      objective.syllabusExtract = extractTranslations.get(originalExtract);
      objective.syllabusSource = sourceInSpanish(objective.syllabusSource);
      objective.syllabusLanguage = 'es';
      objective.sourceIntegrity = 'Traducción al español basada en el contenido del syllabus indicado.';
    }
    for (const objective of objectives) {
      objective.sourceText = sourceTextCorrections[objective.lo] || polishSpanish(objective.sourceText);
      objective.syllabusExtract = polishSpanish(objective.syllabusExtract);
    }

    for (const chapter of course.chapters || []) {
      const translatedSections = [...new Set(objectives
        .filter((objective) => Number(objective.chapter) === Number(chapter.id))
        .map((objective) => objective.syllabusExtract)
        .filter(Boolean))];
      chapter.completeSyllabusText = polishSpanish(translatedSections.join('\n\n'));
      chapter.syllabusSource = sourceInSpanish(chapter.syllabusSource);
      chapter.syllabusLanguage = 'es';
      chapter.sourceIntegrity = 'Traducción al español basada en el contenido del syllabus indicado.';
    }

    course.meta.sourceLanguage = 'ES';
    saveCourse(key, file, course);
    console.log(`\n${key}: ${objectives.length} objetivos y ${course.chapters.length} capítulos en español.`);
  }
} finally {
  worker.stdin.end();
}
