// app/utils/cms/notesMarkdown.server.js
// Server-only (uses Node's crypto for _key generation) — shared by the
// create and update note routes so markdown-lite -> Portable Text
// conversion only lives in one place.

import { randomUUID } from 'crypto';

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

// Blank lines mark paragraph breaks. List lines don't get an extra gap
// block between them — a blank line between two list items reads as a
// stray keystroke, not "start a new paragraph."
export function markdownLiteToBlocks(text) {
	const lines = text.split('\n');
	const blocks = [];
	let prevWasBlank = false;

	for (const rawLine of lines) {
		if (rawLine.trim() === '') {
			prevWasBlank = true;
			continue;
		}

		const isListLine = /^-\s+/.test(rawLine) || /^\d+\.\s+/.test(rawLine);

		if (prevWasBlank && blocks.length && !isListLine) {
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
