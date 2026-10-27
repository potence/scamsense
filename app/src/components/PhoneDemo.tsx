// The small "try it" phone on the Home page. It reuses a real lesson scenario,
// so the demo always matches the lessons. Tap the parts that look suspicious, press Check,
// and the message is replaced by one warning sign at a time (Next moves on). The card never changes height.
import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import { scenarios } from '../data/index.ts';
import type { RedFlagScenario } from '../types.ts';
import { PhoneFrame } from './Frames.tsx';
import { Icon } from './Icon.tsx';

const DEMO_ID = 'phishing-bank-text-01';

export function PhoneDemo() {
  const demo = scenarios.find((s) => s.id === DEMO_ID) as RedFlagScenario | undefined;
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [slide, setSlide] = useState(0);

  if (!demo) return null; // demo scenario was removed: just skip the demo

  const flags = demo.segments.map((seg, i) => ({ seg, i })).filter((x) => x.seg.flag);
  const found = flags.filter((x) => picked.has(x.i)).length;
  const toggle = (i: number) => {
    playSound('tap');
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const check = () => {
    playSound(found === flags.length ? 'spotted' : 'miss');
    setSlide(0);
    setChecked(true);
  };
  const reset = () => {
    setPicked(new Set());
    setChecked(false);
    setSlide(0);
  };

  return (
    <div className="demo">
      {/* Both versions of this line share one grid cell too, so its height never changes. */}
      <div className="demo-stack">
        <p className={`demo-prompt demo-layer${checked ? '' : ' is-on'}`} id="demo-prompt">
          Try it. Tap the parts that look suspicious, then press Check.
        </p>
        <p className={`demo-prompt demo-layer${checked ? ' is-on' : ''}`}>
          You found {found} of {flags.length} warning signs.
        </p>
      </div>
      <PhoneFrame title={demo.from} subtitle="Text message">
        {/* The message and every slide share one grid cell, so the phone is always as tall as the
            tallest of them and never changes size. Only the current one is visible. */}
        <div className="demo-stack">
          <p className={`bubble demo-layer${checked ? '' : ' is-on'}`} role="group" aria-label="Practice text message" aria-describedby="demo-prompt">
            {demo.segments.map((seg, i) => (
              <button key={i} type="button" tabIndex={checked ? -1 : 0} className={`seg${picked.has(i) ? ' seg-selected' : ''}`} aria-pressed={picked.has(i)} onClick={() => toggle(i)}>
                {seg.text}
              </button>
            ))}
          </p>
          {flags.map(({ seg, i }, n) => (
            <div key={i} className={`demo-slide demo-layer${checked && slide === n ? ' is-on' : ''}`} aria-live={checked && slide === n ? 'polite' : undefined}>
              <div className={`clue ${picked.has(i) ? 'clue-found' : 'clue-missed'}`}>
                <Icon name={picked.has(i) ? 'check' : 'alert'} />
                <span>
                  <strong className="stack-label">{picked.has(i) ? 'Spotted' : 'Missed'}</strong>
                  {seg.flag!.reason}
                </span>
              </div>
              <p className="demo-slide-count">
                {n + 1} of {flags.length}
              </p>
            </div>
          ))}
        </div>
      </PhoneFrame>
      {!checked ? (
        <button type="button" className="btn btn-primary demo-action" onClick={check}>
          Check
        </button>
      ) : slide + 1 < flags.length ? (
        <button type="button" className="btn btn-primary demo-action" onClick={() => setSlide(slide + 1)}>
          Next
        </button>
      ) : (
        <button type="button" className="btn btn-primary demo-action" onClick={reset}>
          Try again
        </button>
      )}
    </div>
  );
}
