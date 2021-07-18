import { TestResults } from "karma";
import { io } from "socket.io-client";
import { KarmaEventName, TestResult } from "../../../domain/enums/enum-index";
import { Browser, BrowserChangedEvent } from "../../../domain/models/karma-browser";
import { SpecCompleteResponse } from "../../../domain/models/spec-complete-response";

export const reporterName = "jsfr";
export const pluginName = `reporter:${reporterName}`;
export function JsfrReporter(this: any, baseReporterDecorator: any, config: any, emitter: any): void {
  this.config = config;
  this.emitter = emitter;

  this.socket = io("http://localhost:9999");
  global.console.log("Attempting to connect socket to karma event listener...");

  const emitEvent = (eventName: string, eventResults: any = null) => {
    this.socket.emit(eventName, { name: eventName, results: eventResults });
  };
  
  baseReporterDecorator(this);

  this.adapters = [];

  this.onSpecComplete = (_: any, spec: SpecCompleteResponse) => {
    spec.status = TestResult.failed;

    // required as both flags are set when the the test is skipped
    if (spec.skipped) {
      spec.status = TestResult.skipped;
    } else if (spec.success) {
      spec.status = TestResult.success;
    }

    emitEvent(KarmaEventName.specComplete, spec);
  };

  this.onRunComplete = (_: any, result: TestResults) => {
    emitEvent(KarmaEventName.runComplete, result);
  };

  this.onBrowserError = (_: any, error: any) => {
    emitEvent(KarmaEventName.browserError, error);
  };

  this.onBrowserStart = () => {
    emitEvent(KarmaEventName.browserStart);
  };

  this.emitter.on("browsers_change", (browserChangedEvent: BrowserChangedEvent) => {
    const { browsers } = browserChangedEvent;
    // filter out events from Browser object
    if (!browsers.every) {
      return;
    }

    const connected = browsers.every((newBrowser: Browser) => {
      return newBrowser.state === "CONNECTED";
    });

    if (connected) {
      emitEvent(KarmaEventName.browserConnected);
    }
  });
}

JsfrReporter.$inject = ["baseReporterDecorator", "config", "emitter"];
