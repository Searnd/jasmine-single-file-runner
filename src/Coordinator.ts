import path = require('path');
import * as vscode from 'vscode';
import { ArgumentInvalidError } from './exceptions/error-index';
import { TaskManager } from './TaskManager';
import { TestFileEditor } from './TestFileEditor';
import { TestFileFinder } from './TestFileFinder';

export class Coordinator {
    private _testFileFinder!: TestFileFinder;
    private _testFileEditor!: TestFileEditor;
    private _taskManager!: TaskManager;

    private _document: vscode.TextDocument;

    private readonly _taskType: string = "ngTest";

    constructor(documentOrUri: vscode.TextDocument|vscode.Uri) {
        this._document = documentOrUri as vscode.TextDocument || vscode.workspace.openTextDocument(documentOrUri as vscode.Uri);

        if (!this._document) {
            throw new ArgumentInvalidError();
        }
    }

    public async executeTests(): Promise<void> {
        if (!this._testFileFinder || !this._testFileEditor || !this._taskManager) {
            throw new vscode.FileSystemError("Error: test file finder and/or test file editor and/or task manager not initialized");
        }
        this._testFileEditor.addSpecFileToContextLine();

        const specFileDirectory = path.dirname(this._document.uri.fsPath);
        this._taskManager.registerTaskProvider(this._taskType, "ng test", specFileDirectory);

        this.startTask();
    }

    public async initialize(): Promise<void> {
        this._testFileFinder = new TestFileFinder();
        const testFileUri = await this._testFileFinder.getTestFileLocation();

        this._testFileEditor = new TestFileEditor(testFileUri, this._document);

        this._taskManager = new TaskManager(this._taskType);
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
            }
        });
    }
}
