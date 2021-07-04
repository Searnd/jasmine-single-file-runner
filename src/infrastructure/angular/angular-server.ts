import { SpawnOptions } from "child_process";
import { CommandlineProcessHandler } from "../command-line/cl-process-handler";
import { KarmaEventListener } from "../karma/karma-event-listener";

export class AngularServer {
  public constructor(
    private readonly karmaEventListener: KarmaEventListener,
    private readonly processHandler: CommandlineProcessHandler
  ) { }

  public async stopAsync(): Promise<void> {
    if (this.karmaEventListener.isServerLoaded || this.processHandler.isProcessRunning()) {
      this.karmaEventListener.stopListeningToKarma();
      return await this.processHandler.killAsync();
    }
  }

  public stop(): void {
    if (this.karmaEventListener.isServerLoaded || this.processHandler.isProcessRunning()) {
      this.karmaEventListener.stopListeningToKarma();
      this.processHandler.kill();
    }
  }

  public async start(projectAbsolutePath: string): Promise<void> {
    //TODO: dynamically set karma file path
    const baseKarmaConfigFilePath = "./karma.conf.js";

    const options: SpawnOptions = {
      cwd: projectAbsolutePath,
      shell: true,
      env: process.env
    };

    this.processHandler.create("npx", ["ng", "test", `--karma-config="${baseKarmaConfigFilePath}"`, "--progress=false"], options);

    await this.karmaEventListener.listenUntilKarmaIsReady(9999);
  }
}
