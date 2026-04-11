'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TbChevronDown, TbPlus, TbEdit } from 'react-icons/tb';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

const typeColors = {
	general: 'text-white/40',
	idea: 'text-purple',
	task: 'text-teal',
	link: 'text-warning',
	asset: 'text-white/40',
};

const portableTextComponents = {
	types: {
		image: ({ value }) => {
			if (!value?.url) return null;
			return (
				<Image
					src={value.url}
					alt={value.caption || ''}
					className='rounded max-w-full my-2 aspect-square'
					width={500}
					height={500}
				/>
			);
		},
	},
};

function NoteCard({ note }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className='flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded px-4 py-3 transition-colors gap-2 cursor-pointer'
			onClick={() => setOpen(!open)}
		>
			{/* Header row */}
			<div className='flex items-center justify-between'>
				<span className='text-sm font-medium'>{note.title}</span>
				<div className='flex items-center gap-3 shrink-0 ml-2'>
					<span
						className={`font-mono text-[10px] tracking-widest uppercase ${typeColors[note.type]}`}
					>
						{note.type}
					</span>
					<a
						href={`https://latz-portal.sanity.studio/structure/note;new;${note._id}`}
						target='_blank'
						onClick={(e) => e.stopPropagation()}
						className='text-warning/70 hover:text-warning transition-colors p-2'
					>
						<TbEdit className='text-base lg:text-lg' />
					</a>
				</div>
			</div>

			{/* Client link */}
			{note.clientName &&
				(note.clientSlug ? (
					<Link
						href={`/clients/${note.clientSlug}`}
						onClick={(e) => e.stopPropagation()}
						className='font-mono text-xs text-teal hover:text-white transition-colors w-fit'
					>
						{note.clientName} →
					</Link>
				) : (
					<span className='font-mono text-xs text-white/30'>
						{note.clientName}
					</span>
				))}

			{/* Body — collapsed: 2 line clamp. expanded: full */}
			{note.body && (
				<div
					className={`text-sm text-white/60 prose prose-invert prose-sm max-w-none ${open ? '' : 'line-clamp-2'}`}
				>
					<PortableText value={note.body} components={portableTextComponents} />
				</div>
			)}
		</div>
	);
}

export default function NoteList({ notes }) {
	const [expanded, setExpanded] = useState(false);

	const first = notes?.[0];
	const rest = notes?.slice(1) ?? [];

	return (
		<div className='mb-12'>
			{!notes?.length ? (
				<div className='flex justify-center'>
					<a
						href='https://latz-portal.sanity.studio/structure/note;new'
						target='_blank'
						className='flex items-center gap-1 font-mono text-sm lg:text-lg text-white/70 hover:text-warning/75 transition-colors border border-warning/30 px-2 py-0.5 rounded'
					>
						<TbPlus className='text-sm lg:text-lg text-warning' />
						Add Note
					</a>
				</div>
			) : (
				<>
					<div className='flex items-center justify-between mb-4 lg:mb-6'>
						<p className='font-mono text-xs lg:text-base text-warning/80 tracking-widest uppercase'>
							Notes
						</p>
						<a
							href='https://latz-portal.sanity.studio/structure/note;new'
							target='_blank'
							className='flex items-center gap-1 font-mono text-sm lg:text-lg text-white/70 hover:text-teal transition-colors border px-2 py-0.5 rounded'
						>
							<TbPlus className='text-sm lg:text-lg' />
							Add Note
						</a>
					</div>

					<div className='flex flex-col gap-2'>
						<NoteCard note={first} />

						{expanded && rest.map(note => (
							<NoteCard key={note._id} note={note} />
						))}

						{rest.length > 0 && (
							<button
								onClick={() => setExpanded(!expanded)}
								className='flex items-center gap-2 font-mono text-sm lg:text-base text-white/50 hover:text-white/60 transition-colors pt-1'
							>
								<TbChevronDown
									className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
								/>
								{expanded ? 'Show less' : `${rest.length} more`}
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}