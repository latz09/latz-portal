import { parseLocalDate } from '@/app/components/portal/deadlineUtils';

const MIN_WEEKS = 8;
const MAX_WEEKS = 16;

function mondayOf(date) {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const day = d.getDay(); // 0 = Sun
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	return d;
}

function addDays(date, n) {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function weekLabel(start) {
	return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function rangeLabel(start, end) {
	const sameMonth = start.getMonth() === end.getMonth();
	const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	const e = sameMonth
		? end.getDate()
		: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	return `${s}–${e}`;
}

// Pulls every dated, not-done thing across active/on-hold projects and
// buckets it into Monday-anchored weeks. Anything already overdue folds
// into the current week's bucket instead of vanishing off the front —
// it's still real load sitting on you right now.
//
// isDesigner reads the same catalog assignedTo field Focus Strip uses —
// one flag, tagged once per catalog entry, instead of a hardcoded ID list
// that silently misses any new/duplicated design-phase step you create.
export function buildWeeklyLoad(clients) {
	const today = new Date();
	const thisMonday = mondayOf(today);

	const rawItems = [];

	clients?.forEach((client) => {
		client.projects?.forEach((project) => {
			if (!['active', 'on-hold'].includes(project.status)) return;

			(project.deadlines || [])
				.filter((d) => !d.completed && d.date)
				.forEach((d) => {
					rawItems.push({
						date: parseLocalDate(d.date),
						title: d.title,
						isDesigner: (d.audience || []).includes('designer'),
						clientName: client.name,
						projectName: project.name,
						href: `/clients/${client.slug}/${project.slug}`,
					});
				});

			(project.journeyMilestonesAll || [])
				.filter((m) => m.status !== 'done' && m.date)
				.forEach((m) => {
					rawItems.push({
						date: parseLocalDate(m.date),
						title: m.title,
						isDesigner: m.assignedTo === 'designer',
						clientName: client.name,
						projectName: project.name,
						href: `/clients/${client.slug}/${project.slug}/journey`,
					});
				});
		});
	});

	if (!rawItems.length) return [];

	const furthest = rawItems.reduce(
		(max, item) => (item.date > max ? item.date : max),
		thisMonday,
	);
	const weeksNeeded = Math.ceil((furthest - thisMonday) / (7 * 86_400_000)) + 1;
	const weekCount = Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, weeksNeeded));

	const weeks = Array.from({ length: weekCount }, (_, i) => {
		const start = addDays(thisMonday, i * 7);
		const end = addDays(start, 6);
		return {
			start,
			end,
			label: weekLabel(start),
			rangeLabel: rangeLabel(start, end),
			items: [],
		};
	});

	rawItems.forEach((item) => {
		const idx =
			item.date < thisMonday
				? 0
				: Math.min(
						weekCount - 1,
						Math.floor((item.date - thisMonday) / (7 * 86_400_000)),
					);
		weeks[idx].items.push(item);
	});

	return weeks.map((w) => ({
		...w,
		internalCount: w.items.filter((i) => !i.isDesigner).length,
		designerCount: w.items.filter((i) => i.isDesigner).length,
	}));
}