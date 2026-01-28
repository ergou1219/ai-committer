import * as path from 'node:path';

import * as vscode from 'vscode';

export interface Repository {
	rootUri: vscode.Uri;
	inputBox: { value: string };
}

export interface GitAPI {
	repositories: Repository[];
}

interface GitExtension {
	getAPI(version: 1): GitAPI;
}

export function getGitApi(): GitAPI | undefined {
	const ext = vscode.extensions.getExtension('vscode.git');
	if (!ext) {
		return undefined;
	}
	const exports = ext.exports as GitExtension | undefined;
	if (!exports || typeof exports.getAPI !== 'function') {
		return undefined;
	}
	return exports.getAPI(1);
}

export async function pickRepository(api: GitAPI): Promise<Repository | undefined> {
	const repos = api.repositories;
	if (repos.length === 0) {
		void vscode.window.showErrorMessage('当前工作区没有可用的 Git 仓库。');
		return undefined;
	}
	if (repos.length === 1) {
		return repos[0];
	}

	const items = repos.map((r) => {
		const fsPath = r.rootUri.fsPath;
		return {
			repo: r,
			label: path.basename(fsPath),
			description: fsPath,
		};
	});

	const picked = await vscode.window.showQuickPick(items, {
		placeHolder: '选择要生成提交信息的仓库',
		ignoreFocusOut: true,
	});

	return picked?.repo;
}
