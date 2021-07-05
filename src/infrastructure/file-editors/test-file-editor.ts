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

        const formattedDirname = this.pathRelativeToTestFile(this.getSpecFileDir(), true);

        const formattedSpecFilename =
        this._resourceUri.isFolder ?
            "\\.spec\\.ts" :
            this.cleanupRegexString(this.getSpecFilename());

        const newFileContent = data.replace(contextRegex, `context('${formattedDirname}', ${this._resourceUri.isFolder}, /${formattedSpecFilename}$/);`);

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

    private pathRelativeToTestFile(pathStr: string, isFolder: boolean): string {
        let specFileRelativePath = path.relative(this._testFileUri.path, pathStr);

        if (isFolder) {
            // remove extra '.' in the path that was added by the call to path.relative
            specFileRelativePath = specFileRelativePath.slice(1, specFileRelativePath.length);
        }

        // clean up for windows
        specFileRelativePath = specFileRelativePath.replace(/\\/g, "/");

        return specFileRelativePath;
    }

    private getSpecFileDir(): string {
        return this._resourceUri.isFolder ? this._resourceUri.path : path.dirname(this._resourceUri.path);
    }

    private getSpecFilename(): string {
        return path.basename(this._resourceUri.path);
    }

    private cleanupRegexString(regexStr: string): string {
        return regexStr.replace(/\//g, "\\/").replace(/\./g, "\\.");
    }
}
