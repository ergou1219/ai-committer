import * as assert from 'assert';

import { postprocessCommitMessage } from '../prompt/postprocess';

suite('postprocessCommitMessage', () => {
	test('strips fenced code blocks', () => {
		const raw = '```\nfeat: hello\n\nbody\n```';
		assert.strictEqual(postprocessCommitMessage(raw), 'feat: hello\n\nbody');
	});

	test('strips leading label', () => {
		const raw = 'Commit message: fix: bug';
		assert.strictEqual(postprocessCommitMessage(raw), 'fix: bug');
	});

	test('strips surrounding quotes', () => {
		const raw = '"chore: deps"';
		assert.strictEqual(postprocessCommitMessage(raw), 'chore: deps');
	});

	test('strips trailing whitespace per line', () => {
		const raw = 'fix: bug  \n\n- a  \n- b\t\n';
		assert.strictEqual(postprocessCommitMessage(raw), 'fix: bug\n\n- a\n- b');
	});
});
