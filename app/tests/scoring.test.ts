import { describe, expect, it } from 'vitest';
import { isCorrect, mastery, recordResult, scoreCallEnd, scoreChoice, scoreOrderSteps, scoreRedFlag, weakestTopic } from '../src/engine/scoring.ts';
import { emptyProgress } from '../src/engine/storage.ts';

describe('scoring', () => {
  it('scores red flags with a penalty for wrong taps, kept between 0 and 1', () => {
    expect(scoreRedFlag(4, 0, 4)).toBe(1);
    expect(scoreRedFlag(3, 1, 4)).toBe(0.625);
    expect(scoreRedFlag(0, 3, 4)).toBe(0); // never below 0
    expect(scoreRedFlag(0, 0, 0)).toBe(0); // no flags: no divide-by-zero
  });

  it('scores choices and call endings', () => {
    expect(scoreChoice('a', 'a')).toBe(1);
    expect(scoreChoice('b', 'a')).toBe(0);
    expect(scoreCallEnd('safe')).toBe(1);
    expect(scoreCallEnd('partial')).toBe(0.5);
    expect(scoreCallEnd('scammed')).toBe(0);
    expect(isCorrect(0.7)).toBe(true);
    expect(isCorrect(0.5)).toBe(false);
  });

  it('scores orderSteps: 1.0 if perfect, 0.7 if first step is correct and <= 1 mistake, 0 otherwise', () => {
    const correct = [2, 0, 3, 1];
    expect(scoreOrderSteps([2, 0, 3, 1], correct)).toBe(1);
    expect(scoreOrderSteps([2, 0, 1, 1], correct)).toBe(0.7);
    expect(scoreOrderSteps([2, 3, 0, 1], correct)).toBe(0);
    expect(scoreOrderSteps([0, 2, 3, 1], correct)).toBe(0);
    expect(scoreOrderSteps([2, 0], correct)).toBe(0);
  });

  it('starts an untried topic at 0.5 mastery and moves with results', () => {
    let p = emptyProgress();
    expect(mastery(p, 'phishing')).toBe(0.5);
    p = recordResult(p, { scenarioId: 'x', topic: 'phishing', correct: true });
    expect(mastery(p, 'phishing')).toBeCloseTo(2 / 3);
    p = recordResult(p, { scenarioId: 'x', topic: 'phishing', correct: false });
    expect(mastery(p, 'phishing')).toBe(0.5);
    expect(p.completed).toEqual(['x']); // no duplicates
  });

  it('does not change the old progress object', () => {
    const before = emptyProgress();
    recordResult(before, { scenarioId: 'x', topic: 'phishing', correct: true });
    expect(before).toEqual(emptyProgress());
  });

  it('finds the weakest topic among those tried', () => {
    let p = emptyProgress();
    expect(weakestTopic(p)).toBeNull();
    p = recordResult(p, { scenarioId: 'a', topic: 'phishing', correct: true });
    p = recordResult(p, { scenarioId: 'b', topic: 'quishing', correct: false });
    expect(weakestTopic(p)).toBe('quishing');
  });
});
