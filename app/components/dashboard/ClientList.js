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
		<div className='mt-2 lg:mt-4'>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center justify-center gap-2 w-full mb-3 group'
			>
				<span className='font-mono text-xs text-warning tracking-widest uppercase'>
					{label}
				</span>
				<span className='font-mono text-xs text-white/20'>
					{clients.length}
				</span>
				<TbChevronDown
					className={`text-warning/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
		<div className='flex flex-col lg:mb-12 '>
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
			<div className="space-y-2">
			{onHold.length > 0 && (
				<CollapsibleSection
					label='On Hold'
					clients={onHold}
					defaultOpen={false}
				/>
			)}
			{potential.length > 0 && (
				<CollapsibleSection
					label='Potential'
					clients={potential}
					defaultOpen={false}
				/>
			)}
			{complete.length > 0 && (
				<CollapsibleSection
					label='Complete'
					clients={complete}
					defaultOpen={false}
				/>
			)}</div>
		</div>
	);
}
