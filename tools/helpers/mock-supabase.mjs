export function installMockSupabaseScript({ session, enrollments = [], admin = false, adminUsers = [], adminSummary = {}, certificates = [], certificateOrders = [], adminCertificates = [] }) {
  return ({ mockedSession, mockedEnrollments, mockedAdmin, mockedAdminUsers, mockedAdminSummary, mockedCertificates, mockedCertificateOrders, mockedAdminCertificates }) => {
    const persistedSignOut = localStorage.getItem('__mock_signed_out') === '1';
    const persistedSignOutCall = JSON.parse(localStorage.getItem('__mock_sign_out_call') || 'null');
    const activeSession = persistedSignOut ? null : mockedSession;
    const user = activeSession?.user || null;
    const progressByCourse = new Map();
    const state = {
      session: activeSession,
      enrollments: structuredClone(mockedEnrollments || []),
      progressByCourse,
      finalExamAttempts: [],
      admin: Boolean(mockedAdmin),
      adminUsers: structuredClone(mockedAdminUsers || []),
      adminSummary: structuredClone(mockedAdminSummary || {}),
      certificates: structuredClone(mockedCertificates || []),
      certificateOrders: structuredClone(mockedCertificateOrders || []),
      adminCertificates: structuredClone(mockedAdminCertificates || []),
      rpcCounts: {},
      calls: persistedSignOutCall ? { signOut: persistedSignOutCall } : {}
    };
    window.__supabaseMock = state;
    window.__authCalls = state.calls;

    function silentWavBlob(durationSeconds = 8, sampleRate = 8_000) {
      const sampleCount = Math.max(1, Math.trunc(durationSeconds * sampleRate));
      const buffer = new ArrayBuffer(44 + sampleCount * 2);
      const view = new DataView(buffer);
      const write = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
      write(0, 'RIFF');
      view.setUint32(4, 36 + sampleCount * 2, true);
      write(8, 'WAVE');
      write(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      write(36, 'data');
      view.setUint32(40, sampleCount * 2, true);
      return new Blob([buffer], { type: 'audio/wav' });
    }

    function enrollment(courseKey) {
      return state.enrollments.find((item) => item.course_key === courseKey) || null;
    }

    function ensureEnrollment(courseKey, estimatedHours) {
      let item = enrollment(courseKey);
      if (!item) {
        const now = new Date().toISOString();
        item = {
          course_key: courseKey,
          status: 'active',
          started_at: now,
          cancelled_at: null,
          last_activity_at: now,
          estimated_hours: Number(estimatedHours) || 1,
          study_seconds: 0,
          simulator_attempts: 0,
          practice_answers: 0,
          best_simulator_score: 0,
          final_exam_attempts: 0,
          best_final_exam_score: 0,
          final_exam_passed: false,
          final_exam_passed_at: null,
          completed_at: null,
          created_at: now,
          updated_at: now
        };
        state.enrollments.push(item);
      } else {
        item.status = item.final_exam_passed ? 'completed' : 'active';
        item.cancelled_at = null;
        item.estimated_hours = Number(estimatedHours) || item.estimated_hours;
      }
      return item;
    }

    function queryFor(table, columns) {
      const filters = {};
      return {
        eq(column, value) {
          filters[column] = value;
          return this;
        },
        async maybeSingle() {
          if (table === 'profiles') {
            return {
              data: user ? {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                avatar_url: null,
                provider: 'google',
                country: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } : null,
              error: null
            };
          }
          if (table === 'course_progress') {
            const saved = progressByCourse.get(filters.course_key);
            return {
              data: saved ? { progress: saved, schema_version: 5, updated_at: new Date().toISOString() } : null,
              error: null
            };
          }
          return { data: null, error: null };
        },
        async order() {
          if (table === 'course_enrollments') {
            return { data: structuredClone(state.enrollments), error: null };
          }
          if (table === 'certificates') {
            return { data: structuredClone(state.certificates), error: null };
          }
          if (table === 'certificate_orders') {
            return { data: structuredClone(state.certificateOrders), error: null };
          }
          return { data: [], error: null };
        }
      };
    }

    window.supabase = {
      createClient() {
        return {
          auth: {
            async getSession() {
              return { data: { session: state.session }, error: null };
            },
            onAuthStateChange() {
              return { data: { subscription: { unsubscribe() {} } } };
            },
            async signInWithOAuth(options) {
              state.calls.signIn = options;
              window.__authCalls = state.calls;
              return { data: { url: 'https://accounts.google.com/' }, error: null };
            },
            async signOut(options) {
              state.calls.signOut = options;
              window.__authCalls = state.calls;
              state.session = null;
              localStorage.setItem('__mock_signed_out', '1');
              localStorage.setItem('__mock_sign_out_call', JSON.stringify(options));
              return { error: null };
            },
            async exchangeCodeForSession(code) {
              localStorage.setItem('__auth_exchange_code', code);
              return { data: { session: state.session }, error: null };
            }
          },
          from(table) {
            return {
              select(columns) {
                return queryFor(table, columns);
              },
              async upsert(row) {
                if (table === 'course_progress') {
                  progressByCourse.set(row.course_key, structuredClone(row.progress));
                }
                return { data: row, error: null };
              }
            };
          },
          async rpc(name, args) {
            state.rpcCounts[name] = (state.rpcCounts[name] || 0) + 1;
            state.calls[name] = structuredClone(args || {});
            if (name === 'touch_user_presence') {
              return { data: new Date().toISOString(), error: null };
            }
            if (name === 'is_platform_admin') {
              return { data: state.admin, error: null };
            }
            if (name === 'admin_dashboard_summary') {
              return state.admin
                ? { data: structuredClone(state.adminSummary), error: null }
                : { data: null, error: { code: '42501', message: 'Administrator access required' } };
            }
            if (name === 'admin_list_users') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const search = String(args?.p_search || '').toLowerCase();
              const matches = state.adminUsers.filter((item) => !search
                || String(item.email || '').toLowerCase().includes(search)
                || String(item.full_name || '').toLowerCase().includes(search));
              return { data: { total: matches.length, users: structuredClone(matches) }, error: null };
            }
            if (name === 'admin_list_certificates') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const search = String(args?.p_search || '').toLowerCase();
              const matches = state.adminCertificates.filter((item) => !search
                || String(item.email || '').toLowerCase().includes(search)
                || String(item.full_name || '').toLowerCase().includes(search)
                || String(item.certificate_code || '').toLowerCase().includes(search)
                || String(item.course_name || '').toLowerCase().includes(search));
              return { data: { total: matches.length, certificates: structuredClone(matches) }, error: null };
            }
            if (name === 'enroll_in_course') {
              return { data: [structuredClone(ensureEnrollment(args.p_course_key, args.p_estimated_hours))], error: null };
            }
            if (name === 'cancel_course') {
              const item = enrollment(args.p_course_key);
              if (item) {
                item.status = 'cancelled';
                item.cancelled_at = new Date().toISOString();
              }
              return { data: item ? [structuredClone(item)] : [], error: null };
            }
            if (name === 'delete_cancelled_course') {
              const item = enrollment(args.p_course_key);
              if (!item || item.status !== 'cancelled') {
                return { data: null, error: { code: '55000', message: 'Cancelled enrollment required' } };
              }
              state.enrollments = state.enrollments.filter((entry) => entry.course_key !== args.p_course_key);
              progressByCourse.delete(args.p_course_key);
              state.finalExamAttempts = state.finalExamAttempts.filter((attempt) => attempt.p_course_key !== args.p_course_key);
              return { data: true, error: null };
            }
            if (name === 'sync_course_activity') {
              const item = enrollment(args.p_course_key);
              if (item) {
                item.practice_answers = Math.max(0, args.p_practice_answers || 0);
                item.study_seconds = Math.max(item.study_seconds || 0, args.p_study_seconds || 0);
              }
              return { data: item ? [structuredClone(item)] : [], error: null };
            }
            if (name === 'record_simulator_completion') {
              const item = enrollment(args.p_course_key);
              if (item) {
                item.simulator_attempts += 1;
                item.best_simulator_score = Math.max(item.best_simulator_score || 0, args.p_score || 0);
              }
              return { data: item ? [structuredClone(item)] : [], error: null };
            }
            if (name === 'record_final_exam_completion') {
              const item = enrollment(args.p_course_key);
              if (item) {
                const passed = Number(args.p_earned_points) >= Number(args.p_passing_points);
                item.final_exam_attempts += 1;
                item.best_final_exam_score = Math.max(item.best_final_exam_score || 0, args.p_score || 0);
                item.final_exam_passed = item.final_exam_passed || passed;
                if (passed) {
                  item.status = 'completed';
                  item.final_exam_passed_at ||= new Date().toISOString();
                  item.completed_at ||= new Date().toISOString();
                }
                state.finalExamAttempts.push({ ...structuredClone(args), passed });
              }
              return { data: item ? [structuredClone(item)] : [], error: null };
            }
            return { data: [], error: null };
          },
          functions: {
            async invoke(name, options = {}) {
              if (name === 'course-audio') return { data: silentWavBlob(), error: null };
              if (name === 'validate-certificate') {
                const code = String(options.body?.certificateCode || '').toUpperCase();
                const certificate = state.certificates.find((item) => item.certificate_code === code && item.status === 'VALID')
                  || state.adminCertificates.find((item) => item.certificate_code === code && item.status === 'VALID');
                return {
                  data: certificate ? {
                    valid: true,
                    code: certificate.certificate_code,
                    status: certificate.status,
                    full_name: certificate.full_name,
                    document: certificate.document || `${certificate.document_type || 'CC'} ••••${certificate.document_last4 || '0000'}`,
                    course_key: certificate.course_key,
                    course_name: certificate.course_name,
                    estimated_hours: certificate.estimated_hours,
                    started_at: certificate.started_at,
                    completed_at: certificate.completed_at,
                    issued_at: certificate.issued_at
                  } : { valid: false, code },
                  error: null
                };
              }
              if (name !== 'certificate-service') return { data: {}, error: null };
              const body = options.body || {};
              state.calls.certificateService ||= [];
              state.calls.certificateService.push(structuredClone(body));
              if (body.action === 'download-certificate') {
                return { data: { downloadUrl: 'data:application/pdf;base64,JVBERi0xLjQ=' }, error: null };
              }
              if (body.action === 'create-checkout') {
                const certificate = state.certificates.find((item) => item.course_key === body.courseKey);
                if (certificate) return { data: { status: 'ISSUED', certificate: structuredClone(certificate) }, error: null };
                const approved = state.certificateOrders.find((item) => item.course_key === body.courseKey && item.status === 'APPROVED');
                if (approved) return { data: { status: 'APPROVED', order: structuredClone(approved), course: { key: body.courseKey, name: approved.course_name || body.courseKey } }, error: null };
                const pending = state.certificateOrders.find((item) => item.course_key === body.courseKey && item.status === 'PENDING') || {
                  id: 'b56bffef-261a-4dd4-a1ad-9c1a10939d8b',
                  course_key: body.courseKey,
                  status: 'PENDING',
                  price_usd: 25,
                  amount_in_cents: 10000000,
                  currency: 'COP'
                };
                return { data: { status: 'PENDING', order: structuredClone(pending), course: { key: body.courseKey, name: pending.course_name || body.courseKey }, checkout: { priceUsd: 25, amountInCents: pending.amount_in_cents, checkoutUrl: 'https://checkout.wompi.co/p/?reference=ACQA-CERT-TEST' } }, error: null };
              }
              if (body.action === 'confirm-payment') {
                const order = state.certificateOrders[0] || { id: 'b56bffef-261a-4dd4-a1ad-9c1a10939d8b', course_key: 'ctfl' };
                order.status = 'APPROVED';
                return { data: { status: 'APPROVED', order: structuredClone(order), course: { key: order.course_key, name: order.course_name || 'CTFL 4.0' } }, error: null };
              }
              if (body.action === 'issue-certificate') {
                const order = state.certificateOrders.find((item) => item.id === body.orderId) || state.certificateOrders[0] || {};
                const certificate = {
                  certificate_code: 'ACQA-123456789ABC',
                  course_key: order.course_key || 'ctfl',
                  course_name: order.course_name || 'ISTQB Certified Tester Foundation Level 4.0 (CTFL)',
                  full_name: body.fullName,
                  document_type: body.documentType,
                  document_last4: String(body.documentNumber || '').replace(/[^A-Z0-9]/gi, '').slice(-4),
                  estimated_hours: 40,
                  started_at: '2026-08-01T00:00:00.000Z',
                  completed_at: '2026-08-15T00:00:00.000Z',
                  issued_at: new Date().toISOString(),
                  status: 'VALID'
                };
                state.certificates.push(certificate);
                return { data: { certificate: structuredClone(certificate), downloadUrl: 'data:application/pdf;base64,JVBERi0xLjQ=' }, error: null };
              }
              return { data: {}, error: null };
            }
          }
        };
      }
    };
  };
}

export async function useMockedSupabase(page, session, enrollments = [], options = {}) {
  await page.route('**/assets/vendor/supabase-2.112.3.js*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: ''
  }));
  await page.addInitScript(installMockSupabaseScript({ session, enrollments }), {
    mockedSession: session,
    mockedEnrollments: enrollments,
    mockedAdmin: Boolean(options.admin),
    mockedAdminUsers: options.adminUsers || [],
    mockedAdminSummary: options.adminSummary || {},
    mockedCertificates: options.certificates || [],
    mockedCertificateOrders: options.certificateOrders || [],
    mockedAdminCertificates: options.adminCertificates || []
  });
}

export const MOCK_USER = Object.freeze({
  id: 'f5faef51-a75a-4c3d-bd74-21fe19a3f60f',
  email: 'javier@example.com',
  user_metadata: { full_name: 'Javier AcademiaQA' }
});

export const MOCK_SESSION = Object.freeze({
  access_token: 'test-access-token',
  user: MOCK_USER
});
