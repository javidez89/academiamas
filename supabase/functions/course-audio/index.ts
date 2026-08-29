import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { certificateCourse } from '../_shared/course-catalog.ts';
import { allowedCourseAudioHash } from '../_shared/course-audio-manifest.ts';

const AUDIO_BUCKET = 'course-audio';
const AUDIO_PROVIDER = 'azure-speech-f0';
const AUDIO_VOICE = 'es-CO-SalomeNeural';
const AUDIO_LOCALE = 'es-CO';
const AUDIO_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const AUDIO_VERSION = 'natural-v2';
const FREE_MONTHLY_CHARACTER_LIMIT = 500_000;

type JsonObject = Record<string, unknown>;

function environmentKey(jsonName: string, legacyName: string): string {
  const jsonValue = Deno.env.get(jsonName);
  if (jsonValue) {
    const parsed = JSON.parse(jsonValue);
    if (parsed?.default) {
      const configured = String(parsed.default);
      return String(Deno.env.get(configured) || configured).trim();
    }
  }
  return String(Deno.env.get(legacyName) || '').trim();
}

function projectClients(authorization: string) {
  const url = String(Deno.env.get('SUPABASE_URL') || '').trim();
  const publishableKey = environmentKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
  const secretKey = environmentKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !publishableKey || !secretKey) throw new Error('Configuración de Supabase incompleta.');
  return {
    secretKey,
    user: createClient(url, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false }
    }),
    admin: createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
  };
}

async function secretMatches(left: string, right: string): Promise<boolean> {
  if (!left || !right) return false;
  const [leftHash, rightHash] = await Promise.all([sha256(left), sha256(right)]);
  return leftHash === rightHash;
}

async function authenticatedContext(request: Request) {
  const authorization = String(request.headers.get('authorization') || '').trim();
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token || token === authorization) throw Object.assign(new Error('Debes iniciar sesión.'), { status: 401 });
  const clients = projectClients(authorization);
  if (await secretMatches(token, clients.secretKey)) {
    return { ...clients, currentUser: null, serviceRequest: true };
  }
  const { data, error } = await clients.user.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('La sesión no es válida.'), { status: 401 });
  return { ...clients, currentUser: data.user, serviceRequest: false };
}

function normalizedInput(body: JsonObject) {
  const course = certificateCourse(body.courseKey);
  const contentId = String(body.contentId || '').trim().toLowerCase();
  const text = String(body.text || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (!course) throw Object.assign(new Error('Curso no válido.'), { status: 400 });
  if (!/^(?:chapter-(?:reference-)?[0-9]{1,3}|lo-(?:reference-)?[a-z0-9.-]{2,100})(?:-part-[0-9]{1,3})?$/.test(contentId)) {
    throw Object.assign(new Error('Contenido de narración no válido.'), { status: 400 });
  }
  if (text.length < 20 || text.length > 4_096) {
    throw Object.assign(new Error('La narración debe tener entre 20 y 4096 caracteres.'), { status: 400 });
  }
  return { course, contentId, text };
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function audioResponse(request: Request, audio: Blob | ArrayBuffer, cacheStatus: string): Response {
  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-QAvance-Audio-Cache': cacheStatus,
      'X-QAvance-Audio-Provider': AUDIO_PROVIDER,
      'X-QAvance-Audio-Voice': AUDIO_VOICE,
      'X-QAvance-Audio-Disclosure': 'AI-generated, permanently cached'
    }
  });
}

async function verifyEnrollment(admin: ReturnType<typeof projectClients>['admin'], userId: string, courseKey: string) {
  const { data, error } = await admin
    .from('course_enrollments')
    .select('status')
    .eq('user_id', userId)
    .eq('course_key', courseKey)
    .in('status', ['active', 'completed'])
    .maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error('Debes estar inscrito en el curso.'), { status: 403 });
}

async function reserveGeneration(
  admin: ReturnType<typeof projectClients>['admin'],
  audioHash: string,
  courseKey: string,
  contentId: string,
  characterCount: number
) {
  const { data, error } = await admin.rpc('reserve_course_audio_generation', {
    p_audio_hash: audioHash,
    p_provider: AUDIO_PROVIDER,
    p_voice: AUDIO_VOICE,
    p_course_key: courseKey,
    p_content_id: contentId,
    p_character_count: characterCount,
    p_monthly_limit: FREE_MONTHLY_CHARACTER_LIMIT
  });
  if (error) throw error;
  return data as { status?: string; remainingCharacters?: number };
}

async function completeGeneration(admin: ReturnType<typeof projectClients>['admin'], audioHash: string, path: string) {
  const { error } = await admin.rpc('complete_course_audio_generation', {
    p_audio_hash: audioHash,
    p_object_path: path
  });
  if (error) throw error;
}

async function failGeneration(admin: ReturnType<typeof projectClients>['admin'], audioHash: string, message: string) {
  const { error } = await admin.rpc('fail_course_audio_generation', {
    p_audio_hash: audioHash,
    p_error: message
  });
  if (error) console.error('course-audio reservation cleanup error', error.message);
}

