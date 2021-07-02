import { TestResult } from "../enums/test-status.enum";

export class SpecCompleteResponse {
  public constructor(
    public _id: string,
    public _failureMessages: string[],
    public _suite: string[],
    public _description: string,
    public _fullName: string,
    public _status: TestResult,
    public _timeSpentInMilliseconds: string,
    public _filePath?: string,
    public _line?: number
  ) { }
}
