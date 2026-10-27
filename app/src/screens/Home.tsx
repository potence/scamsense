import { PhoneDemo } from '../components/PhoneDemo.tsx';
import { LessonList, lessonDone } from '../components/LessonList.tsx';
import { LESSONS } from './lessonData.ts';
import { Icon } from '../components/Icon.tsx';
import { Cutout } from '../components/Cutouts.tsx';
import type { CutoutName } from '../components/Cutouts.tsx';
import { useReveal } from '../components/useReveal.ts';
import { currentStreak, dateKey, loadDaily } from '../engine/daily.ts';
import { getTipOfTheDay } from '../data/tips.ts';
import type { Progress } from '../types.ts';

// The three steps: calm, memorable rules. Same words as the wallet card.
const STEPS: { label: string; text: string; art: CutoutName; tilt: number }[] = [
  { label: 'Stop', text: "Don't act right away. Real organizations give you time.", art: 'stop', tilt: -5 },
  { label: 'Spot', text: "Pressure, secrecy, gift cards, or a request for a code or password? It's a scam.", art: 'magnifier', tilt: 4 },
  { label: 'Block', text: 'Hang up or delete it. Call back on a number you already have.', art: 'blocked', tilt: -3 },
];

// The facts under the hero.
const FACTS = [
  { value: '12', label: 'lessons' },
  { value: '5 min', label: 'each' },
  { value: 'Free', label: 'to use' },
  { value: 'No', label: 'account needed' },
];

export function Home({ progress }: { progress: Progress }) {
  const daily = loadDaily();
  const today = dateKey(new Date());
  const streak = currentStreak(daily, today);
  const doneToday = daily.lastDone === today;
  useReveal();

  const dailyTip = getTipOfTheDay();
  const tipDateString = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const completedCount = LESSONS.filter((l) => {
    const { done, total } = lessonDone(l.topic, progress);
    return total > 0 && done === total;
  }).length;

  return (
    <>
      {/* Sky hero (a painted sky image). Phones: headline, one sentence and the button come first; the demo follows. */}
      <section className="hero-sky torn-bottom" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            <span>Stop.</span> <span>Spot.</span> <span>Block.</span>
          </h1>
          <p className="hero-lede">Short, hands-on practice with fake texts, calls, websites and QR codes, so you can spot a scam before it costs you.</p>
          <a className="btn btn-primary btn-today" href="#/today">
            <span className="btn-today-text">
              <span className="btn-today-title">{doneToday ? "Today's practice is done" : "Start today's practice"}</span>
              <span className="btn-today-meta">
                3 questions{streak > 0 ? `, ${streak} ${streak === 1 ? 'day' : 'days'} in a row` : ''}
              </span>
            </span>
            <Icon name="arrowRight" className="icon-forward" />
          </a>
          <a className="hero-link" href="#/learn">
            Or go through the twelve lessons
          </a>
        </div>
        <div className="hero-demo">
          <div className="demo-card">
            <PhoneDemo />
          </div>
        </div>
      </section>

      <ul className="info-strip" aria-label="About ScamSense" data-reveal>
        {FACTS.map((f) => (
          <li key={f.label}>
            <span className="info-value">{f.value}</span>
            <span className="info-label">{f.label}</span>
          </li>
        ))}
      </ul>

      {/* Daily Scam Awareness Tip */}
      <section className="section-wide daily-tip-section" aria-labelledby="daily-tip-heading" data-reveal>
        <div className="daily-tip-card panel">
          <div className="daily-tip-header">
            <span className="daily-tip-badge" id="daily-tip-heading">
              <Icon name="spark" />
              <span>Tip of the day — {tipDateString}</span>
            </span>
            <span className="daily-tip-category">{dailyTip.category}</span>
          </div>
          <p className="daily-tip-body">{dailyTip.tip}</p>
        </div>
      </section>

      <section className="steps-section torn-top torn-bottom" aria-labelledby="steps-heading" data-reveal>
        <h2 id="steps-heading" className="steps-heading">Three steps for every message and call</h2>
        <ol className="steps-grid">
          {STEPS.map((step) => (
            <li key={step.label} className="step-card">
              <Cutout name={step.art} tilt={step.tilt} className="step-art" />
              <span className="step-body">
                <h3>{step.label}</h3>
                <p>{step.text}</p>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-wide" aria-labelledby="lessons-heading" data-reveal>
        <div className="section-header-row">
          <h2 id="lessons-heading" className="section-heading">
            Twelve lessons, about five minutes each
          </h2>
          <a className="section-link-quiet" href="#/learn">
            All lessons
          </a>
        </div>

        {completedCount === 12 && (
          <div className="panel cert-home-banner" style={{ margin: '0 0 20px 0', background: 'var(--sky-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '18px', color: 'var(--navy)' }}>🎉 You finished all 12 lessons!</strong>
              <p style={{ margin: '4px 0 0 0', color: 'var(--ink-secondary)' }}>Claim and print your official ScamSense Certificate of Completion.</p>
            </div>
            <a href="#/certificate" className="btn btn-primary">
              View your certificate →
            </a>
          </div>
        )}

        <LessonList progress={progress} />
      </section>

      <section className="section-wide feature" aria-labelledby="inbox-heading" data-reveal>
        <div className="feature-content">
          <h2 id="inbox-heading" className="section-heading">
            Real or scam?
          </h2>
          <p className="lede">Sort a mixed inbox of 12 texts, emails and calls. Some are real, some are scams.</p>
        </div>
        <a className="btn btn-primary" href="#/inbox">
          <span>Sort the inbox</span>
          <Icon name="arrowRight" className="icon-forward" />
        </a>
      </section>
    </>
  );
}
