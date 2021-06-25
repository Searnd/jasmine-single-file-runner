import * as vscode from 'vscode';

export class TaskRegistrar {
    
    public registerTaskProvider(type: string, commandLine: string): void {
        vscode.tasks.registerTaskProvider(type, {
            provideTasks() {
                const execution = new vscode.ShellExecution(commandLine);
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