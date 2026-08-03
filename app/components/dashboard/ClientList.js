'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import Card from '../ui/Card';
import { getDeadlineStatus } from '../portal/deadlineUtils';
import { getClientHref } from '@/app/utils/clientLinks';

// Still used for sort order only — soonest-due project surfaces first,
// since that's the one most likely to be the next one you open. Focus Strip
// is where the actual date/waiting details live.
function getNextMilestone(client) {
	let next = null;

	const consider = (item) => {
		const status = getDeadlineStatus(item.date);
		if (!(status.isPast || status.isUpcoming)) return;
		if (!next || status.date < next.date) {
			next = { date: status.date };
		}
	};

	client.projects?.forEach((project) => {
		project.deadlines?.forEach((d) => {
			if (d.completed) return;
			consider(d);
		});
		project.journeyMilestones?.forEach((m) => {
			if (m.status === 'waiting') return;
			consider(m);
		});
	});

	return next;
}

// Soonest due date first. Clients with no upcoming milestone at all sink
// to the bottom of the group instead of breaking the sort.
function sortByNextMilestone(clients) {
	return [...clients].sort((a, b) => {
		const aNext = getNextMilestone(a);
		const bNext = getNextMilestone(b);
		if (!aNext && !bNext) return 0;
		if (!aNext) return 1;
		if (!bNext) return -1;
		return aNext.date - bNext.date;
	});
}

function ClientCard({ client }) {
	return (
		<Card href={getClientHref(client)} className='flex flex-col gap-1'>
			<h3 className='lg:font-medium lg:text-lg text-white'>{client.name}</h3>
			<span className='font-mono text-xs mt-0.5 lg:text-sm text-teal'>
				{client.activeProjects} active · {client.totalProjects} total
			</span>
		</Card>
	);
}

function ViewDropdown({ groups, current, onSelect }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='relative mb-4'>
			<button
				onClick={() => setOpen((o) => !o)}
				className='flex items-center justify-between w-1/2  md:w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-5 py-3 group transition-colors'
			>
				<span className='flex items-center gap-2'>
					<span className='font-mono text-xs text-white/70 tracking-widest uppercase group-hover:text-white/90 transition-colors'>
						{current.label}
					</span>
					<span className='font-mono text-xs text-white/30'>
						{current.clients.length}
					</span>
				</span>
				<TbChevronDown
					className={`text-white/40 group-hover:text-white/70 transition-all ${
						open ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{open && (
				<>
					<div className='fixed inset-0 z-10' onClick={() => setOpen(false)} />
					<div className='absolute left-0 top-full mt-2 z-20 flex flex-col gap-0.5 p-1.5 rounded-xl border border-white/10 bg-[#12151c] shadow-xl min-w-full'>
						{groups.map((g) => {
							const isCurrent = g.key === current.key;
							return (
								<button
									key={g.key}
									onClick={() => {
										onSelect(g.key);
										setOpen(false);
									}}
									className={`flex items-center justify-between gap-4 px-3 py-4 md:py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-colors ${
										isCurrent
											? 'bg-white/5 text-teal'
											: 'text-white/50 hover:bg-white/5 hover:text-white/80'
									}`}
								>
									<span>{g.label}</span>
									<span className='text-white/25'>{g.clients.length}</span>
								</button>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}

export default function ClientList({ clients }) {
	const [view, setView] = useState('active');

	const active = sortByNextMilestone(
		clients.filter((c) => c.activeProjects > 0),
	);
	const onHold = sortByNextMilestone(
		clients.filter((c) => c.activeProjects === 0 && c.onHoldProjects > 0),
	);
	const leads = sortByNextMilestone(
		clients.filter(
			(c) =>
				c.activeProjects === 0 &&
				c.onHoldProjects === 0 &&
				c.potentialProjects > 0,
		),
	);
	const onIce = sortByNextMilestone(
		clients.filter(
			(c) =>
				c.activeProjects === 0 &&
				c.onHoldProjects === 0 &&
				c.potentialProjects === 0 &&
				c.onIceProjects > 0,
		),
	);
	const complete = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects === 0 &&
			c.onIceProjects === 0 &&
			c.completeProjects > 0,
	);

	// only groups with clients become options; Active always first
	const groups = [
		{ key: 'active', label: 'Active', clients: active },
		{ key: 'onHold', label: 'On Hold', clients: onHold },
		{ key: 'leads', label: 'Leads', clients: leads },
		{ key: 'onIce', label: 'Lost', clients: onIce },
		{ key: 'complete', label: 'Complete', clients: complete },
	].filter((g) => g.clients.length > 0);

	// if the selected group emptied out, fall back to the first available
	const current = groups.find((g) => g.key === view) || groups[0] || null;

	if (!current) return null;

	return (
		<div className='flex flex-col'>
			<ViewDropdown groups={groups} current={current} onSelect={setView} />

			<div className='flex flex-col gap-3'>
				{current.clients.map((client) => (
					<ClientCard key={client.slug} client={client} />
				))}
			</div>
		</div>
	);
}