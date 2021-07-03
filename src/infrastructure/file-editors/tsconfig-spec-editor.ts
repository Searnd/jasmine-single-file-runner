import { TextDocument, Uri } from "vscode";

export class TsConfigSpecEditor {
    private _tsconfigInitialData: string | undefined;

    constructor(
        private _tsconfigSpecFileUri: Uri,
        private _specFile: TextDocument
    ) {}
}
