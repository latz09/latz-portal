// components/notes/ProjectNotesProvider.jsx
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRegisterNoteContext } from './NoteDraftProvider';

const ProjectNotesContext = createContext(null);

export function ProjectNotesProvider({
	initialNotes,
	clientId,
	clientName,
	projectId,
	projectName,
	children,
}) {
	const [notes, setNotes] = useState(initialNotes);

	useEffect(() => {
		setNotes(initialNotes);
	}, [initialNotes]);

	useRegisterNoteContext({ clientId, clientName, projectId, projectName });

	const archiveNote = useCallback((id) => {
		setNotes((prev) => prev.filter((n) => n._id !== id));
	}, []);

	const markSent = useCallback((id) => {
		setNotes((prev) =>
			prev.map((n) =>
				n._id === id ? { ...n, sentAt: new Date().toISOString() } : n,
			),
		);
	}, []);

	const togglePin = useCallback((id, newPinned) => {
		setNotes((prev) =>
			prev.map((n) => (n._id === id ? { ...n, pinned: newPinned } : n)),
		);
	}, []);

	const toggleBackBurner = useCallback((id, newBackBurner) => {
		setNotes((prev) =>
			prev.map((n) => (n._id === id ? { ...n, backBurner: newBackBurner } : n)),
		);
	}, []);

	const pinnedNotes = notes.filter((n) => n.pinned);

	const value = { notes, pinnedNotes, archiveNote, markSent, togglePin, toggleBackBurner };

	return (
		<ProjectNotesContext.Provider value={value}>
			{children}
		</ProjectNotesContext.Provider>
	);
}

export function useProjectNotes() {
	const ctx = useContext(ProjectNotesContext);
	if (!ctx) throw new Error('useProjectNotes must be used within ProjectNotesProvider');
	return ctx;
}