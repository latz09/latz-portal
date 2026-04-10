import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import ProjectHeader from '@/app/components/portal/ProjectHeader';
import ProjectLinks from '@/app/components/portal/ProjectLinks';
import DocumentList from '@/app/components/portal/DocumentList';
import DeadlineList from '@/app/components/portal/DeadlineList';
import PortalLinks from '@/app/components/portal/PortalLinks';
import ResourceList from '@/app/components/portal/ResourceList';

export default async function ProjectPage({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { _id, name: clientName, project } = data;

	return (
		<main className='max-w-4xl mx-auto px-3 lg:px-6 py-8 lg:py-16'>
			<ProjectHeader
				variant='internal'
				backHref={`/clients/${clientSlug}`}
				backLabel={clientName}
				clientName={clientName}
				projectName={project.name}
				month={project.month}
				year={project.year}
			/>
			<ProjectLinks
				variant='internal'
				previewUrl={project.previewUrl}
				figmaUrl={project.figmaUrl}
				studioUrl={project.studioUrl}
				vercelUrl={project.vercelUrl}
			/>
			<DocumentList
				variant='internal'
				docs={project.docs}
				clientSlug={clientSlug}
				projectSlug={projectSlug}
				inspiration={project.inspiration}
			/>
			<ResourceList variant='internal' resources={project.resources} />
			<DeadlineList deadlines={project.deadlines} variant='internal' />
			<PortalLinks
				clientSlug={clientSlug}
				projectSlug={projectSlug}
				studioId={_id}
			/>
		</main>
	);
}

export const revalidate = 10;
