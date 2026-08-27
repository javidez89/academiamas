import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const baselinePath = path.join(
  repoRoot,
  "supabase",
  "baselines",
  "2026-08-27-production.json"
);

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const localFiles = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql"));
const versions = new Set();
const errors = [];

function normalizedMd5(content) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return crypto.createHash("md5").update(normalized).digest("hex");
}

for (const file of localFiles) {
  const version = file.split("_", 1)[0];
  if (versions.has(version)) {
    errors.push(`Versión de migración duplicada: ${version}`);
  }
  versions.add(version);
}

for (const migration of baseline.migrations) {
  const file = `${migration.version}_${migration.name}.sql`;
  const migrationPath = path.join(migrationsDir, file);
  if (!fs.existsSync(migrationPath)) {
    errors.push(`Falta la migración aplicada en producción: ${file}`);
    continue;
  }

  const hash = normalizedMd5(fs.readFileSync(migrationPath, "utf8"));
  if (hash !== migration.normalizedMd5) {
    errors.push(
      `La migración histórica ${file} cambió: ${hash} != ${migration.normalizedMd5}`
    );
  }
}

if (errors.length) {
  throw new Error(`Auditoría de migraciones fallida:\n- ${errors.join("\n- ")}`);
}

console.log(
  `Migration baseline OK: ${baseline.migrations.length} migraciones de producción conservan versión y contenido.`
);
