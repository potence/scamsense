// Saves progress in the browser (localStorage). Everything stays on the device.
// If storage is unavailable (private browsing, blocked, broken data), the app
// still works; it just won't remember progress.
import { TOPICS } from '../types.ts';
import type { Progress } from '../types.ts';

const KEY = 'scamsense-progress-v1';

// The parts of localStorage we use. Tests pass in a fake one.
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function emptyProgress(): Progress {
  return { topics: {}, completed: [] };
}

// Finding localStorage can itself throw in some browsers, so we check carefully.
export function defaultStore(): KeyValueStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

// Saved data could be old, edited by hand, or broken, so check its shape
// and keep only the parts that look right.
function cleanProgress(data: unknown): Progress {
  const progress = emptyProgress();
  if (!data || typeof data !== 'object') return progress;
  const { topics, completed } = data as Record<string, unknown>;

  if (topics && typeof topics === 'object') {
    for (const topic of TOPICS) {
      const stats = (topics as Record<string, unknown>)[topic] as { attempts?: unknown; correct?: unknown } | undefined;
      const attempts = stats?.attempts;
      const correct = stats?.correct;
      if (Number.isInteger(attempts) && Number.isInteger(correct) && (correct as number) >= 0 && (correct as number) <= (attempts as number)) {
        progress.topics[topic] = { attempts: attempts as number, correct: correct as number };
      }
    }
  }
  if (Array.isArray(completed)) progress.completed = completed.filter((id) => typeof id === 'string');
  return progress;
}

export function loadProgress(store: KeyValueStore | null = defaultStore()): Progress {
  try {
    const raw = store?.getItem(KEY);
    return raw ? cleanProgress(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress(); // unreadable or broken JSON: start fresh
  }
}

// Returns false if saving failed (for example, storage is full or blocked).
export function saveProgress(progress: Progress, store: KeyValueStore | null = defaultStore()): boolean {
  try {
    if (!store) return false;
    store.setItem(KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress(store: KeyValueStore | null = defaultStore()): void {
  try {
    store?.removeItem(KEY);
  } catch {
    // nothing to do: if we can't reach storage, there's nothing saved either
  }
}
