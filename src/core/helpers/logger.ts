import { OutputChannel } from "vscode";
import { LogLevel, TestResult } from "../../enums/enum-index";

export const OUTPUT_CHANNEL = "Test Explorer Logs";

interface Ilog {
  message: string;
  date: Date;
  level: LogLevel;
}

export class Logger {
  private outputChannel?: OutputChannel;

  constructor(outputChannel: OutputChannel, private readonly isDebuggingMode: boolean = false) {
    this.outputChannel = outputChannel;
  }

  public debug(msg: string): void {
    if (this.isDebuggingMode) {
      global.console.log(this.formatMsg(msg, LogLevel.debug));

      if (this.outputChannel !== undefined) {
        this.outputChannel.appendLine(this.formatMsg(msg, LogLevel.debug));
      }
    }
  }

  public info(msg: string, ...params: any[]): void {
    global.console.log(this.formatMsg(msg, LogLevel.info));

    if (this.outputChannel !== undefined) {
      this.outputChannel.appendLine(this.formatMsg(msg, LogLevel.info));
    }

    if (params.length > 0) {
      if (params[0]!.addDividerForKarmaLogs) {
        this.divideKarmaLogsContent();
      }
    }
  }

  public warn(msg: string): void {
    global.console.log(this.formatMsg(msg, LogLevel.warn));
      if (this.outputChannel !== undefined) {
        this.outputChannel.appendLine(this.formatMsg(msg, LogLevel.warn));
      }
  }

  public error(msg: string): void {
    global.console.log(this.formatMsg(msg, LogLevel.error));
      if (this.outputChannel !== undefined) {
        this.outputChannel.appendLine(this.formatMsg(msg, LogLevel.error));
      }
  }

  public karmaLogs(msg: string): void {
    if (this.isDebuggingMode) {
      global.console.log(msg);

      if (this.outputChannel !== undefined) {
        this.outputChannel.appendLine(msg);
      }
    }
  }

  public status(status: TestResult): void {
    let msg;
    if (status === TestResult.success) {
      msg = "[SUCCESS] ✅ Passed";
    } else if (status === TestResult.failed) {
      msg = "[FAILURE] ❌ failed";
    } else {
      msg = "[SKIPPED] Test Skipped";
    }

    if (this.outputChannel !== undefined) {
      this.outputChannel.appendLine(msg);
    }
  }

  private formatMsg(msg: string, loglevel: LogLevel): string {
    const { message, date, level }: Ilog = {
      message: msg,
      date: new Date(),
      level: loglevel,
    };

    return `[${date.toLocaleTimeString()}] ${level.toUpperCase()}: ${message}`;
  }

  private divideKarmaLogsContent() {
    if (this.outputChannel !== undefined) {
      this.outputChannel.appendLine("******************************* Karma Logs *******************************");
    }
  }
}
