'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbCheck } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';

const STATUS_COLORS = {
	active: 'text-teal',
	complete: 'text-white/50 italic line-through',
	'on-hold': 'text-warning',
	potential: 'text-white/40',
};

const STATUS_FILTERS = ['all', 'active', 'on-hold', 'potential', 'complete'];
const PAYMENT_FILTERS = ['all', 'outstanding', 'paid'];

function formatMoney(n) {
	if (n === undefined || n === null) return null;
	return `$${n.toLocaleString()}`;
}

function getNextDeadline(deadlines) {
	if (!deadlines?.length) return null;
	const upcoming = deadlines
		.filter((d) => !d.completed)
		.map((d) => ({ ...d, computed: getDeadlineStatus(d.date) }))
		.sort((a, b) => a.computed.date - b.computed.date);
	return upcoming[0] || null;
}

function NextDueCell({ deadlines }) {
	const next = getNextDeadline(deadlines);
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
			<span className='text-xs text-white/40 truncate max-w-[160px]'>
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

// ─── Mobile card (used below lg breakpoint instead of the table) ───────────

function MobileProjectCard({ p, isInternal, hrefFor }) {
	return (
		<Link
			href={hrefFor(p)}
			className='flex flex-col gap-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-4 transition-colors'
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex flex-col'>
					<span className='text-white font-medium'>{p.name}</span>
					<span className='text-xs text-white/50'>{p.clientName}</span>
				</div>
				{isInternal && (
					<span
						className={`font-mono text-xs uppercase shrink-0 ${
							STATUS_COLORS[p.status] || 'text-white/40'
						}`}
					>
						{p.status}
					</span>
				)}
			</div>

			<div className='grid grid-cols-2 gap-x-4 gap-y-3'>
				<div className='flex flex-col min-w-0'>
					<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1'>
						Next Due
					</span>
					<NextDueCell deadlines={p.deadlines} />
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
	const [filter, setFilter] = useState('active');
	const [paymentFilter, setPaymentFilter] = useState('outstanding');
	const isInternal = variant === 'internal';

	let filtered = projects;

	if (isInternal) {
		filtered =
			filter === 'all' ? projects : projects.filter((p) => p.status === filter);
	} else if (paymentFilter !== 'all') {
		filtered = projects.filter((p) =>
			paymentFilter === 'paid'
				? p.designerPayment?.status === 'paid'
				: p.designerPayment?.status !== 'paid',
		);
	}

	const hrefFor = (p) =>
		isInternal
			? `/clients/${p.clientSlug}/${p.slug}`
			: `/portal/designer/${p.clientSlug}/${p.slug}`;

	const colCount = isInternal ? 6 : 4;

	return (
		<div className='w-full'>
			{isInternal && (
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
							{s}
						</button>
					))}
				</div>
			)}

			{!isInternal && (
				<div className='flex gap-2 mb-4 flex-wrap'>
					{PAYMENT_FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setPaymentFilter(f)}
							className={`font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border transition-colors ${
								paymentFilter === f
									? 'bg-purple/20 text-purple border-purple/40'
									: 'text-white/40 border-white/10 hover:text-white/60'
							}`}
						>
							{f}
						</button>
					))}
				</div>
			)}

			{/* Mobile: stacked cards, no horizontal scroll */}
			<div className='flex flex-col gap-3 lg:hidden'>
				{filtered.map((p) => (
					<MobileProjectCard
						key={p._id}
						p={p}
						isInternal={isInternal}
						hrefFor={hrefFor}
					/>
				))}
				{filtered.length === 0 && (
					<p className='px-4 py-8 text-center text-white/30 font-mono text-sm'>
						No projects match this filter.
					</p>
				)}
			</div>

			{/* Desktop: full table */}
			<div className='hidden lg:block overflow-x-auto border border-white/10 rounded-xl'>
				<table className='w-full text-left border-collapse'>
					<thead>
						<tr className='border-b border-white/10 bg-white/5'>
							<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
								Client
							</th>
							<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
								Project
							</th>
							{isInternal && (
								<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
									Status
								</th>
							)}
							<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
								Next Due
							</th>
							{isInternal && (
								<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
									Client $
								</th>
							)}
							<th className='font-mono text-xs text-white/40 uppercase tracking-widest px-4 py-3'>
								{isInternal ? 'Designer $' : 'Design Budget'}
							</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((p) => (
							<tr
								key={p._id}
								className='border-b border-white/5 hover:bg-white/5 transition-colors'
							>
								<td className='px-4 py-3 text-sm text-white/80 whitespace-nowrap'>
									{p.clientName}
								</td>
								<td className='px-4 py-3 text-sm'>
									<Link
										href={hrefFor(p)}
										className='text-teal hover:text-white transition-colors'
									>
										{p.name}
									</Link>
								</td>
								{isInternal && (
									<td
										className={`px-4 py-3 font-mono text-xs uppercase ${
											STATUS_COLORS[p.status] || 'text-white/40'
										}`}
									>
										{p.status}
									</td>
								)}
								<td className='px-4 py-3'>
									<NextDueCell deadlines={p.deadlines} />
								</td>
								{isInternal && (
									<td className='px-4 py-3'>
										<ClientPaymentCell clientPayment={p.clientPayment} />
									</td>
								)}
								<td className='px-4 py-3'>
									<DesignerPaymentCell designerPayment={p.designerPayment} />
								</td>
							</tr>
						))}
						{filtered.length === 0 && (
							<tr>
								<td
									colSpan={colCount}
									className='px-4 py-8 text-center text-white/30 font-mono text-sm'
								>
									No projects match this filter.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
