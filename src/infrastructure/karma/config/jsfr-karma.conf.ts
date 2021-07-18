import { Config } from "karma";
import { KarmaConfigurator } from "./karma-configurator";

const karmaConfigurator = new KarmaConfigurator();

// remove leading separator if there is one as this causes issues with path resolution
const originalConfigPath = (process.env.karmaConfPath || "").replace(/^(\\|\/)/, "");

module.exports = async (config: Config) => {
  await karmaConfigurator.loadOriginalUserConfiguration(config, originalConfigPath);
  karmaConfigurator.setMandatoryOptions(config);
  karmaConfigurator.cleanUpReporters(config);
  karmaConfigurator.dontLoadOriginalConfigurationFileIntoBrowser(config, originalConfigPath);
  karmaConfigurator.configureTestExplorerCustomReporter(config);
  karmaConfigurator.setBasePath(config, originalConfigPath);
  karmaConfigurator.disableSingleRunPermanently(config);
};
