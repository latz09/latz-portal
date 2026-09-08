// components/notes/DashboardNotesArea.jsx
'use client';

import { useRef, useState } from 'react';
import NoteList from './NoteList';
import NoteForm from './NoteForm';
import AddNoteButton from './AddNoteButton';

export default function DashboardNotesArea({ notes, clients }) {
	const noteListRef = useRef(null);
	const [showForm, setShowForm] = useState(false);

	function handleCreated(note) {
		noteListRef.current?.addNote(note);
	}

	return (
		<>
			<NoteList ref={noteListRef} notes={notes} />

			{!showForm && <AddNoteButton onClick={() => setShowForm(true)} />}

			<NoteForm
				open={showForm}
				clients={clients}
				onClose={() => setShowForm(false)}
				onCreated={handleCreated}
			/>
		</>
	);
}