import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { certificateCourse } from '../_shared/course-catalog.ts';
import { allowedCourseAudioHash } from '../_shared/course-audio-manifest.ts';

const AUDIO_BUCKET = 'course-audio';
const DAILY_GENERATION_LIMIT = 40;
const OPENAI_SPEECH_URL = 'https://api.openai.com/v1/audio/speech';

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
    user: createClient(url, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false }
    }),
    admin: createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
  };
}

async function authenticatedContext(request: Request) {
  const authorization = String(request.headers.get('authorization') || '').trim();
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!token || token === authorization) throw Object.assign(new Error('Debes iniciar sesión.'), { status: 401 });
  const clients = projectClients(authorization);
  const { data, error } = await clients.user.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('La sesión no es válida.'), { status: 401 });
  return { ...clients, currentUser: data.user };
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

function audioResponse(request: Request, audio: Blob | ArrayBuffer, cacheStatus: string): Response {
  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-AcademiaQA-Audio-Cache': cacheStatus,
      'X-AcademiaQA-Audio-Disclosure': 'AI-generated'
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

async function consumeDailyGeneration(admin: ReturnType<typeof projectClients>['admin'], userId: string) {
  const { data, error } = await admin
    .rpc('consume_course_audio_generation', {
      p_user_id: userId,
      p_daily_limit: DAILY_GENERATION_LIMIT
    });
  if (error) throw error;
  if (data !== true) {
    throw Object.assign(new Error('Alcanzaste el límite diario de narraciones nuevas. Las narraciones ya generadas siguen disponibles.'), { status: 429 });
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Método no permitido.' }, 405);

  try {
    const { admin, currentUser } = await authenticatedContext(request);
    const body = await request.json() as JsonObject;
    const { course, contentId, text } = normalizedInput(body);
    await verifyEnrollment(admin, currentUser.id, course.key);

    const contentHash = await sha256(text);
    if (!allowedCourseAudioHash(course.key, contentId, contentHash)) {
      throw Object.assign(new Error('El contenido solicitado no pertenece al material publicado del curso.'), { status: 400 });
    }
    const audioHash = await sha256(`gpt-4o-mini-tts|marin|es-CO|natural-v1|${text}`);
    const path = `v1/${course.key}/${contentId}/${audioHash}.mp3`;
    const cached = await admin.storage.from(AUDIO_BUCKET).download(path);
    if (!cached.error && cached.data) return audioResponse(request, cached.data, 'HIT');

    await consumeDailyGeneration(admin, currentUser.id);
    const openAiKey = String(Deno.env.get('OPENAI_API_KEY') || '').trim();
    if (!openAiKey) throw Object.assign(new Error('La narración con OpenAI aún no está configurada.'), { status: 503 });

    const speech = await fetch(OPENAI_SPEECH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'marin',
        input: text,
        instructions: 'Habla en español latinoamericano neutro, con una voz cálida, conversacional y humana. Actúa como docente práctico de QA: usa un ritmo sereno, variaciones naturales de entonación, pausas breves al cambiar de idea y énfasis suave en los conceptos clave. Pronuncia las siglas letra por letra cuando corresponda y los términos en inglés con claridad. Evita sonar como locutor publicitario o leer listas de forma monótona.',
        response_format: 'mp3',
        speed: 1
      })
    });
    if (!speech.ok) {
      console.error('OpenAI speech error', speech.status);
      throw Object.assign(new Error('No fue posible generar la narración.'), { status: 502 });
    }

    const audio = await speech.arrayBuffer();
    const uploaded = await admin.storage.from(AUDIO_BUCKET).upload(path, audio, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000',
      upsert: false
    });
    if (uploaded.error && !String(uploaded.error.message || '').toLowerCase().includes('already exists')) throw uploaded.error;
    return audioResponse(request, audio, 'MISS');
  } catch (error) {
    console.error('course-audio error', error instanceof Error ? error.message : 'unknown');
    const status = Number((error as { status?: number })?.status) || 500;
    return jsonResponse(request, {
      error: status >= 500 && status !== 503
        ? 'No fue posible preparar la narración.'
        : String((error as Error)?.message || 'No fue posible preparar la narración.')
    }, status);
  }
});
