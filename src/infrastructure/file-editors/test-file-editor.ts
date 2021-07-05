import { Uri, workspace } from "vscode";
import { promises as fs } from "fs";
import * as path from "path";
import { LineNotFoundInFileError } from "../../domain/exceptions/error-index";
import { IUri } from "../../domain/types/types-index";

// TODO: improve cohesion by extracting methods
export class TestFileEditor {
    private _contextLineRegex = /^const context = require\.context.*/m;

    private _contextLineInitialValue = "";

    constructor(
        private readonly _testFileUri: Uri,
        private readonly _resourceUri: IUri
    ) { }

    public async addSpecFileToContextLine(): Promise<void> {
        const data = await fs.readFile(this._testFileUri.fsPath, {encoding: "utf8"});

        this.backUpTestFile(data);

        const contextRegex = /context\(.*\);$/m;

        const formattedDirname = this.removePathPrefix(this.getSpecFileDir());

        const formattedSpecFilename = this._resourceUri.isFolder ? "\\.spec\\.ts" : this.cleanupRegexString(this.getSpecFilename());

        const newFileContent = data.replace(contextRegex, `context('./${formattedDirname}', ${this._resourceUri.isFolder}, /${formattedSpecFilename}$/);`);

        await fs.writeFile(this._testFileUri.fsPath, newFileContent, "utf8");
    }

    public async restoreContextLine(): Promise<void> {
        if (!this._contextLineInitialValue.length) {
            throw new LineNotFoundInFileError("Error: line not found. Nothing to restore.");
        }

        await fs.writeFile(this._testFileUri.fsPath, this._contextLineInitialValue, "utf8");
    }

    private backUpTestFile(data: string): void {
        const matches = data.match(this._contextLineRegex);

        if (matches === null) {
            throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
        }

        this._contextLineInitialValue = data;
    }

    private removePathPrefix(path: string): string {
        let relativePath = workspace.asRelativePath(path, false);
        const matches = relativePath.match(/src\/app.*/);

        if (!matches) {
            throw new LineNotFoundInFileError("Error: unable to parse path to spec file");
        }

        relativePath = (matches as RegExpMatchArray)[0];
        relativePath = relativePath.slice("src/".length);

        return relativePath;
    }

    private getSpecFileDir(): string {
        const dirname = this._resourceUri.isFolder ? this._resourceUri.path : path.dirname(this._resourceUri.path);
        return workspace.asRelativePath(dirname);
    }

    private getSpecFilename(): string {
        return path.basename(this._resourceUri.path);
    }

    private cleanupRegexString(regexStr: string): string {
        return regexStr.replace(/\//g, "\\/").replace(/\./g, "\\.");
    }
}
