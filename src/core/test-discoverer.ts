import { TextDocument, workspace } from "vscode";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../domain/models/karma-test-suite-info";
import * as ts from "typescript";

export class TestDiscoverer {
    private _openSpecFiles: TextDocument[];

    private static _testIdCounter = 0;

    private _testSuite: KarmaTestSuiteInfo = {
        type: "suite",
        id: "root",
        label: "Jasmine",
        children: []
    };

    constructor() {
        this._openSpecFiles = workspace.textDocuments.filter(doc => /\.spec\.ts$/.test(doc.fileName));

        workspace.onDidOpenTextDocument(d => {
            this.getTestsFromSpecFile(d);
            console.log(this._testSuite);
        });

        workspace.onDidCloseTextDocument((d) => {
            const index = this._testSuite.children.findIndex((t) => t.id === d.fileName);

            if (index !== -1) {
                this._testSuite.children.splice(index, 1);
            }
        });

        this._openSpecFiles.forEach(d => {
            this.getTestsFromSpecFile(d);
            console.log(this._testSuite);
        });
    }

    private getTestsFromSpecFile(specFile: TextDocument): void {
        const data = specFile.getText();
        const describesList = data.match(/^[ \t]*describe.+/m);

        if (!describesList?.length) {
            return undefined;
        }

        const filename = workspace.textDocuments.find(d => /\.spec\.ts$/.test(d.fileName))?.fileName || "";
        const program = ts.createProgram([filename], {});
        const source = program.getSourceFile(filename) as ts.SourceFile;

        ts.forEachChild(source, (node) => {
            this.populateTestSuite(source, node, this._testSuite);
        });
    }

    private getLabelFromLine(line: string): string {
        const matches = line.match(/["'].*["']/);

        if (matches?.length) {
            return matches[0];
        }

        return "";
    }

    private populateTestSuite(source: ts.SourceFile, node: ts.Node, testSuite: KarmaTestSuiteInfo): void {
        if (ts.isExpressionStatement(node)) {
            const expression = node.expression;

            if (ts.isCallExpression(expression)) {
                const expressionText = expression.expression.getText(source);

                switch (expressionText) {
                    case "describe": {
                        const describeLabel = expression.arguments[0].getText(source);
                        const nextNode = expression.arguments[1];
    
                        const nextTestSuite: KarmaTestSuiteInfo = {
                            type: "suite",
                            id: this.getNextId(),
                            label: describeLabel,
                            children: []
                        };
    
                        if (ts.isArrowFunction(nextNode)) {
                            nextNode.body.forEachChild(childNode => {
                                this.populateTestSuite(source, childNode, nextTestSuite);
                            });
                        }
    
                        testSuite.children.push(nextTestSuite);
    
                        break;
                    }
                    case "it": {
                        const itLabel = expression.arguments[0].getText(source);
    
                        const testInfo: KarmaTestInfo = {
                            type: "test",
                            id: this.getNextId(),
                            label: itLabel
                        };
    
                        testSuite.children.push(testInfo);
    
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }

    private getNextId(): string {
        return "" + TestDiscoverer._testIdCounter++;
    }
}
