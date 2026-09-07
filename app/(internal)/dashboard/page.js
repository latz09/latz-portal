// dashboard

import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENTS_QUERY';
import { FETCH_NOTES_QUERY as NQ } from '@/app/data/queries/pages/FETCH_NOTES_QUERY';
import UpcomingDeadlines from '@/app/components/portal/UpcomingDeadlines';
import PortalFooter from '@/app/components/portal/PortalFooter';
import ClientList from '@/app/components/dashboard/ClientList';
import NoteList from '@/app/components/dashboard/NoteList';
import FocusStrip from '@/app/components/dashboard/FocusStrip';
import UpcomingLoad from '@/app/components/dashboard/UpcomingLoad';
import PinnedNotes from '@/app/components/portal/PinnedNotes';

export default async function Home() {
	const [clients, notes] = await Promise.all([f(Q), f(NQ)]);
	const pinnedNotes = notes.filter((n) => n.pinned);

	return (
		<main className=' max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-3 lg:py-6 2xl:py-12'>
			<div className='flex flex-col lg:grid lg:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_480px] lg:gap-12 lg:items-start'>
				<div className='dash-col-2'>
					<UpcomingLoad clients={clients} />
					<FocusStrip clients={clients} pinnedNotes={pinnedNotes} />
					<NoteList notes={notes} />
					<UpcomingDeadlines clients={clients} variant='internal' />
				</div>
				<div className='hidden lg:block lg:h-[calc(100vh-88px)] lg:overflow-y-auto lg:sticky lg:top-[88px] lg:pl-2'>
					<div className='dash-col-1 flex flex-col gap-6 lg:gap-8 2xl:gap-12'>
						<ClientList clients={clients} />
						<PinnedNotes notes={pinnedNotes} compact defaultOpen />
					</div>
				</div>
			</div>

			<div className='max-w-3xl mx-auto'>
				<PortalFooter />
			</div>
		</main>
	);
}

export const revalidate = 10;