import { Uri } from "vscode";

export interface IUri extends Omit<Uri, "with" | "toJSON"> {
    isFolder: boolean;
}


/**
 * Wrapper around {@link Uri}. Adds the {@link isFolder} property.
 *
 * @export
 * @class UriWrapper
 * @implements {IUri}
 */
export class UriWrapper implements IUri {
    public get isFolder(): boolean {
        return this._isFolder;
    }

    public get scheme(): string {
        return this.uri.scheme;
    }
    public get authority(): string {
        return this.uri.authority;
    }
    public get path(): string {
        return this.uri.path;
    }
    public get query(): string {
        return this.uri.query;
    }
    public get fragment(): string {
        return this.uri.fragment;
    }
    public get fsPath(): string {
        return this.uri.fsPath;
    }
    
    constructor(private readonly uri: Uri, private readonly _isFolder: boolean) {}
}