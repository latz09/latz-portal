import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_ALL_PROJECTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_ALL_PROJECTS_QUERY';
import PortalPageHeader from '@/app/components/portal/PortalPageHeader';
import ProjectsTable from '@/app/components/portal/ProjectsTable';
import Link from 'next/link';

export default async function AllProjectsPage() {
	const projects = await f(Q);

	return (
		<main className='max-w-6xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<div className='mb-4 lg:mb-8'>
				<Link
					href='/'
					className='font-mono text-xs text-warning tracking-widest uppercase hover:opacity-70 transition-opacity '
				>
					← Portal
				</Link>
			</div>
			{/* <PortalPageHeader
				variant='internal'
				label='Latz Web Design'
				title='All Projects'
			/> */}
			<ProjectsTable projects={projects} variant='internal' />
		</main>
	);
}

export const revalidate = 10;