async function synthesizeWithAzure(text: string): Promise<ArrayBuffer> {
  const key = String(Deno.env.get('AZURE_SPEECH_KEY') || '').trim();
  const region = String(Deno.env.get('AZURE_SPEECH_REGION') || '').trim().toLowerCase();
  if (!key || !region) throw Object.assign(new Error('La voz natural aún no está configurada.'), { status: 503 });
  if (!/^[a-z0-9-]{2,40}$/.test(region)) throw Object.assign(new Error('La región de Azure Speech no es válida.'), { status: 503 });

  const ssml = `<speak version="1.0" xml:lang="${AUDIO_LOCALE}"><voice name="${AUDIO_VOICE}"><prosody rate="-4%">${escapeXml(text)}</prosody></voice></speak>`;
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': AUDIO_FORMAT,
      'User-Agent': 'QAvance-course-audio'
    },
    body: ssml
  });
  if (!response.ok) {
    const providerMessage = (await response.text()).slice(0, 300);
    console.error('Azure Speech error', response.status, providerMessage);
    const status = response.status === 429 ? 429 : 502;
    throw Object.assign(new Error(response.status === 429
      ? 'Azure Speech alcanzó su límite temporal de solicitudes.'
      : 'No fue posible generar la narración natural.'), { status, providerStatus: response.status });
  }
  return response.arrayBuffer();
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Método no permitido.' }, 405);

  let reservedAudioHash = '';
  try {
    const { admin, currentUser, serviceRequest } = await authenticatedContext(request);
    const body = await request.json() as JsonObject;
    const { course, contentId, text } = normalizedInput(body);
    if (!serviceRequest) await verifyEnrollment(admin, currentUser!.id, course.key);

    const contentHash = await sha256(text);
    if (!allowedCourseAudioHash(course.key, contentId, contentHash)) {
      throw Object.assign(new Error('El contenido solicitado no pertenece al material publicado del curso.'), { status: 400 });
    }

    const audioHash = await sha256(`${AUDIO_PROVIDER}|${AUDIO_VOICE}|${AUDIO_LOCALE}|${AUDIO_FORMAT}|${AUDIO_VERSION}|${text}`);
    const path = `v2/${course.key}/${contentId}/${audioHash}.mp3`;
    const cached = await admin.storage.from(AUDIO_BUCKET).download(path);
    if (!cached.error && cached.data) return audioResponse(request, cached.data, 'HIT');

    if (!serviceRequest || body.action !== 'prefetch') {
      throw Object.assign(new Error('Esta narración natural aún se está preparando. Se usará la voz del dispositivo.'), { status: 503 });
    }

    const azureKey = String(Deno.env.get('AZURE_SPEECH_KEY') || '').trim();
    const azureRegion = String(Deno.env.get('AZURE_SPEECH_REGION') || '').trim();
    if (!azureKey || !azureRegion) {
      throw Object.assign(new Error('Configura AZURE_SPEECH_KEY y AZURE_SPEECH_REGION antes de generar audios.'), { status: 503 });
    }

    const reservation = await reserveGeneration(admin, audioHash, course.key, contentId, text.length);
    if (reservation?.status === 'limit') {
      throw Object.assign(new Error(`Se alcanzó el límite gratuito mensual. Quedan ${Number(reservation.remainingCharacters) || 0} caracteres disponibles.`), { status: 429 });
    }
    if (reservation?.status === 'pending') {
      throw Object.assign(new Error('La narración ya está en proceso de generación.'), { status: 409 });
    }
    if (reservation?.status === 'failed') {
      throw Object.assign(new Error('La narración falló en este ciclo gratuito y se reintentará en el siguiente.'), { status: 503 });
    }
    if (reservation?.status === 'ready') {
      throw Object.assign(new Error('El registro del audio existe, pero el archivo no está disponible.'), { status: 503 });
    }
    if (reservation?.status !== 'reserved') throw new Error('No fue posible reservar la generación de audio.');
    reservedAudioHash = audioHash;

    const audio = await synthesizeWithAzure(text);
    const uploaded = await admin.storage.from(AUDIO_BUCKET).upload(path, audio, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000',
      upsert: false
    });
    if (uploaded.error && !String(uploaded.error.message || '').toLowerCase().includes('already exists')) throw uploaded.error;
    await completeGeneration(admin, audioHash, path);
    reservedAudioHash = '';
    return audioResponse(request, audio, 'MISS');
  } catch (error) {
    if (reservedAudioHash) {
      try {
        const authorization = String(request.headers.get('authorization') || '').trim();
        const { admin } = projectClients(authorization);
        await failGeneration(admin, reservedAudioHash, String((error as Error)?.message || 'Unknown generation error'));
      } catch (cleanupError) {
        console.error('course-audio failure registration error', cleanupError instanceof Error ? cleanupError.message : 'unknown');
      }
    }
    console.error('course-audio error', error instanceof Error ? error.message : 'unknown');
    const status = Number((error as { status?: number })?.status) || 500;
    return jsonResponse(request, {
      error: status >= 500 && status !== 503
        ? 'No fue posible preparar la narración.'
        : String((error as Error)?.message || 'No fue posible preparar la narración.')
    }, status);
  }
});
