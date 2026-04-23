// components/dashboard/NoteCard.jsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
	TbEdit,
	TbCheck,
	TbX,
	TbMailCheck,
	TbMail,
	TbPinFilled,
	TbPin,
} from 'react-icons/tb';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
	general: 'text-white/40',
	idea: 'text-purple',
	task: 'text-teal',
	link: 'text-warning',
	asset: 'text-white/40',
	email: 'text-teal',
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

function getSentLabel(sentAt) {
	if (!sentAt) return null;
	const days = Math.floor((Date.now() - new Date(sentAt)) / 86_400_000);
	if (days === 0) return 'Sent today';
	if (days === 1) return 'Sent yest.';
	return `Sent ${days} days ago`;
}

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

function NoteHeader({ note, pinned, onPinToggle, pinning }) {
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
			<div className='flex items-center shrink-0 lg:ml-2'>
				<a
					href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
					target='_blank'
					onClick={(e) => e.stopPropagation()}
					className='hidden sm:block text-warning/70 hover:text-warning transition-colors p-2'
				>
					<TbEdit className='text-base lg:text-lg' />
				</a>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onPinToggle();
					}}
					disabled={pinning}
					className={`transition-colors p-2 ${
						pinned
							? 'text-warning hover:text-warning/60'
							: 'text-white/20 hover:text-warning/70'
					} ${pinning ? 'opacity-40' : ''}`}
					title={pinned ? 'Unpin' : 'Pin to Do Now'}
				>
					{pinned ? (
						<TbPinFilled className='text-base lg:text-lg' />
					) : (
						<TbPin className='text-base lg:text-lg' />
					)}
				</button>
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

function NoteFooter({ note, onArchiveClick, onSendClick, sending, open }) {
	const isEmail = note.type === 'email';
	const isSent = !!note.sentAt;

	return (
		<div
			className='flex items-center justify-between pt-1 border-t border-white/5 mt-1'
			onClick={(e) => e.stopPropagation()}
		>
			{/* Edit + sent badge — left side */}
			<div className='flex items-center gap-2'>
				<a
					href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
					target='_blank'
					className='sm:hidden text-warning/70 hover:text-warning transition-colors p-2'
				>
					<TbEdit className='text-base lg:text-lg' />
				</a>
				{isEmail && isSent && (
					<span className='flex items-center gap-1.5 font-mono text-xs text-white/60'>
						<TbMailCheck className='text-base text-teal' />
						{getSentLabel(note.sentAt)} 
					</span>
				)}
			</div>

			{/* Actions — right side */}
			<div className='flex items-center gap-1'>
				{isEmail && !isSent && (
					<button
						onClick={onSendClick}
						disabled={sending}
						className='flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-teal disabled:opacity-40 transition-colors py-1.5 px-2'
					>
						<TbMail className='text-base text-teal' />
						{sending ? 'Marking…' : 'Mark sent'}
					</button>
				)}
				<button
					onClick={onArchiveClick}
					className='flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-teal transition-colors py-1.5 px-2 group'
				>
					<TbCheck className='text-sm text-teal group-hover:-translate-y-1 transition duration-300' />
					{isEmail && isSent ? 'Got reply' : 'Mark complete'}
				</button>
			</div>
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteCard({ note, onArchive, onSent, onPinToggle }) {
	const [open, setOpen] = useState(note.pinned ?? false);
	const [confirming, setConfirming] = useState(false);
	const [archiving, setArchiving] = useState(false);
	const [sending, setSending] = useState(false);
	const [sentAt, setSentAt] = useState(note.sentAt ?? null);
	const [pinned, setPinned] = useState(note.pinned ?? false);
	const [pinning, setPinning] = useState(false);

	const hydratedNote = { ...note, sentAt };

	async function handleConfirm() {
		setArchiving(true);
		try {
			const res = await fetch(`/api/notes/${note._id}/archive`, {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed');
			setConfirming(false);
			onArchive(note._id);
		} catch {
			setArchiving(false);
			setConfirming(false);
		}
	}

	async function handleSend() {
		setSending(true);
		try {
			const res = await fetch(`/api/notes/${note._id}/send`, {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed');
			const now = new Date().toISOString();
			setSentAt(now);
			onSent?.(note._id);
		} catch {
			// silent fail
		} finally {
			setSending(false);
		}
	}

	async function handlePinToggle() {
		setPinning(true);
		const prev = pinned;
		setPinned(!prev); // optimistic
		try {
			const res = await fetch(`/api/notes/${note._id}/pin`, {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed');
			onPinToggle?.(note._id, !prev);
		} catch {
			setPinned(prev); // rollback
		} finally {
			setPinning(false);
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
				className={`flex flex-col border rounded px-4 py-3 transition-colors gap-2 cursor-pointer ${
					pinned
						? 'bg-dark hover:bg-warning/10 border-warning/10 '
						: 'bg-white/5 hover:bg-white/10 border-white/10 mx-2'
				}`}
				onClick={() => setOpen(!open)}
			>
				<NoteHeader
					note={hydratedNote}
					pinned={pinned}
					onPinToggle={handlePinToggle}
					pinning={pinning}
				/>
				<NoteClientLink
					clientName={note.clientName}
					clientSlug={note.clientSlug}
				/>
				<NoteBody body={note.body} open={open} />
				<NoteFooter
					note={hydratedNote}
					open={open}
					onArchiveClick={() => setConfirming(true)}
					onSendClick={handleSend}
					sending={sending}
				/>
			</div>
		</>
	);
}
