import * as vscode from 'vscode';

import { generateCommitMessage } from '../ai/generateCommitMessage';
import { getExtensionConfig } from '../config';
import { getStagedContext } from '../git/getStagedContext';
import type { CommitStyle } from '../git/inferCommitStyle';
import { inferCommitStyleFromRepo } from '../git/inferCommitStyle';
import { getGitApi, pickRepository } from '../git/vscodeGit';
import { buildPrompt } from '../prompt/buildPrompt';
import { postprocessCommitMessage } from '../prompt/postprocess';
import { validateCommitMessage } from '../prompt/validateCommitMessage';
import { getGlobalApiKey } from './setApiKey';

export async function generateCommitMessageCommand(
	context: vscode.ExtensionContext,
): Promise<void> {
	try {
		const api = getGitApi();
		if (!api) {
			void vscode.window.showErrorMessage(
				'未找到 VS Code Git 扩展（vscode.git）。请确认你没有禁用内置 Git。',
			);
			return;
		}

		const repo = await pickRepository(api);
		if (!repo) {
			return;
		}

		const repoRoot = repo.rootUri.fsPath;
		const cfg = getExtensionConfig();

		if (!cfg.baseURL || cfg.baseURL.trim().length === 0) {
			const action = await vscode.window.showErrorMessage(
				'AI Committer: 请先在设置中填写 aiCommitter.baseURL（OpenAI-compatible）。',
				'打开设置',
			);
			if (action) {
				await vscode.commands.executeCommand('workbench.action.openSettings', 'aiCommitter');
			}
			return;
		}

		if (!cfg.model || cfg.model.trim().length === 0) {
			const action = await vscode.window.showErrorMessage(
				'AI Committer: 请先在设置中填写 aiCommitter.model。',
				'打开设置',
			);
			if (action) {
				await vscode.commands.executeCommand('workbench.action.openSettings', 'aiCommitter');
			}
			return;
		}

		const apiKey = await getGlobalApiKey(context);
		if (!apiKey) {
			const action = await vscode.window.showErrorMessage(
				'AI Committer: 未设置 API Key。',
				'设置 API Key',
			);
			if (action) {
				await vscode.commands.executeCommand('ai-committer.setApiKey');
			}
			return;
		}

		const staged = await getStagedContext(repoRoot, cfg.maxDiffChars);
		if (staged.diff.trim().length === 0) {
			void vscode.window.showWarningMessage('没有 staged 变更。请先 stage 再生成提交信息。');
			return;
		}

		let style: CommitStyle;
		let inferredReason: string | undefined;
		if (cfg.commitStyle === 'auto') {
			const inferred = await inferCommitStyleFromRepo(repoRoot, {
				sampleCommits: cfg.autoStyleSampleCommits,
				threshold: cfg.autoStyleThreshold,
			});
			style = inferred.style;
			inferredReason = inferred.reason;
		} else {
			style = cfg.commitStyle;
		}

		const prompt = buildPrompt({
			language: cfg.language,
			style,
			inferredReason,
			stagedNameStatus: staged.nameStatus,
			stagedDiff: staged.diff,
			diffTruncated: staged.diffTruncated,
		});

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'AI Committer: 正在生成提交信息…',
				cancellable: false,
			},
			async () => {
				const raw = await generateCommitMessage({
					baseURL: cfg.baseURL,
					modelId: cfg.model,
					apiKey,
					authHeaderName: cfg.authHeaderName,
					authHeaderValuePrefix: cfg.authHeaderValuePrefix,
					extraHeaders: cfg.extraHeaders,
					temperature: cfg.temperature,
					prompt,
				});

				const message = postprocessCommitMessage(raw);
				if (message.trim().length === 0) {
					throw new Error('模型返回为空，无法生成提交信息。');
				}

				validateCommitMessage(message, style);
				repo.inputBox.value = message;
			},
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		void vscode.window.showErrorMessage(`AI Committer: 生成失败：${message}`);
	}
}
