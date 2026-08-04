'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbChevronDown, TbChartBar } from 'react-icons/tb';
import { buildWeeklyLoad } from '@/app/utils/capacityUtils';

const MAX_BAR = 88;
const MIN_SEGMENT = 6; // so a lone item never disappears as a sub-pixel sliver

function WeekBar({ week, maxCount, isSelected, onClick }) {
	const total = week.internalCount + week.designerCount;
	const scale = maxCount > 0 ? total / maxCount : 0;
	const barHeight = total === 0 ? 6 : Math.max(16, Math.round(scale * MAX_BAR));

	let internalHeight =
		total === 0 ? 0 : Math.round((week.internalCount / total) * barHeight);
	let designerHeight = barHeight - internalHeight;

	// Guarantee visibility for any non-zero segment, borrowing height from
	// the other one so the bar's total height still reflects the real count.
	if (week.internalCount > 0 && internalHeight < MIN_SEGMENT) {
		designerHeight -= MIN_SEGMENT - internalHeight;
		internalHeight = MIN_SEGMENT;
	}
	if (week.designerCount > 0 && designerHeight < MIN_SEGMENT) {
		internalHeight -= MIN_SEGMENT - designerHeight;
		designerHeight = MIN_SEGMENT;
	}

	return (
		<button
			onClick={onClick}
			disabled={total === 0}
			className={`flex flex-col items-center gap-2.5 min-w-[76px] px-1.5 py-1.5 rounded-lg transition-colors ${
				isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
			}`}
		>
			<div className='flex flex-col-reverse h-24 w-10 justify-start'>
				{internalHeight > 0 && (
					<div
						className={`w-full bg-teal ${designerHeight === 0 ? 'rounded-t-sm' : ''}`}
						style={{ height: `${internalHeight}px` }}
					/>
				)}
				{designerHeight > 0 && (
					<div
						className='w-full bg-purple rounded-t-sm'
						style={{ height: `${designerHeight}px` }}
					/>
				)}
				{total === 0 && <div className='w-full h-1.5 bg-white/10 rounded-full' />}
			</div>
			<span
				className={`font-mono text-sm font-semibold ${total > 0 ? 'text-white/80' : 'text-white/20'}`}
			>
				{total}
			</span>
			<span className='font-mono text-[11px] text-white/35 whitespace-nowrap'>
				{week.label}
			</span>
		</button>
	);
}

function WeekDetail({ week }) {
	return (
		<div className='flex flex-col gap-2 mt-4 border-t border-white/[0.06] pt-4'>
			<span className='font-mono text-xs text-white/40'>
				{week.rangeLabel} · {week.items.length} item{week.items.length === 1 ? '' : 's'}
			</span>
			{week.items.map((item, i) => (
				<Link
					key={i}
					href={item.href}
					className='group flex items-center justify-between gap-4 border border-white/[0.06] rounded-xl px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
				>
					<div className='flex items-center gap-3 min-w-0'>
						<span
							className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isDesigner ? 'bg-purple' : 'bg-teal'}`}
						/>
						<div className='flex flex-col min-w-0 gap-0.5'>
							<span className='font-mono text-xs text-white/35 truncate'>
								{item.clientName}
								<span className='text-white/20'> · </span>
								{item.projectName}
							</span>
							<span className='text-sm font-medium text-white leading-tight truncate'>
								{item.title}
							</span>
						</div>
					</div>
					<span className='font-mono text-xs text-white/50 shrink-0'>
						{item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
					</span>
				</Link>
			))}
		</div>
	);
}

export default function UpcomingLoad({ clients }) {
	const [expanded, setExpanded] = useState(false);
	const [openWeek, setOpenWeek] = useState(null);

	const weeks = buildWeeklyLoad(clients);
	if (!weeks.length) return null;

	const maxCount = Math.max(...weeks.map((w) => w.internalCount + w.designerCount));

	return (
		<div className='mb-6'>
			<button
				onClick={() => setExpanded(!expanded)}
				className='group flex items-center justify-between w-full gap-4 border border-white/[0.06] rounded-xl px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors'
			>
				<div className='flex items-center gap-3'>
					<TbChartBar className='text-base text-white/50' />
					<span className='text-base text-white/50'>Capacity</span>
				</div>
				<TbChevronDown
					className={`text-base text-white/25 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
				/>
			</button>

			{expanded && (
				<div className='border border-white/[0.06] rounded-xl px-6 py-6 mt-2 bg-white/[0.02]'>
					<div className='flex items-center gap-5 mb-6'>
						<span className='flex items-center gap-2 font-mono text-xs text-white/40'>
							<span className='w-2.5 h-2.5 rounded-full bg-teal' /> internal
						</span>
						<span className='flex items-center gap-2 font-mono text-xs text-white/40'>
							<span className='w-2.5 h-2.5 rounded-full bg-purple' /> designer
						</span>
					</div>

					<div className='flex items-start gap-2 overflow-x-auto pb-2'>
						{weeks.map((week, i) => (
							<WeekBar
								key={i}
								week={week}
								maxCount={maxCount}
								isSelected={openWeek === i}
								onClick={() => setOpenWeek(openWeek === i ? null : i)}
							/>
						))}
					</div>

					{openWeek !== null && <WeekDetail week={weeks[openWeek]} />}
				</div>
			)}
		</div>
	);
}