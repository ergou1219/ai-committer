import * as vscode from 'vscode';

export type CommitStyleSetting = 'auto' | 'conventional' | 'simple';
export type LanguageSetting = 'zh-CN' | 'en';

export interface ExtensionConfig {
	provider: 'openaiCompatible';
	baseURL: string;
	model: string;
	commitStyle: CommitStyleSetting;
	autoStyleSampleCommits: number;
	autoStyleThreshold: number;
	language: LanguageSetting;
	maxDiffChars: number;
	temperature: number;
	authHeaderName: string;
	authHeaderValuePrefix: string;
	extraHeaders: Record<string, string>;
}

function readRecordStringString(value: unknown): Record<string, string> {
	if (!value || typeof value !== 'object') {
		return {};
	}

	const result: Record<string, string> = {};
	for (const [k, v] of Object.entries(value)) {
		if (typeof v === 'string') {
			result[k] = v;
		}
	}
	return result;
}

export function getExtensionConfig(): ExtensionConfig {
	const cfg = vscode.workspace.getConfiguration('aiCommitter');

	return {
		provider: 'openaiCompatible',
		baseURL: cfg.get<string>('baseURL', ''),
		model: cfg.get<string>('model', ''),
		commitStyle: cfg.get<CommitStyleSetting>('commitStyle', 'auto'),
		autoStyleSampleCommits: cfg.get<number>('autoStyle.sampleCommits', 50),
		autoStyleThreshold: cfg.get<number>('autoStyle.threshold', 0.6),
		language: cfg.get<LanguageSetting>('language', 'zh-CN'),
		maxDiffChars: cfg.get<number>('maxDiffChars', 20000),
		temperature: cfg.get<number>('temperature', 0.2),
		authHeaderName: cfg.get<string>('authHeaderName', 'Authorization'),
		authHeaderValuePrefix: cfg.get<string>('authHeaderValuePrefix', 'Bearer '),
		extraHeaders: readRecordStringString(cfg.get('extraHeaders')),
	};
}
