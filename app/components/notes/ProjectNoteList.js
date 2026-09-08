// components/notes/ProjectNoteList.jsx
'use client';

import NoteList from './NoteList';
import { useProjectNotes } from './ProjectNotesProvider';

export default function ProjectNoteList() {
	const { notes, archiveNote, markSent, togglePin, toggleBackBurner } = useProjectNotes();

	return (
		<NoteList
			notes={notes}
			onArchive={archiveNote}
			onSent={markSent}
			onPinToggle={togglePin}
			onBackBurnerToggle={toggleBackBurner}
		/>
	);
}