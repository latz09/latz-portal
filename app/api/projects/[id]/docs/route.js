import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';
import crypto from 'crypto';

const ALLOWED_CATEGORIES = ['overview', 'design', 'handoff', 'technical', 'other'];
const ALLOWED_AUDIENCE = ['internal', 'designer', 'client'];
const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;

async function requireInternal() {
	const session = await auth();
	return session?.user?.role === 'internal';
}

function validateDocFields({ label, filename, category, audience }) {
	if (!label?.trim()) return 'Label is required';
	if (!filename?.trim()) return 'Filename is required';
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
	const error = validateDocFields(body);
	if (error) return NextResponse.json({ error }, { status: 400 });

	const newDoc = {
		_key: crypto.randomUUID(),
		label: body.label.trim(),
		filename: body.filename.trim(),
		category: body.category || 'other',
		audience: body.audience || [],
	};

	try {
		await writeClient
			.patch(id)
			.setIfMissing({ docs: [] })
			.append('docs', [newDoc])
			.commit();

		return NextResponse.json({ success: true, doc: newDoc });
	} catch (err) {
		console.error('Failed to add project doc:', err);
		return NextResponse.json({ error: 'Failed to add document' }, { status: 500 });
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
		return NextResponse.json({ error: 'Invalid document key' }, { status: 400 });
	}

	const error = validateDocFields(body);
	if (error) return NextResponse.json({ error }, { status: 400 });

	const updatedDoc = {
		_key: key,
		label: body.label.trim(),
		filename: body.filename.trim(),
		category: body.category || 'other',
		audience: body.audience || [],
	};

	try {
		await writeClient
			.patch(id)
			.set({ [`docs[_key=="${key}"]`]: updatedDoc })
			.commit();

		return NextResponse.json({ success: true, doc: updatedDoc });
	} catch (err) {
		console.error('Failed to update project doc:', err);
		return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	if (!(await requireInternal())) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = await params;
	const { key } = await request.json();

	if (!key || !KEY_PATTERN.test(key)) {
		return NextResponse.json({ error: 'Invalid document key' }, { status: 400 });
	}

	try {
		await writeClient
			.patch(id)
			.unset([`docs[_key=="${key}"]`])
			.commit();

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error('Failed to delete project doc:', err);
		return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
	}
}