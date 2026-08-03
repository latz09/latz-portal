import { parseLocalDate, getDeadlineStatus } from '@/app/components/portal/deadlineUtils';
import { dateLabel } from '@/app/utils/journeyHelpers';

// Catalog generator ids — stable Sanity _ids, immune to title/slug renames
// and to steps getting fused or reordered per project. Never match on title.
const GEN = {
	proposal: '6487d382-c88c-4ec7-991f-f2958f4e1667',
	launch: '145aec94-3211-49cf-80e8-06f884d7cc18',
};

const DUE_SOON_WINDOW = 7; // rolling days, not calendar week
const PROPOSAL_FOLLOWUP_DAYS = 5;

function hasGenerator(step, ...ids) {
	return (step.generatorRefs || []).some((r) => ids.includes(r));
}

function findStep(all, ...ids) {
	return (all || []).find((m) => hasGenerator(m, ...ids));
}

function daysSince(dateStr) {
	if (!dateStr) return 0;
	const date = parseLocalDate(dateStr);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.floor((today - date) / 86_400_000);
}

function keyOf(client, project) {
	return `${client.slug}/${project.slug}`;
}

// ─── Item-level: overdue / due-soon / later — one row per dated thing ──────
// Waiting milestones are excluded entirely — a milestone in "waiting" has
// already left your hands, so a passed due date there means "sent on time,
// now sitting with someone else," not overdue. That's the Waiting section.

function buildItemSignals(client, project) {
	const overdue = [];
	const dueSoon = [];
	const later = [];
	const base = {
		clientName: client.name,
		clientSlug: client.slug,
		projectName: project.name,
		projectSlug: project.slug,
	};
	const projectHref = `/clients/${client.slug}/${project.slug}`;
	const journeyHref = `${projectHref}/journey`;

	const dated = [
		...(project.deadlines || [])
			.filter((d) => !d.completed && d.date)
			.map((d) => ({ ...d, isMilestone: false })),
		...(project.journeyMilestonesAll || [])
			.filter((m) => m.status !== 'done' && m.status !== 'waiting' && m.date)
			.map((m) => ({ ...m, isMilestone: true })),
	];

	dated.forEach((d) => {
		const status = getDeadlineStatus(d.date);
		const href = d.isMilestone ? journeyHref : projectHref;
		const item = {
			id: `${d.isMilestone ? 'milestone' : 'deadline'}-${keyOf(client, project)}-${d._key}`,
			kind: d.isMilestone ? 'milestone' : 'deadline',
			title: d.title,
			date: status.date,
			daysUntil: status.daysUntil,
			isToday: status.isToday,
			isPast: status.isPast,
			href,
			...base,
		};

		if (status.isPast) {
			overdue.push(item);
		} else if (status.daysUntil <= DUE_SOON_WINDOW) {
			dueSoon.push(item);
		} else {
			later.push(item);
		}
	});

	return { overdue, dueSoon, later };
}

// ─── Waiting — any milestone currently sitting with someone else ───────────

function buildWaitingSignals(client, project) {
	const base = {
		clientName: client.name,
		clientSlug: client.slug,
		projectName: project.name,
		projectSlug: project.slug,
	};
	const journeyHref = `/clients/${client.slug}/${project.slug}/journey`;

	return (project.journeyMilestonesAll || [])
		.filter((m) => m.status === 'waiting')
		.map((m) => {
			const sinceDateStr = m.enteredWaitingAt || m.date || null;
			return {
				id: `waiting-${keyOf(client, project)}-${m._key}`,
				title: m.title,
				waitingOn: m.waitingOn || null,
				date: sinceDateStr ? parseLocalDate(sinceDateStr) : null,
				detail: dateLabel('waiting', sinceDateStr, false, m.waitingOn),
				href: journeyHref,
				...base,
			};
		});
}

// ─── Project-level: one signal per project, highest priority wins ──────────

function buildProjectSignal(client, project) {
	const base = {
		clientName: client.name,
		clientSlug: client.slug,
		projectName: project.name,
		projectSlug: project.slug,
	};
	const key = keyOf(client, project);
	const projectHref = `/clients/${client.slug}/${project.slug}`;
	const journeyHref = `${projectHref}/journey`;
	const milestones = project.journeyMilestonesAll || [];
	const depositPaid = !!project.clientPayment?.depositPaid;
	const finalPaid = !!project.clientPayment?.finalPaid;

	const proposalStep = findStep(milestones, GEN.proposal);
	const proposalOutCondition = proposalStep?.status === 'done' && !depositPaid;

	if (proposalOutCondition) {
		const since = daysSince(proposalStep.completedAt);
		if (since > PROPOSAL_FOLLOWUP_DAYS) {
			return {
				id: `proposal-followup-${key}`,
				tier: 3,
				kind: 'proposal-followup',
				title: 'Proposal sent — no deposit yet',
				detail: `Sent ${since} days ago`,
				href: projectHref,
				...base,
			};
		}
		return null;
	}

	if (project.status === 'active' && !depositPaid) {
		return {
			id: `deposit-unpaid-${key}`,
			tier: 5,
			kind: 'deposit-unpaid',
			title: 'Deposit unpaid',
			detail: 'Marked active, no deposit recorded',
			href: projectHref,
			...base,
		};
	}

	const launchStep = findStep(milestones, GEN.launch);
	if (launchStep?.status === 'done' && !finalPaid) {
		return {
			id: `final-invoice-${key}`,
			tier: 6,
			kind: 'final-invoice-unpaid',
			title: 'Final invoice unpaid',
			detail: 'Site is live, final payment outstanding',
			href: projectHref,
			...base,
		};
	}

	if (project.status === 'active') {
		const next = milestones.find(
			(m) => m.status !== 'done' && m.status !== 'waiting' && !m.date,
		);
		if (next) {
			return {
				id: `no-date-${key}`,
				tier: 8,
				kind: 'no-date-nudge',
				title: `${next.title} — no date set`,
				detail: 'Next milestone has no target date',
				href: journeyHref,
				...base,
			};
		}
	}

	return null;
}

// ─── Main export — grouped sections, not a flat ranked list ────────────────

export function buildFocusSections(clients, notes) {
	const overdue = [];
	const dueSoon = [];
	const later = [];
	const waiting = [];
	const projectSignals = [];

	clients?.forEach((client) => {
		client.projects?.forEach((project) => {
			if (project.status === 'on-ice') return;

			const items = buildItemSignals(client, project);
			overdue.push(...items.overdue);
			dueSoon.push(...items.dueSoon);
			later.push(...items.later);
			waiting.push(...buildWaitingSignals(client, project));

			const signal = buildProjectSignal(client, project);
			if (signal) projectSignals.push(signal);
		});
	});

	overdue.sort((a, b) => a.date - b.date);
	dueSoon.sort((a, b) => a.date - b.date);
	later.sort((a, b) => a.date - b.date);
	waiting.sort((a, b) => {
		if (a.date && b.date) return a.date - b.date;
		if (a.date) return -1;
		if (b.date) return 1;
		return 0;
	});

	const needsAttention = projectSignals
		.filter((s) => [3, 5, 6].includes(s.tier))
		.sort((a, b) => a.tier - b.tier);

	const nudges = projectSignals.filter((s) => s.tier === 8);

	const pinned = (notes || [])
		.filter((n) => n.pinned)
		.map((n) => ({ id: `note-${n._id}`, note: n }));

	return { overdue, dueSoon, later, waiting, pinned, needsAttention, nudges };
}