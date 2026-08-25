'use strict';

(function initAcademyCloud(global) {
  const Auth = global.AcademyAuth;
  const Storage = global.AcademyStorage;
  const pendingSyncs = new Map();

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

  function unwrap(data) {
    return Array.isArray(data) ? data[0] || null : data || null;
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

  function answeredCount(progress) {
    return Object.keys(progress?.questionResults || {}).length;
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
      .select('course_key,status,started_at,cancelled_at,last_activity_at,estimated_hours,study_seconds,simulator_attempts,practice_answers,best_simulator_score,final_exam_attempts,best_final_exam_score,final_exam_passed,final_exam_passed_at,completed_at,created_at,updated_at')
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
    const { data, error } = await client.rpc('delete_cancelled_course', {
      p_course_key: key
    });
    if (error) throw error;
    if (data !== true) throw new Error('El curso no estaba cancelado o ya fue eliminado.');
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
      p_practice_answers: answeredCount(progress),
      p_study_seconds: Math.max(0, Math.trunc(Number(progress.studySeconds) || 0))
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

  async function recordSimulatorCompletion(courseKey, score) {
    const { client } = requireUser();
    const { data, error } = await client.rpc('record_simulator_completion', {
      p_course_key: normalizeCourseKey(courseKey),
      p_score: Math.max(0, Math.min(100, Number(score) || 0))
    });
    if (error) throw error;
    return unwrap(data);
  }

  async function recordFinalExamCompletion(courseKey, result) {
    const { client } = requireUser();
    const input = result && typeof result === 'object' ? result : {};
    const { data, error } = await client.rpc('record_final_exam_completion', {
      p_course_key: normalizeCourseKey(courseKey),
      p_score: Math.max(0, Math.min(100, Number(input.score) || 0)),
      p_earned_points: Math.max(0, Number(input.earnedPoints) || 0),
      p_total_points: Math.max(0, Number(input.totalPoints) || 0),
      p_passing_points: Math.max(0, Number(input.passingPoints) || 0),
      p_correct_answers: Math.max(0, Math.trunc(Number(input.correctAnswers) || 0)),
      p_total_questions: Math.max(0, Math.trunc(Number(input.totalQuestions) || 0)),
      p_duration_seconds: Math.max(0, Math.trunc(Number(input.durationSeconds) || 0))
    });
    if (error) throw error;
    return unwrap(data);
  }

  async function isAdmin() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('is_platform_admin');
    if (error) throw error;
    return data === true;
  }

  async function getAdminDashboardSummary() {
    const { client } = requireUser();
    const { data, error } = await client.rpc('admin_dashboard_summary');
    if (error) throw error;
    return data && typeof data === 'object' ? data : {};
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
    recordSimulatorCompletion,
    recordFinalExamCompletion,
    isAdmin,
    getAdminDashboardSummary,
    listAdminUsers,
    listAdminCertificates,
    mergeProgress
  });
}(window));
