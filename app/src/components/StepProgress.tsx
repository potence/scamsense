// "Question 2 of 3" plus a bar. The bar is shadcn's Progress (Radix), which tells
// screen readers it is a progress bar; styles.css colors it with our tokens.
import { Progress } from './ui/progress.tsx';

export function StepProgress({ index, total }: { index: number; total: number }) {
  const label = `Question ${index + 1} of ${total}`;
  return (
    <div className="step-progress" aria-live="polite">
      <p>{label}</p>
      <Progress value={((index + 1) / total) * 100} aria-label={label} />
    </div>
  );
}
