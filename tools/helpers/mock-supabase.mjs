export function installMockSupabaseScript({ session, enrollments = [], admin = false, adminUsers = [], adminSummary = {}, certificates = [], certificateOrders = [], adminCertificates = [], contactMessages = [], courseReviews = [], audioFailure = false, publicActivitySummary = {}, verifiedCourses = [] }) {
  return ({ mockedSession, mockedEnrollments, mockedAdmin, mockedAdminUsers, mockedAdminSummary, mockedCertificates, mockedCertificateOrders, mockedAdminCertificates, mockedContactMessages, mockedCourseReviews, mockedAudioFailure, mockedPublicActivitySummary, mockedVerifiedCourses, mockedLegacyProgress, mockedAccessStatus, mockedAdminGovernance }) => {
    const persistedSignOut = localStorage.getItem('__mock_signed_out') === '1';
    const persistedSignOutCall = JSON.parse(localStorage.getItem('__mock_sign_out_call') || 'null');
    const activeSession = persistedSignOut ? null : mockedSession;
    const user = activeSession?.user || null;
    const progressByCourse = new Map();
    const state = {
      session: activeSession,
      enrollments: structuredClone(mockedEnrollments || []).map((item) => ({
        verified_study_seconds: 0,
        study_verification_started_at: new Date().toISOString(),
        ...item
      })),
      progressByCourse,
      finalExamAttempts: [],
      admin: Boolean(mockedAdmin),
      adminUsers: structuredClone(mockedAdminUsers || []),
      adminSummary: structuredClone(mockedAdminSummary || {}),
      certificates: structuredClone(mockedCertificates || []),
      certificateOrders: structuredClone(mockedCertificateOrders || []),
      adminCertificates: structuredClone(mockedAdminCertificates || []),
      contactMessages: structuredClone(mockedContactMessages || []),
      courseReviews: structuredClone(mockedCourseReviews || []),
      accessStatus: structuredClone(mockedAccessStatus || { blocked: false, admin_role: mockedAdmin ? 'admin' : null, certificate_entitlements: [] }),
      adminGovernance: structuredClone(mockedAdminGovernance || []),
      audioFailure: Boolean(mockedAudioFailure),
      publicActivitySummary: structuredClone(mockedPublicActivitySummary || {}),
      learningActivity: null,
      learningActivityHistory: [],
      learningActivityCalls: [],
      verifiedAssessment: null,
      verifiedAssessmentHistory: [],
      verifiedAssessmentCalls: [],
      verifiedCourseOverrides: new Map((mockedVerifiedCourses || []).map((item) => [item.course_key, structuredClone(item)])),
      legacyProgress: structuredClone(mockedLegacyProgress || []),
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
          verified_study_seconds: 0,
          study_verification_started_at: now,
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

    function courseQuestion(courseKey, questionId) {
      const loadedCourse = window.AcademyRegistry?.get?.(courseKey);
      return loadedCourse?.questions?.find((question) => question.id === questionId) || null;
    }

    function normalizedIndices(values) {
      return [...new Set((Array.isArray(values) ? values : [])
        .map((value) => Math.trunc(Number(value)))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 3))]
        .sort((left, right) => left - right);
    }

    function equalIndices(left, right) {
      const a = normalizedIndices(left);
      const b = normalizedIndices(right);
      return a.length === b.length && a.every((value, index) => value === b[index]);
    }

    function verifiedDashboard() {
      const courses = state.enrollments.map((item) => {
        const loadedCourse = window.AcademyRegistry?.get?.(item.course_key);
        const latestPractice = new Map();
        state.verifiedAssessmentHistory
          .filter((attempt) => attempt.course_key === item.course_key && attempt.activity_type === 'practice')
          .forEach((attempt) => Object.entries(attempt.answers || {}).forEach(([questionId, selected]) => {
            const question = courseQuestion(item.course_key, questionId);
            if (question) latestPractice.set(questionId, { question, correct: equalIndices(selected, question.correct) });
          }));
        const chapters = (loadedCourse?.chapters || []).map((chapter) => {
          const chapterQuestions = (loadedCourse?.questions || []).filter((question) => Number(question.chapter) === Number(chapter.id));
          const answers = [...latestPractice.values()].filter((answer) => Number(answer.question.chapter) === Number(chapter.id));
          const readingSessions = state.learningActivityHistory.filter((activity) => (
            activity.course_key === item.course_key
            && activity.activity_type === 'reading'
            && Number(activity.chapter_id) === Number(chapter.id)
          ));
          const studySeconds = readingSessions.reduce((sum, activity) => sum + Math.max(0, Number(activity.duration_seconds) || 0), 0);
          const readingProgress = Math.min(100, Math.round((studySeconds * 100) / Math.max(60, Number(chapter.minutes || 1) * 60)));
          const practiceCoverage = chapterQuestions.length ? Math.round((answers.length * 100) / chapterQuestions.length) : 0;
          const uniqueCorrect = answers.filter((answer) => answer.correct).length;
          const domain = chapterQuestions.length ? Math.round((uniqueCorrect * 100) / chapterQuestions.length) : 0;
          const objectives = (loadedCourse?.objectives || []).filter((objective) => Number(objective.chapter) === Number(chapter.id));
          return {
            chapter_id: Number(chapter.id),
            title: chapter.title,
            suggested_minutes: Number(chapter.minutes || 1),
            objective_count: objectives.length,
            question_count: chapterQuestions.length,
            study_seconds: studySeconds,
            study_minutes: Math.round(studySeconds / 60),
            unique_answered: answers.length,
            unique_correct: uniqueCorrect,
            touched_objectives: new Set(answers.map((answer) => answer.question.lo)).size,
            reading_progress: readingProgress,
            practice_coverage: practiceCoverage,
            coverage: Math.min(100, Math.round((readingProgress * 0.4) + (practiceCoverage * 0.6))),
            domain,
            visited_at: readingSessions[0]?.started_at || null,
            last_studied_at: readingSessions.at(-1)?.last_seen_at || null
          };
        });
        const completedAttempts = state.verifiedAssessmentHistory.filter((attempt) => (
          attempt.course_key === item.course_key && attempt.status === 'completed' && attempt.result
        ));
        const simulators = completedAttempts.filter((attempt) => attempt.activity_type === 'simulator');
        const finals = completedAttempts.filter((attempt) => attempt.activity_type === 'final_exam');
        const finalPassed = finals.some((attempt) => attempt.result?.passed === true);
        const chapterAverage = chapters.length ? Math.round(chapters.reduce((sum, chapter) => sum + chapter.coverage, 0) / chapters.length) : 0;
        const totalQuestions = chapters.reduce((sum, chapter) => sum + chapter.question_count, 0);
        const chapterDomainAverage = totalQuestions
          ? Math.round(chapters.reduce((sum, chapter) => sum + (chapter.domain * chapter.question_count), 0) / totalQuestions)
          : 0;
        const finalScore = finals.length ? Math.max(...finals.map((attempt) => Number(attempt.result?.score || 0))) : 0;
        const allSessions = state.learningActivityHistory.filter((activity) => activity.course_key === item.course_key);
        const derived = {
          ...item,
          status: item.status === 'cancelled' ? 'cancelled' : finalPassed ? 'completed' : 'active',
          legacy_status: item.status,
          last_activity_at: allSessions.at(-1)?.last_seen_at || item.last_activity_at,
          study_seconds: allSessions.reduce((sum, activity) => sum + Math.max(0, Number(activity.duration_seconds) || 0), 0),
          verified_study_seconds: allSessions.reduce((sum, activity) => sum + Math.max(0, Number(activity.duration_seconds) || 0), 0),
          session_count: allSessions.length,
          simulator_attempts: simulators.length,
          best_simulator_score: simulators.length ? Math.max(...simulators.map((attempt) => Number(attempt.result?.score || 0))) : 0,
          practice_answers: latestPractice.size,
          practice_correct: [...latestPractice.values()].filter((answer) => answer.correct).length,
          final_exam_attempts: finals.length,
          best_final_exam_score: finalScore,
          final_exam_passed: finalPassed,
          final_exam_passed_at: finals.find((attempt) => attempt.result?.passed)?.completed_at || null,
          completed_at: finals.find((attempt) => attempt.result?.passed)?.completed_at || null,
          chapter_count: chapters.length,
          chapter_average: chapterAverage,
          chapter_domain_average: chapterDomainAverage,
          question_count: totalQuestions,
          progress_percent: finalPassed ? 100 : Math.min(95, Math.round(chapterAverage * 0.95)),
          mastery_percent: Math.min(100, Math.round(((chapterDomainAverage * 95) + (finalScore * 5)) / 100)),
          final_exam_eligible: finalPassed || Math.min(95, Math.round(chapterAverage * 0.95)) >= 95,
          verified: true,
          chapters
        };
        const override = state.verifiedCourseOverrides.get(item.course_key);
        if (!override) return derived;
        const combined = { ...derived, ...structuredClone(override), verified: true };
        if (item.status === 'cancelled') combined.status = 'cancelled';
        if (finals.length) {
          combined.final_exam_attempts = finals.length;
          combined.best_final_exam_score = finalScore;
          combined.final_exam_passed = finalPassed;
          combined.final_exam_passed_at = derived.final_exam_passed_at;
          combined.completed_at = derived.completed_at;
          combined.progress_percent = finalPassed ? 100 : combined.progress_percent;
          combined.status = finalPassed && item.status !== 'cancelled' ? 'completed' : combined.status;
          combined.final_exam_eligible = finalPassed || combined.progress_percent >= 95;
        }
        return combined;
      });
      const active = courses.filter((course) => course.status !== 'cancelled');
      return {
        verified: true,
        generated_at: new Date().toISOString(),
        courses,
        legacy_progress: structuredClone(state.legacyProgress),
        legacy_transition: {
          label: 'Histórico no verificado',
          display_threshold_percent: 10,
          affects_official_progress: false
        },
        summary: {
          enrolled_courses: active.length,
          completed_courses: active.filter((course) => course.final_exam_passed).length,
          progress_percent: active.length ? Math.round(active.reduce((sum, course) => sum + Number(course.progress_percent || 0), 0) / active.length) : 0,
          mastery_percent: active.length ? Math.round(active.reduce((sum, course) => sum + Number(course.mastery_percent || 0), 0) / active.length) : 0,
          study_seconds: active.reduce((sum, course) => sum + Number(course.study_seconds || 0), 0),
          simulator_attempts: active.reduce((sum, course) => sum + Number(course.simulator_attempts || 0), 0),
          final_exam_attempts: active.reduce((sum, course) => sum + Number(course.final_exam_attempts || 0), 0)
        }
      };
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
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
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
            if (name === 'public_learning_activity_summary') {
              return { data: structuredClone(state.publicActivitySummary), error: null };
            }
            if (name === 'begin_learning_activity') {
              const item = enrollment(args.p_course_key);
              if (!user || !item || item.status === 'cancelled') {
                return { data: null, error: { code: '42501', message: 'Active enrollment required' } };
              }
              if (state.learningActivity && !state.learningActivity.ended_at) {
                state.learningActivity.ended_at = new Date().toISOString();
              }
              state.learningActivity = {
                session_id: `00000000-0000-4000-8000-${String(state.rpcCounts[name]).padStart(12, '0')}`,
                course_key: args.p_course_key,
                activity_type: args.p_activity_type,
                chapter_id: args.p_chapter_id ?? null,
                started_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                ended_at: null,
                duration_seconds: 0,
                heartbeat_count: 0
              };
              state.learningActivityHistory.push(state.learningActivity);
              state.learningActivityCalls.push({ name, args: structuredClone(args), sessionId: state.learningActivity.session_id });
              return { data: structuredClone(state.learningActivity), error: null };
            }
            if (name === 'touch_learning_activity') {
              const touched = Boolean(state.learningActivity
                && state.learningActivity.session_id === args.p_session_id
                && !state.learningActivity.ended_at);
              if (touched) {
                state.learningActivity.last_seen_at = new Date().toISOString();
                state.learningActivity.duration_seconds += 30;
                state.learningActivity.heartbeat_count += 1;
                const item = enrollment(state.learningActivity.course_key);
                if (item) item.verified_study_seconds = Math.max(0, item.verified_study_seconds || 0) + 30;
              }
              state.learningActivityCalls.push({ name, args: structuredClone(args), touched });
              return { data: touched, error: null };
            }
            if (name === 'end_learning_activity') {
              const ended = Boolean(state.learningActivity
                && state.learningActivity.session_id === args.p_session_id
                && !state.learningActivity.ended_at);
              if (ended) state.learningActivity.ended_at = new Date().toISOString();
              state.learningActivityCalls.push({ name, args: structuredClone(args), ended });
              return { data: ended, error: null };
            }
            if (name === 'get_verified_study_time') {
              const item = enrollment(args.p_course_key);
              if (!item) return { data: null, error: { code: '42501', message: 'Enrollment required' } };
              const sessions = state.learningActivityHistory.filter((activity) => activity.course_key === args.p_course_key);
              const chapters = {};
              const activities = {};
              sessions.forEach((activity) => {
                const duration = Math.max(0, Number(activity.duration_seconds) || 0);
                activities[activity.activity_type] = (activities[activity.activity_type] || 0) + duration;
                if (activity.chapter_id) chapters[activity.chapter_id] = (chapters[activity.chapter_id] || 0) + duration;
              });
              return {
                data: {
                  course_key: args.p_course_key,
                  verified_study_seconds: item.verified_study_seconds || 0,
                  session_count: sessions.length,
                  verification_started_at: item.study_verification_started_at,
                  chapters,
                  activities
                },
                error: null
              };
            }
            if (name === 'get_verified_learning_dashboard') {
              return { data: structuredClone(verifiedDashboard()), error: null };
            }
            if (name === 'is_platform_admin') {
              return { data: state.admin, error: null };
            }
            if (name === 'get_my_access_status') {
              return user
                ? { data: structuredClone(state.accessStatus), error: null }
                : { data: null, error: { code: '42501', message: 'Authentication required' } };
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
            if (name === 'submit_contact_message') {
              const message = {
                id: crypto.randomUUID(), user_id: user?.id || null,
                full_name: args.p_full_name, email: args.p_email, subject: args.p_subject,
                message: args.p_message, source_path: args.p_source_path, status: 'new',
                admin_reply: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
              };
              state.contactMessages.unshift(message);
              return { data: { id: message.id, status: 'received', created_at: message.created_at }, error: null };
            }
            if (name === 'list_my_contact_messages') {
              return { data: structuredClone(state.contactMessages.filter((item) => item.user_id === user?.id && !item.deleted_at)), error: null };
            }
            if (name === 'list_approved_course_reviews') {
              const courseKey = String(args?.p_course_key || '');
              const approved = state.courseReviews.filter((item) => !item.deleted_at && item.status === 'approved' && (!courseKey || item.course_key === courseKey));
              const limit = Number(args?.p_limit || 8);
              return { data: {
                average_rating: approved.length ? Math.round((approved.reduce((sum, item) => sum + Number(item.rating || 0), 0) / approved.length) * 10) / 10 : 0,
                total: approved.length,
                reviews: structuredClone(approved.slice(0, limit).map((item) => ({
                  id: item.id, course_key: item.course_key, rating: item.rating, comment: item.comment,
                  display_name: item.display_name || item.full_name || 'Estudiante', created_at: item.created_at
                })))
              }, error: null };
            }
            if (name === 'get_my_course_review') {
              const review = state.courseReviews.find((item) => item.user_id === user?.id && item.course_key === args.p_course_key);
              return { data: review ? structuredClone(review) : null, error: null };
            }
            if (name === 'submit_course_review') {
              if (!user || !enrollment(args.p_course_key) || enrollment(args.p_course_key).status === 'cancelled') {
                return { data: null, error: { code: '42501', message: 'Debes estar inscrito en el curso para calificarlo' } };
              }
              let review = state.courseReviews.find((item) => item.user_id === user.id && item.course_key === args.p_course_key);
              const now = new Date().toISOString();
              if (!review) {
                review = { id: crypto.randomUUID(), user_id: user.id, course_key: args.p_course_key, created_at: now };
                state.courseReviews.unshift(review);
              }
              Object.assign(review, { rating: args.p_rating, comment: args.p_comment, status: 'pending', updated_at: now });
              return { data: structuredClone(review), error: null };
            }
            if (name === 'admin_list_contact_messages') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const search = String(args?.p_search || '').toLowerCase();
              const matches = state.contactMessages.filter((item) => !item.deleted_at && (!search || [item.full_name, item.email, item.subject].some((value) => String(value || '').toLowerCase().includes(search))));
              return { data: { total: matches.length, messages: structuredClone(matches) }, error: null };
            }
            if (name === 'admin_update_contact_message') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const message = state.contactMessages.find((item) => item.id === args.p_message_id);
              if (!message) return { data: null, error: { code: 'P0002', message: 'Mensaje no encontrado' } };
              Object.assign(message, { status: args.p_status, admin_reply: args.p_admin_reply || message.admin_reply, updated_at: new Date().toISOString() });
              return { data: structuredClone(message), error: null };
            }
            if (name === 'admin_list_course_reviews') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const search = String(args?.p_search || '').toLowerCase();
              const matches = state.courseReviews.filter((item) => !item.deleted_at && (!search || [item.full_name, item.email, item.course_key].some((value) => String(value || '').toLowerCase().includes(search))));
              return { data: { total: matches.length, reviews: structuredClone(matches) }, error: null };
            }
            if (name === 'admin_moderate_course_review') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const review = state.courseReviews.find((item) => item.id === args.p_review_id);
              if (!review) return { data: null, error: { code: 'P0002', message: 'Calificación no encontrada' } };
              Object.assign(review, { status: args.p_status, updated_at: new Date().toISOString() });
              return { data: structuredClone(review), error: null };
            }
            if (name === 'admin_list_user_governance') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const ids = new Set(args.p_user_ids || []);
              return { data: structuredClone(state.adminGovernance.filter((item) => ids.has(item.user_id))), error: null };
            }
            if (name === 'admin_set_user_blocked') {
              if (!state.admin || state.accessStatus.admin_role !== 'superadmin') return { data: null, error: { code: '42501', message: 'Superadministrator access required' } };
              const item = state.adminGovernance.find((entry) => entry.user_id === args.p_user_id) || { user_id: args.p_user_id, certificate_entitlements: [] };
              if (!state.adminGovernance.includes(item)) state.adminGovernance.push(item);
              Object.assign(item, { blocked: args.p_blocked, block_reason: args.p_blocked ? args.p_reason : null });
              return { data: structuredClone(item), error: null };
            }
            if (name === 'admin_set_user_role') {
              if (!state.admin || state.accessStatus.admin_role !== 'superadmin') return { data: null, error: { code: '42501', message: 'Superadministrator access required' } };
              const item = state.adminGovernance.find((entry) => entry.user_id === args.p_user_id) || { user_id: args.p_user_id, certificate_entitlements: [] };
              if (!state.adminGovernance.includes(item)) state.adminGovernance.push(item);
              item.admin_role = args.p_role === 'none' ? null : args.p_role;
              return { data: structuredClone(item), error: null };
            }
            if (name === 'admin_set_certificate_eligibility') {
              if (!state.admin || state.accessStatus.admin_role !== 'superadmin') return { data: null, error: { code: '42501', message: 'Superadministrator access required' } };
              const item = state.adminGovernance.find((entry) => entry.user_id === args.p_user_id) || { user_id: args.p_user_id, certificate_entitlements: [] };
              if (!state.adminGovernance.includes(item)) state.adminGovernance.push(item);
              item.certificate_entitlements ||= [];
              const existing = item.certificate_entitlements.find((entry) => entry.course_key === args.p_course_key);
              if (existing) Object.assign(existing, { enabled: args.p_enabled, reason: args.p_reason });
              else item.certificate_entitlements.push({ course_key: args.p_course_key, enabled: args.p_enabled, reason: args.p_reason });
              return { data: structuredClone(item), error: null };
            }
            if (name === 'admin_soft_delete_contact_message') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const item = state.contactMessages.find((entry) => entry.id === args.p_message_id);
              if (item) item.deleted_at = new Date().toISOString();
              return { data: Boolean(item), error: null };
            }
            if (name === 'admin_soft_delete_course_review') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const item = state.courseReviews.find((entry) => entry.id === args.p_review_id);
              if (item) Object.assign(item, { deleted_at: new Date().toISOString(), status: 'rejected' });
              return { data: Boolean(item), error: null };
            }
            if (name === 'admin_update_certificate_status') {
              if (!state.admin) return { data: null, error: { code: '42501', message: 'Administrator access required' } };
              const item = state.adminCertificates.find((entry) => entry.id === args.p_certificate_id);
              if (!item) return { data: null, error: { code: 'P0002', message: 'Certificado no encontrado' } };
              if (args.p_action === 'revoke') item.status = 'REVOKED';
              if (args.p_action === 'restore') item.status = 'VALID';
              if (args.p_action === 'archive') item.archived_at = new Date().toISOString();
              if (args.p_action === 'unarchive') item.archived_at = null;
              return { data: structuredClone(item), error: null };
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
            if (name === 'archive_cancelled_course') {
              const item = enrollment(args.p_course_key);
              if (!item || item.status !== 'cancelled') {
                return { data: null, error: { code: '55000', message: 'Cancelled enrollment required' } };
              }
              item.hidden_at = new Date().toISOString();
              return { data: true, error: null };
            }
            if (name === 'sync_course_activity') {
              const item = enrollment(args.p_course_key);
              return { data: item ? [structuredClone(item)] : [], error: null };
            }
            if (name === 'start_verified_assessment') {
              const activity = state.learningActivityHistory.find((entry) => (
                entry.session_id === args.p_activity_session_id && !entry.ended_at
              ));
              const questionIds = [...new Set((args.p_question_ids || []).map((value) => String(value || '').trim()).filter(Boolean))];
              const item = activity ? enrollment(activity.course_key) : null;
              const questions = activity
                ? questionIds.map((questionId) => courseQuestion(activity.course_key, questionId))
                : [];
              if (!user || !activity || !item || !questionIds.length || questions.some((question) => !question)) {
                return { data: null, error: { code: '42501', message: 'Active assessment session required' } };
              }
              if (activity.chapter_id && questions.some((question) => Number(question.chapter) !== Number(activity.chapter_id))) {
                return { data: null, error: { code: '22023', message: 'Question outside selected chapter' } };
              }
              const loadedCourse = window.AcademyRegistry.get(activity.course_key);
              if (activity.activity_type !== 'practice' && questionIds.length !== Number(loadedCourse.blueprint.totalQuestions)) {
                return { data: null, error: { code: '22023', message: 'Assessment does not match blueprint' } };
              }
              const attempt = {
                id: crypto.randomUUID(),
                activity_session_id: activity.session_id,
                course_key: activity.course_key,
                activity_type: activity.activity_type,
                question_ids: questionIds,
                answers: {},
                status: 'active',
                started_at: new Date().toISOString(),
                completed_at: null,
                result: null
              };
              state.verifiedAssessment = attempt;
              state.verifiedAssessmentHistory.push(attempt);
              state.verifiedAssessmentCalls.push({ name, args: structuredClone(args), attemptId: attempt.id });
              return {
                data: {
                  attempt_id: attempt.id,
                  course_key: attempt.course_key,
                  activity_type: attempt.activity_type,
                  question_count: attempt.question_ids.length,
                  status: attempt.status,
                  deadline_at: null
                },
                error: null
              };
            }
            if (name === 'submit_verified_answer') {
              const attempt = state.verifiedAssessmentHistory.find((entry) => entry.id === args.p_attempt_id);
              const question = attempt ? courseQuestion(attempt.course_key, args.p_question_id) : null;
              const selected = normalizedIndices(args.p_selected_indices);
              if (!attempt || attempt.status !== 'active' || !question || !attempt.question_ids.includes(question.id) || !selected.length) {
                return { data: null, error: { code: '22023', message: 'Question does not belong to this attempt' } };
              }
              const correct = equalIndices(selected, question.correct);
              attempt.answers[question.id] = selected;
              if (attempt.activity_type === 'practice') {
                const uniqueAnswers = new Set();
                state.verifiedAssessmentHistory
                  .filter((entry) => entry.course_key === attempt.course_key && entry.activity_type === 'practice')
                  .forEach((entry) => Object.keys(entry.answers).forEach((questionId) => uniqueAnswers.add(questionId)));
                const item = enrollment(attempt.course_key);
                if (item) item.practice_answers = uniqueAnswers.size;
              }
              state.verifiedAssessmentCalls.push({ name, args: structuredClone(args), correct });
              return {
                data: {
                  accepted: true,
                  question_id: question.id,
                  correct: attempt.activity_type === 'practice' ? correct : null
                },
                error: null
              };
            }
            if (name === 'complete_verified_assessment') {
              const attempt = state.verifiedAssessmentHistory.find((entry) => entry.id === args.p_attempt_id);
              if (!attempt) return { data: null, error: { code: '42501', message: 'Assessment attempt not found' } };
              if (attempt.result) return { data: structuredClone(attempt.result), error: null };
              const loadedCourse = window.AcademyRegistry.get(attempt.course_key);
              const questions = attempt.question_ids.map((questionId) => courseQuestion(attempt.course_key, questionId));
              const answered = questions.filter((question) => attempt.answers[question.id]?.length);
              const correctQuestions = answered.filter((question) => equalIndices(attempt.answers[question.id], question.correct));
              const totalPoints = questions.reduce((sum, question) => sum + Number(question.points || 1), 0);
              const earnedPoints = correctQuestions.reduce((sum, question) => sum + Number(question.points || 1), 0);
              const passingPoints = attempt.activity_type === 'practice' ? 0 : Number(loadedCourse.blueprint.passingScore || 0);
              const score = totalPoints > 0 ? Math.round((earnedPoints * 10_000) / totalPoints) / 100 : 0;
              const passed = attempt.activity_type === 'practice' ? null : earnedPoints >= passingPoints;
              const activity = state.learningActivityHistory.find((entry) => entry.session_id === attempt.activity_session_id);
              if (activity && !activity.ended_at) activity.ended_at = new Date().toISOString();
              const item = enrollment(attempt.course_key);
              if (item && attempt.activity_type === 'simulator') {
                item.simulator_attempts += 1;
                item.best_simulator_score = Math.max(item.best_simulator_score || 0, score);
              }
              if (item && attempt.activity_type === 'final_exam') {
                item.final_exam_attempts += 1;
                item.best_final_exam_score = Math.max(item.best_final_exam_score || 0, score);
                item.final_exam_passed = item.final_exam_passed || passed;
                if (passed) {
                  item.status = 'completed';
                  item.final_exam_passed_at ||= new Date().toISOString();
                  item.completed_at ||= new Date().toISOString();
                }
                state.finalExamAttempts.push({
                  course_key: attempt.course_key,
                  score,
                  earned_points: earnedPoints,
                  total_points: totalPoints,
                  correct_answers: correctQuestions.length,
                  total_questions: questions.length,
                  passed,
                  verified: true,
                  assessment_attempt_id: attempt.id
                });
              }
              attempt.status = 'completed';
              attempt.completed_at = new Date().toISOString();
              attempt.result = {
                attempt_id: attempt.id,
                activity_type: attempt.activity_type,
                answered_count: answered.length,
                correct_answers: correctQuestions.length,
                earned_points: earnedPoints,
                total_points: totalPoints,
                passing_points: passingPoints,
                score,
                passed,
                duration_seconds: Number(activity?.duration_seconds || 0),
                enrollment: item ? structuredClone(item) : null
              };
              state.verifiedAssessmentCalls.push({ name, args: structuredClone(args), result: structuredClone(attempt.result) });
              return { data: structuredClone(attempt.result), error: null };
            }
            if (name === 'record_simulator_completion') {
              return { data: null, error: { code: '42501', message: 'Legacy assessment RPC disabled' } };
            }
            if (name === 'record_final_exam_completion') {
              return { data: null, error: { code: '42501', message: 'Legacy assessment RPC disabled' } };
            }
            return { data: [], error: null };
          },
          functions: {
            async invoke(name, options = {}) {
              if (name === 'course-audio') {
                return state.audioFailure
                  ? { data: null, error: { message: 'Narración de nube no configurada', status: 503 } }
                  : { data: silentWavBlob(), error: null };
              }
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
                const verifiedCourse = verifiedDashboard().courses.find((item) => item.course_key === body.courseKey);
                if (!verifiedCourse?.verified || !verifiedCourse.final_exam_passed || Number(verifiedCourse.progress_percent) !== 100) {
                  return { data: null, error: { message: 'El certificado se habilita al completar el curso y aprobar el examen final.', status: 403 } };
                }
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
                const verifiedCourse = verifiedDashboard().courses.find((item) => item.course_key === order.course_key);
                if (!verifiedCourse?.verified || !verifiedCourse.final_exam_passed || Number(verifiedCourse.progress_percent) !== 100) {
                  return { data: null, error: { message: 'El certificado se habilita al completar el curso y aprobar el examen final.', status: 403 } };
                }
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
    mockedAdminCertificates: options.adminCertificates || [],
    mockedContactMessages: options.contactMessages || [],
    mockedCourseReviews: options.courseReviews || [],
    mockedAudioFailure: Boolean(options.audioFailure),
    mockedPublicActivitySummary: options.publicActivitySummary || {
      registered_students: 18,
      active_courses: 7,
      online_students: 4,
      active_students: 3,
      measured_at: '2026-08-25T13:00:00.000Z'
    },
    mockedVerifiedCourses: options.verifiedCourses || [],
    mockedLegacyProgress: options.legacyProgress || [],
    mockedAccessStatus: options.accessStatus || { blocked: false, admin_role: options.admin ? 'admin' : null, certificate_entitlements: [] },
    mockedAdminGovernance: options.adminGovernance || []
  });
}

export const MOCK_USER = Object.freeze({
  id: 'f5faef51-a75a-4c3d-bd74-21fe19a3f60f',
  email: 'javier@example.com',
  user_metadata: { full_name: 'Javier QAvance', avatar_url: 'https://lh3.googleusercontent.com/avatar-javier.png' }
});

export const MOCK_SESSION = Object.freeze({
  access_token: 'test-access-token',
  user: MOCK_USER
});
