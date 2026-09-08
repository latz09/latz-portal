'use client';

import { useState } from 'react';
import NoteList from './NoteList';
import NoteForm from './NoteForm';
import AddNoteButton from './AddNoteButton';

export default function DashboardNotesArea({
	notes,
	clients,
	onCreated,
	onArchive,
	onSent,
	onPinToggle,
}) {
	const [showForm, setShowForm] = useState(false);

	return (
		<>
			<NoteList
				notes={notes}
				onArchive={onArchive}
				onSent={onSent}
				onPinToggle={onPinToggle}
			/>

			{!showForm && <AddNoteButton onClick={() => setShowForm(true)} />}

			<NoteForm
				open={showForm}
				clients={clients}
				onClose={() => setShowForm(false)}
				onCreated={onCreated}
			/>
		</>
	);
}