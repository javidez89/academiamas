import { execFileSync } from 'node:child_process';

const [base, head = 'HEAD'] = process.argv.slice(2);
const conventional = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|content|seo)(\([a-z0-9._/-]+\))?!?: .{3,}$/;

if (!base || /^0+$/.test(base)) {
  console.log('Sin rango de commits para validar.');
  process.exit(0);
}

const subjects = execFileSync('git', ['log', '--format=%s', `${base}..${head}`], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((subject) => subject.trim())
  .filter(Boolean);

const invalid = subjects.filter((subject) => !conventional.test(subject));
if (invalid.length) {
  console.error('Commits que no cumplen Conventional Commits:');
  invalid.forEach((subject) => console.error(`- ${subject}`));
  process.exit(1);
}

console.log(`Conventional Commits OK: ${subjects.length} commits.`);
