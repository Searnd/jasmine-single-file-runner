import { TestResults } from "karma";
import { io } from "socket.io-client";
import { TestResult } from "../../../domain/enums/enum-index";
import { SpecCompleteResponse } from "../../../domain/models/spec-complete-response";

export const reporterName = "reporter:jsfr";

export function JsfrReporter(this: any, baseReporterDecorator: any, config: any, emitter: any) {
  this.config = config;
  this.emitter = emitter;

  this.socket = io("http://localhost:9222/");

  const emitEvent = (eventName: any, eventResults: any = null) => {
    this.socket.emit(eventName, { name: eventName, results: eventResults });
  };
  
  baseReporterDecorator(this);

  this.adapters = [];

  this.onSpecComplete = (browser: any, spec: any) => {
    let status: TestResult = TestResult.failed;
    if (spec.skipped) {
      status = TestResult.skipped;
      this.specSkipped(browser, spec);
    } else if (spec.success) {
      status = TestResult.success;
    }

    let lineNumber;
    const filePath = pathFinder.getTestFilePath(paths, spec.suite[0], spec.description);

    if (filePath) {
      lineNumber = pathFinder.getSpecLine(spec.description, filePath, ENCODING);
    }

    const result = new SpecCompleteResponse(
      spec.id,
      spec.log,
      spec.suite,
      spec.description,
      spec.fullName,
      status,
      spec.time,
      filePath,
      lineNumber
    );

    emitEvent("spec_complete", result);
  };

  this.onRunComplete = (_: any, result: any) => {
    emitEvent("run_complete", collectRunState(result));
  };

  this.onBrowserError = (_: any, error: any) => {
    emitEvent("browser_error", error);
  };

  this.onBrowserStart = () => {
    emitEvent("browser_start");
  };

  this.emitter.on("browsers_change", (capturedBrowsers: any) => {
    if (!capturedBrowsers.forEach) {
      // filter out events from Browser object
      return;
    }

    let proceed = true;
    capturedBrowsers.forEach((newBrowser: any) => {
      if (!newBrowser.id || !newBrowser.name || newBrowser.id === newBrowser.name) {
        proceed = false;
      }
    });
    if (proceed) {
      emitEvent("browser_connected");
    }
  });
}

function collectRunState(runResult: TestResults): "timeout" | "error" | "complete" {
  if (runResult.disconnected) {
    return "timeout";
  } else if (runResult.error) {
    return "error";
  } else {
    return "complete";
  }
}

JsfrReporter.$inject = ["baseReporterDecorator", "config", "emitter"];
