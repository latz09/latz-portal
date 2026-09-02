'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import NoteCard from '@/app/components/dashboard/NoteCard';

export default function PinnedNotes({ notes = [], compact = false, defaultOpen = false }) {
	const [open, setOpen] = useState(defaultOpen);

	if (!notes.length) return null;

	const label =
		notes.length === 1 ? '1 pinned note' : `${notes.length} pinned notes`;

	return (
		<div className='mb-6'>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center gap-2 group'
			>
				<span className='font-mono text-[10px] lg:text-xs tracking-widest uppercase text-white/40 group-hover:text-white/60 transition-colors'>
					{label}
				</span>
				<TbChevronDown
					className={`text-white/25 group-hover:text-white/50 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div
					className={`mt-4 ${compact ? 'flex flex-col gap-3' : 'grid sm:grid-cols-2 gap-3 lg:gap-5'}`}
				>
					{notes.map((note) => (
						<NoteCard key={note._id} note={note} />
					))}
				</div>
			)}
		</div>
	);
}