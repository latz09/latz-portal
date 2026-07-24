// components/dashboard/NoteCard.jsx

'use client';

import Link from 'next/link';
import { useState, Children } from 'react';
import {
	TbEdit,
	TbCheck,
	TbX,
	TbMailCheck,
	TbMail,
	TbPinFilled,
	TbPin,
	TbNote,
	TbBulb,
	TbListCheck,
	TbLink,
	TbPaperclip,
} from 'react-icons/tb';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

// ─── Constants ───────────────────────────────────────────────────────────────

// Icon per type. Color is held back to white/30 for the label itself —
// only the glyph carries a tint, so six note types don't turn the board
// into a color chart.
const TYPE_CONFIG = {
	general: { icon: TbNote, color: 'text-white/30' },
	idea: { icon: TbBulb, color: 'text-purple/70' },
	task: { icon: TbListCheck, color: 'text-teal/70' },
	link: { icon: TbLink, color: 'text-warning/70' },
	asset: { icon: TbPaperclip, color: 'text-white/40' },
	email: { icon: TbMail, color: 'text-teal/70' },
};

const URL_TEST = /^https?:\/\/[^\s]+$/;
const URL_SPLIT = /(https?:\/\/[^\s]+)/g;

function shortenUrl(url) {
	try {
		const u = new URL(url);
		const path =
			u.pathname.length > 20 ? u.pathname.slice(0, 20) + '…' : u.pathname;
		return `${u.hostname}${path}`;
	} catch {
		return url;
	}
}

// Turns any plain-typed URL inside note body text into a clean clickable
// link, without needing the Sanity editor to manually apply a link mark.
function linkifyChildren(children) {
	return Children.map(children, (child) => {
		if (typeof child !== 'string') return child;
		return child.split(URL_SPLIT).map((part, i) =>
			URL_TEST.test(part) ? (
				<a
					key={i}
					href={part}
					target='_blank'
					rel='noopener noreferrer'
					onClick={(e) => e.stopPropagation()}
					className='text-teal underline hover:text-white transition-colors break-all'
				>
					{shortenUrl(part)}
				</a>
			) : (
				part
			),
		);
	});
}

const PORTABLE_TEXT_COMPONENTS = {
	types: {
		image: ({ value }) => {
			if (!value?.url) return null;
			return (
				<Image
					src={value.url}
					alt={value.caption || ''}
					className='rounded-lg max-w-full my-2 aspect-square'
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
					paddingLeft: '1.1rem',
					marginBottom: '0.4rem',
				}}
			>
				{children}
			</ul>
		),
		number: ({ children }) => (
			<ol
				style={{
					listStyleType: 'decimal',
					paddingLeft: '1.1rem',
					marginBottom: '0.4rem',
				}}
			>
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }) => (
			<li style={{ marginBottom: '0.2rem' }}>{linkifyChildren(children)}</li>
		),
		number: ({ children }) => (
			<li style={{ marginBottom: '0.2rem' }}>{linkifyChildren(children)}</li>
		),
	},
	block: {
		normal: ({ children }) => (
			<p className='mb-2 last:mb-0'>{linkifyChildren(children)}</p>
		),
	},
};

