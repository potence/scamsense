import { describe, expect, it } from 'vitest';
import { emptyProgress, loadProgress, resetProgress, saveProgress } from '../src/engine/storage.ts';
import type { KeyValueStore } from '../src/engine/storage.ts';
import { recordResult } from '../src/engine/scoring.ts';

// A pretend localStorage backed by a Map.
function fakeStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

// A localStorage that fails on every call, like some private-browsing modes.
const brokenStore: KeyValueStore = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('storage', () => {
  it('saves and loads progress', () => {
    const store = fakeStore();
    const p = recordResult(emptyProgress(), { scenarioId: 'a', topic: 'phishing', correct: true });
    expect(saveProgress(p, store)).toBe(true);
    expect(loadProgress(store)).toEqual(p);
    resetProgress(store);
    expect(loadProgress(store)).toEqual(emptyProgress());
  });

  it('starts fresh when nothing is saved or storage is missing', () => {
    expect(loadProgress(fakeStore())).toEqual(emptyProgress());
    expect(loadProgress(null)).toEqual(emptyProgress());
    expect(saveProgress(emptyProgress(), null)).toBe(false);
  });

  it('does not crash when storage throws', () => {
    expect(loadProgress(brokenStore)).toEqual(emptyProgress());
    expect(saveProgress(emptyProgress(), brokenStore)).toBe(false);
    expect(() => resetProgress(brokenStore)).not.toThrow();
  });

  it('ignores broken or tampered data', () => {
    const store = fakeStore();
    store.data.set('scamsense-progress-v1', '{not json');
    expect(loadProgress(store)).toEqual(emptyProgress());

    store.data.set(
      'scamsense-progress-v1',
      JSON.stringify({
        topics: { phishing: { attempts: 2, correct: 1 }, quishing: { attempts: 1, correct: 5 }, romance: { attempts: 1, correct: 1 } },
        completed: ['a', 42],
      }),
    );
    expect(loadProgress(store)).toEqual({ topics: { phishing: { attempts: 2, correct: 1 } }, completed: ['a'] });
  });
});
