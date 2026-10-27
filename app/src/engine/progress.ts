// Easy helpers for screens: read saved progress and summarize it per topic.
// They only combine storage.ts and scoring.ts; no new logic lives here.
import { TOPICS } from '../types.ts';
import type { Topic } from '../types.ts';
import { loadProgress } from './storage.ts';
import type { KeyValueStore } from './storage.ts';
import { mastery, weakestTopic } from './scoring.ts';

export interface TopicMastery {
  topic: Topic;
  mastery: number; // 0..1 (0.5 means "not tried yet")
  attempts: number; // 0 means the user hasn't tried this topic
}

// One entry per topic, always in the same order as TOPICS.
// `store` is only passed by tests; the app uses localStorage.
export function getTopicMastery(store?: KeyValueStore | null): TopicMastery[] {
  const progress = loadProgress(store);
  return TOPICS.map((topic) => ({
    topic,
    mastery: mastery(progress, topic),
    attempts: progress.topics[topic]?.attempts ?? 0,
  }));
}

// The topic to work on next, or null if nothing has been tried yet.
export function getWeakestTopic(store?: KeyValueStore | null): Topic | null {
  return weakestTopic(loadProgress(store));
}
