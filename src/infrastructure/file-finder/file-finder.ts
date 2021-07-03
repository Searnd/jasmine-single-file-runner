import { FileNotFoundError } from "@domain/exceptions/error-index";
import { Uri, workspace } from "vscode";

export class FileFinder {
    constructor(
        private _includePattern: string = ""
    ) {}

    public set includePattern(value: string) {
        this._includePattern = value;
    }

    public async getFileLocation(): Promise<Uri> {
        const files = await workspace.findFiles(this._includePattern, "**/node_modules/**");
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }
}
