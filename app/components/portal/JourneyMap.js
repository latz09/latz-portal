import JourneyRow from './JourneyRow';
import CollapsibleJourney from './CollapsibleJourney';
import { resolveStep } from '@/app/utils/journeyHelpers';

export default function JourneyMap({ journeySteps, clientPayment }) {
  if (!journeySteps?.length) return null;

  // group steps into contiguous phase blocks, preserving order + global index
  const groups = [];
  journeySteps.forEach((step, index) => {
    const phase = step.generators?.[0]?.phase || 'unknown';
    let g = groups[groups.length - 1];
    if (!g || g.phase !== phase) {
      g = { phase, items: [] };
      groups.push(g);
    }
    g.items.push({ step, index });
  });

  // find the current phase = the one holding the earliest not-done step
  const firstNotDoneIndex = journeySteps.findIndex(
    (step) => resolveStep(step, clientPayment).status !== 'done'
  );
  let currentPhase = null;
  if (firstNotDoneIndex !== -1) {
    currentPhase = journeySteps[firstNotDoneIndex].generators?.[0]?.phase || null;
  }

  const phases = groups.map((g) => {
    const doneCount = g.items.filter(
      ({ step }) => resolveStep(step, clientPayment).status === 'done'
    ).length;
    const total = g.items.length;
    const allDone = doneCount === total;
    const isCurrent = g.phase === currentPhase;
    return {
      phase: g.phase,
      doneCount,
      total,
      allDone,
      isCurrent,
      defaultOpen: isCurrent, // only the current phase open by default
      rows: g.items.map(({ step, index }) => (
        <JourneyRow key={step._key} step={step} index={index} clientPayment={clientPayment} />
      )),
    };
  });

  return <CollapsibleJourney phases={phases} />;
}