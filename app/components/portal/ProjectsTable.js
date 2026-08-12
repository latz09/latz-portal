'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbCheck, TbStarFilled } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';
import PortfolioSummary from './PortfolioSummary';
import { nextDesignerDue } from '@/app/utils/journeyHelpers';
import {
	STATUS_LABELS,
	STATUS_COLORS,
	STATUS_ORDER,
} from '@/app/utils/statusConfig';

const STATUS_FILTERS = ['all', ...STATUS_ORDER];
const PAYMENT_FILTERS = ['all', 'outstanding', 'paid'];

// Designer ledger buckets — driven by designerPayment.status, not project status.
const DESIGNER_PAYMENT_FILTERS = ['owed', 'upcoming', 'paid', 'all'];
const DESIGNER_PAYMENT_LABELS = {
	owed: 'Owed',
	upcoming: 'Upcoming',
	paid: 'Paid',
	all: 'All',
};

function bucketForDesignerPayment(status) {
	if (status === 'paid') return 'paid';
	if (status === 'delivered' || status === 'invoiced') return 'owed';
	return 'upcoming'; // not-started, in-progress, or unset
}

function formatMoney(n) {
	if (n === undefined || n === null) return null;
	return `$${n.toLocaleString()}`;
}

function getNextDeadline(project) {
	const items = [
		...(project.deadlines || [])
			.filter((d) => !d.completed)
			.map((d) => ({ ...d, isMilestone: false })),
		// journey milestones — already filtered in the query to dated,
		// not-done steps whose catalog entry is flagged isMilestone
		...(project.journeyMilestones || []).map((m) => ({
			...m,
			isMilestone: true,
		})),
	];
	if (!items.length) return null;

	return items
		.map((d) => ({ ...d, computed: getDeadlineStatus(d.date) }))
		.sort((a, b) => a.computed.date - b.computed.date)[0];
}

function sortByNextDue(projects) {
	return [...projects].sort((a, b) => {
		const aNext = getNextDeadline(a);
		const bNext = getNextDeadline(b);
		if (!aNext && !bNext) return 0;
		if (!aNext) return 1;
		if (!bNext) return -1;
		return aNext.computed.date - bNext.computed.date;
	});
}

// Owed first (you need to act), then upcoming, then paid sinks to bottom.
const PAYMENT_SORT_WEIGHT = { owed: 0, upcoming: 1, paid: 2 };
function sortByPaymentUrgency(projects) {
	return [...projects].sort((a, b) => {
		const aBucket = bucketForDesignerPayment(a.designerPayment?.status);
		const bBucket = bucketForDesignerPayment(b.designerPayment?.status);
		return PAYMENT_SORT_WEIGHT[aBucket] - PAYMENT_SORT_WEIGHT[bBucket];
	});
}

function NextDueCell({ project, variant }) {
	// Designer: pool her design milestones + one-off deadlines, soonest wins,
	// TBD fallback for the next undated milestone.
	if (variant === 'designer') {
		const next = nextDesignerDue(project);

		// No upcoming due — say what state the project is in instead of "—".
		if (!next) {
			const paid = project.designerPayment?.status === 'paid';
			const isComplete = project.status === 'complete';

			let label;
			let tone = 'text-white/30';

			if (paid) {
				label = 'Paid · closed';
			} else if (isComplete) {
				// her work's done, payment is what's outstanding
				label = 'Project closed · payment due';
				tone = 'text-purple/70';
			} else {
				// active/on-hold, no design deadline — delivered, you're building
				label = 'In progress · being built';
			}

			return (
				<span className='font-mono text-xs'>
					<span className={tone}>{label}</span>
				</span>
			);
		}

		if (next.tbd) {
			return (
				<div className='flex flex-col'>
					<span className='font-mono text-base text-white/30'>TBD</span>
					<span className='text-base text-white/40 truncate max-w-[160px] flex items-center gap-1'>
						<TbStarFilled className='text-warning/60 text-[9px] shrink-0' />
						{next.title}
					</span>
				</div>
			);
		}

		return (
			<div className='flex flex-col'>
				{next.waiting ? (
					<span className='font-mono text-[11px] lg:text-base text-warning/85'>
						Waiting{next.waitingOn ? ` on ${next.waitingOn}` : ''}
					</span>
				) : (
					<span
						className={`font-mono text-base ${
							next.computed.isPast
								? 'text-danger font-semibold'
								: 'text-white/70'
						}`}
					>
						{formatDate(next.computed.date)}
					</span>
				)}
				<span className='text-xs text-white/40 truncate max-w-[160px] flex items-center gap-1'>
					{next.isMilestone && (
						<TbStarFilled className='text-warning text-[9px] shrink-0' />
					)}
					{next.title}
				</span>
			</div>
		);
	}

	// Internal: existing behavior
	const next = getNextDeadline(project);
	if (!next) return <span className='text-white/20'>—</span>;

	return (
		<div className='flex flex-col'>
			<span
				className={`font-mono text-xs ${
					next.computed.isPast ? 'text-danger font-semibold' : 'text-white/70'
				}`}
			>
				{formatDate(next.computed.date)}
			</span>
			<span className='text-xs text-white/40 truncate max-w-[160px] flex items-center gap-1'>
				{next.isMilestone && (
					<TbStarFilled className='text-warning text-[9px] shrink-0' />
				)}
				{next.title}
			</span>
		</div>
	);
}

