import { SpawnOptions } from "child_process";
import { CommandlineProcessHandler } from "./cl-process-handler";
import { KarmaEventListener } from "./karma-event-listener";
import * as karma from "karma";

export class KarmaServer {
  public constructor(
    private readonly _karmaEventListener: KarmaEventListener,
    private readonly _processHandler: CommandlineProcessHandler
  ) { }

  public async stopAsync(): Promise<void> {
    return new Promise<void>(resolve => {
        if (this._karmaEventListener.isServerLoaded) {
            karma.stopper.stop({ port: 9876 }, () => {
            resolve();
            this._karmaEventListener.stopListeningToKarma();
            });
        }
    });
  }

  public stop(): void {
    if (this._karmaEventListener.isServerLoaded || this._processHandler.isProcessRunning()) {
        karma.stopper.stop({ port: 9876 });
        this._karmaEventListener.stopListeningToKarma();
    }
  }

  public async start(projectAbsolutePath: string): Promise<void> {
    //TODO: dynamically set karma file path
    const baseKarmaConfigFilePath = "./karma.conf.js";

    const options: SpawnOptions = {
      cwd: projectAbsolutePath,
      shell: true,
      env: Object.create(process.env)
    };

    this._processHandler.create("npx", ["karma", "start", baseKarmaConfigFilePath], options);

    await this._karmaEventListener.listenUntilKarmaIsReady(9999);
  }
}
