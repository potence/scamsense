// The two hub pages behind the nav: Practice (ways to practice) and For helpers.
import { HubList } from '../components/HubList.tsx';

export function PracticeHub() {
  return (
    <section className="section">
      <header className="page-head torn-bottom">
        <h1>Practice</h1>
        <p className="lede">Pick a way to practice. Nothing is timed.</p>
      </header>
      <HubList
        items={[
          { href: '#/practice/round', title: 'Practice round', summary: '5 questions from all the lessons, with no hints.' },
          { href: '#/inbox', title: 'Real or scam?', summary: 'Sort a mixed inbox of texts, emails and calls.' },
          { href: '#/today', title: "Today's practice", summary: '3 quick questions, new every day.' },
        ]}
      />
    </section>
  );
}

export function HelpersHub() {
  return (
    <section className="section">
      <header className="page-head torn-bottom">
        <h1>For helpers</h1>
        <p className="lede">For family members and anyone leading a group session.</p>
      </header>

      <HubList
        items={[
          { href: '#/help', title: 'I think I was scammed', summary: 'Immediate step-by-step checklist with official fraud hotlines.' },
          { href: '#/words', title: 'Scam words glossary', summary: '15 terms explained in plain English, with search and examples.' },
          { href: '#/certificate', title: 'Completion certificate', summary: 'Personalize and print an official certificate of completion.' },
          { href: '#/group', title: 'Group mode', summary: 'Big text for a projector. Show an example, talk, then reveal.' },
          { href: '#/print/card', title: 'Wallet card', summary: 'Print "Stop. Spot. Block." to keep by the phone.' },
          { href: '#/print/guide', title: 'Facilitator guide', summary: 'A one-page plan for a 45-minute session.' },
        ]}
      />

      <section className="panel" aria-labelledby="parent-guide-title" style={{ marginTop: '36px' }}>
        <h2 id="parent-guide-title" style={{ fontSize: '26px', marginBottom: '12px' }}>
          Helping a parent?
        </h2>
        <p style={{ color: 'var(--ink-2)', marginBottom: '16px' }}>
          Sit together and go through one lesson. Let them do the tapping, and talk about the clues.
        </p>
        <ul className="plain-list">
          <li style={{ margin: '12px 0' }}>
            <strong className="stack-label">Keep it judgment-free</strong>
            <span>Scammers are professionals. Anyone can be fooled, so keep conversations supportive.</span>
          </li>
          <li style={{ margin: '12px 0' }}>
            <strong className="stack-label">One golden rule</strong>
            <span>Agree on one family move: hang up and call back on a saved number you already trust.</span>
          </li>
          <li style={{ margin: '12px 0' }}>
            <strong className="stack-label">No rush</strong>
            <span>Real banks, businesses, and government agencies will always give you time to verify.</span>
          </li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="pwa-guide-title" style={{ marginTop: '28px' }}>
        <h2 id="pwa-guide-title" style={{ fontSize: '24px', marginBottom: '12px' }}>
          Add ScamSense to your phone's home screen
        </h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>
          You can install ScamSense on an iPhone, iPad, or Android phone so it opens full screen like a native app, without browser bars.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
          <div className="panel" style={{ background: 'var(--surface-secondary, #faf9f6)', padding: '16px 20px', borderRadius: 'var(--r)' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '8px' }}>On iPhone or iPad (Safari)</h3>
            <ol className="plain-list" style={{ fontSize: '20px', color: 'var(--ink)' }}>
              <li style={{ margin: '8px 0' }}>Tap the <strong>Share</strong> button at the bottom of Safari (square with an up arrow).</li>
              <li style={{ margin: '8px 0' }}>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li style={{ margin: '8px 0' }}>Tap <strong>Add</strong> in the top-right corner.</li>
            </ol>
          </div>
          <div className="panel" style={{ background: 'var(--surface-secondary, #faf9f6)', padding: '16px 20px', borderRadius: 'var(--r)' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '8px' }}>On Android (Chrome)</h3>
            <ol className="plain-list" style={{ fontSize: '20px', color: 'var(--ink)' }}>
              <li style={{ margin: '8px 0' }}>Tap the <strong>three dots menu</strong> (⋮) in the top-right corner.</li>
              <li style={{ margin: '8px 0' }}>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li style={{ margin: '8px 0' }}>Tap <strong>Install</strong> to confirm.</li>
            </ol>
          </div>
        </div>
      </section>
    </section>
  );
}
