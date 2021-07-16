import { TestResults } from "karma";
import { io } from "socket.io-client";

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
    emitEvent("spec_success", result);
  };

  this.specFailure = (_: any, result: TestResults) => {
    emitEvent("spec_failure", result);
  };

  this.specSkipped = (_: any, result: TestResults) => {
    emitEvent("spec_skipped", result);
  };

  this.onRunComplete = (_: any, result: TestResults) => {
    emitEvent("run_complete", result);
  };

  this.onBrowserError = (_: any, error: any) => {
    emitEvent("browser_error", error);
  };

  this.onBrowserStart = () => {
    emitEvent("browser_start");
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
      emitEvent("browser_connected");
    }
  });
}

JsfrReporter.$inject = ["baseReporterDecorator", "config", "emitter"];
