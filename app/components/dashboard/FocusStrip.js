'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	TbChevronDown,
	TbStarFilled,
	TbBrush,
	TbMail,
	TbCoin,
	TbFileInvoice,
	TbClock,
	TbCalendarOff,
	TbCalendar,
} from 'react-icons/tb';
import PinnedNotes from '@/app/components/notes/PinnedNotes';
import { formatDate } from '@/app/components/portal/deadlineUtils';
import { buildFocusSections } from '@/app/utils/focusSignals';

function SectionHeader({ label, count, tone = 'text-white/40' }) {
	return (
		<div className='flex items-center gap-2 mb-2.5'>
			<span
				className={`font-mono text-[11px] tracking-widest uppercase ${tone}`}
			>
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
		<div className='flex items-center gap-4 flex-wrap mb-8 lg:mb-8 lg:mb-12 border-b border-white/30 pb-3'>
			{stats.map((s) => (
				<span key={s.label} className='font-mono text-xs text-white/35 '>
					<span className={`font-semibold ${s.tone}`}>{s.count}</span> {s.label}
				</span>
			))}
		</div>
	);
}

function ClientLabel({ clientName, tone }) {
	return (
		<span
			className={`font-mono text-[11px] font-semibold tracking-widest uppercase ${tone}`}
		>
			{clientName}
		</span>
	);
}

function MilestoneIcon({ isDesigner, isPast }) {
	const tone = isPast
		? 'text-danger'
		: isDesigner
			? 'text-purple'
			: 'text-teal';

	if (!isDesigner) {
		return <TbStarFilled className={`text-base shrink-0 ${tone}`} />;
	}

	return (
		<span className='relative inline-flex items-center justify-center shrink-0'>
			<TbBrush
				className={`absolute -bottom-1 -right-1.5 text-[10px] ${tone}`}
			/>
			<TbStarFilled className={`relative text-base ${tone}`} />
		</span>
	);
}

function DayCount({ daysUntil, isToday, isPast, isDesigner }) {
	if (isToday) {
		return (
			<div className='text-right shrink-0'>
				<p className='text-base lg:text-lg  leading-none text-warning'>Today</p>
			</div>
		);
	}
	const n = Math.abs(daysUntil);
	const numberTone = isPast
		? 'text-danger'
		: isDesigner
			? 'text-purple'
			: 'text-teal';
	const labelTone = isPast
		? 'text-danger/70'
		: isDesigner
			? 'text-purple'
			: 'text-white/40';
	return (
		<div className='text-right shrink-0'>
			<p
				className={` text-xl lg:text-3xl font-semibld leading-none tabular-nums ${numberTone}`}
			>
				{n}
			</p>
			<p className={`font-mono text-[11px] mt-1 ${labelTone}`}>
				{isPast
					? n === 1
						? 'day overdue'
						: 'days overdue'
					: n === 1
						? 'day'
						: 'days'}
			</p>
		</div>
	);
}

function datedRowTone(item, alt) {
	if (item.isPast)
		return {
			dot: 'bg-danger',
			bg: alt
				? 'bg-danger/[0.04] hover:bg-danger/[0.10]'
				: 'bg-danger/[0.08] hover:bg-danger/[0.16]',
			label: 'text-danger',
		};
	if (item.isDesigner)
		return {
			dot: 'bg-purple',
			bg: alt
				? 'bg-purple/[0.08] hover:bg-purple/[0.16]'
				: 'bg-purple/[0.165] hover:bg-purple/[0.26]',
			label: 'text-purple',
		};
	return {
		dot: 'bg-teal',
		bg: alt
			? 'bg-teal/[0.08] hover:bg-teal/[0.16]'
			: 'bg-teal/[0.158] hover:bg-teal/[0.26]',
		label: 'text-teal',
	};
}

function DatedRow({ item, isLast, isAlt }) {
	const { dot, bg, label } = datedRowTone(item, isAlt);

	return (
		<Link
			href={item.href}
			className={`group flex flex-col gap-2.5 px-5 py-5 2xl:py-6 transition-colors ${bg} ${
				!isLast ? 'border-b border-white/[0.06]' : ''
			}`}
		>
			<ClientLabel clientName={item.clientName} tone={label} />
			<div className='flex items-center justify-between gap-4'>
				<div className='flex items-center gap-3 min-w-0'>
					{item.kind === 'milestone' ? (
						<MilestoneIcon isDesigner={item.isDesigner} isPast={item.isPast} />
					) : (
						<span
							className={`w-1.25 h-1.25 lg:w-2 lg:h-2  rounded-full shrink-0 ${dot}`}
						/>
					)}
					<div className='flex flex-col min-w-0 gap-0.5'>
						<span className='text-base md:text-lg font-[540] text-white leading-tight truncate'>
							{item.title}
						</span>
						<span className='font-mono text-xs text-white/30 truncate'>
							{item.projectName}
						</span>
					</div>
				</div>
				<DayCount
					daysUntil={item.daysUntil}
					isToday={item.isToday}
					isPast={item.isPast}
					isDesigner={item.isDesigner}
				/>
			</div>
		</Link>
	);
}

