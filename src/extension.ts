// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import { CommandRegistrar } from './CommandRegistrar';
import { FileNotFoundError } from './exceptions/FileNotFoundError';
import { LineNotFoundInFileError } from './exceptions/LineNotFoundInFileError';
import { TaskManager } from './TaskManager';
import { TestFileEditor } from './TestFileEditor';
import { TestFileFinder } from './TestFileFinder';

let ngTestProvider: vscode.Disposable | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	async function executeTestsOnSelection(documentOrUri: vscode.TextDocument|vscode.Uri) {
		const document: vscode.TextDocument = documentOrUri as vscode.TextDocument || vscode.workspace.openTextDocument(documentOrUri as vscode.Uri);

		if (document) {
			try {
				const testFileFinder = new TestFileFinder();
				const testFileUri = await testFileFinder.getTestFileLocation();
	
				const testFileEditor = new TestFileEditor(testFileUri, document);
				await testFileEditor.addSpecFileToContextLine();
	
				const taskType = "ngTest";
				const taskManager = new TaskManager(taskType);
				
				const specFileDirectory = path.dirname(document.uri.fsPath);
	
				ngTestProvider = taskManager.registerTaskProvider(taskType, "ng test", specFileDirectory);
	
				const ngTestTask = await taskManager.getTask(taskType);
				if (ngTestTask) {
					vscode.tasks.executeTask(ngTestTask).then(
						() => { vscode.window.showInformationMessage("JSFR: Executing tests"); },
						() => { vscode.window.showErrorMessage("Error: unable to run ng test"); }
					);
				} else {
					vscode.window.showErrorMessage("Error: task not properly registered");
				}
	
				vscode.tasks.onDidEndTask((e) => {
					if (e.execution.task.name === taskType) {
						testFileEditor.restoreContextLine();
					}
				});
			}
			catch(e) {
				if (e instanceof FileNotFoundError || e instanceof LineNotFoundInFileError) {
					vscode.window.showErrorMessage(e.message);
				} else {
					throw e;
				}
			}
		}
	}

	const commandRegistrar = new CommandRegistrar(context);

	commandRegistrar.registerTextEditorCommand('jsfr.testCurrentFile', (textEditor) => {
		const progressOptions: vscode.ProgressOptions = {
			title: "JSFR",
			location: vscode.ProgressLocation.Notification
		};
		vscode.window.withProgress(progressOptions, async (progress) => {
			progress.report({message: "Preparing..."});

			await executeTestsOnSelection(textEditor.document);
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	ngTestProvider?.dispose();
}