function getSentLabel(sentAt) {
	if (!sentAt) return null;
	const days = Math.floor((Date.now() - new Date(sentAt)) / 86_400_000);
	if (days === 0) return 'Sent today';
	if (days === 1) return 'Sent yesterday';
	return `Sent ${days} days ago`;
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function ArchiveConfirm({ noteTitle, onConfirm, onCancel, archiving }) {
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4'
			onClick={(e) => {
				if (e.target === e.currentTarget) onCancel();
			}}
		>
			<div className='w-full max-w-sm bg-[#12151c] border border-white/15 rounded-xl shadow-2xl shadow-black/60 flex flex-col'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
					<p className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
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
							className='font-mono text-xs bg-teal/15 hover:bg-teal/25 disabled:opacity-40 disabled:cursor-not-allowed text-teal border border-teal/30 rounded-lg px-4 py-1.5 transition-colors'
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
	const { icon: TypeIcon, color } =
		TYPE_CONFIG[note.type] || TYPE_CONFIG.general;

	return (
		<div className='flex items-start justify-between gap-2'>
			<div className='flex flex-col min-w-0 gap-1'>
				<span className='inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-white/30'>
					<TypeIcon className={`text-xs ${color}`} />
					{note.type}
				</span>
				<span className='text-sm font-medium text-white leading-tight'>
					{note.title}
				</span>
			</div>
			<div className='flex items-center shrink-0 -mr-1.5 -mt-1'>
				<a
					href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
					target='_blank'
					onClick={(e) => e.stopPropagation()}
					className='hidden sm:block text-white/20 hover:text-warning transition-colors p-2'
				>
					<TbEdit className='text-base' />
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
							: 'text-white/15 hover:text-warning/70'
					} ${pinning ? 'opacity-40' : ''}`}
					title={pinned ? 'Unpin' : 'Pin to Do Now'}
				>
					{pinned ? (
						<TbPinFilled className='text-base' />
					) : (
						<TbPin className='text-base' />
					)}
				</button>
			</div>
		</div>
	);
}

function NoteContextLink({ clientName, clientSlug, projectName, projectSlug }) {
	if (!clientName) return null;

	const cls =
		'font-mono text-[11px] text-white/40 hover:text-teal transition-colors w-fit';

	if (projectName && clientSlug && projectSlug) {
		return (
			<Link
				href={`/clients/${clientSlug}/${projectSlug}`}
				onClick={(e) => e.stopPropagation()}
				className={cls}
			>
				{clientName} · {projectName} →
			</Link>
		);
	}

	return clientSlug ? (
		<Link
			href={`/clients/${clientSlug}`}
			onClick={(e) => e.stopPropagation()}
			className={cls}
		>
			{clientName} →
		</Link>
	) : (
		<span className='font-mono text-[11px] text-white/25'>{clientName}</span>
	);
}

function NoteBody({ body, open }) {
	if (!body) return null;
	return (
		<div
			className={`text-sm text-white/65 max-w-none wrap-break-word ${
				open ? '' : 'line-clamp-2'
			}`}
		>
			<PortableText value={body} components={PORTABLE_TEXT_COMPONENTS} />
		</div>
	);
}

function NoteFooter({ note, onArchiveClick, onSendClick, sending, overdue }) {
	const isEmail = note.type === 'email';
	const isSent = !!note.sentAt;

	return (
		<div
			className='flex items-center justify-between gap-3 pt-2.5 border-t border-white/[0.06] mt-auto'
			onClick={(e) => e.stopPropagation()}
		>
			{/* Edit + sent state — left side */}
			<div className='flex items-center gap-2 min-w-0'>
				<a
					href={`https://latz-portal.sanity.studio/structure/note;${note._id}`}
					target='_blank'
					className='sm:hidden text-white/20 hover:text-warning transition-colors py-1.5 pr-1'
				>
					<TbEdit className='text-base' />
				</a>
				{isEmail && isSent && (
					<span
						className={`flex items-center gap-1.5 font-mono text-[11px] truncate ${
							overdue ? 'text-danger' : 'text-white/35'
						}`}
					>
						{!overdue && <TbMailCheck className='text-sm text-teal/60' />}
						{getSentLabel(note.sentAt)}
						{overdue && (
							<span className='text-[10px] tracking-widest uppercase text-danger/60'>
								· overdue
							</span>
						)}
					</span>
				)}
			</div>

			{/* Actions — right side */}
			<div className='flex items-center gap-1 shrink-0'>
				{isEmail && !isSent && (
					<button
						onClick={onSendClick}
						disabled={sending}
						className='flex items-center gap-1.5 font-mono text-[11px] text-white/40 hover:text-teal disabled:opacity-40 transition-colors py-1.5 px-2'
					>
						<TbMail className='text-sm' />
						{sending ? 'Marking…' : 'Mark sent'}
					</button>
				)}
				<button
					onClick={onArchiveClick}
					className='flex items-center gap-1.5 font-mono text-[11px] text-white/40 hover:text-teal transition-colors py-1.5 px-2 group'
				>
					<TbCheck className='text-sm group-hover:-translate-y-0.5 transition duration-300' />
					{isEmail && isSent ? 'Got reply' : 'Mark complete'}
				</button>
			</div>
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteCard({
	note,
	onArchive,
	onSent,
	onPinToggle,
	overdue,
}) {
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

	// Surface, not flood. Overdue and pinned change the border and lift —
	// the state signal itself lives in the footer, so seven overdue cards
	// don't turn the section into a wall of red.
	const surface = pinned
		? 'bg-white/[0.06] border-warning/25 shadow-lg shadow-black/30'
		: overdue
			? 'bg-white/[0.03] border-danger/25'
			: 'bg-white/[0.03] border-white/[0.08]';

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
				className={`flex flex-col min-w-0 h-full border rounded-xl px-4 py-3.5 gap-2.5 cursor-pointer transition-colors hover:bg-white/[0.07] ${surface}`}
				onClick={() => setOpen(!open)}
			>
				<NoteHeader
					note={hydratedNote}
					pinned={pinned}
					onPinToggle={handlePinToggle}
					pinning={pinning}
				/>
				<NoteContextLink
					clientName={note.clientName}
					clientSlug={note.clientSlug}
					projectName={note.projectName}
					projectSlug={note.projectSlug}
				/>
				<NoteBody body={note.body} open={open} />
				<NoteFooter
					note={hydratedNote}
					onArchiveClick={() => setConfirming(true)}
					onSendClick={handleSend}
					sending={sending}
					overdue={overdue}
				/>
			</div>
		</>
	);
}