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

// Phase order — used to find a project's current phase.
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

export const WAITING_ON_LABELS = {
	client: 'client',
	designer: 'designer',
	other: 'other',
};

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

export function dateLabel(status, date, money, waitingOn) {
	// Waiting renders even with no date, so the state is never invisible.
	if (status === 'waiting') {
		const who = WAITING_ON_LABELS[waitingOn];
		const on = who ? ` on ${who}` : '';
		if (!date) return `Waiting${on}`;
		return `Waiting${on} since ${formatDate(getDeadlineStatus(date).date)}`;
	}
	if (!date) return null;
	const formatted = formatDate(getDeadlineStatus(date).date);
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
//  - current phase = earliest step that's neither done nor waiting
//  - active = steps currently in-progress or waiting
//  - blockers = steps currently waiting
//  - nextUp = first to-do step
export function summarizeJourney(journeySteps, clientPayment) {
	if (!journeySteps?.length) return null;

	const resolved = journeySteps.map((step) => ({
		step,
		...resolveStep(step, clientPayment),
	}));

	const doneCount = resolved.filter((r) => r.status === 'done').length;
	const total = resolved.length;

	// Current phase = earliest step that's neither done NOR waiting.
	// A Waiting step is out of your hands, so it shouldn't anchor the phase
	// marker — otherwise one long block (domain access, designer turnaround)
	// makes every project read as stuck in an early phase.
	const firstActionable = resolved.find(
		(r) => r.status !== 'done' && r.status !== 'waiting',
	);
	const fallback = resolved.find((r) => r.status !== 'done'); // all remaining are waiting
	const currentPhase =
		(firstActionable ?? fallback)?.step.generators?.[0]?.phase ?? null;

	const active = resolved.filter(
		(r) => r.status === 'in-progress' || r.status === 'waiting',
	);
	const blockers = resolved.filter((r) => r.status === 'waiting');
	const nextUp = resolved.find((r) => r.status === 'todo') ?? null;

	return {
		doneCount,
		total,
		currentPhase,
		active,
		blockers,
		nextUp,
		allDone: doneCount === total,
	};
}