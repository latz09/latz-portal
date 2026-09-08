// app/api/notes/[id]/route.js
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';
import { markdownLiteToBlocks } from '@/app/utils/cms/notesMarkdown.server';

const ALLOWED_TYPES = ['general', 'idea', 'task', 'link', 'asset', 'email'];

export async function PATCH(req, { params }) {
	const session = await auth();
	if (!session || session.user.role !== 'internal') {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const { title, body, clientId, projectId, type, pinned, backBurner } = await req.json();

	if (!title?.trim()) {
		return Response.json({ error: 'Title is required' }, { status: 400 });
	}

	const resolvedType = ALLOWED_TYPES.includes(type) ? type : 'general';
	const blocks = body?.trim() ? markdownLiteToBlocks(body.trim()) : undefined;

	let patch = writeClient.patch(id).set({
		title: title.trim(),
		type: resolvedType,
		pinned: !!pinned,
		backBurner: !!backBurner,
	});

	patch = blocks ? patch.set({ body: blocks }) : patch.unset(['body']);
	patch = clientId
		? patch.set({ client: { _type: 'reference', _ref: clientId } })
		: patch.unset(['client']);
	patch = projectId
		? patch.set({ project: { _type: 'reference', _ref: projectId } })
		: patch.unset(['project']);

	const updated = await patch.commit();

	return Response.json({
		note: {
			_id: updated._id,
			title: updated.title,
			type: updated.type,
			body: blocks || null,
			pinned: updated.pinned,
			backBurner: updated.backBurner,
		},
	});
}