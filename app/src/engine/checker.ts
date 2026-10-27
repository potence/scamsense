// "Check a message": looks for common warning signs in pasted text.
// Pure functions: text in, findings out. It can only point at warning signs;
// it can never say a message is safe.

export interface Finding {
  rule: string; // short name of the rule, e.g. "urgency"
  reason: string; // plain-language explanation shown to the user
  start: number; // where the matching words start in the text
  end: number; // where they end
}

// Word rules: each regex finds phrases that are warning signs.
const WORD_RULES: { rule: string; reason: string; pattern: RegExp }[] = [
  {
    rule: 'urgency',
    reason: 'Pressure to act fast, or a threat, is a warning sign. Real organizations give you time.',
    pattern: /\b(urgent|immediately|right away|act now|within \d+ (hours?|minutes?|days?)|today only|final notice|last chance|suspended|locked|will be (closed|cancell?ed|deleted|suspended)|arrest(ed)?|warrant|legal action|lawsuit|expires? (today|soon)|deadline)\b/gi,
  },
  {
    rule: 'payment',
    reason: 'Gift cards, wire transfers and crypto are how scammers like to be paid. Real companies and government offices do not ask for them.',
    pattern: /\b(gift ?cards?|wire (transfer|the money|money)|bitcoin|crypto(currency)?|prepaid (debit )?cards?|money order)\b/gi,
  },
  {
    rule: 'secrecy',
    reason: 'Being asked to keep it secret is a warning sign. Scammers do not want you to check with anyone.',
    pattern: /\b((don'?t|do not) (tell|talk to) (anyone|anybody|your family|mom|dad)|keep (this|it) (a )?(secret|between us|confidential)|between us)\b/gi,
  },
  {
    rule: 'codes',
    reason: 'Never share codes, passwords, PINs or your Social Security number with someone who contacted you.',
    pattern: /\b(password|passcode|pin( number)?|social security( number)?|ssn|one[- ]time code|verification code|security code|(read|tell|give|send) (me|us) (the|your|that) code)\b/gi,
  },
  {
    rule: 'prize',
    reason: 'Surprise prizes are a classic trick. If you must pay or share details to get a prize, it is not a prize.',
    pattern: /\b(you('ve| have)? won|winner|prize|lottery|sweepstakes|claim your (reward|gift)|free gift|congratulations)\b/gi,
  },
];

// Link shorteners hide where a link really goes.
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rebrand.ly', 'tiny.cc', 'shorturl.at'];

// Finds web links and bare addresses like "example.com/pay".
const LINK = /\b(https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,}|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?(\/[^\s]*)?/gi;

// Checks one link and returns the reasons it looks risky.
export function linkReasons(link: string): string[] {
  const reasons: string[] = [];
  const lower = link.toLowerCase();
  const host = lower.replace(/^https?:\/\//, '').split(/[/:?#]/)[0];
  const name = host.split('.').slice(0, -1).join('.'); // the address without its ending (.com, .net)

  if (SHORTENERS.includes(host)) reasons.push('This is a short link. Short links hide where they really go.');
  if (lower.startsWith('http://')) reasons.push('This link is not secure (it starts with http, not https).');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) reasons.push('This link is a string of numbers instead of a name. Real companies use their name.');
  if ((host.match(/-/g) ?? []).length >= 2) reasons.push('This address has many hyphens. Fake sites often string words together like this.');
  if (/login|verify|secure/.test(name)) reasons.push('Words like "login", "verify" or "secure" in the address are often added to make a fake site look official.');
  if (/[a-z][01]|[01][a-z]/.test(name)) reasons.push('This address mixes numbers into letters, like 0 for o or 1 for l. That is a look-alike trick.');
  if (/rn/.test(name)) reasons.push('Look closely: "rn" next to each other can look like the letter m.');
  return reasons;
}

// Runs every rule and returns the findings in the order they appear in the text.
export function checkMessage(text: string): Finding[] {
  const findings: Finding[] = [];
  for (const { rule, reason, pattern } of WORD_RULES) {
    for (const m of text.matchAll(pattern)) {
      findings.push({ rule, reason, start: m.index, end: m.index + m[0].length });
    }
  }
  for (const m of text.matchAll(LINK)) {
    for (const reason of linkReasons(m[0])) {
      findings.push({ rule: 'link', reason, start: m.index, end: m.index + m[0].length });
    }
  }
  return findings.sort((a, b) => a.start - b.start || a.end - b.end);
}

// Splits the text into plain parts and highlighted parts (with all their reasons),
// so the screen can show the message with the warning signs marked.
export function toSegments(text: string, findings: Finding[]): { text: string; reasons: string[] }[] {
  const segments: { text: string; reasons: string[] }[] = [];
  let pos = 0;
  let i = 0;
  while (i < findings.length) {
    // Join findings that overlap into one highlighted part.
    let { start, end } = findings[i];
    const reasons = [findings[i].reason];
    i++;
    while (i < findings.length && findings[i].start < end) {
      end = Math.max(end, findings[i].end);
      if (!reasons.includes(findings[i].reason)) reasons.push(findings[i].reason);
      i++;
    }
    if (start < pos) start = pos;
    if (start > pos) segments.push({ text: text.slice(pos, start), reasons: [] });
    segments.push({ text: text.slice(start, end), reasons });
    pos = end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), reasons: [] });
  return segments;
}
