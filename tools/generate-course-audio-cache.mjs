import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCourseAudioInventory } from './lib/course-audio-content.mjs';

const FREE_MONTHLY_CHARACTER_LIMIT = 500_000;
const F0_REQUEST_INTERVAL_MS = 3_200;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const generate = args.includes('--generate');
const courseArg = valueAfter('--course');
const limitArg = Number(valueAfter('--limit') || 0);
const requestLimit = Number.isFinite(limitArg) && limitArg > 0 ? Math.floor(limitArg) : Number.POSITIVE_INFINITY;

function valueAfter(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function monthlyPlan(segments) {
  const cycles = [];
  let current = { characters: 0, segments: 0 };
  for (const segment of segments) {
    if (current.segments > 0 && current.characters + segment.text.length > FREE_MONTHLY_CHARACTER_LIMIT) {
      cycles.push(current);
      current = { characters: 0, segments: 0 };
    }
    current.characters += segment.text.length;
    current.segments += 1;
  }
  if (current.segments) cycles.push(current);
  return cycles;
}

const inventory = buildCourseAudioInventory(root)
  .filter((segment) => !courseArg || segment.courseKey === courseArg);
const totalCharacters = inventory.reduce((sum, segment) => sum + segment.text.length, 0);
const courses = new Set(inventory.map((segment) => segment.courseKey));
const cycles = monthlyPlan(inventory);

console.log(`Plan de audio: ${courses.size} cursos, ${inventory.length} segmentos, ${totalCharacters.toLocaleString('es-CO')} caracteres.`);
console.log(`Azure Speech F0: máximo rígido de ${FREE_MONTHLY_CHARACTER_LIMIT.toLocaleString('es-CO')} caracteres por mes.`);
cycles.forEach((cycle, index) => {
  console.log(`  Ciclo ${index + 1}: ${cycle.segments} segmentos, ${cycle.characters.toLocaleString('es-CO')} caracteres.`);
});

if (!generate) {
  console.log('Simulación terminada. Usa npm run audio:cache-generate -- --limit 20 para generar un lote controlado.');
  process.exit(0);
}

const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '').trim();
if (!supabaseUrl || !serviceKey) {
  throw new Error('Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY únicamente en el entorno administrativo local.');
}

const selected = inventory.slice(0, requestLimit);
const summary = { hit: 0, generated: 0, skipped: 0, failed: 0 };

for (let index = 0; index < selected.length; index += 1) {
  const segment = selected[index];
  const response = await fetch(`${supabaseUrl}/functions/v1/course-audio`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'prefetch',
      courseKey: segment.courseKey,
      contentId: segment.contentId,
      text: segment.text
    }),
    signal: AbortSignal.timeout(90_000)
  });

  if (response.ok) {
    const cache = response.headers.get('x-qavance-audio-cache') || 'UNKNOWN';
    await response.arrayBuffer();
    if (cache === 'HIT') summary.hit += 1;
    else summary.generated += 1;
    console.log(`[${index + 1}/${selected.length}] ${segment.courseKey}/${segment.contentId}: ${cache}`);
    if (cache === 'MISS') await sleep(F0_REQUEST_INTERVAL_MS);
    continue;
  }

  let message = `HTTP ${response.status}`;
  try {
    const payload = await response.json();
    if (payload?.error) message = payload.error;
  } catch {}

  if (response.status === 409) {
    summary.skipped += 1;
    console.log(`[${index + 1}/${selected.length}] ${segment.courseKey}/${segment.contentId}: omitido (${message})`);
    continue;
  }

  summary.failed += 1;
  console.error(`[${index + 1}/${selected.length}] ${segment.courseKey}/${segment.contentId}: ${message}`);
  if (response.status === 429 || /Configura AZURE_SPEECH/i.test(message)) {
    console.log('Lote detenido de forma segura; no se enviarán más solicitudes al proveedor.');
    break;
  }
}

console.log(`Resultado: ${summary.generated} generados, ${summary.hit} en caché, ${summary.skipped} omitidos, ${summary.failed} fallidos.`);
if (summary.failed) process.exitCode = 1;
