import { TestEvent, TestLoadFinishedEvent, TestLoadStartedEvent, TestRunFinishedEvent, TestRunStartedEvent, TestSuiteEvent } from "vscode-test-adapter-api";

export type TestLoadEvent = TestLoadStartedEvent | TestLoadFinishedEvent;

export type TestRunEvent = TestRunStartedEvent | TestRunFinishedEvent;

export type TestStateEvent = TestRunEvent | TestSuiteEvent | TestEvent;

export type KarmaConfig = {
    port: number,
    refresh: boolean,
    urlRoot: string,
    hostname: string,
    clientArgs: string[],
    removedFiles?: string[],
    addedFiles?: string[],
    changedFiles?: string[]
};
