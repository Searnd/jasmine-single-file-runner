import { Uri, workspace } from "vscode";
import { FileNotFoundError } from "../../domain/exceptions/error-index";
import * as path from "path";
export class FileFinder {
    public static async getFileLocation(includePattern: string): Promise<Uri> {
        const files = await workspace.findFiles(includePattern, "**/node_modules/**", 1);
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }

    public static async getAngularProjectRootPath(): Promise<string> {
        const rootPath = await FileFinder.getFileLocation("**/angular.json");
        return path.parse(rootPath.path).dir;
    }
}
