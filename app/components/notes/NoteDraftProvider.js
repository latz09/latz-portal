// components/notes/NoteDraftProvider.jsx
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { portableTextToMarkdownLite } from '@/app/utils/notesMarkdown';

const NoteDraftContext = createContext(null);

const EMPTY_DRAFT = {
	title: '',
	body: '',
	type: 'general',
	pinned: false,
	backBurner: false,
	clientId: '',
	clientName: '',
	projectId: '',
	projectName: '',
};

const EMPTY_EDIT_DRAFT = {
	...EMPTY_DRAFT,
	_id: null,
	hasUnsupportedContent: false,
};

function isDraftEmpty(draft) {
	return (
		!draft.title.trim() &&
		!draft.body.trim() &&
		!draft.clientId &&
		!draft.projectId &&
		!draft.pinned &&
		!draft.backBurner &&
		draft.type === 'general'
	);
}

export function NoteDraftProvider({ clients, children }) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(EMPTY_DRAFT);
	const [pageContext, setPageContext] = useState(null);

	const [editOpen, setEditOpen] = useState(false);
	const [editDraft, setEditDraft] = useState(EMPTY_EDIT_DRAFT);

	const openNote = useCallback(() => {
		setDraft((prev) => {
			if (!pageContext) return prev;
			let next = prev;
			if (!next.clientId) {
				next = {
					...next,
					clientId: pageContext.clientId,
					clientName: pageContext.clientName,
				};
			}
			if (!next.projectId && next.clientId === pageContext.clientId) {
				next = {
					...next,
					projectId: pageContext.projectId,
					projectName: pageContext.projectName,
				};
			}
			return next;
		});
		setEditOpen(false);
		setOpen(true);
	}, [pageContext]);

	const closeNote = useCallback(() => setOpen(false), []);
	const resetDraft = useCallback(() => setDraft(EMPTY_DRAFT), []);

	const openEditNote = useCallback((note) => {
		const { text, hasUnsupportedContent } = portableTextToMarkdownLite(note.body);
		setEditDraft({
			_id: note._id,
			title: note.title || '',
			body: text,
			type: note.type || 'general',
			pinned: !!note.pinned,
			backBurner: !!note.backBurner,
			clientId: note.clientId || '',
			clientName: note.clientName || '',
			projectId: note.projectId || '',
			projectName: note.projectName || '',
			hasUnsupportedContent,
		});
		setOpen(false);
		setEditOpen(true);
	}, []);

	const closeEditNote = useCallback(() => setEditOpen(false), []);

	const registerPageContext = useCallback((ctx) => setPageContext(ctx), []);
	const clearPageContext = useCallback(() => setPageContext(null), []);

	const hasDraft = !isDraftEmpty(draft);

	const value = {
		open,
		openNote,
		closeNote,
		draft,
		setDraft,
		resetDraft,
		hasDraft,
		editOpen,
		editDraft,
		setEditDraft,
		openEditNote,
		closeEditNote,
		clients,
		pageContext,
		registerPageContext,
		clearPageContext,
	};

	return (
		<NoteDraftContext.Provider value={value}>
			{children}
		</NoteDraftContext.Provider>
	);
}

export function useNoteDraft() {
	const ctx = useContext(NoteDraftContext);
	if (!ctx) throw new Error('useNoteDraft must be used within NoteDraftProvider');
	return ctx;
}

export function useRegisterNoteContext({
	clientId,
	clientName,
	projectId,
	projectName,
} = {}) {
	const { registerPageContext, clearPageContext } = useNoteDraft();
	useEffect(() => {
		if (!clientId) return;
		registerPageContext({ clientId, clientName, projectId, projectName });
		return () => clearPageContext();
	}, [clientId, clientName, projectId, projectName, registerPageContext, clearPageContext]);
}