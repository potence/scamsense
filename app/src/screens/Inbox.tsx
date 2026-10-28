import { useState } from 'react';
import type { ReactNode } from 'react';
import { inbox, scenarios } from '../data/index.ts';
import { isCorrectAnswer, judgeAnswer, pickInbox, resolveItem } from '../engine/inbox.ts';
import type { InboxAnswer, InboxView, Outcome } from '../engine/inbox.ts';
import { recordResult } from '../engine/scoring.ts';
import { saveProgress } from '../engine/storage.ts';
import { playSound } from '../engine/sounds.ts';
import { inboxMessageText, messageText } from '../engine/narration.ts';
import { ReadAloud } from '../components/ReadAloud.tsx';
import { MailWindow, PhoneFrame, PracticeLabel } from '../components/Frames.tsx';
import { useCallAudio } from '../components/useCallAudio.ts';
import { DeclinedNote, ReplayButton, RingingPhone, Waveform } from '../components/RingingPhone.tsx';
import { Feedback } from '../components/Feedback.tsx';
import type { Tone } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import { Reveal } from '../components/Reveal.tsx';
import { trackEvent } from '../engine/analytics.ts';
import type { Progress } from '../types.ts';

interface InboxProps {
  progress: Progress;
  onUpdateProgress: (next: Progress) => void;
}

// The answer buttons, in the order they appear.
const ANSWERS: { value: InboxAnswer; label: string }[] = [
  { value: 'real', label: 'Real' },
  { value: 'scam', label: 'Scam' },
  { value: 'check', label: "I'd check" },
];

// What the feedback says after each answer. Gentle in every case.
function feedbackFor(outcome: Outcome, answer: InboxAnswer): { tone: Tone; title: string } {
  if (outcome === 'caught') return { tone: 'good', title: answer === 'check' ? 'Checking was a safe move. This one is a scam.' : 'Good catch. This one is a scam.' };
  if (outcome === 'missed') return { tone: 'bad', title: "This one is a scam. It's a tricky one." };
  if (outcome === 'right') return { tone: 'good', title: 'Right. This one is real.' };
  return { tone: 'tip', title: 'This one is real. Being careful is fine.' };
}

// Circular progress score ring for the summary screen
function ProgressRing({ value, max, size = 100 }: { value: number; max: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className="score-ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-ring" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink)">
          {value}/{max}
        </text>
      </svg>
    </div>
  );
}

// Shows one inbox item the way it would arrive: a text or call on a phone, or an email.
function ItemFrame({ view }: { view: InboxView }) {
  if (view.channel === 'email') {
    return (
      <MailWindow from={view.from} subject={view.subject}>
        <p className="bubble-text">{view.text}</p>
      </MailWindow>
    );
  }
  return (
    <PhoneFrame title={view.from} subtitle={view.channel === 'call' ? 'Incoming call' : 'Text message'}>
      <div className="bubble">
        {view.channel === 'call' && <p className="bubble-who">Caller</p>}
        <p className="bubble-text">{view.text}</p>
      </div>
    </PhoneFrame>
  );
}

// A call in the inbox: it rings first. Pick up plays the caller; the answer buttons
// (passed in as children) appear when the caller stops talking. Decline counts as
// "I'd check" (onDecline), and the call can still be heard afterwards.
function InboxCall({ view, answered, onDecline, children }: { view: InboxView; answered: boolean; onDecline: () => void; children: ReactNode }) {
  const [phase, setPhase] = useState<'ringing' | 'declined' | 'talking'>('ringing');
  const [lineDone, setLineDone] = useState(false);
  const audio = useCallAudio(() => setLineDone(true));

  const pickUp = () => {
    setPhase('talking');
    setLineDone(false);
    audio.play(view.audio);
  };

  if (phase === 'ringing') {
    return (
      <RingingPhone
        caller={view.from}
        onPickUp={pickUp}
        onDecline={() => {
          setPhase('declined');
          onDecline();
        }}
      />
    );
  }
  if (phase === 'declined') return <DeclinedNote onHear={pickUp} />;
  return (
    <>
      <ItemFrame view={view} />
      <Waveform playing={audio.playing} />
      <ReplayButton playing={audio.playing} failed={audio.failed} onReplay={() => audio.play(view.audio)} onStop={audio.stop} />
      {lineDone && !answered && children}
    </>
  );
}

