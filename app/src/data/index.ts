// Loads the lessons and every scenario file in data/scenarios.
// import.meta.glob is a Vite feature: it finds the files at build time.
import type { Lesson, RealOrScamScenario, Scenario } from '../types.ts';
import lessonData from './lessons.json';

const files = import.meta.glob<Scenario[]>('./scenarios/*.json', { eager: true, import: 'default' });

const all: Scenario[] = Object.values(files).flat();

// Lessons and practice use these. The "Real or scam?" inbox has its own screen.
export const scenarios: Scenario[] = all.filter((s) => s.kind !== 'realorscam');
export const inbox = all.find((s) => s.kind === 'realorscam') as RealOrScamScenario | undefined;

// In the order the student wants them taught (the order in lessons.json).
export const lessons = lessonData as Lesson[];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

// A lesson's scenarios, easiest first. Unknown lesson id -> empty list.
export function scenariosForLesson(id: string): Scenario[] {
  return scenarios.filter((s) => s.topic === id).sort((a, b) => a.difficulty - b.difficulty);
}