function ClientPaymentCell({ clientPayment }) {
	if (!clientPayment?.totalAmount)
		return <span className='text-white/20'>—</span>;
	const { totalAmount, depositPaid, finalPaid } = clientPayment;
	return (
		<div className='flex flex-col'>
			<span className='text-white text-sm'>{formatMoney(totalAmount)}</span>
			<span className='font-mono text-[10px] text-white/40'>
				{depositPaid ? '✓ dep' : '○ dep'} · {finalPaid ? '✓ final' : '○ final'}
			</span>
		</div>
	);
}

function DesignerPaymentCell({ designerPayment }) {
	if (!designerPayment?.assigned)
		return <span className='text-white/20'>—</span>;
	const { quoteLow, quoteHigh, actualAmount, status } = designerPayment;
	const isPaid = status === 'paid';
	const amount = actualAmount
		? formatMoney(actualAmount)
		: quoteLow && quoteHigh
			? `${formatMoney(quoteLow)}–${formatMoney(quoteHigh)}`
			: '—';

	return (
		<div className='flex flex-col'>
			<span className='text-sm flex items-center gap-1'>
				{isPaid && <TbCheck className='text-xs text-teal shrink-0' />}
				<span
					className={
						isPaid ? 'text-teal line-through decoration-teal/70' : 'text-purple'
					}
				>
					{amount}
				</span>
			</span>
			<span className='font-mono text-[10px] text-white/40 capitalize'>
				{(status || 'not-started').replace('-', ' ')}
			</span>
		</div>
	);
}

// ─── Mobile card ─────────────────────────────────────────────────────────

// Compact monospace ledger row — designer mobile view.
function DesignerLedgerRow({ p, hrefFor }) {
	const dp = p.designerPayment;
	const bucket = bucketForDesignerPayment(dp?.status);
	const next = nextDesignerDue(p);

	const dotColor =
		bucket === 'paid'
			? 'bg-teal'
			: bucket === 'owed'
				? 'bg-purple'
				: 'bg-white/30';

	const amount = dp?.actualAmount
		? formatMoney(dp.actualAmount)
		: dp?.quoteLow && dp?.quoteHigh
			? dp.quoteLow === dp.quoteHigh
				? formatMoney(dp.quoteHigh)
				: `${formatMoney(dp.quoteLow)}–${formatMoney(dp.quoteHigh)}`
			: null;

	// one-line due summary
	let dueLine = null;
	let dueTone = 'text-white/40';
	if (next) {
		if (next.waiting) {
			dueLine = `Waiting${next.waitingOn ? ` · ${next.waitingOn}` : ''}`;
			dueTone = 'text-warning/80';
		} else if (next.tbd) {
			dueLine = `TBD · ${next.title}`;
		} else {
			dueLine = `${formatDate(next.computed.date)} · ${next.title}`;
			dueTone = next.computed.isPast ? 'text-danger' : 'text-white/50';
		}
	} else if (dp?.status === 'paid') {
		dueLine = 'Paid · closed';
	} else if (p.status === 'complete') {
		dueLine = 'Closed · payment due';
		dueTone = 'text-purple/70';
	} else {
		dueLine = 'In progress';
	}

	return (
		<Link
			href={hrefFor(p)}
			className='flex items-center justify-between gap-3 py-8 border-b border-white/[0.06] active:bg-white/[0.03] transition-colors'
		>
			<div className='flex items-start gap-3 min-w-0'>
				<span
					className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}
				/>
				<div className='flex flex-col min-w-0'>
					<span className='font-mono text-sm text-white/50 truncate mb-1'>
						{p.clientName}
					</span>
					<span className='font-mono text-base text-white/90 truncate leading-tight mb-2'>
						{p.name}
					</span>
					{dueLine && (
						<span
							className={`font-mono text-[11px] truncate mt-0.5 ${dueTone}`}
						>
							{dueLine}
						</span>
					)}
				</div>
			</div>

			<div className='flex flex-col items-end shrink-0'>
				{amount && (
					<span
						className={`font-mono text-sm tabular-nums leading-none ${
							bucket === 'paid' ? 'text-teal' : 'text-purple'
						}`}
					>
						{amount}
					</span>
				)}
				<span className='font-mono text-[10px] text-white/30 mt-1 capitalize'>
					{(dp?.status || 'not-started').replace('-', ' ')}
				</span>
			</div>
		</Link>
	);
}

