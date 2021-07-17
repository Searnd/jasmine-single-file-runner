import { Config } from "karma";
import { KarmaConfigurator } from "./karma-configurator";

const karmaConfigurator = new KarmaConfigurator();
const originalConfigPath = process.env.karmaConfPath || "";

module.exports = async (config: Config) => {
  karmaConfigurator.loadOriginalUserConfiguration(config, originalConfigPath);
  karmaConfigurator.setMandatoryOptions(config);
  karmaConfigurator.cleanUpReporters(config);
  karmaConfigurator.dontLoadOriginalConfigurationFileIntoBrowser(config, originalConfigPath);
  karmaConfigurator.configureTestExplorerCustomReporter(config);
  karmaConfigurator.setBasePath(config, originalConfigPath);
  karmaConfigurator.disableSingleRunPermanently(config);
};
