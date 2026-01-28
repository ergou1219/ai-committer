import * as vscode from 'vscode';

import { generateCommitMessageCommand } from './commands/generateCommitMessage';
import { setApiKeyCommand } from './commands/setApiKey';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('ai-committer.generateCommitMessage', () =>
			generateCommitMessageCommand(context),
		),
		vscode.commands.registerCommand('ai-committer.setApiKey', () => setApiKeyCommand(context)),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
