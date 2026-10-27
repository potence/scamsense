import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { narrationStatus, narrationTexts, teachText } from '../src/engine/narration.ts';
import type { Manifest } from '../src/engine/narration.ts';
import { inbox, lessons, scenarios } from '../src/data/index.ts';
import manifest from '../src/data/audio-manifest.json';

const all = [...scenarios, inbox!];
const hash = (t: string) => createHash('sha256').update(t).digest('hex').slice(0, 12);

describe('narration', () => {
  const texts = narrationTexts(lessons, all);

  it('lists every read-aloud text once, with a tier', () => {
    const ids = texts.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lessons) {
      expect(ids).toContain(`teach-${l.id}`);
      expect(ids).toContain(`remember-${l.id}`);
    }
    expect(ids).toContain('message-phishing-bank-text-01');
    expect(ids).toContain('explain-phone-techsupport-01');
    expect(ids).toContain('message-real-clinic-text');
    // Calls already have the student's recordings, so their text is not narrated again.
    expect(ids).not.toContain('message-phone-techsupport-01');
    expect(ids).not.toContain('message-real-clinic-call');
    expect(texts.filter((t) => t.tier === 1).every((t) => t.id.startsWith('teach-') || t.id.startsWith('message-'))).toBe(true);
  });

  it('builds the teach card text the same way the screen does', () => {
    const text = teachText({ title: 'T', subtitle: 'S.', warningSigns: ['A.', 'B.', 'C.'], safeMove: [{ label: 'Stop', text: 'x.' }, { label: 'Spot', text: 'y.' }] });
    // Spoken as the original "STOP: x." wording so the recordings keep matching.
    expect(text).toBe('T. S. Three warning signs. A. B. C. The safe move. STOP: x. SPOT: y.');
  });

  it('reports missing, changed and unlisted recordings', () => {
    const current = [
      { id: 'a', tier: 1 as const, text: 'one' },
      { id: 'b', tier: 1 as const, text: 'two, edited' },
      { id: 'c', tier: 2 as const, text: 'three' },
      { id: 'd', tier: 3 as const, text: 'four' },
    ];
    const m: Manifest = {
      a: { tier: 1, text: 'one', hash: hash('one'), file: 'narration/a.mp3' },
      b: { tier: 1, text: 'two', hash: hash('two'), file: 'narration/b.mp3' },
      c: { tier: 2, text: 'three', hash: hash('three'), file: 'narration/c.mp3' },
    };
    const status = narrationStatus(current, m, ['narration/a.mp3', 'narration/b.mp3'], hash);
    expect(status).toEqual({ needed: 4, recorded: 2, missing: ['c'], changed: ['b'], unlisted: ['d'] });
  });

  it('has an up-to-date manifest (run "npm run narration:manifest" after changing content)', () => {
    const m = manifest as Manifest;
    for (const t of texts) {
      expect(m[t.id], `${t.id} is not in the manifest`).toBeDefined();
      expect(m[t.id].file).toBe(`narration/${t.id}.mp3`);
    }
  });
});
