import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';

const ALLOWED_FIELDS = [
	'previewUrl',
	'figmaUrl',
	'studioUrl',
	'vercelUrl',
	'aiProjectLink',
];

function isValidUrl(value) {
	try {
		const u = new URL(value);
		return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
		return false;
	}
}

export async function POST(request, { params }) {
	const session = await auth();
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const { field, value } = await request.json();

	if (!ALLOWED_FIELDS.includes(field)) {
		return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
	}

	if (value && !isValidUrl(value)) {
		return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
	}

	try {
		const patch = writeClient.patch(id);
		if (value) {
			patch.set({ [field]: value });
		} else {
			patch.unset([field]); // empty save = clear the link
		}
		await patch.commit();
		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Failed to update project link:', err);
		return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
	}
}