// Checks every scenario before the app is built, so bad content fails loudly
// here instead of breaking during a demo. Returns a list of error messages;
// an empty list means everything is fine.
import { TOPICS } from '../types.ts';
import type { CallBranchScenario, ChoicePairScenario, Lesson, OrderStepsScenario, RealOrScamScenario, RedFlagScenario, Scenario, ScanOrSkipScenario } from '../types.ts';

// Real brands scammers often pretend to be. Our content must use fictional names
// (see vault/03-Content/Content-Rules.md). Add to this list if you think of more.
const BANNED_BRANDS = [
  'amazon', 'paypal', 'apple', 'microsoft', 'google', 'netflix', 'walmart', 'costco',
  'ebay', 'facebook', 'venmo', 'zelle', 'cash app', 'wells fargo', 'chase', 'bank of america',
  'fedex', 'ups', 'usps', 'dhl', 'geek squad', 'norton', 'mcafee',
];

// True if the value is a string with real text in it.
function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

// Collects every string inside a scenario (titles, segments, transcripts...)
// so we can scan all the text for brand names and phone numbers in one place.
function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

// Content rules: no real brands, and phone numbers must be fake 555-01xx numbers.
function checkContentRules(s: unknown): string[] {
  const errors: string[] = [];
  for (const text of allStrings(s)) {
    const lower = text.toLowerCase();
    for (const brand of BANNED_BRANDS) {
      // Match whole words only: no letter, digit or hyphen right before or after.
      // (Plain \b treats "-" as a break, so "pop-ups" wrongly matched "ups".)
      if (new RegExp(`(?<![\\w-])${brand}(?![\\w-])`).test(lower)) errors.push(`mentions real brand "${brand}"`);
    }
    // Finds the last 7 digits of a phone number, like "555-0142" or "555 0142".
    for (const match of text.match(/\b\d{3}[\s.-]\d{4}\b/g) ?? []) {
      if (!/^555[\s.-]01\d\d$/.test(match)) errors.push(`phone number "${match}" is not a fake 555-01xx number`);
    }
  }
  return errors;
}

function checkRedFlag(s: RedFlagScenario): string[] {
  const errors: string[] = [];
  if (!['email', 'sms', 'popup'].includes(s.channel)) errors.push(`unknown channel "${s.channel}"`);
  if (!hasText(s.from)) errors.push('missing "from"');
  if (!Array.isArray(s.segments) || s.segments.length === 0) return [...errors, 'has no segments'];

  const flags = s.segments.filter((seg) => seg.flag).map((seg) => seg.flag!);
  if (flags.length < 2) errors.push(`needs at least 2 red flags, has ${flags.length}`);
  s.segments.forEach((seg, i) => {
    if (!hasText(seg.text)) errors.push(`segment ${i} has no text`);
  });
  const seen = new Set<string>();
  for (const flag of flags) {
    if (!hasText(flag.id)) errors.push('a flag has no id');
    if (!hasText(flag.reason)) errors.push(`flag "${flag.id}" has no reason`);
    if (seen.has(flag.id)) errors.push(`flag id "${flag.id}" is used twice`);
    seen.add(flag.id);
  }
  return errors;
}

function checkChoicePair(s: ChoicePairScenario): string[] {
  const errors: string[] = [];
  if (!hasText(s.prompt)) errors.push('missing prompt');
  if (!Array.isArray(s.options) || s.options.length !== 2) return [...errors, 'needs exactly 2 options'];

  const ids = s.options.map((o) => o.id);
  if (ids[0] === ids[1]) errors.push('both options have the same id');
  if (!ids.includes(s.correctId)) errors.push(`correctId "${s.correctId}" is not one of the options`);
  for (const option of s.options) {
    if (!hasText(option.label)) errors.push(`option "${option.id}" has no label`);
    if (!hasText(s.reasons?.[option.id])) errors.push(`option "${option.id}" has no reason`);
  }
  return errors;
}

