import { Server } from "socket.io";
import { KarmaEventName } from "../../domain/enums/enum-index";
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

    public isComponentRun = false;

    public specCompletedSubject: Subject<SpecCompleteResponse> = new Subject();

    public runCompleted: Subject<void> = new Subject();

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

                socket.on(KarmaEventName.runComplete, () => {
                    this.runCompleted.next();
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

        this.specCompletedSubject.next(results as SpecCompleteResponse);
    }

    private onBrowserConnected(resolve: (value?: void | PromiseLike<void>) => void) {
        this.isServerLoaded = true;
        resolve();
    }
}