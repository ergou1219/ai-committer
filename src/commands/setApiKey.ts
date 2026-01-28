import * as vscode from 'vscode';

const ApiKeySecretName = 'aiCommitter.apiKey';

export async function setApiKeyCommand(context: vscode.ExtensionContext): Promise<void> {
	const apiKey = await vscode.window.showInputBox({
		password: true,
		ignoreFocusOut: true,
		placeHolder: 'sk-... / your provider API key',
		prompt: 'Set global AI API key for AI Committer (stored in VS Code SecretStorage)',
	});

	if (apiKey === undefined) {
		return;
	}

	const trimmed = apiKey.trim();
	if (trimmed.length === 0) {
		void vscode.window.showErrorMessage('API Key 不能为空。');
		return;
	}

	await context.secrets.store(ApiKeySecretName, trimmed);
	void vscode.window.showInformationMessage('AI Committer: API Key 已保存（全局）。');
}

export async function getGlobalApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
	return context.secrets.get(ApiKeySecretName);
}
