// Picks practice questions, favoring topics the user is weakest at.
import type { Progress, Scenario } from '../types.ts';
import { mastery } from './scoring.ts';

// Even a topic you've mastered keeps a small chance of showing up, for review.
const MIN_WEIGHT = 0.1;

// How likely a scenario is to be picked: low mastery -> high weight.
export function weightFor(scenario: Scenario, progress: Progress): number {
  return Math.max(MIN_WEIGHT, 1 - mastery(progress, scenario.topic));
}

// Picks `count` different scenarios at random, weighted toward weak topics.
// `random` is a parameter so tests can pass a predictable one; the app uses Math.random.
export function pickPractice(scenarios: Scenario[], progress: Progress, count: number, random: () => number = Math.random): Scenario[] {
  const pool = [...scenarios];
  const picked: Scenario[] = [];

  while (picked.length < count && pool.length > 0) {
    // "Weighted lottery": each scenario gets a slice of the line as wide as its weight.
    // Pick a random point on the line and see whose slice it lands in.
    const weights = pool.map((s) => weightFor(s, progress));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let point = random() * total;
    let index = 0;
    while (index < pool.length - 1 && point >= weights[index]) {
      point -= weights[index];
      index++;
    }
    // Remove it from the pool so the same question never appears twice in one round.
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}
