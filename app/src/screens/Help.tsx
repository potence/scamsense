import { Icon } from '../components/Icon.tsx';
import { trackEvent } from '../engine/analytics.ts';

export function Help() {
  return (
    // Taps on hotline numbers and report links count as events, e.g. "help/tel:+18333728311".
    <article
      className="section help-page"
      aria-labelledby="help-title"
      onClickCapture={(e) => {
        const a = (e.target as Element).closest('a[href^="tel:"], a[href^="http"]');
        if (a) trackEvent(`help/${a.getAttribute('href')}`);
      }}
    >
      <nav className="breadcrumbs no-print" aria-label="Breadcrumb">
        <a href="#/helpers" className="back-link">
          <Icon name="arrowLeft" />
          <span>Back to Helpers</span>
        </a>
      </nav>

      <header className="page-head torn-bottom">
        <h1 id="help-title">I think I was scammed</h1>
        <p className="lede">
          Take a slow, deep breath. Scammers manufacture urgent panic on purpose to stop you from thinking. Follow these clear steps one at a time.
        </p>
      </header>

      {/* Immediate callout banner */}
      <div className="callout callout-danger help-emergency-callout">
        <div className="callout-header">
          <Icon name="alert" />
          <h2 className="help-emergency-title">If you are on the phone or chat right now</h2>
        </div>
        <p className="help-emergency-action">
          Hang up the call or close the chat window right now.
        </p>
        <p className="help-emergency-note">
          You do not owe them an explanation or an apology. Real banks and government agencies will never punish you for hanging up to verify.
        </p>
      </div>

      <div className="help-timeline">
        {/* Stage 1 */}
        <section className="help-timeline-stage" aria-labelledby="stage-1-heading">
          <div className="help-stage-num" aria-hidden="true">1</div>
          <div className="help-stage-content">
            <h2 id="stage-1-heading" className="help-stage-title">Right now</h2>
            <ol className="help-steps-list">
              <li>
                <strong>Cut off all communication.</strong>
                <p>Hang up the phone, close the website tab, or block the phone number. Do not send another message.</p>
              </li>
              <li>
                <strong>Do not send any more money or gift cards.</strong>
                <p>Scammers often claim "one last fee" will release your funds or clear your name. Every additional payment is lost. Stop immediately.</p>
              </li>
              <li>
                <strong>If you gave remote access to your computer, disconnect internet.</strong>
                <p>If you downloaded software like AnyDesk, TeamViewer, or UltraViewer, turn off your computer's Wi-Fi or unplug the power cord from your internet router.</p>
              </li>
              <li>
                <strong>Take a moment to calm down.</strong>
                <p>You did nothing to feel ashamed of. Scammers run professional operations designed to trick smart people every day. Focus on protecting what you can now.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Stage 2 */}
        <section className="help-timeline-stage" aria-labelledby="stage-2-heading">
          <div className="help-stage-num" aria-hidden="true">2</div>
          <div className="help-stage-content">
            <h2 id="stage-2-heading" className="help-stage-title">First hour</h2>
            <ol className="help-steps-list">
              <li>
                <strong>Call your bank or credit card fraud department.</strong>
                <p>
                  Use only the customer service phone number printed on the back of your physical card. Never dial a number sent in a text or email. Ask for fraud immediately. Tell them money or card numbers were compromised so they can reverse transfers, freeze cards, and dispute charges.
                </p>
              </li>
              <li>
                <strong>Change your passwords, starting with your email.</strong>
                <p>
                  Change your email password first, because password reset links go there. Next change passwords for your bank and financial accounts. Pick strong passwords that you have never used anywhere else.
                </p>
              </li>
              <li>
                <strong>Turn on two-factor authentication (2FA).</strong>
                <p>
                  Turn on login codes for your bank and email accounts. If a scammer has your password, a 2FA code sent to your phone will still stop them from logging in.
                </p>
              </li>
              <li>
                <strong>Put a free fraud alert on your credit reports.</strong>
                <p>
                  If you shared your Social Security number or date of birth, call one credit bureau and ask for a free fraud alert. That one call
                  places the alert at all three bureaus. <a href="tel:+18888366351">Equifax 1-888-836-6351</a> or{' '}
                  <a href="tel:+18883973742">Experian 1-888-397-3742</a>.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Stage 3 */}
        <section className="help-timeline-stage" aria-labelledby="stage-3-heading">
          <div className="help-stage-num" aria-hidden="true">3</div>
          <div className="help-stage-content">
            <h2 id="stage-3-heading" className="help-stage-title">This week</h2>
            <p className="help-stage-desc">
              Filing official reports helps law enforcement stop the scam network and creates a paper trail if you need to dispute charges.
            </p>

            <div className="help-contacts-list">
              <div className="help-contact-row">
                <div className="help-contact-info">
                  <h3 className="help-contact-name">Federal Trade Commission (FTC)</h3>
                  <p className="help-contact-desc">The U.S. government consumer protection agency. Reports are shared with law enforcement.</p>
                </div>
                <div className="help-contact-actions">
                  <a href="https://reportfraud.ftc.gov" target="_blank" rel="noreferrer" className="btn btn-secondary help-action-btn">
                    Report at reportfraud.ftc.gov
                  </a>
                  <a href="tel:+18773824357" className="btn btn-secondary help-action-btn">
                    Call 1-877-382-4357
                  </a>
                </div>
              </div>

              <div className="help-contact-row">
                <div className="help-contact-info">
                  <h3 className="help-contact-name">National Elder Fraud Hotline</h3>
                  <p className="help-contact-desc">U.S. Department of Justice help for adults 60 and older. Free and confidential. Monday to Friday, 10 AM to 6 PM Eastern.</p>
                </div>
                <div className="help-contact-actions">
                  <a href="tel:+18333728311" className="btn btn-secondary help-action-btn">
                    Call 1-833-372-8311
                  </a>
                </div>
              </div>

              <div className="help-contact-row">
                <div className="help-contact-info">
                  <h3 className="help-contact-name">Identity theft (FTC)</h3>
                  <p className="help-contact-desc">If someone used your name, Social Security number or accounts, get a step-by-step recovery plan.</p>
                </div>
                <div className="help-contact-actions">
                  <a href="https://www.identitytheft.gov" target="_blank" rel="noreferrer" className="btn btn-secondary help-action-btn">
                    Visit IdentityTheft.gov
                  </a>
                </div>
              </div>

              <div className="help-contact-row">
                <div className="help-contact-info">
                  <h3 className="help-contact-name">FBI Internet Crime Complaint Center (IC3)</h3>
                  <p className="help-contact-desc">For online fraud, wire transfers, cryptocurrency or large losses.</p>
                </div>
                <div className="help-contact-actions">
                  <a href="https://www.ic3.gov" target="_blank" rel="noreferrer" className="btn btn-secondary help-action-btn">
                    Report at ic3.gov
                  </a>
                </div>
              </div>

              <div className="help-contact-row">
                <div className="help-contact-info">
                  <h3 className="help-contact-name">Talk to someone you trust</h3>
                  <p className="help-contact-desc">Call a family member, close friend, or caregiver. Scammers rely on shame to keep you silent. Talking it through protects you and others.</p>
                </div>
              </div>
            </div>

            <div className="callout callout-danger help-warning">
              <h3 className="help-warning-title">Watch out for recovery scams</h3>
              <p>
                These hotlines will never call you first, and never ask for money, gift cards or your Social Security number. Anyone who
                calls promising to get your money back for a fee is another scammer. Hang up and report them to the FTC.
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="disclaimer-panel panel" aria-labelledby="disclaimer-title">
        <h3 id="disclaimer-title">Important</h3>
        <p>
          This guide is general information, not legal or financial advice. For your own accounts, talk to your bank, the agencies above,
          or a lawyer. Phone numbers were checked against official websites in October 2026.
        </p>
      </aside>

      <div className="help-print-row no-print">
        <button
          type="button"
          className="btn btn-secondary help-print-btn"
          onClick={() => window.print()}
          data-track="print/help"
          aria-label="Print this emergency recovery guide"
        >
          Print this emergency checklist
        </button>
      </div>
    </article>
  );
}
