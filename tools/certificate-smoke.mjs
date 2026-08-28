import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const now = '2026-08-17T15:00:00.000Z';
const certificate = {
  certificate_code: 'ACQA-123456789ABC',
  course_key: 'ctfl',
  course_name: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)',
  full_name: 'Javier QAvance',
  document_type: 'CC',
  document_last4: '4506',
  estimated_hours: 40,
  started_at: '2026-08-01T14:00:00.000Z',
  completed_at: '2026-08-15T18:00:00.000Z',
  issued_at: now,
  status: 'VALID'
};
const enrollment = {
  course_key: 'ctfl',
  status: 'completed',
  started_at: certificate.started_at,
  cancelled_at: null,
  last_activity_at: certificate.completed_at,
  estimated_hours: 40,
  study_seconds: 18000,
  simulator_attempts: 3,
  practice_answers: 250,
  best_simulator_score: 90,
  final_exam_attempts: 1,
  best_final_exam_score: 92,
  final_exam_passed: true,
  final_exam_passed_at: certificate.completed_at,
  completed_at: certificate.completed_at,
  created_at: certificate.started_at,
  updated_at: certificate.completed_at
};

const browser = await chromium.launch({ headless: true });
try {
  const publicPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await useMockedSupabase(publicPage, null, [], { certificates: [certificate] });
  await publicPage.goto(`${BASE_URL}/validar-certificado/?certificate-smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await publicPage.waitForFunction(() => document.querySelector('[data-view="verifyCertificate"]')?.getAttribute('aria-current') === 'page');
  await publicPage.getByLabel('Código del certificado').fill(certificate.certificate_code);
  await publicPage.getByRole('button', { name: 'Validar', exact: true }).click();
  await publicPage.getByText('Certificado válido', { exact: true }).waitFor();
  await publicPage.getByText(certificate.full_name, { exact: true }).waitFor();
  await publicPage.getByText('CC ••••4506', { exact: true }).waitFor();
  assert.equal(await publicPage.getByText(/123456789ABC.*4506/s).count(), 0, 'La validación no debe exponer un documento completo.');
  const publicOverflow = await publicPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(publicOverflow <= 1, `La validación móvil tiene ${publicOverflow}px de desbordamiento.`);

  const accountPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(accountPage, MOCK_SESSION, [enrollment], { certificates: [certificate] });
  await accountPage.goto(`${BASE_URL}/mi-cuenta/?certificate-smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await accountPage.getByRole('heading', { name: 'Certificados emitidos' }).waitFor();
  const certificateCard = accountPage.locator('.accountCertificateCard').filter({ hasText: certificate.certificate_code });
  await certificateCard.waitFor();
  await certificateCard.getByRole('button', { name: 'Ver', exact: true }).click();
  await accountPage.getByText('Certificado válido', { exact: true }).waitFor();
  assert.match(accountPage.url(), /\/validar-certificado\/\?codigo=ACQA-123456789ABC$/, 'La cuenta debe abrir una URL pública y compartible.');

  const paymentPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pendingOrder = {
    id: 'b56bffef-261a-4dd4-a1ad-9c1a10939d8b',
    course_key: 'ctfl',
    course_name: certificate.course_name,
    status: 'PENDING',
    price_usd: 25,
    amount_in_cents: 10000000,
    currency: 'COP'
  };
  await useMockedSupabase(paymentPage, MOCK_SESSION, [enrollment], {
    certificateOrders: [pendingOrder],
    verifiedCourses: [{
      ...enrollment,
      verified: true,
      progress_percent: 100,
      mastery_percent: 100,
      final_exam_eligible: true,
      chapters: []
    }]
  });
  await paymentPage.goto(`${BASE_URL}/mi-cuenta/?certificado=pago&id=transaction-test-1234`, { waitUntil: 'domcontentloaded' });
  await paymentPage.getByRole('heading', { name: /Confirma la información que aparecerá en el PDF/i }).waitFor();
  assert.equal(new URL(paymentPage.url()).pathname, '/mi-cuenta/', 'El retorno de Wompi debe conservar la ruta de Mi cuenta.');
  assert.equal(new URL(paymentPage.url()).search, '', 'La transacción debe limpiarse de la barra después de confirmarse.');
  await paymentPage.getByLabel('Nombre completo').fill('Javier QAvance');
  await paymentPage.getByLabel('Tipo de documento').selectOption('CC');
  await paymentPage.getByLabel('Número de documento').fill('1020304506');
  await paymentPage.locator('input[name="publicConsent"]').check();
  await paymentPage.getByRole('button', { name: 'Emitir certificado' }).click();
  await paymentPage.getByRole('heading', { name: 'Tu certificado ya está disponible' }).waitFor();
  await paymentPage.getByRole('dialog').getByText(certificate.course_name, { exact: true }).waitFor();
  const certificateCalls = await paymentPage.evaluate(() => window.__supabaseMock.calls.certificateService);
  assert.deepEqual(certificateCalls.map((call) => call.action), ['confirm-payment', 'issue-certificate'], 'El retorno debe confirmar el pago antes de emitir.');

  const adminCertificate = {
    ...certificate,
    email: 'javier@example.com',
    document: 'CC ••••4506'
  };
  const adminPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await useMockedSupabase(adminPage, MOCK_SESSION, [], {
    admin: true,
    adminCertificates: [adminCertificate],
    adminSummary: { issued_certificates: 1 }
  });
  await adminPage.goto(`${BASE_URL}/admin/?certificate-smoke=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await adminPage.getByRole('heading', { name: 'Certificados obtenidos' }).waitFor();
  await adminPage.getByText(certificate.certificate_code, { exact: true }).waitFor();
  await adminPage.locator('.adminCertificateTable').getByText('javier@example.com', { exact: true }).waitFor();
  const adminOverflow = await adminPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(adminOverflow <= 1, `El listado administrativo móvil tiene ${adminOverflow}px de desbordamiento.`);

  console.log('Certificate smoke OK: validación pública, cuenta y administración.');
} finally {
  await browser.close();
}
