'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TbEdit } from 'react-icons/tb'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_COLORS = {
	general: 'text-white/40',
	idea:    'text-purple',
	task:    'text-teal',
	link:    'text-warning',
	asset:   'text-white/40',
}

const PORTABLE_TEXT_COMPONENTS = {
	types: {
		image: ({ value }) => {
			if (!value?.url) return null
			return (
				<Image
					src={value.url}
					alt={value.caption || ''}
					className='rounded max-w-full my-2 aspect-square'
					width={500}
					height={500}
				/>
			)
		},
	},
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function NoteHeader({ note }) {
	return (
		<div className='flex items-center justify-between'>
			<span className='text-sm font-medium'>{note.title}</span>
			<div className='flex items-center gap-3 shrink-0 ml-2'>
				<span className={`font-mono text-[10px] tracking-widest uppercase ${TYPE_COLORS[note.type]}`}>
					{note.type}
				</span>
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
	)
}

function NoteClientLink({ clientName, clientSlug }) {
	if (!clientName) return null
	if (clientSlug) {
		return (
			<Link
				href={`/clients/${clientSlug}`}
				onClick={(e) => e.stopPropagation()}
				className='font-mono text-xs text-teal hover:text-white transition-colors w-fit'
			>
				{clientName} →
			</Link>
		)
	}
	return <span className='font-mono text-xs text-white/30'>{clientName}</span>
}

function NoteBody({ body, open }) {
	if (!body) return null
	return (
		<div className={`text-sm text-white/60 prose prose-invert prose-sm max-w-none ${open ? '' : 'line-clamp-2'}`}>
			<PortableText value={body} components={PORTABLE_TEXT_COMPONENTS} />
		</div>
	)
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteCard({ note }) {
	const [open, setOpen] = useState(false)

	return (
		<div
			className='flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded px-4 py-3 transition-colors gap-2 cursor-pointer'
			onClick={() => setOpen(!open)}
		>
			<NoteHeader note={note} />
			<NoteClientLink clientName={note.clientName} clientSlug={note.clientSlug} />
			<NoteBody body={note.body} open={open} />
		</div>
	)
}