function DatedList({ items }) {
	return (
		<div className='border border-white/[0.08] rounded-xl overflow-hidden'>
			{items.map((item, i) => (
				<DatedRow
					key={item.id}
					item={item}
					isLast={i === items.length - 1}
					isAlt={i % 2 === 1}
				/>
			))}
		</div>
	);
}

function LaterRow({ item }) {
	const dotTone = item.isDesigner ? 'bg-purple' : 'bg-white/20';
	const dateTone = item.isDesigner ? 'text-purple' : 'text-white/40';
	const bgTone = item.isDesigner
		? 'bg-purple/[0.04] hover:bg-purple/[0.07]'
		: 'bg-teal/[0.04] hover:bg-teal/[0.07]';

	return (
		<Link
			href={item.href}
			className={`group flex items-center justify-between gap-4 border border-white/[0.06] rounded-xl px-4 py-3 transition-colors ${bgTone}`}
		>
			<div className='flex items-center gap-3 min-w-0'>
				{item.kind === 'milestone' ? (
					<MilestoneIcon isDesigner={item.isDesigner} isPast={false} />
				) : (
					<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotTone}`} />
				)}
				<div className='flex flex-col min-w-0 gap-0.5'>
					<span className='font-mono text-xs text-white/30 truncate'>
						{item.clientName}
						<span className='text-white/15'> · </span>
						{item.projectName}
					</span>
					<span className='text-base text-white/70 leading-tight truncate'>
						{item.title}
					</span>
				</div>
			</div>
			<span
				className={`font-mono text-xs shrink-0 whitespace-nowrap ${dateTone}`}
			>
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

function WaitingRow({ item, isLast }) {
	const isDesigner = item.waitingOn === 'designer';
	const tone = isDesigner ? 'text-purple' : 'text-warning';
	const bg = isDesigner
		? 'bg-purple/[0.08] hover:bg-purple/[0.16]'
		: 'bg-warning/[0.08] hover:bg-warning/[0.16]';
	const label = isDesigner ? 'text-purple' : 'text-warning';

	return (
		<Link
			href={item.href}
			className={`group flex flex-col gap-2.5 px-5 py-5 transition-colors ${bg} ${
				!isLast ? 'border-b border-white/[0.06]' : ''
			}`}
		>
			<ClientLabel clientName={item.clientName} tone={label} />
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
				<div className='flex items-center gap-3 min-w-0'>
					<TbClock className={`text-base shrink-0 ${tone}`} />
					<div className='flex flex-col min-w-0 gap-0.5'>
						<span className='text-base md:text-lg font-[540] text-white leading-tight'>
							{item.title}
						</span>
						<span className='font-mono text-xs text-white/30 truncate'>
							{item.projectName}
						</span>
					</div>
				</div>
				<span
					className={`font-mono text-xs pl-7 sm:pl-0 sm:shrink-0 sm:whitespace-nowrap ${tone}`}
				>
					{item.detail}
				</span>
			</div>
		</Link>
	);
}

function WaitingList({ items }) {
	return (
		<div className='border border-white/[0.08] rounded-xl overflow-hidden'>
			{items.map((item, i) => (
				<WaitingRow key={item.id} item={item} isLast={i === items.length - 1} />
			))}
		</div>
	);
}

function WaitingSection({ items }) {
	const [open, setOpen] = useState(false);
	if (!items.length) return null;

	return (
		<div className='mb-8 lg:mb-12'>
			<button
				onClick={() => setOpen(!open)}
				className='group flex items-center justify-between w-full gap-4 border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
			>
				<div className='flex items-center gap-3'>
					<TbClock className='text-base text-white/30' />
					<span className='text-base text-white/50'>
						{items.length} waiting on someone else
					</span>
				</div>
				<TbChevronDown
					className={`text-base text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='mt-2'>
					<WaitingList items={items} />
				</div>
			)}
		</div>
	);
}

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
				<span className='text-base text-white/60 leading-tight truncate'>
					{item.title}
				</span>
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
						{items.length} milestone{items.length === 1 ? '' : 's'} missing a
						target date
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

export default function FocusStrip({
	clients,
	pinnedNotes = [],
	onArchive,
	onPinToggle,
	onBackBurnerToggle,
}) {
	const { overdue, dueSoon, later, waiting, needsAttention, nudges } =
		buildFocusSections(clients);

	const total =
		overdue.length +
		dueSoon.length +
		later.length +
		waiting.length +
		pinnedNotes.length +
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
					<SectionHeader
						label='Overdue'
						count={overdue.length}
						tone='text-danger/80'
					/>
					<DatedList items={overdue} />
				</div>
			)}

			{dueSoon.length > 0 && (
				<div className='mb-8 lg:mb-12'>
					<SectionHeader
						label='Due This Week'
						count={dueSoon.length}
						tone='text-teal/80'
					/>
					<DatedList items={dueSoon} />
				</div>
			)}

			<LaterSection items={later} />

			<div className='lg:hidden'>
				<PinnedNotes
					notes={pinnedNotes}
					defaultOpen
					onArchive={onArchive}
					onPinToggle={onPinToggle}
					onBackBurnerToggle={onBackBurnerToggle}
				/>
			</div>

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

			<WaitingSection items={waiting} />

			<NudgesSection items={nudges} />
		</div>
	);
}