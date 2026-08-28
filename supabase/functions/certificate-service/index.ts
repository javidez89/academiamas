import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { jsonResponse, corsHeaders } from '../_shared/cors.ts';
import { certificateCourse } from '../_shared/course-catalog.ts';
import {
  createCertificatePdf,
  preparationCourseName,
  type CertificateModule
} from '../_shared/certificate-pdf.ts';
import {
  buildWompiCheckout,
  fetchWompiTransaction,
  normalizedWompiStatus,
  wompiEnvironment
} from '../_shared/wompi.ts';

const CERTIFICATE_PRICE_USD = 25;
const CERTIFICATE_TEST_PRICE_USD = 1;
const CERTIFICATE_BUCKET = 'certificates';
const CANONICAL_ORIGIN = 'https://academiaqaoficial.com';
const DOCUMENT_TYPES = new Set(['CC', 'CE', 'NIT', 'PP', 'TI', 'DNI', 'RG', 'OTHER']);

type JsonObject = Record<string, unknown>;
type EnrollmentRecord = {
  course_key: string;
  status: string;
  started_at: string;
  estimated_hours: number;
  final_exam_passed: boolean;
  final_exam_passed_at: string | null;
  completed_at: string | null;
};
type CompletedEnrollmentRecord = EnrollmentRecord & { completed_at: string };

function environmentKey(jsonName: string, legacyName: string): string {
  const jsonValue = Deno.env.get(jsonName);
  if (jsonValue) {
    try {
      const parsed = JSON.parse(jsonValue);
      if (parsed?.default) {
        const configured = String(parsed.default);
        return String(Deno.env.get(configured) || configured).trim();
      }
    } catch {
      throw new Error(`La configuración ${jsonName} no es válida.`);
    }
  }
  const legacy = String(Deno.env.get(legacyName) || '').trim();
  if (!legacy) throw new Error(`Configuración pendiente: ${jsonName}`);
  return legacy;
}

function projectClients(authorization: string) {
  const url = String(Deno.env.get('SUPABASE_URL') || '').trim();
  if (!url) throw new Error('Configuración pendiente: SUPABASE_URL');
  const publishableKey = environmentKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
  const secretKey = environmentKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
  return {
    user: createClient(url, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false }
    }),
    admin: createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
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

function certificateCode(): string {
  return `ACQA-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}

function paymentReference(): string {
  return `ACQA-CERT-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;
}

function siteOrigin(): string {
  const configured = String(
    Deno.env.get('ACADEMIAQA_CERTIFICATE_ORIGIN')
      || CANONICAL_ORIGIN
  ).trim();
  try {
    return new URL(configured).origin;
  } catch {
    throw new Error('Configuración pendiente: ACADEMIAQA_CERTIFICATE_ORIGIN');
  }
}

function certificatePriceUsd(): number {
  return wompiEnvironment() === 'test' ? CERTIFICATE_TEST_PRICE_USD : CERTIFICATE_PRICE_USD;
}

function paymentRedirectUrl(): string {
  if (wompiEnvironment() !== 'test') {
    return `${CANONICAL_ORIGIN}/mi-cuenta/?certificado=pago`;
  }

  const configured = String(Deno.env.get('WOMPI_TEST_REDIRECT_URL') || '').trim();
  if (configured) return configured;

  const supabaseUrl = String(Deno.env.get('SUPABASE_URL') || '').replace(/\/$/, '');
  if (!supabaseUrl) throw new Error('Configuración pendiente: SUPABASE_URL');
  return `${supabaseUrl}/functions/v1/wompi-test-return`;
}

function publicCertificate(certificate: JsonObject | null): JsonObject | null {
  if (!certificate) return null;
  return {
    certificate_code: certificate.certificate_code,
    course_key: certificate.course_key,
    course_name: certificate.course_name,
    full_name: certificate.full_name,
    document_type: certificate.document_type,
    document_last4: certificate.document_last4,
    estimated_hours: certificate.estimated_hours,
    started_at: certificate.started_at,
    completed_at: certificate.completed_at,
    issued_at: certificate.issued_at,
    status: certificate.status
  };
}

function publicOrder(order: JsonObject | null): JsonObject | null {
  if (!order) return null;
  return {
    id: order.id,
    course_key: order.course_key,
    reference: order.reference,
    price_usd: order.price_usd,
    trm_cop_per_usd: order.trm_cop_per_usd,
    amount_in_cents: order.amount_in_cents,
    currency: order.currency,
    status: order.status,
    wompi_status: order.wompi_status,
    created_at: order.created_at,
    expires_at: order.expires_at,
    approved_at: order.approved_at
  };
}

