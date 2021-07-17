import * as http from "http";
import { KarmaConfig } from "../../domain/types/types-index";

export class KarmaHttpClient {
  public createKarmaRunCallConfiguration(tests: string): KarmaConfig {
    // if testName is undefined, reset jasmine.getEnv().specFilter function
    // otherwise, last specified specFilter will be used
    if (tests === "root" || tests === undefined) {
      tests = "";
    }

    const config: KarmaConfig = {
      port: 9876,
      refresh: true,
      urlRoot: "/run",
      hostname: "localhost",
      clientArgs: [`--grep=${[tests]}`],
    };

    return config;
  }

  public callKarmaRunWithConfig(config: KarmaConfig): Promise<void> {
    return new Promise<void>(resolve => {
      const options = {
        hostname: config.hostname,
        path: config.urlRoot,
        port: config.port,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const request = http.request(options);

      request.on("error", (e: any) => {
        if (e.code === "ECONNREFUSED") {
          global.console.error("There is no server listening on port %d", options.port);
        }
      });

      request.end(
        JSON.stringify({
          args: config.clientArgs,
          removedFiles: config.removedFiles,
          changedFiles: config.changedFiles,
          addedFiles: config.addedFiles,
          refresh: config.refresh,
        })
      );

      request.on("close", () => {
        resolve();
      });
    });
  }
}
