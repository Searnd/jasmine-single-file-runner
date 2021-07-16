import { TestResults } from "karma";
import { io } from "socket.io-client";
import { KarmaEventName } from "../../../domain/enums/enum-index";

export const reporterName = "reporter:jsfr";

export function JsfrReporter(this: any, baseReporterDecorator: any, config: any, emitter: any): void {
  this.config = config;
  this.emitter = emitter;

  this.socket = io("http://localhost:9222/");

  const emitEvent = (eventName: any, eventResults: any = null) => {
    this.socket.emit(eventName, { name: eventName, results: eventResults });
  };
  
  baseReporterDecorator(this);

  this.adapters = [];

  this.specSuccess = (_: any, result: TestResults) => {
    emitEvent(KarmaEventName.specSuccess, result);
  };

  this.specFailure = (_: any, result: TestResults) => {
    emitEvent(KarmaEventName.specFailure, result);
  };

  this.specSkipped = (_: any, result: TestResults) => {
    emitEvent(KarmaEventName.specSkipped, result);
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
