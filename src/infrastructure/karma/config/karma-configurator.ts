import { ConfigOptions, InlinePluginDef } from "karma";
import * as path from "path";
import { JsfrReporter, pluginName, reporterName } from "./karma-jsfr-reporter";
export class KarmaConfigurator {
  public setMandatoryOptions(config: ConfigOptions): void {
    config.autoWatch = false;
    config.autoWatchBatchDelay = 0;
    // config.browsers = ["ChromeTestExplorer"];
    config.browsers = ["ChromeHeadless"];
    config.browserNoActivityTimeout = undefined;
    config.singleRun = false;
    // config.customLaunchers = {
    //   ChromeTestExplorer: {
    //     base: "ChromeHeadless",
    //     debug: true,
    //     flags: ["--remote-debugging-port=9222"],
    //   },
    // };
  }

  public dontLoadOriginalConfigurationFileIntoBrowser(config: ConfigOptions, originalConfigPath: string): void {
    // https://github.com/karma-runner/karma-intellij/issues/9
    config.exclude = config.exclude || [];
    config.exclude.push(originalConfigPath);
  }

  public setBasePath(config: ConfigOptions, originalConfigPath: string): void {
    if (!config.basePath) {
      // We need to set the base path, so karma won't use this file to base everything of
      if (originalConfigPath) {
        config.basePath = path.resolve(path.dirname(originalConfigPath));
      } else {
        config.basePath = process.cwd();
      }
    }
  }

  public cleanUpReporters(config: ConfigOptions): void {
    const filteredReporters = config.reporters?.filter(reporter => reporter !== "dots" && reporter !== "kjhtml");
    config.reporters = filteredReporters;
  }

  public loadOriginalUserConfiguration(config: ConfigOptions, originalConfigPath: string): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let originalConfigModule = require(originalConfigPath);
    // https://github.com/karma-runner/karma/blob/v1.7.0/lib/config.js#L364
    if (typeof originalConfigModule === "object" && typeof originalConfigModule.default !== "undefined") {
      originalConfigModule = originalConfigModule.default;
    }

    originalConfigModule(config);
  }

  public configureTestExplorerCustomReporter(config: ConfigOptions): void {
    const jsfrPluginDef: InlinePluginDef = {};
    jsfrPluginDef[pluginName] = ["type", JsfrReporter];

    this.addPlugin(config, jsfrPluginDef);
    if (!config.reporters) {
      config.reporters = [];
    }

    config.reporters.push(reporterName);
  }

  private addPlugin(karmaConfig: ConfigOptions, karmaPlugin: InlinePluginDef): void {
    karmaConfig.plugins = karmaConfig.plugins || ["karma-*"];
    karmaConfig.plugins.push(karmaPlugin);
  }
}
