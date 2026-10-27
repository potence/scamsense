import { describe, expect, it } from 'vitest';
import { completeDay, currentStreak, dateKey, loadDaily, pickDaily, previousDay, saveDaily } from '../src/engine/daily.ts';
import type { KeyValueStore } from '../src/engine/storage.ts';
import { scenarios } from '../src/data/index.ts';

function fakeStore(): KeyValueStore {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("Today's practice", () => {
  it('uses the local date, with month and year boundaries', () => {
    expect(dateKey(new Date(2026, 9, 25, 23, 59))).toBe('2026-10-25');
    expect(previousDay('2026-11-01')).toBe('2026-10-31');
    expect(previousDay('2027-01-01')).toBe('2026-12-31');
  });

  it('picks the same 3 different questions all day, whatever order the pool is in', () => {
    const a = pickDaily(scenarios, '2026-10-25');
    const b = pickDaily([...scenarios].reverse(), '2026-10-25');
    expect(a).toHaveLength(3);
    expect(new Set(a.map((s) => s.id)).size).toBe(3);
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it('picks a different set on other days', () => {
    const days = ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28'];
    const sets = new Set(days.map((d) => pickDaily(scenarios, d).map((s) => s.id).join(',')));
    expect(sets.size).toBeGreaterThan(1);
  });

  it('counts a streak of days in a row', () => {
    let s = { lastDone: null as string | null, streak: 0 };
    s = completeDay(s, '2026-10-30');
    s = completeDay(s, '2026-10-31');
    s = completeDay(s, '2026-11-01'); // across a month boundary
    expect(s.streak).toBe(3);
    expect(completeDay(s, '2026-11-01')).toEqual(s); // twice in one day counts once
    expect(currentStreak(s, '2026-11-02')).toBe(3); // still alive the next day
  });

  it('starts over after a missed day', () => {
    const s = { lastDone: '2026-10-25', streak: 5 };
    expect(currentStreak(s, '2026-10-27')).toBe(0);
    expect(completeDay(s, '2026-10-27')).toEqual({ lastDone: '2026-10-27', streak: 1 });
  });

  it('saves and loads, and ignores broken data', () => {
    const store = fakeStore();
    saveDaily({ lastDone: '2026-10-25', streak: 2 }, store);
    expect(loadDaily(store)).toEqual({ lastDone: '2026-10-25', streak: 2 });
    store.setItem('scamsense-daily-v1', '{broken');
    expect(loadDaily(store)).toEqual({ lastDone: null, streak: 0 });
    expect(loadDaily(null)).toEqual({ lastDone: null, streak: 0 });
  });
});
