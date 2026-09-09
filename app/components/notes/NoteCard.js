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
	TbHourglass,
	TbHourglassEmpty,
	TbNote,
	TbBulb,
	TbListCheck,
	TbLink,
	TbPaperclip,
} from 'react-icons/tb';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { useNoteDraft } from './NoteDraftProvider';

// ─── Constants ───────────────────────────────────────────────────────────────

// accent maps into PILL_STYLES below — same teal/purple/white/warning bucket
// convention as Pill.jsx's ACCENTS.fill, applied here to note type badges.
const TYPE_CONFIG = {
	general: { icon: TbNote, accent: 'white' },
	idea: { icon: TbBulb, accent: 'purple' },
	task: { icon: TbListCheck, accent: 'teal' },
	link: { icon: TbLink, accent: 'warning' },
	asset: { icon: TbPaperclip, accent: 'white' },
	email: { icon: TbMail, accent: 'teal' },
};

const PILL_STYLES = {
	teal: 'bg-teal/45 border-teal/30 text-white/90',
	purple: 'bg-purple/45 border-purple/30 text-white/90',
	white: 'bg-white/30 border-white/30 text-white/90',
	warning: 'bg-warning border-warning text-dark',
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
					className='text-teal lg:text-lg underline font-mono tracking-wider  hover:text-white transition-colors break-all'
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
					paddingLeft: '1.5rem',
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
					paddingLeft: '1.5rem',
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
			<div className='w-full max-w-lg bg-[#12151c] border border-warning/40 rounded-xl shadow-2xl shadow-black/60 flex flex-col'>
				<div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
					<p className='font-mono text-[10px] lg:text-[12px] tracking-widest uppercase text-warning'>
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
					<p className='text-sm lg:text-base text-white/60'>
						Archive{' '}
						<span className='text-warning font-medium'>{`"${noteTitle}"`}</span>?
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
							className='font-mono text-xs bg-warning hover:bg-teal/25 disabled:opacity-40 disabled:cursor-not-allowed text-dark font-semibold border border-teal/30 rounded-lg px-4 py-1.5 transition-colors'
						>
							{archiving ? 'Archiving…' : 'Archive'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function TypeBadge({ type }) {
	const { icon: Icon, accent } = TYPE_CONFIG[type] || TYPE_CONFIG.general;
	return (
		<span
			className={`inline-flex items-center gap-1.5 lg:gap-3 font-mono text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border ${PILL_STYLES[accent]}`}
		>
			<Icon className='text-xs lg:text-base' />
			{type}
		</span>
	);
}

function BackBurnerBadge() {
	return (
		<span className='inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border bg-teal/10 border-teal/25 text-teal'>
			<TbHourglass className='text-xs' />
			Back Burner
		</span>
	);
}

// Badges left, actions right — title/client context now live below this row.
function NoteHeader({
	type,
	backBurner,
	pinned,
	onPinToggle,
	pinning,
	onBackBurnerToggle,
	settingBackBurner,
	onEdit,
}) {
	return (
		<div className='flex items-start justify-between gap-2 mb-2 lg:mb-4'>
			<div className='flex items-center gap-1.5 flex-wrap'>
				<TypeBadge type={type} />
				{backBurner && <BackBurnerBadge />}
			</div>
			<div className='flex items-center shrink-0 -mr-1.5 -mt-1'>
				<button
					type='button'
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
					className='hidden sm:block text-white/70 hover:text-warning transition-colors p-2'
				>
					<TbEdit className='text-base' />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onBackBurnerToggle();
					}}
					disabled={settingBackBurner}
					className={`transition-colors p-2 ${
						backBurner
							? 'text-teal hover:text-teal/60'
							: 'text-white/15 hover:text-teal/70'
					} ${settingBackBurner ? 'opacity-40' : ''}`}
					title={backBurner ? 'Remove from back burner' : 'Send to back burner'}
				>
					{backBurner ? (
						<TbHourglass className='text-base' />
					) : (
						<TbHourglassEmpty className='text-base' />
					)}
				</button>
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

// Client as a bold eyebrow, project demoted to a quiet subtitle underneath —
// same identity pattern FocusStrip's ClientLabel already established.
function NoteContext({ clientName, clientSlug, projectName, projectSlug }) {
	if (!clientName) return null;

	if (projectName && clientSlug && projectSlug) {
		return (
			<Link
				href={`/clients/${clientSlug}/${projectSlug}`}
				onClick={(e) => e.stopPropagation()}
				className='group flex flex-col gap-0.5 w-fit hover:translate-x-2 transition duration-300'
			>
				<span className='font-mono text-[11px] lg:text-[14px] font-semibold tracking-widest uppercase text-teal group-hover:text-teal/70 transition-colors'>
					{clientName}
				</span>
				<span className='font-mono text-[11px] text-white/50 group-hover:text-white/60 transition-colors'>
					{projectName}
				</span>
			</Link>
		);
	}

	if (clientSlug) {
		return (
			<Link
				href={`/clients/${clientSlug}`}
				onClick={(e) => e.stopPropagation()}
				className='font-mono text-[11px] font-semibold tracking-widest uppercase text-teal hover:text-white transition-colors w-fit'
			>
				{clientName}
			</Link>
		);
	}

	return (
		<span className='font-mono text-[11px] font-semibold tracking-widest uppercase text-teal/60'>
			{clientName}
		</span>
	);
}

function NoteBody({ body, open }) {
	if (!body) return null;
	return (
		<div
			className={`text-sm md:text-base 2xl:text-lg mt-2   text-white/75 max-w-none wrap-break-word ${
				open ? '' : 'line-clamp-2'
			}`}
		>
			<PortableText value={body} components={PORTABLE_TEXT_COMPONENTS} />
		</div>
	);
}

function NoteFooter({ note, onArchiveClick, onSendClick, sending, overdue, onEdit }) {
	const isEmail = note.type === 'email';
	const isSent = !!note.sentAt;

	return (
		<div
			className='flex items-center justify-between gap-3 pt-2.5 border-t border-white/[0.06] mt-auto'
			onClick={(e) => e.stopPropagation()}
		>
			<div className='flex items-center gap-2 min-w-0'>
				<button
					type='button'
					onClick={onEdit}
					className='sm:hidden text-white/20 hover:text-warning transition-colors py-1.5 pr-1'
				>
					<TbEdit className='text-base' />
				</button>
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
	onBackBurnerToggle,
	overdue,
}) {
	const [open, setOpen] = useState(note.pinned ?? false);
	const [confirming, setConfirming] = useState(false);
	const [archiving, setArchiving] = useState(false);
	const [sending, setSending] = useState(false);
	const [sentAt, setSentAt] = useState(note.sentAt ?? null);
	const [pinned, setPinned] = useState(note.pinned ?? false);
	const [pinning, setPinning] = useState(false);
	const [backBurner, setBackBurner] = useState(note.backBurner ?? false);
	const [settingBackBurner, setSettingBackBurner] = useState(false);
	const { openEditNote } = useNoteDraft();

	const hydratedNote = { ...note, sentAt };

	function handleEdit() {
		openEditNote(hydratedNote);
	}

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

	async function handleBackBurnerToggle() {
		setSettingBackBurner(true);
		const prev = backBurner;
		setBackBurner(!prev); // optimistic
		try {
			const res = await fetch(`/api/notes/${note._id}/backburner`, {
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed');
			onBackBurnerToggle?.(note._id, !prev);
		} catch {
			setBackBurner(prev); // rollback
		} finally {
			setSettingBackBurner(false);
		}
	}

	// Brought in line with the app-wide container recipe
	// (bg-white/[0.04] border-white/[0.08] rounded-xl) — pinned/overdue keep
	// their own accent, just lightened to match that same visual weight
	// instead of the old heavier border-white/40 default.
	const surface = pinned
		? 'bg-warning/5 border-warning/50 shadow-lg shadow-black/30'
		: overdue
			? 'bg-danger/10 border-danger/60'
			: 'bg-white/[0.04] border-white/[0.08]';

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
				className={`flex flex-col min-w-0 h-full border rounded-xl px-3 lg:px-6 py-7 lg:py-10 gap-2.5 cursor-pointer transition-colors hover:bg-white/[0.07] ${surface}`}
				onClick={() => setOpen(!open)}
			>
				<NoteHeader
					type={hydratedNote.type}
					backBurner={backBurner}
					pinned={pinned}
					onPinToggle={handlePinToggle}
					pinning={pinning}
					onBackBurnerToggle={handleBackBurnerToggle}
					settingBackBurner={settingBackBurner}
					onEdit={handleEdit}
				/>
				<NoteContext
					clientName={note.clientName}
					clientSlug={note.clientSlug}
					projectName={note.projectName}
					projectSlug={note.projectSlug}
				/>
				<span className='text-base lg:text-[17px] uppercase 2xl:text-lg font-[400] border-l lg:border-l-2 2xl:border-l-3 border-warning pl-1 lg:pl-2  tracking-wider text-white mt-1'>
					{note.title}
				</span>
				<NoteBody body={note.body} open={open} />
				<NoteFooter
					note={hydratedNote}
					onArchiveClick={() => setConfirming(true)}
					onSendClick={handleSend}
					sending={sending}
					overdue={overdue}
					onEdit={handleEdit}
				/>
			</div>
		</>
	);
}