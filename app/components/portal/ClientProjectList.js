import Link from 'next/link';
import { TbChevronRight, TbStarFilled } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';
import { nextDesignerDue } from '@/app/utils/journeyHelpers';

const statusColors = {
	active: 'text-teal',
	complete: 'text-white/40 line-through',
	'on-hold': 'text-warning',
};

const monthNames = [
	'Jan','Feb','Mar','Apr','May','Jun',
	'Jul','Aug','Sep','Oct','Nov','Dec',
];

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

// Date used for sorting cards — the soonest actionable due, or null.
function sortDate(project) {
	const next = nextDesignerDue(project);
	
	return next && !next.tbd && next.computed ? next.computed.date : null;
}

// Soonest first; anything with no dated due (TBD / waiting-no-date / none)
// sinks to the bottom instead of breaking the sort.
function sortByDue(items) {
	return [...items].sort((a, b) => {
		const ad = sortDate(a);
		const bd = sortDate(b);
		if (!ad && !bd) return 0;
		if (!ad) return 1;
		if (!bd) return -1;
		return ad - bd;
	});
}

export default function ClientProjectList({ variant, clients, hrefBuilder }) {
	const accent = ACCENT[variant] || ACCENT.internal;

	// Flatten client → projects into one list so the sort is global.
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

	const sorted = sortByDue(flat);

	if (!sorted.length) return null;

	return (
		<div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full'>
			{sorted.map((project) => {
				const dp = project.designerPayment;
				const budget = budgetLabel(dp);
				const payStatus = dp?.assigned
					? PAYMENT_LABELS[dp.status || 'not-started']
					: null;
				const next = nextDesignerDue(project);
	const isWaiting = next?.waiting;
				return (
					
					<Link
						key={`${project.clientSlug}-${project.slug}`}
						href={hrefBuilder(project.clientSlug, project.slug)}
						className={`group flex flex-col justify-between gap-3 h-full border rounded-xl px-5 py-4 transition-all duration-200 ${
							isWaiting
								? 'bg-white/[0.02] border-white/[0.05] opacity-75 scale-[0.98] hover:opacity-100 hover:scale-100 hover:bg-white/[0.06] hover:border-white/[0.08]'
								: 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
						}`}
					>
						<div className='flex items-start justify-between gap-3'>
							<div className='flex flex-col gap-1 min-w-0'>
								<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest truncate'>
									{project.clientName}
								</span>
								<span className='text-base font-medium text-white leading-tight'>
									{project.name}
								</span>
							</div>
							<TbChevronRight
								className={`${accent.chevron} shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`}
							/>
						</div>

						{/* next due — mirrors the table cell */}
						{next ? (
							<div className='flex flex-col gap-0.5 min-w-0'>
								{next.waiting ? (
									<span className='font-mono text-[11px] text-warning/80'>
										Waiting{next.waitingOn ? ` on ${next.waitingOn}` : ''}
									</span>
								) : next.tbd ? (
									<span className='font-mono text-[11px] text-white/30'>TBD</span>
								) : (
									<span
										className={`font-mono text-[11px] ${
											next.computed?.isPast ? 'text-danger' : 'text-white/60'
										}`}
									>
										{formatDate(next.computed.date)}
									</span>
								)}
								<span className='text-sm text-white/45 line-clamp-2 flex items-start gap-1.5'>
									{next.isMilestone && (
										<TbStarFilled className='text-warning text-[10px] mt-1 shrink-0' />
									)}
									{next.title}
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