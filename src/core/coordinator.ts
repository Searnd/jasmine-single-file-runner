
import * as path from "path";
import * as vscode from "vscode";
import { ArgumentInvalidError } from "../domain/exceptions/error-index";
import { TestFileEditor } from "../infrastructure/file-editors/test-file-editor";
import { TsConfigSpecEditor } from "../infrastructure/file-editors/tsconfig-spec-editor";
import { FileFinder } from "../infrastructure/file-finder/file-finder";
import { VscodeTaskManager } from "./vscode-task-manager";

export class Coordinator {
    private _testFileEditor!: TestFileEditor;
    private _tsconfigSpecEditor!: TsConfigSpecEditor;

    private _taskManager!: VscodeTaskManager;

    private _document: vscode.TextDocument;

    private readonly _taskType: string = "ngTest";

    constructor(documentOrUri: vscode.TextDocument|vscode.Uri) {
        this._document = documentOrUri as vscode.TextDocument || vscode.workspace.openTextDocument(documentOrUri as vscode.Uri);

        if (!this._document) {
            throw new ArgumentInvalidError();
        }
    }

    public async executeTests(): Promise<void> {
        if (!this._testFileEditor || !this._tsconfigSpecEditor || !this._taskManager) {
            throw new vscode.FileSystemError("Error: test file editor and/or tsconfig editor and/or task manager not initialized");
        }

        await this._testFileEditor.addSpecFileToContextLine();
        await this._tsconfigSpecEditor.addSpecFile();

        const specFileDirectory = path.dirname(this._document.uri.fsPath);
        this._taskManager.registerTaskProvider(this._taskType, "npx ng test", specFileDirectory);

        await this.startTask();
    }

    public async initialize(): Promise<void> {
        const testFileUri = await FileFinder.getFileLocation("**/src/test.ts");
        this._testFileEditor = new TestFileEditor(testFileUri, this._document);

        const tsconfigSpecFileUri = await FileFinder.getFileLocation("**/tsconfig.spec.json");
        this._tsconfigSpecEditor = new TsConfigSpecEditor(tsconfigSpecFileUri);

        this._taskManager = new VscodeTaskManager(this._taskType);
    }

    private async startTask(): Promise<void> {
        const ngTestTask = await this._taskManager.getTask(this._taskType);
        if (ngTestTask) {
            vscode.tasks.executeTask(ngTestTask).then(
                () => { vscode.window.showInformationMessage("JSFR: Executing tests"); },
                () => { vscode.window.showErrorMessage("Error: unable to run ng test"); }
            );
        } else {
            vscode.window.showErrorMessage("Error: task not properly registered");
        }

        vscode.tasks.onDidEndTask((e) => {
            if (e.execution.task.name === this._taskType) {
                this._testFileEditor.restoreContextLine();
                this._tsconfigSpecEditor.restoreFile();
            }
        });
    }
}
