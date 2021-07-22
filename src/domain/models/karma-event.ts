import { TestResults } from "karma";
import { SpecCompleteResponse } from "./spec-complete-response";

export class KarmaEvent {
  public constructor(public name: string, public results: SpecCompleteResponse | TestResults) { }
}
