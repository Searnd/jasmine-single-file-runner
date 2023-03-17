import { Uri } from "vscode";
export interface IUri extends Uri {
    isFolder: boolean;
}
