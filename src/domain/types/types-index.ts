import { Uri } from "vscode";
import { TestEvent, TestLoadFinishedEvent, TestLoadStartedEvent, TestRunFinishedEvent, TestRunStartedEvent, TestSuiteEvent } from "vscode-test-adapter-api";

export type TestLoadEvent = TestLoadStartedEvent | TestLoadFinishedEvent;

export type TestRunEvent = TestRunStartedEvent | TestRunFinishedEvent;

export type TestStateEvent = TestRunEvent | TestSuiteEvent | TestEvent;

export type KarmaConfig = {
    port: number,
    refresh: boolean,
    path: string,
    hostname: string,
    args: string[],
    removedFiles?: string[],
    addedFiles?: string[],
    changedFiles?: string[]
};

export interface IUri extends Uri {
    isFolder: boolean;
}
