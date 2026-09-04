import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_ALL_JOURNEYS_QUERY as Q } from '@/app/data/queries/pages/FETCH_ALL_JOURNEYS_QUERY';
import JourneyRollup from '@/app/components/portal/JourneyRollup';

export default async function JourneyRollupPage() {
	const projects = await f(Q);

	return (
		<main className='page-enter max-w-7xl md:mx-auto px-4 lg:px-10 py-10 lg:py-20 w-full'>
			<JourneyRollup projects={projects} />
		</main>
	);
}

export const revalidate = 10;