async function completedEnrollment(
  user: ReturnType<typeof projectClients>['user'],
  admin: ReturnType<typeof projectClients>['admin'],
  userId: string,
  courseKey: string
): Promise<CompletedEnrollmentRecord> {
  const { data, error } = await admin
    .from('course_enrollments')
    .select('course_key,status,started_at,estimated_hours,final_exam_passed,final_exam_passed_at,completed_at')
    .eq('user_id', userId)
    .eq('course_key', courseKey)
    .maybeSingle();
  if (error) throw error;
  const enrollment = data as EnrollmentRecord | null;
  const dashboardResult = await user.rpc('get_verified_learning_dashboard');
  if (dashboardResult.error) throw dashboardResult.error;
  const verifiedCourse = (Array.isArray(dashboardResult.data?.courses) ? dashboardResult.data.courses : [])
    .find((item: JsonObject) => item.course_key === courseKey);
  if (
    !enrollment
    || verifiedCourse?.verified !== true
    || verifiedCourse?.final_exam_passed !== true
    || Number(verifiedCourse?.progress_percent || 0) !== 100
    || !verifiedCourse?.completed_at
  ) {
    throw Object.assign(new Error('El certificado se habilita al completar el curso y aprobar el examen final.'), { status: 403 });
  }
  return {
    ...enrollment,
    status: 'completed',
    final_exam_passed: true,
    final_exam_passed_at: String(verifiedCourse.completed_at),
    completed_at: String(verifiedCourse.completed_at)
  } as CompletedEnrollmentRecord;
}

async function certificateModules(
  admin: ReturnType<typeof projectClients>['admin'],
  courseKey: string
): Promise<CertificateModule[]> {
  const { data, error } = await admin.rpc('get_certificate_course_modules', { p_course_key: courseKey });
  if (error) throw error;
  const modules = (Array.isArray(data) ? data : [])
    .map((module) => ({
      order: Number((module as JsonObject).module_order),
      title: String((module as JsonObject).title || '').trim()
    }))
    .filter((module) => Number.isInteger(module.order) && module.order > 0 && module.title);
  if (!modules.length) {
    throw Object.assign(new Error('El contenido académico del curso aún no está configurado.'), { status: 503 });
  }
  return modules;
}

async function checkoutForOrder(order: JsonObject, email: string) {
  return buildWompiCheckout({
    reference: String(order.reference),
    customerEmail: email,
    redirectUrl: paymentRedirectUrl(),
    priceUsd: Number(order.price_usd),
    expiresAt: String(order.expires_at),
    trm: {
      value: Number(order.trm_cop_per_usd),
      date: String(order.created_at || '').slice(0, 10)
    }
  });
}

async function createCheckout(request: Request, body: JsonObject) {
  const { user, admin, currentUser } = await authenticatedContext(request);
  const course = certificateCourse(body.courseKey);
  if (!course) throw Object.assign(new Error('Curso no válido.'), { status: 400 });
  await completedEnrollment(user, admin, currentUser.id, course.key);

  const existingCertificate = await admin
    .from('certificates')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('course_key', course.key)
    .maybeSingle();
  if (existingCertificate.error) throw existingCertificate.error;
  if (existingCertificate.data) {
    return jsonResponse(request, {
      status: 'ISSUED',
      certificate: publicCertificate(existingCertificate.data)
    });
  }

  const existingOrderResult = await admin
    .from('certificate_orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('course_key', course.key)
    .in('status', ['PENDING', 'APPROVED'])
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingOrderResult.error) throw existingOrderResult.error;
  let order = existingOrderResult.data;

  if (order?.status === 'PENDING' && new Date(order.expires_at).getTime() <= Date.now()) {
    await admin.from('certificate_orders').update({ status: 'EXPIRED', updated_at: new Date().toISOString() }).eq('id', order.id);
    order = null;
  }

  if (order?.status === 'APPROVED') {
    return jsonResponse(request, { status: 'APPROVED', order: publicOrder(order), course });
  }

  if (!order) {
    const reference = paymentReference();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const checkout = await buildWompiCheckout({
      reference,
      customerEmail: String(currentUser.email || ''),
      redirectUrl: paymentRedirectUrl(),
      priceUsd: certificatePriceUsd(),
      expiresAt
    });
    const inserted = await admin.from('certificate_orders').insert({
      user_id: currentUser.id,
      course_key: course.key,
      reference,
      price_usd: checkout.priceUsd,
      trm_cop_per_usd: checkout.trm,
      amount_in_cents: checkout.amountInCents,
      currency: 'COP',
      status: 'PENDING',
      expires_at: expiresAt
    }).select('*').single();
    if (inserted.error) throw inserted.error;
    order = inserted.data;
    return jsonResponse(request, {
      status: 'PENDING',
      order: publicOrder(order),
      course,
      checkout: { ...checkout, checkoutUrl: checkout.checkoutUrl }
    });
  }

  const checkout = await checkoutForOrder(order, String(currentUser.email || ''));
  return jsonResponse(request, {
    status: 'PENDING',
    order: publicOrder(order),
    course,
    checkout: { ...checkout, checkoutUrl: checkout.checkoutUrl }
  });
}

