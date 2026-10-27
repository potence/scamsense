// "Look real" frames for practice examples: a phone, a mail window, a browser window.
// They are plain boxes styled in styles.css; the content inside comes from the scenario.
import type { ReactNode } from 'react';
import { Icon } from './Icon.tsx';

// Shown on every example so nobody mistakes it for a real message.
export function PracticeLabel({ what }: { what: string }) {
  return (
    <p className="practice-label">
      <span>Practice example, not a real {what}.</span>
    </p>
  );
}

export function PhoneFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="phone">
      <div className="phone-bezel-notch" aria-hidden="true">
        <span className="phone-speaker" />
      </div>
      <div className="phone-top">
        <span className="phone-sub">{subtitle}</span>
        <span className="phone-title">{title}</span>
      </div>
      <div className="phone-screen">{children}</div>
    </div>
  );
}

export function MailWindow({ from, subject, children }: { from: string; subject?: string; children: ReactNode }) {
  return (
    <div className="window">
      <div className="window-bar" aria-hidden="true">
        <span className="window-dots">
          <span className="dot dot-close" />
          <span className="dot dot-min" />
          <span className="dot dot-max" />
        </span>
        <span className="window-app-name">Mail</span>
      </div>
      <dl className="mail-head">
        <dt>From</dt>
        <dd>{from}</dd>
        {subject && (
          <>
            <dt>Subject</dt>
            <dd className="mail-subject">{subject}</dd>
          </>
        )}
      </dl>
      <div className="window-body">{children}</div>
    </div>
  );
}

// Only <span>s, so it can also sit inside a <button> (see ChoicePair).
export function AddressBar({ address }: { address: string }) {
  const hasLock = address.startsWith('https://');
  return (
    <span className="window-bar">
      <span className="window-dots" aria-hidden="true">
        <span className="dot dot-close" />
        <span className="dot dot-min" />
        <span className="dot dot-max" />
      </span>
      <span className="address">
        {hasLock && <Icon name="lock" className="address-lock-icon" />}
        <span className="visually-hidden">Web address: </span>
        {address}
      </span>
    </span>
  );
}

export function BrowserWindow({ address, children }: { address: string; children: ReactNode }) {
  return (
    <div className="window">
      <AddressBar address={address} />
      <div className="window-body">{children}</div>
    </div>
  );
}
