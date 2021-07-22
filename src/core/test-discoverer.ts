import { EventEmitter, TextDocument, window, workspace } from "vscode";
import { KarmaTestInfo, KarmaTestSuiteInfo } from "../domain/models/karma-test-suite-info";
import { BehaviorSubject } from "rxjs";
import * as ts from "typescript";
import { TestLoadEvent } from "../domain/types/types-index";
import { TestLoadFinishedEvent, TestLoadStartedEvent } from "vscode-test-adapter-api";

export class TestDiscoverer {
    private _openSpecFiles: TextDocument[];

    private static _testIdCounter = 0;

    private _testSuite: KarmaTestSuiteInfo = {
        type: "suite",
        id: "root",
        label: "Jasmine",
        fullName: "",
        children: []
    };

    public testSuiteUpdated: BehaviorSubject<KarmaTestSuiteInfo> = new BehaviorSubject(this._testSuite);

    constructor(
        private readonly _testsLoadedEmitter: EventEmitter<TestLoadEvent>
    ) {
        this._testsLoadedEmitter.fire({ type: "started" } as TestLoadStartedEvent);

        const specFileRegex = /\.spec\.ts$/;

        workspace.onDidOpenTextDocument(d => {
            if (specFileRegex.test(d.fileName)) {
                this._testsLoadedEmitter.fire({ type: "started" } as TestLoadStartedEvent);

                const testAdded = this.getTestsFromSpecFile(d);
    
                if (testAdded) {
                    console.log(this._testSuite);
                    this.emitLoadedTests();
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

        this._openSpecFiles = window.visibleTextEditors
            .map(te => te.document)
            .filter(doc => specFileRegex.test(doc.fileName));

        const wereTestsAdded = this._openSpecFiles.reduce((acc, specFile) => {
            return acc || this.getTestsFromSpecFile(specFile);
        }, false);

        if (wereTestsAdded) {
            console.log(this._testSuite);
            this.emitLoadedTests();
        }
    }

    private getTestsFromSpecFile(specFile: TextDocument): boolean {
        if (this._testSuite.children.some(t => t.id === specFile.fileName)) {
            return false;
        }

        const filename = specFile.fileName;
        const program = ts.createProgram([filename], {});
        const source = program.getSourceFile(filename) as ts.SourceFile;
        const typechecker = program.getTypeChecker();

        ts.forEachChild(source, (node) => {
            this.populateTestSuite(source, node, this._testSuite, typechecker);
        });

        return true;
    }

    private populateTestSuite(
        source: ts.SourceFile,
        node: ts.Node, testSuite: KarmaTestSuiteInfo,
        typechecker: ts.TypeChecker
    ): void {
        if (ts.isExpressionStatement(node)) {
            const expression = node.expression;

            if (ts.isCallExpression(expression)) {
                const expressionText = expression.expression.getText(source);

                switch (expressionText) {
                    case "fdescribe":
                    case "describe": {
                        let describeLabel = expression.arguments[0].getText(source);
                        describeLabel = this.tidyUpLabel(describeLabel);

                        const nextNode = expression.arguments[1];
    
                        const nextTestSuite: KarmaTestSuiteInfo = {
                            type: "suite",
                            id: this.getNextId(),
                            label: describeLabel,
                            fullName: this.getFullName(testSuite.fullName, describeLabel),
                            file: source.fileName,
                            children: []
                        };
    
                        if (ts.isFunctionExpression(nextNode) || ts.isArrowFunction(nextNode)) {
                            nextNode.body.forEachChild(childNode => {
                                this.populateTestSuite(source, childNode, nextTestSuite, typechecker);
                            });
                        }
    
                        testSuite.children.push(nextTestSuite);
    
                        break;
                    }
                    case "fit":
                    case "it": {
                        const labelNode = expression.arguments[0];
                        
                        let itLabel = "";

                        if (ts.isIdentifier(labelNode)) {
                            const declarations = typechecker.getSymbolAtLocation(labelNode)?.declarations;
                            if (declarations?.length) {
                                itLabel = (declarations[0] as ts.VariableDeclaration).initializer?.getText(source) || "";
                            }
                        } else if (ts.isToken(labelNode)) {
                            itLabel = labelNode.getText(source);
                        }
                        itLabel = this.tidyUpLabel(itLabel);
    
                        const testInfo: KarmaTestInfo = {
                            type: "test",
                            id: this.getNextId(),
                            label: this.tidyUpLabel(itLabel),
                            fullName: this.getFullName(testSuite.fullName, itLabel),
                            file: source.fileName
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

    private getFullName(fullName: string, label: string) {
        return fullName === "" ? label : fullName + " " + label;
    }

    private emitLoadedTests(): void {
        this.testSuiteUpdated.next(this._testSuite);
        this._testsLoadedEmitter.fire({ type: "finished", suite: this._testSuite } as TestLoadFinishedEvent);
    }

    private tidyUpLabel(label: string): string {
        return label.replace(/(^['"`]|['"`]$)/g, "");
    }
}
