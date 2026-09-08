'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import NoteCard from './NoteCard';

function getOldestDays(notes) {
	if (!notes.length) return 0;
	const oldest = Math.min(...notes.map((n) => new Date(n.sentAt).getTime()));
	return Math.floor((Date.now() - oldest) / 86_400_000);
}

function EmptyState() {
	return (
		<div className='flex flex-col items-center gap-3 py-10 border border-white/[0.08] rounded-xl bg-white/[0.02]'>
			<p className='font-mono text-[11px] text-white/25'>No notes right now.</p>
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

function NoteListHeader() {
	return (
		<div className='flex items-center justify-between mb-5'>
			<SectionLabel>Notes &amp; Todos</SectionLabel>
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

function AwaitingReplies({ notes, onArchive, onPinToggle, onBackBurnerToggle }) {
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
				<div className='grid sm:grid-cols-2 gap-3 lg:gap-5'>
					{sorted.map((note) => (
						<NoteCard
							key={note._id}
							note={note}
							onArchive={onArchive}
							onPinToggle={onPinToggle}
							onBackBurnerToggle={onBackBurnerToggle}
							overdue={note.overdue}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function NoteList({ notes = [], onArchive, onSent, onPinToggle, onBackBurnerToggle }) {
	const [expanded, setExpanded] = useState(false);

	const active = notes.filter(
		(n) => !n.pinned && !(n.type === 'email' && n.sentAt),
	);
	const awaiting = notes.filter(
		(n) => n.type === 'email' && n.sentAt && !n.pinned,
	);

	const visible = active.slice(0, 2);
	const rest = active.slice(2);

	return (
		<div className='mb-12 max-w-7xl mx-auto'>
			<NoteListHeader />

			{notes.length === 0 ? (
				<EmptyState />
			) : (
				<>
					{active.length > 0 && (
						<div className='grid sm:grid-cols-2 gap-3 lg:gap-5'>
							{visible.map((note) => (
								<NoteCard
									key={note._id}
									note={note}
									onArchive={onArchive}
									onSent={onSent}
									onPinToggle={onPinToggle}
									onBackBurnerToggle={onBackBurnerToggle}
								/>
							))}
							{expanded &&
								rest.map((note) => (
									<NoteCard
										key={note._id}
										note={note}
										onArchive={onArchive}
										onSent={onSent}
										onPinToggle={onPinToggle}
										onBackBurnerToggle={onBackBurnerToggle}
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
						onArchive={onArchive}
						onPinToggle={onPinToggle}
						onBackBurnerToggle={onBackBurnerToggle}
					/>
				</>
			)}
		</div>
	);
}