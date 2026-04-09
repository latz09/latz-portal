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
						projectName: project.name,
						...status,
					});
				}
			});
		});
	});

	deadlines.sort((a, b) => a.date - b.date);

	if (!deadlines.length) return null;

	return (
		<div className='inline-flex flex-col mt-12 pt-8 border-t border-white/10 w-full'>
			<p className='font-mono text-teal tracking-widest uppercase mb-4'>
				Upcoming Deadlines
			</p>
			<div className='flex flex-col gap-3 pl-2 lg:pl-4'>
				{deadlines.map((d, i) => (
					<div
						key={i}
						className='flex items-start justify-between bg-white/5 border border-white/10 rounded px-6 py-4 gap-6'
					>
						<div className='flex flex-col gap-1'>
							<span className='font-mono text-sm text-teal'>
								{d.clientName} · {d.projectName}
							</span>
							<span className='font-medium text-lg'>{d.title}</span>
							{d.description && (
								<span className='text-sm text-white/70 mt-0.5 line-clamp-2'>
									{d.description}
								</span>
							)}
							<span className='font-mono text-xs text-white/30 mt-1'>
								{formatDate(d.date)}
							</span>
						</div>
						<DaysIndicator
							isPast={d.isPast}
							isToday={d.isToday}
							daysUntil={d.daysUntil}
							accentColor={accentColor}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
