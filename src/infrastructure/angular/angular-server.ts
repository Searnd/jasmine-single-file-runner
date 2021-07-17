import { KarmaEventListener } from "../karma/karma-event-listener";
import * as path from "path";
import { VscodeTaskManager } from "../../core/vscode-task-manager";

export class AngularServer {
  private static readonly TASK_NAME = "jsfr test explorer";

  private readonly _taskManager: VscodeTaskManager = new VscodeTaskManager(AngularServer.TASK_NAME);

  public constructor(
    private readonly karmaEventListener: KarmaEventListener
  ) { }

  public async stop(): Promise<void> {
    this._taskManager.killTask(AngularServer.TASK_NAME);
  }

  public async startAsync(angularProjectPath: string): Promise<void> {
    //TODO: dynamically set karma file path
    // "../karma/config/jsfr-karma.conf.js"
    const baseKarmaConfigFilePath = path.resolve("..", "karma", "config", "jsfr-karma.conf.js");

    // const options: SpawnOptions = {
    //   cwd: angularProjectPath,
    //   shell: true,
    //   env: process.env
    // };

    this._taskManager.registerTaskProvider(
      AngularServer.TASK_NAME,
      `npx ng test --karma-config="${baseKarmaConfigFilePath}" --progress=false`,
      angularProjectPath);
    // this.processHandler.create("npx", ["ng", "test", `--karma-config="${baseKarmaConfigFilePath}"`, "--progress=false"], options);

    return this.karmaEventListener.listenUntilKarmaIsReady();
  }
}
