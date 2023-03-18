import * as vscode from "vscode";

export type PaletteCommand = (...args: any[]) => void;
export type TextEditorCommand = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void;