import { describe, expect, it } from 'vitest';
import { pickPractice, weightFor } from '../src/engine/practice.ts';
import { recordResult } from '../src/engine/scoring.ts';
import { emptyProgress } from '../src/engine/storage.ts';
import { scenarios } from '../src/data/index.ts';
import type { Progress } from '../src/types.ts';

// A simple predictable "random" generator so tests give the same answer every run.
function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

// Progress where the user aced "phishing" many times and failed "quishing" many times.
function lopsided(): Progress {
  let p = emptyProgress();
  for (let i = 0; i < 10; i++) {
    p = recordResult(p, { scenarioId: `p${i}`, topic: 'phishing', correct: true });
    p = recordResult(p, { scenarioId: `q${i}`, topic: 'quishing', correct: false });
  }
  return p;
}

describe('pickPractice', () => {
  it('never repeats a scenario and stops when it runs out', () => {
    const picked = pickPractice(scenarios, emptyProgress(), 100, seeded(1));
    expect(picked.length).toBe(scenarios.length);
    expect(new Set(picked.map((s) => s.id)).size).toBe(scenarios.length);
  });

  it('gives weak topics a higher weight, but strong topics still have some', () => {
    const p = lopsided();
    const phish = scenarios.find((s) => s.topic === 'phishing')!;
    const qr = scenarios.find((s) => s.topic === 'quishing')!;
    expect(weightFor(qr, p)).toBeGreaterThan(weightFor(phish, p));
    expect(weightFor(phish, p)).toBeGreaterThan(0);
  });

  it('picks weak-topic questions first much more often', () => {
    const p = lopsided();
    const pool = scenarios.filter((s) => s.topic === 'phishing' || s.topic === 'quishing');
    const random = seeded(42);
    let weakFirst = 0;
    for (let i = 0; i < 1000; i++) {
      if (pickPractice(pool, p, 1, random)[0].topic === 'quishing') weakFirst++;
    }
    expect(weakFirst).toBeGreaterThan(700);
  });
});
