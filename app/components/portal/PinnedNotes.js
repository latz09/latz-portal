'use client';

import { useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import NoteCard from '@/app/components/dashboard/NoteCard';

export default function PinnedNotes({ notes = [] }) {
	const [open, setOpen] = useState(false);

	if (!notes.length) return null;

	const label =
		notes.length === 1 ? '1 flagged note' : `${notes.length} flagged notes`;

	return (
		<div className='mb-6'>
			<button
				onClick={() => setOpen(!open)}
				className='flex items-center gap-2 group'
			>
				<span className='font-mono text-[10px] lg:text-xs tracking-widest uppercase text-dark py-0.75 px-2 rounded font-black bg-warning  group-hover:text-white/60 transition-colors'>
					{label}
				</span>
				<TbChevronDown
					className={`text-white/25 group-hover:text-white/50 transition-all duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<div className='grid sm:grid-cols-2 gap-3 lg:gap-5 mt-4'>
					{notes.map((note) => (
						<NoteCard key={note._id} note={note} />
					))}
				</div>
			)}
		</div>
	);
}