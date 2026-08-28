export async function completeCourseStudy(page, courseKey) {
  return page.evaluate((key) => {
    const course = window.AcademyRegistry?.get(key);
    if (!course) throw new Error(`El curso ${key} no está cargado.`);

    const storageKey = course.meta?.storageKey || `academy_${key}_progress`;
    const progress = window.AcademyStorage.getProgress(storageKey);
    const now = new Date().toISOString();
    progress.chapterActivity ||= {};
    progress.byLo ||= {};
    progress.questionResults ||= {};

    let studySeconds = 0;
    for (const chapter of course.chapters || []) {
      const chapterSeconds = Math.max(60, Number(chapter.minutes || 0) * 60);
      const previous = progress.chapterActivity[String(chapter.id)] || {};
      progress.chapterActivity[String(chapter.id)] = {
        ...previous,
        studySeconds: Math.max(Number(previous.studySeconds || 0), chapterSeconds),
        visitedAt: previous.visitedAt || now,
        lastStudiedAt: now
      };
      studySeconds += chapterSeconds;
    }

    for (const objective of course.objectives || []) {
      const previous = progress.byLo[objective.lo] || {};
      const answered = Number(previous.ok || 0) + Number(previous.bad || 0);
      progress.byLo[objective.lo] = {
        ...previous,
        ok: answered ? Number(previous.ok || 0) : 1,
        bad: Number(previous.bad || 0),
        chapter: objective.chapter,
        k: objective.k,
        objective: objective.text
      };
    }

    for (const question of course.questions || []) {
      progress.questionResults[String(question.id)] = {
        correct: true,
        lo: question.lo,
        chapter: question.chapter,
        answeredAt: now
      };
    }

    progress.studySeconds = Math.max(Number(progress.studySeconds || 0), studySeconds);
    const result = window.AcademyStorage.saveProgress(storageKey, progress);
    if (!result.ok) throw new Error(`No fue posible preparar el avance de ${key}.`);
    return { storageKey, studySeconds };
  }, courseKey);
}

export async function seedVerifiedCourseStudy(page, courseKey) {
  return page.evaluate(async (key) => {
    let course = window.AcademyRegistry?.get(key);
    if (!course) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `/courses/${encodeURIComponent(key)}/course-data.js`;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No fue posible cargar el curso ${key}.`));
        document.head.appendChild(script);
      });
      course = window.AcademyRegistry?.get(key);
    }
    const overrides = window.__supabaseMock?.verifiedCourseOverrides;
    if (!course) throw new Error(`El curso ${key} no está cargado para preparar el agregado verificado.`);
    if (!overrides) throw new Error(`El backend simulado no expone agregados verificados para ${key}.`);

    const chapters = (course.chapters || []).map((chapter) => {
      const questions = (course.questions || []).filter((question) => Number(question.chapter) === Number(chapter.id));
      const objectives = (course.objectives || []).filter((objective) => Number(objective.chapter) === Number(chapter.id));
      return {
        chapter_id: Number(chapter.id),
        title: chapter.title,
        suggested_minutes: Number(chapter.minutes),
        objective_count: objectives.length,
        question_count: questions.length,
        study_seconds: Number(chapter.minutes) * 60,
        study_minutes: Number(chapter.minutes),
        unique_answered: questions.length,
        unique_correct: questions.length,
        touched_objectives: objectives.length,
        reading_progress: 100,
        practice_coverage: 100,
        coverage: 100,
        domain: 100,
        visited_at: '2026-08-11T10:00:00Z',
        last_studied_at: '2026-08-11T11:00:00Z'
      };
    });
    const studySeconds = chapters.reduce((sum, chapter) => sum + chapter.study_seconds, 0);
    overrides.set(key, {
      course_key: key,
      status: 'active',
      study_seconds: studySeconds,
      verified_study_seconds: studySeconds,
      practice_answers: (course.questions || []).length,
      practice_correct: (course.questions || []).length,
      chapter_count: chapters.length,
      chapter_average: 100,
      chapter_domain_average: 100,
      question_count: (course.questions || []).length,
      progress_percent: 95,
      mastery_percent: 95,
      final_exam_eligible: true,
      final_exam_passed: false,
      verified: true,
      chapters
    });
    window.dispatchEvent(new CustomEvent('academiaqa:auth-change', { detail: { authenticated: true } }));
    return { studySeconds, chapterCount: chapters.length };
  }, courseKey);
}
