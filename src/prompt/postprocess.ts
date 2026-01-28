export function postprocessCommitMessage(raw: string): string {
	let text = raw.replace(/\r\n/g, '\n').trim();

	if (text.startsWith('```')) {
		const lines = text.split('\n');
		lines.shift();
		if (lines.length > 0 && lines[lines.length - 1].trim().startsWith('```')) {
			lines.pop();
		}
		text = lines.join('\n').trim();
	}

	text = text.replace(/^commit message\s*:\s*/i, '').trim();

	if (
		(text.startsWith('"') && text.endsWith('"') && text.length >= 2) ||
		(text.startsWith("'") && text.endsWith("'") && text.length >= 2)
	) {
		text = text.slice(1, -1).trim();
	}

	// Strip trailing whitespace on each line to avoid noisy diffs.
	text = text
		.split('\n')
		.map((line) => line.replace(/\s+$/g, ''))
		.join('\n')
		.trim();

	return text;
}
