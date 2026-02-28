export function scoreQuiz({ questions, answers }) {
  const total = questions.length;
  let correct = 0;
  const domainTotals = {};
  const domainCorrect = {};
  const traitCorrect = {};

  questions.forEach((q, idx) => {
    const isCorrect = answers[idx] === q.answerIndex;
    const d = q.domain || 'general';
    domainTotals[d] = (domainTotals[d] || 0) + 1;
    if (isCorrect) {
      correct += 1;
      domainCorrect[d] = (domainCorrect[d] || 0) + 1;
      if (q.trait) traitCorrect[q.trait] = (traitCorrect[q.trait] || 0) + 1;
    }
  });

  const percent = total ? Math.round((correct / total) * 100) : 0;
  const domainScores = Object.fromEntries(
    Object.entries(domainTotals).map(([domain, t]) => {
      const c = domainCorrect[domain] || 0;
      return [domain, Math.round((c / t) * 100)];
    })
  );

  return {
    correct,
    total,
    percent,
    domainScores,
    traitCorrect,
  };
}

export function buildTraitSignalsFromAttempts(attempts) {
  // Returns trait -> [0..1], weighted by recency (newer = stronger).
  const byTrait = {};
  const maxN = Math.min(8, attempts.length);
  const recent = attempts.slice(-maxN);
  const weights = recent.map((_, i) => (i + 1) / maxN); // 0..1

  recent.forEach((a, idx) => {
    const w = weights[idx];
    const traits = a?.traitCorrect || {};
    const denom = a?.total || 1;
    Object.entries(traits).forEach(([trait, cnt]) => {
      const v = Math.max(0, Math.min(1, cnt / denom));
      byTrait[trait] = (byTrait[trait] || 0) + v * w;
    });
  });

  const norm = weights.reduce((s, w) => s + w, 0) || 1;
  return Object.fromEntries(Object.entries(byTrait).map(([k, v]) => [k, v / norm]));
}

export function canTakeWeeklyTest(attempts, weekKey) {
  return !attempts.some((a) => a.type === 'weekly' && a.weekKey === weekKey);
}