function checkCallBranch(s: CallBranchScenario): string[] {
  const errors: string[] = [];
  if (!hasText(s.callerLabel)) errors.push('missing callerLabel');
  if (!Array.isArray(s.nodes) || s.nodes.length === 0) return [...errors, 'has no nodes'];

  // Look up nodes by id so we can follow the "next" links.
  const byId = new Map(s.nodes.map((n) => [n.id, n]));
  if (byId.size !== s.nodes.length) errors.push('two nodes share the same id');
  if (!byId.has(s.start)) errors.push(`start node "${s.start}" does not exist`);

  for (const node of s.nodes) {
    if (!hasText(node.transcript)) errors.push(`node "${node.id}" has no transcript`);
    if (node.end) {
      if (!['safe', 'scammed', 'partial'].includes(node.end.result)) errors.push(`node "${node.id}" has unknown end result`);
      if (!hasText(node.end.summary)) errors.push(`end node "${node.id}" has no summary`);
      continue;
    }
    if (!node.choices || node.choices.length === 0) {
      errors.push(`node "${node.id}" is not an end but has no choices`);
      continue;
    }
    for (const choice of node.choices) {
      if (!byId.has(choice.next)) errors.push(`node "${node.id}" choice "${choice.label}" goes to missing node "${choice.next}"`);
      if (!hasText(choice.label) || !hasText(choice.feedback)) errors.push(`node "${node.id}" has a choice with missing text`);
      if (!['safe', 'risky', 'neutral'].includes(choice.outcome)) errors.push(`node "${node.id}" has a choice with unknown outcome`);
    }
  }

  // Walk the call from the start node (breadth-first) and note which endings we can reach.
  const reachedEnds = new Set<string>();
  const visited = new Set<string>();
  const queue = [s.start];
  while (queue.length > 0) {
    const node = byId.get(queue.shift()!);
    if (!node || visited.has(node.id)) continue;
    visited.add(node.id);
    if (node.end) reachedEnds.add(node.end.result);
    for (const choice of node.choices ?? []) queue.push(choice.next);
  }
  if (!reachedEnds.has('safe')) errors.push('no reachable "safe" ending');
  if (!reachedEnds.has('scammed')) errors.push('no reachable "scammed" ending');
  return errors;
}

function checkScanOrSkip(s: ScanOrSkipScenario): string[] {
  const errors: string[] = [];
  if (!hasText(s.scene)) errors.push('missing scene');
  if (!Array.isArray(s.clues) || s.clues.filter(hasText).length < 2) errors.push('needs at least 2 clues');
  if (s.correct !== 'scan' && s.correct !== 'skip') errors.push('correct must be "scan" or "skip"');
  return errors;
}

function checkOrderSteps(s: OrderStepsScenario): string[] {
  const errors: string[] = [];
  if (!hasText(s.prompt)) errors.push('missing prompt');
  if (!Array.isArray(s.steps) || s.steps.length < 4 || s.steps.length > 5) {
    errors.push('needs 4 or 5 steps');
  } else if (!s.steps.every(hasText)) {
    errors.push('all steps must have text');
  }
  if (!Array.isArray(s.correctOrder)) {
    errors.push('missing correctOrder');
  } else if (Array.isArray(s.steps) && s.correctOrder.length !== s.steps.length) {
    errors.push('correctOrder length must match steps length');
  } else {
    const expected = Array.from({ length: s.steps.length }, (_, i) => i);
    const sorted = [...s.correctOrder].sort((a, b) => a - b);
    if (!sorted.every((val, idx) => val === expected[idx])) {
      errors.push('correctOrder must contain every step index from 0 to steps.length - 1');
    }
  }
  if (!hasText(s.whyFirstStepMatters)) errors.push('missing whyFirstStepMatters');
  return errors;
}

// Real or scam? inbox. Scam items must point at a real message or call scenario;
// real items must carry everything the screen shows.
function checkRealOrScam(s: RealOrScamScenario, all: Scenario[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(s.items)) return ['has no items'];
  const real = s.items.filter((i) => i.answer === 'real').length;
  const scam = s.items.filter((i) => i.answer === 'scam').length;
  if (real < 6 || scam < 6) errors.push(`needs at least 6 real and 6 scam items (has ${real} real, ${scam} scam)`);

  const seen = new Set<string>();
  for (const item of s.items) {
    const name = `item "${item.id}"`;
    if (!hasText(item.id)) errors.push('an item has no id');
    if (seen.has(item.id)) errors.push(`${name} id is used twice`);
    seen.add(item.id);

    if (item.answer === 'scam') {
      const target = all.find((x) => x.id === item.scenarioRef);
      if (!target) errors.push(`${name} points at missing scenario "${item.scenarioRef}"`);
      else if (target.kind !== 'redflag' && target.kind !== 'callbranch') errors.push(`${name} must point at a message or call scenario, not "${target.kind}"`);
    } else if (item.answer === 'real') {
      if (!['sms', 'email', 'call'].includes(item.channel ?? '')) errors.push(`${name} needs channel sms, email or call`);
      if (!TOPICS.includes(item.topic as never)) errors.push(`${name} has unknown topic "${item.topic}"`);
      for (const field of ['from', 'text', 'explanation', 'howToCheck'] as const) {
        if (!hasText(item[field])) errors.push(`${name} is missing ${field}`);
      }
    } else {
      errors.push(`${name} answer must be "real" or "scam"`);
    }
  }
  return errors;
}

