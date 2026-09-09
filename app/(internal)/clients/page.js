import Link from 'next/link';
import { TbPlus } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_ALL_PROJECTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_ALL_PROJECTS_QUERY';

import ProjectsTable from '@/app/components/portal/ProjectsTable';


export default async function AllProjectsPage() {
	const projects = await f(Q);

	return (
		<main className='page-enter max-w-7xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<div className='flex justify-end mb-4'>
				<Link
					href='/clients/new'
					className='inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full border border-teal/40 bg-teal/15 text-teal hover:bg-teal/25 transition-colors'
				>
					<TbPlus className='text-sm' />
					New Lead
				</Link>
			</div>
			<ProjectsTable projects={projects} variant='internal' />
		</main>
	);
}

export const revalidate = 10;