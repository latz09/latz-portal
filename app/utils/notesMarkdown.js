// app/utils/notesMarkdown.js
// Client-safe (no Node-only imports) — mirror of the server-side
// markdownLiteToBlocks, running in reverse. Only reconstructs what our
// own writer produces (plain text blocks with strong/em marks, bullet/
// number list items). Any block type or mark our writer never generates
// (image, file, link, code, etc. — possible on notes authored directly
// in Sanity Studio) gets dropped from the text and flagged via
// hasUnsupportedContent, so the edit form can warn before a save
// accidentally discards it.

function spanToText(span) {
	const text = span.text || '';
	if (span.marks?.includes('strong')) return `**${text}**`;
	if (span.marks?.includes('em')) return `*${text}*`;
	return text;
}

export function portableTextToMarkdownLite(body) {
	if (!Array.isArray(body) || !body.length) {
		return { text: '', hasUnsupportedContent: false };
	}

	const lines = [];
	let numberCounter = 0;
	let hasUnsupportedContent = false;

	for (const block of body) {
		if (block._type !== 'block') {
			hasUnsupportedContent = true;
			continue;
		}

		const isBlankLine =
			!block.listItem &&
			block.children?.length === 1 &&
			!block.children[0].text &&
			!block.children[0].marks?.length;

		if (isBlankLine) {
			lines.push('');
			numberCounter = 0;
			continue;
		}

		const lineText = (block.children || [])
			.map((child) => {
				if (child._type !== 'span') {
					hasUnsupportedContent = true;
					return '';
				}
				if (child.marks?.length > 1) hasUnsupportedContent = true;
				return spanToText(child);
			})
			.join('');

		if (block.listItem === 'bullet') {
			lines.push(`- ${lineText}`);
			numberCounter = 0;
		} else if (block.listItem === 'number') {
			numberCounter += 1;
			lines.push(`${numberCounter}. ${lineText}`);
		} else {
			lines.push(lineText);
			numberCounter = 0;
		}
	}

	return { text: lines.join('\n'), hasUnsupportedContent };
}