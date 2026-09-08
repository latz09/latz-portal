// components/notes/GlobalNoteWidget.jsx
'use client';

import { useEffect } from 'react';
import NoteForm from './NoteForm';
import AddNoteButton from './AddNoteButton';
import { useNoteDraft } from './NoteDraftProvider';

export default function GlobalNoteWidget() {
	const { open, editOpen, openNote, closeNote, closeEditNote, hasDraft } =
		useNoteDraft();

	// Esc always closes whichever sheet is open. Ctrl/Cmd+J is a full
	// toggle: closes whichever sheet is open, or opens a new note if
	// neither is — J sits next to ClientSwitcher's K, same adjacent-key logic.
	useEffect(() => {
		function handler(e) {
			if (e.key === 'Escape') {
				if (editOpen) closeEditNote();
				else if (open) closeNote();
				return;
			}
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
				e.preventDefault();
				if (editOpen) closeEditNote();
				else if (open) closeNote();
				else openNote();
			}
		}
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open, editOpen, openNote, closeNote, closeEditNote]);

	return (
		<>
			{!open && !editOpen && (
				<AddNoteButton onClick={openNote} hasDraft={hasDraft} />
			)}
			<NoteForm mode='create' />
			<NoteForm mode='edit' />
		</>
	);
}