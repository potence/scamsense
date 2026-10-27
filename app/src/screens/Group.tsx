import { useState } from 'react';
import { scenarios } from '../data/index.ts';
import { LESSONS } from './lessonData.ts';
import { AddressBar, BrowserWindow, MailWindow, PhoneFrame, PracticeLabel } from '../components/Frames.tsx';
import { Feedback } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import type { Scenario } from '../types.ts';

// Group mode: for a leader with a projector. Big text, nothing to tap inside the
// example. The leader shows a scenario, the room talks about it, then Reveal, then Next.

// The example itself, read-only, in the same frames the lessons use.
function Example({ s }: { s: Scenario }) {
  if (s.kind === 'redflag') {
    const text = <p className="bubble-text">{s.segments.map((seg) => seg.text).join('')}</p>;
    if (s.channel === 'sms') return <PhoneFrame title={s.from} subtitle="Text message"><div className="bubble">{text}</div></PhoneFrame>;
    if (s.channel === 'email') return <MailWindow from={s.from} subject={s.subject}>{text}</MailWindow>;
    return (
      <BrowserWindow address="a website you were visiting">
        <div className="popup">
          <p className="popup-title">{s.from}</p>
          {text}
        </div>
      </BrowserWindow>
    );
  }
  if (s.kind === 'choicepair') {
    return (
      <>
        <p>{s.prompt}</p>
        {s.options.map((o, i) => (
          <div key={o.id} className="window">
            <AddressBar address={`${i + 1}. ${o.label}`} />
          </div>
        ))}
      </>
    );
  }
  if (s.kind === 'callbranch') {
    const first = s.nodes.find((n) => n.id === s.start);
    return (
      <PhoneFrame title={s.callerLabel} subtitle="Incoming call">
        <div className="bubble">
          <p className="bubble-who">Caller</p>
          <p className="bubble-text">{first?.transcript}</p>
        </div>
      </PhoneFrame>
    );
  }
  if (s.kind === 'scanorskip') return <div className="scene"><p>{s.scene}</p></div>;
  if (s.kind === 'orderSteps') {
    return (
      <div className="order-steps-group card">
        <p className="order-prompt">{s.prompt}</p>
        <ol className="plain-list">
          {s.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
    );
  }
  return null;
}

// What the leader reveals after the discussion.
function Answer({ s }: { s: Scenario }) {
  // Each clue is a bold label on its own line with the sentence beneath (label is optional).
  let clues: { label?: string; text: string }[] = [];
  if (s.kind === 'redflag') clues = s.segments.flatMap((seg) => (seg.flag ? [{ label: `"${seg.text.trim()}"`, text: seg.flag.reason }] : []));
  if (s.kind === 'choicepair') clues = s.options.map((o) => ({ label: o.label, text: s.reasons[o.id] }));
  if (s.kind === 'callbranch') {
    const first = s.nodes.find((n) => n.id === s.start);
    clues = (first?.choices ?? []).filter((c) => c.outcome === 'safe').map((c) => ({ label: 'Safe move', text: `${c.label}. ${c.feedback}` }));
  }
  if (s.kind === 'scanorskip') clues = [{ label: 'The safe move', text: s.correct === 'skip' ? "Don't scan it." : 'Scanning is fine here.' }, ...s.clues.map((text) => ({ text }))];
  if (s.kind === 'orderSteps') {
    clues = [
      { label: 'Why the first step matters', text: s.whyFirstStepMatters },
      ...s.correctOrder.map((stepIdx, i) => ({ label: `Step ${i + 1}`, text: s.steps[stepIdx] })),
    ];
  }
  return (
    <div className="reveal">
      <Feedback tone="tip" title="What to look for">
        <p>{s.explanation}</p>
      </Feedback>
      <ul className="clues">
        {clues.map((c) => (
          <li key={c.text} className="clue">
            <Icon name="tip" />
            <span>
              {c.label && <strong className="stack-label">{c.label}</strong>}
              {c.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Group() {
  const [index, setIndex] = useState<number | null>(null); // null = choosing a scenario
  const [revealed, setRevealed] = useState(false);

  const show = (i: number) => {
    setIndex(i);
    setRevealed(false);
    window.scrollTo(0, 0);
  };

  // The leader's list: every scenario, grouped by lesson.
  if (index === null) {
    return (
      <section className="section group">
        <header className="page-head torn-bottom">
          <h1>Group mode</h1>
          <p className="lede">For a group with one big screen. Pick an example, talk about it together, then press Reveal.</p>
        </header>
        {LESSONS.map((lesson) => (
          <div key={lesson.topic} className="group-lesson">
            <h2>{lesson.title}</h2>
            <div className="call-choices">
              {scenarios.map((s, i) =>
                s.topic === lesson.topic ? (
                  <button key={s.id} type="button" className="btn btn-secondary btn-choice" onClick={() => show(i)}>
                    {s.title}
                  </button>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </section>
    );
  }

  const s = scenarios[index];
  return (
    <section className="lesson group" aria-labelledby="group-title">
      <button type="button" className="back-link" onClick={() => setIndex(null)}>
        <Icon name="arrowLeft" />
        All examples
      </button>
      <h1 id="group-title">{s.title}</h1>
      <p>Talk about it: what looks off? What would you do?</p>
      <PracticeLabel what="message" />
      <Example s={s} />
      {revealed && <Answer s={s} />}
      <div className="actions">
        {!revealed ? (
          <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
            Reveal
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => show((index + 1) % scenarios.length)}>
            Next
            <Icon name="arrowRight" className="icon-forward" />
          </button>
        )}
      </div>
    </section>
  );
}
