'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { TbUsers, TbX } from 'react-icons/tb';
import ClientList from '@/app/components/dashboard/ClientList';

export default function ClientSwitcher({ clients }) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	// Close on navigation, same pattern as InternalNav — the drawer slides
	// out while the new route loads instead of sitting open on a stale page.
	useEffect(() => {
		setOpen(false);
		setLeaving(false);
	}, [pathname]);

	// lock body scroll while the drawer is open
	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const close = () => {
		setOpen(false);
		setLeaving(false);
	};

	// Any click bubbling up from a <Link> (an <a> tag) — a client card — is
	// a navigation, so trigger the slide-out. The group dropdown is a
	// <button>, not a link, so switching Active/On Hold/etc. falls through
	// untouched and just changes the tab without closing anything.
	function handlePanelClick(e) {
		if (e.target.closest('a')) setLeaving(true);
	}

	// Dashboard has its own ClientList sidebar on desktop, so the trigger
	// hides there at the lg breakpoint — but mobile dropped that sidebar
	// entirely, so it needs to stay reachable below lg on this one page.
	const isDashboard = pathname === '/dashboard';

	const drawer = (
		<div
			className={`fixed inset-0 z-[100] transition-opacity duration-200 ${
				open ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
			}`}
		>
			{/* backdrop — tap to close */}
			<div className='absolute inset-0 bg-black/70 backdrop-blur-md' onClick={close} />

			{/* panel — slides in from the right, slides out on navigate or close */}
			<div
				onClick={handlePanelClick}
				className={`absolute inset-y-0 right-0 w-full sm:w-[420px] bg-[#0d0f14] border-l border-white/10 overflow-y-auto p-5 pt-6 transition-transform duration-300 ease-out ${
					open ? 'translate-x-0' : 'translate-x-full'
				} ${leaving ? 'drawer-leaving' : ''}`}
			>
				<div className='flex items-center justify-between mb-5'>
					<span className='font-mono text-xs tracking-widest uppercase text-white/40'>
						Clients
					</span>
					<button
						onClick={close}
						aria-label='Close'
						className='p-2 rounded-full text-white/50 hover:text-white transition-colors'
					>
						<TbX className='text-xl' />
					</button>
				</div>

				<ClientList clients={clients} />
			</div>
		</div>
	);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className={`items-center gap-1.5 font-mono text-xs px-4 py-2 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors shrink-0 ${
					isDashboard ? 'flex lg:hidden' : 'flex'
				}`}
			>
				<TbUsers className='text-sm' />
				Clients
			</button>

			{mounted && createPortal(drawer, document.body)}
		</>
	);
}