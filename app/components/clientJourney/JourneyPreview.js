'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TbArrowRight, TbChevronDown, TbPlus } from 'react-icons/tb';
import {
	JOURNEY_STATUS_LABELS,
	statusPillClass,
} from '@/app/utils/journeyStatusConfig';
import {
	PHASE_LABELS,
	summarizeJourney,
	dateLabel,
	stepTitle,
} from '@/app/utils/journeyHelpers';
import JourneyMap from '@/app/components/clientJourney/JourneyMap';
import AddStepForm from '@/app/components/clientJourney/AddStepForm';

export default function JourneyPreview({
	journeySteps,
	clientPayment,
	clientSlug,
	projectSlug,
	projectId,
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [addStepOpen, setAddStepOpen] = useState(false);
	const summary = summarizeJourney(journeySteps, clientPayment);
	if (!summary) return null;

	const { doneCount, total, currentPhase, active, nextUp, allDone } = summary;
	const pct = total ? Math.round((doneCount / total) * 100) : 0;
	const href = `/clients/${clientSlug}/${projectSlug}/journey`;

	const handleStepAdded = () => {
		setAddStepOpen(false);
		router.refresh();
	};

	return (
		<div className='min-w-0'>
			<div className='flex items-center justify-between gap-3 mb-4'>
				<p className='font-mono text-xs lg:text-base text-white/60 tracking-widest uppercase'>
					Journey Map
				</p>
				<Link
					href={href}
					className='flex items-center gap-1 font-mono text-xs text-teal hover:text-white transition-colors shrink-0'
				>
					Open full page <TbArrowRight />
				</Link>
			</div>

			<button
				type='button'
				onClick={() => setOpen(!open)}
				className='block w-full text-left bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl p-5 transition-colors'
			>
				<div className='flex items-center justify-between gap-4 mb-4'>
					<div className='flex flex-col gap-1 min-w-0'>
						<span className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
							{allDone ? 'Complete' : 'Current Phase'}
						</span>
						<span className='font-medium text-base leading-tight truncate'>
							{allDone
								? 'All steps done'
								: PHASE_LABELS[currentPhase] || currentPhase || '—'}
						</span>
					</div>
					<div className='flex items-center gap-3 shrink-0'>
						<div className='flex flex-col items-end'>
							<span className='font-mono text-sm text-white/80 tabular-nums'>
								{doneCount}
								<span className='text-white/30'>/{total}</span>
							</span>
							<span className='font-mono text-[10px] tracking-widest uppercase text-white/30'>
								done
							</span>
						</div>
						<TbChevronDown
							className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
						/>
					</div>
				</div>

				<div className='h-1 rounded-full bg-white/10 overflow-hidden mb-4'>
					<div
						className='h-full bg-teal rounded-full'
						style={{ width: `${pct}%` }}
					/>
				</div>

				{active.length > 0 && (
					<div className='flex flex-col gap-2 mb-3'>
						{active.map(({ step, status, date, money }) => {
							const dLabel = dateLabel(status, date, money);
							return (
								<div
									key={step._key}
									className='flex items-center justify-between gap-3'
								>
									<span className='text-sm text-white/80 truncate'>
										{stepTitle(step)}
									</span>
									<span className='flex flex-col items-end shrink-0'>
										<span
											className={`font-mono text-xs uppercase tracking-wide ${statusPillClass(status, false)}`}
										>
											{JOURNEY_STATUS_LABELS[status] || status}
										</span>
										{dLabel && (
											<span className='font-mono text-[10px] text-white/30'>
												{dLabel}
											</span>
										)}
									</span>
								</div>
							);
						})}
					</div>
				)}

				{!allDone && nextUp && (
					<div className='flex items-center gap-2 pt-3 border-t border-white/10'>
						<span className='font-mono text-[10px] tracking-widest uppercase text-white/30 shrink-0'>
							Next
						</span>
						<span className='text-sm text-white/60 truncate'>
							{stepTitle(nextUp.step)}
						</span>
					</div>
				)}

				<div className='flex items-center gap-1 pt-3 mt-3 border-t border-white/10 font-mono text-[10px] tracking-widest uppercase text-white/30'>
					{open ? 'Hide full journey' : 'Show full journey'}
				</div>
			</button>

			{open && (
				<div className='mt-4 border border-white/[0.08] rounded-xl p-5 overflow-x-auto'>
					<div className='flex items-center justify-between mb-6 min-w-[280px] gap-3'>
						<span className='font-mono text-xs tracking-widest uppercase text-white/40'>
							Overall progress
						</span>
						<div className='flex items-center gap-3'>
							<span className='font-mono text-xs text-white/60 tabular-nums'>
								{doneCount}
								<span className='text-white/30'>/{total}</span>
								<span className='text-teal ml-2'>{pct}%</span>
							</span>
							<button
								type='button'
								onClick={(e) => {
									e.stopPropagation();
									setAddStepOpen(true);
								}}
								className='flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors shrink-0'
							>
								<TbPlus size={12} />
								Add Step
							</button>
						</div>
					</div>
					<JourneyMap
						journeySteps={journeySteps}
						clientPayment={clientPayment}
						projectId={projectId}
					/>
				</div>
			)}

			{addStepOpen && (
				<AddStepForm
					projectId={projectId}
					onClose={() => setAddStepOpen(false)}
					onAdded={handleStepAdded}
				/>
			)}
		</div>
	);
}