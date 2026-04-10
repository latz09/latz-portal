import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import { getDeadlineStatus, formatDate, DaysIndicator } from './deadlineUtils';

export default function UpcomingDeadlines({ clients, variant = 'designer' }) {
	const accentColor = variant === 'designer' ? 'text-purple' : 'text-teal';

	const deadlines = [];
	clients.forEach((client) => {
		client.projects.forEach((project) => {
			project.deadlines?.forEach((d) => {
				const status = getDeadlineStatus(d.date);
				if (status.isPast || status.isUpcoming) {
					deadlines.push({
						...d,
						clientName: client.name,
						clientSlug: client.slug,
						projectName: project.name,
						projectSlug: project.slug,
						...status,
					});
				}
			});
		});
	});

	deadlines.sort((a, b) => a.date - b.date);

	if (!deadlines.length) return null;

	return (
		<div className='inline-flex flex-col mt-16 pt-8 border-t border-white/10 w-full'>
			<p className='font-mono text-sm lg:text-base text-teal/70 tracking-widest uppercase mb-4'>
				Upcoming milestones
			</p>
			<div className='flex flex-col gap-3 lg:pl-4'>
				{deadlines.map((d, i) => (
					<Link
						key={i}
						href={
							variant === 'internal'
								? `/clients/${d.clientSlug}/${d.projectSlug}`
								: `/portal/designer/${d.clientSlug}/${d.projectSlug}`
						}
						className='group flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded px-6 py-4 gap-4 transition-colors'
					>
						<div className='flex items-start justify-between gap-6'>
							<div className='flex flex-col gap-1'>
								<span className={`font-mono text-sm ${accentColor}`}>
									{d.clientName} · {d.projectName}
								</span>
								<span className='font-medium text-lg mt-2'>{d.title}</span>
								{d.description && (
									<span className='text-sm text-white/70 mt-0.5 line-clamp-2 '>
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
							<span className={`font-mono text-xs ${accentColor}`}>
								{formatDate(d.date)}
							</span>
							<span
								className={`font-mono text-xs lg:text-base flex items-center gap-1 text-teal opacity-80 group-hover:opacity-100 transition-opacity`}
							>
								view project <TbArrowRight size={12} />
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}