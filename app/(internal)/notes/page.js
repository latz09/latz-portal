import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_NOTES_QUERY as NQ } from '@/app/data/queries/pages/FETCH_NOTES_QUERY';
import { AllNotesProvider } from '@/app/components/notes/AllNotesProvider';
import AllNotesContent from '@/app/components/notes/AllNotesContent';

export default async function AllNotesPage() {
	const notes = await f(NQ);

	return (
		<AllNotesProvider initialNotes={notes}>
			<main className='max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-6 lg:py-12'>
				<AllNotesContent />
			</main>
		</AllNotesProvider>
	);
}

export const revalidate = 10;