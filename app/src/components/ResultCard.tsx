import { useEffect } from 'react';
import { ReadAloud } from './ReadAloud.tsx';
import { playSound } from '../engine/sounds.ts';
import { rememberText } from '../engine/narration.ts';
import { Feedback } from './Feedback.tsx';
import { Icon } from './Icon.tsx';

interface ResultCardProps {
  title: string;
  totalScenarios: number;
  correctCount: number;
  takeaways: string[];
  onContinue: () => void;
  continueLabel?: string;
  onRetry?: () => void;
  narrationId?: string; // id of the recorded "Remember" narration, if this card has one
  topic?: string;
}

// End of a lesson or practice round. Encouraging whatever the score; never "Wrong!".
export function ResultCard({ title, totalScenarios, correctCount, takeaways, onContinue, continueLabel = 'Continue', onRetry, narrationId, topic }: ResultCardProps) {
  useEffect(() => playSound('done'), []);
  const all = correctCount === totalScenarios;
  const message = all
    ? 'You spotted the warning signs and made safe choices.'
    : correctCount > 0
      ? 'You caught key warning signs. The more you practice, the easier they are to spot.'
      : 'Scammers make these tricky on purpose. Practicing now helps you spot them in real life.';

  return (
    <article className="result" aria-labelledby="result-title">
      <h2 id="result-title">{title}</h2>
      <p className="result-score">
        {correctCount} of {totalScenarios} handled safely
      </p>

      <Feedback tone={all ? 'good' : 'tip'} title={all ? 'Well done' : 'Good practice'}>
        <p>{message}</p>
      </Feedback>

      {takeaways.length > 0 && (
        <section className="panel" aria-labelledby="takeaways">
          <h3 id="takeaways">Remember</h3>
          <ul className="plain-list">
            {takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {narrationId && <ReadAloud id={narrationId} text={rememberText(takeaways)} label="Read these aloud" />}
        </section>
      )}

      {topic === 'recovery' && (
        <div className="panel" style={{ marginTop: '20px', background: 'var(--sky-light)' }}>
          <p style={{ margin: 0 }}>
            <strong>In a real emergency?</strong> Read our{' '}
            <a href="#/help" style={{ textDecoration: 'underline', fontWeight: 700 }}>
              immediate help checklist
            </a>{' '}
            with official fraud hotlines and reporting resources.
          </p>
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          {continueLabel}
          <Icon name="arrowRight" className="icon-forward" />
        </button>
        {onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Do this lesson again
          </button>
        )}
      </div>
    </article>
  );
}
