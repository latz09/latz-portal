'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbChevronDown, TbExternalLink, TbStarFilled } from 'react-icons/tb';
import {
	PHASE_LABELS,
	summarizeJourney,
	stepTitle,
	resolveStep,
} from '@/app/utils/journeyHelpers';
import JourneyMap from './JourneyMap';

const STATUS_TINT = {
	active: 'text-teal',
	'on-hold': 'text-warning',
	potential: 'text-white/40',
};

const WAITING_ON_LABELS = {
	client: 'client',
	designer: 'designer',
	other: 'other',
};

function ageLabel(project) {
	const paid = project.clientPayment?.depositPaidDate;
	if (paid) {
		const start = new Date(paid);
		const weeks = Math.floor(
			(Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7),
		);
		if (weeks <= 0) return 'landed this week';
		return `${weeks} wk${weeks === 1 ? '' : 's'} in`;
	}
	if (project.month && project.year) {
		const d = new Date(project.year, project.month - 1);
		return `since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
	}
	return null;
}

function blockerLabel({ step }) {
	const title = stepTitle(step);
	const who = WAITING_ON_LABELS[step.waitingOn];
	return who ? `${title} (${who})` : title;
}

function isMilestoneStep(step) {
	return !!step.generators?.some((g) => g?.isMilestone);
}

function formatDue(dueDate) {
	return new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	});
}

// Nearest not-done milestone: soonest dated one wins; if none are dated,
// falls back to the earliest-in-sequence undated one as a TBD marker —
// same soonest-wins logic ProjectMilestones/nextDesignerDue use.
function nextMilestone(project) {
	const steps = project.journeySteps || [];
	const candidates = steps
		.filter(isMilestoneStep)
		.map((step) => ({
			step,
			status: resolveStep(step, project.clientPayment).status,
		}))
		.filter((m) => m.status !== 'done');

	if (!candidates.length) return null;

	const dated = candidates
		.filter((m) => m.step.dueDate)
		.sort((a, b) => new Date(a.step.dueDate) - new Date(b.step.dueDate));

	return dated[0] || candidates[0];
}

export default function JourneyRollupRow({ project }) {
	const [open, setOpen] = useState(false);
	const summary = summarizeJourney(project.journeySteps, project.clientPayment);
	if (!summary) return null;

	const { doneCount, total, currentPhase, nextUp, blockers, allDone } = summary;
	const pct = total ? Math.round((doneCount / total) * 100) : 0;
	const projectHref = `/clients/${project.clientSlug}/${project.slug}`;
	const age = ageLabel(project);
	const milestone = nextMilestone(project);

	return (
		<div className='bg-white/[0.0175] border border-white/[0.08] rounded-xl transition-colors overflow-hidden'>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				className='block w-full text-left hover:bg-white/[0.06] px-4 lg:px-6 py-4 transition-colors group'
			>
				{/* desktop: 3 aligned columns · mobile: stacked */}
				<div className='flex flex-col gap-3 lg:grid lg:grid-cols-[280px_1fr_140px] lg:items-center lg:gap-8'>
					{/* name + status */}
					<div className='flex items-start justify-between gap-3 min-w-0'>
						<div className='flex flex-col min-w-0'>
							<span className='font-medium text-sm lg:text-base leading-tight truncate'>
								{project.clientName}
							</span>
							<span className='font-mono text-xs text-white/40 truncate mt-0.5'>
								{project.name}
							</span>
						</div>
						{age && (
							<span
								className={`lg:hidden font-mono text-[11px] shrink-0 ${STATUS_TINT[project.status] || 'text-white/40'}`}
							>
								{age}
							</span>
						)}
					</div>

					{/* progress + phase/next + milestone + blockers */}
					<div className='flex flex-col gap-2 min-w-0'>
						<div className='flex items-center gap-3'>
							<span className='flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden'>
								<span
									className='block h-full bg-teal rounded-full'
									style={{ width: `${pct}%` }}
								/>
							</span>
							<span className='font-mono text-xs text-white/60 tabular-nums shrink-0'>
								{doneCount}/{total}
							</span>
						</div>

						<div className='flex items-center gap-2 font-mono text-[11px] min-w-0'>
							<span
								className={`uppercase tracking-wide shrink-0 ${allDone ? 'text-teal' : 'text-white/50'}`}
							>
								{allDone
									? 'Complete'
									: PHASE_LABELS[currentPhase] || currentPhase || '—'}
							</span>
							{!allDone && nextUp && (
								<span className='text-white/30 truncate'>
									→ {stepTitle(nextUp.step)}
								</span>
							)}
						</div>

						{milestone && (
							<div className='flex items-center gap-1.5 font-mono text-[11px] min-w-0'>
								<TbStarFilled className='text-warning text-[10px] shrink-0' />
								<span className='text-white/50 truncate'>
									{stepTitle(milestone.step)}
								</span>
								{milestone.step.dueDate ? (
									<span className='text-warning/60 shrink-0'>
										Due {formatDue(milestone.step.dueDate)}
									</span>
								) : (
									<span className='text-warning/30 shrink-0'>TBD</span>
								)}
							</div>
						)}

						{blockers?.length > 0 && (
							<div className='flex items-center gap-1.5 font-mono text-[11px] text-warning/70 min-w-0'>
								<span className='shrink-0'>⏳</span>
								<span className='truncate'>
									waiting on {blockers.map(blockerLabel).join(', ')}
								</span>
							</div>
						)}
					</div>

					{/* age (desktop) + chevron */}
					<div className='flex items-center justify-between lg:justify-end gap-4 shrink-0'>
						{age && (
							<span
								className={`hidden lg:block font-mono text-[11px] ${STATUS_TINT[project.status] || 'text-white/40'}`}
							>
								{age}
							</span>
						)}
						<TbChevronDown
							className={`text-white/25 group-hover:text-teal transition-all ml-auto lg:ml-0 ${
								open ? 'rotate-180' : ''
							}`}
						/>
					</div>
				</div>
			</button>

			{open && (
				<div className='border-t border-white/[0.08] bg-dark px-4 lg:px-6 py-5'>
					<div className='flex items-center justify-between mb-6'>
						<span className='font-mono text-xs tracking-widest uppercase text-white/40'>
							Overall progress
						</span>
						<div className='flex items-center gap-4'>
							<span className='font-mono text-xs text-white/60 tabular-nums'>
								{doneCount}
								<span className='text-white/30'>/{total}</span>
								<span className='text-teal ml-2'>{pct}%</span>
							</span>
							<Link
								href={projectHref}
								className='flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase text-teal hover:text-white transition-colors'
							>
								Open project <TbExternalLink />
							</Link>
						</div>
					</div>
					<JourneyMap
						journeySteps={project.journeySteps}
						clientPayment={project.clientPayment}
						projectId={project._id}
					/>
				</div>
			)}
		</div>
	);
}