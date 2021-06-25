import * as vscode from 'vscode';

export class TaskRegistrar {

    public registerTaskProvider(type: string, commandLine: string, cwd?: string): vscode.Disposable {
        return vscode.tasks.registerTaskProvider(type, {
            provideTasks() {
                const execution = new vscode.ShellExecution(commandLine, {cwd});
                return [
                    new vscode.Task({type}, vscode.TaskScope.Workspace, "Test", "jsfr", execution)
                ];
            },
            resolveTask(task) {
                return task;
            }
        });
    }
}