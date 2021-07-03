import { FileSystemError, Uri, workspace } from "vscode";
import * as path from "path";
import * as fs from "fs/promises";

type Tsconfig = {
    include: string[]
};

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private _tsconfigSpecFileUri: Uri
    ) {}

    public async addSpecFile(): Promise<void> {
        const data = await fs.readFile(this._tsconfigSpecFileUri.fsPath, {encoding: "utf8"});

        this.backupFile(data);

        const tsconfig: Tsconfig = await import(this._tsconfigSpecFileUri.fsPath);
        if (!tsconfig) {
            throw new FileSystemError("Error: unable to fetch tsconfig.spec.json");
        }

        const formattedSpecFilename = this.removePathPrefix(this._tsconfigSpecFileUri.fsPath);
        tsconfig.include = [ formattedSpecFilename ];

        await fs.writeFile(this._tsconfigSpecFileUri.fsPath, JSON.stringify(tsconfig), "utf8");
    }

    public async restoreFile(): Promise<void> {
        if (!this._tsconfigInitialData?.length) {
            throw new FileSystemError("Error: Nothing to restore");
        }

        await fs.writeFile(this._tsconfigSpecFileUri.fsPath, this._tsconfigInitialData, "utf8");
    }

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
}
