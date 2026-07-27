// DASHBOARD DEADLINES + JOURNEY MILESTONES

import Link from 'next/link';
import { TbArrowRight, TbStarFilled } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';
import { PHASE_LABELS } from '@/app/utils/journeyHelpers';

function DaysBadge({ isPast, isToday, daysUntil }) {
	if (isToday) {
		return (
			<div className='text-right shrink-0'>
				<p className='text-lg font-semibold leading-none text-warning'>Today</p>
			</div>
		);
	}

	const tone = isPast ? 'text-danger' : 'text-white/70';
	const n = Math.abs(daysUntil);

	return (
		<div className='text-right shrink-0'>
			<p className={`text-xl font-semibold leading-none tabular-nums ${tone}`}>
				{n}
			</p>
			<p
				className={`font-mono text-[10px] mt-1 ${isPast ? 'text-danger/70' : 'text-white/30'}`}
			>
				{isPast ? (n === 1 ? 'day ago' : 'days ago') : n === 1 ? 'day' : 'days'}
			</p>
		</div>
	);
}

export default function UpcomingDeadlines({ clients, variant = 'designer' }) {
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
						waiting: m.status === 'waiting',
						waitingOn: m.waitingOn || null,
						description: PHASE_LABELS[m.phase] || m.phase,
					});
				}
			});
		});
	});

	items.sort((a, b) => a.date - b.date);

	if (!items.length) return null;

	return (
		<div className='mt-12 pt-8 border-t border-white/[0.08] w-full'>
			<p className='font-mono text-[10px] lg:text-xs tracking-widest uppercase text-white/40 mb-4'>
				{variant === 'designer'
					? 'Upcoming design milestones'
					: 'All upcoming milestones'}
			</p>

			<div className='flex flex-col gap-3'>
		{items.map((d, i) => {
					const isDesigner =
						variant === 'designer' || d.audience?.includes('designer');

					const surface = d.isMilestone
						? 'bg-white/[0.03] border-warning/25 hover:bg-white/[0.06]'
						: d.isPast
							? 'bg-white/[0.03] border-danger/20 hover:bg-white/[0.06]'
							: 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]';

					const href =
						variant === 'internal'
							? d.isMilestone
								? `/clients/${d.clientSlug}/${d.projectSlug}/journey`
								: `/clients/${d.clientSlug}/${d.projectSlug}`
							: `/portal/designer/${d.clientSlug}/${d.projectSlug}`;

					return (
						<Link
							key={`${d._key}-${i}`}
							href={href}
							className={`group flex flex-col border rounded-xl px-5 py-4 gap-3 transition-all ${surface} ${
								d.waiting ? 'opacity-70 scale-[0.99] origin-left hover:opacity-100 hover:scale-100' : ''
							}`}
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='flex flex-col gap-1.5 min-w-0'>
									<span className='font-mono text-[11px] text-white/35 truncate'>
										{d.clientName}
										<span className='text-white/20'> · </span>
										{d.projectName}
									</span>

									<span className='text-base font-medium text-white leading-tight flex items-center gap-2'>
										{d.isMilestone && (
											<TbStarFilled className='text-warning text-xs shrink-0' />
										)}
										{d.title}
									</span>

									{d.waiting ? (
										<span className='font-mono text-[11px] text-warning/80'>
											Waiting{d.waitingOn ? ` on ${d.waitingOn}` : ''} since {formatDate(d.date)}
										</span>
									) : (
										d.description && (
											<span className='text-sm text-white/50 line-clamp-2'>
												{d.description}
											</span>
										)
									)}
								</div>

								{d.waiting ? (
									<span className='font-mono text-[11px] text-warning/70 shrink-0 pt-1'>
										Delivered
									</span>
								) : (
									<DaysBadge
										isPast={d.isPast}
										isToday={d.isToday}
										daysUntil={d.daysUntil}
									/>
								)}
							</div>

							<div className='flex items-center justify-between gap-3 pt-2.5 border-t border-white/[0.06]'>
								<span className='font-mono text-[11px] text-white/35'>
									{formatDate(d.date)}
									{d.isMilestone && (
										<span className='text-warning/50 ml-2'>milestone</span>
									)}
								</span>
								<span
									className={`font-mono text-[11px] flex items-center gap-1 transition-colors ${
										isDesigner
											? 'text-purple/60 group-hover:text-purple'
											: 'text-white/35 group-hover:text-teal'
									}`}
								>
									{d.isMilestone ? 'view journey' : 'view project'}
									<TbArrowRight size={12} />
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}