function MobileProjectCard({ p, isInternal, hrefFor, variant }) {
	return (
		<Link
			href={hrefFor(p)}
			className='flex flex-col gap-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-4 transition-colors'
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex flex-col'>
					<span className='text-white font-medium'>{p.clientName}</span>
					<span className='text-xs text-white/50'>{p.name}</span>
				</div>
				{isInternal && (
					<span
						className={`font-mono text-xs uppercase shrink-0 ${
							STATUS_COLORS[p.status] || 'text-white/40'
						}`}
					>
						{STATUS_LABELS[p.status] || p.status}
					</span>
				)}
			</div>

			<div className='grid grid-cols-2 gap-x-4 gap-y-3'>
				<div className='flex flex-col min-w-0'>
					<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1'>
						Next Due
					</span>
					<NextDueCell project={p} variant={variant} />
				</div>
				{isInternal && (
					<div className='flex flex-col min-w-0'>
						<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1'>
							Client $
						</span>
						<ClientPaymentCell clientPayment={p.clientPayment} />
					</div>
				)}
				<div className='flex flex-col min-w-0'>
					<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1'>
						{isInternal ? 'Designer $' : 'Design Budget'}
					</span>
					<DesignerPaymentCell designerPayment={p.designerPayment} />
				</div>
			</div>
		</Link>
	);
}

// ─── Main component ──────────────────────────────────────────────────────

