'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import NoteCard from '@/app/components/notes/NoteCard';

export default function PinnedNotes({
	notes = [],
	compact = false,
	defaultOpen = false,
	pulseOnLoad = false,
	onArchive,
	onPinToggle,
	onBackBurnerToggle,
}) {
	const [open, setOpen] = useState(defaultOpen);
	const [interacted, setInteracted] = useState(false);

	if (!notes.length) return null;

	const label =
		notes.length === 1 ? '1 pinned note' : `${notes.length} pinned notes`;

	return (
		<div className='mb-6'>
			<button
				onClick={() => {
					setOpen(!open);
					setInteracted(true);
				}}
				className={`flex items-center gap-2 group bg-warning px-2 py-1 rounded ${
					pulseOnLoad && !interacted ? 'animate-attention-pulse' : ''
				}`}
			>
				<span className='font-mono font-semibold text-[10px] lg:text-xs tracking-widest uppercase text-dark group-hover:text-white/60 transition-colors'>
					{label}
				</span>
				<TbChevronDown
					className={`text-dark group-hover:text-dark transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div
					className={`mt-4 ${compact ? 'flex flex-col gap-3' : 'grid sm:grid-cols-2 gap-3 lg:gap-5'}`}
				>
					{notes.map((note) => (
						<NoteCard
							key={note._id}
							note={note}
							onArchive={onArchive}
							onPinToggle={onPinToggle}
							onBackBurnerToggle={onBackBurnerToggle}
						/>
					))}
				</div>
			)}
		</div>
	);
}