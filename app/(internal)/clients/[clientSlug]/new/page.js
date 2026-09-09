import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_BASIC_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_BASIC_QUERY';
import ProjectDetailsForm from '@/app/components/portal/ProjectDetailsForm';

export default async function NewProjectForClientPage({ params }) {
	const { clientSlug } = await params;
	const client = await f(Q, { clientSlug });
	if (!client) notFound();

	return (
		<main className='page-enter px-3 lg:px-6 py-5 lg:py-10'>
			<div className='max-w-3xl mx-auto mb-6'>
				<Link
					href={`/clients/${clientSlug}`}
					className='inline-flex items-center gap-2 font-mono text-xs text-warning hover:text-teal transition-colors'
				>
					<TbArrowLeft /> {client.name}
				</Link>
			</div>
			<ProjectDetailsForm mode='add-project' clientContext={client} />
		</main>
	);
}

export const revalidate = 10;