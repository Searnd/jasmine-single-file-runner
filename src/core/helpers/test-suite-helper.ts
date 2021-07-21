import { Uri } from "vscode";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../../domain/models/karma-test-suite-info";

export class TestSuiteHelper {
    public static findNode(searchNode: KarmaTestSuiteInfo | KarmaTestInfo | undefined, id: string): KarmaTestSuiteInfo | KarmaTestInfo | undefined {
        if (searchNode?.id === id) {
            return searchNode;
        } else if (searchNode?.type === "suite") {
            for (const child of searchNode.children) {
                const found = this.findNode(child, id);
                if (found){
                    return found;
                }
            }
        }

        return undefined;
    }

    public static findNodeByFullName(searchNode: KarmaTestSuiteInfo | KarmaTestInfo | undefined, fullName: string): KarmaTestSuiteInfo | KarmaTestInfo | undefined {
        if (searchNode?.fullName === fullName) {
            return searchNode;
        } else if (searchNode?.type === "suite") {
            for (const child of searchNode.children) {
                const found = this.findNode(child, fullName);
                if (found){
                    return found;
                }
            }
        }

        return undefined;
    }
}
