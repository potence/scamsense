import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import type { InteractionResult, Mode, ScanOrSkipScenario } from '../types.ts';
import { isCorrect, scoreChoice } from '../engine/scoring.ts';
import { ReadAloud } from './ReadAloud.tsx';
import { Feedback } from './Feedback.tsx';
import { PracticeLabel } from './Frames.tsx';
import { Reveal } from './Reveal.tsx';
import { Icon } from './Icon.tsx';

interface Props {
  scenario: ScanOrSkipScenario;
  mode: Mode;
  onComplete: (r: InteractionResult) => void;
}

// "Scan or skip": a described situation with a QR code. Choosing reveals the clues.
export function ScanOrSkip({ scenario, onComplete }: Props) {
  const [decision, setDecision] = useState<'scan' | 'skip' | null>(null);

  const score = decision ? scoreChoice(decision, scenario.correct) : 0;
  const correct = isCorrect(score);
  const safer = scenario.correct === 'skip' ? 'skip it' : 'scan it';
  const answer = (choice: 'scan' | 'skip') => {
    setDecision(choice);
    playSound(choice === scenario.correct ? 'spotted' : 'miss');
  };

  return (
    <section className="question" aria-labelledby="q-title">
      <h2 id="q-title">{scenario.title}</h2>
      <PracticeLabel what="situation" />
      <div className="scene scene-qr">
        <QrArt seed={scenario.id} />
        <p>{scenario.scene}</p>
      </div>
      <ReadAloud id={`message-${scenario.id}`} text={scenario.scene} label="Read the situation aloud" />

      {decision === null ? (
        <div className="call-choices" role="group" aria-labelledby="scan-q">
          <h3 id="scan-q">Would you scan this code?</h3>
          <button type="button" className="btn btn-secondary btn-choice" onClick={() => answer('scan')}>
            Scan it
          </button>
          <button type="button" className="btn btn-secondary btn-choice" onClick={() => answer('skip')}>
            Skip it
          </button>
        </div>
      ) : (
        <Reveal>
          <Feedback tone={correct ? 'good' : 'bad'} title={correct ? `Good call. The safe move is to ${safer}.` : `This one's tricky. The safer move is to ${safer}.`}>
            <p>{scenario.explanation}</p>
          </Feedback>
          <ReadAloud id={`explain-${scenario.id}`} text={scenario.explanation} label="Read the explanation aloud" />
          <h3>Clues to notice</h3>
          <ul className="clues">
            {scenario.clues.map((clue) => (
              <li key={clue} className="clue">
                <Icon name="tip" />
                <span>{clue}</span>
              </li>
            ))}
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

// A drawn QR code for the poster: decoration only, it encodes nothing.
// The pattern comes from the scenario id, so each question gets its own look.
function QrArt({ seed }: { seed: string }) {
  const N = 21;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const cells: string[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if (!inFinder(x, y) && (h >>> 16) % 2) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const finder = (x: number, y: number) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <svg className="qr-art" viewBox={`-1 -1 ${N + 2} ${N + 2}`} aria-hidden="true">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      <path d={cells.join('') + finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7)} fill="#0A1A4A" fillRule="evenodd" />
    </svg>
  );
}
