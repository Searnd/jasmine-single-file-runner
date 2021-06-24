import { Uri } from "vscode";
import * as fs from 'fs';
import { LineNotFoundInFileError } from "./exceptions/LineNotFoundInFileError";

export class TestFileEditor {
    private testFileLocation: Uri;
    private lineToReplaceRegex: RegExp = /^const context = require\.context.*/m;

    constructor(fileUri: Uri) {
        this.testFileLocation = fileUri;
    }

    public addTestFileToContextLine(): void {
        fs.readFile(this.testFileLocation.fsPath, {encoding: 'utf8'}, (readErr, data) => {
            if (readErr) {
                throw new Error(readErr.message);
            }
            if (!data.match(this.lineToReplaceRegex)) {
                throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
            }
            data.replace(this.lineToReplaceRegex, "");

        });
    }

    public removeTestFileFromContextLine(): void {

    }

    private backUpTestFile(): void {

    }
}
