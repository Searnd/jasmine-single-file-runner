import { Uri, workspace } from "vscode";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { LineNotFoundInFileError } from "./exceptions/LineNotFoundInFileError";

export class TestFileEditor {
    private _testFileUri: Uri;

    private _specFile: vscode.TextDocument;

    private _contextLineRegex: RegExp = /^const context = require\.context.*/m;

    private _contextLineInitialValue: string = "";

    constructor(testFileUri: Uri, specFile: vscode.TextDocument) {
        this._testFileUri = testFileUri;
        this._specFile = specFile;
    }

    public addSpecFileToContextLine(specFileUri: Uri): void {
        fs.readFile(this._testFileUri.fsPath, {encoding: 'utf8'}, (readErr, data) => {
            if (readErr) {
                throw new Error(readErr.message);
            }
            this.backUpTestFile(data);

            const contextRegex = /context\(.*\);$/m;

            const newFileContent = data.replace(contextRegex, `context('./', false, /${this.getFormattedPath(specFileUri)}$/);`);

            fs.writeFile(this._testFileUri.fsPath, newFileContent, 'utf8', (writeErr) => {
                if (writeErr) {
                    throw new Error(writeErr.message);
                }
            });

        });
    }

    public restoreContextLine(): void {
        if (!this._contextLineInitialValue.length) {
            throw new LineNotFoundInFileError("Error: line not found. Nothing to restore.");
        }

        fs.writeFile(this._testFileUri.fsPath, this._contextLineInitialValue, 'utf8', (writeErr) => {
            if (writeErr) {
                throw new Error(writeErr.message);
            }
        });
    }

    private backUpTestFile(data: string): void {
        const matches = data.match(this._contextLineRegex);

        if (matches === null) {
            throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
        }

        this._contextLineInitialValue = data;
    }

    // Only works on Windows
    private getFormattedPath(uri: Uri): string {
        let relativePath = workspace.asRelativePath(uri, false);
        const matches = relativePath.match(/src\/app\/.*/);

        if (!matches) {
            throw new LineNotFoundInFileError("Error: unable to parse path to spec file");
        }

        relativePath = (matches as RegExpMatchArray)[0];
        relativePath = relativePath.slice("src/".length);

        return relativePath.replace(/\//g, "\\/").replace(/\./g, "\\.");
    }
}
