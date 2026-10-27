import { describe, expect, it } from 'vitest';
import { getTopicMastery, getWeakestTopic } from '../src/engine/progress.ts';
import { emptyProgress, saveProgress } from '../src/engine/storage.ts';
import type { KeyValueStore } from '../src/engine/storage.ts';
import { recordResult } from '../src/engine/scoring.ts';
import { TOPICS } from '../src/types.ts';

// A pretend localStorage backed by a Map.
function fakeStore(): KeyValueStore {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('progress helpers', () => {
  it('lists every topic at 0.5 with no attempts when nothing is saved', () => {
    const list = getTopicMastery(fakeStore());
    expect(list.map((t) => t.topic)).toEqual([...TOPICS]);
    expect(list.every((t) => t.mastery === 0.5 && t.attempts === 0)).toBe(true);
    expect(getWeakestTopic(fakeStore())).toBeNull();
  });

  it('reads saved progress and finds the weakest topic', () => {
    const store = fakeStore();
    let p = recordResult(emptyProgress(), { scenarioId: 'a', topic: 'phishing', correct: true });
    p = recordResult(p, { scenarioId: 'b', topic: 'popups', correct: false });
    saveProgress(p, store);

    const phish = getTopicMastery(store).find((t) => t.topic === 'phishing')!;
    expect(phish).toEqual({ topic: 'phishing', mastery: 2 / 3, attempts: 1 });
    expect(getWeakestTopic(store)).toBe('popups');
  });

  it('works with no storage at all', () => {
    expect(getTopicMastery(null)).toHaveLength(TOPICS.length);
    expect(getWeakestTopic(null)).toBeNull();
  });
});
