import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_QUERY';
import Link from 'next/link';
import NoteList from '@/app/components/dashboard/NoteList';
import ProjectList from '@/app/components/portal/ProjectList';

export default async function ClientPage({ params }) {
	const { clientSlug } = await params;
	const data = await f(Q, { clientSlug });
	const { name, slug, projects, notes } = data;

	return (
		<main className='px-3 lg:px-6 py-16'>
			<div className='max-w-4xl mx-auto mb-12'>
				<Link
					href='/'
					className='font-mono text-xs text-white tracking-widest uppercase hover:opacity-70 transition-opacity'
				>
					← Portal
				</Link>
				<h1 className='text-4xl font-semibold mt-4'>{name}</h1>
			</div>

			<ProjectList projects={projects} clientSlug={slug} />

			<div className=' mt-16'>
				<NoteList notes={notes} />
			</div>
		</main>
	);
}

export const revalidate = 10;
