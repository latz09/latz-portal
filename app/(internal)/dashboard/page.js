// dashboard

import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENTS_QUERY';
import { FETCH_NOTES_QUERY as NQ } from '@/app/data/queries/pages/FETCH_NOTES_QUERY';
import PortalFooter from '@/app/components/portal/PortalFooter';
import DashboardContent from '@/app/components/dashboard/DashboardContent';

export default async function Home() {
	const [clients, notes] = await Promise.all([f(Q), f(NQ)]);

	return (
		<main className=' max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-3 lg:py-6 2xl:py-12'>
			<DashboardContent clients={clients} initialNotes={notes} />

			<div className='max-w-3xl mx-auto'>
				<PortalFooter />
			</div>
		</main>
	);
}

export const revalidate = 10;