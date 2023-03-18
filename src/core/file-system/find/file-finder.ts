import { injectable } from "tsyringe";
import { workspace } from "vscode";
import { FileNotFoundError } from "../exceptions/error-index";
import { UriWrapper } from "../types/file-system";

@injectable()
export class FileFinder {
    public async getFileLocation(includePattern: string): Promise<UriWrapper> {
        const files = await workspace.findFiles(includePattern, "**/node_modules/**", 1);

        if (files.length < 1) {
            throw new FileNotFoundError(`Error: no files matching pattern '${includePattern}' found`);
        }

        return new UriWrapper(files[0], false);
    }
}
