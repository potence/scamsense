import { describe, expect, it } from 'vitest';
import { applyTextSize, loadTextSize, TEXT_SIZES } from '../src/engine/textSize.ts';
import type { SimpleStore } from '../src/engine/textSize.ts';

function fakeStore(): SimpleStore {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

describe('textSize', () => {
  it('defaults to standard when nothing is saved', () => {
    const store = fakeStore();
    expect(loadTextSize(store)).toBe('standard');
  });

  it('applies text sizes and stores them', () => {
    const store = fakeStore();
    applyTextSize('large', store);
    expect(loadTextSize(store)).toBe('large');

    applyTextSize('xlarge', store);
    expect(loadTextSize(store)).toBe('xlarge');

    applyTextSize('standard', store);
    expect(loadTextSize(store)).toBe('standard');
  });

  it('has three defined size options', () => {
    expect(TEXT_SIZES).toHaveLength(3);
    expect(TEXT_SIZES.map((s) => s.id)).toEqual(['standard', 'large', 'xlarge']);
  });
});
