import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';

const baseUrl = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/$/, '');
const now = new Date().toISOString();
const enrollment = {
  course_key: 'ctfl', status: 'active', started_at: now, last_activity_at: now,
  estimated_hours: 20, study_seconds: 0, verified_study_seconds: 0,
  simulator_attempts: 0, practice_answers: 0, best_simulator_score: 0,
  final_exam_attempts: 0, best_final_exam_score: 0, final_exam_passed: false
};
const approvedReview = {
  id: '2f07bb1c-b686-4f14-9015-61f02ecb2471', user_id: 'another-user', course_key: 'ctfl',
  rating: 5, comment: 'La práctica por objetivos fue muy útil.', status: 'approved',
  display_name: 'Laura M.', full_name: 'Laura Méndez', email: 'laura@example.com', created_at: now
};
const pendingReview = {
  id: 'de70e810-10df-487f-8aab-02e004c78e47', user_id: 'pending-user', course_key: 'ctfl',
  rating: 2, comment: 'Este comentario todavía no está aprobado.', status: 'pending',
  full_name: 'Pendiente Prueba', email: 'pendiente@example.com', created_at: now
};
const contactMessage = {
  id: '1c8cb68e-71b3-49d7-93c6-1bbda09cf5a4', full_name: 'Ana Torres',
  email: 'ana@example.com', subject: 'Consulta del curso', message: 'Quiero conocer el alcance del simulacro.',
  status: 'new', admin_reply: null, created_at: now, updated_at: now
};

const browser = await chromium.launch({ headless: true });
try {
  const anonymous = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await useMockedSupabase(anonymous, null);
  await anonymous.goto(`${baseUrl}/contactanos/?feedback=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await anonymous.getByLabel('Nombre completo').fill('María Gómez');
  await anonymous.getByLabel('Correo electrónico').fill('maria@example.com');
  await anonymous.getByLabel('Asunto').fill('Ayuda con mi cuenta');
  await anonymous.getByLabel('Mensaje').fill('Necesito orientación para recuperar el avance de un curso.');
  await anonymous.getByRole('button', { name: 'Enviar mensaje' }).click();
  await anonymous.getByText(/Mensaje enviado\. Lo revisaremos/i).waitFor();
  const savedContact = await anonymous.evaluate(() => window.__supabaseMock.contactMessages[0]);
  assert.equal(savedContact.email, 'maria@example.com');
  assert.equal(savedContact.status, 'new');
  assert.ok((await anonymous.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1);
  if (process.env.FEEDBACK_SCREENSHOTS === '1') await anonymous.screenshot({ path: `${process.env.TEMP}/qavance-contact-mobile.png`, fullPage: true });
  await anonymous.close();

  const student = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await student.route('https://lh3.googleusercontent.com/avatar-javier.png', (route) => route.fulfill({
    status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#12a89d"/></svg>'
  }));
  await useMockedSupabase(student, MOCK_SESSION, [enrollment], { courseReviews: [approvedReview, pendingReview] });
  await student.goto(`${baseUrl}/curso/ctfl/?feedback=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await student.getByRole('heading', { name: 'Califica este curso' }).waitFor();
  await student.locator('[data-auth-avatar]').waitFor({ state: 'visible' });
  assert.match(await student.locator('[data-auth-avatar]').getAttribute('src'), /^https:\/\/lh3\.googleusercontent\.com\/avatar-javier\.png/);
  await student.locator('label[for="courseRating5"]').click();
  await student.getByLabel(/Comentario/).fill('Curso claro y muy práctico para repasar el syllabus.');
  await student.getByRole('button', { name: 'Enviar calificación' }).click();
  await student.getByText('Pendiente de revisión', { exact: true }).waitFor();
  const savedReview = await student.evaluate(() => window.__supabaseMock.courseReviews.find((item) => item.user_id === 'f5faef51-a75a-4c3d-bd74-21fe19a3f60f'));
  assert.equal(savedReview.rating, 5);
  assert.equal(savedReview.status, 'pending');
  if (process.env.FEEDBACK_SCREENSHOTS === '1') await student.screenshot({ path: `${process.env.TEMP}/qavance-course-review.png`, fullPage: true });
  await student.close();

  const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(home, null, [], { courseReviews: [approvedReview, pendingReview] });
  await home.goto(`${baseUrl}/?feedback=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await home.getByRole('heading', { name: 'Qué piensan nuestros estudiantes' }).waitFor();
  await home.getByText(approvedReview.comment).waitFor();
  assert.equal(await home.getByText(pendingReview.comment).count(), 0, 'Una reseña pendiente nunca debe mostrarse públicamente.');
  await home.close();

  const admin = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(admin, MOCK_SESSION, [], {
    admin: true, adminSummary: {}, contactMessages: [contactMessage], courseReviews: [pendingReview]
  });
  await admin.goto(`${baseUrl}/admin/?feedback=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await admin.getByRole('button', { name: /Mensajes/ }).click();
  await admin.getByText(contactMessage.subject).waitFor();
  await admin.getByRole('button', { name: 'Marcar en gestión' }).click();
  await admin.getByText('En gestión', { exact: true }).waitFor();
  await admin.getByRole('button', { name: /Calificaciones/ }).click();
  await admin.getByText(pendingReview.comment).waitFor();
  await admin.getByRole('button', { name: 'Aprobar' }).click();
  await admin.getByText('Publicada', { exact: true }).waitFor();
  const moderation = await admin.evaluate(() => window.__supabaseMock.courseReviews[0].status);
  assert.equal(moderation, 'approved');
  if (process.env.FEEDBACK_SCREENSHOTS === '1') await admin.screenshot({ path: `${process.env.TEMP}/qavance-admin-reviews.png`, fullPage: true });
  await admin.close();

  console.log('Contact and reviews smoke OK: contacto, avatar, reseñas públicas y moderación.');
} finally {
  await browser.close();
}
