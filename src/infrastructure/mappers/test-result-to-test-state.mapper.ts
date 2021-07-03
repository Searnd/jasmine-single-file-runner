import { TestResult, TestState } from "../../enums/enum-index";

export class TestResultToTestStateMapper {

  public static map(testResult: TestResult): TestState {
    switch (testResult) {
      case TestResult.failed:
        return TestState.failed;
      case TestResult.skipped:
        return TestState.skipped;
      case TestResult.success:
        return TestState.passed;
    }
  }
}
