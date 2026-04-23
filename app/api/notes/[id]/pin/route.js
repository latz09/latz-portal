// app/api/notes/[id]/pin/route.js

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
		`*[_type == "note" && _id == $id][0]{ _id, pinned }`,
		{ id },
	);

	if (!note) {
		return Response.json({ error: 'Note not found' }, { status: 404 });
	}

	const newPinned = !note.pinned;

	await writeClient.patch(id).set({ pinned: newPinned }).commit();

	return Response.json({ success: true, pinned: newPinned });
}
