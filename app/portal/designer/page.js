import { signOut } from '@/auth';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_DESIGNER_PORTAL_INDEX_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_INDEX_QUERY';
import { FETCH_DESIGNER_PORTAL_HANDOFF_QUERY as HQ } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_HANDOFF_QUERY';
import PortalPageHeader from '@/app/components/portal/PortalPageHeader';
import ClientProjectList from '@/app/components/portal/ClientProjectList';
import UpcomingDeadlines from '@/app/components/portal/UpcomingDeadlines';
import PortalFooter from '@/app/components/portal/PortalFooter';

export default async function DesignerPortalIndex() {
	const [clients, handoffClients] = await Promise.all([f(Q), f(HQ)]);
	const variant = 'designer';

	return (
		<main className='max-w-3xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<PortalPageHeader
				variant={variant}
				label='Alyssa Shurbert-Hetzel'
				title={
					variant === 'designer'
						? 'Your Active Projects'
						: 'All Active Projects'
				}
			/>
			<ClientProjectList
				variant='designer'
				clients={clients}
				hrefBuilder={(clientSlug, projectSlug) =>
					`/portal/designer/${clientSlug}/${projectSlug}`
				}
			/>
			<UpcomingDeadlines clients={clients} variant='designer' />

			{handoffClients?.length > 0 && (
				<div className='mt-16 pt-8 border-t border-white/10'>
					<p className='font-mono text-sm lg:text-base tracking-widest uppercase mb-2 text-white/50'>
						Awaiting Client / In Build
					</p>
					<p className='text-sm lg:text-base text-white/75 mb-6'>
						{`These are moving forward outside the design phase — either waiting on the client to respond (feedback, direction choice, approval) or in active development. No design action needed unless you're flagged directly.`}
						<span className='text-warning/75 font-semibold font-mono'>No action needed.</span>
					</p>
					<ClientProjectList
						variant='designer'
						clients={handoffClients}
						hrefBuilder={(clientSlug, projectSlug) =>
							`/portal/designer/${clientSlug}/${projectSlug}`
						}
					/>
				</div>
			)}

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
