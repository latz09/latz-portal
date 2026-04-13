'use client';

import { useState } from 'react';
import { TbChevronDown, TbCheck, TbExternalLink } from 'react-icons/tb';
import { getDeadlineStatus, formatDate, DaysIndicator } from './deadlineUtils';

function CompletedDeadlines({ deadlines, variant, clientId, projectKey }) {
	const [open, setOpen] = useState(false);
	if (!deadlines.length) return null;

	return (
		<div className='mt-4 border-t border-white/10 pt-6'>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center justify-between w-full mb-3 group'
			>
				<div className='flex items-center gap-3'>
					<p className='font-mono text-xs tracking-widest uppercase text-white/50'>
						Completed
					</p>
					<span className='font-mono text-xs bg-black text-white/60 border border-white/10 rounded-full px-2 py-0.5'>
						{deadlines.length}
					</span>
				</div>
				<TbChevronDown
					className={`text-warning group-hover:text-white/40 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='flex flex-col gap-3'>
					{deadlines.map((d, i) => (
						<div
							key={i}
							className='flex items-start justify-between border border-white/10 bg-white/0 hover:bg-white/10 rounded px-6 py-4 gap-6 ml4 scale-95 group transition-colors'
						>
							<div className='flex flex-col gap-1'>
								<span className='font-medium text-lg text-white/70 group-hover:text-white line-through decoration-warning/70 group-hover:no-underline transition-colors'>
									{d.title}
								</span>
								{d.description && (
									<span className='text-sm text-white/50 group-hover:text-white/70 mt-0.5 transition-colors'>
										{d.description}
									</span>
								)}
								<span className='font-mono text-xs text-white/30 group-hover:text-white/50 mt-1 transition-colors'>
									Due {formatDate(getDeadlineStatus(d.date).date)}
								</span>
								{d.completedAt && (
									<span className='flex items-center gap-1 font-mono text-xs text-white/40 group-hover:text-warning mt-0.5 transition-colors'>
										<TbCheck className='text-teal' />
										Completed{' '}
										{formatDate(getDeadlineStatus(d.completedAt).date)}
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function DeadlineList({
	deadlines,
	variant = 'internal',
	clientId,
	projectKey,
}) {
	if (!deadlines?.length) return null;

	const accentColor = variant === 'designer' ? 'text-purple' : 'text-teal';

	const active = deadlines.filter((d) => !d.completed);
	const completed = deadlines.filter((d) => d.completed);

	return (
		<div className='mt-12'>
			<p className='font-mono text-xs lg:text-base tracking-widest uppercase mb-4 text-warning'>
				Upcoming milestones
			</p>
			<div className='flex flex-col gap-3'>
				{active.map((d, i) => {
					const { isPast, isToday, daysUntil, date } = getDeadlineStatus(
						d.date,
					);
					const studioUrl =
						variant === 'internal' && clientId
							? `https://latz-portal.sanity.studio/structure/client;${clientId}`
							: null;

					return (
						<div
							key={i}
							className={`flex items-start justify-between border rounded px-6 py-4 gap-6 ${
								variant === 'designer'
									? 'border-purple/60 bg-purple/10'
									: d.audience?.includes('designer')
										? 'border-purple/60 bg-purple/10'
										: 'border-teal/60 bg-teal/10'
							}`}
						>
							<div className='flex flex-col gap-1'>
								<span className='font-medium text-lg'>{d.title}</span>
								{d.description && (
									<span className='text-sm text-white/70 mt-0.5'>
										{d.description}
									</span>
								)}
								<span className='font-mono text-xs text-white/30 mt-1 lg:mt-2'>
									{formatDate(date)}
								</span>
								{studioUrl && (
									<a
										href={studioUrl}
										target='_blank'
										rel='noopener noreferrer'
										className='flex items-center gap-1 font-mono text-xs text-white/30 hover:text-warning transition-colors mt-1 w-fit'
									>
										<TbExternalLink className='text-sm' />
										mark complete in studio
									</a>
								)}
							</div>
							<DaysIndicator
								isPast={isPast}
								isToday={isToday}
								daysUntil={daysUntil}
								accentColor={accentColor}
							/>
						</div>
					);
				})}
			</div>

			<CompletedDeadlines
				deadlines={completed}
				variant={variant}
				clientId={clientId}
				projectKey={projectKey}
			/>
		</div>
	);
}
