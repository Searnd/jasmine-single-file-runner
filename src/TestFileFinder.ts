import { Uri, workspace } from 'vscode';
import { FileNotFoundError } from './domain/exceptions/error-index';

export class TestFileFinder {
    public async getTestFileLocation(): Promise<Uri> {
        const files = await workspace.findFiles("**/src/test.ts", "**/node_modules/**");
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }
}
