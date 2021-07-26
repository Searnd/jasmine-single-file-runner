import { TestInfo, TestSuiteInfo } from "vscode-test-adapter-api";

export interface KarmaTestSuiteInfo extends TestSuiteInfo {
    fullName: string;
    children: (KarmaTestSuiteInfo | KarmaTestInfo)[];
}
  
export interface KarmaTestInfo extends TestInfo {
    fullName: string;
}
