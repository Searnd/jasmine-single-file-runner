// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CommandRegistrar } from "./core/command-registrar";
import { Coordinator } from "./core/coordinator";
import { IUri } from "./core/file-system/types/file-system";

let coordinator: Coordinator | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
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

				await coordinator.executeTestsAsync(progress);
			}
			catch(e) {
				if (e instanceof Error) {
					vscode.window.showErrorMessage(e.message);
				}

				throw e;
			}
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate(): void {
	coordinator?.dispose();
}
