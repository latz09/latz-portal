'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	TbChevronDown,
	TbStarFilled,
	TbMail,
	TbCoin,
	TbFileInvoice,
	TbClock,
	TbCalendarOff,
	TbCalendar,
} from 'react-icons/tb';
import NoteCard from './NoteCard';
import { formatDate } from '@/app/components/portal/deadlineUtils';
import { buildFocusSections } from '@/app/utils/focusSignals';

// ─── Small shared bits ───────────────────────────────────────────────────────

function SectionHeader({ label, count, tone = 'text-white/40' }) {
	return (
		<div className='flex items-center gap-2 mb-2.5'>
			<span className={`font-mono text-[11px] tracking-widest uppercase ${tone}`}>
				{label}
			</span>
			<span className='font-mono text-[11px] text-white/25'>{count}</span>
		</div>
	);
}

function StatBar({ overdue, dueSoon, later, waiting, attention, nudges }) {
	const stats = [
		{ label: 'overdue', count: overdue, tone: 'text-danger' },
		{ label: 'due this week', count: dueSoon, tone: 'text-teal' },
		{ label: 'upcoming', count: later, tone: 'text-white/60' },
		{ label: 'waiting', count: waiting, tone: 'text-white/60' },
		{ label: 'need attention', count: attention, tone: 'text-warning' },
		{ label: 'nudges', count: nudges, tone: 'text-white/60' },
	].filter((s) => s.count > 0);

	if (!stats.length) return null;

	return (
		<div className='flex items-center gap-4 lg:gap-6 flex-wrap mb-8  lg:mb-12 border-b border-white/30 pb-3'>
			{stats.map((s) => (
				<span key={s.label} className='font-mono text-xs lg:text-sm text-white/35 '>
					<span className={`font-mono ${s.tone}`}>{s.count}</span> {s.label}
				</span>
			))}
		</div>
	);
}

// ─── Overdue / Due This Week — big day-count on the right ──────────────────

function DayCount({ daysUntil, isToday, isPast }) {
	if (isToday) {
		return (
			<div className='text-right shrink-0'>
				<p className='text-xl font-semibold leading-none text-warning'>Today</p>
			</div>
		);
	}
	const n = Math.abs(daysUntil);
	const tone = isPast ? 'text-danger' : 'text-teal';
	return (
		<div className='text-right shrink-0'>
			<p className={`text-3xl font-semibold leading-none tabular-nums ${tone}`}>{n}</p>
			<p
				className={`font-mono text-[11px] mt-1 ${isPast ? 'text-danger/60' : 'text-white/30'}`}
			>
				{isPast ? (n === 1 ? 'day overdue' : 'days overdue') : n === 1 ? 'day' : 'days'}
			</p>
		</div>
	);
}

