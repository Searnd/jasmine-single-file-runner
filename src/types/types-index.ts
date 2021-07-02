import { TestLoadFinishedEvent, TestLoadStartedEvent, TestRunFinishedEvent, TestRunStartedEvent } from "vscode-test-adapter-api";

export type TestLoadEvent = TestLoadStartedEvent | TestLoadFinishedEvent;

export type TestRunEvent = TestRunStartedEvent | TestRunFinishedEvent;