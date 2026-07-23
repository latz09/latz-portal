import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENTS_QUERY';
import { FETCH_NOTES_QUERY as NQ } from '@/app/data/queries/pages/FETCH_NOTES_QUERY';
import UpcomingDeadlines from '@/app/components/portal/UpcomingDeadlines';
import PortalFooter from '@/app/components/portal/PortalFooter';
import ClientList from '@/app/components/dashboard/ClientList';
import NoteList from '@/app/components/dashboard/NoteList';

export default async function Home() {
	const [clients, notes] = await Promise.all([f(Q), f(NQ)]);

	return (
		<main className='max-w-360 mx-auto px-3 lg:px-6 py-6 lg:py-12 w-full'>
			<div className='flex flex-col lg:grid lg:grid-cols-[1fr_380px] lg:gap-12 lg:items-start'>
				<div className='order-2 lg:order-1'>
					<NoteList notes={notes} />
					<UpcomingDeadlines clients={clients} variant='internal' />
				</div>
				<div className='order-1 lg:order-2 mt-0 mb-16 lg:mt-0 lg:mb-0 lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:sticky lg:top-8 lg:pl-2'>
					<ClientList clients={clients} />
				</div>
			</div>

			<div className='max-w-3xl mx-auto'>
				<PortalFooter />
			</div>
		</main>
	);
}

export const revalidate = 10;