async function confirmPayment(request: Request, body: JsonObject) {
  const { admin, currentUser } = await authenticatedContext(request);
  const transaction = await fetchWompiTransaction(String(body.transactionId || ''));
  const reference = String(transaction.reference || '');
  const orderResult = await admin
    .from('certificate_orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('reference', reference)
    .maybeSingle();
  if (orderResult.error) throw orderResult.error;
  const order = orderResult.data;
  if (!order) throw Object.assign(new Error('Este pago no corresponde a tu cuenta.'), { status: 403 });
  if (Number(transaction.amount_in_cents) !== Number(order.amount_in_cents)
    || String(transaction.currency) !== String(order.currency)) {
    throw Object.assign(new Error('Los valores reportados por Wompi no coinciden con la orden.'), { status: 409 });
  }

  const status = normalizedWompiStatus(transaction.status);
  const update: JsonObject = {
    status,
    wompi_status: status,
    wompi_transaction_id: String(transaction.id || body.transactionId || ''),
    wompi_payment_method_type: String(transaction.payment_method_type || ''),
    updated_at: new Date().toISOString()
  };
  if (status === 'APPROVED') update.approved_at = String(transaction.finalized_at || new Date().toISOString());
  const updated = await admin.from('certificate_orders').update(update).eq('id', order.id).select('*').single();
  if (updated.error) throw updated.error;

  return jsonResponse(request, {
    status,
    order: publicOrder(updated.data),
    course: certificateCourse(updated.data.course_key)
  });
}

function identityInput(body: JsonObject) {
  const fullName = String(body.fullName || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  const documentType = String(body.documentType || '').trim().toUpperCase();
  const documentNumber = String(body.documentNumber || '').normalize('NFKC').replace(/\s+/g, '').trim().toUpperCase();
  if (!/^[\p{L}\p{M} .'-]{3,120}$/u.test(fullName)) throw Object.assign(new Error('Ingresa tu nombre completo.'), { status: 400 });
  if (!DOCUMENT_TYPES.has(documentType)) throw Object.assign(new Error('Selecciona un tipo de documento válido.'), { status: 400 });
  if (!/^[A-Z0-9.-]{4,30}$/.test(documentNumber)) throw Object.assign(new Error('Ingresa un documento de identidad válido.'), { status: 400 });
  if (body.publicConsent !== true) throw Object.assign(new Error('Debes autorizar la validación pública del certificado.'), { status: 400 });
  const characters = documentNumber.replace(/[^A-Z0-9]/g, '');
  return { fullName, documentType, documentNumber, documentLast4: characters.slice(-4) };
}

async function issueCertificate(request: Request, body: JsonObject) {
  const { user, admin, currentUser } = await authenticatedContext(request);
  const orderId = String(body.orderId || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) throw Object.assign(new Error('Orden de certificado no válida.'), { status: 400 });
  const identity = identityInput(body);

  const orderResult = await admin
    .from('certificate_orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', currentUser.id)
    .maybeSingle();
  if (orderResult.error) throw orderResult.error;
  const order = orderResult.data;
  if (!order || order.status !== 'APPROVED' || !order.wompi_transaction_id) {
    throw Object.assign(new Error('Wompi aún no ha confirmado el pago de esta orden.'), { status: 409 });
  }

  const course = certificateCourse(order.course_key);
  if (!course) throw Object.assign(new Error('Curso no válido.'), { status: 400 });
  const enrollment = await completedEnrollment(user, admin, currentUser.id, course.key);

  const existing = await admin
    .from('certificates')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('course_key', course.key)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return jsonResponse(request, { certificate: publicCertificate(existing.data) });

  const modules = await certificateModules(admin, course.key);
  const code = certificateCode();
  const issuedAt = new Date().toISOString();
  const validationUrl = `${siteOrigin()}/validar-certificado/?codigo=${encodeURIComponent(code)}`;
  const courseName = preparationCourseName(course.name);
  const pdf = await createCertificatePdf({
    code,
    fullName: identity.fullName,
    documentType: identity.documentType,
    documentNumber: identity.documentNumber,
    courseName,
    estimatedHours: Number(enrollment.estimated_hours),
    startedAt: enrollment.started_at,
    completedAt: enrollment.completed_at,
    issuedAt,
    validationUrl,
    logoUrl: String(Deno.env.get('ACADEMIAQA_LOGO_URL') || `${siteOrigin()}/assets/img/qavance-logo.png`),
    signatureUrl: String(Deno.env.get('ACADEMIAQA_SIGNATURE_URL') || '').trim() || undefined,
    modules
  });
  const pdfPath = `${currentUser.id}/${code}.pdf`;
  const upload = await admin.storage.from(CERTIFICATE_BUCKET).upload(pdfPath, pdf, {
    contentType: 'application/pdf',
    cacheControl: '3600',
    upsert: false
  });
  if (upload.error) throw upload.error;

  const inserted = await admin.from('certificates').insert({
    user_id: currentUser.id,
    course_key: course.key,
    certificate_code: code,
    full_name: identity.fullName,
    document_type: identity.documentType,
    document_last4: identity.documentLast4,
    course_name: courseName,
    estimated_hours: Number(enrollment.estimated_hours),
    started_at: enrollment.started_at,
    completed_at: enrollment.completed_at,
    issued_at: issuedAt,
    status: 'VALID',
    pdf_path: pdfPath,
    payment_order_id: order.id
  }).select('*').single();
  if (inserted.error) {
    await admin.storage.from(CERTIFICATE_BUCKET).remove([pdfPath]);
    throw inserted.error;
  }

  const consumed = await admin.from('certificate_orders').update({
    consumed_at: issuedAt,
    updated_at: issuedAt
  }).eq('id', order.id);
  if (consumed.error) throw consumed.error;

  const filename = `Constancia-QAvance-${course.key}-${code}.pdf`;
  const signed = await admin.storage.from(CERTIFICATE_BUCKET).createSignedUrl(pdfPath, 900, { download: filename });
  if (signed.error) throw signed.error;
  return jsonResponse(request, {
    certificate: publicCertificate(inserted.data),
    validationUrl,
    downloadUrl: signed.data.signedUrl
  });
}

async function certificateDownload(request: Request, body: JsonObject) {
  const { admin, user, currentUser } = await authenticatedContext(request);
  const code = String(body.certificateCode || '').trim().toUpperCase();
  if (!/^ACQA-[A-Z0-9]{12}$/.test(code)) throw Object.assign(new Error('Código no válido.'), { status: 400 });
  const certificateResult = await admin.from('certificates').select('*').eq('certificate_code', code).maybeSingle();
  if (certificateResult.error) throw certificateResult.error;
  const certificate = certificateResult.data;
  if (!certificate) throw Object.assign(new Error('Certificado no encontrado.'), { status: 404 });
  if (certificate.user_id !== currentUser.id) {
    const adminAccess = await user.rpc('is_platform_admin');
    if (adminAccess.error || adminAccess.data !== true) throw Object.assign(new Error('No tienes permiso para descargar este certificado.'), { status: 403 });
  }
  const filename = `Constancia-QAvance-${certificate.course_key}-${code}.pdf`;
  const signed = await admin.storage.from(CERTIFICATE_BUCKET).createSignedUrl(certificate.pdf_path, 900, { download: filename });
  if (signed.error) throw signed.error;
  return jsonResponse(request, { downloadUrl: signed.data.signedUrl });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Método no permitido.' }, 405);

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 20_000) return jsonResponse(request, { error: 'Solicitud demasiado grande.' }, 413);
    const body = await request.json() as JsonObject;
    switch (String(body.action || '')) {
      case 'create-checkout':
        return await createCheckout(request, body);
      case 'confirm-payment':
        return await confirmPayment(request, body);
      case 'issue-certificate':
        return await issueCertificate(request, body);
      case 'download-certificate':
        return await certificateDownload(request, body);
      default:
        return jsonResponse(request, { error: 'Acción no válida.' }, 400);
    }
  } catch (error) {
    console.error('certificate-service error', error instanceof Error ? error.message : 'unknown');
    const status = Number((error as { status?: number })?.status)
      || (String((error as Error)?.message || '').startsWith('Configuración pendiente:') ? 503 : 500);
    return jsonResponse(request, {
      error: status >= 500 && status !== 503
        ? 'No fue posible procesar el certificado.'
        : String((error as Error)?.message || 'No fue posible procesar el certificado.')
    }, status);
  }
});
