// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileNotFoundError } from './exceptions/FileNotFoundError';
import { TestFileEditor } from './TestFileEditor';
import { TestFileFinder } from './TestFileFinder';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	function registerCommand(command: string, callback: () => void): void {
		const disposable = vscode.commands.registerCommand(command, callback);

		context.subscriptions.push(disposable);
	}

	function registerTextEditorCommand(command: string, callback: () => void): void {
		const disposable = vscode.commands.registerTextEditorCommand(command, callback);

		context.subscriptions.push(disposable);
	}

	registerCommand('jsfr.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Jasmine Single File Runner!');
	});

	registerTextEditorCommand('jsfr.testCurrentFile', async () => {
		vscode.window.showInformationMessage('Executing tests for current file...');
		try {
			const testFileFinder = new TestFileFinder();
			const testFileUri = await testFileFinder.getTestFileLocation();

			const testFileEditor = new TestFileEditor(testFileUri);
			vscode.window.showInformationMessage("Success!");
		}
		catch(e) {
			if (e instanceof FileNotFoundError) {
				vscode.window.showErrorMessage(e.message);
			} else {
				throw e;
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
