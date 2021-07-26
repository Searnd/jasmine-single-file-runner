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
  specSuccess = "spec_success",
  specFailure = "spec_failure",
  specSkipped = "spec_skipped"
}

export enum LogLevel {
  error = "error",
  warn = "warn",
  info = "info",
  debug = "debug",
}
