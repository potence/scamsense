// Scenario types. The written spec is vault/02-Architecture/Scenario-Schema.md;
// this file is the source of truth the code actually uses.

// The list of topics is a real array (not just a type) so the validator can check it.
export const TOPICS = [
  'phishing',
  'fake-sites',
  'quishing',
  'popups',
  'payment',
  'emergency',
  'government',
  'strangers',
  'prizes',
  'shopping',
  'credentials',
  'recovery',
] as const;
export type Topic = (typeof TOPICS)[number];

// Fields every scenario has, whatever its kind.
interface Base {
  id: string; // unique, kebab-case, e.g. "phishing-bank-01"
  topic: Topic;
  difficulty: 1 | 2 | 3;
  title: string; // short, plain language
  explanation: string; // shown after answering; 2-4 short sentences
  takeaways: string[]; // 1-3 bullets, reused in the Result card
}

// 1. Tap the red flags
export interface RedFlagScenario extends Base {
  kind: 'redflag';
  channel: 'email' | 'sms' | 'popup';
  from: string; // fictional sender
  subject?: string;
  // A segment WITH `flag` is a warning sign the user should tap.
  segments: { text: string; flag?: { id: string; reason: string } }[];
}

// 2. Pick the safe one
export interface ChoicePairScenario extends Base {
  kind: 'choicepair';
  prompt: string; // e.g. "Which address is the real bank website?"
  options: { id: string; label: string; note?: string }[]; // exactly 2 options
  correctId: string;
  reasons: Record<string, string>; // optionId -> why it is right or wrong
}

// 3. Branching phone call
export interface CallChoice {
  label: string;
  next: string; // id of the node this choice leads to
  outcome: 'safe' | 'risky' | 'neutral';
  feedback: string;
}
export interface CallNode {
  id: string;
  transcript: string; // what the caller says (always shown)
  audio?: string; // filename in public/audio
  choices?: CallChoice[]; // a normal node has choices...
  end?: { result: 'safe' | 'scammed' | 'partial'; summary: string }; // ...an end node has `end`
}
export interface CallBranchScenario extends Base {
  kind: 'callbranch';
  callerLabel: string; // e.g. "Unknown number (800) 555-0142"
  start: string; // id of the first node
  nodes: CallNode[];
}

// 4. Scan or skip (QR codes)
export interface ScanOrSkipScenario extends Base {
  kind: 'scanorskip';
  scene: string; // where the user sees the QR code
  image?: string; // optional SVG/PNG in public/img
  clues: string[]; // things to notice (shown on reveal)
  correct: 'scan' | 'skip';
}

// 5. Order the steps (procedural practice)
export interface OrderStepsScenario extends Base {
  kind: 'orderSteps';
  prompt: string; // e.g. "Put these steps in the safest order:"
  steps: string[]; // 4 or 5 steps in scrambled order
  correctOrder: number[]; // indices of steps in correct sequence
  whyFirstStepMatters: string; // explanation for why the first step is crucial
}

// 6. Real or scam? A mixed inbox. Scam items point at existing scenarios (by id),
// so their text is never copied; real items carry their own text.
export interface RealOrScamItem {
  id: string; // unique inside this inbox
  answer: 'real' | 'scam';
  scenarioRef?: string; // scam items: id of a redflag or callbranch scenario to show
  // Real items only:
  channel?: 'sms' | 'email' | 'call';
  topic?: Topic; // which topic's mastery this item counts toward
  from?: string; // sender or caller name
  subject?: string; // emails
  text?: string; // the message, or what the caller says
  audio?: string; // calls: recording in public/audio
  explanation?: string; // why it is real
  howToCheck?: string; // the quick, safe way to check a message like this
}
export interface RealOrScamScenario extends Base {
  kind: 'realorscam';
  items: RealOrScamItem[];
}

export type Scenario = RedFlagScenario | ChoicePairScenario | CallBranchScenario | ScanOrSkipScenario | OrderStepsScenario | RealOrScamScenario;

// What every interaction component reports when the user finishes a scenario.
export interface InteractionResult {
  scenarioId: string;
  topic: Topic;
  score: number; // 0..1
  correct: boolean;
}

export type Mode = 'learn' | 'practice' | 'group';

// Saved progress: how the user has done on each topic.
export interface TopicStats {
  attempts: number;
  correct: number;
}
export interface Progress {
  topics: Partial<Record<Topic, TopicStats>>; // a topic is missing until first attempt
  completed: string[]; // scenario ids finished at least once
}

// A lesson = one teach card + the scenarios for its topic.
// The lesson id IS the topic, so a lesson's scenarios are the ones with that topic.
export interface Lesson {
  id: Topic;
  title: string; // e.g. "Phishing emails and texts"
  summary: string; // one plain sentence shown on the Learn screen
  teach: string[]; // exactly 3 warning signs for the teach card
  safeMove: LabelledStep[]; // Stop / Spot / Block, each with its own sentence
}

// One labelled step, e.g. { label: 'Stop', text: "don't tap links..." }.
export interface LabelledStep {
  label: string;
  text: string;
}
