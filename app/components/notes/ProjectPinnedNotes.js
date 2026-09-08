// components/notes/ProjectPinnedNotes.jsx
'use client';

import PinnedNotes from './PinnedNotes';
import { useProjectNotes } from './ProjectNotesProvider';

export default function ProjectPinnedNotes({ pulseOnLoad }) {
	const { pinnedNotes, archiveNote, togglePin, toggleBackBurner } = useProjectNotes();

	return (
		<PinnedNotes
			notes={pinnedNotes}
			pulseOnLoad={pulseOnLoad}
			onArchive={archiveNote}
			onPinToggle={togglePin}
			onBackBurnerToggle={toggleBackBurner}
		/>
	);
}