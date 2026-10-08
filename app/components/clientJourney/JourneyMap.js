import CollapsibleJourney from './CollapsibleJourney';
import { resolveStep, stepPhase, PHASE_ORDER } from '@/app/utils/journeyHelpers';

export default function JourneyMap({ journeySteps, clientPayment, projectId }) {
	const steps = journeySteps || [];

	const byPhase = Object.fromEntries(PHASE_ORDER.map((p) => [p, []]));
	const unknown = [];
	steps.forEach((step, index) => {
		const phase = stepPhase(step);
		if (phase && byPhase[phase]) byPhase[phase].push({ step, index });
		else unknown.push({ step, index });
	});

	const firstNotDoneIndex = steps.findIndex(
		(step) => resolveStep(step, clientPayment).status !== 'done',
	);
	const currentPhase =
		firstNotDoneIndex !== -1 ? stepPhase(steps[firstNotDoneIndex]) : null;

	const phases = PHASE_ORDER.map((phase) => {
		const items = byPhase[phase];
		const doneCount = items.filter(
			({ step }) => resolveStep(step, clientPayment).status === 'done',
		).length;
		const total = items.length;
		return {
			phase,
			doneCount,
			total,
			allDone: total > 0 && doneCount === total,
			isCurrent: phase === currentPhase,
			defaultOpen: phase === currentPhase,
			items,
		};
	});

	if (unknown.length) {
		phases.push({
			phase: 'unknown',
			doneCount: unknown.filter(({ step }) => resolveStep(step, clientPayment).status === 'done').length,
			total: unknown.length,
			allDone: false,
			isCurrent: false,
			defaultOpen: true,
			items: unknown,
		});
	}

	return (
		<CollapsibleJourney
			phases={phases}
			clientPayment={clientPayment}
			projectId={projectId}
		/>
	);
}