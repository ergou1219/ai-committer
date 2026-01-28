import * as assert from 'assert';

import { validateCommitMessage } from '../prompt/validateCommitMessage';

suite('validateCommitMessage', () => {
	test('requires BREAKING CHANGE when header uses !', () => {
		assert.throws(
			() => validateCommitMessage('refactor(ui)!: redesign\n\n- update layout', 'conventional'),
			/缺少 "BREAKING CHANGE: \.\.\."/,
		);
	});

	test('passes when BREAKING CHANGE is present', () => {
		assert.doesNotThrow(() =>
			validateCommitMessage(
				'refactor(ui)!: redesign\n\n- update layout\n\nBREAKING CHANGE: update snapshots',
				'conventional',
			),
		);
	});

	test('does nothing for simple style', () => {
		assert.doesNotThrow(() => validateCommitMessage('update ui', 'simple'));
	});
});
