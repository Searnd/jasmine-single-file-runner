export enum TestResult {
    failed = "Failed",
    skipped = "Skipped",
    success = "Success"
}

export enum TestState {
    running = "running",
    failed = "failed",
    passed = "passed",
    skipped = "skipped",
  }
  

export enum KarmaEventName {
  browserConnected = "browser_connected",
  runComplete = "run_complete",
  specComplete = "spec_complete",
  browserStart = "browser_start",
  browserError = "browser_error",
}

export enum LogLevel {
  error = "error",
  warn = "warn",
  info = "info",
  debug = "debug",
}
