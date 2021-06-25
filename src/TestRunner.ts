import * as cp from 'child_process';

type ChildProcessExitCallback = (code: number | null, signal: NodeJS.Signals | null) => void;

export class TestRunner {
    private _specFilePath: string;

    constructor(specFilePath: string) {
        this._specFilePath = specFilePath;
    }

    public async execTests(onExit: ChildProcessExitCallback): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const childProcess =  cp.exec("ng test", { cwd: this._specFilePath }, (err, out) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                childProcess.on("exit", onExit);

                return resolve(out);
            });
        });
    }
}