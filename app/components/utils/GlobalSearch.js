'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TbSearch, TbX } from 'react-icons/tb';

export default function GlobalSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [clients, setClients] = useState([]);
	const [selected, setSelected] = useState(0);
	const router = useRouter();

	// Fetch + reset on open/close
	useEffect(() => {
		if (!open) {
			setQuery('');
			setSelected(0);
			return;
		}
		if (clients.length) return;
		fetch('/api/clients')
			.then((res) => res.json())
			.then((data) => setClients(data));
	}, [open, clients.length]);

	// Cmd+K shortcut
	useEffect(() => {
		const handler = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
			if (e.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	const filtered = clients.filter((c) =>
		c.name.toLowerCase().includes(query.toLowerCase()),
	);

	const sorted = [
		...filtered.filter((c) => c.activeProjects > 0),
		...filtered.filter((c) => c.activeProjects === 0),
	];

	// Keyboard navigation
	useEffect(() => {
		if (!open) return;
		const handler = (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setSelected((s) => Math.min(s + 1, sorted.length - 1));
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				setSelected((s) => Math.max(s - 1, 0));
			}
			if (e.key === 'Enter' && sorted[selected]) {
				router.push(`/clients/${sorted[selected].slug}`);
				setOpen(false);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open, sorted, selected, router]);

	return (
		<>
			{/* Trigger button */}
			<button
				onClick={() => setOpen(true)}
				className='fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-dark border border-white/10 text-white/40 hover:text-teal hover:border-teal transition-colors shadow-lg'
			>
				<TbSearch className='text-xl' />
			</button>

			{/* Drawer overlay */}
			{open && (
				<div className='fixed inset-0 z-50 flex'>
					{/* Backdrop */}
					<div
						className='flex-1 bg-black/60 backdrop-blur-sm'
						onClick={() => setOpen(false)}
					/>

					{/* Drawer */}
					<div className='w-full max-w-md h-full bg-dark border-l border-white/10 flex flex-col shadow-2xl animate-slide-in'>
						{/* Search input */}
						<div className='flex items-center gap-3 px-4 py-4 border-b border-white/10'>
							<TbSearch className='text-white/30 text-lg shrink-0' />
							<input
								autoFocus
								type='text'
								placeholder='Search clients...'
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSelected(0);
								}}
								className='flex-1 bg-transparent text-white placeholder-white/20 font-mono text-sm outline-none'
							/>
							<button
								onClick={() => setOpen(false)}
								className='text-white/20 hover:text-white transition-colors'
							>
								<TbX className='text-lg' />
							</button>
						</div>

						{/* Client list */}
						<div className='flex-1 overflow-y-auto py-2'>
							{sorted.length === 0 && (
								<p className='font-mono text-xs text-white/20 px-4 py-6 text-center'>
									No clients found
								</p>
							)}
							{sorted.map((client, i) => (
								<button
									key={client.slug}
									onClick={() => {
										router.push(`/clients/${client.slug}`);
										setOpen(false);
									}}
									className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${i === selected ? 'bg-white/10' : 'hover:bg-white/5'}`}
								>
									<span className='font-medium text-sm'>{client.name}</span>
									<span className='font-mono text-xs text-teal'>
										{client.activeProjects > 0
											? `${client.activeProjects} active`
											: 'no active'}
									</span>
								</button>
							))}
						</div>

						{/* Footer hint */}
						<div className='hidden lg:block px-4 py-3 border-t border-white/10'>
							<p className='font-mono text-[12px] text-center text-warning/60'>
								↑↓ navigate · Enter to go · Esc to close · Ctrl-K to toggle
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}