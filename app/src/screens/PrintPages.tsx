// Two pages made for printing. The Print button and the site's header and footer
// are hidden on paper by the @media print rules in styles.css.

function PrintButton() {
  return (
    <button type="button" className="btn btn-primary no-print" onClick={() => window.print()}>
      Print this page
    </button>
  );
}

// A card to cut out and keep in a wallet or by the phone.
export function WalletCard() {
  return (
    <section className="section print-page">
      <h1 className="no-print">Wallet card</h1>
      <p className="lede no-print">Print it, cut it out, and keep it by the phone or in a wallet.</p>
      <div className="wallet-card">
        <h2>Stop. Spot. Block.</h2>
        <dl className="steps">
          <div>
            <dt>Stop</dt>
            <dd>Don't act right away. Real organizations give you time.</dd>
          </div>
          <div>
            <dt>Spot</dt>
            <dd>Pressure, secrecy, gift cards, or a request for a code or password? It's a scam.</dd>
          </div>
          <div>
            <dt>Block</dt>
            <dd>Hang up or delete it. Call back on a number you already have.</dd>
          </div>
        </dl>
      </div>
      <PrintButton />
    </section>
  );
}

// The session outline: when, then what happens.
const OUTLINE: [string, string][] = [
  ['0-5 min', 'Welcome. Scammers are professionals and anyone can be fooled, so no one should feel embarrassed.'],
  ['5-15 min', 'Fake texts and emails. Show two examples in Group mode. Ask the room what looks off, then Reveal.'],
  ['15-25 min', 'Phone scams. Show the "grandchild in trouble" call. Talk about how pressure feels in the moment.'],
  ['25-35 min', 'Real or scam? Read a few messages aloud and vote with a show of hands.'],
  ['35-42 min', `Hand out the wallet card. Practice saying "I'll call you back on a number I have."`],
  ['42-45 min', 'Questions, and what to do if something already happened. Call your bank right away and tell someone you trust.'],
];

// One page for someone leading a 45-minute session.
export function FacilitatorGuide() {
  return (
    <section className="section print-page">
      <h1>Leading a ScamSense session</h1>
      <p>45 minutes, for a small group with one big screen. Use Group mode for the examples.</p>

      <h2>Outline</h2>
      <dl className="steps outline">
        {OUTLINE.map(([time, text]) => (
          <div key={time}>
            <dt>{time}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>

      <h2>Discussion prompts</h2>
      <ul className="plain-list">
        <li>Has anyone had a message or call like this one?</li>
        <li>What made it feel urgent? Who benefits from you hurrying?</li>
        <li>Who could you call to check, and where would you find their number?</li>
        <li>What could you say to end a call politely but firmly?</li>
      </ul>
      <PrintButton />
    </section>
  );
}
