'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TbEdit, TbCheck, TbX } from 'react-icons/tb';
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
	marks: {
		link: ({ value, children }) => (
			<a
				href={value?.href}
				target='_blank'
				rel='noopener noreferrer'
				onClick={(e) => e.stopPropagation()}
				className='text-teal underline hover:text-white transition-colors'
			>
				{children}
			</a>
		),
	},
	list: {
		bullet: ({ children }) => (
			<ul
				style={{
					listStyleType: 'disc',
					paddingLeft: '1.25rem',
					marginBottom: '0.5rem',
				}}
			>
				{children}
			</ul>
		),
		number: ({ children }) => (
			<ol
				style={{
					listStyleType: 'decimal',
					paddingLeft: '1.25rem',
					marginBottom: '0.5rem',
				}}
			>
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }) => (
			<li style={{ marginBottom: '0.25rem' }}>{children}</li>
		),
		number: ({ children }) => (
			<li style={{ marginBottom: '0.25rem' }}>{children}</li>
		),
	},
	block: {
		normal: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
	},
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

function ArchiveConfirm({ noteTitle, onConfirm, onCancel, archiving }) {
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
			onClick={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
		>
			<div className='w-full max-w-sm bg-dark border border-white/10 rounded-lg shadow-2xl flex flex-col'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
					<p className='font-mono text-xs tracking-widest uppercase text-warning/80'>
						Archive Note
					</p>
					<button
						onClick={onCancel}
						className='text-white/30 hover:text-white transition-colors'
					>
						<TbX className='text-lg' />
					</button>
				</div>
				<div className='px-5 py-6 flex flex-col gap-6'>
					<p className='text-sm text-white/60'>
						Archive{' '}
						<span className='text-white font-medium'>{`"${noteTitle}"`}</span>?
						It will be moved to archived notes in Sanity.
					</p>
					<div className='flex justify-end gap-2'>
						<button
							onClick={onCancel}
							className='font-mono text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5'
						>
							Cancel
						</button>
						<button
							onClick={onConfirm}
							disabled={archiving}
							className='font-mono text-xs bg-teal/20 hover:bg-teal/30 disabled:opacity-40 disabled:cursor-not-allowed text-teal border border-teal/30 rounded px-4 py-1.5 transition-colors'
						>
							{archiving ? 'Archiving…' : 'Archive'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function NoteHeader({ note }) {
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
			<a
				href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
				target='_blank'
				onClick={(e) => e.stopPropagation()}
				className='text-warning/70 hover:text-warning transition-colors p-2 shrink-0 ml-2'
			>
				<TbEdit className='text-base lg:text-lg' />
			</a>
		</div>
	);
}

function NoteClientLink({ clientName, clientSlug }) {
	if (!clientName) return null;
	return clientSlug ? (
		<Link
			href={`/clients/${clientSlug}`}
			onClick={(e) => e.stopPropagation()}
			className='font-mono text-xs text-teal hover:text-white transition-colors w-fit'
		>
			{clientName} →
		</Link>
	) : (
		<span className='font-mono text-xs text-white/30'>{clientName}</span>
	);
}

function NoteBody({ body, open }) {
	if (!body) return null;
	return (
		<div
			className={`text-sm text-white/80 max-w-none ${open ? '' : 'line-clamp-2'}`}
		>
			<PortableText value={body} components={PORTABLE_TEXT_COMPONENTS} />
		</div>
	);
}

function NoteFooter({ onArchiveClick, open }) {
	if (!open) return null;
	return (
		<div
			className='flex justify-end pt-1 border-t border-white/5 mt-1 group'
			onClick={(e) => e.stopPropagation()}
		>
			<button
				onClick={onArchiveClick}
				className='flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-teal transition-colors py-1.5 px-2'
			>
				<TbCheck className='text-sm text-teal group-hover:-translate-y-1 transition duration-300' />
				Mark complete
			</button>
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteCard({ note, onArchive }) {
	const [open, setOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [archiving, setArchiving] = useState(false);

	async function handleConfirm() {
    setArchiving(true);
    try {
        const res = await fetch(`/api/notes/${note._id}/archive`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed');
        setConfirming(false);
        onArchive(note._id);
    } catch {
        setArchiving(false);
        setConfirming(false);
    }
}

	return (
		<>
			{confirming && (
				<ArchiveConfirm
					noteTitle={note.title}
					onConfirm={handleConfirm}
					onCancel={() => setConfirming(false)}
					archiving={archiving}
				/>
			)}
			<div
				className='flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded px-4 py-3 transition-colors gap-2 cursor-pointer'
				onClick={() => setOpen(!open)}
			>
				<NoteHeader note={note} />
				<NoteClientLink
					clientName={note.clientName}
					clientSlug={note.clientSlug}
				/>
				<NoteBody body={note.body} open={open} />
				<NoteFooter open={open} onArchiveClick={() => setConfirming(true)} />
			</div>
		</>
	);
}
