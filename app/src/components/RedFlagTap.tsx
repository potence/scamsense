import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import type { ReactNode } from 'react';
import type { InteractionResult, Mode, RedFlagScenario } from '../types.ts';
import { isCorrect, scoreRedFlag } from '../engine/scoring.ts';
import { ReadAloud } from './ReadAloud.tsx';
import { messageText } from '../engine/narration.ts';
import { Feedback } from './Feedback.tsx';
import { BrowserWindow, MailWindow, PhoneFrame, PracticeLabel } from './Frames.tsx';
import { Reveal } from './Reveal.tsx';
import { Icon } from './Icon.tsx';

interface Props {
  scenario: RedFlagScenario;
  mode: Mode;
  onComplete: (r: InteractionResult) => void;
}

// "Tap the red flags": the message is split into parts; the user taps the parts that look suspicious,
// then presses Check. Each tappable part is a real <button>, so keyboard users can Tab and press Enter.
export function RedFlagTap({ scenario, mode, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const toggle = (i: number) => {
    if (revealed) return;
    playSound('tap');
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Count what the user got, for the score and the feedback.
  const totalFlags = scenario.segments.filter((s) => s.flag).length;
  const found = scenario.segments.filter((s, i) => s.flag && selected.has(i)).length;
  const falseTaps = scenario.segments.filter((s, i) => !s.flag && selected.has(i)).length;
  const score = scoreRedFlag(found, falseTaps, totalFlags);
  const correct = isCorrect(score);

  const message = (
    <p className="bubble-text">
      {scenario.segments.map((seg, i) => {
        const isSel = selected.has(i);
        // After Check, each part gets a result tag with an icon and words (not just a color).
        let state = isSel ? ' seg-selected' : '';
        let tag: ReactNode = null;
        if (revealed && seg.flag) {
          state = isSel ? ' seg-found' : ' seg-missed';
          tag = <span className="seg-tag">{isSel ? 'Spotted' : 'Missed'}</span>;
        } else if (revealed && isSel) {
          state = ' seg-normal';
          tag = <span className="seg-tag">Looks normal</span>;
        }
        return (
          <button key={i} type="button" className={`seg${state}`} aria-pressed={isSel} disabled={revealed} onClick={() => toggle(i)}>
            {seg.text}
            {tag}
          </button>
        );
      })}
    </p>
  );

  // Show the message in a frame that matches where it came from.
  let framed: ReactNode;
  if (scenario.channel === 'sms') {
    framed = (
      <PhoneFrame title={scenario.from} subtitle="Text message">
        <div className="bubble">{message}</div>
      </PhoneFrame>
    );
  } else if (scenario.channel === 'email') {
    framed = (
      <MailWindow from={scenario.from} subject={scenario.subject}>
        {message}
      </MailWindow>
    );
  } else {
    framed = (
      <BrowserWindow address="a website you were visiting">
        <div className="popup" role="group" aria-label={`Pop-up: ${scenario.from}`}>
          <p className="popup-title">
            <Icon name="alert" />
            {scenario.from}
          </p>
          {message}
        </div>
      </BrowserWindow>
    );
  }

  const what = scenario.channel === 'sms' ? 'text message' : scenario.channel === 'email' ? 'email' : 'pop-up';

  return (
    <section className="question" aria-labelledby="q-title">
      <h2 id="q-title">{scenario.title}</h2>
      <p>{revealed ? 'Here is what to look for.' : 'Tap the parts that look like warning signs, then press Check.'}</p>
      <PracticeLabel what={what} />
      {framed}
      <ReadAloud id={`message-${scenario.id}`} text={messageText(scenario) ?? ''} label="Read the message aloud" />

      {!revealed ? (
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => {
              setRevealed(true);
              playSound(correct ? 'spotted' : 'miss');
            }}>
            Check ({selected.size} tapped)
          </button>
          {mode === 'learn' &&
            (showHint ? (
              <p className="muted">Hint: there are {totalFlags} warning signs in this {what}.</p>
            ) : (
              <button type="button" className="btn btn-quiet" onClick={() => setShowHint(true)}>
                <Icon name="tip" />
                Show a hint
              </button>
            ))}
        </div>
      ) : (
        <Reveal>
          <Feedback tone={correct ? 'good' : 'bad'} title={correct ? 'Good catch!' : "This one's tricky. Here are the clues."}>
            <p>
              You found {found} of {totalFlags} warning signs.
              {falseTaps > 0 && ` ${falseTaps} of your taps ${falseTaps === 1 ? 'was' : 'were'} normal text, and that's okay.`}
            </p>
            <p>{scenario.explanation}</p>
          </Feedback>
          <ReadAloud id={`explain-${scenario.id}`} text={scenario.explanation} label="Read the explanation aloud" />
          <ul className="clues">
            {scenario.segments.map((s, i) =>
              s.flag ? (
                <li key={s.flag.id} className={selected.has(i) ? 'clue clue-found' : 'clue clue-missed'}>
                  <Icon name={selected.has(i) ? 'check' : 'tip'} />
                  <span>
                    <strong className="stack-label">{selected.has(i) ? 'Spotted' : 'Missed'}</strong>
                    {s.flag.reason}
                  </span>
                </li>
              ) : null,
            )}
          </ul>
          <button type="button" className="btn btn-primary btn-next" onClick={() => onComplete({ scenarioId: scenario.id, topic: scenario.topic, score, correct })}>
            Continue
            <Icon name="arrowRight" className="icon-forward" />
          </button>
        </Reveal>
      )}
    </section>
  );
}
