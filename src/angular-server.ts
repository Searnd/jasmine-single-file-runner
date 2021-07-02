import { CommandlineProcessHandler } from "../integration/commandline-process-handler";
import { KarmaEventListener } from "./karma-event-listener";

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

  public async start(projectPath: string): Promise<void> {
    this.processHandler.create(cliCommand, cliArgs, options);

    await this.karmaEventListener.listenUntilKarmaIsReady(9999);
  }
}
