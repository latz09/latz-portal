import Link from 'next/link';
import { TbStarFilled } from 'react-icons/tb';
import { getDeadlineStatus, formatDate } from './deadlineUtils';

// The order milestones run in — used to sort undated (TBD) ones sensibly.
const MILESTONE_ORDER = [
	'Proposal',
	'Design Sync',
	'Design Direction',
	'Full Design',
	'Launch / Domain Connect',
	'Review Request',
];

function orderIndex(title) {
	const i = MILESTONE_ORDER.indexOf(title);
	return i === -1 ? 99 : i;
}

// "in 2 days" / "in 1 day" / "today" / "3 days ago"
function countdown(computed) {
	if (computed.isToday) return 'today';
	const n = Math.abs(computed.daysUntil);
	const unit = n === 1 ? 'day' : 'days';
	return computed.isPast ? `${n} ${unit} ago` : `in ${n} ${unit}`;
}

export default function ProjectMilestones({ journeySteps, clientSlug, projectSlug }) {
	const milestones = (journeySteps || [])
		.filter((s) => s.generators?.[0]?.isMilestone && s.status !== 'done')
		.map((s) => {
			const g = s.generators[0];
			return {
				key: s._key,
				title: g.title,
				date: s.dueDate || null,
				waiting: s.status === 'waiting',
				waitingOn: s.waitingOn || null,
				enteredWaitingAt: s.enteredWaitingAt || null,
				computed: s.dueDate ? getDeadlineStatus(s.dueDate) : null,
			};
		});

	if (!milestones.length) return null;

	// dated first (by date), then TBD ones in sequence order
	const dated = milestones
		.filter((m) => m.date)
		.sort((a, b) => a.computed.date - b.computed.date);
	const tbd = milestones
		.filter((m) => !m.date)
		.sort((a, b) => orderIndex(a.title) - orderIndex(b.title));
	const ordered = [...dated, ...tbd];

	const href = `/clients/${clientSlug}/${projectSlug}/journey`;

	return (
		<div >
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

			<div className='flex flex-col'>
				{ordered.map((m, i) => {
					const isLast = i === ordered.length - 1;
					return (
						<div
							key={m.key}
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
				})}
			</div>
		</div>
	);
}