'use strict';

(function initQuestionSelection(global) {
  function safeRandomInt(randomInt, max) {
    if (!Number.isInteger(max) || max <= 0) return 0;
    const value = Number(randomInt?.(max));
    return Number.isInteger(value) && value >= 0 && value < max ? value : 0;
  }

  function shuffle(values, randomInt) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = safeRandomInt(randomInt, index + 1);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function historyStats(history = []) {
    const stats = new Map();
    history.forEach((entry, index) => {
      const id = String(entry?.id ?? entry ?? '').slice(0, 128);
      if (!id) return;
      const current = stats.get(id) || { count: 0, lastSeen: -1 };
      current.count += 1;
      current.lastSeen = index;
      stats.set(id, current);
    });
    return stats;
  }

  function questionsForCourse(questions = [], courseKey = '') {
    const normalizedKey = String(courseKey || '').trim().toLowerCase();
    if (!normalizedKey) return [...questions];
    return questions.filter((question) => String(question?.courseKey || '').trim().toLowerCase() === normalizedKey);
  }

  function selectLeastSeen(pool, count, history = [], randomInt, courseKey = '') {
    const scopedPool = questionsForCourse(pool, courseKey);
    const needed = Math.max(0, Math.min(Math.trunc(Number(count) || 0), scopedPool.length));
    const stats = historyStats(history);
    const remaining = scopedPool.map((question) => {
      const usage = stats.get(String(question.id)) || { count: 0, lastSeen: -1 };
      return {
        question,
        count: usage.count,
        lastSeen: usage.lastSeen,
        tie: safeRandomInt(randomInt, 0x7fff_ffff)
      };
    });
    const selected = [];
    const loCounts = new Map();
    const referenceCounts = new Map();

    while (selected.length < needed && remaining.length) {
      remaining.sort((left, right) => (
        left.count - right.count
        || (loCounts.get(String(left.question.lo || '')) || 0) - (loCounts.get(String(right.question.lo || '')) || 0)
        || (referenceCounts.get(String(left.question.designReferenceId || '')) || 0) - (referenceCounts.get(String(right.question.designReferenceId || '')) || 0)
        || left.lastSeen - right.lastSeen
        || left.tie - right.tie
      ));
      const picked = remaining.shift();
      selected.push(picked.question);
      const lo = String(picked.question.lo || '');
      loCounts.set(lo, (loCounts.get(lo) || 0) + 1);
      const reference = String(picked.question.designReferenceId || '');
      referenceCounts.set(reference, (referenceCounts.get(reference) || 0) + 1);
    }

    return shuffle(selected, randomInt);
  }

  function buildMatrixSelection(questions, blueprint, history = [], randomInt, courseKey = '') {
    const scopedQuestions = questionsForCourse(questions, courseKey);
    const matrix = blueprint?.matrix || {};
    const selected = [];
    const used = new Set();
    const warnings = [];
    const kLevels = Object.keys(blueprint?.kDistribution || {});

    Object.entries(matrix).forEach(([chapter, distribution]) => {
      kLevels.forEach((kLevel) => {
        const needed = Math.max(0, Math.trunc(Number(distribution?.[kLevel]) || 0));
        if (!needed) return;
        const pool = scopedQuestions.filter((question) => (
          String(question.chapter) === String(chapter)
          && question.k === kLevel
          && !used.has(question.id)
        ));
        const picked = selectLeastSeen(pool, needed, history, randomInt);
        picked.forEach((question) => {
          selected.push(question);
          used.add(question.id);
        });
        if (picked.length < needed) warnings.push(`C${chapter} ${kLevel}: requiere ${needed}, disponibles ${picked.length}.`);
      });
    });

    const totalQuestions = Math.max(1, Math.trunc(Number(blueprint?.totalQuestions) || 40));
    if (selected.length < totalQuestions) {
      const fillPool = scopedQuestions.filter((question) => !used.has(question.id));
      selected.push(...selectLeastSeen(fillPool, totalQuestions - selected.length, history, randomInt));
    }

    return {
      questions: shuffle(selected, randomInt).slice(0, totalQuestions),
      warnings
    };
  }

  global.AcademyQuestionSelection = Object.freeze({
    buildMatrixSelection,
    historyStats,
    questionsForCourse,
    selectLeastSeen,
    shuffle
  });
}(window));
