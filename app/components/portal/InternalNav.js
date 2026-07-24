'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbChevronDown, TbX } from 'react-icons/tb';

const TABS = [
	{ href: '/dashboard', label: 'Dashboard' },
	{ href: '/clients', label: 'Books' },
	{ href: '/dashboard/journey', label: 'Pipeline' },
];

const DESIGNER = { href: '/portal/designer', label: 'Designer View →' };

export default function InternalNav() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	// lock body scroll while the menu is open
	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const isActive = (href) => {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname === href || pathname.startsWith(href + '/');
	};

	const current = TABS.find((t) => isActive(t.href)) || TABS[0];

	const menu = (
		<div className='fixed inset-0 z-[100] lg:hidden'>
			{/* overlay — full viewport, tap to close */}
			<div
				className='absolute inset-0 bg-black/70 backdrop-blur-md'
				onClick={() => setOpen(false)}
			/>

			{/* panel */}
			<div className='relative flex flex-col gap-2 p-5 pt-6'>
				<div className='flex justify-end mb-2'>
					<button
						onClick={() => setOpen(false)}
						aria-label='Close menu'
						className='p-2 rounded-full text-white/50 hover:text-white transition-colors'
					>
						<TbX className='text-xl' />
					</button>
				</div>

				{TABS.map((t) => {
					const active = isActive(t.href);
					return (
			<Link
							key={t.href}
							href={t.href}
							onClick={() => setOpen(false)}
							className={`font-mono px-5 rounded-xl border transition-colors ${
								active
									? 'text-base py-3 bg-[#12151c] border-white/[0.06] text-white/35'
									: 'text-lg py-4 bg-[#161a22] border-white/10 text-white active:bg-[#1d222c]'
							}`}
						>
							{t.label}
							{active && (
								<span className='ml-2 text-[10px] uppercase tracking-widest text-white/25'>
									current
								</span>
							)}
						</Link>
					);
				})}

				<a
				href={DESIGNER.href}
					target='_blank'
					rel='noopener noreferrer'
					onClick={() => setOpen(false)}
					className='font-mono text-lg px-5 py-4 rounded-xl border border-purple/40 bg-[#1a1730] text-purple active:bg-[#221d3d] transition-colors'
				>
					{DESIGNER.label}
				</a>
			</div>
		</div>
	);

	return (
		<>
			{/* ── Mobile: trigger ── */}
			<div className='lg:hidden'>
				<button
					onClick={() => setOpen(true)}
					className='w-full flex items-center justify-between gap-2 font-mono text-sm px-4 py-2.5 rounded-full border bg-teal/15 border-teal/40 text-teal'
				>
					{current.label}
					<TbChevronDown />
				</button>
			</div>

			{mounted && open && createPortal(menu, document.body)}

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
