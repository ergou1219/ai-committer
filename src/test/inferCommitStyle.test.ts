import * as assert from 'assert';

import { inferCommitStyleFromSubjects } from '../git/inferCommitStyle';

suite('inferCommitStyleFromSubjects', () => {
	test('infers conventional when ratio meets threshold', () => {
		const subjects = [
			'feat: add feature',
			'fix: bug',
			'chore: deps',
			'docs: update',
			'test: add tests',
			'refactor: cleanup',
			'feat(ui): polish',
			'ci: pipeline',
			'perf: faster',
			'build: release',
		];

		const inferred = inferCommitStyleFromSubjects(subjects, {
			sampleCommits: 50,
			threshold: 0.6,
		});

		assert.strictEqual(inferred.uncertain, false);
		assert.strictEqual(inferred.style, 'conventional');
	});

	test('falls back to simple when uncertain due to low samples', () => {
		const subjects = ['feat: x', 'fix: y'];

		const inferred = inferCommitStyleFromSubjects(subjects, {
			sampleCommits: 50,
			threshold: 0.6,
		});

		assert.strictEqual(inferred.uncertain, true);
		assert.strictEqual(inferred.style, 'simple');
	});

	test('filters merge/revert noise', () => {
		const subjects = [
			'Merge branch "main"',
			'Revert "oops"',
			'feat: ok',
			'fix: ok',
			'chore: ok',
			'docs: ok',
			'test: ok',
			'refactor: ok',
			'ci: ok',
			'build: ok',
			'perf: ok',
			'style: ok',
		];

		const inferred = inferCommitStyleFromSubjects(subjects, {
			sampleCommits: 50,
			threshold: 0.6,
		});

		assert.strictEqual(inferred.total, 10);
		assert.strictEqual(inferred.style, 'conventional');
	});
});
