// /portal/designer/[clientSlug]/[projectSlug]/page.js

import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_DESIGNER_PORTAL_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_QUERY';
import ProjectHeader from '@/app/components/portal/ProjectHeader';
import ProjectLinks from '@/app/components/portal/ProjectLinks';
import ProjectAssets, { DESIGNER_GROUPS } from '@/app/components/portal/ProjectAssets';
import DeadlineList from '@/app/components/portal/DeadlineList';
import PortalFooter from '@/app/components/portal/PortalFooter';
import DesignerBudgetLine from '@/app/components/portal/DesignerBudgetLine';
import DesignerMilestones from '@/app/components/portal/DesignerMilestones';

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
		<main className='max-w-7xl mx-auto px-3 lg:px-6 py-8 lg:py-16 w-full'>
			<ProjectHeader
				variant='designer'
				backHref='/portal/designer'
				backLabel='All Projects'
				clientName={clientName}
				projectName={project.name}
			/>
			<DesignerBudgetLine designerPayment={project.designerPayment} />
			<DesignerMilestones project={project} />
			<ProjectLinks
				variant='designer'
				previewUrl={project.previewUrl}
				figmaUrl={project.figmaUrl}
			/>
			<ProjectAssets
				variant='designer'
				docs={designerDocs}
				resources={designerResources}
				inspiration={project.inspiration}
				clientSlug={clientSlug}
				projectSlug={projectSlug}
				groups={DESIGNER_GROUPS}
			/>
			<DeadlineList deadlines={designerDeadlines} variant='designer' />
			<PortalFooter />
		</main>
	);
}

export const revalidate = 10;