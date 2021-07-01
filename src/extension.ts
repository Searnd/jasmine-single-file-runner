// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandRegistrar } from './CommandRegistrar';
import { Coordinator } from './Coordinator';
import { FileNotFoundError, LineNotFoundInFileError } from './exceptions/error-index';

let ngTestProvider: vscode.Disposable | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const commandRegistrar = new CommandRegistrar(context);

	commandRegistrar.registerTextEditorCommand('jsfr.testCurrentFile', (textEditor) => {
		const progressOptions: vscode.ProgressOptions = {
			title: "JSFR",
			location: vscode.ProgressLocation.Notification
		};
		vscode.window.withProgress(progressOptions, async (progress) => {
			progress.report({message: "Preparing..."});

			// await executeTestsOnSelection(textEditor.document);
			try {
				const coordinator = new Coordinator(textEditor.document);
				await coordinator.initialize();
				await coordinator.executeTests();
			}
			catch(e) {
				if (e instanceof FileNotFoundError || e instanceof LineNotFoundInFileError) {
					vscode.window.showErrorMessage(e.message);
				} else {
					throw e;
				}
			}
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	ngTestProvider?.dispose();
}
