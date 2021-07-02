import * as vscode from 'vscode';
import { TestAdapter, TestSuiteEvent } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { TestLoadEvent } from './types/types-index';

export class JsfrAdapter implements TestAdapter {
    private _disposables: vscode.Disposable[] = [];

	private readonly _testsEmitter = new vscode.EventEmitter<TestLoadEvent>();
	private readonly _testStatesEmitter = new vscode.EventEmitter<TestSuiteEvent>();
	private readonly _autorunEmitter = new vscode.EventEmitter<void>();

    public get tests(): vscode.Event<TestLoadEvent> {
        return this._testsEmitter.event;
    }

    public get testStates(): vscode.Event<TestSuiteEvent> {
        return this._testStatesEmitter.event;
    }

    constructor(
        public readonly workspace: vscode.WorkspaceFolder,
        private readonly _log: Log
    ) {
        this._log.info("Initializing JsfrAdapter");

        this._disposables = [
            this._testsEmitter,
            this._testStatesEmitter,
            this._autorunEmitter
        ];
    }

    public async load(): Promise<void> {

    }

    public async run(tests: string[]): Promise<void> {

    }

    public cancel(): void {

    }
}