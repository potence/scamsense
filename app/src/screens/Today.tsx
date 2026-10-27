import { useState } from 'react';
import { scenarios } from '../data/index.ts';
import { completeDay, currentStreak, dateKey, loadDaily, pickDaily, saveDaily } from '../engine/daily.ts';
import { recordResult } from '../engine/scoring.ts';
import { saveProgress } from '../engine/storage.ts';
import { ScenarioView } from '../components/ScenarioView.tsx';
import { Feedback } from '../components/Feedback.tsx';
import { Icon } from '../components/Icon.tsx';
import type { InteractionResult, Progress } from '../types.ts';

interface TodayProps {
  progress: Progress;
  onUpdateProgress: (next: Progress) => void;
}

function streakText(days: number): string {
  return days === 1 ? 'day in a row' : 'days in a row'; // the big number beside it says how many
}

// Today's practice: 3 questions chosen from today's date, plus a streak.
export function Today({ progress, onUpdateProgress }: TodayProps) {
  const today = dateKey(new Date());
  const [daily, setDaily] = useState(loadDaily);
  const [questions] = useState(() => pickDaily(scenarios, today));
  // Opening Today's practice starts the first question at once (no extra Start tap); null = the summary screen.
  const [index, setIndex] = useState<number | null>(() => (loadDaily().lastDone === today ? null : 0));
  const [results, setResults] = useState<InteractionResult[]>([]);

  const doneToday = daily.lastDone === today;
  const streak = currentStreak(daily, today);

  const handleComplete = (r: InteractionResult) => {
    setResults([...results, r]);
    const updated = recordResult(progress, r);
    saveProgress(updated);
    onUpdateProgress(updated);
    if (index !== null && index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      // Last question: today counts toward the streak.
      const next = completeDay(daily, today);
      saveDaily(next);
      setDaily(next);
      setIndex(null);
    }
    window.scrollTo(0, 0);
  };

  const dots = (activeI: number | null, isDone: boolean) => (
    <div className="today-dots" role="group" aria-label="Today's 3 questions">
      {[0, 1, 2].map((i) => {
        const completed = isDone || (activeI !== null && i < activeI);
        const current = activeI === i;
        return (
          <span
            key={i}
            className={`today-dot${completed ? ' done' : ''}${current ? ' current' : ''}`}
            aria-label={`Question ${i + 1}${completed ? ' completed' : current ? ' current' : ''}`}
          />
        );
      })}
    </div>
  );

  if (index !== null) {
    return (
      <div className="lesson">
        <div className="today-progress-header">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIndex(null)}
            style={{ minHeight: '52px', padding: '8px 18px', fontSize: '18px' }}
          >
            <Icon name="arrowLeft" /> Leave today's practice
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {dots(index, false)}
            <span className="today-step-count">{index + 1} of 3</span>
          </div>
        </div>

        <h1 className="lesson-heading is-compact">Today's practice</h1>
        <div key={index} className="step-in">
          <ScenarioView scenario={questions[index]} mode="practice" onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <h1>Today's practice</h1>

      {doneToday ? (
        <>
          <div className="today-streak-badge">
            <span className="today-streak-number">{streak}</span>
            <span className="today-streak-label">{streakText(streak)}</span>
          </div>

          <div>{dots(null, true)}</div>

          <p className="result-score" style={{ marginTop: '8px' }}>
            {results.length > 0 ? `${results.filter((r) => r.correct).length} of ${results.length} handled safely.` : "All 3 questions completed safely."}
          </p>

          <Feedback tone="good" title="Done for today">
            <p>Come back tomorrow for 3 new questions to keep your streak going.</p>
          </Feedback>

          <div className="actions" style={{ justifyContent: 'center', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIndex(0)}>
              Do today's 3 again
            </button>
            <a className="btn btn-primary" href="#/">
              Back to home
            </a>
          </div>
        </>
      ) : (
        <>
          {/* The streak is always visible, even at 0, so it reads as something to build. */}
          <div className="today-streak-badge">
            <span className="today-streak-number">{streak}</span>
            <span className="today-streak-label">{streakText(streak)}</span>
          </div>
          <p className="lede">{streak > 0 ? 'Keep it going.' : 'Start your streak today.'} 3 quick questions, new every day.</p>

          <div>{dots(null, false)}</div>

          <div style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-primary btn-block" style={{ maxWidth: '320px', margin: '0 auto' }} onClick={() => setIndex(0)}>
              Start today's 3
              <Icon name="arrowRight" className="icon-forward" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
