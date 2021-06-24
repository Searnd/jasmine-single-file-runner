import { Uri, workspace } from "vscode";
import * as fs from 'fs';
import { LineNotFoundInFileError } from "./exceptions/LineNotFoundInFileError";

export class TestFileEditor {
    private _testFileUri: Uri;

    private _lineRegex: RegExp = /^const context = require\.context.*/m;

    private _lineInitialValue: string = "";

    constructor(fileUri: Uri) {
        this._testFileUri = fileUri;
    }

    public addTestFileToContextLine(specFileUri: Uri): void {
        fs.readFile(this._testFileUri.fsPath, {encoding: 'utf8'}, (readErr, data) => {
            if (readErr) {
                throw new Error(readErr.message);
            }
            this.backUpTestFile(data);

            const contextRegex = /context\(.*\);$/m;

            data.replace(contextRegex, `context('./', true, /${this.getFormattedPath(specFileUri)}$/);`);

        });
    }

    public removeTestFileFromContextLine(): void {

    }

    private backUpTestFile(data: string): void {
        const matches = data.match(this._lineRegex);

        if (matches === null) {
            throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
        }

        this._lineInitialValue = matches[0];
    }

    private getFormattedPath(uri: Uri): string {
        const relativePath = workspace.asRelativePath(uri);

        return relativePath.replace("/", "\\/").replace(".", "\\.");
    }
}
