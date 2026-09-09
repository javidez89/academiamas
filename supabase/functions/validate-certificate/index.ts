import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

function environmentKey(jsonName: string, legacyName: string): string {
  const jsonValue = Deno.env.get(jsonName);
  if (jsonValue) {
    const parsed = JSON.parse(jsonValue);
    if (parsed?.default) {
      const configured = String(parsed.default);
      return String(Deno.env.get(configured) || configured).trim();
    }
  }
  const legacy = String(Deno.env.get(legacyName) || '').trim();
  if (!legacy) throw new Error(`Configuración pendiente: ${jsonName}`);
  return legacy;
}

function adminClient() {
  const url = String(Deno.env.get('SUPABASE_URL') || '').trim();
  if (!url) throw new Error('Configuración pendiente: SUPABASE_URL');
  return createClient(url, environmentKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function invalidCertificate(code: string) {
  return { valid: false, code };
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Método no permitido.' }, 405);

  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body?.certificateCode || '').trim().toUpperCase();
    if (!/^ACQA-[A-Z0-9]{12}$/.test(code)) return jsonResponse(request, invalidCertificate(code));

    const admin = adminClient();
    const result = await admin
      .from('certificates')
      .select('certificate_code,status,full_name,document_type,document_last4,public_pdf,pdf_path,course_key,course_name,estimated_hours,started_at,completed_at,issued_at')
      .eq('certificate_code', code)
      .eq('status', 'VALID')
      .maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return jsonResponse(request, invalidCertificate(code));

    let previewUrl: string | null = null;
    let downloadUrl: string | null = null;
    // Never publish legacy PDFs containing identification, even with a mistaken flag.
    if (result.data.public_pdf && result.data.document_type === null && result.data.document_last4 === null) {
      const filename = `Constancia-QAvance-${code}.pdf`;
      const [preview, download] = await Promise.all([
        admin.storage.from('certificates').createSignedUrl(result.data.pdf_path, 300),
        admin.storage.from('certificates').createSignedUrl(result.data.pdf_path, 300, { download: filename })
      ]);
      if (!preview.error && !download.error) {
        previewUrl = preview.data.signedUrl;
        downloadUrl = download.data.signedUrl;
      }
    }

    return jsonResponse(request, {
      valid: true,
      code: result.data.certificate_code,
      status: result.data.status,
      full_name: result.data.full_name,
      preview_url: previewUrl,
      download_url: downloadUrl,
      public_pdf: result.data.public_pdf === true && result.data.document_type === null && result.data.document_last4 === null,
      course_key: result.data.course_key,
      course_name: result.data.course_name,
      estimated_hours: result.data.estimated_hours,
      started_at: result.data.started_at,
      completed_at: result.data.completed_at,
      issued_at: result.data.issued_at
    });
  } catch (error) {
    console.error('validate-certificate error', error instanceof Error ? error.message : 'unknown');
    return jsonResponse(request, { error: 'No fue posible validar el certificado.' }, 500);
  }
});
