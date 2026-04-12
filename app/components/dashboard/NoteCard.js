'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TbEdit, TbCheck } from 'react-icons/tb';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
	general: 'text-white/40',
	idea: 'text-purple',
	task: 'text-teal',
	link: 'text-warning',
	asset: 'text-white/40',
};

const PORTABLE_TEXT_COMPONENTS = {
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

// ─── Subcomponents ───────────────────────────────────────────────────────────

function NoteHeader({ note, onArchive, archiving }) {
	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-2 min-w-0'>
				<span
					className={`font-mono text-[10px] tracking-widest uppercase border rounded px-1.5 py-0.5 shrink-0 ${TYPE_COLORS[note.type]}`}
				>
					{note.type}
				</span>
				<span className='text-sm font-medium truncate'>{note.title}</span>
			</div>
			<div className='flex items-center gap-1 shrink-0 ml-2'>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onArchive();
					}}
					disabled={archiving}
					className='text-white/30 hover:text-teal disabled:opacity-30 transition-colors p-2'
					title='Mark complete'
				>
					<TbCheck className='text-base lg:text-lg' />
				</button>
				<a
					href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
					target='_blank'
					onClick={(e) => e.stopPropagation()}
					className='text-warning/70 hover:text-warning transition-colors p-2'
				>
					<TbEdit className='text-base lg:text-lg' />
				</a>
			</div>
		</div>
	);
}

function NoteClientLink({ clientName, clientSlug }) {
	if (!clientName) return null;
	return clientSlug ? (
		<Link
			href={`/clients/${clientSlug}`}
			onClick={(e) => e.stopPropagation()}
			className='font-mono text-xs text-teal hover:text-white transition-colors w-fit mb-2'
		>
			{clientName} →
		</Link>
	) : (
		<span className='font-mono text-xs text-white/30 '>{clientName}</span>
	);
}

function NoteBody({ body, open }) {
	if (!body) return null;
	return (
		<div
			className={`mb-4 text-base lg:text-lg text-white/80 prose prose-invert prose-sm max-w-none ${open ? '' : 'line-clamp-2'}`}
		>
			<PortableText value={body} components={PORTABLE_TEXT_COMPONENTS} />
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteCard({ note, onArchive }) {
	const [open, setOpen] = useState(false);
	const [archiving, setArchiving] = useState(false);

	async function handleArchive() {
		setArchiving(true);
		try {
			const res = await fetch(`/api/notes/${note._id}/archive`, {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed');
			onArchive(note._id);
		} catch {
			setArchiving(false);
		}
	}

	return (
		<div
			className={`flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded px-4 py-3 transition-colors gap-2 cursor-pointer ${archiving ? 'opacity-40' : ''}`}
			onClick={() => setOpen(!open)}
		>
			<NoteHeader note={note} onArchive={handleArchive} archiving={archiving} />
			<NoteClientLink
				clientName={note.clientName}
				clientSlug={note.clientSlug}
				type={note.type}
			/>
			<NoteBody body={note.body} open={open} />
		</div>
	);
}
