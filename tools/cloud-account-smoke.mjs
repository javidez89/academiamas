import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { MOCK_SESSION, useMockedSupabase } from './helpers/mock-supabase.mjs';
import { completeCourseStudy, seedVerifiedCourseStudy } from './helpers/learning-progress.mjs';

const BASE_URL = (process.env.ACADEMIAQA_URL || 'http://127.0.0.1:8080/').replace(/\/+$/, '');
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await useMockedSupabase(page, MOCK_SESSION);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE_URL}/curso/ctfl/`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Inscríbete para comenzar/i }).waitFor();
  assert.equal(await page.evaluate(() => window.__supabaseMock?.enrollments?.length), 0, 'Consultar un curso no debe crear una matrícula automática.');
  await page.getByRole('button', { name: /Inscribirme al curso/i }).click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  await page.waitForFunction(() => window.__supabaseMock?.enrollments?.some((item) => (
    item.course_key === 'ctfl' && item.status === 'active'
  )));

  const enrollment = await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')
  ));
  assert.ok(enrollment.estimated_hours > 0, 'La matrícula debe guardar horas estimadas.');
  assert.equal(await page.evaluate(() => Boolean(window.AcademyCloud)), true, 'La capa cloud debe estar disponible.');
  await assert.rejects(
    page.evaluate(() => window.AcademyCloud.deleteEnrollment('ctfl')),
    'Un curso activo no debe poder eliminarse.'
  );

  await page.evaluate(() => window.AcademyCloud.syncProgress('ctfl', {
    studySeconds: 3_900,
    chapterActivity: {
      1: {
        studySeconds: 3_900,
        visitedAt: '2026-08-11T10:00:00Z',
        lastStudiedAt: '2026-08-11T11:05:00Z'
      }
    },
    byLo: {
      'FL-1.1.1': { ok: 2, bad: 1, chapter: 1, k: 'K2', objective: 'Objetivo de prueba' }
    },
    questionResults: {
      'CTFL-C1-001': {
        correct: true,
        lo: 'FL-1.1.1',
        chapter: 1,
        answeredAt: '2026-08-11T11:04:00Z'
      }
    }
  }));
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.study_seconds
  )), 0, 'El tiempo enviado por el navegador no debe modificar el contador oficial de la matrícula.');
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.verified_study_seconds
  )), 0, 'El tiempo verificado solo debe crecer mediante latidos autenticados.');
  assert.equal(await page.evaluate(() => window.__supabaseMock.calls.sync_course_activity?.p_study_seconds), 0,
    'La capa cloud no debe reenviar el tiempo calculado por el navegador como una métrica confiable.');
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.practice_answers
  )), 0, 'El JSON local no debe modificar la cobertura oficial de práctica.');

  const verifiedPractice = await page.evaluate(async () => {
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'practice', { chapterId: 1 });
    const question = window.AcademyRegistry.get('ctfl').questions.find((item) => Number(item.chapter) === 1);
    const foreignQuestion = window.AcademyRegistry.get('ctfl').questions.find((item) => Number(item.chapter) !== 1);
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, [question.id]);
    await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, question.id, question.correct);
    await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, question.id, [((question.correct[0] || 0) + 1) % 4]);
    let foreignRejected = false;
    try {
      await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, foreignQuestion.id, foreignQuestion.correct);
    } catch {
      foreignRejected = true;
    }
    const result = await window.AcademyCloud.completeVerifiedAssessment(attempt.attemptId);
    return { result, foreignRejected };
  });
  assert.equal(verifiedPractice.foreignRejected, true, 'El servidor debe rechazar preguntas ajenas al intento.');
  assert.equal(verifiedPractice.result.answered_count, 1, 'Un reintento de la misma pregunta cuenta una sola vez.');
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.practice_answers
  )), 1, 'La cobertura oficial debe crecer solo por preguntas verificadas y únicas.');

  await page.locator('[data-view="exam"]').first().click();
  await page.getByRole('button', { name: /^Iniciar simulacro$/i }).click();
  await page.locator('.questionBox').waitFor();
  await page.waitForFunction(() => (
    window.__supabaseMock?.learningActivity?.activity_type === 'simulator'
      && window.__supabaseMock?.verifiedAssessment?.activity_type === 'simulator'
  ));
  const simulatorActivity = await page.evaluate(() => structuredClone(window.__supabaseMock.learningActivity));
  assert.equal(simulatorActivity.course_key, 'ctfl', 'La presencia del simulacro debe quedar asociada al curso real.');
  assert.match(simulatorActivity.session_id, /^[0-9a-f-]{36}$/i, 'La presencia debe usar un identificador de sesión verificable.');
  assert.equal(await page.evaluate((sessionId) => (
    window.AcademyCloud.touchLearningActivity(sessionId)
  ), simulatorActivity.session_id), true, 'El latido autenticado debe mantener activa la sesión académica.');
  assert.equal(await page.evaluate(() => window.__supabaseMock.rpcCounts.touch_learning_activity), 1, 'El latido debe ejecutarse mediante la RPC protegida.');
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.verified_study_seconds
  )), 30, 'El servidor debe sumar tiempo verificado al procesar un latido válido.');
  await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  await page.waitForFunction((sessionId) => (
    window.__supabaseMock?.learningActivity?.session_id === sessionId
      && Boolean(window.__supabaseMock.learningActivity.ended_at)
  ), simulatorActivity.session_id);
  await page.waitForFunction(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.simulator_attempts === 1
  ));
  assert.equal(await page.evaluate(() => window.__supabaseMock.rpcCounts.record_simulator_completion || 0), 0,
    'La interfaz no debe invocar la RPC heredada que aceptaba puntajes del cliente.');

  const lockedFinalExam = page.locator('[data-view="finalExam"]').first();
  assert.equal(await lockedFinalExam.isDisabled(), true, 'El examen final debe permanecer bloqueado antes del 95%.');
  await completeCourseStudy(page, 'ctfl');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.navbtn[data-view="finalExam"]')?.disabled === true);
  assert.equal(await page.locator('[data-view="finalExam"]').first().isDisabled(), true,
    'Manipular el avance local no debe habilitar el examen final.');
  await seedVerifiedCourseStudy(page, 'ctfl');
  await page.waitForFunction(() => !document.querySelector('.navbtn[data-view="finalExam"]')?.disabled);
  await page.locator('[data-view="study"]').first().click();
  await page.getByRole('heading', { name: /Estudiar syllabus por cap/i }).waitFor();
  const firstChapterCardText = await page.locator('.chapterCard').first().innerText();
  assert.match(firstChapterCardText, /Completado/i, 'El temario debe mostrar que el capítulo verificable está completado.');
  assert.match(firstChapterCardText, /Preguntas exploradas\s+\d+\/\d+/i, 'El temario debe mostrar la cobertura verificable del capítulo.');
  assert.match(firstChapterCardText, /Dominio verificado\s+\d+%/i, 'El temario debe mostrar el dominio verificable del capitulo.');
  assert.match(firstChapterCardText, /Preguntas dominadas\s+\d+\/\d+/i, 'El dominio del capitulo debe mostrar su evidencia de respuestas únicas.');
  assert.match(firstChapterCardText, /Tiempo verificado\s+\d+ min.*Sugerido \d+ min/is, 'El temario debe separar los minutos verificados del dominio.');
  const courseMasteryText = await page.locator('.courseLearningSummary').innerText();
  assert.match(courseMasteryText, /Avance oficial\s+\d+%/i, 'El resumen debe mostrar el avance oficial del curso.');
  assert.match(courseMasteryText, /Cap[ií]tulos completados\s+\d+\/\d+/i, 'El resumen debe mostrar capítulos completados sobre el total.');
  assert.match(courseMasteryText, /Dominio verificado\s+\d+%.*Examen final \d+%/is, 'El dominio debe desglosar el resultado del examen final.');
  await page.locator('.chapterCard').first().click();
  await page.locator('#chapterDetail').getByRole('heading', { name: /Cap[ií]tulo 1 · Fundamentos de la Prueba/i }).waitFor();
  await page.waitForFunction(() => (
    window.__supabaseMock?.learningActivity?.activity_type === 'reading'
      && window.__supabaseMock.learningActivity.chapter_id === 1
  ));
  const readingActivity = await page.evaluate(() => structuredClone(window.__supabaseMock.learningActivity));
  assert.equal(readingActivity.chapter_id, 1, 'La sesión de lectura debe conservar el capítulo estudiado.');
  await page.evaluate((sessionId) => window.AcademyCloud.touchLearningActivity(sessionId), readingActivity.session_id);
  const verifiedStudy = await page.evaluate(() => window.AcademyCloud.getVerifiedStudyTime('ctfl'));
  assert.ok(Number(verifiedStudy.verified_study_seconds) >= 30, 'El resumen debe devolver tiempo verificado por servidor.');
  assert.ok(Number(verifiedStudy.chapters?.['1']) >= 30, 'El resumen debe atribuir el tiempo al capítulo real.');
  assert.ok(Number(verifiedStudy.activities?.reading) >= 30, 'El resumen debe separar el tiempo de lectura.');
  await page.getByRole('button', { name: /Escuchar el cap[ií]tulo 1/i }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Repetir narraci[oó]n/i }).first().isDisabled(), true, 'Repetir debe iniciar deshabilitado hasta preparar una narración.');
  const narrationSeek = page.locator('[data-narration-controls="chapter-1"] [data-narration-seek="chapter-1"]');
  await narrationSeek.waitFor();
  assert.equal(await narrationSeek.getAttribute('type'), 'range', 'La narración debe incluir una barra de avance accesible.');
  assert.equal(await narrationSeek.isDisabled(), true, 'La barra debe permanecer bloqueada hasta cargar el audio.');
  assert.match(await narrationSeek.getAttribute('aria-valuetext'), /^0:00 de 0:00$/, 'La barra debe anunciar tiempo transcurrido y duración.');
  const speed125 = page.locator('[data-narration-controls="chapter-1"] [data-speed="1.25"]');
  await speed125.click();
  assert.equal(await speed125.getAttribute('aria-pressed'), 'true', 'La velocidad 1.25x debe quedar seleccionada de forma accesible.');
  await page.getByRole('button', { name: /Escuchar el cap[ií]tulo 1/i }).click();
  await page.waitForFunction(() => {
    const seek = document.querySelector('[data-narration-controls="chapter-1"] [data-narration-seek="chapter-1"]');
    return seek && !seek.disabled && Number(seek.max) >= 7;
  });
  const narrationStart = Number(await narrationSeek.inputValue());
  assert.ok(narrationStart <= 0.5, `La barra debe iniciar cerca de 0:00, no en ${narrationStart.toFixed(2)} s.`);
  assert.match(await narrationSeek.getAttribute('aria-valuetext'), /^0:0[01] de 0:08$/, 'La narración debe anunciar su avance desde el inicio.');
  await page.waitForFunction((start) => {
    const seek = document.querySelector('[data-narration-controls="chapter-1"] [data-narration-seek="chapter-1"]');
    return Number(seek?.value || 0) > start + 0.5;
  }, narrationStart);
  const narrationDuration = Number(await narrationSeek.getAttribute('max'));
  await narrationSeek.evaluate((element, value) => {
    element.value = String(value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, narrationDuration / 2);
  await page.waitForFunction(() => {
    const seek = document.querySelector('[data-narration-controls="chapter-1"] [data-narration-seek="chapter-1"]');
    return Number(seek?.value || 0) >= 3;
  });
  assert.doesNotMatch(await narrationSeek.getAttribute('aria-valuetext'), /^0:00 de /, 'Mover la barra debe cambiar la posición reproducida.');
  await page.getByRole('button', { name: /Pausar el cap[ií]tulo 1/i }).click();
  const increaseText = page.getByRole('button', { name: /Aumentar tamaño del texto/i });
  await increaseText.click();
  assert.equal(await page.locator('.readingSizeControls output').textContent(), '110%', 'El lector debe aumentar el texto en pasos accesibles.');
  assert.equal(await page.evaluate(() => localStorage.getItem('academiaqa.accessibility.readingScale')), '1.1', 'La preferencia de lectura debe conservarse en el navegador.');
  await page.getByRole('heading', { name: /Aprende este cap[ií]tulo/i }).waitFor();
  const expandedMaterial = page.locator('#chapterDetail details.contentDetails').filter({ hasText: 'Material de estudio ampliado' }).first();
  await expandedMaterial.locator(':scope > summary').click();
  await expandedMaterial.getByRole('button', { name: /Escuchar el material ampliado del cap[ií]tulo 1/i }).waitFor();
  const firstObjectiveSummary = page.locator('#chapterDetail details.contentDetails > summary').filter({ hasText: 'FL-1.1.1' }).first();
  await firstObjectiveSummary.click();
  const firstObjective = firstObjectiveSummary.locator('..');
  const objectiveReference = firstObjective.locator('details').filter({ hasText: 'Contenido de referencia' }).first();
  await objectiveReference.locator('summary').click();
  await objectiveReference.getByRole('button', { name: /Escuchar el contenido de referencia del objetivo FL-1.1.1/i }).waitFor();
  assert.equal(await page.getByText(/Explicaci[oó]n docente en espa[nñ]ol|fuente en espa[nñ]ol|Texto literal del syllabus/i).count(), 0, 'Los rótulos técnicos no deben aparecer en la experiencia del estudiante.');
  await page.getByText(/Caso de trabajo/i).waitFor();
  const enabledFinalExam = page.locator('[data-view="finalExam"]').first();
  assert.equal(await enabledFinalExam.isDisabled(), false, 'El examen final debe habilitarse al alcanzar el 95%.');
  await enabledFinalExam.click();
  await page.waitForURL('**/curso/ctfl/examen-final/');
  await page.getByRole('heading', { name: /^Examen final ·/i }).waitFor();
  await page.getByRole('button', { name: /Iniciar examen final/i }).click();
  await page.locator('.questionBox').waitFor();
  await page.waitForFunction(() => window.__supabaseMock?.learningActivity?.activity_type === 'final_exam');
  await page.getByRole('button', { name: 'Finalizar', exact: true }).click();
  await page.getByRole('heading', { name: /Resultado del examen final/i }).waitFor();
  await page.waitForFunction(() => Boolean(window.__supabaseMock?.learningActivity?.ended_at));
  assert.equal(await page.getByRole('columnheader', { name: /Respuesta correcta/i }).count(), 0, 'El examen final no debe revelar el banco en la revisión.');
  await page.waitForFunction(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.final_exam_attempts === 1
  ));
  assert.equal(await page.evaluate(() => window.__supabaseMock.rpcCounts.record_final_exam_completion || 0), 0,
    'La interfaz no debe invocar la RPC heredada que aceptaba el resultado final del cliente.');

  const verifiedPassingExam = await page.evaluate(async () => {
    const course = window.AcademyRegistry.get('ctfl');
    const sourceAttempt = [...window.__supabaseMock.verifiedAssessmentHistory]
      .reverse()
      .find((attempt) => attempt.activity_type === 'final_exam');
    const activity = await window.AcademyCloud.beginLearningActivity('ctfl', 'final_exam');
    const attempt = await window.AcademyCloud.startVerifiedAssessment(activity.sessionId, sourceAttempt.question_ids);
    for (const questionId of sourceAttempt.question_ids) {
      const question = course.questions.find((item) => item.id === questionId);
      await window.AcademyCloud.submitVerifiedAnswer(attempt.attemptId, questionId, question.correct);
    }
    return window.AcademyCloud.completeVerifiedAssessment(attempt.attemptId);
  });
  assert.equal(verifiedPassingExam.passed, true, 'El examen debe aprobarse únicamente con respuestas canónicas verificadas.');
  assert.equal(verifiedPassingExam.score, 100, 'El puntaje oficial debe calcularse en el backend simulado.');

  await page.locator('#app').getByRole('link', { name: 'Ver mi cuenta' }).click();
  await page.getByRole('heading', { name: /Mis cursos/i }).waitFor();
  await page.getByText('ISTQB® Certified Tester Foundation Level 4.0 (CTFL)').waitFor();
  const courseCard = page.locator('.accountCourseCard').filter({ hasText: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)' });
  const studyTime = courseCard.locator('.accountCourseMetrics > div').filter({ hasText: 'Tiempo verificado' }).locator('dd');
  await studyTime.waitFor();
  assert.match((await studyTime.textContent()) || '', /^\d+ h(?: \d+ min)?$/, 'Mi cuenta debe mostrar horas reales de estudio del curso.');
  await page.getByText('Avance por capítulo', { exact: true }).click();
  await page.getByText(/C1 · Fundamentos de la Prueba/i).waitFor();
  const firstAccountChapterText = await courseCard.locator('.accountChapterDetails li').first().innerText();
  assert.match(firstAccountChapterText, /Completado/i, 'Mi cuenta debe mostrar el logro verificable de la práctica del capítulo.');
  assert.match(firstAccountChapterText, /\d+\/\d+ preguntas dominadas/i, 'Mi cuenta debe mostrar las preguntas logradas sin premiar reintentos.');
  assert.match(firstAccountChapterText, /\d+\/\d+ min/i, 'Mi cuenta debe mostrar el tiempo del capitulo en minutos.');
  const accountCourseText = await courseCard.innerText();
  assert.match(accountCourseText, /Dominio verificado \d+%/i, 'Mi cuenta debe mostrar el dominio verificable del curso completo.');
  assert.match(accountCourseText, /Cap[ií]tulos completados \d+\/\d+.*examen final \d+%/i, 'Mi cuenta debe desglosar capítulos completados y examen final.');
  await courseCard.locator('.accountFinalStatus').getByText(/Aprobado · 100%/i).waitFor();
  await courseCard.locator('.accountStatus.completed').waitFor();
  const certificateButton = page.getByRole('button', { name: /Obtener certificado · USD 25/i });
  await certificateButton.waitFor();
  assert.equal(await certificateButton.isEnabled(), true, 'El certificado debe habilitarse al completar el 100%.');
  await certificateButton.click();
  await page.getByRole('heading', { name: /Obtén tu certificado de finalización/i }).waitFor();
  await page.getByText('USD 25', { exact: true }).waitFor();
  await page.getByText(/No equivale a una certificación oficial/i).waitFor();
  await page.getByRole('button', { name: 'Ahora no' }).click();
  assert.equal(await courseCard.getByRole('button', { name: 'Quitar de mi cuenta' }).count(), 0, 'La opción de ocultar no debe aparecer mientras el curso esté activo o completado.');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancelar curso' }).click();
  await page.getByText('Cancelado', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Quitar de mi cuenta' }).waitFor();
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.status
  )), 'cancelled');

  await page.getByRole('button', { name: 'Reactivar curso' }).click();
  await page.getByRole('heading', { name: /Panel de estudio/i }).waitFor();
  assert.equal(await page.evaluate(() => (
    window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl')?.status
  )), 'completed');

  await page.getByRole('link', { name: 'Ir al inicio' }).click();
  await page.getByText('1 cursos inscritos', { exact: true }).waitFor();
  await page.locator('[data-community-registered]').waitFor();
  assert.equal(await page.locator('[data-community-registered]').textContent(), '18', 'El inicio debe mostrar el total agregado de personas registradas.');
  assert.equal(await page.locator('[data-community-courses]').textContent(), '7', 'El inicio debe mostrar los cursos activos obtenidos de la nube.');
  assert.equal(await page.locator('[data-community-online]').textContent(), '4', 'El inicio debe mostrar usuarios autenticados conectados recientemente.');
  assert.equal(await page.locator('[data-community-active]').count(), 0, 'El inicio no debe mostrar una métrica separada de estudiantes en cuestionarios.');
  assert.doesNotMatch(await page.locator('.communityActivity').innerText(), /Estudiando ahora/i, 'El inicio no debe mostrar la métrica retirada.');

  await page.evaluate(() => document.querySelector('a[data-view="account"]')?.click());
  await page.getByRole('heading', { name: /Mis cursos/i }).waitFor();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancelar curso' }).click();
  await page.getByText('Cancelado', { exact: true }).waitFor();
  assert.notEqual(await page.evaluate(() => localStorage.getItem('istqb_ctfl_v2_progress')), null, 'Debe existir progreso local antes de ocultar el curso.');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Quitar de mi cuenta' }).click();
  await page.getByRole('link', { name: 'Explorar cursos' }).waitFor();
  assert.equal(await page.locator('.accountCourseCard').count(), 0, 'El curso ocultado debe desaparecer de Mi cuenta.');
  const archivedState = await page.evaluate(() => ({
    enrollment: window.__supabaseMock.enrollments.find((item) => item.course_key === 'ctfl') || null,
    progress: window.__supabaseMock.progressByCourse.has('ctfl'),
    attempts: window.__supabaseMock.verifiedAssessmentHistory.filter((item) => item.course_key === 'ctfl' && item.activity_type === 'final_exam').length,
    localProgress: localStorage.getItem('istqb_ctfl_v2_progress'),
    activeCourse: localStorage.getItem('academy_active_course'),
    rpcArgs: window.__supabaseMock.calls.archive_cancelled_course
  }));
  assert.equal(archivedState.enrollment?.status, 'cancelled', 'La matrícula cancelada debe conservarse en la nube.');
  assert.ok(archivedState.enrollment?.hidden_at, 'La matrícula debe quedar oculta de forma reversible.');
  assert.equal(archivedState.progress, true, 'El progreso cloud del curso debe conservarse.');
  assert.ok(archivedState.attempts > 0, 'Los intentos finales del curso deben conservarse.');
  assert.notEqual(archivedState.localProgress, null, 'El progreso local debe conservarse como caché, no borrarse.');
  assert.equal(archivedState.activeCourse, '', 'El curso ocultado no debe conservarse como curso activo local.');
  assert.deepEqual(archivedState.rpcArgs, { p_course_key: 'ctfl' }, 'El ocultamiento debe usar la RPC autenticada del curso seleccionado.');

  assert.deepEqual(errors, [], `Errores de navegador:\n${errors.join('\n')}`);
  console.log('Cloud account smoke OK: matrícula, tiempo, capítulos, simulacro, examen final, cuenta y progreso por inscripción.');
} finally {
  await browser.close();
}
