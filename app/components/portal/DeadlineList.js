import Link from 'next/link'
import { getDeadlineStatus, formatDate, DaysIndicator } from './deadlineUtils'

export default function DeadlineList({ deadlines, variant = 'internal' }) {
	if (!deadlines?.length) return null

	const accentColor = variant === 'designer' ? 'text-purple' : 'text-teal'

	return (
		<div className='mt-12'>
			<p className='font-mono text-xs lg:text-base tracking-widest uppercase mb-4 text-warning'>
				Upcoming milestones
			</p>
			<div className='flex flex-col gap-3'>
				{deadlines.map((d, i) => {
					const { isPast, isToday, daysUntil, date } = getDeadlineStatus(d.date)
					return (
						<div
							key={i}
							className='flex items-start justify-between bg-white/5 border border-white/10 rounded px-6 py-4 gap-6'
						>
							<div className='flex flex-col gap-1'>
								<span className='font-medium text-lg'>{d.title}</span>
								{d.description && (
									<span className='text-sm text-white/70 mt-0.5'>
										{d.description}
									</span>
								)}
								<span className='font-mono text-xs text-white/30 mt-1'>
									{formatDate(date)}
								</span>
							</div>
							<DaysIndicator
								isPast={isPast}
								isToday={isToday}
								daysUntil={daysUntil}
								accentColor={accentColor}
							/>
						</div>
					)
				})}
			</div>
		</div>
	)
}