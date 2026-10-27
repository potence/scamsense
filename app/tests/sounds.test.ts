import { describe, expect, it } from 'vitest';
import { isSoundOn, playSound, setCallerPlaying, setSoundOn } from '../src/engine/sounds.ts';
import type { KeyValueStore } from '../src/engine/storage.ts';

function fakeStore(): KeyValueStore {
  const data = new Map<string, string>();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('sounds', () => {
  it('are off until the user turns them on, and the choice is saved', () => {
    const store = fakeStore();
    expect(isSoundOn(store)).toBe(false);
    setSoundOn(true, store);
    expect(isSoundOn(store)).toBe(true);
    setSoundOn(false, store);
    expect(isSoundOn(store)).toBe(false);
    expect(isSoundOn(null)).toBe(false);
  });

  it('never crash where there is no Web Audio (tests run in Node, which has none)', () => {
    setSoundOn(true, fakeStore());
    expect(() => playSound('spotted')).not.toThrow();
    setCallerPlaying(true);
    expect(() => playSound('ring')).not.toThrow();
    setCallerPlaying(false);
    setSoundOn(false, fakeStore());
  });
});
