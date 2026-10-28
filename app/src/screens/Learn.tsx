import { LessonList, lessonDone } from '../components/LessonList.tsx';
import { LESSONS } from './lessonData.ts';
import type { Progress } from '../types.ts';

export function Learn({ progress }: { progress: Progress }) {
  const completedCount = LESSONS.filter((l) => {
    const { done, total } = lessonDone(l.topic, progress);
    return total > 0 && done === total;
  }).length;

  return (
    <section className="section">
      <header className="page-head torn-bottom">
        <h1>Lessons</h1>
        <p className="lede">Each lesson shows you 3 warning signs, then 3 practice questions. Go in any order.</p>
      </header>

      <div style={{ margin: '16px 0 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '20px', color: 'var(--ink-secondary)' }}>
          {completedCount} of 12 lessons completed
        </span>
        <a href="#/certificate" style={{ fontSize: '20px', color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          {completedCount === 12 ? '🎓 View completion certificate' : 'Completion certificate progress →'}
        </a>
      </div>

      <LessonList progress={progress} />

      <section className="panel glossary-prompt-panel" aria-labelledby="glossary-prompt-title" style={{ marginTop: '36px' }}>
        <h2 id="glossary-prompt-title" style={{ fontSize: '22px', margin: '0 0 6px 0' }}>
          Confused by scam buzzwords?
        </h2>
        <p style={{ margin: '0 0 16px 0', color: 'var(--ink-secondary)', fontSize: '20px' }}>
          Words like phishing, smishing, quishing, and 2FA can sound like nonsense. Our plain-English dictionary explains all 15 common terms with clear examples.
        </p>
        <a href="#/words" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          Browse scam words glossary →
        </a>
      </section>
    </section>
  );
}
