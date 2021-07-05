// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CommandRegistrar } from "./core/command-registrar";
import { Coordinator } from "./core/coordinator";
import { IUri } from "./domain/types/types-index";

let coordinator: Coordinator | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

	// const workspaceFolder = (vscode.workspace.workspaceFolders || [])[0];
	// const channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL);

	// const log = new Log("JSFR", workspaceFolder, "JSFR Log");
	// context.subscriptions.push(log);

	// const testExplorerExtension = vscode.extensions.getExtension<TestHub>(testExplorerExtensionId);
	// if (log.enabled) {
	// 	log.info(`Test Explorer ${testExplorerExtension ? '' : 'not '}found`);
	// }

	// if (testExplorerExtension) {
	// 	const testHub = testExplorerExtension.exports;

	// 	const testAdapterRegistrar = new TestAdapterRegistrar(
	// 		testHub,
	// 		workspaceFolder => new JsfrAdapter(workspaceFolder, log, channel),
	// 		log
	// 	);

	// 	context.subscriptions.push(testAdapterRegistrar);
	// }

	const commandRegistrar = new CommandRegistrar(context);

	commandRegistrar.registerPaletteCommand("jsfr.testCurrentFile", (vscodeResourceUri: vscode.Uri) => {
		const isFile = /\.spec\.ts$/.test(vscodeResourceUri.path);

		const resourceUri: IUri = {
			...vscodeResourceUri,
			with: vscodeResourceUri.with,
			toJSON: vscodeResourceUri.toJSON,
			isFolder: !isFile
		};

		const progressOptions: vscode.ProgressOptions = {
			title: "JSFR",
			location: vscode.ProgressLocation.Notification
		};
		vscode.window.withProgress(progressOptions, async (progress) => {
			progress.report({message: "Preparing..."});
			try {
				coordinator = new Coordinator(resourceUri);
				await coordinator.initialize();
				await coordinator.executeTests();
			}
			catch(e) {
				vscode.window.showErrorMessage(e.message);
				throw e;
			}
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate(): void {
	coordinator?.dispose();
}
