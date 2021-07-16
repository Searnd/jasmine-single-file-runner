import { TestResults } from "karma";
import { io } from "socket.io-client";
import { KarmaEventName, TestResult } from "../../../domain/enums/enum-index";
import { SpecCompleteResponse } from "../../../domain/models/spec-complete-response";

export const reporterName = "reporter:jsfr";

export function JsfrReporter(this: any, baseReporterDecorator: any, config: any, emitter: any): void {
  this.config = config;
  this.emitter = emitter;

  this.socket = io("http://localhost:9222/");

  const emitEvent = (eventName: string, eventResults: any = null) => {
    this.socket.emit(eventName, { name: eventName, results: eventResults });
  };
  
  baseReporterDecorator(this);

  this.adapters = [];

  this.onSpecComplete = (browser: any, spec:any) => {
    let status: TestResult = TestResult.failed;

    if (spec.skipped) {
      status = TestResult.skipped;
      this.specSkipped(browser, spec);
    } else if (spec.success) {
      status = TestResult.success;
    }

    const result = new SpecCompleteResponse(
      spec.id,
      spec.log,
      spec.suite,
      spec.description,
      spec.fullName,
      status,
      spec.time,
      // filePath,
      // lineNumber
    );

    if (status === TestResult.failed) {
      result.fullResponse = spec;
    }

    emitEvent(KarmaEventName.specComplete, result);
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

  this.emitter.on("browsers_change", (capturedBrowsers: any[]) => {
    if (!capturedBrowsers.length) {
      // filter out events from Browser object
      return;
    }

    const connected = capturedBrowsers.every((newBrowser: any) => {
      return newBrowser.id && newBrowser.name && newBrowser.id !== newBrowser.name;
    });

    if (connected) {
      emitEvent(KarmaEventName.browserConnected);
    }
  });
}

JsfrReporter.$inject = ["baseReporterDecorator", "config", "emitter"];
