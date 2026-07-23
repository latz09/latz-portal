// DASHBOARD DEADLINES + JOURNEY MILESTONES

import Link from 'next/link';
import { TbArrowRight, TbStarFilled } from 'react-icons/tb';
import { getDeadlineStatus, formatDate, DaysIndicator } from './deadlineUtils';
import { PHASE_LABELS } from '@/app/utils/journeyHelpers';
import { ACCENTS, accentForVariant } from '@/app/utils/variantColors';

export default function UpcomingDeadlines({ clients, variant = 'designer' }) {
	const accent = accentForVariant(variant);
	const accentColor = accent.text;

	const items = [];
	clients?.forEach((client) => {
		client.projects?.forEach((project) => {
			const base = {
				clientName: client.name,
				clientSlug: client.slug,
				projectName: project.name,
				projectSlug: project.slug,
			};

			// free-floating deadlines
			project.deadlines?.forEach((d) => {
				const status = getDeadlineStatus(d.date);
				if (!d.completed && (status.isPast || status.isUpcoming)) {
					items.push({ ...d, ...base, ...status, isMilestone: false });
				}
			});

			// journey milestones (already filtered in the query)
			project.journeyMilestones?.forEach((m) => {
				const status = getDeadlineStatus(m.date);
				if (status.isPast || status.isUpcoming) {
					items.push({
						...m,
						...base,
						...status,
						isMilestone: true,
						description: PHASE_LABELS[m.phase] || m.phase,
					});
				}
			});
		});
	});

	items.sort((a, b) => a.date - b.date);

	if (!items.length) return null;

	return (
		<div className='inline-flex flex-col mt-16 pt-8 border-t border-white/10 w-full'>
			<p
				className={` ${accentColor} font-mono text-sm lg:text-base tracking-widest uppercase mb-4`}
			>
				{variant === 'designer'
					? 'Upcoming design milestones'
					: 'All upcoming milestones'}
			</p>
			<div className='flex flex-col gap-5 lg:pl-4'>
				{items.map((d, i) => {
					const ring = d.isMilestone
						? 'border-warning/30 hover:border-warning/50'
						: variant === 'designer' || d.audience?.includes('designer')
							? ACCENTS.purple.ring
							: ACCENTS.teal.ring;

					return (
						<Link
							key={`${d._key}-${i}`}
							href={
								variant === 'internal'
									? d.isMilestone
										? `/clients/${d.clientSlug}/${d.projectSlug}/journey`
										: `/clients/${d.clientSlug}/${d.projectSlug}`
									: `/portal/designer/${d.clientSlug}/${d.projectSlug}`
							}
							className={`group flex flex-col border rounded px-6 py-4 gap-4 transition-colors ${ring}`}
						>
							<div className='flex items-start justify-between gap-6'>
								<div className='flex flex-col gap-1'>
									<span className={`font-mono text-sm text-white/70 `}>
										<span className='text-base lg:text-lg text-white/80 '>
											{' '}
											{d.clientName}
										</span>{' '}
										· {d.projectName}
									</span>
									<span className='font-medium text-lg mt-2 flex items-center gap-2'>
										{d.isMilestone && (
											<TbStarFilled className='text-warning text-sm shrink-0' />
										)}
										{d.title}
									</span>
									{d.description && (
										<span className='text-sm text-white/70 mt-0.5 lg:mt-1 line-clamp-2 '>
											{d.description}
										</span>
									)}
								</div>
								<DaysIndicator
									isPast={d.isPast}
									isToday={d.isToday}
									daysUntil={d.daysUntil}
									accentColor={accentColor}
								/>
							</div>
							<div className='flex items-center justify-between mt-8'>
								<span
									className={`font-mono text-xs ${d.isMilestone ? 'text-warning' : accentColor}`}
								>
									{formatDate(d.date)}
									{d.isMilestone && <span className='text-white/30 ml-2'>milestone</span>}
								</span>
								<span
									className={`font-mono text-xs lg:text-base flex items-center gap-1 text-teal opacity-80 group-hover:opacity-100 transition-opacity`}
								>
									{d.isMilestone ? 'view journey' : 'view project'} <TbArrowRight size={12} />
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}