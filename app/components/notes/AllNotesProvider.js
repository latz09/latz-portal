// components/notes/AllNotesProvider.jsx
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AllNotesContext = createContext(null);

export function AllNotesProvider({ initialNotes, children }) {
	const [notes, setNotes] = useState(initialNotes);

	useEffect(() => {
		setNotes(initialNotes);
	}, [initialNotes]);

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

	const value = { notes, archiveNote, markSent, togglePin, toggleBackBurner };

	return (
		<AllNotesContext.Provider value={value}>
			{children}
		</AllNotesContext.Provider>
	);
}

export function useAllNotes() {
	const ctx = useContext(AllNotesContext);
	if (!ctx) throw new Error('useAllNotes must be used within AllNotesProvider');
	return ctx;
}