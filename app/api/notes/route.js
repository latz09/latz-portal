import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['general', 'idea', 'task', 'link', 'asset', 'email'];

// ─── Lightweight markdown → Portable Text ──────────────────────────────────
// Supports **bold**, *italic*, "- " bullet lines, "1. " numbered lines.
// Not a full markdown parser — no nesting, no escaping — but NoteCard's
// existing PortableText setup already renders strong/em marks and bullet/
// number lists (built for Studio-authored notes), so no display-side
// changes are needed for this to render correctly.

const MARK_REGEX = /\*\*(.+?)\*\*|\*(.+?)\*/g;

function span(text, marks = []) {
	return { _type: 'span', _key: randomUUID(), text, marks };
}

function parseInlineMarks(text) {
	const children = [];
	let lastIndex = 0;
	let match;
	MARK_REGEX.lastIndex = 0;
	while ((match = MARK_REGEX.exec(text)) !== null) {
		if (match.index > lastIndex) {
			children.push(span(text.slice(lastIndex, match.index)));
		}
		if (match[1] !== undefined) {
			children.push(span(match[1], ['strong']));
		} else {
			children.push(span(match[2], ['em']));
		}
		lastIndex = MARK_REGEX.lastIndex;
	}
	if (lastIndex < text.length) {
		children.push(span(text.slice(lastIndex)));
	}
	return children.length ? children : [span('')];
}

function lineToBlock(line) {
	const bulletMatch = line.match(/^-\s+(.*)$/);
	const numberMatch = line.match(/^\d+\.\s+(.*)$/);

	let listItem;
	let content = line;
	if (bulletMatch) {
		listItem = 'bullet';
		content = bulletMatch[1];
	} else if (numberMatch) {
		listItem = 'number';
		content = numberMatch[1];
	}

	return {
		_type: 'block',
		_key: randomUUID(),
		style: 'normal',
		markDefs: [],
		...(listItem && { listItem, level: 1 }),
		children: parseInlineMarks(content),
	};
}

function markdownLiteToBlocks(text) {
	// Blank lines mark paragraph breaks. List lines don't get an extra
	// gap block between them — a blank line between two list items reads
	// as a stray keystroke, not "start a new paragraph."
	const rawLines = text.split('\n');
	const blocks = [];
	let prevWasBlank = false;

	for (const rawLine of rawLines) {
		if (rawLine.trim() === '') {
			prevWasBlank = true;
			continue;
		}

		const isListLine = /^-\s+/.test(rawLine) || /^\d+\.\s+/.test(rawLine);

		if (prevWasBlank && blocks.length && !isListLine) {
			// Empty block = a blank <p>, which is how Portable Text/HTML
			// naturally renders visible space between paragraphs.
			blocks.push({
				_type: 'block',
				_key: randomUUID(),
				style: 'normal',
				markDefs: [],
				children: [span('')],
			});
		}

		blocks.push(lineToBlock(rawLine));
		prevWasBlank = false;
	}

	return blocks.length ? blocks : undefined;
}

export async function POST(req) {
	const session = await auth();
	if (!session || session.user.role !== 'internal') {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { title, body, clientId, projectId, type, pinned } = await req.json();

	if (!title?.trim()) {
		return Response.json({ error: 'Title is required' }, { status: 400 });
	}

	const resolvedType = ALLOWED_TYPES.includes(type) ? type : 'general';
	const blocks = body?.trim() ? markdownLiteToBlocks(body.trim()) : undefined;

	const doc = {
		_type: 'note',
		title: title.trim(),
		type: resolvedType,
		pinned: !!pinned,
		...(blocks && { body: blocks }),
		...(clientId && { client: { _type: 'reference', _ref: clientId } }),
		...(projectId && { project: { _type: 'reference', _ref: projectId } }),
	};

	const created = await writeClient.create(doc);

	return Response.json({
		note: {
			_id: created._id,
			title: created.title,
			type: created.type,
			body: blocks || null,
			pinned: created.pinned,
		},
	});
}