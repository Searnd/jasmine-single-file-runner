import "reflect-metadata";

import * as vscode from "vscode";
import { CommandRegistrar } from "./core/commands/command-registrar";
import { Coordinator } from "./core/commands/coordinator";
import { UriWrapper } from "./core/file-system/types/file-system";
import { container } from "tsyringe";


import { CoordinatorFactory } from "./core/commands/coordinator.factory";

let coordinator: Coordinator;


/**
 * Called when the extension is activated.
 *
 * @export
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext): void {
	registerDependencies();

	const commandRegistrar = new CommandRegistrar(context);

	commandRegistrar.registerPaletteCommand("jsfr.testCurrentFile", (vscodeResourceUri: vscode.Uri) => {
		const isFile = /\.spec\.ts$/.test(vscodeResourceUri.path);

		const resourceUri = new UriWrapper(vscodeResourceUri, !isFile);

		const progressOptions: vscode.ProgressOptions = {
			title: "JSFR",
			location: vscode.ProgressLocation.Notification
		};

		vscode.window.withProgress(progressOptions, async (progress) => {
			progress.report({message: "Preparing..."});

			try {
				const coordinatorFactory = container.resolve(CoordinatorFactory);

				coordinator = await coordinatorFactory.createAsync(resourceUri);

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


/**
 * Called when the extension is deactivated.
 *
 * @export
 */
export function deactivate(): void {
	coordinator?.dispose();
}


/**
 * Register dependencies for injection.
 *
 */
function registerDependencies(): void {
	container.register<CoordinatorFactory>(CoordinatorFactory, { useClass: CoordinatorFactory });
}