// Main entry point. Returns errors: anything here must be fixed before committing.
export function validateScenarios(scenarios: Scenario[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const s of scenarios) {
    const problems: string[] = [];

    // Checks shared by every kind.
    if (!hasText(s.id)) problems.push('missing id');
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) problems.push('id must be kebab-case');
    if (seenIds.has(s.id)) problems.push('id is used by another scenario');
    seenIds.add(s.id);
    if (!TOPICS.includes(s.topic)) problems.push(`unknown topic "${s.topic}"`);
    if (![1, 2, 3].includes(s.difficulty)) problems.push('difficulty must be 1, 2 or 3');
    if (!hasText(s.title)) problems.push('missing title');
    if (!hasText(s.explanation)) problems.push('missing explanation');
    if (!Array.isArray(s.takeaways) || s.takeaways.length < 1 || s.takeaways.length > 3 || !s.takeaways.every(hasText)) {
      problems.push('needs 1-3 takeaways');
    }

    // Checks for each kind.
    if (s.kind === 'redflag') problems.push(...checkRedFlag(s));
    else if (s.kind === 'choicepair') problems.push(...checkChoicePair(s));
    else if (s.kind === 'callbranch') problems.push(...checkCallBranch(s));
    else if (s.kind === 'scanorskip') problems.push(...checkScanOrSkip(s));
    else if (s.kind === 'orderSteps') problems.push(...checkOrderSteps(s));
    else if (s.kind === 'realorscam') problems.push(...checkRealOrScam(s, scenarios));
    else problems.push(`unknown kind "${(s as { kind: unknown }).kind}"`);

    problems.push(...checkContentRules(s));
    // Prefix each problem with the scenario id so it's easy to find.
    errors.push(...problems.map((p) => `${s.id || '(no id)'}: ${p}`));
  }
  return errors;
}

// Checks lessons.json: one lesson per known topic, 3 teach bullets each,
// and every lesson has at least one scenario to play.
export function validateLessons(lessons: Lesson[], scenarios: Scenario[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const lesson of lessons) {
    const problems: string[] = [];
    if (!TOPICS.includes(lesson.id)) problems.push(`id "${lesson.id}" is not a known topic`);
    if (seenIds.has(lesson.id)) problems.push('id is used by another lesson');
    seenIds.add(lesson.id);
    if (!hasText(lesson.title)) problems.push('missing title');
    if (!hasText(lesson.summary)) problems.push('missing summary');
    if (!Array.isArray(lesson.safeMove) || lesson.safeMove.length !== 3 || !lesson.safeMove.every((m) => hasText(m?.label) && hasText(m?.text))) {
      problems.push('safeMove needs 3 steps, each with a label and text');
    }
    if (!Array.isArray(lesson.teach) || lesson.teach.length !== 3 || !lesson.teach.every(hasText)) {
      problems.push('teach card needs exactly 3 bullets');
    }
    if (!scenarios.some((s) => s.topic === lesson.id)) problems.push('has no scenarios');
    problems.push(...checkContentRules(lesson));
    errors.push(...problems.map((p) => `lesson ${lesson.id}: ${p}`));
  }
  return errors;
}

// Every audio file a call scenario asks for, with the line it should say.
// Used by the warning check below and by `npm run audio:list`.
export function audioNeeded(scenarios: Scenario[]): { file: string; scenarioId: string; nodeId: string; transcript: string }[] {
  return scenarios.flatMap((s) => {
    if (s.kind === 'callbranch') {
      return s.nodes.filter((n) => n.audio).map((n) => ({ file: n.audio!, scenarioId: s.id, nodeId: n.id, transcript: n.transcript }));
    }
    if (s.kind === 'realorscam') {
      // Real calls in the inbox have their own recordings (scam calls reuse their scenario's).
      return s.items.filter((i) => i.audio).map((i) => ({ file: i.audio!, scenarioId: s.id, nodeId: i.id, transcript: i.text ?? '' }));
    }
    return [];
  });
}

// Missing recordings are WARNINGS, not errors: the app still works (it shows the
// transcript and offers the device's voice). `npm run validate:strict` treats them as errors for release.
export function missingAudio(scenarios: Scenario[], audioFiles: string[]): string[] {
  return audioNeeded(scenarios)
    .filter((a) => !audioFiles.includes(a.file))
    .map((a) => `${a.scenarioId}: recording "${a.file}" is not in public/audio yet`);
}
