import { execGit } from './execGit';

export interface StagedContext {
	nameStatus: string;
	diff: string;
	diffTruncated: boolean;
}

export async function getStagedContext(
	repoRoot: string,
	maxDiffChars: number,
): Promise<StagedContext> {
	const nameStatus = (await execGit(['diff', '--staged', '--name-status'], repoRoot)).trim();
	const rawDiff = await execGit(['diff', '--staged'], repoRoot);

	const normalized = rawDiff.replace(/\r\n/g, '\n');
	const trimmedEnd = normalized.trimEnd();

	if (trimmedEnd.length === 0) {
		return {
			nameStatus,
			diff: '',
			diffTruncated: false,
		};
	}

	if (trimmedEnd.length <= maxDiffChars) {
		return {
			nameStatus,
			diff: trimmedEnd,
			diffTruncated: false,
		};
	}

	return {
		nameStatus,
		diff: `${trimmedEnd.slice(0, maxDiffChars)}\n\n[...diff truncated...]`,
		diffTruncated: true,
	};
}
