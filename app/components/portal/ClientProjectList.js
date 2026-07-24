import Link from 'next/link';
import { TbChevronRight } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';

const statusColors = {
	active: 'text-teal',
	complete: 'text-white/40 line-through',
	'on-hold': 'text-warning',
};

const monthNames = [
	'Jan','Feb','Mar','Apr','May','Jun',
	'Jul','Aug','Sep','Oct','Nov','Dec',
];

// Written out rather than built with a template literal — Tailwind scans
// source for complete class strings, so `text-${accent}` never gets generated.
const ACCENT = {
	designer: { text: 'text-purple', chevron: 'text-purple' },
	internal: { text: 'text-teal', chevron: 'text-teal' },
};

const PAYMENT_LABELS = {
	'not-started': 'Not started',
	'in-progress': 'In progress',
	delivered: 'Delivered',
	invoiced: 'Invoiced',
	paid: 'Paid',
};

function money(n) {
	if (!n) return null;
	return `$${Math.round(n).toLocaleString()}`;
}

// Designer budget for one project — actual if she's given a number,
// otherwise the quoted range.
function budgetLabel(dp) {
	if (!dp?.assigned) return null;
	if (dp.actualAmount) return money(dp.actualAmount);
	if (dp.quoteLow && dp.quoteHigh) {
		return dp.quoteLow === dp.quoteHigh
			? money(dp.quoteHigh)
			: `${money(dp.quoteLow)}–${money(dp.quoteHigh)}`;
	}
	if (dp.quoteLow) return money(dp.quoteLow);
	return null;
}

// Soonest upcoming/overdue deadline for one project, with its title.
function getNextDeadline(deadlines) {
	let next = null;
	deadlines?.forEach((d) => {
		if (d.completed) return;
		const status = getDeadlineStatus(d.date);
		if (!(status.isPast || status.isUpcoming)) return;
		if (!next || status.date < next.computed.date) {
			next = { ...d, computed: status };
		}
	});
	return next;
}

// Just the date — used for sorting.
function getNextDeadlineDate(deadlines) {
	return getNextDeadline(deadlines)?.computed.date ?? null;
}

// Soonest first; anything with no upcoming date sinks to the bottom
// instead of breaking the sort.
function sortByNextDate(items, getDate) {
	return [...items].sort((a, b) => {
		const aDate = getDate(a);
		const bDate = getDate(b);
		if (!aDate && !bDate) return 0;
		if (!aDate) return 1;
		if (!bDate) return -1;
		return aDate - bDate;
	});
}

export default function ClientProjectList({ variant, clients, hrefBuilder }) {
	const accent = ACCENT[variant] || ACCENT.internal;

	// Flatten client → projects into one list so the sort is global —
	// soonest deadline first regardless of which client it belongs to.
	const flat = [];
	clients?.forEach((client) => {
		client.projects?.forEach((project) => {
			flat.push({
				...project,
				clientName: client.name,
				clientSlug: client.slug,
			});
		});
	});

	const sorted = sortByNextDate(flat, (p) => getNextDeadlineDate(p.deadlines));

	if (!sorted.length) return null;

	return (
		<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full'>
			{sorted.map((project) => {
				const dp = project.designerPayment;
				const budget = budgetLabel(dp);
				const payStatus = dp?.assigned
					? PAYMENT_LABELS[dp.status || 'not-started']
					: null;
				const nextDue = getNextDeadline(project.deadlines);

				return (
					<Link
						key={`${project.clientSlug}-${project.slug}`}
						href={hrefBuilder(project.clientSlug, project.slug)}
						className='group flex flex-col justify-between gap-3 h-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-5 py-4 transition-colors'
					>
						<div className='flex items-start justify-between gap-3'>
							<div className='flex flex-col gap-1 min-w-0'>
								<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest truncate'>
									{project.clientName}
								</span>
								<span className='text-base font-mono font text-white leading-tight mb-1'>
									{project.name}
								</span>
							</div>
							<TbChevronRight
								className={`${accent.chevron} shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`}
							/>
						</div>

						{nextDue ? (
							<div className='flex flex-col gap-0.5 min-w-0'>
								<span
									className={`font-mono text-[11px] ${
										nextDue.computed.isPast ? 'text-danger' : 'text-white/60'
									}`}
								>
									{formatDate(nextDue.computed.date)}
								</span>
								<span className='text-sm text-white/45 line-clamp-2'>
									{nextDue.title}
								</span>
							</div>
						) : (
							<span className='font-mono text-[11px] text-white/25'>
								No upcoming deadline
							</span>
						)}

						<div className='flex items-end justify-between gap-3 pt-2.5 border-t border-white/[0.06]'>
							<span className='font-mono text-[10px] text-white/25 flex items-center gap-2 flex-wrap min-w-0'>
								<span
									className={`uppercase tracking-wide ${statusColors[project.status] || 'text-white/40'}`}
								>
									{project.status}
								</span>
								<span className='text-white/15'>·</span>
								<span>
									{monthNames[project.month - 1]} {project.year}
								</span>
								<span className='text-white/15'>·</span>
								<span>{project.docCount} docs</span>
							</span>

							{budget && (
								<div className='text-right shrink-0'>
									<p
										className={`font-mono text-sm tabular-nums leading-none ${
											dp.status === 'paid' ? 'text-teal' : accent.text
										}`}
									>
										{budget}
									</p>
									{payStatus && (
										<p className='font-mono text-[10px] text-white/30 mt-1'>
											{payStatus}
										</p>
									)}
								</div>
							)}
						</div>
					</Link>
				);
			})}
		</div>
	);
}