import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_DESIGNER_PORTAL_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_QUERY';
import ProjectHeader from '@/app/components/portal/ProjectHeader';
import ProjectLinks from '@/app/components/portal/ProjectLinks';
import DocumentList from '@/app/components/portal/DocumentList';
import DeadlineList from '@/app/components/portal/DeadlineList';
import PortalFooter from '@/app/components/portal/PortalFooter';
import ResourceList from '@/app/components/portal/ResourceList';

export default async function DesignerPortal({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { name: clientName, project } = data;

	const designerDocs = project.docs.filter((d) =>
		d.audience?.includes('designer'),
	);
	const designerDeadlines =
		project.deadlines?.filter((d) => d.audience?.includes('designer')) ?? [];

	const designerResources =
		project.resources?.filter((r) => r.audience?.includes('designer')) ?? [];

	return (
		<main className='max-w-4xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<ProjectHeader
				variant='designer'
				backHref='/portal/designer'
				backLabel='All Projects'
				clientName={clientName}
				projectName={project.name}
			/>
			<ProjectLinks
				variant='designer'
				previewUrl={project.previewUrl}
				figmaUrl={project.figmaUrl}
			/>
			<DocumentList
				variant='designer'
				docs={designerDocs}
				basePath={`/clients/${project.year}/${clientSlug}/${projectSlug}`}
				inspiration={project.inspiration}
			/>
			<ResourceList variant='designer' resources={designerResources} />
			<DeadlineList deadlines={designerDeadlines} variant='designer' />
			<PortalFooter />
		</main>
	);
}

export const revalidate = 10;
