import { describe, expect, it } from 'vitest';
import { audioNeeded, missingAudio, validateLessons, validateScenarios } from '../src/engine/validate.ts';
import { lessons, scenarios } from '../src/data/index.ts';
import type { CallBranchScenario, ChoicePairScenario, OrderStepsScenario, RedFlagScenario, Scenario } from '../src/types.ts';

// structuredClone gives each test its own copy to break.
const goodCall = (): CallBranchScenario => structuredClone(scenarios.find((s) => s.kind === 'callbranch') as CallBranchScenario);
const goodRedFlag = (): RedFlagScenario => structuredClone(scenarios.find((s) => s.kind === 'redflag') as RedFlagScenario);
const goodChoice = (): ChoicePairScenario => structuredClone(scenarios.find((s) => s.kind === 'choicepair') as ChoicePairScenario);
const goodOrderSteps = (): OrderStepsScenario => structuredClone(scenarios.find((s) => s.kind === 'orderSteps') as OrderStepsScenario);

describe('validateScenarios', () => {
  it('accepts all the real scenario files', () => {
    expect(scenarios.length).toBeGreaterThan(0);
    expect(validateScenarios(scenarios)).toEqual([]);
  });

  it('catches duplicate ids', () => {
    const s = goodRedFlag();
    expect(validateScenarios([s, s]).some((e) => e.includes('id is used by another scenario'))).toBe(true);
  });

  it('catches a call choice pointing to a missing node', () => {
    const s = goodCall();
    s.nodes[0].choices![0].next = 'nowhere';
    expect(validateScenarios([s]).some((e) => e.includes('missing node "nowhere"'))).toBe(true);
  });

  it('catches a call with no reachable scammed ending', () => {
    const s = goodCall();
    s.nodes = s.nodes.map((n) => (n.end?.result === 'scammed' ? { ...n, end: { ...n.end, result: 'partial' as const } } : n));
    expect(validateScenarios([s])).toContain(`${s.id}: no reachable "scammed" ending`);
  });

  it('treats a missing recording as a warning, not an error', () => {
    const s = goodCall();
    s.nodes[0].audio = 'call-test-n1.mp3';
    expect(validateScenarios([s])).toEqual([]); // still valid
    expect(missingAudio([s], []).some((w) => w.includes('call-test-n1.mp3'))).toBe(true);
    expect(missingAudio([s], audioNeeded([s]).map((a) => a.file))).toEqual([]);
  });

  it('lists each needed recording with its transcript line', () => {
    const s = goodCall();
    const first = audioNeeded([s]).find((a) => a.nodeId === s.start)!;
    expect(first.file).toBe(`call-${s.id}-${s.start}.mp3`);
    expect(first.transcript).toBe(s.nodes.find((n) => n.id === s.start)!.transcript);
  });

  it('needs at least 2 red flags, each with a reason', () => {
    const s = goodRedFlag();
    s.segments = [{ text: 'Hello ', flag: { id: 'f1', reason: '' } }, { text: 'there' }];
    const errors = validateScenarios([s]);
    expect(errors.some((e) => e.includes('at least 2 red flags'))).toBe(true);
    expect(errors.some((e) => e.includes('has no reason'))).toBe(true);
  });

  it('catches a choice pair whose correctId is not an option', () => {
    const s = goodChoice();
    s.correctId = 'z';
    expect(validateScenarios([s]).some((e) => e.includes('correctId "z"'))).toBe(true);
  });

  it('validates orderSteps: needs 4-5 steps, matching correctOrder permutation, and whyFirstStepMatters', () => {
    const s = goodOrderSteps();
    expect(validateScenarios([s])).toEqual([]);

    s.steps = ['Step 1', 'Step 2'];
    expect(validateScenarios([s]).some((e) => e.includes('needs 4 or 5 steps'))).toBe(true);

    const s2 = goodOrderSteps();
    s2.correctOrder = [0, 1, 2, 99];
    expect(validateScenarios([s2]).some((e) => e.includes('must contain every step index'))).toBe(true);
  });

  it('catches real brand names and real-looking phone numbers', () => {
    const s = goodRedFlag();
    s.from = 'PayPal Support (212) 867-5309';
    const errors = validateScenarios([s]);
    expect(errors.some((e) => e.includes('"paypal"'))).toBe(true);
    expect(errors.some((e) => e.includes('867-5309'))).toBe(true);
  });

  it('does not mistake words like "pop-ups" or "upset" for the brand UPS', () => {
    const s = goodRedFlag();
    s.title = 'Upset by scary pop-ups?';
    expect(validateScenarios([s])).toEqual([]);
    s.title = 'Your UPS package';
    expect(validateScenarios([s]).some((e) => e.includes('"ups"'))).toBe(true);
  });

  it('checks lessons: 3 teach bullets and at least one scenario', () => {
    expect(validateLessons(lessons, scenarios)).toEqual([]);
    const bad = { ...lessons[0], teach: ['only one'] };
    const lonely = { ...lessons[1], id: 'popups' as const };
    const errors = validateLessons([bad, lonely], scenarios.filter((s) => s.topic !== 'popups'));
    expect(errors.some((e) => e.includes('exactly 3 bullets'))).toBe(true);
    expect(errors).toContain('lesson popups: has no scenarios');
  });

  it('catches unknown topics and kinds', () => {
    const s = { ...goodRedFlag(), topic: 'romance' } as unknown as Scenario;
    const t = { ...goodChoice(), id: 'other-01', kind: 'quiz' } as unknown as Scenario;
    const errors = validateScenarios([s, t]);
    expect(errors.some((e) => e.includes('unknown topic "romance"'))).toBe(true);
    expect(errors.some((e) => e.includes('unknown kind "quiz"'))).toBe(true);
  });
});
