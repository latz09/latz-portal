'use client';

import { useState } from 'react';
import { TbChevronDown, TbStarFilled } from 'react-icons/tb';
import Card from '../ui/Card';
import { getDeadlineStatus } from '../portal/deadlineUtils';

function getNextMilestone(client) {
	let next = null;

	const consider = (item, isMilestone) => {
		const status = getDeadlineStatus(item.date);
		if (!(status.isPast || status.isUpcoming)) return;
		// Reuse the already-safely-parsed local date from getDeadlineStatus
		// instead of re-parsing the raw string with `new Date(d.date)` —
		// that constructor treats "YYYY-MM-DD" as UTC midnight, which
		// shifts a full day earlier once converted back to local time.
		if (!next || status.date < next.date) {
			next = { ...item, date: status.date, isMilestone };
		}
	};

	client.projects?.forEach((project) => {
		project.deadlines?.forEach((d) => {
			if (d.completed) return;
			consider(d, false);
		});
		// journey milestones — skip waiting ones; they're delivered and sitting
		// with the client, so they surface on their own line, not as a due date.
		project.journeyMilestones?.forEach((m) => {
			if (m.status === 'waiting') return;
			consider(m, true);
		});
	});

	return next;
}

// Milestones parked in "waiting" across a client's projects — delivered,
// awaiting the client. Surfaced as a small line rather than a fake due date.
function getWaitingMilestones(client) {
	const waiting = [];
	client.projects?.forEach((project) => {
		project.journeyMilestones?.forEach((m) => {
			if (m.status === 'waiting') {
				waiting.push({ title: m.title, waitingOn: m.waitingOn || null });
			}
		});
	});
	return waiting;
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
	const next = getNextMilestone(client);
	const nextDate = next?.date ?? null;
	const waiting = getWaitingMilestones(client);

	return (
		<Card
			href={`/clients/${client.slug}`}
			className='flex flex-col gap-1 h-full'
		>
			{next && (
				<div className='flex items-center gap-3 pb-3 mb-2 border-b border-white/10'>
					<div className='flex flex-col items-center justify-center leading-none shrink-0 w-10 h-10 rounded bg-warning/10 border border-warning/20'>
						<span className='font-mono text-[9px] text-warning uppercase tracking-wide'>
							{nextDate.toLocaleDateString('en-US', { month: 'short' })}
						</span>
						<span className='font-mono text-base font-semibold text-white mt-0.5'>
							{nextDate.getDate()}
						</span>
					</div>
					<span className='font-mono text-xs lg:text-sm text-white/60 line-clamp-2 flex items-center gap-1.5'>
						{next.isMilestone && (
							<TbStarFilled className='text-warning text-[11px] shrink-0' />
						)}
						{next.title}
					</span>
				</div>
			)}

			{waiting.length > 0 && (
				<div className='flex items-center gap-1.5 font-mono text-[11px] text-warning/70 mb-2 min-w-0'>
					<span className='shrink-0'>⏳</span>
					<span className='truncate'>
						{waiting[0].title}
						{waiting[0].waitingOn ? ` · waiting on ${waiting[0].waitingOn}` : ' · waiting'}
						{waiting.length > 1 && (
							<span className='text-white/30'> +{waiting.length - 1}</span>
						)}
					</span>
				</div>
			)}

			<h3 className='font-medium text-lg text-white'>{client.name}</h3>
			<span className='font-mono text-sm text-teal'>
				{client.activeProjects} active · {client.totalProjects} total
			</span>
		</Card>
	);
}

function CollapsibleSection({ label, clients, defaultOpen = false }) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center ml-3 justify-start lg:justify-center gap-2 w-full mb-3 group'
			>
				<span className='font-mono text-xs text-warning tracking-widest uppercase'>
					{label}
				</span>
				<span className='font-mono text-sm text-white/40'>
					{clients.length}
				</span>
				<TbChevronDown
					className={`text-white transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>
			{open && (
				<div className='flex flex-col gap-3'>
					{clients.map((client) => (
						<ClientCard key={client.slug} client={client} />
					))}
				</div>
			)}
		</div>
	);
}

function StatusTabs({ onHold, leads, onIce }) {
	const [activeTab, setActiveTab] = useState(null);

	if (!onHold.length && !leads.length && !onIce.length) return null;

	const tabs = [];
	if (onHold.length)
		tabs.push({ key: 'onHold', label: 'On Hold', clients: onHold });
	if (leads.length) tabs.push({ key: 'leads', label: 'Leads', clients: leads });
	if (onIce.length)
		tabs.push({ key: 'onIce', label: 'Lost', clients: onIce });

	const activeClients = tabs.find((t) => t.key === activeTab)?.clients || [];

	return (
		<div>
			<div className='flex items-center justify-evenly'>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(activeTab === tab.key ? null : tab.key)}
						className={`font-mono text-xs tracking-widest uppercase px-4 py-2 rounded-t transition-colors ${
							activeTab === tab.key
								? 'bg-white/5 text-warning border border-white/10 border-b-0'
								: 'text-white/70 hover:text-white/60 border border-warning/10'
						}`}
					>
						{tab.label}
						<span className='ml-2 text-sm'>{tab.clients.length}</span>
					</button>
				))}
			</div>

			{activeTab && (
				<div className='flex flex-col gap-3 bg-white/5 border border-white/10 rounded-b rounded-tr p-4 mt-2'>
					{activeClients.map((client) => (
						<ClientCard key={client.slug} client={client} />
					))}
				</div>
			)}
		</div>
	);
}

function ViewDropdown({ groups, current, onSelect }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='relative mb-4'>
		<button
				onClick={() => setOpen((o) => !o)}
				className='flex items-center justify-between w-1/3  md:w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-5 py-3 group transition-colors'
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
	const current =
		groups.find((g) => g.key === view) || groups[0] || null;

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