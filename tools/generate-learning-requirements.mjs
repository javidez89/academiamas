import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const START = '-- BEGIN GENERATED COURSE CHAPTER REQUIREMENTS';
const END = '-- END GENERATED COURSE CHAPTER REQUIREMENTS';

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function loadCourses() {
  const entries = await fs.readdir(path.join(ROOT, 'courses'), { withFileTypes: true });
  const courses = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(ROOT, 'courses', entry.name, 'course-data.js');
    try {
      await fs.access(filename);
    } catch {
      continue;
    }

    let registered = null;
    const sandbox = { AcademyRegistry: { register: (key, course) => { registered = { key, course }; } } };
    vm.createContext(sandbox);
    vm.runInContext(await fs.readFile(filename, 'utf8'), sandbox, { filename });
    assert.ok(registered, `${entry.name}: el archivo no registró el curso.`);
    assert.equal(registered.key, entry.name, `${entry.name}: la clave registrada no coincide con la carpeta.`);
    courses.push(registered);
  }
  return courses;
}

function normalizeCourses(courses) {
  return courses.map(({ key, course }) => {
    const chapters = Array.isArray(course.chapters) ? course.chapters : [];
    const objectives = Array.isArray(course.objectives) ? course.objectives : [];
    assert.ok(chapters.length, `${key}: no tiene capítulos.`);
    return {
      key,
      chapters: chapters.map((chapter) => {
        const chapterId = Number(chapter.id);
        const title = String(chapter.title || '').trim();
        const suggestedMinutes = Number(chapter.minutes);
        assert.ok(Number.isInteger(chapterId) && chapterId > 0, `${key}: capítulo inválido.`);
        assert.ok(title, `${key}/C${chapterId}: título vacío.`);
        assert.ok(Number.isInteger(suggestedMinutes) && suggestedMinutes > 0, `${key}/C${chapterId}: duración inválida.`);
        return {
          chapterId,
          title,
          suggestedMinutes,
          objectiveCount: objectives.filter((objective) => Number(objective.chapter) === chapterId).length
        };
      })
    };
  });
}

function renderSeed(courses) {
  const rows = courses.flatMap((course) => course.chapters.map((chapter) => (
    `(${sqlText(course.key)}, ${chapter.chapterId}, ${sqlText(chapter.title)}, ${chapter.suggestedMinutes}, ${chapter.objectiveCount})`
  )));
  return [
    START,
    `-- ${courses.length} cursos y ${rows.length} capítulos derivados de courses/*/course-data.js.`,
    'insert into private.course_chapter_requirements (',
    '  course_key, chapter_id, title, suggested_minutes, objective_count',
    ') values',
    `${rows.join(',\n')}`,
    'on conflict (course_key, chapter_id) do update set',
    '  title = excluded.title,',
    '  suggested_minutes = excluded.suggested_minutes,',
    '  objective_count = excluded.objective_count,',
    '  updated_at = now();',
    END
  ].join('\n');
}

const migrationPath = process.argv[3] ? path.resolve(ROOT, process.argv[3]) : null;
if (!migrationPath || !['--write', '--check'].includes(process.argv[2])) {
  throw new Error('Usa --write <migración.sql> o --check <migración.sql>.');
}

const courses = normalizeCourses(await loadCourses());
const seed = renderSeed(courses);
const current = await fs.readFile(migrationPath, 'utf8');
const start = current.indexOf(START);
const end = current.indexOf(END);
assert.ok(start >= 0 && end > start, `No se encontraron marcadores en ${path.relative(ROOT, migrationPath)}.`);
const expected = `${current.slice(0, start)}${seed}${current.slice(end + END.length)}`;

if (process.argv[2] === '--write') {
  await fs.writeFile(migrationPath, expected, 'utf8');
  console.log(`Requisitos generados: ${courses.length} cursos y ${courses.reduce((sum, course) => sum + course.chapters.length, 0)} capítulos.`);
} else {
  assert.equal(current, expected, `Los requisitos de ${path.relative(ROOT, migrationPath)} no coinciden con los cursos actuales.`);
  console.log(`Requisitos OK: ${courses.length} cursos y ${courses.reduce((sum, course) => sum + course.chapters.length, 0)} capítulos.`);
}
