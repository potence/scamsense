// Turns what the user did into a score from 0 to 1, and tracks how well
// they know each topic ("mastery"). All functions are pure: same input, same output.
import type { CallNode, Progress, Topic } from '../types.ts';

// A score at or above this counts as "correct" for mastery tracking.
export const PASS_SCORE = 0.7;

// Each wrong tap cancels out half of a found flag, so tapping everything doesn't win.
export const FALSE_TAP_PENALTY = 0.5;

// Keeps a number between 0 and 1.
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

// RedFlagTap: (flags found - penalty for wrong taps) / total flags.
// Example: 3 of 4 flags found, 1 wrong tap -> (3 - 0.5) / 4 = 0.625.
export function scoreRedFlag(found: number, falseTaps: number, totalFlags: number): number {
  if (totalFlags === 0) return 0;
  return clamp01((found - FALSE_TAP_PENALTY * falseTaps) / totalFlags);
}

// ChoicePair and ScanOrSkip: right answer = 1, wrong answer = 0.
export function scoreChoice(chosen: string, correct: string): number {
  return chosen === correct ? 1 : 0;
}

// CallBranch: the score depends on how the call ended.
export function scoreCallEnd(result: NonNullable<CallNode['end']>['result']): number {
  if (result === 'safe') return 1;
  if (result === 'partial') return 0.5;
  return 0; // scammed
}

// OrderSteps: 1.0 if perfectly ordered, 0.7 if first step is correct and <= 1 mistake elsewhere, 0 otherwise.
export function scoreOrderSteps(placed: number[], correct: number[]): number {
  if (placed.length !== correct.length || placed.length === 0) return 0;
  const isPerfect = placed.every((val, idx) => val === correct[idx]);
  if (isPerfect) return 1;

  if (placed[0] !== correct[0]) return 0;

  let mistakes = 0;
  for (let i = 1; i < placed.length; i++) {
    if (placed[i] !== correct[i]) mistakes++;
  }
  return mistakes <= 1 ? 0.7 : 0;
}

export function isCorrect(score: number): boolean {
  return score >= PASS_SCORE;
}

// Mastery = correct / attempts, with a "smoothing prior": we pretend everyone
// starts with 1 correct out of 2. A new topic starts at 0.5 (unknown) instead
// of 0 or 1, and one lucky or unlucky answer doesn't swing it too far.
export function mastery(progress: Progress, topic: Topic): number {
  const stats = progress.topics[topic] ?? { attempts: 0, correct: 0 };
  return (stats.correct + 1) / (stats.attempts + 2);
}

// Records one finished scenario. Returns a NEW progress object (doesn't change the old one),
// which is what React state expects.
export function recordResult(progress: Progress, r: { scenarioId: string; topic: Topic; correct: boolean }): Progress {
  const old = progress.topics[r.topic] ?? { attempts: 0, correct: 0 };
  return {
    topics: {
      ...progress.topics,
      [r.topic]: { attempts: old.attempts + 1, correct: old.correct + (r.correct ? 1 : 0) },
    },
    completed: progress.completed.includes(r.scenarioId) ? progress.completed : [...progress.completed, r.scenarioId],
  };
}

// The topic with the lowest mastery among those the user has tried (for "work on this next").
// Returns null if nothing has been tried yet.
export function weakestTopic(progress: Progress): Topic | null {
  const tried = Object.keys(progress.topics) as Topic[];
  if (tried.length === 0) return null;
  return tried.reduce((weakest, t) => (mastery(progress, t) < mastery(progress, weakest) ? t : weakest));
}
