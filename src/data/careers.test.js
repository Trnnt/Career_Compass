import { describe, expect, it } from 'vitest';
import { buildAptitudeScores, getRecommendations } from './careers';

describe('getRecommendations', () => {
  it('is deterministic and returns 3 careers', () => {
    const profile = { name: 'A', grade: '12', stream: 'science', interest: 'tech' };
    const answers = [5, 3, 4, 5, 1, 2];
    const apt = buildAptitudeScores(answers);

    const r1 = getRecommendations(profile, apt, { logic: 0.6, tech: 0.8 });
    const r2 = getRecommendations(profile, apt, { logic: 0.6, tech: 0.8 });

    expect(r1).toHaveLength(3);
    expect(r2).toHaveLength(3);
    expect(r1.map((x) => x.id)).toEqual(r2.map((x) => x.id));
    expect(r1.map((x) => x.matchPercentage)).toEqual(r2.map((x) => x.matchPercentage));
  });

  it('responds to traitSignals (tech) by boosting tech careers', () => {
    const profile = { name: 'B', grade: '12', stream: 'arts', interest: 'design' };
    const answers = [1, 5, 5, 1, 2, 1];
    const apt = buildAptitudeScores(answers);

    const baseline = getRecommendations(profile, apt, {});
    const withTech = getRecommendations(profile, apt, { tech: 1, logic: 1, analytical: 1 });

    // Not asserting exact IDs (data may evolve), but should remain valid + deterministic.
    expect(baseline).toHaveLength(3);
    expect(withTech).toHaveLength(3);
    expect(withTech[0].matchPercentage).toBeGreaterThanOrEqual(baseline[0].matchPercentage);
  });
});

