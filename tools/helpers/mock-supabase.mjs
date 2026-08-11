export function installMockSupabaseScript({ session, enrollments = [] }) {
  return ({ mockedSession, mockedEnrollments }) => {
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
      calls: persistedSignOutCall ? { signOut: persistedSignOutCall } : {}
    };
    window.__supabaseMock = state;
    window.__authCalls = state.calls;

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
              data: saved ? { progress: saved, schema_version: 4, updated_at: new Date().toISOString() } : null,
              error: null
            };
          }
          return { data: null, error: null };
        },
        async order() {
          if (table === 'course_enrollments') {
            return { data: structuredClone(state.enrollments), error: null };
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
            state.calls[name] = structuredClone(args || {});
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
            if (name === 'sync_course_activity') {
              const item = enrollment(args.p_course_key);
              if (item) {
                item.practice_answers = Math.max(item.practice_answers || 0, args.p_practice_answers || 0);
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
          }
        };
      }
    };
  };
}

export async function useMockedSupabase(page, session, enrollments = []) {
  await page.route('**/assets/vendor/supabase-2.112.3.js*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: ''
  }));
  await page.addInitScript(installMockSupabaseScript({ session, enrollments }), {
    mockedSession: session,
    mockedEnrollments: enrollments
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