export default function ProjectsTable({ projects, variant = 'internal' }) {
	const [view, setView] = useState('projects'); // 'projects' | 'money' — internal only
	const [filter, setFilter] = useState('active');
	const [paymentFilter, setPaymentFilter] = useState('owed');
	const [clientPaymentFilter, setClientPaymentFilter] = useState('outstanding');
	const isInternal = variant === 'internal';
	const isMoneyView = isInternal && view === 'money';

	let filtered = projects;

	if (isMoneyView) {
		// Ledger below the summary — only projects assigned to the designer.
		filtered = projects.filter((p) => p.designerPayment?.assigned);
		if (paymentFilter !== 'all') {
			filtered = filtered.filter(
				(p) =>
					bucketForDesignerPayment(p.designerPayment?.status) === paymentFilter,
			);
		}
		filtered = sortByPaymentUrgency(filtered);
	} else if (isInternal) {
		filtered =
			filter === 'all' ? projects : projects.filter((p) => p.status === filter);
		filtered = sortByNextDue(filtered);
	} else {
		// designer
		if (clientPaymentFilter !== 'all') {
			filtered = projects.filter((p) =>
				clientPaymentFilter === 'paid'
					? p.designerPayment?.status === 'paid'
					: p.designerPayment?.status !== 'paid',
			);
		}
		// sort by her soonest design due — dated first, TBD/none last
		filtered = [...filtered].sort((a, b) => {
			const an = nextDesignerDue(a);
			const bn = nextDesignerDue(b);
			const ad = an && !an.tbd ? an.computed.date : null;
			const bd = bn && !bn.tbd ? bn.computed.date : null;
			if (!ad && !bd) return 0;
			if (!ad) return 1;
			if (!bd) return -1;
			return ad - bd;
		});
	}

	const hrefFor = (p) =>
		isInternal
			? `/clients/${p.clientSlug}/${p.slug}`
			: `/portal/designer/${p.clientSlug}/${p.slug}`;

	const colCount = isInternal && !isMoneyView ? 6 : 4;

	return (
		<div className='w-full'>
			{/* Projects / Money toggle — internal only */}
			{isInternal && (
				<div className='flex gap-2 mb-4'>
					{['projects', 'money'].map((v) => (
						<button
							key={v}
							onClick={() => setView(v)}
							className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-colors ${
								view === v
									? 'bg-purple/20 text-purple border-purple/40'
									: 'text-white/40 border-white/10 hover:text-white/60'
							}`}
						>
							{v === 'projects' ? 'Projects' : 'Money'}
						</button>
					))}
				</div>
			)}

			{/* Money view: portfolio summary above the designer ledger */}
			{isMoneyView && <PortfolioSummary projects={projects} />}

			{isInternal && !isMoneyView && (
				<div className='flex gap-2 mb-4 flex-wrap'>
					{STATUS_FILTERS.map((s) => (
						<button
							key={s}
							onClick={() => setFilter(s)}
							className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-colors ${
								filter === s
									? 'bg-teal/20 text-teal border-teal/40'
									: 'text-white/40 border-white/10 hover:text-white/60'
							}`}
						>
							{s === 'all' ? 'All' : STATUS_LABELS[s] || s}
						</button>
					))}
				</div>
			)}

			{isMoneyView && (
				<>
					<p className='font-mono text-xs text-white/40 tracking-widest uppercase mb-3'>
						Design Payments
					</p>
					<div className='flex gap-2 mb-4 flex-wrap'>
						{DESIGNER_PAYMENT_FILTERS.map((f) => (
							<button
								key={f}
								onClick={() => setPaymentFilter(f)}
								className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-colors ${
									paymentFilter === f
										? 'bg-purple/20 text-purple border-purple/40'
										: 'text-white/40 border-white/10 hover:text-white/60'
								}`}
							>
								{DESIGNER_PAYMENT_LABELS[f]}
							</button>
						))}
					</div>
				</>
			)}

			{!isInternal && (
				<div className='flex gap-2 mb-4 flex-wrap'>
					{PAYMENT_FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setClientPaymentFilter(f)}
							className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-colors ${
								clientPaymentFilter === f
									? 'bg-purple/20 text-purple border-purple/40'
									: 'text-white/40 border-white/10 hover:text-white/60'
							}`}
						>
							{f}
						</button>
					))}
				</div>
			)}

			{/* Mobile */}
			{isInternal ? (
				<div className='flex flex-col gap-3 lg:hidden'>
					{filtered.map((p) => (
						<MobileProjectCard
							key={p._id}
							p={p}
							isInternal={isInternal}
							hrefFor={hrefFor}
							variant={variant}
						/>
					))}
					{filtered.length === 0 && (
						<p className='px-4 py-5 text-center text-white/30 font-mono text-sm'>
							No projects match this filter.
						</p>
					)}
				</div>
			) : (
				<div className='flex flex-col lg:hidden'>
					{filtered.map((p) => (
						<DesignerLedgerRow key={p._id} p={p} hrefFor={hrefFor} />
					))}
					{filtered.length === 0 && (
						<p className='px-4 py-5 text-center text-white/30 font-mono text-sm'>
							Nothing here.
						</p>
					)}
				</div>
			)}

			{/* Desktop */}
			<div className='hidden lg:block overflow-x-auto border border-white/30 rounded-xl'>
				<table className='w-full text-left border-collapse '>
					<thead>
						<tr className='border-b border-white/10 bg-white/5'>
							<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
								Client
							</th>
							<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
								Project
							</th>
							{isInternal && !isMoneyView && (
								<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
									Status
								</th>
							)}
							<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
								Next Due
							</th>
							{isInternal && !isMoneyView && (
								<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
									Client $
								</th>
							)}
							<th className='font-mono text-sm text-white/60 uppercase tracking-widest px-4 py-3'>
								{isInternal ? 'Designer $' : 'Design Budget'}
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((p) => (
							<tr
								key={p._id}
								className='border-b border-white/5 hover:bg-white/5 transition-colors '
							>
								<td className='px-4 py-5 text-sm text-white/80 font-mono whitespace-nowrap'>
									{p.clientName}
								</td>
								<td className='px-4 py-5 text-sm'>
									<Link
										href={hrefFor(p)}
										className='text-teal text-base hover:text-white transition-colors'
									>
										{p.name}
									</Link>
								</td>
								{isInternal && !isMoneyView && (
									<td
										className={`px-4 py-5 font-mono text-base uppercase ${
											STATUS_COLORS[p.status] || 'text-white/40'
										}`}
									>
										{STATUS_LABELS[p.status] || p.status}
									</td>
								)}
								<td className='px-4 py-5'>
									<NextDueCell project={p} variant={variant} />
								</td>
								{isInternal && !isMoneyView && (
									<td className='px-4 py-5'>
										<ClientPaymentCell clientPayment={p.clientPayment} />
									</td>
								)}
								<td className='px-4 py-5'>
									<DesignerPaymentCell designerPayment={p.designerPayment} />
								</td>
							</tr>
						))}
						{filtered.length === 0 && (
							<tr>
								<td
									colSpan={colCount}
									className='px-4 py-5 text-center text-white/30 font-mono text-sm'
								>
									{isMoneyView
										? 'Nothing here.'
										: 'No projects match this filter.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
