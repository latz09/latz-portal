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
	const [keyboardInset, setKeyboardInset] = useState(0);
	const navigating = useRef(false);
	const listContainerRef = useRef(null);
	const inputRef = useRef(null);
	const widgetRef = useRef(null);

	useEffect(() => setMounted(true), []);

	// Detect touch/mobile once on mount — used to suppress the native
	// focus-on-tap keyboard pop, and to gate the visualViewport tracking
	// below (desktop never needs it, and this flag never flips mid-session
	// so desktop's render branch is stable — no remount risk there).
	useEffect(() => {
		setIsTouch(window.matchMedia('(pointer: coarse)').matches);
	}, []);

	// Track how much of the screen the on-screen keyboard is currently
	// covering, via the browser's own visualViewport API — CSS units
	// (dvh/svh) aren't reliable for this on iOS Safari. keyboardInset is
	// just a number (px) that positioning below reads from; it does NOT
	// change which elements render, only where they sit — so the input
	// itself never remounts when the keyboard opens or closes.
	useEffect(() => {
		if (!isTouch) return;
		const vv = window.visualViewport;
		if (!vv) return;

		function update() {
			const inset = window.innerHeight - (vv.offsetTop + vv.height);
			setKeyboardInset(Math.max(0, inset));
		}
		update();
		vv.addEventListener('resize', update);
		vv.addEventListener('scroll', update);
		return () => {
			vv.removeEventListener('resize', update);
			vv.removeEventListener('scroll', update);
		};
	}, [isTouch]);

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

	// First tap on mobile: open the panel to browse only — no keyboard.
	// The defensive blur-next-frame guards against a WebKit quirk where
	// touch focus can carry over to a newly-inserted focusable element
	// sitting at the same screen position as whatever was just tapped.
	function openBrowseOnly() {
		setOpen(true);
		requestAnimationFrame(() => {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});
	}

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
	// currently visible (browse cards or search results).
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
	// focusable elements instead of escaping into the rest of the page.
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

	// Any click bubbling up from a <Link> (a client card) is a navigation —
	// trigger the leave animation. The group dropdown is a <button>, not
	// a link, so switching Active/On Hold/etc falls through untouched.
	function handlePanelClick(e) {
		if (e.target.closest('a')) setLeaving(true);
	}

	// On touch devices while closed: a plain button, visually identical to
	// the input, that just opens the panel — no <input> exists yet, so
	// there's nothing to auto-focus. Once open, the real <input> takes
	// over. This is the ONLY intentional swap in the tree — everything
	// about keyboard-open vs keyboard-closed positioning below is handled
	// with inline styles on that same persistent input, never a remount.
	const showButtonBar = isTouch && !open;

	const listContent = (
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
							className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-teal/70 focus:outline-none transition-colors text-left ${
								i !== sorted.length - 1 ? 'border-b border-white/[0.06]' : ''
							}`}
						>
							<span className='font-medium text-white truncate'>
								{client.name}
							</span>
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
	);

	const barContent = (
		<div className='flex items-center gap-3 px-4 py-3 rounded-full border border-white/10 bg-[#0d0f14] shadow-lg'>
			<TbSearch className='text-white/30 text-lg shrink-0' />
			{showButtonBar ? (
				<button
					type='button'
					onClick={openBrowseOnly}
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
					className='flex-1 bg-transparent text-white placeholder-white/20 font-mono text-sm outline-none min-w-0'
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
	);

	const widget = (
		<div ref={widgetRef}>
			<div
				className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
					open ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
				}`}
				onClick={close}
			/>

			{isTouch ? (
				/* Mobile: ONE persistent subtree, always. Positioning shifts
				   via inline style (keyboardInset) as the keyboard opens or
				   closes — the input itself never unmounts, so focus is
				   never lost mid-interaction. */
				<>
					<div className='fixed inset-0 z-[100] flex items-end justify-center p-2 pointer-events-none'>
						<div
							onClick={handlePanelClick}
							style={{ marginBottom: keyboardInset + 76 }}
							className={`pointer-events-auto w-full max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl transition-all duration-200 ease-out ${
								open
									? 'translate-y-0 opacity-100'
									: 'translate-y-4 opacity-0 invisible pointer-events-none'
							} ${leaving ? 'drawer-leaving-bottom' : ''}`}
						>
							{listContent}
						</div>
					</div>

					<div
						style={{ bottom: keyboardInset + 12 }}
						className='fixed left-3 right-3 z-[100]'
					>
						{barContent}
					</div>
				</>
			) : (
				/* Desktop: unchanged centered modal + fixed bottom-right bar. */
				<>
					<div className='fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 pointer-events-none'>
						<div
							onClick={handlePanelClick}
							className={`pointer-events-auto w-full sm:w-[720px] max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl transition-all duration-300 ease-out ${
								open
									? 'translate-y-0 scale-100 opacity-100'
									: 'translate-y-4 scale-95 opacity-0 invisible pointer-events-none'
							} ${leaving ? 'drawer-leaving-bottom' : ''}`}
						>
							{listContent}
							<div className='hidden lg:block px-4 py-3 border-t border-white/10 shrink-0'>
								<p className='font-mono text-[12px] text-center text-warning/60'>
									↑↓ browse · Enter to go · Esc to close · ⌘K to search
								</p>
							</div>
						</div>
					</div>

					<div className='fixed bottom-3 md:bottom-4 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-[420px]'>
						{barContent}
					</div>
				</>
			)}
		</div>
	);

	return mounted ? createPortal(widget, document.body) : null;
}
