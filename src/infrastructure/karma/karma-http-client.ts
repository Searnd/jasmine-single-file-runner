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
      path: "/run",
      hostname: "localhost",
      args: [`--grep=${[tests]}`],  // tells karma which test(s) to run based on test's fullName
    };

    return config;
  }

  public callKarmaRunWithConfig(config: KarmaConfig): Promise<void> {
    return new Promise<void>(resolve => {
      const {
        hostname,
        path,
        port,
        args,
        removedFiles,
        changedFiles,
        addedFiles,
        refresh
      } = config;

      const options = {
        hostname,
        path,
        port,
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
          args,
          removedFiles,
          changedFiles,
          addedFiles,
          refresh
        })
      );

      request.on("close", () => {
        resolve();
      });
    });
  }
}
