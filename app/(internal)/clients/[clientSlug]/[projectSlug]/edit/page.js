import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import ProjectDetailsForm from '@/app/components/portal/ProjectDetailsForm';

export default async function EditProjectDetailsPage({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	if (!data) notFound();

	const { clientId, name: clientName, project } = data;

	const initialData = {
		clientId,
		clientName,
		clientSlug,
		projectId: project._id,
		projectSlug,
		name: project.name,
		status: project.status,
		lostReason: project.lostReason,
		month: project.month,
		year: project.year,
		estimateWeeksLow: project.estimateWeeksLow,
		estimateWeeksHigh: project.estimateWeeksHigh,
		clientPayment: project.clientPayment,
		designerPayment: project.designerPayment,
	};

	return (
		<main className='page-enter px-3 lg:px-6 py-5 lg:py-10'>
			<div className='max-w-3xl mx-auto mb-6'>
				<Link
					href={`/clients/${clientSlug}/${projectSlug}`}
					className='inline-flex items-center gap-2 font-mono text-xs text-warning hover:text-teal transition-colors'
				>
					<TbArrowLeft /> {project.name}
				</Link>
			</div>
			<ProjectDetailsForm mode='edit' initialData={initialData} />
		</main>
	);
}

export const revalidate = 10;