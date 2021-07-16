import { Server } from "socket.io";
import { KarmaEventName, TestResult, TestState } from "../../domain/enums/enum-index";
import { KarmaEvent } from "../../domain/models/karma-event";
import { EventEmitter } from "../event-emitter/event-emitter";
import { KarmaTestSuiteInfo } from "../../domain/models/karma-test-suite-info";
import { SpecResponseToTestSuiteInfoMapper } from "../mappers/spec-response-to-test-suite-info.mapper";

export class KarmaEventListener {
    private savedSpecs: any[] = [];

    private io = new Server(9222);

    public isServerLoaded = false;

    public isTestRunning = false;

    public testStatus: TestResult | any;

    public runCompleteEvent: KarmaEvent | any;

    public isComponentRun = false;

    constructor(
        private readonly eventEmitter: EventEmitter
    ) { }

    public listenUntilKarmaIsReady(): Promise<void> {
        return new Promise<void>((resolve) => {
    
            const nInterval = setInterval(() => {
                global.console.log("Waiting to connect to Karma...");
            }, 5000);

            this.io.on("connection", socket => {
                socket.on(KarmaEventName.browserConnected, () => {
                    clearInterval(nInterval);
                    this.onBrowserConnected(resolve);
                });
    
                socket.on(KarmaEventName.browserStart, () => {
                    this.savedSpecs = [];
                });

                socket.on(KarmaEventName.runComplete, (event: KarmaEvent) => {
                    this.runCompleteEvent = event;
                });

                socket.on(KarmaEventName.specComplete, (event: KarmaEvent) => {
                    this.onSpecComplete(event);
                });
            });
    


        });
    }

    public getLoadedTests(projectRootPath: string): KarmaTestSuiteInfo {
        const mapper = new SpecResponseToTestSuiteInfoMapper(projectRootPath);
        return mapper.map(this.savedSpecs);
    }

    public stopListeningToKarma(): void {
        this.isServerLoaded = false;
        this.io.close();
    }

    private onSpecComplete(event: KarmaEvent) {
        const { results } = event;
    
        this.eventEmitter.emitTestStateEvent(results.id, TestState.running);
        this.eventEmitter.emitTestResultEvent(results.id, event);
        this.savedSpecs.push(results);
        this.testStatus = results.status;
    }

    private onBrowserConnected(resolve: (value?: void | PromiseLike<void>) => void) {
        this.isServerLoaded = true;
        resolve();
      }
}