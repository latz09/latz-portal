'use client';

import { useState, useCallback, useEffect } from 'react';
import UpcomingDeadlines from '@/app/components/portal/UpcomingDeadlines';
import ClientList from '@/app/components/dashboard/ClientList';
import FocusStrip from '@/app/components/dashboard/FocusStrip';
import UpcomingLoad from '@/app/components/dashboard/UpcomingLoad';
import PinnedNotes from '@/app/components/notes/PinnedNotes';
import NoteList from '@/app/components/notes/NoteList';

export default function DashboardContent({ clients, initialNotes }) {
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

	const pinnedNotes = notes.filter((n) => n.pinned);

	// Dashboard-only visibility rule: a back-burner note with no project
	// stays off the main list — it's still fully visible/editable on the
	// new All Notes page, and if it IS tied to a project, it still shows
	// here too (only the "internal, no rush" case gets hidden). Pinned
	// notes are unaffected since they're computed separately above and
	// never pass through this filter — pin always wins.
	const dashboardVisibleNotes = notes.filter(
		(n) => !(n.backBurner && !n.projectId),
	);

	return (
		<div className='flex flex-col lg:grid lg:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_480px] lg:gap-12 lg:items-start'>
			<div className='dash-col-2'>
				<UpcomingLoad clients={clients} />
				<FocusStrip
					clients={clients}
					pinnedNotes={pinnedNotes}
					onArchive={archiveNote}
					onPinToggle={togglePin}
					onBackBurnerToggle={toggleBackBurner}
				/>
				<NoteList
					notes={dashboardVisibleNotes}
					onArchive={archiveNote}
					onSent={markSent}
					onPinToggle={togglePin}
					onBackBurnerToggle={toggleBackBurner}
				/>
				<UpcomingDeadlines clients={clients} variant='internal' />
			</div>
			<div className='hidden lg:block lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:sticky lg:top-[88px] lg:pl-2'>
				<div className='dash-col-1 flex flex-col gap-6 lg:gap-8 2xl:gap-12 pb-20'>
					<ClientList clients={clients} />
					<PinnedNotes
						notes={pinnedNotes}
						compact
						defaultOpen
						onArchive={archiveNote}
						onPinToggle={togglePin}
						onBackBurnerToggle={toggleBackBurner}
					/>
				</div>
			</div>
		</div>
	);
}