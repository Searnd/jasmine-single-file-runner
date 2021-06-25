// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import { CommandRegistrar } from './CommandRegistrar';
import { FileNotFoundError } from './exceptions/FileNotFoundError';
import { LineNotFoundInFileError } from './exceptions/LineNotFoundInFileError';
import { TestFileEditor } from './TestFileEditor';
import { TestFileFinder } from './TestFileFinder';
import { TestRunner } from './TestRunner';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const commandRegistrar = new CommandRegistrar(context);

	commandRegistrar.registerTextEditorCommand('jsfr.testCurrentFile', async (textEditor) => {
		vscode.window.showInformationMessage('Executing tests for current file...');
		try {
			const testFileFinder = new TestFileFinder();
			const testFileUri = await testFileFinder.getTestFileLocation();

			const testFileEditor = new TestFileEditor(testFileUri);
			testFileEditor.addSpecFileToContextLine(textEditor.document.uri);

			const specFileDirectory = path.dirname(textEditor.document.uri.fsPath);
			const testRunner = new TestRunner(specFileDirectory);
			testRunner.execTests(() => {
				testFileEditor.restoreContextLine();
			}).then(
				() => { vscode.window.showInformationMessage("Success!"); },
				() => { vscode.window.showErrorMessage("Error: unable to run ng test"); }
			);
		}
		catch(e) {
			if (e instanceof FileNotFoundError || e instanceof LineNotFoundInFileError) {
				vscode.window.showErrorMessage(e.message);
			} else {
				throw e;
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
