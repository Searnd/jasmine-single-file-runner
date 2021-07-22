import { TestState } from "../enums/enum-index";

export interface SpecCompleteResponse {
  id: string,
  log: string[],
  suite: string[],
  description: string,
  fullName: string,
  status?: TestState,
  time: string,
  skipped: boolean,
  success: boolean,
  filePath?: string,
  line?: number,
  fullResponse?: string
}
