import { useEffect, useState } from 'react';
import { LESSONS } from './lessonData.ts';
import { lessonDone } from '../components/LessonList.tsx';
import { Icon } from '../components/Icon.tsx';
import { trackEvent } from '../engine/analytics.ts';
import type { Progress } from '../types.ts';

export function Certificate({ progress }: { progress: Progress }) {
  const [recipientName, setRecipientName] = useState('');

  const completedLessons = LESSONS.filter((l) => {
    const { done, total } = lessonDone(l.topic, progress);
    return total > 0 && done === total;
  });

  const completedCount = completedLessons.length;
  const isComplete = completedCount === LESSONS.length;
  useEffect(() => {
    if (isComplete) trackEvent('certificate-earned'); // never the typed name
  }, [isComplete]);

  const todayDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="section certificate-page" aria-labelledby="cert-page-title">
      <nav className="breadcrumbs no-print" aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
        <a href="#/learn" className="back-link">
          <Icon name="arrowLeft" />
          <span>Back to Lessons</span>
        </a>
      </nav>

      {!isComplete ? (
        <div className="cert-in-progress">
          <header className="page-head torn-bottom">
            <h1 id="cert-page-title">Certificate of Completion</h1>
            <p className="lede">
              Complete all {LESSONS.length} lessons to earn your official printable ScamSense certificate.
            </p>
          </header>

          <section className="panel" style={{ margin: '28px 0', padding: '28px' }}>
            <h2 style={{ fontSize: '22px', margin: '0 0 12px 0' }}>Your progress</h2>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 12px 0' }}>
              {completedCount} of {LESSONS.length} lessons completed
            </p>

            <div
              className="cert-progress-bar-track"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={LESSONS.length}
              aria-label="Lessons completed progress bar"
              style={{
                width: '100%',
                height: '16px',
                borderRadius: '8px',
                background: 'var(--hairline)',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div
                className="cert-progress-bar-fill"
                style={{
                  width: `${(completedCount / LESSONS.length) * 100}%`,
                  height: '100%',
                  background: 'var(--cobalt)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <p style={{ color: 'var(--ink-secondary)', marginBottom: '24px' }}>
              Each lesson takes only about 5 minutes. Go through them at your own pace!
            </p>

            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Curriculum checklist</h3>
            <ol className="plain-list" style={{ display: 'grid', gap: '8px' }}>
              {LESSONS.map((l) => {
                const { done, total } = lessonDone(l.topic, progress);
                const finished = total > 0 && done === total;
                return (
                  <li
                    key={l.topic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: finished ? 'var(--sky-light)' : 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 'var(--r-sm)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: finished ? 'var(--green-spot)' : 'var(--ink-muted)' }}>
                        <Icon name={finished ? 'check' : 'target'} />
                      </span>
                      <strong style={{ color: finished ? 'var(--navy)' : 'var(--ink)' }}>{l.title}</strong>
                    </span>
                    {finished ? (
                      <span style={{ fontSize: '20px', color: 'var(--green-spot)', fontWeight: 700 }}>Done</span>
                    ) : (
                      <a href={`#/lesson/${l.topic}`} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '20px', minHeight: '52px' }}>
                        Start →
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      ) : (
        <div className="cert-complete">
          <header className="page-head torn-bottom no-print">
            <h1 id="cert-page-title">Congratulations! You earned your certificate</h1>
            <p className="lede">
              You have completed all {LESSONS.length} ScamSense lessons. Type your name below and print your certificate of completion.
            </p>
          </header>

          <div className="panel no-print" style={{ margin: '24px 0', padding: '24px' }}>
            <label htmlFor="recipient-name-input" className="stack-label" style={{ marginBottom: '8px', fontSize: '20px' }}>
              Enter your name for the certificate
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                id="recipient-name-input"
                type="text"
                className="words-search-input"
                placeholder="e.g. Eleanor Vance"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={{ maxWidth: '380px' }}
                aria-label="Name on certificate"
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
                data-track="print/certificate"
                aria-label="Print certificate"
              >
                Print certificate
              </button>
            </div>
          </div>

          {/* Printable Certificate Frame */}
          <div className="certificate-document" role="region" aria-label="Official Certificate of Completion">
            <div className="certificate-inner-border">
              <div className="certificate-header">
                <div className="cert-badge">
                  <Icon name="check" />
                </div>
                <p className="cert-subheading">ScamSense Scam Awareness Trainer</p>
                <h2 className="cert-title">CERTIFICATE OF COMPLETION</h2>
              </div>

              <p className="cert-awarded-text">This certifies that</p>
              <h3 className="cert-recipient-name">{recipientName.trim() || 'ScamSense Graduate'}</h3>
              <div className="cert-name-rule" />

              <p className="cert-description">
                has successfully completed all {LESSONS.length} interactive scam awareness lessons and demonstrated practical mastery in spotting fraud, verifying requests, and taking safe protective action.
              </p>

              <div className="cert-skills-grid">
                {LESSONS.map((l) => (
                  <div key={l.topic} className="cert-skill-pill">
                    <span className="cert-skill-check">✓</span>
                    <span>{l.title}</span>
                  </div>
                ))}
              </div>

              <div className="cert-motto-box">
                <span className="cert-motto-label">Core Strategy</span>
                <span className="cert-motto-text">Stop. Spot. Block.</span>
              </div>

              <div className="cert-footer-row">
                <div className="cert-sign-col">
                  <div className="cert-signature-line" />
                  <span className="cert-sign-label">Date Awarded</span>
                  <span className="cert-sign-value">{todayDate}</span>
                </div>
                <div className="cert-sign-col">
                  <div className="cert-signature-line" />
                  <span className="cert-sign-label">Program</span>
                  <span className="cert-sign-value">Congressional App Challenge 2026 Entry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
