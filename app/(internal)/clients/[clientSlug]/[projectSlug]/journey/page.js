import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import JourneyMap from '@/app/components/portal/JourneyMap';
import { summarizeJourney } from '@/app/utils/journeyHelpers';

export default async function JourneyPage({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { name: clientName, project } = data;

	const summary = summarizeJourney(project.journeySteps, project.clientPayment);
	const done = summary?.doneCount ?? 0;
	const total = summary?.total ?? 0;
	const pct = total ? Math.round((done / total) * 100) : 0;

	return (
		<main className='page-enter max-w-7xl mx-auto px-4 lg:px-10 py-10 lg:py-20 w-full'>
			<Link
				href={`/clients/${clientSlug}/${projectSlug}`}
				className='inline-flex items-center gap-2 font-mono text-sm text-white/50 hover:text-teal transition-colors mb-10'
			>
				<TbArrowLeft /> Back to {project.name} dashboard
			</Link>

			<div className='mb-10'>
				<p className='font-mono text-sm tracking-widest uppercase text-teal mb-3'>
					{clientName}
				</p>
				<h1 className='font-fraunces text-sm lg:text-base text-white/75'>
					{project.name} — Journey
				</h1>
			</div>

			{/* overall progress bar */}
			<div className='mb-12'>
				<div className='flex items-center justify-between mb-3'>
					<span className='font-mono text-sm tracking-widest uppercase text-white/60'>
						Overall Progress
					</span>
					<span className='font-mono text-sm text-white/70 tabular-nums'>
						{done}<span className='text-white/30'>/{total}</span>
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
			/>
		</main>
	);
}

export const revalidate = 10;