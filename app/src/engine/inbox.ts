// "Real or scam?" inbox: pure functions, so they are easy to test.
// The screen (screens/Inbox.tsx) only shows what these return.
import type { RealOrScamItem, Scenario, Topic } from '../types.ts';

export const ROUND_REAL = 6;
export const ROUND_SCAM = 6;

export type InboxAnswer = 'real' | 'scam' | 'check';

// Everything the screen needs to show one inbox item, whether it is real or a scam.
export interface InboxView {
  id: string;
  answer: 'real' | 'scam';
  channel: 'sms' | 'email' | 'call';
  from: string;
  subject?: string;
  text: string;
  audio?: string;
  topic: Topic;
  explanation: string;
  howToCheck?: string;
}

// Turns an item into what the screen shows. Scam items borrow the text of the
// scenario they point at, so nothing is written twice.
export function resolveItem(item: RealOrScamItem, scenarios: Scenario[]): InboxView {
  if (item.answer === 'real') {
    return {
      id: item.id,
      answer: 'real',
      channel: item.channel ?? 'sms',
      from: item.from ?? '',
      subject: item.subject,
      text: item.text ?? '',
      audio: item.audio,
      topic: item.topic ?? 'phishing',
      explanation: item.explanation ?? '',
      howToCheck: item.howToCheck,
    };
  }
  const s = scenarios.find((x) => x.id === item.scenarioRef);
  if (s?.kind === 'callbranch') {
    // A scam call: show the caller's first line and its recording.
    const first = s.nodes.find((n) => n.id === s.start);
    return { id: item.id, answer: 'scam', channel: 'call', from: s.callerLabel, text: first?.transcript ?? '', audio: first?.audio, topic: s.topic, explanation: s.explanation };
  }
  if (s?.kind === 'redflag') {
    return {
      id: item.id,
      answer: 'scam',
      channel: s.channel === 'email' ? 'email' : 'sms',
      from: s.from,
      subject: s.subject,
      text: s.segments.map((seg) => seg.text).join(''),
      topic: s.topic,
      explanation: s.explanation,
    };
  }
  // The validator stops this from happening; this keeps the screen from crashing if it does.
  throw new Error(`Inbox item "${item.id}" points at "${item.scenarioRef}", which is not a message or call scenario`);
}

// Shuffles a copy of a list (Fisher-Yates). `random` is a parameter so tests can make it predictable.
function shuffle<T>(list: T[], random: () => number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// One round: 6 real and 6 scam items, in mixed order. The data has more real items
// than 6, so each round shows a different selection of them.
export function pickInbox(items: RealOrScamItem[], random: () => number = Math.random): RealOrScamItem[] {
  const real = shuffle(items.filter((i) => i.answer === 'real'), random).slice(0, ROUND_REAL);
  const scam = shuffle(items.filter((i) => i.answer === 'scam'), random).slice(0, ROUND_SCAM);
  return shuffle([...real, ...scam], random);
}

// What an answer means:
//  caught  = a scam the user did not trust ("Scam" or "I'd check")
//  missed  = a scam the user called real
//  right   = a real message the user called real
//  careful = a real message the user doubted. That is fine, just slower.
export type Outcome = 'caught' | 'missed' | 'right' | 'careful';

export function judgeAnswer(answer: InboxAnswer, actual: 'real' | 'scam'): Outcome {
  if (actual === 'scam') return answer === 'real' ? 'missed' : 'caught';
  return answer === 'real' ? 'right' : 'careful';
}

// For topic mastery: checking is always a correct move; only trusting a scam or
// calling a real message a scam counts against it.
export function isCorrectAnswer(answer: InboxAnswer, actual: 'real' | 'scam'): boolean {
  return answer === actual || answer === 'check';
}
