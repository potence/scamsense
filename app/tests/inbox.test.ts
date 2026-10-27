import { describe, expect, it } from 'vitest';
import { isCorrectAnswer, judgeAnswer, pickInbox, resolveItem } from '../src/engine/inbox.ts';
import { validateScenarios } from '../src/engine/validate.ts';
import { inbox, scenarios } from '../src/data/index.ts';
import type { RealOrScamScenario } from '../src/types.ts';

// A predictable "random" generator so tests give the same answer every run.
function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const theInbox = inbox!;
const copy = (): RealOrScamScenario => structuredClone(theInbox);

describe('Real or scam? inbox', () => {
  it('exists and passes the validator together with the scenarios it points at', () => {
    expect(theInbox).toBeDefined();
    expect(validateScenarios([...scenarios, theInbox])).toEqual([]);
  });

  it('picks 12 different items per round: 6 real and 6 scam', () => {
    for (const seed of [1, 2, 3]) {
      const round = pickInbox(theInbox.items, seeded(seed));
      expect(round).toHaveLength(12);
      expect(new Set(round.map((i) => i.id)).size).toBe(12);
      expect(round.filter((i) => i.answer === 'real')).toHaveLength(6);
      expect(round.filter((i) => i.answer === 'scam')).toHaveLength(6);
    }
  });

  it('shows a scam text using the text of the scenario it points at', () => {
    const view = resolveItem({ id: 'x', answer: 'scam', scenarioRef: 'phishing-bank-text-01' }, scenarios);
    expect(view.channel).toBe('sms');
    expect(view.text).toContain('Your account has been locked.');
    expect(view.topic).toBe('phishing');
  });

  it('shows a scam call using its first line and recording', () => {
    const view = resolveItem({ id: 'x', answer: 'scam', scenarioRef: 'phone-techsupport-01' }, scenarios);
    expect(view.channel).toBe('call');
    expect(view.audio).toBe('call-phone-techsupport-01-n1.mp3');
    expect(view.topic).toBe('popups');
  });

  it('judges answers kindly: checking is never wrong', () => {
    expect(judgeAnswer('scam', 'scam')).toBe('caught');
    expect(judgeAnswer('check', 'scam')).toBe('caught');
    expect(judgeAnswer('real', 'scam')).toBe('missed');
    expect(judgeAnswer('real', 'real')).toBe('right');
    expect(judgeAnswer('scam', 'real')).toBe('careful');
    expect(judgeAnswer('check', 'real')).toBe('careful');
    expect(isCorrectAnswer('check', 'real')).toBe(true);
    expect(isCorrectAnswer('scam', 'real')).toBe(false);
    expect(isCorrectAnswer('real', 'scam')).toBe(false);
  });

  it('catches a scam item pointing at a missing or wrong kind of scenario', () => {
    const s = copy();
    s.items.find((i) => i.answer === 'scam')!.scenarioRef = 'does-not-exist';
    s.items.filter((i) => i.answer === 'scam')[1].scenarioRef = 'fake-sites-bank-address-01'; // a choicepair
    const errors = validateScenarios([...scenarios, s]);
    expect(errors.some((e) => e.includes('missing scenario "does-not-exist"'))).toBe(true);
    expect(errors.some((e) => e.includes('not "choicepair"'))).toBe(true);
  });

  it('catches a real item without its explanation or how-to-check line', () => {
    const s = copy();
    const real = s.items.find((i) => i.answer === 'real')!;
    delete real.explanation;
    real.howToCheck = '';
    const errors = validateScenarios([...scenarios, s]);
    expect(errors.some((e) => e.includes('missing explanation'))).toBe(true);
    expect(errors.some((e) => e.includes('missing howToCheck'))).toBe(true);
  });

  it('needs at least 6 real and 6 scam items', () => {
    const s = copy();
    s.items = s.items.filter((i) => i.answer === 'real');
    expect(validateScenarios([...scenarios, s]).some((e) => e.includes('needs at least 6 real and 6 scam'))).toBe(true);
  });
});
