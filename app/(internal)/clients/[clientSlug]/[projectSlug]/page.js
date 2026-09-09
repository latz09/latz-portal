import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import ProjectHeader from '@/app/components/portal/ProjectHeader';
import ProjectLinks from '@/app/components/portal/ProjectLinks';
import DocumentList from '@/app/components/portal/DocumentList';
import DeadlineList from '@/app/components/portal/DeadlineList';
import PortalLinks from '@/app/components/portal/PortalLinks';
import ResourceList from '@/app/components/portal/ResourceList';
import ProjectMoneySummary from '@/app/components/portal/ProjectMoneySummary';
import ProjectTimeline from '@/app/components/portal/ProjectTimeline';
import JourneyPreview from '@/app/components/clientJourney/JourneyPreview';
import StudioLink from '@/app/components/portal/StudioLink';
import ProjectMilestones from '@/app/components/portal/ProjectMilestones';
import LostBanner from '@/app/components/portal/LostBanner';
import ProjectAssets from '@/app/components/portal/ProjectAssets';
import { ProjectNotesProvider } from '@/app/components/notes/ProjectNotesProvider';
import ProjectPinnedNotes from '@/app/components/notes/ProjectPinnedNotes';
import ProjectNoteList from '@/app/components/notes/ProjectNoteList';

export default async function ProjectPage({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { clientId, name: clientName, project, notes = [] } = data;

	return (
		<ProjectNotesProvider
			initialNotes={notes}
			clientId={clientId}
			clientName={clientName}
			projectId={project._id}
			projectName={project.name}
		>
			<main>
				<div className='sticky top-0 z-40 bg-dark/90 backdrop-blur-sm border-b border-white/10'>
					<div className='max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-2.5 flex items-center gap-2 font-mono text-xs tracking-widest uppercase'>
						<span className='text-teal'>{clientName}</span>
						<span className='text-white/20'>/</span>
						<span className='text-white/50 truncate'>{project.name}</span>
					</div>
				</div>

				<div className='bg-linear-to-b from-white/5 via-white/5 to-white/0'>
					<div className='page-enter max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-4 lg:py-10'>
						<ProjectHeader
							variant='internal'
							backHref={`/clients/${clientSlug}`}
							backLabel={clientName}
							clientName={clientName}
							projectName={project.name}
							month={project.month}
							year={project.year}
							action={
								<StudioLink
									type='project'
									id={project._id}
									label='Edit project'
								/>
							}
						/>

						{(project.estimateWeeksLow ||
							project.clientPayment?.totalAmount ||
							project.designerPayment?.assigned) && (
							<div className='grid gap-3 sm:grid-cols-3 mb-6'>
								<ProjectTimeline
									estimateWeeksLow={project.estimateWeeksLow}
									estimateWeeksHigh={project.estimateWeeksHigh}
									clientPayment={project.clientPayment}
								/>
								<ProjectMoneySummary
									clientPayment={project.clientPayment}
									designerPayment={project.designerPayment}
								/>
							</div>
						)}

						<ProjectLinks
							variant='internal'
							previewUrl={project.previewUrl}
							figmaUrl={project.figmaUrl}
							studioUrl={project.studioUrl}
							vercelUrl={project.vercelUrl}
							aiProjectLink={project.aiProjectLink}
						/>
					</div>
				</div>
				<div className='page-enter max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-4 lg:py-10'>
					{project.status === 'on-ice' ? (
						<LostBanner
							reason={project.lostReason}
							month={project.month}
							year={project.year}
						/>
					) : (
						<div className='grid lg:grid-cols-5 gap-6 lg:gap-10 items-start mt-4 mb-6'>
							<div className='lg:col-span-2'>
								<ProjectMilestones
									journeySteps={project.journeySteps}
									clientPayment={project.clientPayment}
									clientSlug={clientSlug}
									projectSlug={projectSlug}
								/>
							</div>
							<div className='lg:col-span-3 min-w-0'>
								<JourneyPreview
									journeySteps={project.journeySteps}
									clientPayment={project.clientPayment}
									clientSlug={clientSlug}
									projectSlug={projectSlug}
									projectId={project._id}
								/>
							</div>
						</div>
					)}
					<ProjectPinnedNotes pulseOnLoad />
					<div className=' py-4 lg:py-10'>
						<ProjectAssets
							variant='internal'
							docs={project.docs}
							resources={project.resources}
							inspiration={project.inspiration}
							clientSlug={clientSlug}
							projectSlug={projectSlug}
						/>

						<ProjectNoteList />

						<DeadlineList
							deadlines={project.deadlines}
							journeySteps={project.journeySteps}
							variant='internal'
							clientId={clientId}
							projectKey={project._key}
							clientSlug={clientSlug}
							projectSlug={projectSlug}
						/>
						<PortalLinks
							clientSlug={clientSlug}
							projectSlug={projectSlug}
							studioId={clientId}
						/>
					</div>
				</div>
			</main>
		</ProjectNotesProvider>
	);
}

export const revalidate = 10;
