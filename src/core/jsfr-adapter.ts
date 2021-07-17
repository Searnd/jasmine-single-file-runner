import * as vscode from "vscode";
import { TestAdapter, TestLoadFinishedEvent, TestLoadStartedEvent, TestRunFinishedEvent, TestRunStartedEvent } from "vscode-test-adapter-api";
import { Log } from "vscode-test-adapter-util";
import { AngularServer } from "../infrastructure/angular/angular-server";
import { EventEmitter } from "../infrastructure/event-emitter/event-emitter";
import { KarmaEventListener } from "../infrastructure/karma/karma-event-listener";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../domain/models/karma-test-suite-info";
import { TestLoadEvent, TestStateEvent } from "../domain/types/types-index";
import { KarmaHttpClient } from "../infrastructure/karma/karma-http-client";
import { TestDiscoverer } from "./test-discoverer";

export class JsfrAdapter implements TestAdapter {
    private _disposables: vscode.Disposable[] = [];

	private readonly _testsLoadedEmitter = new vscode.EventEmitter<TestLoadEvent>();
	private readonly _testStatesEmitter = new vscode.EventEmitter<TestStateEvent>();
	private readonly _autorunEmitter = new vscode.EventEmitter<void>();

    private readonly _karmaEventListener: KarmaEventListener =
        new KarmaEventListener(new EventEmitter(this._testStatesEmitter, this._testsLoadedEmitter));

    private readonly _angularServer: AngularServer = new AngularServer(this._karmaEventListener);

    private readonly _karmaHttpClient: KarmaHttpClient = new KarmaHttpClient();

    public loadedTests: KarmaTestSuiteInfo | undefined;

    public get tests(): vscode.Event<TestLoadEvent> {
        return this._testsLoadedEmitter.event;
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
            this._testsLoadedEmitter,
            this._testStatesEmitter,
            this._autorunEmitter
        ];
    }

    public async load(): Promise<void> {
        this._log.info("Loading tests");

        // const projectPath = this.workspaceFolder.uri.fsPath;
        // await this._angularServer.start(projectPath);
        
        // const { config } = this._karmaHttpClient.createKarmaRunCallConfiguration("$#%#");
        // await this._karmaHttpClient.callKarmaRunWithConfig(config);
        // this.loadedTests = this._karmaEventListener.getLoadedTests(projectPath);

        const testDiscoverer = new TestDiscoverer(this._testsLoadedEmitter);

        testDiscoverer.testSuiteUpdated.subscribe(loadedTests => {
            this.loadedTests = loadedTests;
        });
    }

    public async run(tests: string[]): Promise<void> {
        this._log.info(`Running tests ${JSON.stringify(tests)}`);

        this._testStatesEmitter.fire({ type: "started", tests} as TestRunStartedEvent);
        
        const testSpec = this.findNode(this.loadedTests, tests[0]);
        const isComponent = testSpec?.type === "suite";

        await this._angularServer.startAsync(this.workspaceFolder.uri.fsPath);

        const karmaConfig = this._karmaHttpClient.createKarmaRunCallConfiguration(testSpec?.id || "");

        this._karmaEventListener.isTestRunning = true;
        // this._karmaEventListener.lastRunTests = karmaParams.tests;
        this._karmaEventListener.isComponentRun = isComponent;
        await this._karmaHttpClient.callKarmaRunWithConfig(karmaConfig);
        
        this._testStatesEmitter.fire({ type: "finished"} as TestRunFinishedEvent);
    }

    public cancel(): void {
        this._angularServer.stop();
        this._testStatesEmitter.fire({ type: "finished"} as TestRunFinishedEvent);
    }

    public dispose(): void {
        this.cancel();

        this._disposables.forEach(disposable => disposable.dispose());

        this._disposables = [];
    }

    private findNode(searchNode: KarmaTestSuiteInfo | KarmaTestInfo | undefined, id: string): KarmaTestSuiteInfo | KarmaTestInfo | undefined {
        if (searchNode?.id === id) {
            return searchNode;
        } else if (searchNode?.type === "suite") {
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