import { TextDocument, workspace } from "vscode";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../domain/models/karma-test-suite-info";
import { BehaviorSubject } from "rxjs";
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

    public testSuiteUpdated: BehaviorSubject<KarmaTestSuiteInfo> = new BehaviorSubject(this._testSuite);

    constructor() {
        const specFileRegex = /\.spec\.ts$/;

        this._openSpecFiles = workspace.textDocuments.filter(doc => specFileRegex.test(doc.fileName));

        workspace.onDidOpenTextDocument(d => {
            if (specFileRegex.test(d.fileName)) {
                const testAdded = this.getTestsFromSpecFile(d);
    
                if (testAdded) {
                    console.log(this._testSuite);
                    this.testSuiteUpdated.next(this._testSuite);
                }
            }
        });

        workspace.onDidCloseTextDocument((d) => {
            if (specFileRegex.test(d.fileName)) {
                const index = this._testSuite.children.findIndex((t) => t.id === d.fileName);
    
                if (index !== -1) {
                    this._testSuite.children.splice(index, 1);
                }
            }
        });

        const wereTestsAdded = this._openSpecFiles.reduce((acc, specFile) => {
            return acc || this.getTestsFromSpecFile(specFile);
        }, false);
        if (wereTestsAdded) {
            console.log(this._testSuite);
            this.testSuiteUpdated.next(this._testSuite);
        }
    }

    private getTestsFromSpecFile(specFile: TextDocument): boolean {
        if (this._testSuite.children.some(t => t.id === specFile.fileName)) {
            return false;
        }

        const filename = specFile.fileName;
        const program = ts.createProgram([filename], {});
        const source = program.getSourceFile(filename) as ts.SourceFile;

        ts.forEachChild(source, (node) => {
            this.populateTestSuite(source, node, this._testSuite, true);
        });

        return true;
    }

    // TODO: set fullName for karma (see spec-response-to-test-suite-info.mapper.ts)
    private populateTestSuite(source: ts.SourceFile, node: ts.Node, testSuite: KarmaTestSuiteInfo, isTopMost = false): void {
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
                            id: this.getNextId(source.fileName, isTopMost),
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
                            id: this.getNextId(source.fileName, isTopMost),
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

    private getNextId(filename: string, isTopMost: boolean): string {
        return isTopMost ? filename : `${TestDiscoverer._testIdCounter++} ${filename}`;
    }
}
