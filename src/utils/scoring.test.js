import { describe, expect, it } from 'vitest';
import { canTakeWeeklyTest } from './scoring';
import { scoreQuiz } from './scoring';

describe('scoreQuiz', () => {
  it('returns correct marks and percent', () => {
    const questions = [
      { id: 'a', answerIndex: 1, domain: 'math', trait: 'analytical', options: [] },
      { id: 'b', answerIndex: 0, domain: 'programming', trait: 'logic', options: [] },
      { id: 'c', answerIndex: 2, domain: 'math', trait: 'analytical', options: [] },
    ];
    const answers = [1, 0, 0];
    const r = scoreQuiz({ questions, answers });
    expect(r.correct).toBe(2);
    expect(r.total).toBe(3);
    expect(r.percent).toBe(67);
    expect(r.domainScores).toEqual({ math: 50, programming: 100 });
    expect(r.traitCorrect.analytical).toBe(1);
    expect(r.traitCorrect.logic).toBe(1);
  });
});

describe('canTakeWeeklyTest', () => {
  it('blocks weekly reattempt for same week', () => {
    const attempts = [
      { type: 'weekly', weekKey: '2026-W08' },
      { type: 'test', weekKey: null },
    ];
    expect(canTakeWeeklyTest(attempts, '2026-W08')).toBe(false);
    expect(canTakeWeeklyTest(attempts, '2026-W09')).toBe(true);
  });
});

