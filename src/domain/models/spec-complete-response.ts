import { TestResult } from "../enums/enum-index";

export interface SpecCompleteResponse {
  id: string,
  log: string[],
  suite: string[],
  description: string,
  fullName: string,
  status?: TestResult,
  time: string,
  skipped: boolean,
  success: boolean,
  filePath?: string,
  line?: number,
  fullResponse?: string
}
