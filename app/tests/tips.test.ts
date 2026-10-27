import { describe, it, expect } from 'vitest';
import { DAILY_TIPS, getTipOfTheDay } from '../src/data/tips.ts';

describe('Daily Tips', () => {
  it('has 30 well-formed tips', () => {
    expect(DAILY_TIPS).toHaveLength(30);
    for (const t of DAILY_TIPS) {
      expect(t.id).toBeGreaterThan(0);
      expect(t.category.length).toBeGreaterThan(0);
      expect(t.tip.length).toBeGreaterThan(20);
    }
  });

  it('deterministically returns a tip for a date', () => {
    const d1 = new Date(2026, 9, 26);
    const d2 = new Date(2026, 9, 26);
    const d3 = new Date(2026, 9, 27);

    const tip1 = getTipOfTheDay(d1);
    const tip2 = getTipOfTheDay(d2);
    const tip3 = getTipOfTheDay(d3);

    expect(tip1.id).toBe(tip2.id);
    expect(tip1.tip).toBe(tip2.tip);
    // Consecutive days should get different tips
    expect(tip1.id).not.toBe(tip3.id);
  });
});
