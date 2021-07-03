import { FileSystemError, Uri, workspace } from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import * as stripJsonComments from "strip-json-comments";

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

        const tsconfig: Tsconfig = JSON.parse(stripJsonComments(data));
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
        return workspace.asRelativePath(path, false);
    }
}
