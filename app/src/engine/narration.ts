// Recorded narration for the "Read aloud" buttons.
// Every text that can be read aloud has an id and is built by one of the functions
// below, which both the screens and the manifest script use, so the recorded text
// always matches the text on screen.
import type { LabelledStep, Lesson, RealOrScamItem, Scenario } from '../types.ts';

// Tier 1 = teach cards and messages, Tier 2 = explanations, Tier 3 = everything else.
export interface NarrationText {
  id: string;
  tier: 1 | 2 | 3;
  text: string;
}

// One entry in app/src/data/audio-manifest.json.
export interface ManifestEntry {
  tier: 1 | 2 | 3;
  text: string; // the exact text that was (or will be) recorded
  hash: string; // fingerprint of that text, to spot later changes
  file: string; // path inside app/public/audio, e.g. "narration/teach-phone.mp3"
}
export type Manifest = Record<string, ManifestEntry>;

// ----- The texts -----

// The spoken safe move keeps its original wording ("STOP: ... SPOT: ..."), so the recorded
// narration still matches; the screen shows each step as its own label and sentence.
export function safeMoveText(steps: LabelledStep[]): string {
  return steps.map((s) => `${s.label.toUpperCase()}: ${s.text}`).join(' ');
}

export function teachText(t: { title: string; subtitle: string; warningSigns: string[]; safeMove: LabelledStep[] }): string {
  return `${t.title}. ${t.subtitle} Three warning signs. ${t.warningSigns.join(' ')} The safe move. ${safeMoveText(t.safeMove)}`;
}

// What a message, question or situation says, for the scenario kinds that show one.
export function messageText(s: Scenario): string | null {
  if (s.kind === 'redflag') return `From ${s.from}. ${s.subject ? `Subject: ${s.subject}. ` : ''}${s.segments.map((seg) => seg.text).join('')}`;
  if (s.kind === 'choicepair') return `${s.prompt} ${s.options.map((o, i) => `Choice ${i + 1}: ${o.label}.`).join(' ')}`;
  if (s.kind === 'scanorskip') return s.scene;
  if (s.kind === 'orderSteps') return `${s.prompt} Put these steps in order: ${s.steps.join(' ')}`;
  return null; // calls have their own recordings; the inbox is handled per item
}

export function inboxMessageText(item: RealOrScamItem): string {
  return `From ${item.from}. ${item.subject ? `Subject: ${item.subject}. ` : ''}${item.text}`;
}

export function rememberText(takeaways: string[]): string {
  return `Remember. ${takeaways.join(' ')}`;
}

// ----- The full list (used by the manifest script and the validator) -----

export function narrationTexts(lessons: Lesson[], all: Scenario[]): NarrationText[] {
  const list: NarrationText[] = [];
  const lessonScenarios = all.filter((s) => s.kind !== 'realorscam');

  for (const l of lessons) {
    list.push({ id: `teach-${l.id}`, tier: 1, text: teachText({ title: l.title, subtitle: l.summary, warningSigns: l.teach, safeMove: l.safeMove }) });
  }
  for (const s of lessonScenarios) {
    const message = messageText(s);
    if (message) list.push({ id: `message-${s.id}`, tier: 1, text: message });
  }
  for (const s of all) {
    if (s.kind !== 'realorscam') continue;
    for (const item of s.items) {
      if (item.answer === 'real' && item.channel !== 'call') list.push({ id: `message-${item.id}`, tier: 1, text: inboxMessageText(item) });
      if (item.answer === 'real') list.push({ id: `explain-${item.id}`, tier: 2, text: item.explanation ?? '' });
    }
  }
  for (const s of lessonScenarios) list.push({ id: `explain-${s.id}`, tier: 2, text: s.explanation });
  for (const l of lessons) {
    // The lesson's result card reads back the takeaways of its scenarios, in lesson order.
    const takeaways = Array.from(new Set(lessonScenarios.filter((s) => s.topic === l.id).sort((a, b) => a.difficulty - b.difficulty).flatMap((s) => s.takeaways)));
    list.push({ id: `remember-${l.id}`, tier: 3, text: rememberText(takeaways) });
  }
  return list;
}

// ----- Checking the manifest against the current texts -----

// Compares what is on screen now with what was recorded.
//  missing  = no recording file yet
//  changed  = the text changed after it was recorded (the recording is out of date)
//  unlisted = a text that isn't in the manifest at all (run `npm run narration:manifest`)
export function narrationStatus(current: NarrationText[], manifest: Manifest, files: string[], hash: (text: string) => string) {
  const missing: string[] = [];
  const changed: string[] = [];
  const unlisted: string[] = [];
  let recorded = 0;
  for (const n of current) {
    const entry = manifest[n.id];
    if (!entry) {
      unlisted.push(n.id);
      continue;
    }
    const hasFile = files.includes(entry.file);
    if (hasFile) recorded++;
    else missing.push(n.id);
    if (hasFile && entry.hash !== hash(n.text)) changed.push(n.id);
  }
  return { needed: current.length, recorded, missing, changed, unlisted };
}
