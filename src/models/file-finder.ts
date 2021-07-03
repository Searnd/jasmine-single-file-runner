import { Uri } from "vscode";

export abstract class FileFinder {
    public abstract getTestFileLocation(): Promise<Uri>;
}
