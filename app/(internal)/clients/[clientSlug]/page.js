import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_QUERY';
import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import NoteList from '@/app/components/dashboard/NoteList';
import ProjectList from '@/app/components/portal/ProjectList';
import StudioLink from '@/app/components/portal/StudioLink';

export default async function ClientPage({ params }) {
	const { clientSlug } = await params;
	const data = await f(Q, { clientSlug });
	const { name, slug, projects, notes } = data;

	return (
		<main className='page-enter px-3 lg:px-6 py-5 lg:py-10'>
			<div className='max-w-4xl mx-auto mb-12'>
				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 font-mono text-xs text-warning hover:text-teal transition-colors mb-3'
				>
					<TbArrowLeft /> Dashboard
				</Link>

				<div className='flex items-center justify-between gap-4'>
					<h1 className='text-lg lg:text-xl font-medium opacity-90'>{name}</h1>
					<StudioLink id={data._id} label='Edit client' />
				</div>
			</div>

			<ProjectList projects={projects} clientSlug={slug} />

			<div className='mt-16 w-full'>
				<NoteList notes={notes} />
			</div>
		</main>
	);
}

export const revalidate = 10;