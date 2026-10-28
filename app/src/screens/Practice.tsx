import { useState } from 'react';
import { scenarios } from '../data/index.ts';
import { pickPractice } from '../engine/practice.ts';
import { recordResult, weakestTopic } from '../engine/scoring.ts';
import { saveProgress } from '../engine/storage.ts';
import { LESSONS } from './lessonData.ts';
import { ScenarioView } from '../components/ScenarioView.tsx';
import { ResultCard } from '../components/ResultCard.tsx';
import { Icon } from '../components/Icon.tsx';
import { StepProgress } from '../components/StepProgress.tsx';
import { trackEvent } from '../engine/analytics.ts';
import type { InteractionResult, Progress, Scenario } from '../types.ts';

const ROUND_SIZE = 5;

interface PracticeProps {
  progress: Progress;
  onUpdateProgress: (next: Progress) => void;
}

// A mixed round of questions with no hints, picked more often from the user's weakest topics.
export function Practice({ progress, onUpdateProgress }: PracticeProps) {
  const [round, setRound] = useState<Scenario[]>(() => pickPractice(scenarios, progress, ROUND_SIZE)); // starts at once, no extra Start tap
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<InteractionResult[]>([]);
  const [finished, setFinished] = useState(false);

  const weakest = LESSONS.find((l) => l.topic === weakestTopic(progress));

  const start = () => {
    setRound(pickPractice(scenarios, progress, ROUND_SIZE));
    setIndex(0);
    setResults([]);
    setFinished(false);
    window.scrollTo(0, 0);
  };

  const handleComplete = (r: InteractionResult) => {
    setResults([...results, r]);
    const updated = recordResult(progress, r);
    saveProgress(updated);
    onUpdateProgress(updated);
    if (index + 1 < round.length) setIndex(index + 1);
    else {
      setFinished(true);
      trackEvent(`practice-done/${[...results, r].filter((x) => x.correct).length}of${round.length}`);
    }
    window.scrollTo(0, 0);
  };

  if (round.length === 0) {
    return (
      <section className="section">
        <h1>Practice round</h1>
        <p className="lede">
          {ROUND_SIZE} questions from all the lessons, with no hints. Questions come up more often from topics you find harder.
        </p>
        <button type="button" className="btn btn-primary" onClick={start}>
          Start the practice round
          <Icon name="arrowRight" className="icon-forward" />
        </button>
      </section>
    );
  }

  if (finished) {
    return (
      <div className="lesson">
        <ResultCard
          title="Practice round complete"
          totalScenarios={round.length}
          correctCount={results.filter((r) => r.correct).length}
          takeaways={weakest ? [`Your topic to review next: ${weakest.title}.`] : []}
          onContinue={start}
          continueLabel="Another practice round"
        />
        {weakest && (
          <a className="btn btn-secondary" href={`#/lesson/${weakest.topic}`}>
            Review {weakest.title}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="lesson">
      <h1 className="lesson-heading is-compact">Practice round</h1>
      <StepProgress index={index} total={round.length} />
      <div key={index} className="step-in">
        <ScenarioView scenario={round[index]} mode="practice" onComplete={handleComplete} />
      </div>
    </div>
  );
}
