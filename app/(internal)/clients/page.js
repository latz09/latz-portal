import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_ALL_PROJECTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_ALL_PROJECTS_QUERY';

import ProjectsTable from '@/app/components/portal/ProjectsTable';


export default async function AllProjectsPage() {
	const projects = await f(Q);

	return (
		<main className='max-w-7xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
		
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
