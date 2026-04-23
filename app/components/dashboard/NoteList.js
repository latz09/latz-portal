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
			className='flex items-center gap-1 font-mono text-sm lg:text-lg text-white/70 hover:text-warning/75 transition-colors border border-warning/30 px-2 py-0.5 rounded'
		>
			<TbPlus className='text-xs md:text-sm lg:text-lg text-warning' />
			Add Item
		</button>
	);
}

function EmptyState({ onAdd }) {
	return (
		<div className='flex justify-center'>
			<AddNoteButton onClick={onAdd} />
		</div>
	);
}

function NoteListHeader({ onAdd }) {
	return (
		<div className='flex items-center justify-between mb-4 lg:mb-6'>
			<p className='font-mono text-xs lg:text-base text-warning/80 tracking-widest uppercase'>
				Notes & Todos
			</p>
			<AddNoteButton onClick={onAdd} />
		</div>
	);
}

function ExpandToggle({ expanded, count, onToggle }) {
	return (
		<button
			onClick={onToggle}
			className='flex items-center gap-2 font-mono text-sm lg:text-base text-white/50 hover:text-white/60 transition-colors pt-1'
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
		<div className='mb-8 sm:mb-16 py-8 sm:py-16'>
			<div className='flex items-center gap-2 mb-3'>
				<TbPinFilled className='text-warning text-sm' />
				<p className='font-mono text-xs lg:text-base text-warning/80 tracking-widest uppercase mb-2'>
					Up Next
				</p>
			</div>
			<div className='grid sm:grid-cols-2 gap-6 lg:gap-4'>
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
	if (!notes.length) return null;

	const oldestDays = getOldestDays(notes);
	const oldestLabel =
		oldestDays === 0
			? 'today'
			: oldestDays === 1
				? '1 day ago'
				: `${oldestDays} days ago`;

	return (
		<div className='mt-6 border-t border-white/10 pt-6'>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center justify-between w-full mb-4 group'
			>
				<div className='flex items-center gap-3'>
					<p className='font-mono text-xs lg:text-base text-white/50 tracking-widest uppercase'>
						Awaiting Reply
					</p>
					<span className='font-mono text-xs bg-dark text-teal border border-teal/50 rounded-full px-2 py-0.5'>
						{notes.length}
					</span>
					{!open && (
						<span className='font-mono text-xs text-white/30'>
							oldest {oldestLabel}
						</span>
					)}
				</div>
				<TbChevronDown
					className={`text-white/30 group-hover:text-white/50 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='grid sm:grid-cols-2 gap-6 lg:gap-4'>
					{notes.map((note) => (
						<NoteCard
							key={note._id}
							note={note}
							onArchive={onArchive}
							onPinToggle={onPinToggle}
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
	const pinned = notes.filter(
		(n) => n.pinned && !(n.type === 'email' && n.sentAt),
	);
	const active = notes.filter(
		(n) => !n.pinned && !(n.type === 'email' && n.sentAt),
	);
	const awaiting = notes.filter((n) => n.type === 'email' && n.sentAt);

	const visible = active.slice(0, 2);
	const rest = active.slice(2);

	if (notes.length === 0) {
		return (
			<div className='mb-12'>
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
				<div className='grid sm:grid-cols-2 gap-6 lg:gap-4'>
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
