import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const TARGETS = ['assets/js', 'courses', 'tools'];
const EXTENSIONS = new Set(['.js', '.mjs']);

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(filePath));
    if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) files.push(filePath);
  }

  return files;
}

const files = (await Promise.all(TARGETS.map((target) => collectFiles(path.join(ROOT, target)))))
  .flat()
  .sort();

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `Error de sintaxis en ${file}\n`);
    process.exit(result.status || 1);
  }
}

console.log(`Sintaxis OK: ${files.length} archivos JavaScript.`);
