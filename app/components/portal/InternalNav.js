'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbChevronDown } from 'react-icons/tb';

const TABS = [
	{ href: '/dashboard', label: 'Dashboard' },
	{ href: '/clients', label: 'Table Overview' },
	{ href: '/dashboard/journey', label: 'Pipeline' },
];

const DESIGNER = { href: '/portal/designer', label: 'Designer View →' };

export default function InternalNav() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const isActive = (href) => {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname === href || pathname.startsWith(href + '/');
	};

	const current = TABS.find((t) => isActive(t.href)) || TABS[0];

	return (
		<>
			{/* ── Mobile: dropdown ── */}
			<div className='relative lg:hidden'>
				<button
					onClick={() => setOpen(!open)}
					className='w-full flex items-center justify-between gap-2 font-mono text-sm px-4 py-2.5 rounded-full border bg-teal/15 border-teal/40 text-teal'
				>
					{current.label}
					<TbChevronDown
						className={`transition-transform ${open ? 'rotate-180' : ''}`}
					/>
				</button>

				{open && (
					<>
						<div
							className='fixed inset-0 z-40'
							onClick={() => setOpen(false)}
						/>
						<div className='absolute left-0 right-0 top-full mt-2 z-50 flex flex-col gap-1 p-2 rounded-xl border border-white/10 bg-dark shadow-xl'>
							{TABS.filter((t) => t.href !== current.href).map((t) => (
								<Link
									key={t.href}
									href={t.href}
									onClick={() => setOpen(false)}
									className='font-mono text-sm px-4 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors'
								>
									{t.label}
								</Link>
							))}
							<a
								href={DESIGNER.href}
								target='_blank'
								rel='noopener noreferrer'
								onClick={() => setOpen(false)}
								className='font-mono text-sm px-4 py-2.5 rounded-lg text-purple hover:bg-purple/10 transition-colors'
							>
								{DESIGNER.label}
							</a>
						</div>
					</>
				)}
			</div>

			{/* ── Desktop: pill row ── */}
			<div className='hidden lg:flex gap-2 flex-wrap'>
				{TABS.map((t) => {
					const active = isActive(t.href);
					return (
						<Link
							key={t.href}
							href={t.href}
							className={`inline-flex items-center justify-center gap-1 font-mono text-xs px-4 py-2 rounded-full border transition-colors ${
								active
									? 'bg-teal/15 border-teal/40 text-teal'
									: 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
							}`}
						>
							{t.label}
						</Link>
					);
				})}
				<a
					href={DESIGNER.href}
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex items-center justify-center gap-1 font-mono text-xs px-4 py-2 rounded-full border border-purple/30 text-purple hover:bg-purple/10 transition-colors'
				>
					{DESIGNER.label}
				</a>
			</div>
		</>
	);
}