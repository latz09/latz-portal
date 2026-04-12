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
		`*[_type == "note" && _id == $id][0]{
      _id, title, body, type, url,
      client->{ _id }
    }`,
		{ id },
	);

	if (!note) {
		return Response.json({ error: 'Note not found' }, { status: 404 });
	}

	const archivedDoc = {
		_type: 'archivedNote',
		title: note.title,
		type: note.type,
		archivedAt: new Date().toISOString(),
		...(note.body && { body: note.body }),
		...(note.url && { url: note.url }),
		...(note.client?._id && {
			client: { _type: 'reference', _ref: note.client._id },
		}),
	};

	await writeClient.create(archivedDoc);
	await writeClient.delete(note._id);

	return Response.json({ success: true });
}
