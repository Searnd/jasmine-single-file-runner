import { injectable } from "tsyringe";
import { TestFileEditor } from "../file-system/edit/test-file-editor";
import { TsConfigSpecEditor } from "../file-system/edit/tsconfig-spec-editor";
import { AngularFileFinder } from "../file-system/find/angular-file-finder";
import { IUri } from "../file-system/types/file-system";
import { VscodeTaskRunner } from "../tasks/vscode-task-runner";
import { Coordinator } from "./coordinator";

@injectable()
export class CoordinatorFactory {
  constructor(private readonly angularFileFinder: AngularFileFinder) {}

  public async createAsync(resourceUri: IUri): Promise<Coordinator> {
    const tsconfigSpecFileUri = await this.angularFileFinder.getFileLocation("**/tsconfig.spec.json");
    const tsconfigSpecEditor = new TsConfigSpecEditor(tsconfigSpecFileUri, resourceUri, this.angularFileFinder);

    const taskRunner = new VscodeTaskRunner("ngTest");

    return new Coordinator(resourceUri, tsconfigSpecEditor, taskRunner, await this.tryCreateTestFileEditor(resourceUri));
  }

  private async tryCreateTestFileEditor(resourceUri: IUri): Promise<TestFileEditor | undefined> {
    try {
      const testFileUri = await this.angularFileFinder.getFileLocation("**/src/test.ts");

      return new TestFileEditor(testFileUri, resourceUri);
    }
    catch {
      // TODO: log warning

      return undefined;
    }
  }
}