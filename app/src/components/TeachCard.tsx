import type { LabelledStep, Topic } from '../types.ts';
import { ReadAloud } from './ReadAloud.tsx';
import { teachText } from '../engine/narration.ts';
import { Icon } from './Icon.tsx';

export interface TeachContent {
  title: string;
  topic: Topic;
  subtitle: string;
  warningSigns: string[];
  safeMove: LabelledStep[];
}

// The start of every lesson: what this scam looks like, 3 warning signs, and the safe move.
export function TeachCard({ teach, onStart }: { teach: TeachContent; onStart: () => void }) {

  return (
    <article className="teach" aria-labelledby="teach-title">
      <p className="lede">{teach.subtitle}</p>
      <ReadAloud id={`teach-${teach.topic}`} text={teachText(teach)} label="Read this page aloud" />

      <h2 id="teach-title">3 warning signs</h2>
      <ol className="signs">
        {teach.warningSigns.map((sign, i) => (
          <li key={i}>
            <span className="sign-num" aria-hidden="true">
              {i + 1}
            </span>
            <span>{sign}</span>
          </li>
        ))}
      </ol>

      <section className="panel" aria-labelledby="safe-move">
        <h2 id="safe-move">
          The safe move
        </h2>
        <dl className="steps">
          {teach.safeMove.map((step) => (
            <div key={step.label}>
              <dt>{step.label}</dt>
              <dd>{step.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <button type="button" className="btn btn-primary" onClick={onStart}>
        Start the questions
        <Icon name="arrowRight" className="icon-forward" />
      </button>
    </article>
  );
}
