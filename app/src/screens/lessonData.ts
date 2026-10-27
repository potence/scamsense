import { lessons } from '../data/index.ts';
import type { Topic, Lesson } from '../types.ts';
import type { TeachContent } from '../components/TeachCard.tsx';

export interface LessonInfo {
  topic: Topic;
  title: string;
  shortDesc: string;
  teach: TeachContent;
}

export const LESSONS: LessonInfo[] = lessons.map((l: Lesson) => ({
  topic: l.id,
  title: l.title,
  shortDesc: l.summary,
  teach: {
    topic: l.id,
    title: l.title,
    subtitle: l.summary,
    warningSigns: l.teach,
    safeMove: l.safeMove,
  },
}));
