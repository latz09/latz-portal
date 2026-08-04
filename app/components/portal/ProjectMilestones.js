'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbStarFilled, TbChevronDown } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';
import { resolveStep } from '@/app/utils/journeyHelpers';

// Launch / Domain Connect's catalog _id — the dividing line between
// "in-build" and "post-launch" milestones. Matched by id, not title.
const LAUNCH_ID = '145aec94-3211-49cf-80e8-06f884d7cc18';

// "in 2 days" / "in 1 day" / "today" / "3 days ago"
function countdown(computed) {
	if (computed.isToday) return 'today';
	const n = Math.abs(computed.daysUntil);
	const unit = n === 1 ? 'day' : 'days';
	return computed.isPast ? `${n} ${unit} ago` : `in ${n} ${unit}`;
}

function MilestoneRow({ m, isLast }) {
	return (
		<div
			className={`flex items-center justify-between gap-4 py-2.5 transition-all ${
				!isLast ? 'border-b border-white/[0.06]' : ''
			} ${m.waiting ? 'scale-[0.99] origin-left' : ''}`}
		>
			<span
				className={`flex items-center gap-2.5 text-sm min-w-0 ${
					m.waiting ? 'text-white/45' : 'text-white/85'
				}`}
			>
				<TbStarFilled className='text-warning text-xs shrink-0' />
				<span className='truncate'>{m.title}</span>
			</span>

			<span className='font-mono text-[11px] shrink-0 text-right'>
				{m.waiting ? (
					<span className='text-warning/80'>
						Delivered
						{m.enteredWaitingAt && (
							<span className='text-white/30'>
								{' '}· waiting since {formatDate(getDeadlineStatus(m.enteredWaitingAt).date)}
							</span>
						)}
					</span>
				) : m.date ? (
					<span className={m.computed.isPast ? 'text-danger' : 'text-white/60'}>
						{formatDate(m.computed.date)}
						<span className='text-white/30'> · {countdown(m.computed)}</span>
					</span>
				) : (
					<span className='text-white/25'>TBD</span>
				)}
			</span>
		</div>
	);
}

export default function ProjectMilestones({
	journeySteps,
	clientPayment,
	clientSlug,
	projectSlug,
}) {
	const [showPostLaunch, setShowPostLaunch] = useState(false);

	const allSteps = journeySteps || [];

	const launchIndex = allSteps.findIndex((s) => s.generators?.[0]?._id === LAUNCH_ID);
	const launchDone =
		launchIndex !== -1 && resolveStep(allSteps[launchIndex], clientPayment).status === 'done';

	const milestones = allSteps
		.map((s, sequenceIndex) => ({ s, sequenceIndex }))
		.filter(({ s }) => s.generators?.[0]?.isMilestone)
		.map(({ s, sequenceIndex }) => {
			const g = s.generators[0];
			const resolved = resolveStep(s, clientPayment);
			return {
				key: s._key,
				title: g.title,
				// resolveStep only returns a date for money steps once they're
				// PAID (the paid date) — never a manually-set target. Keep
				// reading the raw dueDate here so a target date Jordan sets on
				// Deposit/Final Invoice before payment still shows.
				date: s.dueDate || null,
				sequenceIndex,
				isPostLaunch: launchIndex !== -1 && sequenceIndex > launchIndex,
				status: resolved.status,
				waiting: resolved.status === 'waiting',
				waitingOn: s.waitingOn || null,
				enteredWaitingAt: s.enteredWaitingAt || null,
				computed: s.dueDate ? getDeadlineStatus(s.dueDate) : null,
			};
		})
		.filter((m) => m.status !== 'done');

	if (!milestones.length) return null;

	const visible = milestones.filter((m) => launchDone || !m.isPostLaunch);
	const hidden = milestones.filter((m) => !launchDone && m.isPostLaunch);

	const dated = visible
		.filter((m) => m.date)
		.sort((a, b) => a.computed.date - b.computed.date);
	const tbd = visible
		.filter((m) => !m.date)
		.sort((a, b) => a.sequenceIndex - b.sequenceIndex);
	const ordered = [...dated, ...tbd];

	const href = `/clients/${clientSlug}/${projectSlug}/journey`;

	return (
		<div>
			<div className='flex items-center justify-between mb-3'>
				<p className='font-mono text-[10px] lg:text-xs tracking-widest uppercase text-white/40'>
					Milestones
				</p>
				<Link
					href={href}
					className='font-mono text-[11px] text-white/30 hover:text-teal transition-colors'
				>
					journey →
				</Link>
			</div>

			{ordered.length > 0 && (
				<div className='flex flex-col'>
					{ordered.map((m, i) => (
						<MilestoneRow key={m.key} m={m} isLast={i === ordered.length - 1} />
					))}
				</div>
			)}

			{hidden.length > 0 && (
				<>
					<button
						onClick={() => setShowPostLaunch(!showPostLaunch)}
						className='flex items-center gap-1.5 font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors pt-3'
					>
						<TbChevronDown
							className={`text-xs transition-transform duration-200 ${showPostLaunch ? 'rotate-180' : ''}`}
						/>
						{showPostLaunch
							? 'Hide post-launch steps'
							: `${hidden.length} post-launch step${hidden.length === 1 ? '' : 's'}`}
					</button>

					{showPostLaunch && (
						<div className='flex flex-col mt-2 pt-2 border-t border-white/[0.06]'>
							{hidden.map((m, i) => (
								<MilestoneRow key={m.key} m={m} isLast={i === hidden.length - 1} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}