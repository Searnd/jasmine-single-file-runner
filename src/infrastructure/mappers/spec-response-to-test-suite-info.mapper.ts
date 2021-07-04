
import * as path from "path";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../../domain/models/karma-test-suite-info";
import { SpecCompleteResponse } from "../../domain/models/spec-complete-response";

export class SpecResponseToTestSuiteInfoMapper {
  public constructor(private readonly projectRootPath: string) {}

  public map(specs: SpecCompleteResponse[]): KarmaTestSuiteInfo {
    const rootSuiteNode: KarmaTestSuiteInfo = {
      type: "suite",
      id: "root",
      label: "root",
      fullName: "root",
      children: [],
    };

    for (const spec of specs) {
      const suiteNames = this.filterSuiteNames(spec.suite);
      const suiteNode = this.getOrCreateLowerSuiteNode(rootSuiteNode, spec, suiteNames);
      this.createTest(spec, suiteNode, suiteNames.join(" "));
    }

    return rootSuiteNode;
  }

  private getOrCreateLowerSuiteNode(node: KarmaTestSuiteInfo, spec: SpecCompleteResponse, suiteNames: string[]): KarmaTestSuiteInfo {
    for (const suiteName of suiteNames) {
      let nextNode = this.findNodeByKey(node, suiteName);
      if (!nextNode) {
        const locationHint = suiteNames.reduce((previousValue: any, currentValue: any) => {
          if (previousValue === suiteName) {
            spec.suite = [suiteName];
            return suiteName;
          }

          spec.suite = suiteNames;
          return [previousValue, currentValue].join(" ");
        });

        nextNode = this.createSuite(spec, locationHint);
        node.children.push(nextNode);
      }
      node = nextNode;
    }

    return node;
  }

  private findNodeByKey(node: KarmaTestInfo | KarmaTestSuiteInfo, suiteLookup: string): KarmaTestSuiteInfo | undefined {
    if (node.type === "test") {
      return undefined;
    }

    if (node.label === suiteLookup) {
      return node;
    } else {
      for (const child of node.children) {
        if (child.label === suiteLookup) {
          return child as KarmaTestSuiteInfo;
        }
      }
    }

    return undefined;
  }

  private filterSuiteNames(suiteNames: string[]) {
    if (suiteNames.length > 0 && "Jasmine__TopLevel__Suite" === suiteNames[0]) {
      suiteNames = suiteNames.slice(1);
    }
    return suiteNames;
  }

  private createTest(specComplete: SpecCompleteResponse, suiteNode: KarmaTestSuiteInfo, suiteLookup: string) {
    suiteNode.children.push({
      id: specComplete.id,
      fullName: suiteLookup + " " + specComplete.description,
      label: specComplete.description,
      file: specComplete.filePath ? path.join(this.projectRootPath, specComplete.filePath as string) : undefined,
      type: "test",
      line: specComplete.line ? (specComplete.line as number) : undefined,
    });
  }

  private createSuite(specComplete: SpecCompleteResponse, suiteLookup: string): KarmaTestSuiteInfo {
    return {
      id: suiteLookup,
      fullName: specComplete.suite[specComplete.suite.length - 1],
      label: specComplete.suite[specComplete.suite.length - 1],
      file: specComplete.filePath ? path.join(this.projectRootPath, specComplete.filePath as string) : undefined,
      type: "suite",
      children: [],
    };
  }
}
