// components/notes/AllNotesContent.jsx
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { TbChevronDown, TbHourglass, TbPinFilled } from 'react-icons/tb';
import NoteCard from './NoteCard';
import { useAllNotes } from './AllNotesProvider';

const TYPE_FILTERS = [
	{ value: '', label: 'All Types' },
	{ value: 'general', label: 'General' },
	{ value: 'idea', label: 'Idea' },
	{ value: 'task', label: 'Task' },
	{ value: 'link', label: 'Link' },
	{ value: 'asset', label: 'Asset' },
	{ value: 'email', label: 'Email' },
];

function FilterPill({ active, onClick, children }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={`font-mono text-[11px] lg:text-[13px] tracking-wide uppercase px-3 py-1.5 rounded-full border transition-colors active:scale-95 ${
				active
					? 'bg-teal border-teal/40 text-white'
					: 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/25'
			}`}
		>
			{children}
		</button>
	);
}

function ClientFilterDropdown({ value, onChange, options }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const selected = options.find((o) => o.value === value);

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				onClick={() => setOpen((o) => !o)}
				className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full border transition-colors active:scale-95 ${
					value
						? 'bg-teal/15 border-teal/40 text-teal'
						: 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-white/25'
				}`}
			>
				{selected ? selected.label : 'All Clients'}
				<TbChevronDown
					className={`text-xs transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='absolute z-10 mt-1 min-w-[10rem] max-h-64 overflow-y-auto bg-[#181c26] border border-white/10 rounded-lg shadow-xl shadow-black/40 py-1'>
					{options.map((o) => (
						<button
							key={o.value || '__all'}
							type='button'
							onClick={() => {
								onChange(o.value);
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
								o.value === value
									? 'bg-teal/15 text-teal'
									: 'text-white/70 hover:bg-white/[0.06] hover:text-white'
							}`}
						>
							{o.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function EmptyState() {
	return (
		<div className='note-card-enter flex flex-col items-center gap-2 py-16 border border-white/[0.08] rounded-xl bg-white/[0.02]'>
			<p className='font-mono text-sm text-white/30'>No notes match these filters.</p>
		</div>
	);
}

export default function AllNotesContent() {
	const { notes, archiveNote, markSent, togglePin, toggleBackBurner } = useAllNotes();

	const [typeFilter, setTypeFilter] = useState('');
	const [clientFilter, setClientFilter] = useState('');
	const [pinnedOnly, setPinnedOnly] = useState(false);
	const [backBurnerOnly, setBackBurnerOnly] = useState(false);

	const clientOptions = useMemo(() => {
		const map = new Map();
		notes.forEach((n) => {
			if (n.clientId && !map.has(n.clientId)) map.set(n.clientId, n.clientName);
		});
		const sorted = Array.from(map, ([value, label]) => ({ value, label })).sort(
			(a, b) => a.label.localeCompare(b.label),
		);
		return [{ value: '', label: 'All Clients' }, ...sorted];
	}, [notes]);

	const filtered = useMemo(() => {
		return notes.filter((n) => {
			if (typeFilter && n.type !== typeFilter) return false;
			if (clientFilter && n.clientId !== clientFilter) return false;
			if (pinnedOnly && !n.pinned) return false;
			if (backBurnerOnly) {
				if (!n.backBurner) return false;
			} else if (n.backBurner) {
				return false;
			}
			return true;
		});
	}, [notes, typeFilter, clientFilter, pinnedOnly, backBurnerOnly]);

	// Changing on any filter forces the grid below to remount, which is what
	// gives every filter click a fresh, staggered entrance animation instead
	// of cards snapping in/out instantly.
	const filterKey = `${typeFilter}|${clientFilter}|${pinnedOnly}|${backBurnerOnly}`;

	return (
		<div>
			<style jsx>{`
				@keyframes noteCardIn {
					from {
						opacity: 0;
						transform: translateY(8px) scale(0.98);
					}
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				:global(.note-card-enter) {
					animation: noteCardIn 0.32s cubic-bezier(0.32, 0.72, 0, 1) both;
				}
			`}</style>

			<div className='flex items-center justify-between mb-6'>
				<span className='font-mono text-[11px] lg:text-sm tracking-widest uppercase text-white/40'>
					All Notes
				</span>
			<span className='font-mono text-[10px] lg:text-[12px] 2xl:text-[14px] bg-white text-dark border border-white/10 rounded-full px-2 py-0.5'>
					{filtered.length}
					<span className='text-dark'> / {notes.length}</span>
				</span>
			</div>

			<div className='flex flex-wrap items-center gap-2 mb-8'>
				{TYPE_FILTERS.map((t) => (
					<FilterPill
						key={t.value || '__all'}
						active={typeFilter === t.value}
						onClick={() => setTypeFilter(t.value)}
					>
						{t.label}
					</FilterPill>
				))}

				<ClientFilterDropdown
					value={clientFilter}
					onChange={setClientFilter}
					options={clientOptions}
				/>

				<FilterPill active={pinnedOnly} onClick={() => setPinnedOnly((v) => !v)}>
					<TbPinFilled className='inline text-xs mr-1 -mt-0.5' />
					Pinned
				</FilterPill>

				<FilterPill
					active={backBurnerOnly}
					onClick={() => setBackBurnerOnly((v) => !v)}
				>
					<TbHourglass className='inline text-xs mr-1 -mt-0.5' />
					Back Burner
				</FilterPill>
			</div>

			{filtered.length === 0 ? (
				<EmptyState />
			) : (
				<div
					key={filterKey}
					className='grid sm:grid-cols-2 2xl:grid-cols-3 gap-3 xl:gap-x-8 gap-y-8 2xl:gap-x-12 xl:gap-y-12 pt-4 pb-32 '
				>
					{filtered.map((note, i) => (
						<div
							key={note._id}
							className='note-card-enter'
							style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
						>
							<NoteCard
								note={note}
								onArchive={archiveNote}
								onSent={markSent}
								onPinToggle={togglePin}
								onBackBurnerToggle={toggleBackBurner}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}


