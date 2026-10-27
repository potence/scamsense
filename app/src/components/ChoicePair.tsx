import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import type { ChoicePairScenario, InteractionResult, Mode } from '../types.ts';
import { isCorrect, scoreChoice } from '../engine/scoring.ts';
import { ReadAloud } from './ReadAloud.tsx';
import { messageText } from '../engine/narration.ts';
import { Feedback } from './Feedback.tsx';
import { AddressBar, PracticeLabel } from './Frames.tsx';
import { Reveal } from './Reveal.tsx';
import { Icon } from './Icon.tsx';

interface Props {
  scenario: ChoicePairScenario;
  mode: Mode;
  onComplete: (r: InteractionResult) => void;
}

// "Pick the safe one": two web addresses shown in browser bars. Choosing one reveals why for both.
export function ChoicePair({ scenario, mode, onComplete }: Props) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const score = chosen ? scoreChoice(chosen, scenario.correctId) : 0;
  const correct = isCorrect(score);

  return (
    <section className="question" aria-labelledby="q-title">
      <h2 id="q-title">{scenario.title}</h2>
      <p>{scenario.prompt}</p>
      <PracticeLabel what="site" />
      <ReadAloud id={`message-${scenario.id}`} text={messageText(scenario) ?? ''} label="Read the question aloud" />

      <div className="choices">
        {scenario.options.map((option) => {
          const isReal = option.id === scenario.correctId;
          return (
            <button
              key={option.id}
              type="button"
              className={`choice${chosen === option.id ? ' choice-chosen' : ''}`}
              aria-pressed={chosen === option.id}
              disabled={chosen !== null}
              onClick={() => {
                setChosen(option.id);
                playSound(isReal ? 'spotted' : 'miss');
              }}
            >
              <span className="window">
                <AddressBar address={option.label} />
              </span>
              {option.note && <span className="choice-note">{option.note}</span>}
              {chosen === option.id && <span className="choice-note">You picked this one.</span>}
              {chosen !== null && (
                <span className={isReal ? 'clue clue-found' : 'clue clue-missed'}>
                  <Icon name={isReal ? 'check' : 'alert'} />
                  <span>
                    <strong className="stack-label">{isReal ? 'Real site' : 'Look-alike'}</strong>
                    {scenario.reasons[option.id]}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {chosen === null && mode === 'learn' &&
        (showHint ? (
          <p className="muted">Hint: read the address from the end of the main name, just before the first slash.</p>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setShowHint(true)}>
            <Icon name="tip" />
            Show a hint
          </button>
        ))}

      {chosen !== null && (
        <Reveal>
          <Feedback tone={correct ? 'good' : 'bad'} title={correct ? 'Good catch! You picked the real site.' : "This one's tricky. Here's the clue."}>
            <p>{scenario.explanation}</p>
          </Feedback>
          <ReadAloud id={`explain-${scenario.id}`} text={scenario.explanation} label="Read the explanation aloud" />
          <button type="button" className="btn btn-primary btn-next" onClick={() => onComplete({ scenarioId: scenario.id, topic: scenario.topic, score, correct })}>
            Continue
            <Icon name="arrowRight" className="icon-forward" />
          </button>
        </Reveal>
      )}
    </section>
  );
}
