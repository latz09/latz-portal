import { signOut } from '@/auth';
import { fetchContent as f } from '../utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '../data/queries/pages/FETCH_CLIENTS_QUERY';
import { FETCH_NOTES_QUERY as NQ } from '../data/queries/pages/FETCH_NOTES_QUERY';
import UpcomingDeadlines from '../components/portal/UpcomingDeadlines';
import PortalFooter from '../components/portal/PortalFooter';
import StudioLink from '../components/portal/StudioLink';
import ClientList from '../components/dashboard/ClientList';
import NoteList from '../components/dashboard/NoteList';
import Link from 'next/link';

export default async function Home() {
	const [clients, notes] = await Promise.all([f(Q), f(NQ)]);

	return (
		<main className='max-w-360 mx-auto px-3 lg:px-6 py-6 lg:py-12 w-full'>
			<p className="text-white/60 mb-5 lg:mb-8 text-sm lg:text-base tracking-wider font-semibold  normal-case text-center lg:text-start">Latz Web Development</p>
			<div className='flex flex-col lg:flex-row gap-3 mb-12'>
				<StudioLink className='order-1 lg:order-3 w-full justify-center lg:w-auto' />

				<div className='flex gap-3 order-2 lg:order-1'>
						<Link
						href='/clients'
						className='flex-1 lg:flex-none inline-flex items-center justify-center gap-1 font-mono text-xs px-4 py-2 rounded-full bg-teal/20 text-white hover:bg-teal/70 transition-colors'
					>
						Table Overview →
					</Link>
					<a
						href='/portal/designer'
						target='_blank'
						className='flex-1 lg:flex-none inline-flex items-center justify-center gap-1 font-mono text-xs px-4 py-2 rounded-full bg-purple/20 text-white hover:bg-purple/70 transition-colors'
					>
						Designer View →
					</a>
				
				</div>

				<form
					action={async () => {
						'use server';
						await signOut({ redirectTo: '/login' });
					}}
					className='hidden lg:block lg:order-4'
				>
					<button
						type='submit'
						className='font-mono text-xs px-4 py-2 rounded-full bg-white/5 text-white/40 hover:bg-danger/20 hover:text-danger transition-colors'
					>
						Sign Out
					</button>
				</form>
			</div>

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
			</div>
		</main>
	);
}

export const revalidate = 10;