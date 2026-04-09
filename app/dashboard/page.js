import { signOut } from '@/auth';

import { fetchContent as f } from '../utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from '../data/queries/pages/FETCH_CLIENTS_QUERY';
import Link from 'next/link';
import PortalPageHeader from '../components/portal/PortalPageHeader';
import UpcomingDeadlines from '../components/portal/UpcomingDeadlines';
import PortalFooter from '../components/portal/PortalFooter';
import StudioLink from '../components/portal/StudioLink';

export default async function Home() {
	const clients = await f(Q);

	return (
		<main className='max-w-3xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<PortalPageHeader
				variant='internal'
				label='Latz Web Design'
				title='Latz Portal'
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

				{/* Sign Out — inline on lg+, fixed bottom center below lg */}
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

			<div className='flex flex-col justify-center gap-3 mb-12 mx-auto'>
				{clients.map((client) => (
					<Link
						key={client.slug}
						href={`/clients/${client.slug}`}
						className='w-full grid bg-white/5 gap-0.5 hover:bg-dark border border-white/10 rounded px-6 py-4 transition-colors'
					>
						<h3 className='font-medium text-lg text-white'>{client.name}</h3>
						<span className='font-mono text-sm text-teal'>
							{client.activeProjects} active · {client.totalProjects} total
						</span>
					</Link>
				))}
			</div>

			<UpcomingDeadlines clients={clients} variant='internal' />
			<PortalFooter />

			{/* Floating Sign Out — visible below lg only */}
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