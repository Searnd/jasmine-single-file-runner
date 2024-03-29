import "reflect-metadata";

import * as vscode from "vscode";
import { CommandRegistrar } from "./core/commands/command-registrar";
import { UriWrapper } from "./core/file-system/types/file-system";
import { container } from "tsyringe";
import { Coordinator } from "./core/coordtinator/coordinator";
import { CoordinatorFactory } from "./core/coordtinator/coordinator.factory";
import { FileFinder } from "./core/file-system/find/file-finder";
import { AngularFileFinder } from "./core/file-system/find/angular-file-finder";
import { PaletteCommand } from "./core/commands/types/command";

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

	commandRegistrar.registerPaletteCommand("jsfr.testCurrentFile", mainCommand);
	commandRegistrar.registerPaletteCommand("jsfr.testCurrentSelection", mainCommand);
	commandRegistrar.registerPaletteCommand("jsfr.testCurrentDirectory", mainCommand);
}

/**
 * Called when the extension is deactivated.
 *
 * @export
 */
export function deactivate(): void {
	coordinator?.dispose();
}

const mainCommand: PaletteCommand = (vscodeResourceUri: vscode.Uri) => {
		coordinator?.dispose();

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
	};

/**
 * Register dependencies for injection.
 *
 */
function registerDependencies(): void {
	container.register<CoordinatorFactory>(CoordinatorFactory, { useClass: CoordinatorFactory });
	container.register<FileFinder>(FileFinder, { useClass: FileFinder });
	container.register<AngularFileFinder>(AngularFileFinder, { useClass: AngularFileFinder });
}