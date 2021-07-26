import * as http from "http";
import { KarmaConfig } from "../../domain/types/types-index";

export class KarmaHttpClient {
  public startAsync(tests: string): Promise<void> {
    const config = this.createKarmaRunCallConfiguration(tests);

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

  private createKarmaRunCallConfiguration(tests: string): KarmaConfig {
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
}
