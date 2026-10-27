// "Today's practice": 3 questions picked from the date, so everyone gets the same
// 3 on the same day, plus a streak of days in a row. Saved only on this device.
import type { Scenario } from '../types.ts';
import { defaultStore } from './storage.ts';
import type { KeyValueStore } from './storage.ts';

export const DAILY_COUNT = 3;
const KEY = 'scamsense-daily-v1';

export interface DailyState {
  lastDone: string | null; // date key like "2026-10-25" of the last finished drill
  streak: number; // finished days in a row, up to lastDone
}

// The local date as "YYYY-MM-DD" (local, not UTC, so the day changes at the user's midnight).
export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The day before a date key. new Date() handles month and year boundaries for us.
export function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

// Turns text into a number, the same number every time (FNV-1a hash).
function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// The same 3 questions all day, different ones the next day.
// A seeded "random" generator (same seed -> same numbers) shuffles the pool.
export function pickDaily(pool: Scenario[], key: string, count = DAILY_COUNT): Scenario[] {
  let seed = hashText(key) || 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id)); // same start order on every device
  for (let i = sorted.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
  }
  return sorted.slice(0, count);
}

// Records that today's drill is done. Doing it twice in one day doesn't count twice.
export function completeDay(state: DailyState, today: string): DailyState {
  if (state.lastDone === today) return state;
  const continues = state.lastDone === previousDay(today);
  return { lastDone: today, streak: continues ? state.streak + 1 : 1 };
}

// The streak to show today: still alive if the last drill was today or yesterday.
export function currentStreak(state: DailyState, today: string): number {
  return state.lastDone === today || state.lastDone === previousDay(today) ? state.streak : 0;
}

export function loadDaily(store: KeyValueStore | null = defaultStore()): DailyState {
  try {
    const data = JSON.parse(store?.getItem(KEY) ?? 'null');
    if (data && typeof data.lastDone === 'string' && Number.isInteger(data.streak) && data.streak > 0) {
      return { lastDone: data.lastDone, streak: data.streak };
    }
  } catch {
    // broken data: start fresh
  }
  return { lastDone: null, streak: 0 };
}

export function saveDaily(state: DailyState, store: KeyValueStore | null = defaultStore()): void {
  try {
    store?.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked or full: the streak just won't be remembered
  }
}
