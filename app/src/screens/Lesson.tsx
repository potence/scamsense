import { useState } from 'react';
import { LESSONS } from './lessonData.ts';
import { scenariosForLesson } from '../data/index.ts';
import { TeachCard } from '../components/TeachCard.tsx';
import { ResultCard } from '../components/ResultCard.tsx';
import { ScenarioView } from '../components/ScenarioView.tsx';
import { Icon } from '../components/Icon.tsx';
import { StepProgress } from '../components/StepProgress.tsx';
import { recordResult } from '../engine/scoring.ts';
import { saveProgress } from '../engine/storage.ts';
import type { InteractionResult, Progress } from '../types.ts';

interface LessonProps {
  topicId: string;
  progress: Progress;
  onUpdateProgress: (next: Progress) => void;
}

// A lesson: teach card (3 warning signs) -> each question in turn -> result.
export function Lesson({ topicId, progress, onUpdateProgress }: LessonProps) {
  const [phase, setPhase] = useState<'teach' | 'question' | 'result'>('teach');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<InteractionResult[]>([]);

  const lesson = LESSONS.find((l) => l.topic === topicId);
  const questions = scenariosForLesson(topicId);
  const nextLesson = LESSONS[LESSONS.findIndex((l) => l.topic === topicId) + 1]; // undefined after the last lesson

  if (!lesson || questions.length === 0) {
    return (
      <section className="section">
        <h1>Lesson not found</h1>
        <p>We couldn't find that lesson.</p>
        <a className="btn btn-primary" href="#/learn">
          See all lessons
        </a>
      </section>
    );
  }

  const handleComplete = (r: InteractionResult) => {
    setResults([...results, r]);
    const updated = recordResult(progress, r);
    saveProgress(updated);
    onUpdateProgress(updated);
    if (index + 1 < questions.length) setIndex(index + 1);
    else setPhase('result');
    window.scrollTo(0, 0); // next question starts at the top, not mid-page
  };

  const restart = () => {
    setIndex(0);
    setResults([]);
    setPhase('teach');
  };

  return (
    <div className="lesson">
      <a className="back-link" href="#/learn">
        <Icon name="arrowLeft" />
        All lessons
      </a>
      <h1 className={`lesson-heading${phase === 'question' ? ' is-compact' : ''}`}>{lesson.title}</h1>
      {phase === 'question' && <StepProgress index={index} total={questions.length} />}

      {/* key changes at every step, so each step fades in (styles.css .step-in) */}
      <div key={`${phase}-${index}`} className="step-in">
        {phase === 'teach' && <TeachCard teach={lesson.teach} onStart={() => setPhase('question')} />}
        {phase === 'question' && <ScenarioView scenario={questions[index]} mode="learn" onComplete={handleComplete} />}
        {phase === 'result' && (
          <ResultCard
            title="Lesson complete"
            totalScenarios={questions.length}
            correctCount={results.filter((r) => r.correct).length}
            takeaways={Array.from(new Set(questions.flatMap((s) => s.takeaways)))}
            onContinue={() => (window.location.hash = nextLesson ? `#/lesson/${nextLesson.topic}` : '#/learn')}
            continueLabel={nextLesson ? `Next lesson: ${nextLesson.title}` : 'Back to all lessons'}
            onRetry={restart}
            narrationId={`remember-${topicId}`}
            topic={topicId}
          />
        )}
      </div>
    </div>
  );
}
