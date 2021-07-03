import * as vscode from 'vscode';

type PaletteCommandCallback = (...args: any[]) => any;
type TextEditorCommandCallback = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void;

export class CommandRegistrar {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

	public registerPaletteCommand(command: string, callback: PaletteCommandCallback): void {
		const disposable = vscode.commands.registerCommand(command, callback);

		this.context.subscriptions.push(disposable);
	}

	public registerTextEditorCommand(command: string, callback: TextEditorCommandCallback): void {
		const disposable = vscode.commands.registerTextEditorCommand(command, callback);

		this.context.subscriptions.push(disposable);
	}
}
