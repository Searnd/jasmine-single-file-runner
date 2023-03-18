import { FileSystemError } from "vscode";
import * as fs from "fs/promises";
import stripJsonComments = require("strip-json-comments");
import * as path from "path";
import { IUri } from "../types/file-system";
import { AngularFileFinder } from "../find/angular-file-finder";

type Tsconfig = {
    include: string[]
};

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private readonly tsconfigSpecFileUri: IUri,
        private readonly resourceUri: IUri,
        private readonly angularFileFinder: AngularFileFinder
    ) {}

    public async addSpecFileAsync(): Promise<void> {
        const data = await fs.readFile(this.tsconfigSpecFileUri.fsPath, {encoding: "utf8"});

        this.backupFile(data);

        const tsconfig: Tsconfig = JSON.parse(stripJsonComments(data));
        if (!tsconfig) {
            throw new FileSystemError("Error: unable to fetch tsconfig.spec.json");
        }

        const projectRootAbsolutePath = await this.angularFileFinder.getAngularProjectRootPath();
        
        let projectRootRelativePath = path
            .relative(this.tsconfigSpecFileUri.path, projectRootAbsolutePath)
            .replace(/\\/g, "/");
        
        // remove extra '.' in the path that was added by the call to path.relative
        projectRootRelativePath = projectRootRelativePath.slice(1);

        const formattedSpecFilename = this.getPathRelativeToTsconfig(this.resourceUri.path);

        tsconfig.include = [ formattedSpecFilename, `${projectRootRelativePath}/src/*.d.ts`, `${projectRootRelativePath}/src/*.ts` ];

        await fs.writeFile(this.tsconfigSpecFileUri.fsPath, JSON.stringify(tsconfig), "utf8");
    }

    public async restoreFile(): Promise<void> {
        if (!this._tsconfigInitialData?.length) {
            throw new FileSystemError("Error: Nothing to restore");
        }

        await fs.writeFile(this.tsconfigSpecFileUri.fsPath, this._tsconfigInitialData, "utf8");
    }

    private backupFile(data: string): void {
        if (!data.length) {
                throw new FileSystemError("Error: unable to back up file");
        }
        this._tsconfigInitialData = data;
    }

    private getPathRelativeToTsconfig(pathStr: string): string {
        let specFileRelativePath = path.relative(this.tsconfigSpecFileUri.path, pathStr);

        // remove extra '.' in the path that was added by the call to path.relative
        specFileRelativePath = specFileRelativePath.slice(1);

        // clean up for windows
        specFileRelativePath = specFileRelativePath.replace(/\\/g, "/");

        if (this.resourceUri.isFolder) {
            specFileRelativePath += "/**/*.spec.ts";
        }

        return specFileRelativePath;
    }
}
