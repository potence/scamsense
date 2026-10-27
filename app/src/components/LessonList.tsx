// The list of lessons and how far the user is in each. Used on Home and Learn.
// Clean editorial list: clear titles lead, no clutter.
import { LESSONS } from '../screens/lessonData.ts';
import { scenariosForLesson } from '../data/index.ts';
import type { Progress } from '../types.ts';
import { Icon } from './Icon.tsx';
import { Cutout } from './Cutouts.tsx';
import type { CutoutName } from './Cutouts.tsx';

// One paper cutout per lesson, matching its topic.
export const TOPIC_ART: Record<string, CutoutName> = {
  phishing: 'envelope',
  'fake-sites': 'browser',
  quishing: 'qr',
  popups: 'popup',
  payment: 'card',
  emergency: 'handset',
  government: 'shield',
  strangers: 'chat',
  prizes: 'gift',
  shopping: 'bag',
  credentials: 'key',
  recovery: 'aid',
};
const TILTS = [-4, 3, -2, 5, -3];

// How many of a lesson's questions the user has finished at least once.
export function lessonDone(topic: string, progress: Progress): { done: number; total: number } {
  const list = scenariosForLesson(topic);
  return { done: list.filter((s) => progress.completed.includes(s.id)).length, total: list.length };
}

export function LessonList({ progress }: { progress: Progress }) {
  return (
    <ol className="lesson-list">
      {LESSONS.map((lesson, i) => {
        const { done, total } = lessonDone(lesson.topic, progress);
        const status = done === 0 ? `${total} questions` : done === total ? 'Done' : `${done} of ${total} done`;
        return (
          <li key={lesson.topic}>
            <a className={`lesson-row${done === total && total > 0 ? ' is-completed' : ''}`} href={`#/lesson/${lesson.topic}`}>
              <Cutout name={TOPIC_ART[lesson.topic] ?? 'envelope'} tilt={TILTS[i % TILTS.length]} className="lesson-art" />
              <span className="lesson-text">
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-summary">{lesson.shortDesc}</span>
                <span className="lesson-status">
                  {done === total && total > 0 && <Icon name="check" />}
                  {status}
                </span>
              </span>
              <Icon name="chevronRight" className="lesson-chevron" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
