import * as vscode from 'vscode';

export class CommandRegistrar {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

	public registerPaletteCommand(command: string, callback: () => void): void {
		const disposable = vscode.commands.registerCommand(command, callback);

		this.context.subscriptions.push(disposable);
	}

	public registerTextEditorCommand(command: string, callback: () => void): void {
		const disposable = vscode.commands.registerTextEditorCommand(command, callback);

		this.context.subscriptions.push(disposable);
	}
}
