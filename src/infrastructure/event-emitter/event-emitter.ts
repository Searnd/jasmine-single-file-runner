import {
  TestEvent,
  TestDecoration,
  TestLoadStartedEvent,
  TestLoadFinishedEvent,
  TestSuiteInfo,
} from "vscode-test-adapter-api";
import * as vscode from "vscode";
import { TestLoadEvent, TestStateEvent } from "../../domain/types/types-index";
import { TestState } from "../../domain/enums/enum-index";
import { SpecCompleteResponse } from "../../domain/models/spec-complete-response";

export class EventEmitter {
  public constructor(
    private readonly testStateEmitter: vscode.EventEmitter<TestStateEvent>,
    private readonly testLoadEmitter: vscode.EventEmitter<TestLoadEvent>
  ) {}

  public emitTestStateEvent(testName: string, testState: TestState): void {
    const testEvent = { type: "test", test: testName, state: testState } as TestEvent;
    this.testStateEmitter.fire(testEvent);
  }

  public emitTestResultEvent(results: SpecCompleteResponse): void {
    // const testState = TestResultToTestStateMapper.map(results.status || TestResult.skipped);

    // const testEvent = { type: "test", test: results.id, state: testState } as TestEvent;

    // if (results.log.length > 0) {
    //   testEvent.decorations = this.createDecorations(results);
    //   testEvent.message = this.createErrorMessage(results);
    // }

    // this.testStateEmitter.fire(testEvent);
  }

  public emitTestsStartedLoading(): void {
    this.testLoadEmitter.fire({ type: "started" } as TestLoadStartedEvent);
  }

  public emitTestsFinishedLoading(loadedTests: TestSuiteInfo): void {
    this.testLoadEmitter.fire({ type: "started" } as TestLoadStartedEvent);
    this.testLoadEmitter.fire({ type: "finished", suite: loadedTests } as TestLoadFinishedEvent);
  }

  private createErrorMessage(results: SpecCompleteResponse): string {
    const failureMessage = results.log[0];
    const message = failureMessage.split("\n")[0];

    if (!results.filePath) {
      return message;
    }

    try {
      const errorLineAndColumnCollection = failureMessage.substring(failureMessage.indexOf(results.filePath)).split(":");
      const lineNumber = parseInt(errorLineAndColumnCollection[1], undefined);
      const columnNumber = parseInt(errorLineAndColumnCollection[2], undefined);

      if (isNaN(lineNumber) || isNaN(columnNumber)) {
        return failureMessage;
      }

      return `${message} (line:${lineNumber} column:${columnNumber})`;
    } catch (error) {
      return failureMessage;
    }
  }

  private createDecorations(results: SpecCompleteResponse): TestDecoration[] | undefined {
    if (!results.filePath) {
      return undefined;
    }

    try {
      const decorations = results.log.map((failureMessage: string) => {
        const errorLineAndColumnCollection = failureMessage.substring(failureMessage.indexOf(results.filePath as string)).split(":");
        const lineNumber = parseInt(errorLineAndColumnCollection[1], undefined);
        return {
          line: lineNumber,
          message: failureMessage.split("\n")[0],
        };
      });

      if (decorations.some(x => isNaN(x.line))) {
        return undefined;
      }

      return decorations;
    } catch (error) {
      return undefined;
    }
  }
}
