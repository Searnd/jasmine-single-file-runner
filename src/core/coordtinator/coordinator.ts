
import * as path from "path";
import * as vscode from "vscode";
import { VsCodeProgress } from "../types/vscode";
import { TestFileEditor } from "../file-system/edit/test-file-editor";
import { TsConfigSpecEditor } from "../file-system/edit/tsconfig-spec-editor";
import { VscodeTaskRunner } from "../tasks/vscode-task-runner";
import { TaskType } from "../tasks/types/task-type";
import { IUri } from "../file-system/types/file-system";

export class Coordinator {
    private readonly taskType: TaskType = "ngTest";

    constructor(
        private readonly resourceUri: IUri,
        private readonly tsconfigSpecEditor: TsConfigSpecEditor,
        private readonly taskRunner: VscodeTaskRunner,
        private readonly testFileEditor?: TestFileEditor,
    ) {
        vscode.tasks.onDidEndTask((e) => {
            if (e.execution.task.name === this.taskType) {
                this.dispose();
            }
        });
    }

    public async executeTestsAsync(progress: VsCodeProgress): Promise<void> {
        await this.prepareAsync();

        const specFileDirectory = path.dirname(this.resourceUri.path);
        this.taskRunner.registerTaskProvider(this.taskType, "npx ng test", {cwd: specFileDirectory});

        await this.startTaskAsync(progress);
    }

    public dispose(): void {
        this.testFileEditor?.restoreContextLine();
        this.tsconfigSpecEditor.restoreFile();
    }

    private async prepareAsync(): Promise<void> {
        if (!this.tsconfigSpecEditor || !this.taskRunner) {
            throw new vscode.FileSystemError("Error: tsconfig editor and/or task manager not initialized");
        }

        await this.testFileEditor?.addSpecFileToContextLineAsync();
        await this.tsconfigSpecEditor.addSpecFileAsync();
    }

    private async startTaskAsync(progress: VsCodeProgress): Promise<void> {
        const ngTestTask = await this.taskRunner.getTaskAsync(this.taskType);

        if(!ngTestTask) {
            vscode.window.showErrorMessage("Error: task not properly registered");

            return;
        }

        vscode.tasks.executeTask(ngTestTask).then(
            () => progress.report({message: "JSFR: Executing tests"}),
            () => vscode.window.showErrorMessage("Error: unable to run ng test")
        );
    }
}
