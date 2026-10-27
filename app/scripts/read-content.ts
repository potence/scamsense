// Reads the content files from disk for the command-line scripts.
// (The app itself loads them through Vite in src/data/index.ts.)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { Lesson, Scenario } from '../src/types.ts';

const scenarioDir = new URL('../src/data/scenarios/', import.meta.url);
const audioDir = new URL('../public/audio/', import.meta.url);

// Returns what it could read, plus problems with files that couldn't be read.
export function readContent(): { scenarios: Scenario[]; lessons: Lesson[]; audioFiles: string[]; errors: string[] } {
  const scenarios: Scenario[] = [];
  const errors: string[] = [];
  let lessons: Lesson[] = [];

  for (const file of readdirSync(scenarioDir).filter((f) => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(readFileSync(new URL(file, scenarioDir), 'utf8'));
      if (Array.isArray(data)) scenarios.push(...data);
      else errors.push(`${file}: must contain an array of scenarios`);
    } catch (e) {
      errors.push(`${file}: is not valid JSON (${(e as Error).message})`);
    }
  }

  try {
    lessons = JSON.parse(readFileSync(new URL('../src/data/lessons.json', import.meta.url), 'utf8'));
  } catch (e) {
    errors.push(`lessons.json: could not be read (${(e as Error).message})`);
  }

  return { scenarios, lessons, audioFiles: readdirSync(audioDir), errors };
}

// Recordings in public/audio/narration, as "narration/<name>.mp3" (the manifest's file names).
export function narrationFiles(): string[] {
  const dir = new URL('narration/', audioDir);
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => `narration/${f}`) : [];
}

// A short fingerprint of a text: if the text changes, so does this.
export function textHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 12);
}