function DatedRow({ item }) {
	const border = item.isPast ? 'border-danger/25' : 'border-teal/20';
	const dotTone = item.isPast ? 'bg-danger' : 'bg-teal';
	const starTone = item.isPast ? 'text-danger' : 'text-teal';

	return (
		<Link
			href={item.href}
			className={`group flex items-center justify-between gap-4 border rounded-xl px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors ${border}`}
		>
			<div className='flex items-center gap-3 min-w-0'>
				{item.kind === 'milestone' ? (
					<TbStarFilled className={`text-base shrink-0 ${starTone}`} />
				) : (
					<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotTone}`} />
				)}
				<div className='flex flex-col min-w-0 gap-0.5'>
					<span className='font-mono text-xs text-white/35 truncate'>
						{item.clientName}
						<span className='text-white/20'> · </span>
						{item.projectName}
					</span>
					<span className='text-base font-medium text-white leading-tight truncate'>
						{item.title}
					</span>
				</div>
			</div>
			<DayCount daysUntil={item.daysUntil} isToday={item.isToday} isPast={item.isPast} />
		</Link>
	);
}

// ─── Later — collapsed, calendar date instead of a day-count ──────────────

function LaterRow({ item }) {
	return (
		<Link
			href={item.href}
			className='group flex items-center justify-between gap-4 border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
		>
			<div className='flex items-center gap-3 min-w-0'>
				{item.kind === 'milestone' ? (
					<TbStarFilled className='text-base shrink-0 text-white/30' />
				) : (
					<span className='w-1.5 h-1.5 rounded-full shrink-0 bg-white/20' />
				)}
				<div className='flex flex-col min-w-0 gap-0.5'>
					<span className='font-mono text-xs text-white/30 truncate'>
						{item.clientName}
						<span className='text-white/15'> · </span>
						{item.projectName}
					</span>
					<span className='text-base text-white/70 leading-tight truncate'>{item.title}</span>
				</div>
			</div>
			<span className='font-mono text-xs shrink-0 whitespace-nowrap text-white/40'>
				{formatDate(item.date)}
			</span>
		</Link>
	);
}

function LaterSection({ items }) {
	const [open, setOpen] = useState(false);
	if (!items.length) return null;

	return (
		<div className='mb-8 lg:mb-12'>
			<button
				onClick={() => setOpen(!open)}
				className='group flex items-center justify-between w-full gap-4 border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
			>
				<div className='flex items-center gap-3'>
					<TbCalendar className='text-base text-white/30' />
					<span className='text-base text-white/50'>
						{items.length} more coming up, beyond this week
					</span>
				</div>
				<TbChevronDown
					className={`text-base text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='flex flex-col gap-2 mt-2'>
					{items.map((item) => (
						<LaterRow key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}

// ─── Waiting — ball's out of your hands, this is visibility not urgency ────
// Stacks vertically below sm: the "since" text can run long ("Waiting on
// client since Jul 31, 2026"), and shrink-0 + nowrap has no room to give on
// a narrow screen — it just crushes the client/project line instead. Below
// sm it drops to its own line and wraps normally; sm and up keeps the
// original single-row layout.

function WaitingRow({ item }) {
	const isDesigner = item.waitingOn === 'designer';
	const tone = isDesigner ? 'text-purple' : 'text-warning';
	const border = isDesigner ? 'border-purple/20' : 'border-warning/20';

	return (
		<Link
			href={item.href}
			className={`group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 border rounded-xl px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors ${border}`}
		>
			<div className='flex items-center gap-3 min-w-0'>
				<TbClock className={`text-base shrink-0 ${tone}`} />
				<div className='flex flex-col min-w-0 gap-0.5'>
					<span className='font-mono text-xs text-white/35 truncate'>
						{item.clientName}
						<span className='text-white/20'> · </span>
						{item.projectName}
					</span>
					<span className='text-base font-medium text-white leading-tight truncate'>
						{item.title}
					</span>
				</div>
			</div>
			<span
				className={`font-mono text-xs pl-7 sm:pl-0 sm:shrink-0 sm:whitespace-nowrap sm:text-right ${tone}`}
			>
				{item.detail}
			</span>
		</Link>
	);
}

// ─── Needs Attention — icon per signal type, amber ─────────────────────────
// Same wrap-on-mobile treatment as Waiting — "Site is live, final payment
// outstanding" is the longest detail string in the whole strip.

const ATTENTION_ICON = {
	'proposal-followup': TbMail,
	'deposit-unpaid': TbCoin,
	'final-invoice-unpaid': TbFileInvoice,
};

function AttentionRow({ item }) {
	const Icon = ATTENTION_ICON[item.kind] || TbMail;

	return (
		<Link
			href={item.href}
			className='group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 border rounded-xl px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border-warning/25'
		>
			<div className='flex items-center gap-3 min-w-0'>
				<Icon className='text-base shrink-0 text-warning' />
				<div className='flex flex-col min-w-0 gap-0.5'>
					<span className='font-mono text-xs text-white/35 truncate'>
						{item.clientName}
						<span className='text-white/20'> · </span>
						{item.projectName}
					</span>
					<span className='text-base font-medium text-white leading-tight truncate'>
						{item.title}
					</span>
				</div>
			</div>
			<span className='font-mono text-xs pl-7 sm:pl-0 sm:shrink-0 sm:whitespace-nowrap sm:text-right text-warning'>
				{item.detail}
			</span>
		</Link>
	);
}

// ─── Nudges — collapsed to one line by default ─────────────────────────────

function NudgeRow({ item }) {
	return (
		<Link
			href={item.href}
			className='flex items-center gap-3 border border-white/[0.06] rounded-xl px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors min-w-0'
		>
			<TbCalendarOff className='text-base shrink-0 text-white/30' />
			<div className='flex flex-col min-w-0 gap-0.5'>
				<span className='font-mono text-xs text-white/30 truncate'>
					{item.clientName}
					<span className='text-white/15'> · </span>
					{item.projectName}
				</span>
				<span className='text-base text-white/60 leading-tight truncate'>{item.title}</span>
			</div>
		</Link>
	);
}

function NudgesSection({ items }) {
	const [open, setOpen] = useState(false);
	if (!items.length) return null;

	return (
		<div className='mb-8 lg:mb-12'>
			<button
				onClick={() => setOpen(!open)}
				className='group flex items-center justify-between w-full gap-4 border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
			>
				<div className='flex items-center gap-3'>
					<TbCalendarOff className='text-base text-white/30' />
					<span className='text-base text-white/50'>
						{items.length} milestone{items.length === 1 ? '' : 's'} missing a target date
					</span>
				</div>
				<TbChevronDown
					className={`text-base text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='flex flex-col gap-2 mt-2'>
					{items.map((item) => (
						<NudgeRow key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FocusStrip({ clients, notes: initialNotes = [] }) {
	const [notes, setNotes] = useState(initialNotes);

	function handleArchive(id) {
		setNotes((prev) => prev.filter((n) => n._id !== id));
	}
	function handleSent(id) {
		setNotes((prev) =>
			prev.map((n) =>
				n._id === id ? { ...n, sentAt: new Date().toISOString() } : n,
			),
		);
	}
	function handlePinToggle(id, newPinned) {
		setNotes((prev) =>
			prev.map((n) => (n._id === id ? { ...n, pinned: newPinned } : n)),
		);
	}

	const { overdue, dueSoon, later, waiting, pinned, needsAttention, nudges } =
		buildFocusSections(clients, notes);

	const total =
		overdue.length +
		dueSoon.length +
		later.length +
		waiting.length +
		pinned.length +
		needsAttention.length +
		nudges.length;
	if (!total) return null;

	return (
		<div className='mb-10'>
			<span className='font-mono text-[11px] lg:text-sm tracking-widest uppercase text-white/40 block mb-3'>
				Focus
			</span>

			<StatBar
				overdue={overdue.length}
				dueSoon={dueSoon.length}
				later={later.length}
				waiting={waiting.length}
				attention={needsAttention.length}
				nudges={nudges.length}
			/>

			{overdue.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader label='Overdue' count={overdue.length} tone='text-danger/70' />
					<div className='flex flex-col gap-2 font-mono'>
						{overdue.map((item) => (
							<DatedRow key={item.id} item={item} />
						))}
					</div>
				</div>
			)}

			{dueSoon.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader label='Due This Week' count={dueSoon.length} tone='text-teal/70' />
					<div className='flex flex-col gap-2 font-mono'>
						{dueSoon.map((item) => (
							<DatedRow key={item.id} item={item} />
						))}
					</div>
				</div>
			)}

			<LaterSection items={later} />

			{waiting.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader label='Waiting' count={waiting.length} tone='text-white/50' />
					<div className='flex flex-col gap-2 font-mono'>
						{waiting.map((item) => (
							<WaitingRow key={item.id} item={item} />
						))}
					</div>
				</div>
			)}

			{pinned.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader label='Pinned' count={pinned.length} tone='text-warning/70' />
					<div className='grid sm:grid-cols-2 gap-3 '>
						{pinned.map(({ id, note }) => (
							<NoteCard
								key={id}
								note={note}
								onArchive={handleArchive}
								onSent={handleSent}
								onPinToggle={handlePinToggle}
							/>
						))}
					</div>
				</div>
			)}

			{needsAttention.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader
						label='Needs Attention'
						count={needsAttention.length}
						tone='text-warning/70'
					/>
					<div className='flex flex-col gap-2 font-mono'>
						{needsAttention.map((item) => (
							<AttentionRow key={item.id} item={item} />
						))}
					</div>
				</div>
			)}

			<NudgesSection items={nudges} />
		</div>
	);
}