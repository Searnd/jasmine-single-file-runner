
import * as path from "path";
import * as vscode from "vscode";
import { IUri } from "../domain/types/types-index";
import { TestFileEditor } from "../infrastructure/file-editors/test-file-editor";
import { TsConfigSpecEditor } from "../infrastructure/file-editors/tsconfig-spec-editor";
import { FileFinder } from "../infrastructure/file-finder/file-finder";
import { VscodeTaskManager } from "./vscode-task-manager";

export class Coordinator {
    private _testFileEditor!: TestFileEditor;
    private _tsconfigSpecEditor!: TsConfigSpecEditor;

    private _taskManager!: VscodeTaskManager;

    private readonly _taskType: string = "ngTest";

    constructor(
        private readonly _resourceUri: IUri
    ) { }

    public async executeTests(): Promise<void> {
        if (!this._testFileEditor || !this._tsconfigSpecEditor || !this._taskManager) {
            throw new vscode.FileSystemError("Error: test file editor and/or tsconfig editor and/or task manager not initialized");
        }

        await this._testFileEditor.addSpecFileToContextLine();
        await this._tsconfigSpecEditor.addSpecFile();

        const specFileDirectory = path.dirname(this._resourceUri.path);
        this._taskManager.registerTaskProvider(this._taskType, "ng test", specFileDirectory);

        await this.startTask();
    }

    public async initialize(): Promise<void> {
        const testFileUri = await FileFinder.getFileLocation("**/src/test.ts");
        this._testFileEditor = new TestFileEditor(testFileUri, this._resourceUri);

        const tsconfigSpecFileUri = await FileFinder.getFileLocation("**/tsconfig.spec.json");
        this._tsconfigSpecEditor = new TsConfigSpecEditor(tsconfigSpecFileUri, this._resourceUri);

        this._taskManager = new VscodeTaskManager(this._taskType);
    }

    public dispose(): void {
        this._testFileEditor.restoreContextLine();
        this._tsconfigSpecEditor.restoreFile();
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
                this.dispose();
            }
        });
    }
}
