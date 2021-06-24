import { Uri } from "vscode";

export class TestFileEditor {
    private fileLocation: Uri;

    constructor(fileUri: Uri) {
        this.fileLocation = fileUri;
    }
}
