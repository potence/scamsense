// Run with `npm run validate`. Checks all lessons and scenarios and exits with an
// error if anything is wrong, so broken content can't be committed by accident.
// `npm run validate:strict` (for release) also fails if any call recording is missing.
import { readFileSync } from 'node:fs';
import { missingAudio, validateLessons, validateScenarios } from '../src/engine/validate.ts';
import { narrationFiles, readContent, textHash } from './read-content.ts';
import { narrationStatus, narrationTexts } from '../src/engine/narration.ts';
import type { Manifest } from '../src/engine/narration.ts';
import { existsSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const { scenarios, lessons, audioFiles, errors } = readContent();

errors.push(...validateScenarios(scenarios), ...validateLessons(lessons, scenarios));
const warnings = missingAudio(scenarios, audioFiles);

if (warnings.length > 0) {
  console.warn(`${warnings.length} warning(s) (run "npm run audio:list" to see what to record):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

// Narration ("Read aloud" recordings): warnings only, even in strict mode, because the
// app simply hides a Read aloud button whose recording is missing or out of date.
const manifestUrl = new URL('../src/data/audio-manifest.json', import.meta.url);
const manifest: Manifest = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : {};
const narration = narrationStatus(narrationTexts(lessons, scenarios), manifest, narrationFiles(), textHash);
console.warn(`Narration: ${narration.recorded} of ${narration.needed} recordings exist.`);
for (const id of narration.changed) console.warn(`  - ${id}: text changed after it was recorded (re-record it)`);
if (narration.unlisted.length > 0) console.warn(`  - ${narration.unlisted.length} text(s) not in the manifest yet: run "npm run narration:manifest"`);

const failures = strict ? [...errors, ...warnings] : errors;
if (failures.length > 0) {
  console.error(`Found ${failures.length} problem(s)${strict ? ' (strict mode: missing recordings count too)' : ''}:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`All ${lessons.length} lessons and ${scenarios.length} scenarios are valid.`);
