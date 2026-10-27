import { Icon } from '../components/Icon.tsx';

export function Help() {
  return (
    <article className="section help-page" aria-labelledby="help-title">
      <nav className="breadcrumbs no-print" aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
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

      <div className="help-action-bar no-print" style={{ margin: '24px 0' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.print()}
          aria-label="Print this emergency recovery guide"
        >
          Print this emergency checklist
        </button>
      </div>

      {/* Immediate callout banner */}
      <div className="callout callout-danger" style={{ marginBottom: '32px' }}>
        <div className="callout-header">
          <Icon name="alert" />
          <h2 style={{ fontSize: '20px', margin: 0 }}>If you are on the phone or chat right now</h2>
        </div>
        <p style={{ margin: '8px 0 0 0', fontWeight: 600 }}>
          Hang up the call or close the chat window right now. You do not owe them an explanation or an apology. Real banks and government agencies will never punish you for hanging up to verify.
        </p>
      </div>

      {/* Stage 1 */}
      <section className="panel help-stage" aria-labelledby="stage-1-heading" style={{ marginBottom: '28px' }}>
        <div className="help-stage-badge">Minutes 0–15</div>
        <h2 id="stage-1-heading" style={{ fontSize: '24px', marginTop: '8px' }}>Right now</h2>
        
        <ol className="help-steps-list">
          <li>
            <strong>1. Cut off all communication.</strong>
            <p>Hang up the phone, close the website tab, or block the phone number. Do not send another message.</p>
          </li>
          <li>
            <strong>2. Do not send any more money or gift cards.</strong>
            <p>Scammers often claim "one last fee" will release your funds or clear your name. Every additional payment is lost. Stop immediately.</p>
          </li>
          <li>
            <strong>3. If you gave remote access to your computer, disconnect internet.</strong>
            <p>If you downloaded software like AnyDesk, TeamViewer, or UltraViewer, turn off your computer's Wi-Fi or unplug the power cord from your internet router.</p>
          </li>
          <li>
            <strong>4. Take a moment to calm down.</strong>
            <p>You did nothing to feel ashamed of. Scammers run professional operations designed to trick smart people every day. Focus on protecting what you can now.</p>
          </li>
        </ol>
      </section>

      {/* Stage 2 */}
      <section className="panel help-stage" aria-labelledby="stage-2-heading" style={{ marginBottom: '28px' }}>
        <div className="help-stage-badge">Minutes 15–60</div>
        <h2 id="stage-2-heading" style={{ fontSize: '24px', marginTop: '8px' }}>First hour: secure your accounts</h2>

        <ol className="help-steps-list">
          <li>
            <strong>1. Call your bank or credit card fraud department.</strong>
            <p>
              Use only the customer service phone number printed on the back of your physical card. Never dial a number sent in a text or email. Ask for fraud immediately. Tell them money or card numbers were compromised so they can reverse transfers, freeze cards, and dispute charges.
            </p>
          </li>
          <li>
            <strong>2. Change your passwords, starting with your email.</strong>
            <p>
              Change your email password first, because password reset links go there. Next change passwords for your bank and financial accounts. Pick strong passwords that you have never used anywhere else.
            </p>
          </li>
          <li>
            <strong>3. Turn on two-factor authentication (2FA).</strong>
            <p>
              Turn on login codes for your bank and email accounts. If a scammer has your password, a 2FA code sent to your phone will still stop them from logging in.
            </p>
          </li>
          <li>
            <strong>4. Put a free fraud alert on your credit reports.</strong>
            <p>
              If you shared your Social Security number or date of birth, contact one of the three major credit bureaus: <strong>Equifax (1-800-525-6285)</strong>, <strong>Experian (1-888-397-3742)</strong>, or <strong>TransUnion (1-800-680-7289)</strong>. Placing an alert with one bureau notifies the other two automatically.
            </p>
          </li>
        </ol>
      </section>

      {/* Stage 3 */}
      <section className="panel help-stage" aria-labelledby="stage-3-heading" style={{ marginBottom: '28px' }}>
        <div className="help-stage-badge">First week</div>
        <h2 id="stage-3-heading" style={{ fontSize: '24px', marginTop: '8px' }}>Report the fraud to official agencies</h2>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: '16px' }}>
          Filing official reports helps law enforcement stop the scam network and creates a paper trail if you need to dispute charges.
        </p>

        <div className="official-resources-grid">
          <div className="resource-card panel">
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Federal Trade Commission (FTC)</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
              The primary U.S. government consumer protection agency. Reports enter a database shared with 2,800+ law enforcement agencies.
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Website:</strong>{' '}
              <a href="https://reportfraud.ftc.gov" target="_blank" rel="noreferrer">
                reportfraud.ftc.gov
              </a>
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Phone:</strong> 1-877-FTC-HELP (1-877-382-4357)
            </p>
          </div>

          <div className="resource-card panel">
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>FBI Internet Crime Complaint Center (IC3)</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
              For wire transfers, cryptocurrency scams, online fraud, or large dollar amounts.
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Website:</strong>{' '}
              <a href="https://www.ic3.gov" target="_blank" rel="noreferrer">
                ic3.gov
              </a>
            </p>
          </div>

          <div className="resource-card panel">
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>National Elder Fraud Hotline</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
              U.S. Department of Justice service for adults ages 60 and older. Free, confidential support with dedicated case managers.
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Phone:</strong> 1-833-FRAUD-11 (1-833-372-8311)
            </p>
            <p style={{ fontSize: '14px', color: 'var(--ink-muted)', margin: '4px 0 0 0' }}>
              Hours: Monday through Friday, 10:00 AM – 6:00 PM Eastern
            </p>
          </div>

          <div className="resource-card panel">
            <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Talk to someone you trust</h3>
            <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', marginBottom: '8px' }}>
              Call a trusted family member, close friend, or caregiver. Scammers rely on shame to keep you silent. Talking out loud breaks isolation and protects others in your community.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Educational Disclaimer Box */}
      <aside className="disclaimer-panel panel" aria-label="Legal and educational disclaimer">
        <h3 style={{ fontSize: '17px', margin: '0 0 8px 0', color: 'var(--ink-primary)' }}>Important disclaimer</h3>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5, color: 'var(--ink-secondary)' }}>
          This guide provides general educational information and emergency recovery steps, not formal legal, financial, or tax advice. Every situation is different. For specific counsel regarding your rights and accounts, please consult your financial institution, official government law enforcement authorities, or an attorney.
        </p>
      </aside>
    </article>
  );
}
