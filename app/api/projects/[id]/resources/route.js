import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';
import crypto from 'crypto';

const ALLOWED_TYPES = ['google-drive', 'figma', 'notion', 'video', 'pinterest', 'link', 'other'];
const ALLOWED_CATEGORIES = ['overview', 'design', 'handoff', 'technical', 'other'];
const ALLOWED_AUDIENCE = ['internal', 'designer', 'client'];
const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;

async function requireInternal() {
	const session = await auth();
	return session?.user?.role === 'internal';
}

function isValidUrl(value) {
	try {
		const u = new URL(value);
		return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
		return false;
	}
}

function validateResourceFields({ label, url, type, category, audience }) {
	if (!label?.trim()) return 'Label is required';
	if (!url?.trim() || !isValidUrl(url.trim())) return 'A valid URL is required';
	if (type && !ALLOWED_TYPES.includes(type)) return 'Invalid type';
	if (category && !ALLOWED_CATEGORIES.includes(category)) return 'Invalid category';
	if (audience && (!Array.isArray(audience) || audience.some((a) => !ALLOWED_AUDIENCE.includes(a)))) {
		return 'Invalid audience';
	}
	return null;
}

export async function POST(request, { params }) {
	if (!(await requireInternal())) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const body = await request.json();
	const error = validateResourceFields(body);
	if (error) return NextResponse.json({ error }, { status: 400 });

	const newResource = {
		_key: crypto.randomUUID(),
		label: body.label.trim(),
		url: body.url.trim(),
		type: body.type || 'other',
		category: body.category || 'other',
		audience: body.audience || [],
	};

	try {
		await writeClient
			.patch(id)
			.setIfMissing({ resources: [] })
			.append('resources', [newResource])
			.commit();

		return NextResponse.json({ success: true, resource: newResource });
	} catch (err) {
		console.error('Failed to add project resource:', err);
		return NextResponse.json({ error: 'Failed to add resource' }, { status: 500 });
	}
}

export async function PATCH(request, { params }) {
	if (!(await requireInternal())) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const body = await request.json();
	const { key } = body;

	if (!key || !KEY_PATTERN.test(key)) {
		return NextResponse.json({ error: 'Invalid resource key' }, { status: 400 });
	}

	const error = validateResourceFields(body);
	if (error) return NextResponse.json({ error }, { status: 400 });

	const updatedResource = {
		_key: key,
		label: body.label.trim(),
		url: body.url.trim(),
		type: body.type || 'other',
		category: body.category || 'other',
		audience: body.audience || [],
	};

	try {
		await writeClient
			.patch(id)
			.set({ [`resources[_key=="${key}"]`]: updatedResource })
			.commit();

		return NextResponse.json({ success: true, resource: updatedResource });
	} catch (err) {
		console.error('Failed to update project resource:', err);
		return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	if (!(await requireInternal())) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const { key } = await request.json();

	if (!key || !KEY_PATTERN.test(key)) {
		return NextResponse.json({ error: 'Invalid resource key' }, { status: 400 });
	}

	try {
		await writeClient
			.patch(id)
			.unset([`resources[_key=="${key}"]`])
			.commit();

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Failed to delete project resource:', err);
		return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
	}
}