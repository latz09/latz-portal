// app/api/notes/[id]/backburner/route.js
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';
import { fetchContent } from '@/app/utils/cms/fetchContent';

export async function POST(req, { params }) {
	const session = await auth();
	if (!session || session.user.role !== 'internal') {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;

	const note = await fetchContent(
		`*[_type == "note" && _id == $id][0]{ _id, backBurner }`,
		{ id },
	);

	if (!note) {
		return Response.json({ error: 'Note not found' }, { status: 404 });
	}

	const newBackBurner = !note.backBurner;

	await writeClient.patch(id).set({ backBurner: newBackBurner }).commit();

	return Response.json({ success: true, backBurner: newBackBurner });
}