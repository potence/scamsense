// Result messages. Color is never the only signal: each tone has its own icon and a title in words.
import type { ReactNode } from 'react';
import { Icon } from './Icon.tsx';
import type { IconName } from './Icon.tsx';

export type Tone = 'good' | 'tip' | 'bad';

const TONE_ICON: Record<Tone, IconName> = { good: 'check', tip: 'tip', bad: 'alert' };

export function Feedback({ tone, title, children }: { tone: Tone; title: string; children?: ReactNode }) {
  return (
    <div className={`feedback feedback-${tone}`} role="status">
      <Icon name={TONE_ICON[tone]} />
      <div>
        <p className="feedback-title">{title}</p>
        {children}
      </div>
    </div>
  );
}
