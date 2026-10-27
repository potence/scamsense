// Run with `npm run narration:manifest`. Builds app/src/data/audio-manifest.json:
// every text that has a "Read aloud" button, its fingerprint (hash), and the file its
// recording should have. Prints how many characters each tier needs.
// An entry that already has a recording is never changed here, so if its text changed
// later, `npm run validate` keeps warning until it is re-recorded.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { narrationTexts } from '../src/engine/narration.ts';
import type { Manifest } from '../src/engine/narration.ts';
import { narrationFiles, readContent, textHash } from './read-content.ts';

const manifestUrl = new URL('../src/data/audio-manifest.json', import.meta.url);
const { scenarios, lessons } = readContent();
const files = narrationFiles();
const old: Manifest = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : {};

const manifest: Manifest = {};
const toRecord = { 1: 0, 2: 0, 3: 0 };
const total = { 1: 0, 2: 0, 3: 0 };

// Preserve any previously recorded files so no recordings are ever dropped
for (const [id, entry] of Object.entries(old)) {
  if (files.includes(entry.file)) {
    manifest[id] = entry;
  }
}

for (const n of narrationTexts(lessons, scenarios)) {
  const kept = manifest[n.id] ?? old[n.id];
  const recorded = kept && files.includes(kept.file);
  manifest[n.id] = recorded ? kept : { tier: n.tier, text: n.text, hash: textHash(n.text), file: `narration/${n.id}.mp3` };
  total[n.tier] += n.text.length;
  // Still to record: no file yet, or the text changed since the recording.
  if (!recorded || kept.hash !== textHash(n.text)) toRecord[n.tier] += n.text.length;
}

writeFileSync(manifestUrl, JSON.stringify(manifest, null, 2) + '\n');
const count = Object.keys(manifest).length;
console.log(`Wrote src/data/audio-manifest.json with ${count} texts (${files.length} recordings in public/audio/narration).`);
for (const tier of [1, 2, 3] as const) {
  const n = Object.values(manifest).filter((e) => e.tier === tier).length;
  console.log(`Tier ${tier}: ${n} texts, ${total[tier]} characters, ${toRecord[tier]} still to record.`);
}
console.log(`Total still to record: ${toRecord[1] + toRecord[2] + toRecord[3]} characters.`);
