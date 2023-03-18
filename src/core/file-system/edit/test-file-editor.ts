import { Uri } from "vscode";
import { promises as fs } from "fs";
import * as path from "path";
import { LineNotFoundInFileError } from "../exceptions/error-index";
import { IUri } from "../types/file-system";

// TODO: improve cohesion by extracting methods
export class TestFileEditor {
    private contextLineRegex = /^const context = require\.context.*/m;

    private contextLineInitialValue = "";

    constructor(
        private readonly testFileUri: Uri,
        private readonly resourceUri: IUri
    ) { }

    public async addSpecFileToContextLineAsync(): Promise<void> {
        const data = await fs.readFile(this.testFileUri.fsPath, {encoding: "utf8"});

        this.backUpTestFile(data);

        const contextRegex = /context\(.*\);$/m;

        const formattedDirname = this.pathRelativeToTestFile(this.getSpecFileDir(), true);

        const formattedSpecFilename =
        this.resourceUri.isFolder ?
            "\\.spec\\.ts" :
            this.cleanupRegexString(this.getSpecFilename());

        const newFileContent = data.replace(contextRegex, `context('${formattedDirname}', ${this.resourceUri.isFolder}, /${formattedSpecFilename}$/);`);

        await fs.writeFile(this.testFileUri.fsPath, newFileContent, "utf8");
    }

    public async restoreContextLine(): Promise<void> {
        if (!this.contextLineInitialValue.length) {
            throw new LineNotFoundInFileError("Error: line not found. Nothing to restore.");
        }

        await fs.writeFile(this.testFileUri.fsPath, this.contextLineInitialValue, "utf8");
    }

    private backUpTestFile(data: string): void {
        const matches = data.match(this.contextLineRegex);

        if (matches === null) {
            throw new LineNotFoundInFileError("Error: unable to find require.context in test.ts");
        }

        this.contextLineInitialValue = data;
    }

    private pathRelativeToTestFile(pathStr: string, isFolder: boolean): string {
        let specFileRelativePath = path.relative(this.testFileUri.path, pathStr);

        if (isFolder) {
            // remove extra '.' in the path that was added by the call to path.relative
            specFileRelativePath = specFileRelativePath.slice(1, specFileRelativePath.length);
        }

        // clean up for windows
        specFileRelativePath = specFileRelativePath.replace(/\\/g, "/");

        return specFileRelativePath;
    }

    private getSpecFileDir(): string {
        return this.resourceUri.isFolder ? this.resourceUri.path : path.dirname(this.resourceUri.path);
    }

    private getSpecFilename(): string {
        return path.basename(this.resourceUri.path);
    }

    private cleanupRegexString(regexStr: string): string {
        return regexStr.replace(/\//g, "\\/").replace(/\./g, "\\.");
    }
}
