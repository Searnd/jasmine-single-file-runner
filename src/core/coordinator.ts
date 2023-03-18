
import * as path from "path";
import * as vscode from "vscode";
import { VsCodeProgress } from "./types/vscode";
import { TestFileEditor } from "./file-system/edit/test-file-editor";
import { TsConfigSpecEditor } from "./file-system/edit/tsconfig-spec-editor";
import { VscodeTaskRunner } from "./task-management/vscode-task-runner";
import { FileFinder } from "./file-system/find/file-finder";
import { IUri } from "./file-system/types/file-system";

export class Coordinator {
    private _testFileEditor!: TestFileEditor;
    private _tsconfigSpecEditor!: TsConfigSpecEditor;

    private _taskRunner!: VscodeTaskRunner;

    private readonly _taskType: string = "ngTest";

    constructor(
        private readonly _resourceUri: IUri
    ) {
        vscode.tasks.onDidEndTask((e) => {
            if (e.execution.task.name === this._taskType) {
                this.dispose();
            }
        });
    }

    public async executeTestsAsync(progress: VsCodeProgress): Promise<void> {
        await this.prepareAsync();

        const specFileDirectory = path.dirname(this._resourceUri.path);
        this._taskRunner.registerTaskProvider(this._taskType, "npx ng test", {cwd: specFileDirectory});

        await this.startTaskAsync(progress);
    }

    public dispose(): void {
        this._testFileEditor.restoreContextLine();
        this._tsconfigSpecEditor.restoreFile();
    }

    private async initializeAsync(): Promise<void> {
        const testFileUri = await FileFinder.getFileLocation("**/src/test.ts");
        this._testFileEditor = new TestFileEditor(testFileUri, this._resourceUri);

        const tsconfigSpecFileUri = await FileFinder.getFileLocation("**/tsconfig.spec.json");
        this._tsconfigSpecEditor = new TsConfigSpecEditor(tsconfigSpecFileUri, this._resourceUri);

        this._taskRunner = new VscodeTaskRunner(this._taskType);
    }

    private async prepareAsync(): Promise<void> {
        await this.initializeAsync();

        if (!this._testFileEditor || !this._tsconfigSpecEditor || !this._taskRunner) {
            throw new vscode.FileSystemError("Error: test file editor and/or tsconfig editor and/or task manager not initialized");
        }

        await this._testFileEditor.addSpecFileToContextLineAsync();
        await this._tsconfigSpecEditor.addSpecFileAsync();
    }

    private async startTaskAsync(progress: VsCodeProgress): Promise<void> {
        const ngTestTask = await this._taskRunner.getTask(this._taskType);

        if(!ngTestTask) {
            vscode.window.showErrorMessage("Error: task not properly registered");

            return;
        }

        vscode.tasks.executeTask(ngTestTask).then(
            () => { progress.report({message: "JSFR: Executing tests"}); },
            () => { vscode.window.showErrorMessage("Error: unable to run ng test"); }
        );
    }
}
