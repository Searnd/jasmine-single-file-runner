import { Uri } from "vscode";

export type KarmaConfig = {
    port: number,
    refresh: boolean,
    path: string,
    hostname: string,
    args: string[],
    removedFiles?: string[],
    addedFiles?: string[],
    changedFiles?: string[]
};

export interface IUri extends Uri {
    isFolder: boolean;
}
