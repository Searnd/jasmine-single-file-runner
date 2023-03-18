import { injectable } from "tsyringe";
import { TestFileEditor } from "../file-system/edit/test-file-editor";
import { TsConfigSpecEditor } from "../file-system/edit/tsconfig-spec-editor";
import { FileFinder } from "../file-system/find/file-finder";
import { IUri } from "../file-system/types/file-system";
import { VscodeTaskRunner } from "../tasks/vscode-task-runner";
import { Coordinator } from "./coordinator";

@injectable()
export class CoordinatorFactory {
  public async createAsync(resourceUri: IUri): Promise<Coordinator> {
    const testFileUri = await FileFinder.getFileLocation("**/src/test.ts");
    const testFileEditor = new TestFileEditor(testFileUri, resourceUri);

    const tsconfigSpecFileUri = await FileFinder.getFileLocation("**/tsconfig.spec.json");
    const tsconfigSpecEditor = new TsConfigSpecEditor(tsconfigSpecFileUri, resourceUri);

    const taskRunner = new VscodeTaskRunner("ngTest");

    return new Coordinator(resourceUri, testFileEditor, tsconfigSpecEditor, taskRunner);
  }
}