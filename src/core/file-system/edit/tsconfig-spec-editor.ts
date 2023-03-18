import { FileSystemError, Uri } from "vscode";
import * as fs from "fs/promises";
import stripJsonComments = require("strip-json-comments");
import * as path from "path";
import { IUri } from "../types/file-system";
import { FileFinder } from "../find/file-finder";

type Tsconfig = {
    include: string[]
};

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private readonly _tsconfigSpecFileUri: Uri,
        private readonly _resourceUri: IUri
    ) {}

    public async addSpecFileAsync(): Promise<void> {
        const data = await fs.readFile(this._tsconfigSpecFileUri.fsPath, {encoding: "utf8"});

        this.backupFile(data);

        const tsconfig: Tsconfig = JSON.parse(stripJsonComments(data));
        if (!tsconfig) {
            throw new FileSystemError("Error: unable to fetch tsconfig.spec.json");
        }

        const projectRootAbsolutePath = await FileFinder.getAngularProjectRootPath();
        
        let projectRootRelativePath = path
            .relative(this._tsconfigSpecFileUri.path, projectRootAbsolutePath)
            .replace(/\\/g, "/");
        
        // remove extra '.' in the path that was added by the call to path.relative
        projectRootRelativePath = projectRootRelativePath.slice(1);

        const formattedSpecFilename = this.getPathRelativeToTsconfig(this._resourceUri.path);

        tsconfig.include = [ formattedSpecFilename, `${projectRootRelativePath}/src/*.d.ts`, `${projectRootRelativePath}/src/*.ts` ];

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

    private getPathRelativeToTsconfig(pathStr: string): string {
        let specFileRelativePath = path.relative(this._tsconfigSpecFileUri.path, pathStr);

        // remove extra '.' in the path that was added by the call to path.relative
        specFileRelativePath = specFileRelativePath.slice(1);

        // clean up for windows
        specFileRelativePath = specFileRelativePath.replace(/\\/g, "/");

        if (this._resourceUri.isFolder) {
            specFileRelativePath += "/**/*.spec.ts";
        }

        return specFileRelativePath;
    }
}
