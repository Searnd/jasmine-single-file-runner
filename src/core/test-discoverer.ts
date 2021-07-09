import { TextDocument, workspace } from "vscode";

export class TestDiscoverer {
    private _openSpecFiles: TextDocument[];

    constructor() {
        this._openSpecFiles = workspace.textDocuments.filter(doc => /\.spec\.ts$/.test(doc.fileName));
    }
}
