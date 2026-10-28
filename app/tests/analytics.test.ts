import { describe, expect, it } from 'vitest';
import { shouldCount, trackEvent, trackPage } from '../src/engine/analytics.ts';

describe('analytics', () => {
  it('only counts with a site code, and never on the developer machine', () => {
    expect(shouldCount('potence.github.io', '')).toBe(false);
    expect(shouldCount('potence.github.io', 'scamsense')).toBe(true);
    expect(shouldCount('scamsense.io', 'scamsense')).toBe(true);
    expect(shouldCount('localhost', 'scamsense')).toBe(false);
    expect(shouldCount('127.0.0.1', 'scamsense')).toBe(false);
  });

  it('never throws where there is no browser (tests run in Node)', () => {
    expect(() => trackPage('/learn')).not.toThrow();
    expect(() => trackEvent('lesson-done/payment/3of3')).not.toThrow();
  });
});
