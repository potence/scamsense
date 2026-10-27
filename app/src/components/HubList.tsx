// A list of places to go, styled with clean editorial typography.
// Used by the Practice and For helpers pages.
import { Icon } from './Icon.tsx';

export interface HubItem {
  href: string;
  title: string;
  summary: string;
}

// Same editorial rows as the lesson list: numeral, serif title, one line, chevron.
export function HubList({ items }: { items: HubItem[] }) {
  return (
    <ol className="lesson-list">
      {items.map((item, i) => (
        <li key={item.href}>
          <a className="lesson-row" href={item.href}>
            <span className="lesson-num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="lesson-text">
              <span className="lesson-title">{item.title}</span>
              <span className="lesson-summary">{item.summary}</span>
            </span>
            <Icon name="chevronRight" className="lesson-chevron" />
          </a>
        </li>
      ))}
    </ol>
  );
}
