'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { TbSearch, TbX } from 'react-icons/tb';
import ClientList from '@/app/components/dashboard/ClientList';

export default function ClientSwitcher({ clients }) {
	const pathname = usePathname();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState('');
	const [isTouch, setIsTouch] = useState(false);
	const navigating = useRef(false);
	const listContainerRef = useRef(null);
	const inputRef = useRef(null);
	const widgetRef = useRef(null);

	useEffect(() => setMounted(true), []);

	// Detect touch/mobile once on mount — on touch devices, the closed bar
	// renders as a plain button (no <input> in the DOM at all) instead of
	// a focusable field, so there's nothing for the OS to auto-focus and
	// no keyboard pop on the first tap.
	useEffect(() => {
		setIsTouch(window.matchMedia('(pointer: coarse)').matches);
	}, []);

	// Close on navigation — panel fades/scales back out while the new route
	// loads instead of sitting open on a stale page.
	useEffect(() => {
		setOpen(false);
		setLeaving(false);
		setQuery('');
	}, [pathname]);

	// lock body scroll while the panel is open
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

	// ⌘K / Ctrl+K opens and focuses the persistent bar input
	useEffect(() => {
		const handler = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen(true);
				inputRef.current?.focus();
			}
			if (e.key === 'Escape') close();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	// ArrowUp/ArrowDown move real DOM focus between whichever items are
	// currently visible (browse cards or search results). Works whether
	// focus starts in the bar input (currentIndex -1 → lands on the first
	// item) or already inside the list.
	useEffect(() => {
		if (!open) return;
		const handler = (e) => {
			if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
			const items = Array.from(
				listContainerRef.current?.querySelectorAll('a, button') || [],
			);
			if (!items.length) return;
			e.preventDefault();
			const currentIndex = items.indexOf(document.activeElement);
			const nextIndex =
				e.key === 'ArrowDown'
					? currentIndex === -1
						? 0
						: Math.min(currentIndex + 1, items.length - 1)
					: currentIndex === -1
						? 0
						: Math.max(currentIndex - 1, 0);
			items[nextIndex].focus();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open]);

	// Focus trap: while open, Tab/Shift+Tab cycle through the widget's own
	// focusable elements (bar input, close button, whichever list is
	// visible) instead of escaping into the rest of the page or browser
	// chrome. offsetParent !== null filters out anything currently hidden
	// by CSS (e.g. the panel's contents when it's visually closed).
	useEffect(() => {
		if (!open) return;
		const handler = (e) => {
			if (e.key !== 'Tab') return;
			const focusable = Array.from(
				widgetRef.current?.querySelectorAll('a, button, input') || [],
			).filter((el) => !el.disabled && el.offsetParent !== null);
			if (!focusable.length) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const current = document.activeElement;

			if (e.shiftKey && current === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && current === last) {
				e.preventDefault();
				first.focus();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open]);

	// Mobile swipe-back closes the panel instead of leaving the page
	useEffect(() => {
		if (!open) return;
		window.history.pushState({ searchOpen: true }, '');
		const handler = (e) => {
			if (e.state?.searchOpen !== true) close();
		};
		window.addEventListener('popstate', handler);
		return () => {
			window.removeEventListener('popstate', handler);
			if (!navigating.current && window.history.state?.searchOpen) {
				window.history.back();
			}
			navigating.current = false;
		};
	}, [open]);

	// Flat, fuzzy-ish filter across every client — active projects surface
	// first. Only relevant once there's a query; empty query = browse mode.
	const filtered = useMemo(
		() =>
			(clients || []).filter((c) =>
				c.name.toLowerCase().includes(query.toLowerCase()),
			),
		[clients, query],
	);
	const sorted = useMemo(
		() => [
			...filtered.filter((c) => c.activeProjects > 0),
			...filtered.filter((c) => c.activeProjects === 0),
		],
		[filtered],
	);

	const isSearching = query.trim().length > 0;

	function goTo(slug) {
		navigating.current = true;
		setLeaving(true);
		router.push(`/clients/${slug}`);
	}

	// Any click bubbling up from a <Link> (an <a> tag) inside browse mode
	// (a ClientList card) is a navigation — trigger the leave animation.
	// The group dropdown inside ClientList is a <button>, not a link, so
	// switching Active/On Hold/etc falls through untouched.
	function handlePanelClick(e) {
		if (e.target.closest('a')) setLeaving(true);
	}

	// On touch devices while closed: a plain button, visually identical to
	// the input, that just opens the panel — no <input> exists yet, so
	// there's nothing to auto-focus. Once open, the real <input> takes over
	// and behaves normally (tap it again to type and bring up the keyboard).
	const showButtonBar = isTouch && !open;

	const widget = (
		<div ref={widgetRef}>
			{/* backdrop — only when open, tap to close */}
			<div
				className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
					open ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
				}`}
				onClick={close}
			/>

			{/* results panel — its own centered overlay, no longer anchored
			    to the bar below. Outer wrapper spans the viewport just to
			    center its child; pointer-events-none there so clicks pass
			    through to the backdrop, pointer-events-auto on the actual
			    panel so it stays interactive. */}
			<div className='fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 pointer-events-none'>
				<div
					onClick={handlePanelClick}
					className={`pointer-events-auto w-full sm:w-[720px] max-h-[90vh] flex flex-col rounded-2xl border  border-white/10 bg-[#0d0f14] shadow-2xl transition-all duration-300 ease-out ${
						open
							? 'translate-y-0 scale-100 opacity-100'
							: 'translate-y-4 scale-95 opacity-0 invisible pointer-events-none'
					} ${leaving ? 'drawer-leaving-bottom' : ''}`}
				>
										<div ref={listContainerRef} className='flex-1 overflow-y-auto p-5'>
						{isSearching ? (
							<div className='border border-white/[0.08] rounded-xl overflow-hidden'>
								{sorted.length === 0 && (
									<p className='font-mono text-xs text-white/20 px-4 py-6 text-center'>
										No clients found
									</p>
								)}
								{sorted.map((client, i) => (
									<button
										key={client.slug}
										onClick={() => goTo(client.slug)}
										className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.07] focus:outline-none transition-colors text-left ${
											i !== sorted.length - 1 ? 'border-b border-white/[0.06]' : ''
										}`}
									>
										<span className='font-medium text-white truncate'>{client.name}</span>
										<span className='font-mono text-xs text-teal shrink-0'>
											{client.activeProjects}
											<span className='text-teal/40'> / {client.totalProjects}</span>
										</span>
									</button>
								))}
							</div>
						) : (
							<ClientList clients={clients} />
						)}
					</div>

					<div className='hidden lg:block px-4 py-3 border-t border-white/10 shrink-0'>
						<p className='font-mono text-[12px] text-center text-warning/60'>
							↑↓ browse · Enter to go · Esc to close · ⌘K to search
						</p>
					</div>
				</div>
			</div>

			{/* persistent bar — always mounted, doubles as the trigger and
			    the search input; unchanged from before, still bottom-right */}
			<div className='fixed bottom-3 md:bottom-4 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-[420px]'>
				<div className='flex items-center gap-3 px-4 py-3 rounded-full border border-white/10 bg-[#0d0f14] shadow-lg'>
					<TbSearch className='text-white/30 text-lg shrink-0' />
					{showButtonBar ? (
						<button
							type='button'
							onClick={() => setOpen(true)}
							className='flex-1 text-left bg-transparent text-white/20 font-mono text-sm outline-none min-w-0'
						>
							Search clients...
						</button>
					) : (
						<input
							ref={inputRef}
							type='text'
							placeholder='Search clients... (⌘K)'
							value={query}
							onFocus={() => setOpen(true)}
							onChange={(e) => {
								setQuery(e.target.value);
								setOpen(true);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									close();
									inputRef.current?.blur();
								}
							}}
							className='flex-1 bg-transparent text-white  placeholder-white/20 font-mono text-sm outline-none min-w-0'
						/>
					)}
					{open && (
						<button
							onClick={() => {
								close();
								inputRef.current?.blur();
							}}
							aria-label='Close'
							className='text-white/20 hover:text-white transition-colors shrink-0'
						>
							<TbX className='text-lg' />
						</button>
					)}
				</div>
			</div>
		</div>
	);

	return mounted ? createPortal(widget, document.body) : null;
}