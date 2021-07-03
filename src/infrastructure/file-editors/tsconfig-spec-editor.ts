import { FileSystemError, TextDocument, Uri } from "vscode";

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private _tsconfigSpecFileUri: Uri,
        private _specFile: TextDocument
    ) {}

    private backupFile(data: string): void {
        if (!data.length) {
                throw new FileSystemError("Error: unable to back up file");
        }
        this._tsconfigInitialData = data;
    }
}
