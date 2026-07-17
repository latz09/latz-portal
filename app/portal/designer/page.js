import { signOut } from '@/auth';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_DESIGNER_PORTAL_INDEX_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_INDEX_QUERY';
import { FETCH_DESIGNER_PORTAL_HANDOFF_QUERY as HQ } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_HANDOFF_QUERY';
import { FETCH_DESIGNER_OVERVIEW_QUERY as TQ } from '@/app/data/queries/pages/FETCH_DESIGNER_OVERVIEW_QUERY';
import PortalPageHeader from '@/app/components/portal/PortalPageHeader';
import PortalFooter from '@/app/components/portal/PortalFooter';
import DesignerHomeView from '@/app/components/portal/DesignerHomeView';

export default async function DesignerPortalIndex() {
	const [clients, handoffClients, tableProjects] = await Promise.all([
		f(Q),
		f(HQ),
		f(TQ),
	]);

	return (
		<main className='max-w-7xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<PortalPageHeader
				variant='designer'
				label='Alyssa Shurbert-Hetzel'
				title='Your Active Projects'
			/>

			<DesignerHomeView
				clients={clients}
				handoffClients={handoffClients}
				tableProjects={tableProjects}
			/>

			<form
				action={async () => {
					'use server';
					await signOut({ redirectTo: '/login' });
				}}
				className='mt-12 flex justify-center'
			>
				<button
					type='submit'
					className='font-mono text-xs px-4 py-2 rounded-full bg-white/5 text-white/40 hover:bg-danger/20 hover:text-danger transition-colors'
				>
					Sign Out
				</button>
			</form>
			<PortalFooter />
		</main>
	);
}

export const revalidate = 10;