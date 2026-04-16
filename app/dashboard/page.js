import { signOut } from '@/auth';
import { fetchContent as f } from '../utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '../data/queries/pages/FETCH_CLIENTS_QUERY';
import { FETCH_NOTES_QUERY as NQ } from '../data/queries/pages/FETCH_NOTES_QUERY';
import PortalPageHeader from '../components/portal/PortalPageHeader';
import UpcomingDeadlines from '../components/portal/UpcomingDeadlines';
import PortalFooter from '../components/portal/PortalFooter';
import StudioLink from '../components/portal/StudioLink';
import ClientList from '../components/dashboard/ClientList';
import NoteList from '../components/dashboard/NoteList';

export default async function Home() {
	const [clients, notes] = await Promise.all([f(Q), f(NQ)]);

	return (
		<main className='max-w-3xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<PortalPageHeader
				variant='internal'
				label='All Active Projects - Latz Web Design'
				title='Studio Latz'
			/>
			<div className='flex gap-3 mb-12'>
				<a
					href='/portal/designer'
					target='_blank'
					className='font-mono text-xs px-4 py-2 rounded-full bg-purple/20 text-white hover:bg-purple/70 transition-colors'
				>
					Designer View →
				</a>
				<StudioLink />
				<form
					action={async () => {
						'use server';
						await signOut({ redirectTo: '/login' });
					}}
					className='hidden lg:block'
				>
					<button
						type='submit'
						className='font-mono text-xs px-4 py-2 rounded-full bg-white/5 text-white/40 hover:bg-danger/20 hover:text-danger transition-colors'
					>
						Sign Out
					</button>
				</form>
			</div>

			<ClientList clients={clients} />
			<div className='mt-16'></div>
			<NoteList notes={notes} />
			<UpcomingDeadlines clients={clients} variant='internal' />
			<PortalFooter />

			<form
				action={async () => {
					'use server';
					await signOut({ redirectTo: '/login' });
				}}
				className='lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50'
			>
				<button
					type='submit'
					className='font-mono text-xs px-6 py-3 rounded-full bg-white/10 text-white/50 hover:bg-danger/20 hover:text-danger transition-colors shadow-lg backdrop-blur-sm'
				>
					Sign Out
				</button>
			</form>
		</main>
	);
}

export const revalidate = 10;
