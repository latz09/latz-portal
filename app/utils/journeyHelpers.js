import {
	formatDate,
	getDeadlineStatus,
} from '@/app/components/portal/deadlineUtils';

const DESIGN_MILESTONE_ORDER = [
	'Design Sync',
	'Design Direction',
	'Full Design',
];

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

export function designerDueItems(project) {
	const items = [];

	(project.journeyMilestones || []).forEach((m) => {
		items.push({
			key: m._key,
			title: m.title,
			date: m.date || null,
			isMilestone: true,
			done: m.status === 'done',
			waiting: m.status === 'waiting',
			waitingOn: m.waitingOn || null,
		});
	});

	(project.deadlines || []).forEach((d) => {
		items.push({
			key: d._key,
			title: d.title,
			date: d.date || null,
			isMilestone: false,
			done: !!d.completed,
			waiting: false,
			waitingOn: null,
		});
	});

	return items;
}
// Soonest-wins for the table/card cell.
//  - if anything is dated, return the soonest dated (starred if milestone)
//  - if nothing is dated, return the earliest-in-sequence undated milestone
//    as a TBD marker, so she still sees what's coming
export function nextDesignerDue(project) {
	const items = designerDueItems(project).filter((i) => !i.done);
	if (!items.length) return null;

	const dated = items
		.filter((i) => i.date)
		.map((i) => ({ ...i, computed: getDeadlineStatus(i.date) }))
		.sort((a, b) => a.computed.date - b.computed.date);

	if (dated.length) return { ...dated[0], tbd: false };

	// nothing dated — surface the next milestone in sequence as TBD
	const milestones = items.filter((i) => i.isMilestone);
	if (!milestones.length) return null;

	milestones.sort(
		(a, b) =>
			(DESIGN_MILESTONE_ORDER.indexOf(a.title) + 1 || 99) -
			(DESIGN_MILESTONE_ORDER.indexOf(b.title) + 1 || 99),
	);
	return { ...milestones[0], tbd: true, computed: null };
}
