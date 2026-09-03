'use strict';

(function initAcademyCloud(global) {
  const Auth = global.AcademyAuth;
  const Storage = global.AcademyStorage;
  const pendingSyncs = new Map();
  const PENDING_VERIFIED_ANSWERS_PREFIX = 'qavance_pending_verified_answers_v1_';
  let pendingVerifiedAnswerFlush = null;

  function requireUser() {
    const client = Auth?.getClient?.();
    const user = Auth?.getUser?.();
    if (!client || !user) throw new Error('Debes iniciar sesión con Google.');
    return { client, user };
  }

  function requireClient() {
    const client = Auth?.getClient?.();
    if (!client) throw new Error('No fue posible conectar con el servicio en la nube.');
    return client;
  }

  function normalizeCourseKey(value) {
    const key = String(value || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(key)) throw new Error('Curso no válido.');
    return key;
  }

  function normalizeLearningActivityType(value) {
    const type = String(value || '').trim().toLowerCase();
    if (!['reading', 'practice', 'simulator', 'final_exam'].includes(type)) {
      throw new Error('Tipo de actividad académica no válido.');
    }
    return type;
  }

  function normalizeChapterId(value) {
    if (value === null || value === undefined || value === '') return null;
    const chapterId = Math.trunc(Number(value));
    if (!Number.isInteger(chapterId) || chapterId < 1 || chapterId > 999) {
      throw new Error('Capítulo no válido.');
    }
    return chapterId;
  }

  function unwrap(data) {
    return Array.isArray(data) ? data[0] || null : data || null;
  }

  function pendingVerifiedAnswersKey(userId) {
    return `${PENDING_VERIFIED_ANSWERS_PREFIX}${String(userId || '').replace(/[^a-zA-Z0-9-]/g, '')}`;
  }

  function readPendingVerifiedAnswers(userId) {
    try {
      const value = JSON.parse(global.localStorage?.getItem(pendingVerifiedAnswersKey(userId)) || '[]');
      return Array.isArray(value) ? value.filter((item) => item?.attemptId && item?.questionId) : [];
    } catch {
      return [];
    }
  }

  function writePendingVerifiedAnswers(userId, items) {
    try {
      const key = pendingVerifiedAnswersKey(userId);
      if (items.length) global.localStorage?.setItem(key, JSON.stringify(items));
      else global.localStorage?.removeItem(key);
      return true;
    } catch (error) {
      console.warn('No fue posible actualizar la cola local de respuestas verificables.', error);
      return false;
    }
  }

  function emitVerifiedAnswerSync(detail = {}) {
    global.dispatchEvent?.(new CustomEvent('academiaqa:verified-answer-sync', { detail }));
  }

  function rememberPendingVerifiedAnswer(userId, attemptId, questionId, selectedIndices) {
    const items = readPendingVerifiedAnswers(userId);
    const key = `${attemptId}|${questionId}`;
    const next = items.filter((item) => `${item.attemptId}|${item.questionId}` !== key);
    next.push({ attemptId, questionId, selectedIndices, queuedAt: new Date().toISOString() });
    if (!writePendingVerifiedAnswers(userId, next)) {
      throw new Error('No fue posible proteger la respuesta en este dispositivo. Libera espacio e inténtalo nuevamente.');
    }
    emitVerifiedAnswerSync({ status: 'queued', remaining: next.length });
    return next.length;
  }

  function forgetPendingVerifiedAnswer(userId, attemptId, questionId) {
    const key = `${attemptId}|${questionId}`;
    const next = readPendingVerifiedAnswers(userId)
      .filter((item) => `${item.attemptId}|${item.questionId}` !== key);
    writePendingVerifiedAnswers(userId, next);
    return next.length;
  }

  function getPendingVerifiedAnswerCount() {
    const user = Auth?.getUser?.();
    return user?.id ? readPendingVerifiedAnswers(user.id).length : 0;
  }

  function isTerminalVerifiedAnswerError(error) {
    const code = String(error?.code || '');
    if (['22023', '42501', '55000'].includes(code)) return true;
    return code === '57014' && /assessment time expired/i.test(String(error?.message || ''));
  }

  function normalizeProgress(value) {
    return Storage.normalizeProgress(value);
  }

  function mergeProgress(localValue, cloudValue) {
    const local = normalizeProgress(localValue);
    const cloud = normalizeProgress(cloudValue);
    const byLo = { ...cloud.byLo };

    Object.entries(local.byLo).forEach(([lo, item]) => {
      const existing = byLo[lo];
      const localTotal = Number(item.ok || 0) + Number(item.bad || 0);
      const cloudTotal = Number(existing?.ok || 0) + Number(existing?.bad || 0);
      if (!existing || localTotal > cloudTotal) byLo[lo] = item;
    });

    const attemptMap = new Map();
    [...cloud.attempts, ...local.attempts].forEach((attempt) => {
      const key = [attempt.date, attempt.mode, attempt.total, attempt.correct, attempt.scorePct].join('|');
      attemptMap.set(key, attempt);
    });

    const historyMap = new Map();
    [...cloud.questionHistory, ...local.questionHistory].forEach((entry) => {
      historyMap.set([entry.id, entry.mode, entry.seenAt].join('|'), entry);
    });

    const questionResults = { ...cloud.questionResults };
    Object.entries(local.questionResults || {}).forEach(([questionId, item]) => {
      const existing = questionResults[questionId];
      if (!existing || String(item.answeredAt) >= String(existing.answeredAt)) questionResults[questionId] = item;
    });

    const chapterActivity = { ...cloud.chapterActivity };
    Object.entries(local.chapterActivity).forEach(([chapterId, item]) => {
      const existing = chapterActivity[chapterId] || {};
      chapterActivity[chapterId] = {
        studySeconds: Math.max(Number(existing.studySeconds || 0), Number(item.studySeconds || 0)),
        visitedAt: [existing.visitedAt, item.visitedAt].filter(Boolean).sort()[0] || '',
        lastStudiedAt: [existing.lastStudiedAt, item.lastStudiedAt].filter(Boolean).sort().at(-1) || ''
      };
    });

    return normalizeProgress({
      attempts: [...attemptMap.values()]
        .sort((left, right) => String(left.date).localeCompare(String(right.date)))
        .slice(-30),
      byLo,
      marked: [...new Set([...cloud.marked, ...local.marked])],
      questionHistory: [...historyMap.values()]
        .sort((left, right) => String(left.seenAt).localeCompare(String(right.seenAt)))
        .slice(-5_000),
      questionResults,
      studySeconds: Math.max(Number(local.studySeconds || 0), Number(cloud.studySeconds || 0)),
      chapterActivity
    });
  }

  async function getProfile() {
    const { client } = requireUser();
    const { data, error } = await client
      .from('profiles')
      .select('id,email,full_name,avatar_url,provider,country,created_at,updated_at')
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function listEnrollments() {
    const { client } = requireUser();
    const { data, error } = await client
      .from('course_enrollments')
      .select('course_key,status,started_at,cancelled_at,hidden_at,last_activity_at,estimated_hours,study_seconds,verified_study_seconds,study_verification_started_at,simulator_attempts,practice_answers,best_simulator_score,final_exam_attempts,best_final_exam_score,final_exam_passed,final_exam_passed_at,completed_at,created_at,updated_at')
      .order('started_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function listCertificates() {
    const { client } = requireUser();
    const { data, error } = await client
      .from('certificates')
      .select('certificate_code,course_key,course_name,full_name,document_type,document_last4,estimated_hours,started_at,completed_at,issued_at,status')
      .order('issued_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function listCertificateOrders() {
    const { client } = requireUser();
    const { data, error } = await client
      .from('certificate_orders')
      .select('id,course_key,reference,price_usd,trm_cop_per_usd,amount_in_cents,currency,status,wompi_status,created_at,expires_at,approved_at,consumed_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function certificateService(action, payload = {}) {
    const { client } = requireUser();
    const { data, error } = await client.functions.invoke('certificate-service', {
      body: { action, ...payload }
    });
    if (!error) return data && typeof data === 'object' ? data : {};

    let message = error.message || 'No fue posible procesar el certificado.';
    try {
      const details = await error.context?.json?.();
      if (details?.error) message = details.error;
    } catch {
      // The generic error is preserved when the response body is unavailable.
    }
    throw new Error(message);
  }

  async function createCertificateCheckout(courseKey) {
    return certificateService('create-checkout', { courseKey: normalizeCourseKey(courseKey) });
  }

  async function confirmCertificatePayment(transactionId) {
    return certificateService('confirm-payment', { transactionId: String(transactionId || '').trim() });
  }

  async function issueCertificate(input) {
    const value = input && typeof input === 'object' ? input : {};
    return certificateService('issue-certificate', {
      orderId: String(value.orderId || '').trim(),
      fullName: String(value.fullName || '').trim(),
      documentType: String(value.documentType || '').trim(),
      documentNumber: String(value.documentNumber || '').trim(),
      publicConsent: value.publicConsent === true
    });
  }

  async function getCertificateDownload(certificateCode) {
    return certificateService('download-certificate', {
      certificateCode: String(certificateCode || '').trim().toUpperCase()
    });
  }

  async function validateCertificate(certificateCode) {
    const client = requireClient();
    const { data, error } = await client.functions.invoke('validate-certificate', {
      body: { certificateCode: String(certificateCode || '').trim().toUpperCase() }
    });
    if (error) {
      let message = error.message || 'No fue posible validar el certificado.';
      try {
        const details = await error.context?.json?.();
        if (details?.error) message = details.error;
      } catch {
        // The generic error is preserved when the response body is unavailable.
      }
      throw new Error(message);
    }
    return data && typeof data === 'object' ? data : { valid: false };
  }

  async function enroll(courseKey, estimatedHours) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('enroll_in_course', {
      p_course_key: normalizeCourseKey(courseKey),
      p_estimated_hours: Math.max(1, Math.min(500, Number(estimatedHours) || 1))
    });
    if (error) throw error;
    return unwrap(data);
  }

  async function cancelEnrollment(courseKey) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('cancel_course', {
      p_course_key: normalizeCourseKey(courseKey)
    });
    if (error) throw error;
    return unwrap(data);
  }

  async function deleteEnrollment(courseKey) {
    const { client } = requireUser();
    const key = normalizeCourseKey(courseKey);
    const pending = pendingSyncs.get(key);
    if (pending?.timer) global.clearTimeout(pending.timer);
    pendingSyncs.delete(key);
    const { data, error } = await client.rpc('archive_cancelled_course', {
      p_course_key: key
    });
    if (error) throw error;
    if (data !== true) throw new Error('El curso no estaba cancelado o ya fue ocultado.');
    return true;
  }

  async function loadProgress(courseKey) {
    const { client, user } = requireUser();
    const { data, error } = await client
      .from('course_progress')
      .select('progress,schema_version,updated_at')
      .eq('user_id', user.id)
      .eq('course_key', normalizeCourseKey(courseKey))
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeProgress(data.progress) : normalizeProgress({});
  }

  async function syncProgress(courseKey, progressValue) {
    const { client, user } = requireUser();
    const key = normalizeCourseKey(courseKey);
    const progress = normalizeProgress(progressValue);
    const { error } = await client.from('course_progress').upsert({
      user_id: user.id,
      course_key: key,
      schema_version: Storage.SCHEMA_VERSION,
      progress,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,course_key' });
    if (error) throw error;

    const activity = await client.rpc('sync_course_activity', {
      p_course_key: key,
      p_practice_answers: 0,
      p_study_seconds: 0
    });
    if (activity.error) throw activity.error;
    return progress;
  }

  async function getCourseAudio(courseKey, contentId, text) {
    const { client } = requireUser();
    const { data, error } = await client.functions.invoke('course-audio', {
      body: {
        courseKey: normalizeCourseKey(courseKey),
        contentId: String(contentId || '').slice(0, 120),
        text: String(text || '').slice(0, 4_096)
      }
    });
    if (error) {
      let message = error.message || 'No fue posible cargar la narración.';
      try {
        const payload = await error.context?.json?.();
        if (payload?.error) message = payload.error;
      } catch {}
      throw new Error(message);
    }
    if (!(data instanceof Blob)) throw new Error('La respuesta de narración no contiene audio.');
    return data;
  }

  function queueProgressSync(courseKey, progressValue, delay = 700) {
    const key = normalizeCourseKey(courseKey);
    const current = pendingSyncs.get(key);
    if (current?.timer) global.clearTimeout(current.timer);
    const progress = normalizeProgress(progressValue);
    const timer = global.setTimeout(() => {
      pendingSyncs.delete(key);
      syncProgress(key, progress).catch((error) => {
        console.error('No fue posible sincronizar el progreso.', error);
      });
    }, delay);
    pendingSyncs.set(key, { progress, timer });
  }

  async function flushProgress(courseKey) {
    const key = normalizeCourseKey(courseKey);
    const pending = pendingSyncs.get(key);
    if (!pending) return null;
    global.clearTimeout(pending.timer);
    pendingSyncs.delete(key);
    return syncProgress(key, pending.progress);
  }

  async function startVerifiedAssessment(activitySessionId, questionIds) {
    const { client } = requireUser();
    await flushPendingVerifiedAnswers();
    const ids = [...new Set((Array.isArray(questionIds) ? questionIds : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean))];
    if (!ids.length || ids.length > 200) throw new Error('La evaluación no contiene un conjunto de preguntas válido.');
    const { data, error } = await client.rpc('start_verified_assessment', {
      p_activity_session_id: String(activitySessionId || '').trim(),
      p_question_ids: ids
    });
    if (error) throw error;
    const value = unwrap(data);
    if (!value?.attempt_id) throw new Error('No fue posible registrar el intento verificable.');
    return {
      attemptId: String(value.attempt_id),
      courseKey: String(value.course_key || ''),
      activityType: String(value.activity_type || ''),
      questionCount: Math.max(0, Math.trunc(Number(value.question_count) || 0)),
      status: String(value.status || ''),
      deadlineAt: String(value.deadline_at || '')
    };
  }

  async function submitVerifiedAnswer(attemptId, questionId, selectedIndices) {
    const { client, user } = requireUser();
    const normalizedAttemptId = String(attemptId || '').trim();
    const normalizedQuestionId = String(questionId || '').trim();
    const indices = [...new Set((Array.isArray(selectedIndices) ? selectedIndices : [])
      .map((value) => Math.trunc(Number(value)))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 3))]
      .sort((left, right) => left - right);
    if (!indices.length) throw new Error('Selecciona al menos una respuesta.');
    rememberPendingVerifiedAnswer(user.id, normalizedAttemptId, normalizedQuestionId, indices);
    const { data, error } = await client.rpc('submit_verified_answer', {
      p_attempt_id: normalizedAttemptId,
      p_question_id: normalizedQuestionId,
      p_selected_indices: indices
    });
    if (error) {
      if (isTerminalVerifiedAnswerError(error)) {
        const remaining = forgetPendingVerifiedAnswer(user.id, normalizedAttemptId, normalizedQuestionId);
        try { error.academySyncTerminal = true; } catch {}
        emitVerifiedAnswerSync({ status: 'rejected', submitted: 0, rejected: 1, remaining });
      }
      throw error;
    }
    forgetPendingVerifiedAnswer(user.id, normalizedAttemptId, normalizedQuestionId);
    await flushPendingVerifiedAnswers();
    return unwrap(data);
  }

  async function performPendingVerifiedAnswerFlush() {
    const { client, user } = requireUser();
    const queued = readPendingVerifiedAnswers(user.id);
    if (!queued.length) return { submitted: 0, rejected: 0, remaining: 0 };
    emitVerifiedAnswerSync({ status: 'syncing', submitted: 0, rejected: 0, remaining: queued.length });
    let submitted = 0;
    let rejected = 0;
    for (const item of queued) {
      const indices = [...new Set((Array.isArray(item.selectedIndices) ? item.selectedIndices : [])
        .map((value) => Math.trunc(Number(value)))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 3))]
        .sort((left, right) => left - right);
      if (!indices.length) {
        forgetPendingVerifiedAnswer(user.id, item.attemptId, item.questionId);
        rejected += 1;
        continue;
      }
      const { error } = await client.rpc('submit_verified_answer', {
        p_attempt_id: String(item.attemptId || '').trim(),
        p_question_id: String(item.questionId || '').trim(),
        p_selected_indices: indices
      });
      if (error) {
        if (isTerminalVerifiedAnswerError(error)) {
          forgetPendingVerifiedAnswer(user.id, item.attemptId, item.questionId);
          rejected += 1;
          continue;
        }
        break;
      }
      forgetPendingVerifiedAnswer(user.id, item.attemptId, item.questionId);
      submitted += 1;
    }
    const result = { submitted, rejected, remaining: readPendingVerifiedAnswers(user.id).length };
    emitVerifiedAnswerSync({ status: result.remaining ? 'pending' : 'synced', ...result });
    return result;
  }

  function flushPendingVerifiedAnswers() {
    if (pendingVerifiedAnswerFlush) return pendingVerifiedAnswerFlush;
    pendingVerifiedAnswerFlush = performPendingVerifiedAnswerFlush()
      .finally(() => {
        pendingVerifiedAnswerFlush = null;
      });
    return pendingVerifiedAnswerFlush;
  }

  async function completeVerifiedAssessment(attemptId) {
    const { client } = requireUser();
    const pending = await flushPendingVerifiedAnswers();
    if (pending.remaining > 0) {
      throw new Error('Hay respuestas pendientes de sincronizar. Revisa tu conexión e intenta finalizar nuevamente.');
    }
    const { data, error } = await client.rpc('complete_verified_assessment', {
      p_attempt_id: String(attemptId || '').trim()
    });
    if (error) throw error;
    const value = unwrap(data);
    if (!value?.attempt_id) throw new Error('No fue posible cerrar el intento verificable.');
    return value;
  }

  async function beginLearningActivity(courseKey, activityType, context = {}) {
    const { client } = requireUser();
    const chapterId = normalizeChapterId(context.chapterId);
    const { data, error } = await client.rpc('begin_learning_activity', {
      p_course_key: normalizeCourseKey(courseKey),
      p_activity_type: normalizeLearningActivityType(activityType),
      p_chapter_id: chapterId
    });
    if (error) throw error;
    const value = unwrap(data);
    if (!value?.session_id) throw new Error('No fue posible iniciar la actividad académica.');
    return {
      sessionId: String(value.session_id),
      courseKey: String(value.course_key || courseKey),
      activityType: String(value.activity_type || activityType),
      chapterId: normalizeChapterId(value.chapter_id),
      startedAt: String(value.started_at || ''),
      durationSeconds: Math.max(0, Math.trunc(Number(value.duration_seconds) || 0))
    };
  }

  async function getVerifiedStudyTime(courseKey) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('get_verified_study_time', {
      p_course_key: normalizeCourseKey(courseKey)
    });
    if (error) throw error;
    const value = unwrap(data);
    return value && typeof value === 'object' ? value : null;
  }

  async function getVerifiedLearningDashboard() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('get_verified_learning_dashboard');
    if (error) throw error;
    const value = data && typeof data === 'object' ? data : {};
    return {
      verified: value.verified === true,
      generatedAt: String(value.generated_at || ''),
      courses: Array.isArray(value.courses) ? value.courses : [],
      summary: value.summary && typeof value.summary === 'object' ? value.summary : {},
      legacyProgress: Array.isArray(value.legacy_progress) ? value.legacy_progress : [],
      legacyTransition: value.legacy_transition && typeof value.legacy_transition === 'object'
        ? value.legacy_transition
        : {}
    };
  }

  async function touchLearningActivity(sessionId) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('touch_learning_activity', {
      p_session_id: String(sessionId || '').trim()
    });
    if (error) throw error;
    return data === true;
  }

  async function endLearningActivity(sessionId) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('end_learning_activity', {
      p_session_id: String(sessionId || '').trim()
    });
    if (error) throw error;
    return data === true;
  }

  async function isAdmin() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('is_platform_admin');
    if (error) throw error;
    return data === true;
  }

  async function getMyAccessStatus() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('get_my_access_status');
    if (error) throw error;
    return data && typeof data === 'object'
      ? data
      : { blocked: false, blocked_at: null, reason: null, admin_role: null };
  }

  async function getPublicLearningActivity() {
    const client = requireClient();
    const { data, error } = await client.rpc('public_learning_activity_summary');
    if (error) throw error;
    const value = data && typeof data === 'object' ? data : {};
    return {
      registeredStudents: Math.max(0, Math.trunc(Number(value.registered_students) || 0)),
      activeCourses: Math.max(0, Math.trunc(Number(value.active_courses) || 0)),
      onlineStudents: Math.max(0, Math.trunc(Number(value.online_students) || 0)),
      activeStudents: Math.max(0, Math.trunc(Number(value.active_students) || 0)),
      measuredAt: String(value.measured_at || '')
    };
  }

  async function getAdminDashboardSummary() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_dashboard_summary');
    if (error) throw error;
    return data && typeof data === 'object' ? data : {};
  }

  async function getAdminLearningAnalytics({ from, to, courseKey = '' } = {}) {
    const { client } = requireUser();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (!Number.isFinite(fromDate.getTime()) || !Number.isFinite(toDate.getTime()) || fromDate >= toDate) {
      throw new Error('El periodo de métricas no es válido.');
    }
    const normalizedCourseKey = String(courseKey || '').trim()
      ? normalizeCourseKey(courseKey)
      : null;
    const { data, error } = await client.rpc('admin_verified_learning_analytics', {
      p_from: fromDate.toISOString(),
      p_to: toDate.toISOString(),
      p_course_key: normalizedCourseKey
    });
    if (error) throw error;
    return data && typeof data === 'object'
      ? data
      : { verified: false, summary: {}, courses: [], daily: [] };
  }

  async function listAdminUsers({ search = '', limit = 50, offset = 0 } = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_list_users', {
      p_search: String(search || '').trim().slice(0, 120),
      p_limit: Math.max(1, Math.min(100, Math.trunc(Number(limit) || 50))),
      p_offset: Math.max(0, Math.trunc(Number(offset) || 0))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { total: 0, users: [] };
  }

  async function listAdminCertificates({ search = '', limit = 100, offset = 0 } = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_list_certificates', {
      p_search: String(search || '').trim().slice(0, 120),
      p_limit: Math.max(1, Math.min(200, Math.trunc(Number(limit) || 100))),
      p_offset: Math.max(0, Math.trunc(Number(offset) || 0))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { total: 0, certificates: [] };
  }

  async function submitContactMessage(input = {}) {
    const client = requireClient();
    const { data, error } = await client.rpc('submit_contact_message', {
      p_full_name: String(input.fullName || '').trim(),
      p_email: String(input.email || '').trim().toLowerCase(),
      p_subject: String(input.subject || '').trim(),
      p_message: String(input.message || '').trim(),
      p_source_path: String(input.sourcePath || '').trim().slice(0, 300),
      p_website: String(input.website || '').trim()
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function listMyContactMessages() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('list_my_contact_messages');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function listMyAdminMessages() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('list_my_admin_messages');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function markMyAdminMessageRead(messageId) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('mark_my_admin_message_read', {
      p_message_id: String(messageId || '').trim()
    });
    if (error) throw error;
    return data === true;
  }

  async function sendAdminUserMessage(userId, subject, message) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_send_user_message', {
      p_user_id: String(userId || '').trim(),
      p_subject: String(subject || '').trim(),
      p_message: String(message || '').trim()
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function listAdminSentUserMessages({ userId = '', limit = 100, offset = 0 } = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_list_sent_user_messages', {
      p_user_id: String(userId || '').trim() || null,
      p_limit: Math.max(1, Math.min(200, Math.trunc(Number(limit) || 100))),
      p_offset: Math.max(0, Math.trunc(Number(offset) || 0))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { total: 0, messages: [] };
  }

  async function listApprovedCourseReviews(courseKey = '', limit = 8) {
    const client = requireClient();
    const { data, error } = await client.rpc('list_approved_course_reviews', {
      p_course_key: courseKey ? normalizeCourseKey(courseKey) : null,
      p_limit: Math.max(1, Math.min(24, Math.trunc(Number(limit) || 8)))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { average_rating: 0, total: 0, rating_distribution: {}, reviews: [] };
  }

  async function getMyCourseReview(courseKey) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('get_my_course_review', {
      p_course_key: normalizeCourseKey(courseKey)
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function submitCourseReview(courseKey, rating, comment = '') {
    const { client } = requireUser();
    const { data, error } = await client.rpc('submit_course_review', {
      p_course_key: normalizeCourseKey(courseKey),
      p_rating: Math.trunc(Number(rating)),
      p_comment: String(comment || '').trim().slice(0, 1000) || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function listAdminContactMessages({ status = '', search = '', limit = 100, offset = 0 } = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_list_contact_messages', {
      p_status: String(status || '').trim(),
      p_search: String(search || '').trim().slice(0, 120),
      p_limit: Math.max(1, Math.min(200, Math.trunc(Number(limit) || 100))),
      p_offset: Math.max(0, Math.trunc(Number(offset) || 0))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { total: 0, messages: [] };
  }

  async function updateAdminContactMessage(messageId, status, adminReply = '') {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_update_contact_message', {
      p_message_id: String(messageId || '').trim(),
      p_status: String(status || '').trim(),
      p_admin_reply: String(adminReply || '').trim() || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function listAdminCourseReviews({ status = '', search = '', limit = 100, offset = 0 } = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_list_course_reviews', {
      p_status: String(status || '').trim(),
      p_search: String(search || '').trim().slice(0, 120),
      p_limit: Math.max(1, Math.min(200, Math.trunc(Number(limit) || 100))),
      p_offset: Math.max(0, Math.trunc(Number(offset) || 0))
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : { total: 0, reviews: [] };
  }

  async function getPublicSocialSettings() {
    const client = requireClient();
    const { data, error } = await client.rpc('get_public_social_settings');
    if (error) throw error;
    return data && typeof data === 'object' ? data : {};
  }

  async function updateAdminSocialSettings(input = {}) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_update_social_settings', {
      p_linkedin_url: String(input.linkedinUrl || '').trim() || null,
      p_facebook_url: String(input.facebookUrl || '').trim() || null,
      p_tiktok_url: String(input.tiktokUrl || '').trim() || null,
      p_youtube_url: String(input.youtubeUrl || '').trim() || null,
      p_whatsapp_url: String(input.whatsappUrl || '').trim() || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : {};
  }

  async function moderateAdminCourseReview(reviewId, status) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_moderate_course_review', {
      p_review_id: String(reviewId || '').trim(),
      p_status: String(status || '').trim()
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function listAdminUserGovernance(userIds = []) {
    const { client } = requireUser();
    const ids = [...new Set((Array.isArray(userIds) ? userIds : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean))];
    if (!ids.length) return [];
    const { data, error } = await client.rpc('admin_list_user_governance', { p_user_ids: ids });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function setAdminUserBlocked(userId, blocked, reason = '') {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_set_user_blocked', {
      p_user_id: String(userId || '').trim(),
      p_blocked: Boolean(blocked),
      p_reason: String(reason || '').trim().slice(0, 500) || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function setAdminUserRole(userId, role = '') {
    const { client } = requireUser();
    const normalizedRole = ['admin', 'superadmin'].includes(String(role || '').trim().toLowerCase())
      ? String(role).trim().toLowerCase()
      : 'none';
    const { data, error } = await client.rpc('admin_set_user_role', {
      p_user_id: String(userId || '').trim(),
      p_role: normalizedRole
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function setAdminCertificateEligibility(userId, courseKey, enabled, reason = '') {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_set_certificate_eligibility', {
      p_user_id: String(userId || '').trim(),
      p_course_key: normalizeCourseKey(courseKey),
      p_enabled: Boolean(enabled),
      p_reason: String(reason || '').trim().slice(0, 500) || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  async function softDeleteAdminContactMessage(messageId) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_soft_delete_contact_message', {
      p_message_id: String(messageId || '').trim()
    });
    if (error) throw error;
    return data === true;
  }

  async function softDeleteAdminCourseReview(reviewId) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_soft_delete_course_review', {
      p_review_id: String(reviewId || '').trim()
    });
    if (error) throw error;
    return data === true;
  }

  async function updateAdminCertificateStatus(certificateId, action, reason = '') {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_update_certificate_status', {
      p_certificate_id: String(certificateId || '').trim(),
      p_action: String(action || '').trim().toLowerCase(),
      p_reason: String(reason || '').trim().slice(0, 500) || null
    });
    if (error) throw error;
    return data && typeof data === 'object' ? data : null;
  }

  global.AcademyCloud = Object.freeze({
    getProfile,
    listEnrollments,
    listCertificates,
    listCertificateOrders,
    createCertificateCheckout,
    confirmCertificatePayment,
    issueCertificate,
    getCertificateDownload,
    validateCertificate,
    enroll,
    cancelEnrollment,
    deleteEnrollment,
    loadProgress,
    syncProgress,
    getCourseAudio,
    queueProgressSync,
    flushProgress,
    startVerifiedAssessment,
    submitVerifiedAnswer,
    getPendingVerifiedAnswerCount,
    flushPendingVerifiedAnswers,
    completeVerifiedAssessment,
    beginLearningActivity,
    touchLearningActivity,
    endLearningActivity,
    getVerifiedStudyTime,
    getVerifiedLearningDashboard,
    getPublicLearningActivity,
    isAdmin,
    getMyAccessStatus,
    getAdminDashboardSummary,
    getAdminLearningAnalytics,
    listAdminUsers,
    listAdminCertificates,
    submitContactMessage,
    listMyContactMessages,
    listMyAdminMessages,
    markMyAdminMessageRead,
    sendAdminUserMessage,
    listAdminSentUserMessages,
    listApprovedCourseReviews,
    getMyCourseReview,
    submitCourseReview,
    listAdminContactMessages,
    updateAdminContactMessage,
    listAdminCourseReviews,
    moderateAdminCourseReview,
    getPublicSocialSettings,
    updateAdminSocialSettings,
    listAdminUserGovernance,
    setAdminUserBlocked,
    setAdminUserRole,
    setAdminCertificateEligibility,
    softDeleteAdminContactMessage,
    softDeleteAdminCourseReview,
    updateAdminCertificateStatus,
    mergeProgress
  });
}(window));
