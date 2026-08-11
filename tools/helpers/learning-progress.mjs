export async function completeCourseStudy(page, courseKey) {
  return page.evaluate((key) => {
    const course = window.AcademyRegistry?.get(key);
    if (!course) throw new Error(`El curso ${key} no está cargado.`);

    const storageKey = course.meta?.storageKey || `academy_${key}_progress`;
    const progress = window.AcademyStorage.getProgress(storageKey);
    const now = new Date().toISOString();
    progress.chapterActivity ||= {};
    progress.byLo ||= {};

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

    progress.studySeconds = Math.max(Number(progress.studySeconds || 0), studySeconds);
    const result = window.AcademyStorage.saveProgress(storageKey, progress);
    if (!result.ok) throw new Error(`No fue posible preparar el avance de ${key}.`);
    return { storageKey, studySeconds };
  }, courseKey);
}
