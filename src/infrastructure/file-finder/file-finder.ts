import { FileNotFoundError } from "@domain/exceptions/error-index";
import { Uri, workspace } from "vscode";

export class FileFinder {
    public static async getFileLocation(includePattern: string): Promise<Uri> {
        const files = await workspace.findFiles(includePattern, "**/node_modules/**");
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }
}
