import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import type { CallBranchScenario, CallChoice, InteractionResult, Mode } from '../types.ts';
import { isCorrect, scoreCallEnd } from '../engine/scoring.ts';
import { useCallAudio } from './useCallAudio.ts';
import { DeclinedNote, ReplayButton, RingingPhone, Waveform } from './RingingPhone.tsx';
import { Feedback } from './Feedback.tsx';
import type { Tone } from './Feedback.tsx';
import { PhoneFrame, PracticeLabel } from './Frames.tsx';
import { Icon } from './Icon.tsx';
import { Reveal } from './Reveal.tsx';
import { ReadAloud } from './ReadAloud.tsx';

interface Props {
  scenario: CallBranchScenario;
  mode: Mode;
  onComplete: (r: InteractionResult) => void;
}

// How each kind of choice and each ending is shown. Words + icon, never color alone.
const CHOICE_TONE: Record<CallChoice['outcome'], Tone> = { safe: 'good', neutral: 'tip', risky: 'bad' };
const END_VIEW = {
  safe: { tone: 'good', title: 'You stayed safe.' },
  partial: { tone: 'tip', title: 'Good recovery.' },
  scammed: { tone: 'bad', title: 'This call would have cost you.' },
} as const;

// A phone call that branches: it rings, the user picks up (or declines), hears each
// line, and answers. Each answer leads to the next line, until an ending.
export function CallBranch({ scenario, onComplete }: Props) {
  const [phase, setPhase] = useState<'ringing' | 'declined' | 'talking'>('ringing');
  const [nodeId, setNodeId] = useState(scenario.start);
  const [lastChoice, setLastChoice] = useState<CallChoice | null>(null);
  const [lineDone, setLineDone] = useState(false); // answer buttons appear when the caller stops talking
  const audio = useCallAudio(() => setLineDone(true));

  const node = scenario.nodes.find((n) => n.id === nodeId);
  // The validator makes sure every `next` exists, so this only happens with broken content.
  if (!node) return <p>This call has a problem. Please go back and try another lesson.</p>;

  const end = node.end;

  // Pick up (or "Hear what they would have said"): start the call with the first line.
  const pickUp = () => {
    setPhase('talking');
    setLineDone(false);
    audio.play(node.audio);
  };

  const finish = () => {
    if (!end) return;
    const score = scoreCallEnd(end.result);
    onComplete({ scenarioId: scenario.id, topic: scenario.topic, score, correct: isCorrect(score) });
  };

  return (
    <section className="question" aria-labelledby="q-title">
      <h2 id="q-title">{scenario.title}</h2>
      <p>{end ? 'The call has ended.' : 'Your phone rings. Pick up, listen, then choose what you would do.'}</p>
      <PracticeLabel what="call" />

      {phase === 'ringing' && <RingingPhone caller={scenario.callerLabel} onPickUp={pickUp} onDecline={() => setPhase('declined')} />}
      {phase === 'declined' && <DeclinedNote onHear={pickUp} />}
      {phase === 'talking' && (
        <>
          {/* Feedback on the previous answer comes first: it is about what just happened. */}
          {lastChoice && !end && (
            <Feedback tone={CHOICE_TONE[lastChoice.outcome]} title="About your last answer">
              <p>{lastChoice.feedback}</p>
            </Feedback>
          )}

          <div className="in-call">
            <PhoneFrame title={scenario.callerLabel} subtitle={end ? 'Call ended' : 'On a call'}>
              {!end && <Waveform playing={audio.playing} />}
              <div className="bubble" aria-live="polite">
                <p className="bubble-who">{end ? 'What happened' : 'Caller'}</p>
                <p className="bubble-text">{node.transcript}</p>
              </div>
            </PhoneFrame>
          </div>
          {!end && <ReplayButton playing={audio.playing} failed={audio.failed} onReplay={() => audio.play(node.audio)} onStop={audio.stop} />}

          {!end && lineDone && node.choices && (
            <div className="call-choices" role="group" aria-label="What do you do?">
              {node.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  className="btn btn-secondary btn-choice"
                  onClick={() => {
                    setLastChoice(choice);
                    const next = scenario.nodes.find((n) => n.id === choice.next);
                    setNodeId(choice.next);
                    if (next?.end) {
                      audio.stop();
                      playSound(next.end.result === 'safe' ? 'spotted' : 'miss');
                    } else {
                      // The next line plays right away: this click is what allows the sound.
                      setLineDone(false);
                      audio.play(next?.audio);
                    }
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          )}

          {end && (
            <Reveal>
              <Feedback tone={END_VIEW[end.result].tone} title={END_VIEW[end.result].title}>
                <p>{end.summary}</p>
                <p>{scenario.explanation}</p>
              </Feedback>
              <ReadAloud id={`explain-${scenario.id}`} text={scenario.explanation} label="Read the explanation aloud" />
              <button type="button" className="btn btn-primary btn-next" onClick={finish}>
                Continue
                <Icon name="arrowRight" className="icon-forward" />
              </button>
            </Reveal>
          )}
        </>
      )}
    </section>
  );
}
