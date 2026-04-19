export function scoreQuiz({ questions, answers }) {
  const total = questions.length;
  let correct = 0;
  const domainTotals = {};
  const domainCorrect = {};
  const traitTotals = {};
  const traitCorrect = {};
  const raisecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  questions.forEach((q, idx) => {
    const isCorrect = answers[idx] === q.answerIndex;
    const d = q.domain || 'general';
    domainTotals[d] = (domainTotals[d] || 0) + 1;
    if (q.trait) {
      const t = q.trait;
      traitTotals[t] = (traitTotals[t] || 0) + 1;
      if (isCorrect) {
        traitCorrect[t] = (traitCorrect[t] || 0) + 1;
      }
    }
    if (isCorrect) {
      correct += 1;
      domainCorrect[d] = (domainCorrect[d] || 0) + 1;
      if (q.raisecLetter) {
        let letter = q.raisecLetter.toUpperCase().charAt(0);
        if (raisecScores[letter] !== undefined) {
          raisecScores[letter] += 1;
        }
      }
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
    traitTotals,
    traitCorrect,
    raisecScores, // the final aggregated R, I, A, S, E, C score map
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
    const tTotals = a?.traitTotals || {};
    Object.entries(traits).forEach(([trait, cnt]) => {
      const tt = tTotals[trait] || 1;
      const v = Math.max(0, Math.min(1, cnt / tt));
      byTrait[trait] = (byTrait[trait] || 0) + v * w;
    });
  });

  const norm = weights.reduce((s, w) => s + w, 0) || 1;
  return Object.fromEntries(Object.entries(byTrait).map(([k, v]) => [k, v / norm]));
}

export function buildTraitSignalsFromRaisecScores(domainScores = {}) {
  const score = (key) => {
    const raw = Number(domainScores[key]);
    if (Number.isNaN(raw)) return 0;
    return Math.max(0, Math.min(1, raw / 100));
  };

  const realistic = score('Realistic');
  const investigative = score('Investigative');
  const artistic = score('Artistic');
  const social = score('Social');
  const enterprising = score('Enterprising');
  const conventional = score('Conventional');

  return {
    tech: (realistic + investigative) / 2,
    logic: (investigative + realistic) / 2,
    analytical: (investigative + conventional) / 2,
    creative: artistic,
    design: artistic,
    helping: social,
    team: (social + enterprising) / 2,
    business: (enterprising + conventional) / 2,
  };
}

export function canTakeWeeklyTest(attempts, weekKey) {
  return !attempts.some((a) => a.type === 'weekly' && a.weekKey === weekKey);
}
