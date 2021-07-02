import * as vscode from 'vscode';
import { TestAdapter, TestLoadFinishedEvent, TestLoadStartedEvent, TestRunStartedEvent } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { EventEmitter } from './event-emitter';
import { KarmaEventListener } from './karma-event-listener';
import { KarmaHttpClient } from './karma-http-client';
import { KarmaTestInfo, KarmaTestSuiteInfo } from './models/karma-test-suite-info';
import { TestLoadEvent, TestStateEvent } from './types/types-index';

export class JsfrAdapter implements TestAdapter {
    private _disposables: vscode.Disposable[] = [];

	private readonly _testsEmitter = new vscode.EventEmitter<TestLoadEvent>();
	private readonly _testStatesEmitter = new vscode.EventEmitter<TestStateEvent>();
	private readonly _autorunEmitter = new vscode.EventEmitter<void>();

    private readonly _karmaEventListener: KarmaEventListener =
        new KarmaEventListener(new EventEmitter(this._testStatesEmitter, this._testsEmitter));

    private readonly _karmaHttpClient: KarmaHttpClient = new KarmaHttpClient();

    public loadedTests: KarmaTestSuiteInfo | undefined;

    public get tests(): vscode.Event<TestLoadEvent> {
        return this._testsEmitter.event;
    }

    public get testStates(): vscode.Event<TestStateEvent> {
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

        const { config } = this._karmaHttpClient.createKarmaRunCallConfiguration("$#%#");
        await this._karmaHttpClient.callKarmaRunWithConfig(config);
        //TODO: replace "" with path to angular root
        this.loadedTests = this._karmaEventListener.getLoadedTests("");

        this._testsEmitter.fire({ type: "finished", suite: this.loadedTests } as TestLoadFinishedEvent);
    }

    public async run(tests: string[]): Promise<void> {
        this._log.info(`Running tests ${JSON.stringify(tests)}`);

        this._testStatesEmitter.fire({ type: "started", tests} as TestRunStartedEvent);
        
        const testSpec = this.findNode(this.loadedTests, tests[0]);
        const isComponent = testSpec?.type === "suite";

        const karmaParams = this._karmaHttpClient.createKarmaRunCallConfiguration(tests);

        this._karmaEventListener.isTestRunning = true;
        this._karmaEventListener.lastRunTests = karmaParams.tests;
        this._karmaEventListener.isComponentRun = isComponent;
        await this._karmaHttpClient.callKarmaRunWithConfig(karmaParams.config);
        
        this._testStatesEmitter.fire({ type: "finished"} as TestLoadFinishedEvent);
    }

    public cancel(): void {

    }

    public dispose(): void {
        this.cancel();

        this._disposables.forEach(disposable => disposable.dispose());

        this._disposables = [];
    }

    private findNode(searchNode: KarmaTestSuiteInfo | KarmaTestInfo | undefined, id: string): KarmaTestSuiteInfo | KarmaTestInfo | undefined {
        if (searchNode?.id === id) {
            return searchNode;
        } else if (searchNode?.type === 'suite') {
            for (const child of searchNode.children) {
                const found = this.findNode(child, id);
                if (found){
                    return found;
                }
            }
        }

        return undefined;
    }
}