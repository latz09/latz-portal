'use client'

import { useState } from 'react'
import { TbChevronDown, TbPlus } from 'react-icons/tb'
import NoteCard from './NoteCard'

// ─── Subcomponents ───────────────────────────────────────────────────────────

function AddNoteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className='flex items-center gap-1 font-mono text-sm lg:text-lg text-white/70 hover:text-warning/75 transition-colors border border-warning/30 px-2 py-0.5 rounded'
    >
      <TbPlus className='text-xs md:text-sm lg:text-lg text-warning' />
      Add Note
    </button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className='flex justify-center'>
      <AddNoteButton onClick={onAdd} />
    </div>
  )
}

function NoteListHeader({ onAdd }) {
  return (
    <div className='flex items-center justify-between mb-4 lg:mb-6'>
      <p className='font-mono text-xs lg:text-base text-warning/80 tracking-widest uppercase'>
        Notes
      </p>
      <AddNoteButton onClick={onAdd} />
    </div>
  )
}

function ExpandToggle({ expanded, count, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className='flex items-center gap-2 font-mono text-sm lg:text-base text-white/50 hover:text-white/60 transition-colors pt-1'
    >
      <TbChevronDown className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      {expanded ? 'Show less' : `${count} more`}
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NoteList({ notes: initialNotes = [] }) {
  const [notes, setNotes]     = useState(initialNotes)
  const [expanded, setExpanded] = useState(false)

  function handleAddNote() {
    window.open('https://latz-portal.sanity.studio/structure/note', '_blank')
  }

  function handleArchive(id) {
    setNotes(prev => prev.filter(n => n._id !== id))
  }

  const first = notes[0]
  const rest  = notes.slice(1)

  if (notes.length === 0) {
    return (
      <div className='mb-12'>
        <EmptyState onAdd={handleAddNote} />
      </div>
    )
  }

  return (
    <div className='mb-12'>
      <NoteListHeader onAdd={handleAddNote} />
      <div className='flex flex-col gap-2'>
        <NoteCard note={first} onArchive={handleArchive} />
        {expanded && rest.map(note => (
          <NoteCard key={note._id} note={note} onArchive={handleArchive} />
        ))}
        {rest.length > 0 && (
          <ExpandToggle
            expanded={expanded}
            count={rest.length}
            onToggle={() => setExpanded(!expanded)}
          />
        )}
      </div>
    </div>
  )
}