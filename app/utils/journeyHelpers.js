import {
	formatDate,
	getDeadlineStatus,
} from '@/app/components/portal/deadlineUtils';

export const PHASE_LABELS = {
	'a-outreach': 'A · Initial Outreach',
	'b-close': 'B · Proposal & Close',
	'c-kickoff': 'C · Kickoff',
	'd-design': 'D · Design',
	'e-build': 'E · Build',
	'f-prelaunch': 'F · Ready to Launch',
	'g-launch': 'G · Launch',
	'h-postlaunch': 'H · Post-Launch',
};

// Phase order — used to find a project's current (earliest not-done) phase.
export const PHASE_ORDER = [
	'a-outreach',
	'b-close',
	'c-kickoff',
	'd-design',
	'e-build',
	'f-prelaunch',
	'g-launch',
	'h-postlaunch',
];

// Resolve one step's effective status. Money steps ignore their stored status
// and read clientPayment; everything else uses its own status + hidden date.
export function resolveStep(step, clientPayment) {
	const derived = step.generators?.[0]?.derivedFrom;

	if (derived === 'deposit') {
		const paid = !!clientPayment?.depositPaid;
		return {
			status: paid ? 'done' : 'todo',
			date: paid ? clientPayment?.depositPaidDate : null,
			money: true,
		};
	}
	if (derived === 'final') {
		const paid = !!clientPayment?.finalPaid;
		return {
			status: paid ? 'done' : 'todo',
			date: paid ? clientPayment?.finalPaidDate : null,
			money: true,
		};
	}

	const status = step.status || 'todo';
	const date =
		status === 'waiting'
			? step.enteredWaitingAt
			: status === 'done'
				? step.completedAt
				: null;
	return { status, date, money: false };
}

export function dateLabel(status, date, money) {
	if (!date) return null;
	const formatted = formatDate(getDeadlineStatus(date).date);
	if (status === 'waiting') return `Waiting since ${formatted}`;
	if (status === 'done') return `${money ? 'Paid' : 'Done'} ${formatted}`;
	return null;
}

export function stepTitle(step) {
	const gens = step.generators || [];
	return (
		gens
			.map((g) => g?.title)
			.filter(Boolean)
			.join(' + ') || 'Journey step'
	);
}

// Derives the preview summary from the full step list:
//  - counts done vs total
//  - current phase = phase of the earliest not-done step
//  - active = steps currently in-progress or waiting
//  - nextUp = first to-do step after the active ones
export function summarizeJourney(journeySteps, clientPayment) {
	if (!journeySteps?.length) return null;

	const resolved = journeySteps.map((step) => ({
		step,
		...resolveStep(step, clientPayment),
	}));

	const doneCount = resolved.filter((r) => r.status === 'done').length;
	const total = resolved.length;

	const firstNotDone = resolved.find((r) => r.status !== 'done');
	const currentPhase = firstNotDone?.step.generators?.[0]?.phase ?? null;

	const active = resolved.filter(
		(r) => r.status === 'in-progress' || r.status === 'waiting',
	);

	// next up = first todo that isn't already in the active list
	const nextUp = resolved.find((r) => r.status === 'todo') ?? null;

	return {
		doneCount,
		total,
		currentPhase,
		active,
		nextUp,
		allDone: doneCount === total,
	};
}
