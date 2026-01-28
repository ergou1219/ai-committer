import { execGit } from './execGit';

export type CommitStyle = 'conventional' | 'simple';

export interface InferOptions {
	sampleCommits: number;
	threshold: number;
}

export interface InferredCommitStyle {
	style: CommitStyle;
	ratio: number;
	matched: number;
	total: number;
	uncertain: boolean;
	reason: string;
}

const ConventionalSubjectRe =
	/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?(!)?:\s+.+/i;

function isNoiseSubject(subject: string): boolean {
	return /^Merge\b/i.test(subject) || /^Revert\b/i.test(subject);
}

export function inferCommitStyleFromSubjects(
	subjects: string[],
	options: InferOptions,
): InferredCommitStyle {
	const threshold = clamp01(options.threshold);
	const filtered = subjects
		.map((s) => s.trim())
		.filter((s) => s.length > 0 && !isNoiseSubject(s));

	let matched = 0;
	for (const s of filtered) {
		if (ConventionalSubjectRe.test(s)) {
			matched += 1;
		}
	}

	const total = filtered.length;
	const ratio = total === 0 ? 0 : matched / total;

	const minSamples = 10;
	const margin = 0.1;
	const uncertain = total < minSamples || Math.abs(ratio - threshold) < margin;

	const style: CommitStyle = ratio >= threshold ? 'conventional' : 'simple';
	const decidedStyle: CommitStyle = uncertain ? 'simple' : style;

	const reason = uncertain
		? `auto: history uncertain (matched=${matched}, total=${total}, ratio=${ratio.toFixed(2)}); fallback=simple`
		: `auto: matched=${matched}, total=${total}, ratio=${ratio.toFixed(2)}, threshold=${threshold.toFixed(
				2,
			)} => ${style}`;

	return {
		style: decidedStyle,
		ratio,
		matched,
		total,
		uncertain,
		reason,
	};
}

export async function inferCommitStyleFromRepo(
	repoRoot: string,
	options: InferOptions,
): Promise<InferredCommitStyle> {
	const n = Math.max(0, Math.floor(options.sampleCommits));
	if (n === 0) {
		return {
			style: 'simple',
			ratio: 0,
			matched: 0,
			total: 0,
			uncertain: true,
			reason: 'auto: sampleCommits=0; fallback=simple',
		};
	}

	const output = await execGit(['log', '-n', String(n), '--pretty=format:%s'], repoRoot);
	const subjects = output
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((s) => s.trim());

	return inferCommitStyleFromSubjects(subjects, options);
}

function clamp01(n: number): number {
	if (!Number.isFinite(n)) {
		return 0;
	}
	return Math.max(0, Math.min(1, n));
}
