import { workspace } from 'vscode';
import { FileNotFoundError } from './exceptions/FileNotFoundError';

export class TestFileFinder {
    public async getTestFileLocation(): Promise<Uri> {
        const files = await workspace.findFiles("*/**/test.ts");
        if (files.length < 1) {
            throw new FileNotFoundError("Error: no test.ts file found. Are you in an Angular project?");
        }

        return files[0];
    }
}
