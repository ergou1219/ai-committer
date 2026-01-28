import type { CommitStyle } from '../git/inferCommitStyle';
import type { LanguageSetting } from '../config';

export interface BuildPromptParams {
	language: LanguageSetting;
	style: CommitStyle;
	inferredReason?: string;
	stagedNameStatus: string;
	stagedDiff: string;
	diffTruncated: boolean;
}

const ConventionalTypes = [
	'feat',
	'fix',
	'docs',
	'style',
	'refactor',
	'perf',
	'test',
	'build',
	'ci',
	'chore',
	'revert',
];

export function buildPrompt(params: BuildPromptParams): string {
	const langLine = params.language === 'zh-CN' ? '使用中文输出。' : 'Output in English.';
	const inferredLine = params.inferredReason ? `风格推断：${params.inferredReason}` : '';
	const truncateLine = params.diffTruncated
		? '注意：diff 已截断，可能不完整；请基于现有信息做出最合理的提交信息。'
		: '';

	const styleRules =
		params.style === 'conventional'
			? [
				`使用 Conventional Commits。type 只能从：${ConventionalTypes.join(', ')}。`,
				'格式：type(scope?)!: subject',
				'只有“新增/扩展用户可感知能力”才使用 feat。',
				'纯 UI/布局/样式改版（无新增能力）优先使用 refactor(ui) 或 style(ui)，不要用 feat。',
				'fix 仅用于修 bug；perf 仅用于性能；docs/test/ci/build/chore 按字面使用。',
				'breaking change 标注：只有确实破坏兼容性/需要迁移时才允许使用 “!”。',
				'如果使用了 “!”：必须在 body 中包含一行：BREAKING CHANGE: <一句话说明破坏了什么/需要做什么迁移>',
			]
			: [
				'使用普通提交信息格式（不要加 Conventional 前缀）。',
				'不要输出 type/scope/!: 前缀（例如不要以 feat:/fix: 开头）。',
			];

	const writingRules =
		params.language === 'zh-CN'
			? [
				'文案必须具体、可追溯、偏事实描述。',
				'禁止空泛/营销化形容词：例如 “全面升级/现代感/专业感/极简/视觉吸引力/优化体验/更高级/更简洁”等。',
				'body 的每条 bullet 以动词开头，描述做了什么/为什么/影响。',
			]
			: [
				'Be specific and factual; avoid marketing language.',
				"Avoid vague adjectives like 'modern', 'sleek', 'professional', 'polished', 'improve UX' without concrete details.",
				'Start each body bullet with a verb and describe what/why/impact.',
			];

	return [
		'你是一个资深软件工程师，任务是基于 staged git diff 生成高质量 commit message。',
		langLine,
		'',
		'必须严格遵守以下规则（硬约束）：',
		'',
		'1) 输出格式',
		'- 只输出最终 commit message 文本本体。',
		'- 不要解释过程；不要使用 Markdown 代码块；不要前后包裹引号；不要以 “commit message:” 开头。',
		'- 不要在行尾留下空格。',
		'- 第一行是 subject，尽量 <= 72 字符；超过则必须改写更短。',
		'- 如需补充细节：subject 下空一行，再写 body（多行、以 "-" 开头的项目符号）。',
		'',
		'2) 风格选择',
		...styleRules.map((r) => `- ${r}`),
		'',
		'3) 文案风格',
		...writingRules.map((r) => `- ${r}`),
		truncateLine ? `- ${truncateLine}` : '',
		inferredLine ? `- ${inferredLine}` : '',
		'',
		'## Staged Files (name-status)',
		params.stagedNameStatus || '(empty)',
		'',
		'## Staged Diff',
		params.stagedDiff,
		'',
		'现在生成 commit message：',
	].filter(Boolean).join('\n');
}
