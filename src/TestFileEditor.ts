import { Uri } from "vscode";
import * as fs from 'fs';
import { LineNotFoundInFileError } from "./exceptions/LineNotFoundInFileError";

export class TestFileEditor {
    private testFileLocation: Uri;
    private lineToReplaceRegex: RegExp = /^const context = require\.context.*/m;
    private lineToReplaceInitialValue: string;

    constructor(fileUri: Uri) {
        this.testFileLocation = fileUri;
    }

    public addTestFileToContextLine(): void {
        fs.readFile(this.testFileLocation.fsPath, {encoding: 'utf8'}, (readErr, data) => {
            if (readErr) {
                throw new Error(readErr.message);
            }
            this.backUpTestFile(data);

            data.replace(this.lineToReplaceRegex, "");

        });
    }

    public removeTestFileFromContextLine(): void {

    }

    private backUpTestFile(data: string): void {
        const matches = data.match(this.lineToReplaceRegex);

        if (matches === null) {
            throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
        }

        this.lineToReplaceInitialValue = matches[0];
    }

    private getRelativePath(): string {
        const relativePath
    }
}
