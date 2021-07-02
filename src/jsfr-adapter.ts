import * as vscode from 'vscode';
import { TestAdapter, TestLoadFinishedEvent, TestLoadStartedEvent, TestRunStartedEvent } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { TestLoadEvent, TestState } from './types/types-index';

export class JsfrAdapter implements TestAdapter {
    private _disposables: vscode.Disposable[] = [];

	private readonly _testsEmitter = new vscode.EventEmitter<TestLoadEvent>();
	private readonly _testStatesEmitter = new vscode.EventEmitter<TestState>();
	private readonly _autorunEmitter = new vscode.EventEmitter<void>();

    public get tests(): vscode.Event<TestLoadEvent> {
        return this._testsEmitter.event;
    }

    public get testStates(): vscode.Event<TestState> {
        return this._testStatesEmitter.event;
    }

    constructor(
        public readonly workspaceFolder: vscode.WorkspaceFolder,
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
        this._log.info("Loading tests");

        this._testsEmitter.fire({ type: "started" } as TestLoadStartedEvent);

        //TODO: load tests

        this._testsEmitter.fire({ type: "finished" } as TestLoadFinishedEvent);
    }

    public async run(tests: string[]): Promise<void> {
        this._log.info(`Running tests ${JSON.stringify(tests)}`);

        this._testStatesEmitter.fire({ type: "started", tests} as TestRunStartedEvent);
        
        //TODO: run tests
        
        this._testStatesEmitter.fire({ type: "finished"} as TestLoadFinishedEvent);
    }

    public cancel(): void {

    }

    public dispose(): void {
        this.cancel();

        this._disposables.forEach(disposable => disposable.dispose());

        this._disposables = [];
    }
}