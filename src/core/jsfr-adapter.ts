import * as vscode from "vscode";
import { TestAdapter, TestEvent, TestRunFinishedEvent, TestRunStartedEvent, TestSuiteEvent } from "vscode-test-adapter-api";
import { Log } from "vscode-test-adapter-util";
import { AngularServer } from "../infrastructure/angular/angular-server";
import { EventEmitter } from "../infrastructure/event-emitter/event-emitter";
import { KarmaEventListener } from "../infrastructure/karma/karma-event-listener";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../domain/models/karma-test-suite-info";
import { IUri, TestLoadEvent, TestStateEvent } from "../domain/types/types-index";
import { KarmaHttpClient } from "../infrastructure/karma/karma-http-client";
import { TestDiscoverer } from "./test-discoverer";
import { TestSuiteHelper } from "./helpers/test-suite-helper";
import { Coordinator } from "./coordinator";
import { TestState } from "../domain/enums/enum-index";

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

        const testDiscoverer = new TestDiscoverer(this._testsLoadedEmitter);

        testDiscoverer.testSuiteUpdated.subscribe(loadedTests => {
            this.loadedTests = loadedTests;
        });
    }

    public async run(tests: string[]): Promise<void> {
        this._log.info(`Running tests ${JSON.stringify(tests)}`);
        this._testStatesEmitter.fire({ type: "started", tests} as TestRunStartedEvent);
        
        const testSpec = TestSuiteHelper.findNode(this.loadedTests, tests[0]);
        if (!testSpec) {
            return;
        }
        
        let specFileUri: Partial<IUri> = vscode.Uri.parse(testSpec?.file || "");
        specFileUri = {
            ...specFileUri,
            with: specFileUri.with,
            toJSON: specFileUri.toJSON,
            isFolder: false
        };
        const coordinator = new Coordinator(specFileUri as IUri);
        await coordinator.prepare();

        await this._angularServer.startAsync(this.workspaceFolder.uri.fsPath);

        this.fireTestRunning(testSpec);

        this._karmaEventListener.specCompletedSubject.subscribe(spec => {
            console.log("HELELEO");
            this._testStatesEmitter.fire({ type: "test", test: spec.id, state: spec.status } as TestEvent);
        });

        await this._karmaHttpClient.startAsync(testSpec?.fullName || "");
        
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

    private fireTestRunning(test: KarmaTestSuiteInfo | KarmaTestInfo): void {
        if (test.type === "suite") {
            this._testStatesEmitter.fire({ type: "suite", suite: test?.id, state: TestState.running } as TestSuiteEvent);
            test.children.forEach(child => this.fireTestRunning(child));
        } else if (test.type === "test") {
            this._testStatesEmitter.fire({ type: "test", test: test?.id, state: TestState.running } as TestEvent);
        }
    }
}