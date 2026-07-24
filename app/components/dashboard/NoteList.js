// components/dashboard/NoteList.jsx

'use client';

import { useState } from 'react';
import { TbChevronDown, TbPlus, TbPinFilled } from 'react-icons/tb';
import NoteCard from './NoteCard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOldestDays(notes) {
	if (!notes.length) return 0;
	const oldest = Math.min(...notes.map((n) => new Date(n.sentAt).getTime()));
	return Math.floor((Date.now() - oldest) / 86_400_000);
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function AddNoteButton({ onClick }) {
	return (
		<button
			onClick={onClick}
			className='inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/50 hover:text-warning hover:border-warning/30 transition-colors'
		>
			<TbPlus className='text-sm' />
			Add
		</button>
	);
}

function EmptyState({ onAdd }) {
	return (
		<div className='flex flex-col items-center gap-3 py-10 border border-white/[0.08] rounded-xl bg-white/[0.02]'>
			<p className='font-mono text-[11px] text-white/25'>No notes right now.</p>
			<AddNoteButton onClick={onAdd} />
		</div>
	);
}

function SectionLabel({ children, icon: Icon, tone = 'text-white/40' }) {
	return (
		<span
			className={`inline-flex items-center gap-2 font-mono text-[10px] lg:text-xs tracking-widest uppercase ${tone}`}
		>
			{Icon && <Icon className='text-xs' />}
			{children}
		</span>
	);
}

function CountPill({ children }) {
	return (
		<span className='font-mono text-[10px] bg-black/40 text-white/50 border border-white/10 rounded-full px-2 py-0.5'>
			{children}
		</span>
	);
}

function NoteListHeader({ onAdd }) {
	return (
		<div className='flex items-center justify-between mb-5'>
			<SectionLabel>Notes &amp; Todos</SectionLabel>
			<AddNoteButton onClick={onAdd} />
		</div>
	);
}

function ExpandToggle({ expanded, count, onToggle }) {
	return (
		<button
			onClick={onToggle}
			className='flex items-center gap-2 font-mono text-[11px] tracking-wide text-white/35 hover:text-white/60 transition-colors pt-1'
		>
			<TbChevronDown
				className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
			/>
			{expanded ? 'Show less' : `${count} more`}
		</button>
	);
}

function PinnedSection({ notes, onArchive, onSent, onPinToggle }) {
	if (!notes.length) return null;

	return (
		<div className='mb-10'>
			<div className='mb-3'>
				<SectionLabel icon={TbPinFilled} tone='text-warning/70'>
					Pinned
				</SectionLabel>
			</div>
			<div className='grid sm:grid-cols-2 gap-3'>
				{notes.map((note) => (
					<NoteCard
						key={note._id}
						note={note}
						onArchive={onArchive}
						onSent={onSent}
						onPinToggle={onPinToggle}
					/>
				))}
			</div>
		</div>
	);
}

function AwaitingReplies({ notes, onArchive, onPinToggle }) {
	const [open, setOpen] = useState(false);
	const [sorted, setSorted] = useState([]);
	if (!notes.length) return null;

	function handleOpen() {
		if (!open) {
			const now = Date.now();
			const s = [...notes]
				.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
				.map((n) => ({
					...n,
					overdue:
						Math.floor((now - new Date(n.sentAt).getTime()) / 86_400_000) >= 3,
				}));
			setSorted(s);
		}
		setOpen(!open);
	}

	const oldestDays = getOldestDays(notes);
	const oldestLabel =
		oldestDays === 0
			? 'today'
			: oldestDays === 1
				? '1 day ago'
				: `${oldestDays} days ago`;

	return (
		<div className='mt-8 border-t border-white/[0.08] pt-6'>
			<button
				onClick={handleOpen}
				className='flex items-center justify-between w-full mb-4 group'
			>
				<div className='flex items-center gap-3'>
					<SectionLabel>Awaiting Reply</SectionLabel>
					<CountPill>{notes.length}</CountPill>
					{!open && (
						<span className='font-mono text-[11px] text-white/25'>
							oldest {oldestLabel}
						</span>
					)}
				</div>
				<TbChevronDown
					className={`text-white/25 group-hover:text-white/50 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='grid sm:grid-cols-2 gap-3'>
					{sorted.map((note) => (
						<NoteCard
							key={note._id}
							note={note}
							onArchive={onArchive}
							onPinToggle={onPinToggle}
							overdue={note.overdue}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteList({ notes: initialNotes = [] }) {
	const [notes, setNotes] = useState(initialNotes);
	const [expanded, setExpanded] = useState(false);

	function handleAddNote() {
		window.open('https://latz-portal.sanity.studio/structure/note', '_blank');
	}

	function handleArchive(id) {
		setNotes((prev) => prev.filter((n) => n._id !== id));
	}

	function handleSent(id) {
		setNotes((prev) =>
			prev.map((n) =>
				n._id === id ? { ...n, sentAt: new Date().toISOString() } : n,
			),
		);
	}

	function handlePinToggle(id, newPinned) {
		setNotes((prev) =>
			prev.map((n) => (n._id === id ? { ...n, pinned: newPinned } : n)),
		);
	}

	// Split into three groups
	const pinned = notes.filter((n) => n.pinned);
	const active = notes.filter(
		(n) => !n.pinned && !(n.type === 'email' && n.sentAt),
	);
	const awaiting = notes.filter(
		(n) => n.type === 'email' && n.sentAt && !n.pinned,
	);

	const visible = active.slice(0, 2);
	const rest = active.slice(2);

	if (notes.length === 0) {
		return (
			<div className='mb-12'>
				<NoteListHeader onAdd={handleAddNote} />
				<EmptyState onAdd={handleAddNote} />
			</div>
		);
	}

	return (
		<div className='mb-12 max-w-7xl mx-auto'>
			<NoteListHeader onAdd={handleAddNote} />

			<PinnedSection
				notes={pinned}
				onArchive={handleArchive}
				onSent={handleSent}
				onPinToggle={handlePinToggle}
			/>

			{active.length > 0 && (
				<div className='grid sm:grid-cols-2 gap-3'>
					{visible.map((note) => (
						<NoteCard
							key={note._id}
							note={note}
							onArchive={handleArchive}
							onSent={handleSent}
							onPinToggle={handlePinToggle}
						/>
					))}
					{expanded &&
						rest.map((note) => (
							<NoteCard
								key={note._id}
								note={note}
								onArchive={handleArchive}
								onSent={handleSent}
								onPinToggle={handlePinToggle}
							/>
						))}
					{rest.length > 0 && (
						<div className='sm:col-span-2'>
							<ExpandToggle
								expanded={expanded}
								count={rest.length}
								onToggle={() => setExpanded(!expanded)}
							/>
						</div>
					)}
				</div>
			)}

			<AwaitingReplies
				notes={awaiting}
				onArchive={handleArchive}
				onPinToggle={handlePinToggle}
			/>
		</div>
	);
}