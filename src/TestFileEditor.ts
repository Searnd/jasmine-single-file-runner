import { Uri, workspace } from "vscode";
import * as fs from 'fs';
import { LineNotFoundInFileError } from "./exceptions/LineNotFoundInFileError";

export class TestFileEditor {
    private _testFileUri: Uri;

    private _contextLineRegex: RegExp = /^const context = require\.context.*/m;

    private _contextLineInitialValue: string = "";

    constructor(fileUri: Uri) {
        this._testFileUri = fileUri;
    }

    public addSpecFileToContextLine(specFileUri: Uri): void {
        fs.readFile(this._testFileUri.fsPath, {encoding: 'utf8'}, (readErr, data) => {
            if (readErr) {
                throw new Error(readErr.message);
            }
            this.backUpTestFile(data);

            const contextRegex = /context\(.*\);$/m;

            const newFileContent = data.replace(contextRegex, `context('./', true, /${this.getFormattedPath(specFileUri)}$/);`);

            fs.writeFile(this._testFileUri.fsPath, newFileContent, 'utf8', (writeErr) => {
                if (writeErr) {
                    throw new Error(writeErr.message);
                }
            });

        });
    }

    public restoreContextLine(): void {
        if (!this._contextLineInitialValue.length) {
            throw new LineNotFoundInFileError("Error: attempting to restore line before it was found");
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

        this._contextLineInitialValue = matches[0];
    }

    private getFormattedPath(uri: Uri): string {
        const relativePath = workspace.asRelativePath(uri);

        return relativePath.replace("/", "\\/").replace(".", "\\.");
    }
}
