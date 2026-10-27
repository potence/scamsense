import { useState } from 'react';
import { playSound } from '../engine/sounds.ts';
import type { InteractionResult, Mode, OrderStepsScenario } from '../types.ts';
import { isCorrect, scoreOrderSteps } from '../engine/scoring.ts';
import { ReadAloud } from './ReadAloud.tsx';
import { messageText } from '../engine/narration.ts';
import { Feedback } from './Feedback.tsx';
import { Reveal } from './Reveal.tsx';
import { Icon } from './Icon.tsx';

interface Props {
  scenario: OrderStepsScenario;
  mode: Mode;
  onComplete: (r: InteractionResult) => void;
}

export function OrderSteps({ scenario, onComplete }: Props) {
  // Array of step indices placed in order: e.g. [2, 0, 3, 1]
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const totalSteps = scenario.steps.length;
  const isComplete = placed.length === totalSteps;
  const score = checked ? scoreOrderSteps(placed, scenario.correctOrder) : 0;
  const correct = isCorrect(score);

  // Available steps that haven't been placed yet
  const unplacedIndices = scenario.steps.map((_, i) => i).filter((i) => !placed.includes(i));

  const handlePlace = (index: number) => {
    if (checked || placed.includes(index)) return;
    playSound('tap');
    setPlaced([...placed, index]);
  };

  const handleRemove = (slotIndex: number) => {
    if (checked) return;
    playSound('tap');
    setPlaced(placed.filter((_, i) => i !== slotIndex));
  };

  const handleReset = () => {
    if (checked) return;
    playSound('tap');
    setPlaced([]);
  };

  const handleCheck = () => {
    if (!isComplete) return;
    const computedScore = scoreOrderSteps(placed, scenario.correctOrder);
    setChecked(true);
    playSound(isCorrect(computedScore) ? 'spotted' : 'miss');
  };

  return (
    <section className="question order-steps-view" aria-labelledby="q-title">
      <h2 id="q-title">{scenario.title}</h2>
      <p className="order-prompt">{scenario.prompt}</p>
      <ReadAloud id={`message-${scenario.id}`} text={messageText(scenario) ?? ''} label="Read the instructions aloud" />

      {/* 1. Placed sequence slots */}
      <div className="order-slots-container" role="region" aria-label="Ordered steps list">
        <div className="order-slots-header">
          <span className="order-slots-title">Your step order:</span>
          {!checked && placed.length > 0 && (
            <button type="button" className="btn btn-quiet order-reset-btn" onClick={handleReset}>
              Clear order
            </button>
          )}
        </div>

        <ol className="order-slots">
          {Array.from({ length: totalSteps }).map((_, slotIndex) => {
            const stepIndex = placed[slotIndex];
            const isFilled = stepIndex !== undefined;
            const isCorrectPosition = checked && stepIndex === scenario.correctOrder[slotIndex];

            return (
              <li key={slotIndex} className={`order-slot${isFilled ? ' is-filled' : ' is-empty'}`}>
                <span className="slot-num" aria-hidden="true">
                  {slotIndex + 1}
                </span>

                {isFilled ? (
                  <button
                    type="button"
                    className={`order-item-btn${checked ? (isCorrectPosition ? ' order-correct' : ' order-wrong') : ''}`}
                    disabled={checked}
                    onClick={() => handleRemove(slotIndex)}
                    aria-label={`Step ${slotIndex + 1}: ${scenario.steps[stepIndex]}. ${checked ? (isCorrectPosition ? 'Correct position.' : 'Misplaced position.') : 'Tap to remove.'}`}
                  >
                    <span className="order-item-text">{scenario.steps[stepIndex]}</span>
                    {!checked && <span className="order-item-remove-hint">Tap to remove</span>}
                    {checked && (
                      <span className="order-status-badge">
                        <Icon name={isCorrectPosition ? 'check' : 'alert'} />
                        {isCorrectPosition ? 'Correct' : `Should be step ${scenario.correctOrder.indexOf(stepIndex) + 1}`}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="order-slot-placeholder">
                    <span className="order-slot-hint">Tap a step below to put it here</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* 2. Available pool */}
      {!checked && (
        <div className="order-pool" role="region" aria-label="Available steps to pick from">
          <p className="order-pool-title">
            {unplacedIndices.length > 0 ? 'Tap each step in the order you would do it:' : 'All steps placed! Tap "Check order" below.'}
          </p>
          <div className="order-pool-items">
            {unplacedIndices.map((stepIndex) => (
              <button
                key={stepIndex}
                type="button"
                className="btn order-pool-btn"
                onClick={() => handlePlace(stepIndex)}
              >
                <span className="pool-btn-plus" aria-hidden="true">+</span>
                <span>{scenario.steps[stepIndex]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Action button */}
      {!checked && (
        <div className="order-actions">
          <button
            type="button"
            className="btn btn-primary btn-check"
            disabled={!isComplete}
            onClick={handleCheck}
          >
            Check order
            <Icon name="check" className="icon-forward" />
          </button>
        </div>
      )}

      {/* 4. Revealed state */}
      {checked && (
        <Reveal>
          <div className="order-why-first card">
            <div className="order-why-header">
              <Icon name="tip" />
              <h3>Why the first step matters</h3>
            </div>
            <p>{scenario.whyFirstStepMatters}</p>
          </div>

          <Feedback
            tone={correct ? 'good' : 'bad'}
            title={
              score === 1
                ? 'Perfect order! You got every step right.'
                : correct
                  ? 'Good job! You got the critical first step right.'
                  : "Not quite in order. Here is the safest plan."
            }
          >
            <p>{scenario.explanation}</p>
          </Feedback>

          <ReadAloud id={`explain-${scenario.id}`} text={scenario.explanation} label="Read the explanation aloud" />

          <button
            type="button"
            className="btn btn-primary btn-next"
            onClick={() => onComplete({ scenarioId: scenario.id, topic: scenario.topic, score, correct })}
          >
            Continue
            <Icon name="arrowRight" className="icon-forward" />
          </button>
        </Reveal>
      )}
    </section>
  );
}
