import { TbStarFilled, TbCheck } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';
import { designerDueItems } from '@/app/utils/journeyHelpers';

export default function DesignerMilestones({ project }) {
	const items = designerDueItems(project);
	if (!items.length) return null;

	const withStatus = items.map((i) => ({
		...i,
		computed: i.date ? getDeadlineStatus(i.date) : null,
	}));

	// active first (dated by date, then TBD), completed sink to the bottom
	const active = withStatus.filter((i) => !i.done);
	const done = withStatus.filter((i) => i.done);

	const dated = active.filter((i) => i.date).sort((a, b) => a.computed.date - b.computed.date);
	const undated = active.filter((i) => !i.date);
	const ordered = [...dated, ...undated, ...done];

	return (
		<div className='mb-10'>
			<p className='font-mono text-[10px] lg:text-xs tracking-widest uppercase text-white/40 mb-4'>
				Design Milestones
			</p>

			<div className='flex flex-col'>
				{ordered.map((item, i) => {
					const overdue = item.computed?.isPast;

					return (
						<div
							key={item.key}
							className={`flex items-center justify-between gap-4 py-3 transition-all ${
								i !== ordered.length - 1 ? 'border-b border-white/[0.06]' : ''
							} ${item.waiting ? ' scale-[0.99] origin-left' : ''}`}
						>
						<span
								className={`flex items-center gap-2.5 text-sm min-w-0 ${
									item.done
										? 'text-white/30'
										: item.waiting
											? 'text-white/45'
											: 'text-white/85'
								}`}
							>
								{item.done ? (
									<TbCheck className='text-teal/60 text-sm shrink-0' />
								) : item.isMilestone ? (
									<TbStarFilled className='text-warning text-xs shrink-0' />
								) : (
									<span className='w-1 h-1 rounded-full bg-white/30 shrink-0' />
								)}
								<span className={`truncate ${item.done ? 'line-through decoration-white/20' : ''}`}>
									{item.title}
								</span>
							</span>

							<span
								className={`font-mono text-xs shrink-0 ${
									item.done
										? 'text-white/25'
										: item.waiting
											? 'text-warning/80'
											: !item.date
												? 'text-white/25'
												: overdue
													? 'text-danger'
													: 'text-white/60'
								}`}
							>
								{item.waiting
									? `Waiting${item.waitingOn ? ` · ${item.waitingOn}` : ''}`
									: item.date
										? formatDate(item.computed.date)
										: 'TBD'}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}