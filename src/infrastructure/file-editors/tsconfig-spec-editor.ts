import { FileSystemError, Uri, workspace } from "vscode";
import * as fs from "fs/promises";
import * as stripJsonComments from "strip-json-comments";
import { IUri } from "../../domain/types/types-index";

type Tsconfig = {
    include: string[]
};

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private readonly _tsconfigSpecFileUri: Uri,
        private readonly _resourceUri: IUri
    ) {}

    public async addSpecFile(): Promise<void> {
        const data = await fs.readFile(this._tsconfigSpecFileUri.fsPath, {encoding: "utf8"});

        this.backupFile(data);

        const tsconfig: Tsconfig = JSON.parse(stripJsonComments(data));
        if (!tsconfig) {
            throw new FileSystemError("Error: unable to fetch tsconfig.spec.json");
        }

        const formattedSpecFilename = this.removePathPrefix(this._resourceUri.path);
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

        if (this._resourceUri.isFolder) {
            relativePath += "/**/*.spec.ts";
        }

        return relativePath;
    }
}
