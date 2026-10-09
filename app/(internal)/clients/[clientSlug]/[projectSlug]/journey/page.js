// /journey/page.js

import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import JourneyMap from '@/app/components/clientJourney/JourneyMap';
import AddStepTrigger from '@/app/components/clientJourney/AddStepTrigger';
import { summarizeJourney } from '@/app/utils/journeyHelpers';
import StudioLink from '@/app/components/portal/StudioLink';

export default async function JourneyPage({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { name: clientName, project } = data;

	const summary = summarizeJourney(project.journeySteps, project.clientPayment);
	const done = summary?.doneCount ?? 0;
	const total = summary?.total ?? 0;
	const pct = total ? Math.round((done / total) * 100) : 0;

	return (
		<>
			<div className='sticky top-[var(--nav-h,64px)] z-30 bg-dark-mid/70 backdrop-blur-sm border-b border-dark-mid'>
				<div className='max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-2.5 flex items-center gap-2 font-mono text-xs tracking-widest uppercase'>
					<Link
						href={`/clients/${clientSlug}`}
						className='text-teal hover:text-teal/70 transition-colors font-display'
					>
						{clientName}
					</Link>
					<span className='text-white/20'>/</span>
					<span className='text-white/50 truncate'>{project.name}</span>
				</div>
			</div>

			<main className='page-enter max-w-7xl mx-auto px-4 lg:px-10 py-10 lg:py-20 w-full'>
				<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-10'>
					<Link
						href={`/clients/${clientSlug}/${projectSlug}`}
						className='group flex items-center gap-2'
					>
						<TbArrowLeft className='shrink-0' />

						<span className='font-mono text-[10px] text-white tracking-widest'>
							<span className="font-display lg:text-[16px] text-teal">{clientName}</span> - {project.name}
						</span>
					</Link>

					<div className='flex items-center gap-2 self-center lg:self-start shrink-0'>
						<AddStepTrigger projectId={project._id} />
						<StudioLink type='project' id={project._id} label='Edit journey' />
					</div>
				</div>

				{/* overall progress bar */}
				<div className='mb-12'>
					<div className='flex items-center justify-between mb-3'>
						<span className='font-mono text-sm tracking-widest uppercase text-white/60'>
							Overall Progress
						</span>
						<span className='font-mono text-sm text-white/70 tabular-nums'>
							{done}
							<span className='text-white/30'>/{total}</span>
							<span className='text-teal ml-3'>{pct}%</span>
						</span>
					</div>
					<div className='h-2 rounded-full bg-white/10 overflow-hidden'>
						<div
							className='h-full bg-teal rounded-full transition-all'
							style={{ width: `${pct}%` }}
						/>
					</div>
				</div>

				<JourneyMap
					journeySteps={project.journeySteps}
					clientPayment={project.clientPayment}
					projectId={project._id}
				/>
			</main>
		</>
	);
}

export const revalidate = 10;
