import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_ALL_JOURNEYS_QUERY as Q } from '@/app/data/queries/pages/FETCH_ALL_JOURNEYS_QUERY';
import JourneyRollup from '@/app/components/portal/JourneyRollup';

export default async function JourneyRollupPage() {
	const projects = await f(Q);

	return (
		<main className='max-w-5xl mx-auto px-4 lg:px-10 py-10 lg:py-20'>
			<Link
				href='/dashboard'
				className='inline-flex items-center gap-2 font-mono text-sm text-white/50 hover:text-teal transition-colors mb-10'
			>
				<TbArrowLeft /> Back to dashboard
			</Link>

			<div className='mb-10'>
				<p className='font-mono text-sm tracking-widest uppercase text-teal mb-3'>
					Pipeline
				</p>
				
			</div>

			<JourneyRollup projects={projects} />
		</main>
	);
}

export const revalidate = 10;