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

        workspace.onDidOpenTextDocument((d) => {
            const testSuite = this.getTestsFromSpecFile(d);

            if (testSuite) {
                this._testSuite.children.push(testSuite);
            }
        });

        workspace.onDidCloseTextDocument((d) => {
            const index = this._testSuite.children.findIndex((t) => t.id === d.fileName);

            if (index !== -1) {
                this._testSuite.children.splice(index, 1);
            }
        });

        this._openSpecFiles.forEach(this.getTestsFromSpecFile);
    }

    private getTestsFromSpecFile(specFile: TextDocument): KarmaTestSuiteInfo | undefined {
        const data = specFile.getText();
        const describesList = data.match(/^[ \t]*describe.+/m);

        if (!describesList?.length) {
            return undefined;
        }

        const testSuite: KarmaTestSuiteInfo = {
            type: "suite",
            id: specFile.fileName,
            label: this.getLabelFromLine(describesList[0]),
            children: []
        };

        const filename = workspace.textDocuments.find(d => /\.spec\.ts$/.test(d.fileName))?.fileName || "";
        const program = ts.createProgram([filename], {});
        const source = program.getSourceFile(filename) as ts.SourceFile;

        ts.forEachChild(source, (node) => {
            const text = node.getText(source);
            console.log(text);
            if (ts.isExpressionStatement(node)) {
                const expression = node.expression;
                if (ts.isCallExpression(expression)) {
                    console.log(expression);
                    const expressionText = expression.expression.getText(source);
                    if (expressionText === "describe") {
                        const describeLabel = expression.arguments[0].getText(source);
                        console.log(describeLabel);
                        const nextNode = expression.arguments[1];

                        nextNode.forEachChild(childNode => {
                            if (ts.isCallExpression(childNode)) {
                                const childExpression = childNode.expression;
                            }
                        });

                        if (ts.isExpressionStatement(nextNode)) {
                            console.log(nextNode);
                        }
                    }
                }
            }
        });

        return testSuite;
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
                console.log(expression);
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
    
                        nextNode.forEachChild(childNode => {
                            this.populateTestSuite(source, childNode, nextTestSuite);
                        });

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
