import { Server } from "socket.io";
import { KarmaEventName, TestState } from "../../domain/enums/enum-index";
import { KarmaEvent } from "../../domain/models/karma-event";
import { KarmaTestSuiteInfo } from "../../domain/models/karma-test-suite-info";
import { SpecResponseToTestSuiteInfoMapper } from "../mappers/spec-response-to-test-suite-info.mapper";
import { SpecCompleteResponse } from "../../domain/models/spec-complete-response";
import { Subject } from "rxjs";

export class KarmaEventListener {
    private savedSpecs: SpecCompleteResponse[] = [];

    private io = new Server(9999);

    public isServerLoaded = false;

    public isTestRunning = false;

    public testStatus: TestState | undefined;

    public runCompleteEvent: KarmaEvent | undefined;

    public isComponentRun = false;

    public specCompletedSubject: Subject<SpecCompleteResponse> = new Subject();

    public listenUntilKarmaIsReady(): Promise<void> {
        return new Promise<void>((resolve) => {
    
            const nInterval = setInterval(() => {
                global.console.log("Waiting to connect to Karma...");
            }, 5000);

            this.io.on("connection", socket => {
                console.log(`socket ${socket.id} connected!`);

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

                socket.on(KarmaEventName.specComplete, (event: KarmaEvent) => this.onSpecComplete(event));
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
        console.log("Browser disconnected, closing socket...");
    }

    private onSpecComplete(e: KarmaEvent) {
        const {results} = e;
        // FIXME: this stuff isn't working, i just extracted some parts that i thought would be useful
        // for when this is actually implemented
        // this.eventEmitter.emitTestStateEvent(results.id, TestState.running);
        // this.eventEmitter.emitTestResultEvent(results);
        // this.savedSpecs.push(results);
        // this.testStatus = results.status;
        // console.log(`${results.fullName}: ${results.status}`);
        this.specCompletedSubject.next(results);
    }

    private onBrowserConnected(resolve: (value?: void | PromiseLike<void>) => void) {
        this.isServerLoaded = true;
        resolve();
    }
}