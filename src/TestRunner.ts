import * as cp from 'child_process';

export class TestRunner {
    public async execTests(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            cp.exec("ng test", (err, out) => {
                if (err) {
                    reject(err);
                }

                return resolve(out);
            });
        });
    }
}