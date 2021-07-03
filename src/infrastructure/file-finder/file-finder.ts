import { Uri, workspace } from "vscode";
import { FileNotFoundError } from "../../domain/exceptions/error-index";

export class FileFinder {
    constructor(
        private readonly _includePattern: string
    ) {}

    public async getFileLocation(): Promise<Uri> {
        const files = await workspace.findFiles(this._includePattern, "**/node_modules/**");
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }
}
