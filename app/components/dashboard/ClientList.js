'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import Card from '../ui/Card';
import { getDeadlineStatus, formatDate } from '../portal/deadlineUtils';

function getNextMilestone(client) {
	let next = null;
	client.projects?.forEach((project) => {
		project.deadlines?.forEach((d) => {
			if (d.completed) return;
			const status = getDeadlineStatus(d.date);
			if (!(status.isPast || status.isUpcoming)) return;
			if (!next || new Date(d.date) < new Date(next.date)) next = d;
		});
	});
	return next;
}

function ClientCard({ client }) {
	const next = getNextMilestone(client);
	const nextDate = next ? new Date(next.date) : null;

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
					<span className='font-mono text-xs lg:text-sm text-white/60 line-clamp-2'>
						{next.title}
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
	if (leads.length)
		tabs.push({ key: 'leads', label: 'Leads', clients: leads });
	if (onIce.length)
		tabs.push({ key: 'onIce', label: 'On Ice', clients: onIce });

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

export default function ClientList({ clients }) {
	const active = clients.filter((c) => c.activeProjects > 0);
	const onHold = clients.filter(
		(c) => c.activeProjects === 0 && c.onHoldProjects > 0,
	);
	const leads = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects > 0,
	);
	const onIce = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects === 0 &&
			c.onIceProjects > 0,
	);
	const complete = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects === 0 &&
			c.onIceProjects === 0 &&
			c.completeProjects > 0,
	);

	return (
		<div className='flex flex-col'>
			{active.length > 0 && (
				<>
					<p className='font-mono text-xs text-white/40 tracking-widest uppercase mb-3'>
						Active
					</p>
					<div className='flex flex-col gap-3 mb-6'>
						{active.map((client) => (
							<ClientCard key={client.slug} client={client} />
						))}
					</div>
				</>
			)}

			<div className='space-y-4'>
				<StatusTabs onHold={onHold} leads={leads} onIce={onIce} />

				{complete.length > 0 && (
					<CollapsibleSection
						label='Complete'
						clients={complete}
						defaultOpen={false}
					/>
				)}
			</div>
		</div>
	);
}