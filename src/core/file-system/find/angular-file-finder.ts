import { FileFinder } from "./file-finder";
import * as path from "path";
import { FileNotFoundError } from "../exceptions/error-index";
import { injectable } from "tsyringe";

@injectable()
export class AngularFileFinder extends FileFinder {
  public async getAngularProjectRootPath(): Promise<string> {
    try {
      const rootPath = await this.getFileLocation("**/angular.json");

      return path.parse(rootPath.path).dir;
    }
    catch {
      throw new FileNotFoundError("No angular.json file found in this project.");
    }
  }
}