// "Real or scam?": a mixed inbox of 12 texts, emails and calls.
// Mail-app style list with sender, preview and type icon.
// Opening an item shows it full-screen with three large answers.
export function Inbox({ progress, onUpdateProgress }: InboxProps) {
  const [round, setRound] = useState(() => (inbox ? pickInbox(inbox.items) : []));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, InboxAnswer>>({});

  if (!inbox || round.length === 0) {
    return (
      <section className="section">
        <h1>Real or scam?</h1>
        <p>This activity isn't available right now.</p>
      </section>
    );
  }

  const box = inbox;
  const sortedCount = Object.keys(answers).length;
  const allFinished = sortedCount === round.length && activeIndex === null;

  const restart = () => {
    setRound(pickInbox(box.items));
    setActiveIndex(null);
    setAnswers({});
    window.scrollTo(0, 0);
  };

  // ----- Summary screen (all 12 sorted) -----
  if (allFinished) {
    const resolvedHistory = round.map((item, idx) => ({
      view: resolveItem(item, scenarios),
      answer: answers[idx],
    }));

    const scams = resolvedHistory.filter((h) => h.view.answer === 'scam');
    const caught = scams.filter((h) => judgeAnswer(h.answer, 'scam') === 'caught').length;
    const missedScams = scams.filter((h) => judgeAnswer(h.answer, 'scam') === 'missed');
    const careful = resolvedHistory.filter((h) => judgeAnswer(h.answer, h.view.answer) === 'careful');

    return (
      <div className="lesson">
        <h1 className="lesson-heading">Real or scam?</h1>
        <article className="result" aria-labelledby="result-title">
          <h2 id="result-title">Inbox sorted</h2>

          <ProgressRing value={caught} max={scams.length} />

          <p className="result-score" style={{ textAlign: 'center' }}>
            You caught {caught} of {scams.length} scams.
          </p>

          <Feedback tone={caught === scams.length ? 'good' : 'tip'} title={caught === scams.length ? 'Well done' : 'Good practice'}>
            <p>{box.explanation}</p>
          </Feedback>

          {missedScams.length > 0 && (
            <section className="panel" aria-labelledby="missed-title" style={{ marginTop: '20px' }}>
              <h3 id="missed-title">Scams you thought were real</h3>
              <ul className="plain-list">
                {missedScams.map((h) => (
                  <li key={h.view.id} style={{ margin: '8px 0' }}>
                    <strong className="stack-label">{h.view.from}</strong>
                    <span>{h.view.explanation}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {careful.length > 0 && (
            <section className="panel" aria-labelledby="careful-title" style={{ marginTop: '20px' }}>
              <h3 id="careful-title">Being careful is fine. Here is the quick way to check.</h3>
              <ul className="plain-list">
                {careful.map((h) => (
                  <li key={h.view.id} style={{ margin: '12px 0' }}>
                    <strong className="stack-label">{h.view.from}</strong>
                    <span>{h.view.howToCheck}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="actions" style={{ marginTop: '32px' }}>
            <button type="button" className="btn btn-primary" onClick={restart}>
              Sort another inbox
              <Icon name="arrowRight" className="icon-forward" />
            </button>
            <a className="btn btn-secondary" href="#/">
              Back to home
            </a>
          </div>
        </article>
      </div>
    );
  }

  // ----- Mail-app style list (when no item is open) -----
  if (activeIndex === null) {
    return (
      <div className="lesson">
        <div className="inbox-back-bar">
          <a className="btn btn-secondary" href="#/" style={{ minHeight: '52px', padding: '8px 18px', fontSize: '18px' }}>
            <Icon name="arrowLeft" /> Home
          </a>
          <span style={{ fontSize: '18px', color: 'var(--ink-2)', fontWeight: 600 }}>
            {sortedCount} of {round.length} sorted
          </span>
        </div>

        <h1 className="lesson-heading">Real or scam?</h1>
        <p style={{ color: 'var(--ink-2)', fontSize: '20px', margin: '4px 0 20px' }}>
          Open each message or call below. Decide if it is real, a scam, or something you would check.
        </p>

        <ul className="inbox-list" aria-label="Messages to sort">
          {round.map((item, idx) => {
            const v = resolveItem(item, scenarios);
            const isAnswered = answers[idx] !== undefined;
            const channelIcon = v.channel === 'call' ? 'phone' : v.channel === 'email' ? 'mail' : 'message';
            const kind = v.channel === 'call' ? 'Call' : v.channel === 'email' ? 'Email' : 'Text';

            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={`inbox-row${isAnswered ? ' is-sorted' : ''}`}
                  onClick={() => {
                    setActiveIndex(idx);
                    window.scrollTo(0, 0);
                  }}
                >
                  <span className="inbox-row-icon" aria-hidden="true">
                    <Icon name={isAnswered ? 'check' : channelIcon} />
                  </span>
                  <span className="inbox-row-main">
                    <span className="inbox-row-from">{v.from}</span>
                    <span className="inbox-row-kind">{isAnswered ? `${kind}, sorted` : kind}</span>
                    <span className="inbox-row-preview">{v.subject ?? v.text}</span>
                  </span>
                  <Icon name="chevronRight" className="inbox-row-chevron" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // ----- Full-screen item view -----
  const currentItem = round[activeIndex];
  const view = resolveItem(currentItem, scenarios);
  const currentAnswer = answers[activeIndex] ?? null;

  const ref = scenarios.find((s) => s.id === currentItem.scenarioRef);
  const narrationKey = currentItem.answer === 'real' ? currentItem.id : (currentItem.scenarioRef ?? '');
  const narrationText = currentItem.answer === 'real' ? inboxMessageText(currentItem) : ref ? (messageText(ref) ?? '') : '';

  const choose = (value: InboxAnswer) => {
    const nextAnswers = { ...answers, [activeIndex]: value };
    setAnswers(nextAnswers);

    const result = judgeAnswer(value, view.answer);
    trackEvent(`inbox/${view.id}/${result}`);
    if (Object.keys(nextAnswers).length === round.length) {
      const scamIdx = round.map((it, i) => ({ it, i })).filter(({ it }) => it.answer === 'scam');
      const caughtAll = scamIdx.filter(({ i }) => judgeAnswer(nextAnswers[i], 'scam') === 'caught').length;
      trackEvent(`inbox-done/${caughtAll}of${scamIdx.length}-scams-caught`);
    }
    playSound(result === 'missed' ? 'miss' : result === 'careful' ? 'tap' : 'spotted');

    const updated = recordResult(progress, {
      scenarioId: box.id,
      topic: view.topic,
      correct: isCorrectAnswer(value, view.answer),
    });
    saveProgress(updated);
    onUpdateProgress(updated);
  };

  const handleNext = () => {
    // Look for next unread item, or return to list / summary
    const nextUnread = round.findIndex((_, idx) => answers[idx] === undefined && idx !== activeIndex);
    if (nextUnread !== -1) {
      setActiveIndex(nextUnread);
    } else {
      setActiveIndex(null);
    }
    window.scrollTo(0, 0);
  };

  const answerButtons = (
    <div className="call-choices" role="group" aria-label="Is this real or a scam?">
      {ANSWERS.map((a) => (
        <button
          key={a.value}
          type="button"
          className={`btn btn-secondary btn-choice${currentAnswer === a.value ? ' choice-chosen' : ''}`}
          onClick={() => choose(a.value)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );

  const outcome = currentAnswer ? judgeAnswer(currentAnswer, view.answer) : null;
  const shown = outcome && currentAnswer ? feedbackFor(outcome, currentAnswer) : null;

  return (
    <div className="lesson">
      <div className="inbox-back-bar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setActiveIndex(null)}
          style={{ minHeight: '52px', padding: '8px 18px', fontSize: '18px' }}
        >
          <Icon name="arrowLeft" /> Inbox ({sortedCount}/{round.length})
        </button>
        <span style={{ fontSize: '18px', color: 'var(--ink-2)', fontWeight: 600 }}>
          Item {activeIndex + 1} of {round.length}
        </span>
      </div>

      <section key={view.id} className="question step-in" aria-label={`Item ${activeIndex + 1}`}>
        <p>{view.channel === 'call' ? 'Your phone rings. Pick up, listen, then decide: real or scam?' : 'Is this message real or a scam?'}</p>
        <PracticeLabel what={view.channel === 'call' ? 'call' : 'message'} />

        {view.channel === 'call' ? (
          <InboxCall key={view.id} view={view} answered={currentAnswer !== null} onDecline={() => choose('check')}>
            {answerButtons}
          </InboxCall>
        ) : (
          <>
            <ItemFrame view={view} />
            <ReadAloud id={`message-${narrationKey}`} text={narrationText} label="Read the message aloud" />
            {!shown && answerButtons}
          </>
        )}

        {shown && (
          <Reveal>
            <Feedback tone={shown.tone} title={shown.title}>
              <p>{view.explanation}</p>
              {outcome === 'careful' && view.howToCheck && (
                <p>
                  <strong className="stack-label">Quick way to check</strong>
                  <span>{view.howToCheck}</span>
                </p>
              )}
            </Feedback>
            <ReadAloud id={`explain-${narrationKey}`} text={view.explanation} label="Read the explanation aloud" />
            <button type="button" className="btn btn-primary btn-next" onClick={handleNext}>
              {sortedCount < round.length ? 'Next message' : 'See how you did'}
              <Icon name="arrowRight" className="icon-forward" />
            </button>
          </Reveal>
        )}
      </section>
    </div>
  );
}
