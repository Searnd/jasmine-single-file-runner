import { UtilityHelper } from "@/core/helpers/utility-helper";
import { Config, ConfigOptions } from "karma";
import * as path from "path";
// import * as TestExplorerCustomReporter from "../core/integration/test-explorer-custom-karma-reporter"; //TODO: implement this

export class KarmaConfigurator {
  private readonly testExplorerHelper: UtilityHelper;
  constructor() {
    this.testExplorerHelper = new UtilityHelper();
  }

  public setMandatoryOptions(config: Config): void {
    // remove 'logLevel' changing
    // https://github.com/karma-runner/karma/issues/614 is ready
    // config.logLevel = config.LOG_INFO;
    // config.autoWatch = false;
    // config.autoWatchBatchDelay = 0;
    // config.browsers = ["ChromeTestExplorer"];
    // config.browserNoActivityTimeout = undefined;
    // config.singleRun = false;
    // config.customLaunchers = {
    //   ChromeTestExplorer: {
    //     base: "ChromeHeadless",
    //     debug: true,
    //     flags: ["--remote-debugging-port=9222"],
    //   },
    // };
  }

  public dontLoadOriginalConfigurationFileIntoBrowser(config: Config, originalConfigPath: string): void {
    // https://github.com/karma-runner/karma-intellij/issues/9
    // config.exclude = config.exclude || [];
    // config.exclude.push(originalConfigPath);
  }

  public setBasePath(config: Config, originalConfigPath: string): void {
    // if (!config.basePath) {
    //   // We need to set the base path, so karma won't use this file to base everything of
    //   if (originalConfigPath) {
    //     config.basePath = path.resolve(path.dirname(originalConfigPath));
    //   } else {
    //     config.basePath = process.cwd();
    //   }
    // }
  }

  public disableSingleRunPermanently(config: Config): void {
    const prevSet = config.set;
    if (typeof prevSet === "function") {
      config.set = (newConfig: ConfigOptions) => {
        if (newConfig != null) {
          if (newConfig.singleRun === true) {
            newConfig.singleRun = false;
          }
          prevSet(newConfig);
        }
      };
    }
  }

  public cleanUpReporters(config: Config): void {
    // const filteredReporters = this.testExplorerHelper.removeElementsFromArrayWithoutModifyingIt(config.reporters, ["dots", "kjhtml"]);
    // config.reporters = filteredReporters;
  }

  public async loadOriginalUserConfiguration(config: Config, originalConfigPath: string): Promise<void> {
    let originalConfigModule = await import(originalConfigPath);
    // https://github.com/karma-runner/karma/blob/v1.7.0/lib/config.js#L364
    if (typeof originalConfigModule === "object" && typeof originalConfigModule.default !== "undefined") {
      originalConfigModule = originalConfigModule.default;
    }

    originalConfigModule(config);
  }

  // public configureTestExplorerCustomReporter(config: Config): void {
  //   this.addPlugin(config, { [`reporter:${TestExplorerCustomReporter.name}`]: ["type", TestExplorerCustomReporter.instance] });
  //   if (!config.reporters) {
  //     config.reporters = [];
  //   }
  //   config.reporters.push(TestExplorerCustomReporter.name);
  // }

  private addPlugin(karmaConfig: ConfigOptions, karmaPlugin: any): void {
    karmaConfig.plugins = karmaConfig.plugins || ["karma-*"];
    karmaConfig.plugins.push(karmaPlugin);
  }
}
