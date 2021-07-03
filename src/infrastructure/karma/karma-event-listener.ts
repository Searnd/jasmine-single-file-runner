import * as http from "http";
import * as express from "express";
import { KarmaEventName, TestResult, TestState } from "../../enums/enum-index";
import { KarmaEvent } from "../../models/karma-event";
import { EventEmitter } from "../event-emitter/event-emitter";
import { KarmaTestSuiteInfo } from "../../models/karma-test-suite-info";
import { SpecResponseToTestSuiteInfoMapper } from "../mappers/spec-response-to-test-suite-info.mapper";

export class KarmaEventListener {
    private savedSpecs: any[] = [];

    private server: http.Server;

    public isServerLoaded = false;
    public isTestRunning = false;
    public lastRunTests = "";
    public testStatus: TestResult | any;
    public runCompleteEvent: KarmaEvent | any;
    public isComponentRun = false;

    constructor(
        private readonly eventEmitter: EventEmitter
    ) {
        const app = express();
        this.server = http.createServer(app);
    }

    public listenUntilKarmaIsReady(defaultSocketPort?: number): Promise<void> {
        return new Promise<void>((resolve) => {
            // *shrug*
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const io = require("socket.io")(this.server, { forceNew: true });
            io.set("heartbeat interval", 24 * 60 * 60 * 1000);
            io.set("heartbeat timeout", 24 * 60 * 60 * 1000);
    
            const port = defaultSocketPort !== 0 ? defaultSocketPort : 9999;
    
            const nInterval = setInterval(() => {
                global.console.log("Waiting to connect to Karma...");
            }, 5000);

            io.on("connection", (socket: any) => {
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
        this.server.close();
    }

    private onSpecComplete(event: KarmaEvent) {
        const { results } = event;
    
        const testName = results.fullName;
        const isTestNamePerfectMatch = testName === this.lastRunTests[0];
        const isRootComponent = this.lastRunTests === "root";
        const isComponent = this.isComponentRun && testName.includes(this.lastRunTests);
    
        if (isTestNamePerfectMatch || isRootComponent || isComponent) {
          this.eventEmitter.emitTestStateEvent(results.id, TestState.running);
          this.savedSpecs.push(results);
    
          this.eventEmitter.emitTestResultEvent(results.id, event);
    
          if (this.lastRunTests !== "") {
            this.testStatus = results.status;
          }
        }
      }

    private onBrowserConnected(resolve: (value?: void | PromiseLike<void>) => void) {
        this.isServerLoaded = true;
        resolve();
      }
}