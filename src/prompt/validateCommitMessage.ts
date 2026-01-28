import type { CommitStyle } from '../git/inferCommitStyle';

export function validateCommitMessage(message: string, style: CommitStyle): void {
	if (style !== 'conventional') {
		return;
	}

	const normalized = message.replace(/\r\n/g, '\n');
	const [firstLine = ''] = normalized.split('\n');
	const header = firstLine.trim();

	// Conventional breaking change marker is `!` before the `:`.
	const usesBreakingBang = /!\s*:\s*/.test(header);
	if (!usesBreakingBang) {
		return;
	}

	// If `!` is used, require an explicit BREAKING CHANGE line in body.
	const hasBreakingChangeLine = /^BREAKING CHANGE:\s+.+/m.test(normalized);
	if (!hasBreakingChangeLine) {
		throw new Error(
			'使用了 "!" 标记 breaking change，但缺少 "BREAKING CHANGE: ..." 说明。请补充迁移说明或移除 "!"。',
		);
	}
}
