// Picks the right interaction component for a scenario's `kind`.
// Lesson and Practice both use this, so the switch lives in one place.
import type { InteractionResult, Mode, Scenario } from '../types.ts';
import { RedFlagTap } from './RedFlagTap.tsx';
import { ChoicePair } from './ChoicePair.tsx';
import { CallBranch } from './CallBranch.tsx';
import { ScanOrSkip } from './ScanOrSkip.tsx';
import { OrderSteps } from './OrderSteps.tsx';

export function ScenarioView({ scenario, mode, onComplete }: { scenario: Scenario; mode: Mode; onComplete: (r: InteractionResult) => void }) {
  // key = scenario id, so moving to the next question starts with fresh state.
  if (scenario.kind === 'redflag') return <RedFlagTap key={scenario.id} scenario={scenario} mode={mode} onComplete={onComplete} />;
  if (scenario.kind === 'choicepair') return <ChoicePair key={scenario.id} scenario={scenario} mode={mode} onComplete={onComplete} />;
  if (scenario.kind === 'callbranch') return <CallBranch key={scenario.id} scenario={scenario} mode={mode} onComplete={onComplete} />;
  if (scenario.kind === 'scanorskip') return <ScanOrSkip key={scenario.id} scenario={scenario} mode={mode} onComplete={onComplete} />;
  if (scenario.kind === 'orderSteps') return <OrderSteps key={scenario.id} scenario={scenario} mode={mode} onComplete={onComplete} />;
  return null; // the realorscam inbox has its own screen (screens/Inbox.tsx)
}
