'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbChevronDown } from 'react-icons/tb';

function ClientCard({ client }) {
	return (
		<Link
			href={`/clients/${client.slug}`}
			className='w-full grid bg-white/5 gap-0.5 hover:bg-dark border border-white/10 rounded px-6 py-4 transition-colors'
		>
			<h3 className='font-medium text-lg text-white'>{client.name}</h3>
			<span className='font-mono text-sm text-teal'>
				{client.activeProjects} active · {client.totalProjects} total
			</span>
		</Link>
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

function StatusTabs({ onHold, potential }) {
	const [activeTab, setActiveTab] = useState(null);

	if (!onHold.length && !potential.length) return null;

	const tabs = [];
	if (onHold.length)
		tabs.push({ key: 'onHold', label: 'On Hold', clients: onHold });
	if (potential.length)
		tabs.push({ key: 'potential', label: 'Potential', clients: potential });

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
	const potential = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects > 0,
	);
	const complete = clients.filter(
		(c) =>
			c.activeProjects === 0 &&
			c.onHoldProjects === 0 &&
			c.potentialProjects === 0 &&
			c.completeProjects > 0,
	);

	return (
		<div className='flex flex-col lg:mb-12 max-w-3xl mx-auto'>
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
				<StatusTabs onHold={onHold} potential={potential} />

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
