import { TestResult } from "../enums/test-status.enum";

export class SpecCompleteResponse {
  public constructor(
    public id: string,
    public failureMessages: string[],
    public suite: string[],
    public description: string,
    public fullName: string,
    public status: TestResult,
    public timeSpentInMilliseconds: string,
    public filePath?: string,
    public line?: number
  ) { }
}