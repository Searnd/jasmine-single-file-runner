import { workspace } from "vscode";
import { FileNotFoundError } from "../exceptions/error-index";
import * as path from "path";
import { UriWrapper } from "../types/file-system";
export class FileFinder {
    public static async getFileLocation(includePattern: string): Promise<UriWrapper> {
        const files = await workspace.findFiles(includePattern, "**/node_modules/**", 1);
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return new UriWrapper(files[0], false);
    }

    public static async getAngularProjectRootPath(): Promise<string> {
        const rootPath = await FileFinder.getFileLocation("**/angular.json");
        return path.parse(rootPath.path).dir;
    }
}
