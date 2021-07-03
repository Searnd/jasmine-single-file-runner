import { FileSystemError, Uri, workspace } from "vscode";
import * as path from "path";

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private _tsconfigSpecFileUri: Uri
    ) {}

    private backupFile(data: string): void {
        if (!data.length) {
                throw new FileSystemError("Error: unable to back up file");
        }
        this._tsconfigInitialData = data;
    }

    private removePathPrefix(path: string): string {
        let relativePath = workspace.asRelativePath(path, false);
        const matches = relativePath.match(/src\/app.*/);

        if (!matches) {
            throw new FileSystemError("Error: unable to parse path to spec file");
        }

        relativePath = (matches as RegExpMatchArray)[0];

        return relativePath;
    }

    private getSpecFilename(): string {
        return path.basename(this._tsconfigSpecFileUri.fsPath);
    }
}
