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

// Effective phase for a journeySteps entry: a per-project phaseOverride wins,
// otherwise fall back to the generator's own phase. Accepts either a raw
// entry ({ generators: [{phase}], phaseOverride }) or an already-flattened
// shape ({ phase }) — same dual-shape support findInsertionIndex relied on
// before this existed.
export function stepPhase(step) {
	return (
		step.phaseOverride || step.phase || step.generators?.[0]?.phase || null
	);
}

// Given the CURRENT journeySteps and a new step's phase, find the array
// index to insert at so the array stays in canonical phase order.
export function findInsertionIndex(journeySteps, newPhase) {
	const newRank = PHASE_ORDER.indexOf(newPhase);
	if (newRank === -1) return journeySteps.length;

	for (let i = 0; i < journeySteps.length; i++) {
		const stepRank = PHASE_ORDER.indexOf(stepPhase(journeySteps[i]));
		if (stepRank > newRank) return i;
	}
	return journeySteps.length;
}

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
	if (step.titleOverride) return step.titleOverride;
	const gens = step.generators || [];
	return (
		gens
			.map((g) => g?.title)
			.filter(Boolean)
			.join(' + ') || 'Journey step'
	);
}

export function summarizeJourney(journeySteps, clientPayment) {
	if (!journeySteps?.length) return null;

	const resolved = journeySteps.map((step) => ({
		step,
		...resolveStep(step, clientPayment),
	}));

	const doneCount = resolved.filter((r) => r.status === 'done').length;
	const total = resolved.length;

	const firstActionable = resolved.find(
		(r) => r.status !== 'done' && r.status !== 'waiting',
	);
	const fallback = resolved.find((r) => r.status !== 'done');
	const currentPhase = stepPhase((firstActionable ?? fallback)?.step || {});

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

export function nextDesignerDue(project) {
	const items = designerDueItems(project).filter((i) => !i.done);
	if (!items.length) return null;

	const dated = items
		.filter((i) => i.date)
		.map((i) => ({ ...i, computed: getDeadlineStatus(i.date) }))
		.sort((a, b) => a.computed.date - b.computed.date);

	if (dated.length) return { ...dated[0], tbd: false };

	const milestones = items.filter((i) => i.isMilestone);
	if (!milestones.length) return null;

	milestones.sort(
		(a, b) =>
			(DESIGN_MILESTONE_ORDER.indexOf(a.title) + 1 || 99) -
			(DESIGN_MILESTONE_ORDER.indexOf(b.title) + 1 || 99),
	);
	return { ...milestones[0], tbd: true, computed: null };
}
